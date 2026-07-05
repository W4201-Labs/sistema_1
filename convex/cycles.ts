import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireManager } from "./lib/auth";
import { applyWorkflowTransition } from "../engine/cycles/workflow";
import { evaluateClosureGuards } from "../engine/cycles/closureGuards";
import type { ControlDefinition, ControlEvaluation } from "../engine/types";

const role = v.union(v.literal("manager"), v.literal("user"), v.literal("external"));
const criticality = v.union(v.literal("low"), v.literal("medium"), v.literal("high"));

async function writeAudit(ctx: any, args: {
  orgId: string;
  actorUserId?: string;
  action: string;
  entityKind: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  await ctx.db.insert("auditTrail", args);
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);
    const cycles = await ctx.db
      .query("auditCycles")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();
    const evaluations = await ctx.db
      .query("controlEvaluations")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();

    return cycles.map((cycle) => ({
      ...cycle,
      evaluations: evaluations.filter((evaluation) => evaluation.cycleId === cycle._id)
    }));
  }
});

export const createWorkflow = mutation({
  args: {
    name: v.string(),
    isDefault: v.boolean(),
    states: v.array(v.object({ key: v.string(), label: v.string(), order: v.number() })),
    transitions: v.array(v.object({
      from: v.string(),
      to: v.string(),
      allowedRoles: v.array(role),
      requiresReason: v.boolean(),
      blockingControlCriticality: v.optional(criticality)
    }))
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    const workflowId = await ctx.db.insert("workflows", { orgId: auth.orgId, ...args });
    await writeAudit(ctx, {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "workflow_created",
      entityKind: "workflow",
      entityId: String(workflowId),
      metadata: { name: args.name, isDefault: args.isDefault }
    });
    return workflowId;
  }
});

export const open = mutation({
  args: {
    workflowId: v.id("workflows"),
    processId: v.optional(v.id("processes")),
    lineId: v.optional(v.id("lines")),
    name: v.string(),
    standardPackIds: v.array(v.id("standardPacks"))
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow || workflow.orgId !== auth.orgId) throw new Error("Workflow not found.");
    if (args.processId) {
      const process = await ctx.db.get(args.processId);
      if (!process || process.orgId !== auth.orgId) throw new Error("Process not found.");
    }
    if (args.lineId) {
      const line = await ctx.db.get(args.lineId);
      if (!line || line.orgId !== auth.orgId) throw new Error("Line not found.");
    }
    for (const standardPackId of args.standardPackIds) {
      const standard = await ctx.db.get(standardPackId);
      if (!standard || standard.orgId !== auth.orgId) throw new Error("Standard pack not found.");
    }

    const firstState = [...workflow.states].sort((a, b) => a.order - b.order)[0]?.key ?? "open";
    const cycleId = await ctx.db.insert("auditCycles", {
      orgId: auth.orgId,
      processId: args.processId,
      lineId: args.lineId,
      workflowId: args.workflowId,
      name: args.name,
      currentState: firstState,
      standardPackIds: args.standardPackIds,
      openedAt: Date.now()
    });

    await writeAudit(ctx, {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "cycle_opened",
      entityKind: "auditCycle",
      entityId: String(cycleId),
      metadata: { workflowId: String(args.workflowId), state: firstState }
    });

    return cycleId;
  }
});

export const transition = mutation({
  args: {
    cycleId: v.id("auditCycles"),
    to: v.string(),
    reason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    if (auth.role !== "manager" && args.to === "closed") throw new Error("Manager role required to close cycles.");

    const cycle = await ctx.db.get(args.cycleId);
    if (!cycle || cycle.orgId !== auth.orgId) throw new Error("Cycle not found.");
    if (cycle.closedAt) throw new Error("Closed cycles are immutable.");

    const workflow = await ctx.db.get(cycle.workflowId);
    if (!workflow || workflow.orgId !== auth.orgId) throw new Error("Workflow not found.");

    const nextState = applyWorkflowTransition({
      workflow: { states: workflow.states, transitions: workflow.transitions },
      currentState: cycle.currentState,
      to: args.to,
      actorRole: auth.role,
      reason: args.reason
    });

    if (nextState === "closed") {
      const controls = await ctx.db
        .query("controls")
        .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
        .collect();
      const evaluations = await ctx.db
        .query("controlEvaluations")
        .withIndex("by_cycle", (q) => q.eq("cycleId", args.cycleId))
        .collect();
      const guard = evaluateClosureGuards(
        controls.map((control): ControlDefinition => ({
          id: String(control._id),
          code: control.code,
          name: control.name,
          phase: control.phase,
          criticality: control.criticality,
          blocksClosure: control.blocksClosure,
          allowsNA: control.allowsNotApplicable,
          allowsJustification: control.allowsJustification,
          complianceMode: control.complianceMode,
          evaluationRule: control.evaluationRule as any,
          ruleFunctionName: control.ruleFunctionName
        })),
        evaluations.map((evaluation): ControlEvaluation => ({
          controlId: String(evaluation.controlId),
          result: evaluation.result,
          mode: evaluation.mode as any,
          reason: evaluation.justification ?? "Stored evaluation.",
          evidenceIds: evaluation.evidenceIds.map(String)
        }))
      );
      if (!guard.allowed) throw new Error(`Cycle closure blocked by ${guard.blockers.length} control(s).`);

      await ctx.db.insert("snapshots", {
        orgId: auth.orgId,
        kind: "cycle_close",
        subjectId: String(args.cycleId),
        payload: {
          cycle: { id: String(args.cycleId), name: cycle.name, previousState: cycle.currentState, closedAt: Date.now() },
          evaluations: evaluations.map((evaluation) => ({
            controlId: String(evaluation.controlId),
            result: evaluation.result,
            evidenceIds: evaluation.evidenceIds.map(String),
            evaluatedAt: evaluation.evaluatedAt
          }))
        },
        createdByUserId: auth.userId as any
      });
      for (const evaluation of evaluations) {
        await ctx.db.patch(evaluation._id, { frozen: true });
      }
    }

    await ctx.db.patch(args.cycleId, {
      currentState: nextState,
      closedAt: nextState === "closed" ? Date.now() : cycle.closedAt
    });
    await writeAudit(ctx, {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "cycle_transitioned",
      entityKind: "auditCycle",
      entityId: String(args.cycleId),
      metadata: { from: cycle.currentState, to: nextState, reason: args.reason ?? "" }
    });

    return nextState;
  }
});

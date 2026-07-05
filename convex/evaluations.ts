import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./lib/auth";
import { evaluateControl } from "../engine/controls/evaluateControl";

const anyObject = v.record(v.string(), v.any());

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

export const listByCycle = query({
  args: { cycleId: v.id("auditCycles") },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    const cycle = await ctx.db.get(args.cycleId);
    if (!cycle || cycle.orgId !== auth.orgId) throw new Error("Cycle not found.");

    return await ctx.db
      .query("controlEvaluations")
      .withIndex("by_cycle", (q) => q.eq("cycleId", args.cycleId))
      .collect();
  }
});

export const evaluate = mutation({
  args: {
    cycleId: v.id("auditCycles"),
    controlId: v.id("controls"),
    data: v.optional(anyObject),
    evidenceIds: v.optional(v.array(v.id("evidence"))),
    justification: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    const cycle = await ctx.db.get(args.cycleId);
    if (!cycle || cycle.orgId !== auth.orgId) throw new Error("Cycle not found.");
    if (cycle.closedAt) throw new Error("Closed cycles are immutable.");

    const control = await ctx.db.get(args.controlId);
    if (!control || control.orgId !== auth.orgId) throw new Error("Control not found.");

    const result = evaluateControl({
      control: {
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
      },
      data: args.data,
      evidenceIds: (args.evidenceIds ?? []).map(String),
      justification: args.justification
    });

    const existing = await ctx.db
      .query("controlEvaluations")
      .withIndex("by_control", (q) => q.eq("controlId", args.controlId))
      .filter((q) => q.eq(q.field("cycleId"), args.cycleId))
      .unique();

    const payload = {
      orgId: auth.orgId,
      cycleId: args.cycleId,
      controlId: args.controlId,
      result: result.result,
      mode: result.mode,
      evidenceIds: args.evidenceIds ?? [],
      justification: args.justification,
      evaluatedByUserId: auth.userId as any,
      evaluatedAt: Date.now(),
      frozen: false
    };

    const evaluationId = existing?._id ?? await ctx.db.insert("controlEvaluations", payload);
    if (existing) {
      if (existing.frozen) throw new Error("Frozen evaluations are immutable.");
      await ctx.db.patch(existing._id, payload as any);
    }

    await writeAudit(ctx, {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "control_evaluated",
      entityKind: "controlEvaluation",
      entityId: String(evaluationId),
      metadata: { cycleId: String(args.cycleId), controlId: String(args.controlId), result: result.result }
    });

    return result;
  }
});

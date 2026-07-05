import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireManager } from "./lib/auth";
import { getScopedProcessIds, visibleByProcessScope } from "./lib/scope";

const criticality = v.union(v.literal("low"), v.literal("medium"), v.literal("high"));
const complianceMode = v.union(
  v.literal("manual_file"),
  v.literal("manual_status"),
  v.literal("native_form"),
  v.literal("justified_not_applicable"),
  v.literal("calculated"),
  v.literal("external")
);
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

export const list = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);
    const processScope = await getScopedProcessIds(ctx);
    const controls = await ctx.db
      .query("controls")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();
    const visibleControls = visibleByProcessScope(controls, processScope);
    const links = await ctx.db
      .query("controlRequirements")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();

    return visibleControls.map((control) => ({
      ...control,
      requirementLinks: links.filter((link) => link.controlId === control._id)
    }));
  }
});

export const create = mutation({
  args: {
    processId: v.id("processes"),
    shared: v.boolean(),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    phase: v.optional(v.string()),
    criticality,
    blocksClosure: v.boolean(),
    allowsNotApplicable: v.boolean(),
    allowsJustification: v.boolean(),
    complianceMode,
    evaluationRule: anyObject,
    ruleFunctionName: v.optional(v.string()),
    relatedDocumentId: v.optional(v.id("documents")),
    formId: v.optional(v.id("forms"))
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    const process = await ctx.db.get(args.processId);
    if (!process || process.orgId !== auth.orgId) throw new Error("Process not found.");
    if (args.relatedDocumentId) {
      const document = await ctx.db.get(args.relatedDocumentId);
      if (!document || document.orgId !== auth.orgId) throw new Error("Document not found.");
    }
    if (args.formId) {
      const form = await ctx.db.get(args.formId);
      if (!form || form.orgId !== auth.orgId) throw new Error("Form not found.");
    }
    if (args.complianceMode === "calculated" || args.complianceMode === "external") {
      throw new Error(`${args.complianceMode} controls are reserved until an adapter is configured.`);
    }

    const controlId = await ctx.db.insert("controls", {
      orgId: auth.orgId,
      processId: args.processId,
      shared: args.shared,
      code: args.code,
      name: args.name,
      description: args.description,
      phase: args.phase,
      criticality: args.criticality,
      blocksClosure: args.blocksClosure,
      allowsNotApplicable: args.allowsNotApplicable,
      allowsJustification: args.allowsJustification,
      complianceMode: args.complianceMode,
      evaluationRule: args.evaluationRule,
      ruleFunctionName: args.ruleFunctionName,
      relatedDocumentId: args.relatedDocumentId,
      formId: args.formId,
      status: "active"
    });

    await writeAudit(ctx, {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "control_created",
      entityKind: "control",
      entityId: String(controlId),
      metadata: { code: args.code, complianceMode: args.complianceMode }
    });

    return controlId;
  }
});

export const linkRequirement = mutation({
  args: {
    controlId: v.id("controls"),
    requirementId: v.id("requirements")
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    const control = await ctx.db.get(args.controlId);
    if (!control || control.orgId !== auth.orgId) throw new Error("Control not found.");
    const requirement = await ctx.db.get(args.requirementId);
    if (!requirement || requirement.orgId !== auth.orgId) throw new Error("Requirement not found.");

    const linkId = await ctx.db.insert("controlRequirements", {
      orgId: auth.orgId,
      controlId: args.controlId,
      requirementId: args.requirementId
    });

    await writeAudit(ctx, {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "control_requirement_linked",
      entityKind: "control",
      entityId: String(args.controlId),
      metadata: { requirementId: String(args.requirementId) }
    });

    return linkId;
  }
});

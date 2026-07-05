import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireManager } from "./lib/auth";
import { validateApplicabilityDecision } from "../engine/requirements/applicability";

const scopeKind = v.union(v.literal("org"), v.literal("line"), v.literal("process"));
const decision = v.union(
  v.literal("applicable"),
  v.literal("not_applicable"),
  v.literal("partial"),
  v.literal("selected_scope"),
  v.literal("replaced")
);

export const list = query({
  args: {
    standardPackId: v.optional(v.id("standardPacks"))
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    const decisions = await ctx.db
      .query("requirementApplicability")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();

    if (!args.standardPackId) return decisions;

    const requirements = await ctx.db
      .query("requirements")
      .withIndex("by_pack", (q) => q.eq("standardPackId", args.standardPackId))
      .collect();
    const allowed = new Set(requirements.filter((row) => row.orgId === auth.orgId).map((row) => row._id));
    return decisions.filter((row) => allowed.has(row.requirementId));
  }
});

export const decide = mutation({
  args: {
    requirementId: v.id("requirements"),
    scopeKind,
    scopeId: v.optional(v.string()),
    decision,
    replacedByRequirementId: v.optional(v.id("requirements")),
    justification: v.optional(v.string()),
    approvedByUserId: v.optional(v.id("users")),
    reviewDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    const requirement = await ctx.db.get(args.requirementId);
    if (!requirement || requirement.orgId !== auth.orgId) throw new Error("Requirement not found.");

    if (args.replacedByRequirementId) {
      const replacement = await ctx.db.get(args.replacedByRequirementId);
      if (!replacement || replacement.orgId !== auth.orgId) throw new Error("Replacement requirement not found.");
    }

    if (args.approvedByUserId) {
      const approver = await ctx.db.get(args.approvedByUserId);
      if (!approver || approver.orgId !== auth.orgId) throw new Error("Approver not found.");
    }

    const decidedAt = Date.now();
    validateApplicabilityDecision({
      decision: args.decision,
      justification: args.justification,
      approvedByUserId: args.approvedByUserId,
      decidedAt,
      reviewDate: args.reviewDate
    });

    const existing = await ctx.db
      .query("requirementApplicability")
      .withIndex("by_requirement", (q) => q.eq("requirementId", args.requirementId))
      .filter((q) =>
        q.and(
          q.eq(q.field("orgId"), auth.orgId),
          q.eq(q.field("scopeKind"), args.scopeKind),
          q.eq(q.field("scopeId"), args.scopeId)
        )
      )
      .unique();

    const payload = {
      orgId: auth.orgId,
      requirementId: args.requirementId,
      scopeKind: args.scopeKind,
      scopeId: args.scopeId,
      decision: args.decision,
      replacedByRequirementId: args.replacedByRequirementId,
      justification: args.justification,
      approvedByUserId: args.approvedByUserId,
      decidedAt,
      reviewDate: args.reviewDate
    };

    const decisionId = existing?._id ?? (await ctx.db.insert("requirementApplicability", payload));
    if (existing) await ctx.db.patch(existing._id, payload);

    await ctx.db.insert("auditTrail", {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "requirement_applicability_decided",
      entityKind: "requirement",
      entityId: String(args.requirementId),
      metadata: {
        decision: args.decision,
        scopeKind: args.scopeKind,
        scopeId: args.scopeId,
        applicabilityId: String(decisionId)
      }
    });

    return decisionId;
  }
});

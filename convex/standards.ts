import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireManager } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);
    const packs = await ctx.db
      .query("standardPacks")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();
    const requirements = await ctx.db
      .query("requirements")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();
    const equivalences = await ctx.db
      .query("requirementEquivalences")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();

    return { packs, requirements, equivalences };
  }
});

export const createEquivalence = mutation({
  args: {
    requirementA: v.id("requirements"),
    requirementB: v.id("requirements"),
    note: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    const [requirementA, requirementB] = await Promise.all([
      ctx.db.get(args.requirementA),
      ctx.db.get(args.requirementB)
    ]);
    if (!requirementA || !requirementB) throw new Error("Requirement not found.");
    if (requirementA.orgId !== auth.orgId || requirementB.orgId !== auth.orgId) {
      throw new Error("Requirement not found.");
    }

    return await ctx.db.insert("requirementEquivalences", {
      orgId: auth.orgId,
      requirementA: args.requirementA,
      requirementB: args.requirementB,
      note: args.note
    });
  }
});

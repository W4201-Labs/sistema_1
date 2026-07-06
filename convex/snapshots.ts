import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAuth } from "./lib/auth";

export const listBySubject = query({
  args: { subjectId: v.string() },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    return await ctx.db
      .query("snapshots")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .filter((q) => q.eq(q.field("orgId"), auth.orgId))
      .collect();
  }
});

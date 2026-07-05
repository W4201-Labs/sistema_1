import { query } from "./_generated/server";
import { requireAuth } from "./lib/auth";

export const tenant = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .unique();

    return {
      orgId: auth.orgId,
      userId: auth.userId,
      role: auth.role,
      organization
    };
  }
});

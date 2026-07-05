import type { MutationCtx, QueryCtx } from "../_generated/server";

export type AuthContext = {
  orgId: string;
  clerkUserId: string;
  userId?: string;
  role: "manager" | "user" | "external";
};

export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<AuthContext> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Authentication required.");

  const orgId = (identity.orgId as string | undefined) ?? (identity.organization_id as string | undefined);
  if (!orgId) throw new Error("Active organization required.");

  const clerkUserId = identity.subject;
  const db = ctx.db as any;
  const existingUser = await db
    .query("users")
    .withIndex("by_clerkUser", (q: any) => q.eq("clerkUserId", clerkUserId))
    .filter((q: any) => q.eq(q.field("orgId"), orgId))
    .unique();

  return {
    orgId,
    clerkUserId,
    userId: existingUser?._id,
    role: existingUser?.role ?? "user"
  };
}

export async function requireManager(ctx: QueryCtx | MutationCtx): Promise<AuthContext> {
  const auth = await requireAuth(ctx);
  if (auth.role !== "manager") throw new Error("Manager role required.");
  return auth;
}

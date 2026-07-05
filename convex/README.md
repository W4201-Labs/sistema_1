# Convex Foundation

M0 contains only the generic schema and the shared auth/scope boundary.

Every application table carries `orgId` and a `by_org` index. Backend functions must resolve the tenant from Clerk in `convex/lib/auth.ts`; client-provided tenant IDs are not trusted.

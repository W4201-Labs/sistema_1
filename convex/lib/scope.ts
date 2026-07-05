import type { QueryCtx } from "../_generated/server";
import { requireAuth } from "./auth";

export async function getScopedProcessIds(ctx: QueryCtx): Promise<Set<string> | undefined> {
  const auth = await requireAuth(ctx);
  if (auth.role === "manager" || auth.role === "external") return undefined;
  if (!auth.userId) return new Set();

  const db = ctx.db as any;
  const rows = await db
    .query("userProcesses")
    .withIndex("by_user", (q: any) => q.eq("userId", auth.userId as never))
    .collect();

  return new Set(rows.filter((row: any) => row.orgId === auth.orgId).map((row: any) => String(row.processId)));
}

export function visibleByProcessScope<T extends { processId?: unknown; shared?: boolean }>(
  rows: T[],
  processIds: Set<string> | undefined
): T[] {
  if (!processIds) return rows;
  return rows.filter((row) => row.shared === true || !row.processId || processIds.has(String(row.processId)));
}

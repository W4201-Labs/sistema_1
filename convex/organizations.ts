import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireManager } from "./lib/auth";
import { visibleByProcessScope, getScopedProcessIds } from "./lib/scope";

const role = v.union(v.literal("manager"), v.literal("user"), v.literal("external"));
const processType = v.union(
  v.literal("strategic"),
  v.literal("core"),
  v.literal("support"),
  v.literal("evaluation")
);

export const upsertCurrentOrganization = mutation({
  args: {
    name: v.string(),
    settings: v.optional(v.record(v.string(), v.any())),
    user: v.object({
      email: v.string(),
      name: v.string()
    })
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .unique();

    const organizationId =
      existingOrg?._id ??
      (await ctx.db.insert("organizations", {
        orgId: auth.orgId,
        clerkOrgId: auth.orgId,
        name: args.name,
        status: "active",
        settings: args.settings ?? {}
      }));

    if (existingOrg) {
      await ctx.db.patch(existingOrg._id, {
        name: args.name,
        settings: args.settings ?? existingOrg.settings
      });
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUser", (q) => q.eq("clerkUserId", auth.clerkUserId))
      .filter((q) => q.eq(q.field("orgId"), auth.orgId))
      .unique();

    const userId =
      existingUser?._id ??
      (await ctx.db.insert("users", {
        orgId: auth.orgId,
        clerkUserId: auth.clerkUserId,
        email: args.user.email,
        name: args.user.name,
        role: "manager",
        status: "active"
      }));

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.user.email,
        name: args.user.name,
        status: "active"
      });
    }

    return { organizationId, userId };
  }
});

export const overview = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);
    const processScope = await getScopedProcessIds(ctx);
    const [organization, lines, processes, users, userProcesses] = await Promise.all([
      ctx.db.query("organizations").withIndex("by_org", (q) => q.eq("orgId", auth.orgId)).unique(),
      ctx.db.query("lines").withIndex("by_org", (q) => q.eq("orgId", auth.orgId)).collect(),
      ctx.db.query("processes").withIndex("by_org", (q) => q.eq("orgId", auth.orgId)).collect(),
      ctx.db.query("users").withIndex("by_org", (q) => q.eq("orgId", auth.orgId)).collect(),
      ctx.db.query("userProcesses").withIndex("by_org", (q) => q.eq("orgId", auth.orgId)).collect()
    ]);

    return {
      organization,
      lines,
      processes: visibleByProcessScope(processes, processScope),
      users: auth.role === "manager" ? users : users.filter((user) => user._id === auth.userId),
      userProcesses
    };
  }
});

export const createLine = mutation({
  args: {
    name: v.string(),
    managerUserId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    return await ctx.db.insert("lines", {
      orgId: auth.orgId,
      name: args.name,
      managerUserId: args.managerUserId
    });
  }
});

export const upsertProcess = mutation({
  args: {
    processId: v.optional(v.id("processes")),
    lineId: v.optional(v.id("lines")),
    parentProcessId: v.optional(v.id("processes")),
    processType,
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number()
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    const payload = {
      orgId: auth.orgId,
      lineId: args.lineId,
      parentProcessId: args.parentProcessId,
      processType: args.processType,
      name: args.name,
      description: args.description,
      order: args.order,
      status: "active" as const
    };

    if (!args.processId) return await ctx.db.insert("processes", payload);

    const existing = await ctx.db.get(args.processId);
    if (!existing || existing.orgId !== auth.orgId) throw new Error("Process not found.");
    await ctx.db.patch(args.processId, payload);
    return args.processId;
  }
});

export const upsertUser = mutation({
  args: {
    userId: v.optional(v.id("users")),
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    role,
    lineId: v.optional(v.id("lines")),
    status: v.union(v.literal("active"), v.literal("invited"), v.literal("disabled")),
    processIds: v.array(v.id("processes"))
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    const payload = {
      orgId: auth.orgId,
      clerkUserId: args.clerkUserId,
      email: args.email,
      name: args.name,
      role: args.role,
      lineId: args.lineId,
      status: args.status
    };

    const userId = args.userId ?? (await ctx.db.insert("users", payload));
    if (args.userId) {
      const existing = await ctx.db.get(args.userId);
      if (!existing || existing.orgId !== auth.orgId) throw new Error("User not found.");
      await ctx.db.patch(args.userId, payload);
    }

    const currentScopes = await ctx.db
      .query("userProcesses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const scope of currentScopes.filter((scope) => scope.orgId === auth.orgId)) {
      await ctx.db.delete(scope._id);
    }
    for (const processId of args.processIds) {
      const process = await ctx.db.get(processId);
      if (!process || process.orgId !== auth.orgId) throw new Error("Process not found.");
      await ctx.db.insert("userProcesses", { orgId: auth.orgId, userId, processId });
    }

    return userId;
  }
});

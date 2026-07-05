import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireManager } from "./lib/auth";

export const importStandardPack = mutation({
  args: {
    standard: v.object({
      name: v.string(),
      version: v.string(),
      issuingBody: v.optional(v.string()),
      supersedesPackId: v.optional(v.id("standardPacks")),
      status: v.optional(v.union(v.literal("draft"), v.literal("active")))
    }),
    requirements: v.array(
      v.object({
        key: v.string(),
        parentKey: v.optional(v.string()),
        number: v.string(),
        title: v.string(),
        text: v.optional(v.string()),
        type: v.optional(v.string()),
        order: v.number(),
        criticality: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high")))
      })
    )
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    if (args.standard.supersedesPackId) {
      const superseded = await ctx.db.get(args.standard.supersedesPackId);
      if (!superseded || superseded.orgId !== auth.orgId) throw new Error("Superseded standard pack not found.");
    }

    const seen = new Set<string>();
    for (const requirement of args.requirements) {
      if (seen.has(requirement.key)) throw new Error(`Duplicate requirement key: ${requirement.key}`);
      seen.add(requirement.key);
      if (requirement.parentKey && !args.requirements.some((row) => row.key === requirement.parentKey)) {
        throw new Error(`Missing parent key: ${requirement.parentKey}`);
      }
    }

    const packId = await ctx.db.insert("standardPacks", {
      orgId: auth.orgId,
      name: args.standard.name,
      version: args.standard.version,
      issuingBody: args.standard.issuingBody,
      supersedesPackId: args.standard.supersedesPackId,
      status: args.standard.status ?? "active"
    });

    const inserted = new Map<string, any>();
    const pending = [...args.requirements].sort((a, b) => a.order - b.order);
    while (pending.length > 0) {
      let insertedThisPass = false;
      const pass = pending.splice(0, pending.length);
      for (const next of pass) {
        if (next.parentKey && !inserted.has(next.parentKey)) {
          pending.push(next);
          continue;
        }

        const requirementId = await ctx.db.insert("requirements", {
          orgId: auth.orgId,
          standardPackId: packId,
          parentId: next.parentKey ? inserted.get(next.parentKey) : undefined,
          number: next.number,
          title: next.title,
          text: next.text,
          type: next.type,
          order: next.order,
          criticality: next.criticality,
          status: "active"
        });
        inserted.set(next.key, requirementId);
        insertedThisPass = true;
      }

      if (!insertedThisPass) throw new Error("Requirement hierarchy cannot be resolved.");
    }

    await ctx.db.insert("auditTrail", {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "standard_pack_imported",
      entityKind: "standardPack",
      entityId: String(packId),
      metadata: {
        name: args.standard.name,
        version: args.standard.version,
        requirementCount: inserted.size
      }
    });

    return { packId, requirementCount: inserted.size };
  }
});

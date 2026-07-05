import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireManager } from "./lib/auth";
import { getScopedProcessIds, visibleByProcessScope } from "./lib/scope";
import {
  applyDocumentTransition,
  assertDocumentEditable,
  getAllowedDocumentTransitions
} from "../engine/documents/lifecycle";

const documentStatus = v.union(v.literal("active"), v.literal("obsolete"));
const lifecycleStatus = v.union(
  v.literal("draft"),
  v.literal("under_review"),
  v.literal("changes_requested"),
  v.literal("approved"),
  v.literal("effective"),
  v.literal("under_revision"),
  v.literal("superseded"),
  v.literal("obsolete"),
  v.literal("withdrawn"),
  v.literal("archived")
);
const transition = v.union(
  v.literal("submit_for_review"),
  v.literal("request_changes"),
  v.literal("approve"),
  v.literal("make_effective"),
  v.literal("start_revision"),
  v.literal("supersede"),
  v.literal("mark_obsolete"),
  v.literal("withdraw"),
  v.literal("archive")
);
const linkType = v.union(
  v.literal("covers"),
  v.literal("partially_covers"),
  v.literal("supports"),
  v.literal("evidences"),
  v.literal("verifies"),
  v.literal("monitors"),
  v.literal("replaces"),
  v.literal("justifies_na")
);

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
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();
    const visibleDocuments = visibleByProcessScope(documents, processScope);
    const versions = await ctx.db
      .query("documentVersions")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();
    const links = await ctx.db
      .query("documentRequirementLinks")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();

    return visibleDocuments.map((document) => ({
      ...document,
      versions: versions
        .filter((version) => version.documentId === document._id)
        .map((version) => ({
          ...version,
          allowedTransitions: getAllowedDocumentTransitions(version.status)
        })),
      requirementLinks: links.filter((link) => link.documentId === document._id)
    }));
  }
});

export const create = mutation({
  args: {
    processId: v.id("processes"),
    shared: v.boolean(),
    docType: v.string(),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    externalEditableUrl: v.optional(v.string()),
    ownerUserId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    const process = await ctx.db.get(args.processId);
    if (!process || process.orgId !== auth.orgId) throw new Error("Process not found.");
    if (args.ownerUserId) {
      const owner = await ctx.db.get(args.ownerUserId);
      if (!owner || owner.orgId !== auth.orgId) throw new Error("Owner not found.");
    }

    const documentId = await ctx.db.insert("documents", {
      orgId: auth.orgId,
      processId: args.processId,
      shared: args.shared,
      docType: args.docType,
      code: args.code,
      name: args.name,
      description: args.description,
      externalEditableUrl: args.externalEditableUrl,
      ownerUserId: args.ownerUserId,
      status: "active"
    });

    await writeAudit(ctx, {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "document_created",
      entityKind: "document",
      entityId: String(documentId),
      metadata: { code: args.code, docType: args.docType }
    });

    return documentId;
  }
});

export const updateEditableMetadata = mutation({
  args: {
    documentId: v.id("documents"),
    docType: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    externalEditableUrl: v.optional(v.string()),
    status: v.optional(documentStatus)
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    const document = await ctx.db.get(args.documentId);
    if (!document || document.orgId !== auth.orgId) throw new Error("Document not found.");

    const versions = await ctx.db
      .query("documentVersions")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
    for (const version of versions.filter((version) => version.orgId === auth.orgId)) {
      assertDocumentEditable(version.status);
    }

    await ctx.db.patch(args.documentId, {
      docType: args.docType ?? document.docType,
      name: args.name ?? document.name,
      description: args.description ?? document.description,
      externalEditableUrl: args.externalEditableUrl ?? document.externalEditableUrl,
      status: args.status ?? document.status
    });

    await writeAudit(ctx, {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "document_metadata_updated",
      entityKind: "document",
      entityId: String(args.documentId)
    });

    return args.documentId;
  }
});

export const createVersion = mutation({
  args: {
    documentId: v.id("documents"),
    versionLabel: v.string(),
    candidateFileId: v.optional(v.id("_storage")),
    changeSummary: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    const document = await ctx.db.get(args.documentId);
    if (!document || document.orgId !== auth.orgId) throw new Error("Document not found.");

    const versionId = await ctx.db.insert("documentVersions", {
      orgId: auth.orgId,
      documentId: args.documentId,
      versionLabel: args.versionLabel,
      status: "draft",
      candidateFileId: args.candidateFileId,
      changeSummary: args.changeSummary,
      preparerUserId: auth.userId as any
    });

    await writeAudit(ctx, {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "document_version_created",
      entityKind: "documentVersion",
      entityId: String(versionId),
      metadata: { documentId: String(args.documentId), versionLabel: args.versionLabel }
    });

    return versionId;
  }
});

export const transitionVersion = mutation({
  args: {
    versionId: v.id("documentVersions"),
    transition,
    officialFileId: v.optional(v.id("_storage")),
    reviewerUserId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    const version = await ctx.db.get(args.versionId);
    if (!version || version.orgId !== auth.orgId) throw new Error("Document version not found.");

    const nextStatus = applyDocumentTransition({
      document: {
        status: version.status,
        preparerUserId: version.preparerUserId ? String(version.preparerUserId) : undefined,
        approverUserId: version.approverUserId ? String(version.approverUserId) : undefined,
        officialFileId: version.officialFileId ? String(version.officialFileId) : undefined
      },
      transition: args.transition,
      actorUserId: auth.userId,
      officialFileId: args.officialFileId ? String(args.officialFileId) : undefined
    });

    const patch: Record<string, unknown> = { status: nextStatus };
    if (args.transition === "request_changes") patch.reviewerUserId = (args.reviewerUserId ?? auth.userId) as any;
    if (args.transition === "approve") patch.approverUserId = auth.userId as any;
    if (args.transition === "make_effective") {
      patch.officialFileId = args.officialFileId ?? version.officialFileId;
      patch.effectiveDate = Date.now();
    }
    if (args.transition === "withdraw") patch.withdrawalDate = Date.now();

    await ctx.db.patch(args.versionId, patch as any);
    await writeAudit(ctx, {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "document_version_transitioned",
      entityKind: "documentVersion",
      entityId: String(args.versionId),
      metadata: {
        transition: args.transition,
        from: version.status,
        to: nextStatus,
        documentId: String(version.documentId)
      }
    });

    return nextStatus;
  }
});

export const linkRequirement = mutation({
  args: {
    documentId: v.id("documents"),
    requirementId: v.id("requirements"),
    linkType,
    note: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const auth = await requireManager(ctx);
    const document = await ctx.db.get(args.documentId);
    if (!document || document.orgId !== auth.orgId) throw new Error("Document not found.");
    const requirement = await ctx.db.get(args.requirementId);
    if (!requirement || requirement.orgId !== auth.orgId) throw new Error("Requirement not found.");

    const linkId = await ctx.db.insert("documentRequirementLinks", {
      orgId: auth.orgId,
      documentId: args.documentId,
      requirementId: args.requirementId,
      linkType: args.linkType,
      note: args.note
    });

    await writeAudit(ctx, {
      orgId: auth.orgId,
      actorUserId: auth.userId as any,
      action: "document_requirement_linked",
      entityKind: "document",
      entityId: String(args.documentId),
      metadata: {
        linkId: String(linkId),
        requirementId: String(args.requirementId),
        linkType: args.linkType
      }
    });

    return linkId;
  }
});

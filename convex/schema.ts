import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const role = v.union(v.literal("manager"), v.literal("user"), v.literal("external"));
function status<const T extends readonly [string, string, ...string[]]>(...values: T) {
  return v.union(...values.map((value) => v.literal(value)));
}
const anyObject = v.record(v.string(), v.any());
const metadataRecord = v.record(v.string(), v.union(v.string(), v.number(), v.boolean()));

export default defineSchema({
  organizations: defineTable({
    orgId: v.string(),
    clerkOrgId: v.string(),
    name: v.string(),
    status: status("active", "suspended"),
    settings: anyObject
  }).index("by_org", ["orgId"]),

  lines: defineTable({
    orgId: v.string(),
    name: v.string(),
    managerUserId: v.optional(v.id("users"))
  }).index("by_org", ["orgId"]),

  processes: defineTable({
    orgId: v.string(),
    lineId: v.optional(v.id("lines")),
    parentProcessId: v.optional(v.id("processes")),
    processType: status("strategic", "core", "support", "evaluation"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    status: status("active", "retired")
  }).index("by_org", ["orgId"]).index("by_line", ["lineId"]).index("by_parent", ["parentProcessId"]),

  users: defineTable({
    orgId: v.string(),
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    role,
    lineId: v.optional(v.id("lines")),
    status: status("active", "invited", "disabled")
  }).index("by_org", ["orgId"]).index("by_clerkUser", ["clerkUserId"]),

  userProcesses: defineTable({
    orgId: v.string(),
    userId: v.id("users"),
    processId: v.id("processes")
  }).index("by_org", ["orgId"]).index("by_user", ["userId"]).index("by_process", ["processId"]),

  standardPacks: defineTable({
    orgId: v.string(),
    name: v.string(),
    version: v.string(),
    issuingBody: v.optional(v.string()),
    supersedesPackId: v.optional(v.id("standardPacks")),
    status: status("draft", "active", "retired")
  }).index("by_org", ["orgId"]).index("by_supersedes", ["supersedesPackId"]),

  requirements: defineTable({
    orgId: v.string(),
    standardPackId: v.id("standardPacks"),
    parentId: v.optional(v.id("requirements")),
    number: v.string(),
    title: v.string(),
    text: v.optional(v.string()),
    type: v.optional(v.string()),
    order: v.number(),
    criticality: v.optional(status("low", "medium", "high")),
    status: status("active", "retired")
  }).index("by_org", ["orgId"]).index("by_pack", ["standardPackId"]).index("by_parent", ["parentId"]),

  requirementApplicability: defineTable({
    orgId: v.string(),
    requirementId: v.id("requirements"),
    scopeKind: status("org", "line", "process"),
    scopeId: v.optional(v.string()),
    decision: status("applicable", "not_applicable", "partial", "selected_scope", "replaced"),
    replacedByRequirementId: v.optional(v.id("requirements")),
    justification: v.optional(v.string()),
    approvedByUserId: v.optional(v.id("users")),
    decidedAt: v.optional(v.number()),
    reviewDate: v.optional(v.number())
  }).index("by_org", ["orgId"]).index("by_requirement", ["requirementId"]).index("by_scope", ["scopeKind", "scopeId"]),

  requirementEquivalences: defineTable({
    orgId: v.string(),
    requirementA: v.id("requirements"),
    requirementB: v.id("requirements"),
    note: v.optional(v.string())
  }).index("by_org", ["orgId"]).index("by_requirementA", ["requirementA"]).index("by_requirementB", ["requirementB"]),

  documents: defineTable({
    orgId: v.string(),
    processId: v.id("processes"),
    shared: v.boolean(),
    docType: v.string(),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    externalEditableUrl: v.optional(v.string()),
    ownerUserId: v.optional(v.id("users")),
    status: status("active", "obsolete")
  }).index("by_org", ["orgId"]).index("by_process", ["processId"]),

  documentVersions: defineTable({
    orgId: v.string(),
    documentId: v.id("documents"),
    versionLabel: v.string(),
    status: status("draft", "under_review", "changes_requested", "approved", "effective", "under_revision", "superseded", "obsolete", "withdrawn", "archived"),
    candidateFileId: v.optional(v.id("_storage")),
    officialFileId: v.optional(v.id("_storage")),
    changeSummary: v.optional(v.string()),
    preparerUserId: v.optional(v.id("users")),
    reviewerUserId: v.optional(v.id("users")),
    approverUserId: v.optional(v.id("users")),
    effectiveDate: v.optional(v.number()),
    withdrawalDate: v.optional(v.number())
  }).index("by_org", ["orgId"]).index("by_document", ["documentId"]).index("by_status", ["status"]),

  documentRequirementLinks: defineTable({
    orgId: v.string(),
    documentId: v.id("documents"),
    requirementId: v.id("requirements"),
    linkType: status("covers", "partially_covers", "supports", "evidences", "verifies", "monitors", "replaces", "justifies_na"),
    note: v.optional(v.string())
  }).index("by_org", ["orgId"]).index("by_document", ["documentId"]).index("by_requirement", ["requirementId"]),

  controls: defineTable({
    orgId: v.string(),
    processId: v.id("processes"),
    shared: v.boolean(),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    phase: v.optional(v.string()),
    criticality: status("low", "medium", "high"),
    blocksClosure: v.boolean(),
    allowsNotApplicable: v.boolean(),
    allowsJustification: v.boolean(),
    complianceMode: status("manual_file", "manual_status", "native_form", "justified_not_applicable", "calculated", "external"),
    evaluationRule: anyObject,
    ruleFunctionName: v.optional(v.string()),
    relatedDocumentId: v.optional(v.id("documents")),
    formId: v.optional(v.id("forms")),
    status: status("active", "retired")
  }).index("by_org", ["orgId"]).index("by_process", ["processId"]),

  controlRequirements: defineTable({
    orgId: v.string(),
    controlId: v.id("controls"),
    requirementId: v.id("requirements")
  }).index("by_org", ["orgId"]).index("by_control", ["controlId"]).index("by_requirement", ["requirementId"]),

  workflows: defineTable({
    orgId: v.string(),
    name: v.string(),
    isDefault: v.boolean(),
    states: v.array(v.object({ key: v.string(), label: v.string(), order: v.number() })),
    transitions: v.array(v.object({
      from: v.string(),
      to: v.string(),
      allowedRoles: v.array(role),
      requiresReason: v.boolean(),
      blockingControlCriticality: v.optional(status("low", "medium", "high"))
    }))
  }).index("by_org", ["orgId"]),

  auditCycles: defineTable({
    orgId: v.string(),
    processId: v.optional(v.id("processes")),
    lineId: v.optional(v.id("lines")),
    workflowId: v.id("workflows"),
    name: v.string(),
    currentState: v.string(),
    standardPackIds: v.array(v.id("standardPacks")),
    openedAt: v.number(),
    closedAt: v.optional(v.number())
  }).index("by_org", ["orgId"]).index("by_process", ["processId"]),

  controlEvaluations: defineTable({
    orgId: v.string(),
    cycleId: v.id("auditCycles"),
    controlId: v.id("controls"),
    result: status("pass", "warning", "blocker", "not_applicable", "pending"),
    mode: v.string(),
    evidenceIds: v.array(v.id("evidence")),
    justification: v.optional(v.string()),
    evaluatedByUserId: v.optional(v.id("users")),
    evaluatedAt: v.optional(v.number()),
    frozen: v.boolean()
  }).index("by_org", ["orgId"]).index("by_cycle", ["cycleId"]).index("by_control", ["controlId"]),

  records: defineTable({
    orgId: v.string(),
    processId: v.id("processes"),
    recordType: v.string(),
    sourceKind: v.optional(status("document", "form_record", "upload")),
    sourceId: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
    label: v.string(),
    createdByUserId: v.optional(v.id("users")),
    retentionUntil: v.optional(v.number())
  }).index("by_org", ["orgId"]).index("by_process", ["processId"]),

  evidence: defineTable({
    orgId: v.string(),
    processId: v.id("processes"),
    fileId: v.optional(v.id("_storage")),
    externalRef: v.optional(v.string()),
    label: v.string(),
    supportsKind: status("requirement", "control", "finding", "risk", "capa", "objective", "cycle"),
    supportsId: v.string(),
    status: status("pending", "submitted", "accepted", "rejected", "replaced", "withdrawn", "expired"),
    ownerUserId: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    retentionUntil: v.optional(v.number())
  }).index("by_org", ["orgId"]).index("by_process", ["processId"]).index("by_supports", ["supportsKind", "supportsId"]),

  forms: defineTable({
    orgId: v.string(),
    name: v.string(),
    kind: status("builder", "plugin"),
    schema: v.optional(anyObject),
    pluginName: v.optional(v.string())
  }).index("by_org", ["orgId"]),

  formRecords: defineTable({
    orgId: v.string(),
    formId: v.id("forms"),
    processId: v.id("processes"),
    data: metadataRecord,
    status: status("draft", "finalized"),
    finalizedByUserId: v.optional(v.id("users")),
    finalizedAt: v.optional(v.number())
  }).index("by_org", ["orgId"]).index("by_form", ["formId"]).index("by_process", ["processId"]),

  findings: defineTable({
    orgId: v.string(),
    processId: v.optional(v.id("processes")),
    type: status("nonconformity", "observation", "opportunity", "complaint"),
    title: v.string(),
    description: v.optional(v.string()),
    sourceKind: status("control", "requirement", "document", "cycle"),
    sourceId: v.string(),
    status: status("open", "in_progress", "closed"),
    raisedByUserId: v.optional(v.id("users"))
  }).index("by_org", ["orgId"]).index("by_process", ["processId"]),

  actions: defineTable({
    orgId: v.string(),
    findingId: v.id("findings"),
    kind: status("correction", "corrective_action"),
    description: v.string(),
    ownerUserId: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    status: status("open", "done"),
    verifiedByUserId: v.optional(v.id("users")),
    verifiedAt: v.optional(v.number()),
    verificationNote: v.optional(v.string())
  }).index("by_org", ["orgId"]).index("by_finding", ["findingId"]),

  snapshots: defineTable({
    orgId: v.string(),
    kind: status("cycle_close", "form_finalize"),
    subjectId: v.string(),
    payload: anyObject,
    createdByUserId: v.optional(v.id("users"))
  }).index("by_org", ["orgId"]).index("by_subject", ["subjectId"]),

  auditTrail: defineTable({
    orgId: v.string(),
    actorUserId: v.optional(v.id("users")),
    action: v.string(),
    entityKind: v.string(),
    entityId: v.string(),
    metadata: v.optional(metadataRecord)
  }).index("by_org", ["orgId"]).index("by_entity", ["entityKind", "entityId"]),

  notifications: defineTable({
    orgId: v.string(),
    recipientUserId: v.id("users"),
    kind: v.string(),
    message: v.string(),
    entityKind: v.optional(v.string()),
    entityId: v.optional(v.string()),
    readAt: v.optional(v.number())
  }).index("by_org", ["orgId"]).index("by_recipient", ["recipientUserId"])
});

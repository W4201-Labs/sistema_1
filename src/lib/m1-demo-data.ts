export const lines = [
  { id: "ln-ops", name: "Operations", manager: "M. Rivera" },
  { id: "ln-lab", name: "Lab services", manager: "A. Chen" }
];

export const processes = [
  {
    id: "pr-strategy",
    type: "strategic",
    lineId: "ln-ops",
    name: "Management system planning",
    owner: "M. Rivera",
    children: ["Context review", "Objectives review"]
  },
  {
    id: "pr-delivery",
    type: "core",
    lineId: "ln-lab",
    name: "Service delivery",
    owner: "A. Chen",
    children: ["Request intake", "Technical execution", "Report release"]
  },
  {
    id: "pr-docs",
    type: "support",
    lineId: "ln-ops",
    name: "Document control",
    owner: "L. Gomez",
    children: ["Draft control", "Approval routing", "Publication"]
  },
  {
    id: "pr-audit",
    type: "evaluation",
    lineId: "ln-ops",
    name: "Internal evaluation",
    owner: "S. Patel",
    children: ["Audit planning", "Finding review"]
  }
];

export const users = [
  { name: "M. Rivera", role: "manager", scope: "All processes" },
  { name: "A. Chen", role: "user", scope: "Service delivery" },
  { name: "L. Gomez", role: "user", scope: "Document control" },
  { name: "External auditor", role: "external", scope: "Published records" }
];

export const standards = [
  {
    name: "Quality Management System",
    version: "2015",
    requirements: 7,
    status: "active"
  },
  {
    name: "Testing Laboratory Competence",
    version: "2017",
    requirements: 6,
    status: "active"
  }
];

export const requirementTree = [
  {
    number: "7",
    title: "Support",
    rollup: "2 applicable, 1 partial",
    children: [
      {
        number: "7.1",
        title: "Resources",
        decision: "applicable",
        process: "Service delivery"
      },
      {
        number: "7.5",
        title: "Documented information",
        decision: "partial",
        process: "Document control"
      },
      {
        number: "7.5.1",
        title: "General",
        decision: "applicable",
        process: "Document control"
      }
    ]
  },
  {
    number: "8",
    title: "Operation",
    rollup: "1 selected scope, 1 replaced",
    children: [
      {
        number: "8.1",
        title: "Operational planning",
        decision: "selected_scope",
        process: "Service delivery"
      },
      {
        number: "8.2",
        title: "Requirements for services",
        decision: "replaced",
        process: "Request intake"
      }
    ]
  }
];

export const applicabilityRows = [
  {
    requirement: "7.5",
    scope: "Document control",
    decision: "partial",
    justification: "External editor remains source for drafts; official PDF will be controlled in system.",
    approver: "M. Rivera",
    review: "2026-10-15"
  },
  {
    requirement: "8.1",
    scope: "Service delivery",
    decision: "selected_scope",
    justification: "Applies only to technical execution and report release sub-processes.",
    approver: "M. Rivera",
    review: "2026-11-01"
  }
];

export const documents = [
  {
    code: "QMS-DOC-01",
    name: "Document control procedure",
    docType: "procedure",
    process: "Document control",
    externalEditableUrl: "https://docs.example.test/edit/qms-doc-01",
    owner: "L. Gomez",
    shared: true,
    currentVersion: "2.0",
    status: "effective",
    immutable: true,
    candidate: "candidate uploaded",
    official: "official PDF attached",
    links: [
      { requirement: "Quality Management System / Documented information", type: "covers" },
      { requirement: "Testing Laboratory Competence / Management records", type: "supports" }
    ]
  },
  {
    code: "OPS-WI-07",
    name: "Report release work instruction",
    docType: "work_instruction",
    process: "Service delivery",
    externalEditableUrl: "https://docs.example.test/edit/ops-wi-07",
    owner: "A. Chen",
    shared: false,
    currentVersion: "1.3",
    status: "under_review",
    immutable: false,
    candidate: "candidate uploaded",
    official: "pending approval",
    links: [
      { requirement: "Quality Management System / Operational planning", type: "partially_covers" },
      { requirement: "Testing Laboratory Competence / Report release", type: "verifies" }
    ]
  }
];

export const documentLifecycle = [
  { step: "draft", actor: "Preparer", audit: "version created" },
  { step: "under_review", actor: "Reviewer", audit: "submitted for review" },
  { step: "changes_requested", actor: "Reviewer", audit: "review change request" },
  { step: "approved", actor: "Approver", audit: "approval event" },
  { step: "effective", actor: "Approver", audit: "official PDF locked" },
  { step: "under_revision", actor: "Owner", audit: "revision opened" },
  { step: "superseded", actor: "Manager", audit: "replacement active" },
  { step: "obsolete", actor: "Manager", audit: "obsolete marked" },
  { step: "withdrawn", actor: "Manager", audit: "withdrawn before use" },
  { step: "archived", actor: "Manager", audit: "archive event" }
];

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

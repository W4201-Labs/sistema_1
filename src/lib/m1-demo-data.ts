import type {
  ApplicabilityDecision,
  ControlComplianceMode,
  ControlCriticality,
  ControlEvaluationResult,
  DocumentLifecycleStatus,
  DocumentLinkType,
  RuleNode
} from "@/engine/types";

type DemoRole = "manager" | "user" | "external";
type ProcessType = "strategic" | "core" | "support" | "evaluation";
type StandardStatus = "active";
type DocType = "procedure" | "work_instruction";

export interface DemoLine {
  id: string;
  name: string;
  manager: string;
}

export interface DemoProcess {
  id: string;
  type: ProcessType;
  lineId: string;
  name: string;
  owner: string;
  children: string[];
}

export interface DemoUser {
  name: string;
  role: DemoRole;
  scope: string;
}

export interface DemoStandard {
  name: string;
  version: string;
  requirements: number;
  status: StandardStatus;
}

export interface DemoRequirementNode {
  number: string;
  title: string;
  decision?: ApplicabilityDecision;
  process?: string;
  rollup?: string;
  children: DemoRequirementNode[];
}

export interface DemoApplicabilityRow {
  requirement: string;
  scope: string;
  decision: ApplicabilityDecision;
  justification: string;
  approver: string;
  review: string;
}

export interface DemoDocumentLink {
  requirement: string;
  type: DocumentLinkType;
}

export interface DemoDocument {
  code: string;
  name: string;
  docType: DocType;
  process: string;
  externalEditableUrl: string;
  owner: string;
  shared: boolean;
  currentVersion: string;
  status: DocumentLifecycleStatus;
  immutable: boolean;
  candidate: string;
  official: string;
  links: DemoDocumentLink[];
}

export interface DemoLifecycleStep {
  step: DocumentLifecycleStatus;
  actor: string;
  audit: string;
}

export interface DemoControl {
  code: string;
  name: string;
  phase: string;
  process: string;
  criticality: ControlCriticality;
  blocksClosure: boolean;
  allowsNA: boolean;
  allowsJustification: boolean;
  complianceMode: ControlComplianceMode;
  rule: RuleNode;
  requirements: string[];
}

export interface DemoControlEvaluation {
  control: string;
  result: ControlEvaluationResult;
  evidence: string;
  reason: string;
  frozen: boolean;
}

export interface DemoCycle {
  name: string;
  process: string;
  state: "open" | "in_progress" | "closed";
  workflow: string;
  canClose: boolean;
  blockers: string[];
  snapshot: string;
}

export const lines: DemoLine[] = [
  { id: "ln-ops", name: "Operations", manager: "M. Rivera" },
  { id: "ln-lab", name: "Lab services", manager: "A. Chen" }
];

export const processes: DemoProcess[] = [
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

export const users: DemoUser[] = [
  { name: "M. Rivera", role: "manager", scope: "All processes" },
  { name: "A. Chen", role: "user", scope: "Service delivery" },
  { name: "L. Gomez", role: "user", scope: "Document control" },
  { name: "External auditor", role: "external", scope: "Published records" }
];

export const standards: DemoStandard[] = [
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

export const requirementTree: DemoRequirementNode[] = [
  {
    number: "7",
    title: "Support",
    rollup: "2 applicable, 1 partial",
    children: [
      {
        number: "7.1",
        title: "Resources",
        decision: "applicable",
        process: "Service delivery",
        children: []
      },
      {
        number: "7.5",
        title: "Documented information",
        decision: "partial",
        process: "Document control",
        children: []
      },
      {
        number: "7.5.1",
        title: "General",
        decision: "applicable",
        process: "Document control",
        children: []
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
        process: "Service delivery",
        children: []
      },
      {
        number: "8.2",
        title: "Requirements for services",
        decision: "replaced",
        process: "Request intake",
        children: []
      }
    ]
  }
];

export const applicabilityRows: DemoApplicabilityRow[] = [
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

export const documents: DemoDocument[] = [
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

export const documentLifecycle: DemoLifecycleStep[] = [
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

export const controls: DemoControl[] = [
  {
    code: "CTRL-DOC-APP",
    name: "Official document approval",
    phase: "documented information",
    process: "Document control",
    criticality: "high",
    blocksClosure: true,
    allowsNA: false,
    allowsJustification: true,
    complianceMode: "manual_status",
    rule: {
      all: [
        { field: "documentStatus", op: "eq", value: "effective" },
        { field: "officialPdf", op: "exists" }
      ]
    },
    requirements: ["Quality Management System / Documented information", "Testing Laboratory Competence / Management records"]
  },
  {
    code: "CTRL-REC-FILE",
    name: "Release evidence retained",
    phase: "service delivery",
    process: "Service delivery",
    criticality: "medium",
    blocksClosure: false,
    allowsNA: false,
    allowsJustification: true,
    complianceMode: "manual_file",
    rule: { all: [{ field: "fileUploaded", op: "eq", value: true }, { field: "retentionMonths", op: "gte", value: 12 }] },
    requirements: ["Quality Management System / Operational planning"]
  },
  {
    code: "CTRL-SCOPE-NA",
    name: "Scoped not-applicable justification",
    phase: "applicability",
    process: "Management system planning",
    criticality: "low",
    blocksClosure: false,
    allowsNA: true,
    allowsJustification: true,
    complianceMode: "justified_not_applicable",
    rule: { field: "justification", op: "exists" },
    requirements: ["Testing Laboratory Competence / Optional service scope"]
  }
];

export const controlEvaluations: DemoControlEvaluation[] = [
  {
    control: "CTRL-DOC-APP",
    result: "pass",
    evidence: "official PDF QMS-DOC-01 v2.0",
    reason: "documentStatus effective and officialPdf present",
    frozen: false
  },
  {
    control: "CTRL-REC-FILE",
    result: "warning",
    evidence: "release record upload pending retention metadata",
    reason: "retentionMonths below configured threshold",
    frozen: false
  },
  {
    control: "CTRL-SCOPE-NA",
    result: "not_applicable",
    evidence: "approved scope decision",
    reason: "service is outside approved tenant scope",
    frozen: false
  }
];

export const auditCycle: DemoCycle = {
  name: "2026 mid-year readiness cycle",
  process: "Document control + Service delivery",
  state: "in_progress",
  workflow: "open -> in_progress -> closed; reopen requires reason",
  canClose: true,
  blockers: [],
  snapshot: "created on close with frozen control evaluations and evidence refs"
};

export type ScopeKind = "org" | "line" | "process";

export type ApplicabilityDecision =
  | "applicable"
  | "not_applicable"
  | "partial"
  | "selected_scope"
  | "replaced";

export type RequirementNodeInput = {
  id: string;
  parentId?: string;
  number: string;
  title: string;
  order: number;
};

export type RequirementTreeNode = RequirementNodeInput & {
  children: RequirementTreeNode[];
  rollup: RequirementRollup;
};

export type RequirementRollup = {
  total: number;
  applicable: number;
  limited: number;
  notApplicable: number;
  pending: number;
};

export type ApplicabilityRecord = {
  requirementId: string;
  scopeKind: ScopeKind;
  scopeId?: string;
  decision: ApplicabilityDecision;
};

export type ApplicabilityResolution = {
  requirementId: string;
  decision: ApplicabilityDecision;
  source: "explicit" | "inherited" | "default";
  record?: ApplicabilityRecord;
};

export type DocumentLifecycleStatus =
  | "draft"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "effective"
  | "under_revision"
  | "superseded"
  | "obsolete"
  | "withdrawn"
  | "archived";

export type DocumentLifecycleTransition =
  | "submit_for_review"
  | "request_changes"
  | "approve"
  | "make_effective"
  | "start_revision"
  | "supersede"
  | "mark_obsolete"
  | "withdraw"
  | "archive";

export type DocumentLinkType =
  | "covers"
  | "partially_covers"
  | "supports"
  | "evidences"
  | "verifies"
  | "monitors"
  | "replaces"
  | "justifies_na";

export type ControlCriticality = "low" | "medium" | "high";

export type ControlComplianceMode =
  | "manual_file"
  | "manual_status"
  | "native_form"
  | "justified_not_applicable"
  | "calculated"
  | "external";

export type ControlEvaluationResult = "pass" | "warning" | "blocker" | "not_applicable" | "pending";

export type RuleOperator = "eq" | "gte" | "lte" | "exists" | "empty";

export type FieldRule = {
  field: string;
  op: RuleOperator;
  value?: string | number | boolean | null;
};

export type RuleNode =
  | FieldRule
  | { all: RuleNode[] }
  | { any: RuleNode[] }
  | { function: string };

export type ControlDefinition = {
  id: string;
  code: string;
  name: string;
  phase?: string;
  criticality: ControlCriticality;
  blocksClosure: boolean;
  allowsNA: boolean;
  allowsJustification: boolean;
  complianceMode: ControlComplianceMode;
  evaluationRule?: RuleNode;
  ruleFunctionName?: string;
};

export type ControlEvaluationInput = {
  control: ControlDefinition;
  data?: Record<string, unknown>;
  evidenceIds?: string[];
  justification?: string;
  ruleFunctions?: Record<string, (data: Record<string, unknown>) => boolean>;
};

export type ControlEvaluation = {
  controlId: string;
  result: ControlEvaluationResult;
  mode: ControlComplianceMode;
  reason: string;
  evidenceIds: string[];
};

export type WorkflowRole = "manager" | "user" | "external";

export type WorkflowTransition = {
  from: string;
  to: string;
  allowedRoles: WorkflowRole[];
  requiresReason: boolean;
  blockingControlCriticality?: ControlCriticality;
};

export type WorkflowDefinition = {
  states: { key: string; label: string; order: number }[];
  transitions: WorkflowTransition[];
};

export type CycleTransitionInput = {
  workflow: WorkflowDefinition;
  currentState: string;
  to: string;
  actorRole: WorkflowRole;
  reason?: string;
};

export type ClosureGuardResult = {
  allowed: boolean;
  blockers: ControlEvaluation[];
};

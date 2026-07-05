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

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

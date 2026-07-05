import type {
  ApplicabilityDecision,
  ApplicabilityRecord,
  ApplicabilityResolution,
  ScopeKind
} from "../types";

const constrainedDecisions = new Set<ApplicabilityDecision>([
  "not_applicable",
  "partial",
  "selected_scope",
  "replaced"
]);

export function validateApplicabilityDecision(input: {
  decision: ApplicabilityDecision;
  justification?: string;
  approvedByUserId?: string;
  decidedAt?: number;
  reviewDate?: number;
}) {
  if (!constrainedDecisions.has(input.decision)) return;

  if (!input.justification?.trim()) {
    throw new Error("Justification is required for limited applicability decisions.");
  }
  if (!input.approvedByUserId) {
    throw new Error("Approver is required for limited applicability decisions.");
  }
  if (!input.decidedAt) {
    throw new Error("Decision date is required for limited applicability decisions.");
  }
  if (!input.reviewDate) {
    throw new Error("Review date is required for limited applicability decisions.");
  }
}

export function resolveApplicability(input: {
  requirementId: string;
  records: ApplicabilityRecord[];
  scopeKind: ScopeKind;
  scopeId?: string;
}): ApplicabilityResolution {
  const explicit = input.records.find(
    (record) =>
      record.requirementId === input.requirementId &&
      record.scopeKind === input.scopeKind &&
      (record.scopeId ?? "") === (input.scopeId ?? "")
  );

  if (explicit) {
    return {
      requirementId: input.requirementId,
      decision: explicit.decision,
      source: "explicit",
      record: explicit
    };
  }

  if (input.scopeKind !== "org") {
    const inherited = input.records.find(
      (record) => record.requirementId === input.requirementId && record.scopeKind === "org"
    );
    if (inherited) {
      return {
        requirementId: input.requirementId,
        decision: inherited.decision,
        source: "inherited",
        record: inherited
      };
    }
  }

  return {
    requirementId: input.requirementId,
    decision: "applicable",
    source: "default"
  };
}

export function isCoverageRelevant(decision: ApplicabilityDecision) {
  return decision === "applicable" || decision === "partial" || decision === "selected_scope";
}

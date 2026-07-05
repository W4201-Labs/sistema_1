import type { ClosureGuardResult, ControlDefinition, ControlEvaluation } from "../types";

export function evaluateClosureGuards(
  controls: ControlDefinition[],
  evaluations: ControlEvaluation[]
): ClosureGuardResult {
  const evaluationsByControl = new Map(evaluations.map((evaluation) => [evaluation.controlId, evaluation]));
  const blockers = controls.flatMap((control) => {
    if (!control.blocksClosure) return [];
    const evaluation = evaluationsByControl.get(control.id);
    if (!evaluation) {
      return [{
        controlId: control.id,
        result: "pending" as const,
        mode: control.complianceMode,
        reason: "Blocking control has no evaluation.",
        evidenceIds: []
      }];
    }
    return evaluation.result === "blocker" || evaluation.result === "pending" ? [evaluation] : [];
  });

  return { allowed: blockers.length === 0, blockers };
}

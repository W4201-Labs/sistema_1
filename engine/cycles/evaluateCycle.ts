import type { ControlDefinition, ControlEvaluation, ControlEvaluationInput } from "../types";
import { evaluateControl } from "../controls/evaluateControl";
import { evaluateClosureGuards } from "./closureGuards";

export type CycleControlInput = Omit<ControlEvaluationInput, "control"> & {
  controlId: string;
};

export type CycleEvaluationSummary = {
  evaluations: ControlEvaluation[];
  totals: Record<ControlEvaluation["result"], number>;
  canClose: boolean;
  blockers: ControlEvaluation[];
};

export function evaluateCycle(
  controls: ControlDefinition[],
  inputs: CycleControlInput[]
): CycleEvaluationSummary {
  const inputsByControl = new Map(inputs.map((input) => [input.controlId, input]));
  const evaluations = controls.map((control) =>
    evaluateControl({
      control,
      ...(inputsByControl.get(control.id) ?? {})
    })
  );
  const guard = evaluateClosureGuards(controls, evaluations);

  return {
    evaluations,
    totals: evaluations.reduce<CycleEvaluationSummary["totals"]>(
      (totals, evaluation) => ({ ...totals, [evaluation.result]: totals[evaluation.result] + 1 }),
      { pass: 0, warning: 0, blocker: 0, not_applicable: 0, pending: 0 }
    ),
    canClose: guard.allowed,
    blockers: guard.blockers
  };
}

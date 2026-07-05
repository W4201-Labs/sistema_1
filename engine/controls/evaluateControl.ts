import type { ControlEvaluation, ControlEvaluationInput } from "../types";
import { ruleFunctions as defaultRuleFunctions } from "./ruleFunctions";
import { evaluateRule } from "./ruleInterpreter";

const RESERVED_MODES = new Set(["calculated", "external"]);

export function evaluateControl(input: ControlEvaluationInput): ControlEvaluation {
  const { control } = input;
  const evidenceIds = input.evidenceIds ?? [];

  if (RESERVED_MODES.has(control.complianceMode)) {
    throw new Error(`${control.complianceMode} controls require an adapter and are reserved outside the MVP.`);
  }

  if (control.complianceMode === "justified_not_applicable") {
    if (!control.allowsNA) throw new Error("Control does not allow not applicable evaluations.");
    if (!input.justification?.trim()) {
      return { controlId: control.id, result: "pending", mode: control.complianceMode, reason: "N/A justification required.", evidenceIds };
    }
    return { controlId: control.id, result: "not_applicable", mode: control.complianceMode, reason: "Justified not applicable.", evidenceIds };
  }

  if (!control.evaluationRule) {
    return { controlId: control.id, result: "pending", mode: control.complianceMode, reason: "Evaluation rule is missing.", evidenceIds };
  }

  const data = input.data ?? {};
  const functions = { ...defaultRuleFunctions, ...(input.ruleFunctions ?? {}) };
  const passed = evaluateRule(control.evaluationRule, data, functions);
  if (passed) {
    return { controlId: control.id, result: "pass", mode: control.complianceMode, reason: "Rule passed.", evidenceIds };
  }

  return {
    controlId: control.id,
    result: control.criticality === "high" ? "blocker" : "warning",
    mode: control.complianceMode,
    reason: "Rule failed.",
    evidenceIds
  };
}

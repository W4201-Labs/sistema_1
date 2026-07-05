import type { CycleTransitionInput } from "../types";

export function applyWorkflowTransition(input: CycleTransitionInput): string {
  const transition = input.workflow.transitions.find(
    (candidate) => candidate.from === input.currentState && candidate.to === input.to
  );
  if (!transition) throw new Error(`Transition not allowed: ${input.currentState} -> ${input.to}`);
  if (!transition.allowedRoles.includes(input.actorRole)) throw new Error("Actor role cannot perform this transition.");
  if (transition.requiresReason && !input.reason?.trim()) throw new Error("Transition reason is required.");
  return transition.to;
}

import { describe, expect, it } from "vitest";
import type { ControlDefinition, WorkflowDefinition } from "../engine/types";
import { evaluateControl } from "../engine/controls/evaluateControl";
import { evaluateRule } from "../engine/controls/ruleInterpreter";
import { evaluateClosureGuards } from "../engine/cycles/closureGuards";
import { evaluateCycle } from "../engine/cycles/evaluateCycle";
import { applyWorkflowTransition } from "../engine/cycles/workflow";

const criticalControl: ControlDefinition = {
  id: "ctrl-release",
  code: "CTRL-REL",
  name: "Release evidence accepted",
  phase: "closure",
  criticality: "high",
  blocksClosure: true,
  allowsNA: false,
  allowsJustification: true,
  complianceMode: "manual_status",
  evaluationRule: { all: [{ field: "status", op: "eq", value: "accepted" }, { field: "evidenceCount", op: "gte", value: 1 }] }
};

const defaultWorkflow: WorkflowDefinition = {
  states: [
    { key: "open", label: "Open", order: 1 },
    { key: "in_progress", label: "In progress", order: 2 },
    { key: "closed", label: "Closed", order: 3 }
  ],
  transitions: [
    { from: "open", to: "in_progress", allowedRoles: ["manager", "user"], requiresReason: false },
    { from: "in_progress", to: "closed", allowedRoles: ["manager"], requiresReason: false, blockingControlCriticality: "high" },
    { from: "closed", to: "in_progress", allowedRoles: ["manager"], requiresReason: true }
  ]
};

describe("control rule interpreter", () => {
  it("supports field operators and all/any composition", () => {
    expect(
      evaluateRule(
        {
          all: [
            { field: "status", op: "eq", value: "accepted" },
            { any: [{ field: "score", op: "gte", value: 90 }, { field: "override", op: "exists" }] },
            { field: "gap", op: "empty" }
          ]
        },
        { status: "accepted", score: 88, override: "manager", gap: "" }
      )
    ).toBe(true);
  });

  it("turns high criticality failures into blockers", () => {
    expect(evaluateControl({ control: criticalControl, data: { status: "rejected", evidenceCount: 1 } }).result).toBe("blocker");
  });

  it("keeps calculated and external modes reserved", () => {
    expect(() =>
      evaluateControl({
        control: { ...criticalControl, complianceMode: "external" },
        data: { status: "accepted", evidenceCount: 1 }
      })
    ).toThrow(/reserved/);
  });
});

describe("cycle workflow and closure guards", () => {
  it("blocks closure when a critical blocking control fails", () => {
    const evaluation = evaluateControl({ control: criticalControl, data: { status: "pending", evidenceCount: 0 } });
    const guard = evaluateClosureGuards([criticalControl], [evaluation]);

    expect(guard.allowed).toBe(false);
    expect(guard.blockers[0]?.result).toBe("blocker");
  });

  it("summarizes evaluations and allows closure only when blockers pass", () => {
    const summary = evaluateCycle([criticalControl], [
      { controlId: criticalControl.id, data: { status: "accepted", evidenceCount: 1 }, evidenceIds: ["ev-1"] }
    ]);

    expect(summary.canClose).toBe(true);
    expect(summary.totals.pass).toBe(1);
    expect(summary.blockers).toEqual([]);
  });

  it("enforces default workflow roles and reopen reason", () => {
    expect(
      applyWorkflowTransition({
        workflow: defaultWorkflow,
        currentState: "open",
        to: "in_progress",
        actorRole: "user"
      })
    ).toBe("in_progress");

    expect(() =>
      applyWorkflowTransition({
        workflow: defaultWorkflow,
        currentState: "closed",
        to: "in_progress",
        actorRole: "manager"
      })
    ).toThrow(/reason/);
  });
});

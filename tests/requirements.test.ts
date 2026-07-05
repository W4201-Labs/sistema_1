import { describe, expect, it } from "vitest";
import { validateApplicabilityDecision, resolveApplicability, isCoverageRelevant } from "../engine/requirements/applicability";
import { buildRequirementTree } from "../engine/requirements/tree";

describe("requirement tree", () => {
  it("builds nested requirements and rolls up applicability", () => {
    const tree = buildRequirementTree(
      [
        { id: "r1", number: "7", title: "Support", order: 1 },
        { id: "r2", parentId: "r1", number: "7.5", title: "Information", order: 2 },
        { id: "r3", parentId: "r2", number: "7.5.1", title: "General", order: 3 }
      ],
      [
        { requirementId: "r1", scopeKind: "org", decision: "applicable" },
        { requirementId: "r2", scopeKind: "org", decision: "partial" },
        { requirementId: "r3", scopeKind: "org", decision: "not_applicable" }
      ]
    );

    expect(tree).toHaveLength(1);
    expect(tree[0].children[0].children[0].number).toBe("7.5.1");
    expect(tree[0].rollup).toEqual({
      total: 3,
      applicable: 1,
      limited: 1,
      notApplicable: 1,
      pending: 0
    });
  });
});

describe("applicability", () => {
  it("requires governance fields for non-applicable decisions", () => {
    expect(() => validateApplicabilityDecision({ decision: "not_applicable" })).toThrow(/Justification/);
  });

  it("inherits organization decisions when scope has no explicit decision", () => {
    const resolution = resolveApplicability({
      requirementId: "req",
      scopeKind: "process",
      scopeId: "proc",
      records: [{ requirementId: "req", scopeKind: "org", decision: "partial" }]
    });

    expect(resolution.source).toBe("inherited");
    expect(resolution.decision).toBe("partial");
  });

  it("keeps coverage limited to applicable requirements", () => {
    expect(isCoverageRelevant("applicable")).toBe(true);
    expect(isCoverageRelevant("partial")).toBe(true);
    expect(isCoverageRelevant("not_applicable")).toBe(false);
    expect(isCoverageRelevant("replaced")).toBe(false);
  });
});

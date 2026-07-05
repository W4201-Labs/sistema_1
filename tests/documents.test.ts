import { describe, expect, it } from "vitest";
import {
  applyDocumentTransition,
  assertDocumentEditable,
  getAllowedDocumentTransitions,
  isDocumentImmutable
} from "../engine/documents/lifecycle";

describe("document lifecycle", () => {
  it("moves a candidate version through approval to an immutable official", () => {
    const underReview = applyDocumentTransition({
      document: { status: "draft", preparerUserId: "preparer" },
      transition: "submit_for_review",
      actorUserId: "preparer"
    });
    const approved = applyDocumentTransition({
      document: { status: underReview, preparerUserId: "preparer" },
      transition: "approve",
      actorUserId: "approver"
    });
    const effective = applyDocumentTransition({
      document: { status: approved, preparerUserId: "preparer" },
      transition: "make_effective",
      actorUserId: "approver",
      officialFileId: "official-file"
    });

    expect(effective).toBe("effective");
    expect(isDocumentImmutable(effective)).toBe(true);
    expect(() => assertDocumentEditable(effective)).toThrow(/immutable/);
  });

  it("rejects self-approval", () => {
    expect(() =>
      applyDocumentTransition({
        document: { status: "under_review", preparerUserId: "same-user" },
        transition: "approve",
        actorUserId: "same-user"
      })
    ).toThrow(/different users/);
  });

  it("requires an official PDF before effectivity", () => {
    expect(() =>
      applyDocumentTransition({
        document: { status: "approved", preparerUserId: "preparer" },
        transition: "make_effective",
        actorUserId: "approver"
      })
    ).toThrow(/Official PDF/);
  });

  it("exposes fixed lifecycle transitions", () => {
    expect(getAllowedDocumentTransitions("effective")).toEqual(["start_revision", "mark_obsolete"]);
    expect(getAllowedDocumentTransitions("archived")).toEqual([]);
  });
});

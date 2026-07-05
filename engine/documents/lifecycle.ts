import type { DocumentLifecycleStatus, DocumentLifecycleTransition } from "../types";

export type DocumentLifecycleState = {
  status: DocumentLifecycleStatus;
  preparerUserId?: string;
  approverUserId?: string;
  officialFileId?: string;
};

export type DocumentLifecycleInput = {
  document: DocumentLifecycleState;
  transition: DocumentLifecycleTransition;
  actorUserId?: string;
  officialFileId?: string;
};

const transitions: Record<DocumentLifecycleStatus, Partial<Record<DocumentLifecycleTransition, DocumentLifecycleStatus>>> = {
  draft: {
    submit_for_review: "under_review",
    withdraw: "withdrawn"
  },
  under_review: {
    request_changes: "changes_requested",
    approve: "approved",
    withdraw: "withdrawn"
  },
  changes_requested: {
    submit_for_review: "under_review",
    withdraw: "withdrawn"
  },
  approved: {
    make_effective: "effective",
    withdraw: "withdrawn"
  },
  effective: {
    start_revision: "under_revision",
    mark_obsolete: "obsolete"
  },
  under_revision: {
    submit_for_review: "under_review",
    supersede: "superseded",
    withdraw: "withdrawn"
  },
  superseded: {
    archive: "archived"
  },
  obsolete: {
    archive: "archived"
  },
  withdrawn: {
    archive: "archived"
  },
  archived: {}
};

const immutableStatuses = new Set<DocumentLifecycleStatus>(["approved", "effective", "superseded", "obsolete", "withdrawn", "archived"]);

export function isDocumentImmutable(status: DocumentLifecycleStatus): boolean {
  return immutableStatuses.has(status);
}

export function getAllowedDocumentTransitions(status: DocumentLifecycleStatus): DocumentLifecycleTransition[] {
  return Object.keys(transitions[status]) as DocumentLifecycleTransition[];
}

export function applyDocumentTransition(input: DocumentLifecycleInput): DocumentLifecycleStatus {
  const nextStatus = transitions[input.document.status][input.transition];
  if (!nextStatus) {
    throw new Error(`Invalid document lifecycle transition from ${input.document.status}.`);
  }

  if (input.transition === "approve") {
    if (!input.actorUserId) throw new Error("Approver is required.");
    if (input.document.preparerUserId && input.document.preparerUserId === input.actorUserId) {
      throw new Error("Preparer and approver must be different users.");
    }
  }

  if (input.transition === "make_effective" && !input.officialFileId && !input.document.officialFileId) {
    throw new Error("Official PDF is required before a document becomes effective.");
  }

  return nextStatus;
}

export function assertDocumentEditable(status: DocumentLifecycleStatus): void {
  if (isDocumentImmutable(status)) {
    throw new Error("Official document versions are immutable after approval.");
  }
}

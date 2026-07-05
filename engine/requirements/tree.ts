import type {
  ApplicabilityDecision,
  ApplicabilityRecord,
  RequirementNodeInput,
  RequirementRollup,
  RequirementTreeNode,
  ScopeKind
} from "../types";

const limitedDecisions = new Set<ApplicabilityDecision>(["partial", "selected_scope", "replaced"]);

export function buildRequirementTree(
  requirements: RequirementNodeInput[],
  applicability: ApplicabilityRecord[] = [],
  scope: { scopeKind: ScopeKind; scopeId?: string } = { scopeKind: "org" }
): RequirementTreeNode[] {
  const nodes = new Map<string, RequirementTreeNode>();

  for (const requirement of requirements) {
    nodes.set(requirement.id, {
      ...requirement,
      children: [],
      rollup: emptyRollup()
    });
  }

  const roots: RequirementTreeNode[] = [];
  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  sortTree(roots);

  const decisions = new Map<string, ApplicabilityDecision>();
  for (const record of applicability) {
    if (record.scopeKind !== scope.scopeKind) continue;
    if ((record.scopeId ?? "") !== (scope.scopeId ?? "")) continue;
    decisions.set(record.requirementId, record.decision);
  }

  for (const root of roots) computeRollup(root, decisions);
  return roots;
}

function sortTree(nodes: RequirementTreeNode[]) {
  nodes.sort((a, b) => a.order - b.order || a.number.localeCompare(b.number));
  for (const node of nodes) sortTree(node.children);
}

function emptyRollup(): RequirementRollup {
  return {
    total: 0,
    applicable: 0,
    limited: 0,
    notApplicable: 0,
    pending: 0
  };
}

function computeRollup(
  node: RequirementTreeNode,
  decisions: Map<string, ApplicabilityDecision>
): RequirementRollup {
  const rollup = emptyRollup();
  addDecision(rollup, decisions.get(node.id));

  for (const child of node.children) {
    const childRollup = computeRollup(child, decisions);
    rollup.total += childRollup.total;
    rollup.applicable += childRollup.applicable;
    rollup.limited += childRollup.limited;
    rollup.notApplicable += childRollup.notApplicable;
    rollup.pending += childRollup.pending;
  }

  node.rollup = rollup;
  return rollup;
}

function addDecision(rollup: RequirementRollup, decision?: ApplicabilityDecision) {
  rollup.total += 1;
  if (!decision) {
    rollup.pending += 1;
  } else if (decision === "applicable") {
    rollup.applicable += 1;
  } else if (decision === "not_applicable") {
    rollup.notApplicable += 1;
  } else if (limitedDecisions.has(decision)) {
    rollup.limited += 1;
  }
}

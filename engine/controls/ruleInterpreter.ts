import type { RuleNode } from "../types";
import type { RuleFunctionRegistry } from "./ruleFunctions";

function getFieldValue(data: Record<string, unknown>, field: string): unknown {
  return field.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, data);
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

export function evaluateRule(
  rule: RuleNode,
  data: Record<string, unknown>,
  functions: RuleFunctionRegistry = {}
): boolean {
  if ("all" in rule) return rule.all.every((child) => evaluateRule(child, data, functions));
  if ("any" in rule) return rule.any.some((child) => evaluateRule(child, data, functions));
  if ("function" in rule) {
    const fn = functions[rule.function];
    if (!fn) throw new Error(`Rule function is not registered: ${rule.function}`);
    return fn(data);
  }

  const value = getFieldValue(data, rule.field);
  switch (rule.op) {
    case "eq":
      return value === rule.value;
    case "gte":
      return typeof value === "number" && typeof rule.value === "number" && value >= rule.value;
    case "lte":
      return typeof value === "number" && typeof rule.value === "number" && value <= rule.value;
    case "exists":
      return !isEmpty(value);
    case "empty":
      return isEmpty(value);
    default:
      throw new Error("Unsupported rule operator.");
  }
}

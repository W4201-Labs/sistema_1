export type RuleFunctionRegistry = Record<string, (data: Record<string, unknown>) => boolean>;

export const ruleFunctions: RuleFunctionRegistry = {};

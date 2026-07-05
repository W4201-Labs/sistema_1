import { describe, expect, it } from "vitest";
import schema from "../convex/schema";

describe("foundation scaffold", () => {
  it("exports the Convex schema", () => {
    expect(schema).toBeDefined();
  });

  it("keeps adapter tables out of the M0 schema", () => {
    const text = JSON.stringify(schema);
    expect(text).not.toContain("managementReviews");
    expect(text).not.toContain("auditPrograms");
  });
});

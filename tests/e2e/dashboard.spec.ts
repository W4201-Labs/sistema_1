import { expect, test } from "@playwright/test";

test("dashboard route renders the M0 shell", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("Agnostic QMS")).toBeVisible();
});

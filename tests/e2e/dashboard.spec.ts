import { expect, test } from "@playwright/test";

test("dashboard route renders the M0 shell", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("Agnostic QMS")).toBeVisible();
});

test("standards route renders M1 requirement tree", async ({ page }) => {
  await page.goto("/standards");
  await expect(page.getByRole("heading", { name: "Standard packs" })).toBeVisible();
  await expect(page.getByText("7.5.1 General")).toBeVisible();
  await expect(page.getByText("Testing Laboratory Competence")).toBeVisible();
});

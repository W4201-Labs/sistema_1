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

test("documents route renders M2 controlled document workflow", async ({ page }) => {
  await page.goto("/documents");
  await expect(page.getByRole("heading", { name: "Controlled documents" })).toBeVisible();
  await expect(page.getByText("Effective version immutable")).toBeVisible();
  await expect(page.getByText("different users")).toBeVisible();
});

test("controls route renders M3 rule builder and evaluations", async ({ page }) => {
  await page.goto("/controls");
  await expect(page.getByRole("heading", { name: "Controls" })).toBeVisible();
  await expect(page.getByText("Rule builder")).toBeVisible();
  await expect(page.getByText("CTRL-DOC-APP", { exact: true })).toBeVisible();
});

test("cycles route renders M3 workflow and closure guard", async ({ page }) => {
  await page.goto("/cycles");
  await expect(page.getByRole("heading", { name: "Audit cycles" })).toBeVisible();
  await expect(page.getByText("Closure guard passing")).toBeVisible();
  await expect(page.getByText("snapshot frozen")).toBeVisible();
});

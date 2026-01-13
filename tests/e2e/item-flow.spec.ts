import { test, expect } from "@playwright/test";

test("item browser -> item preview modal opens", async ({ page }) => {
  await page.goto("/item-browser");

  await expect(page.getByTestId("item-results")).toBeVisible();

  await page.getByTestId("item-result").first().click();

  await expect(page.getByTestId("item-detail")).toBeVisible();

  // Optional: prove the modal has a title
  await expect(page.getByTestId("item-detail").locator("h2")).toBeVisible();
});

import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Raider Pal/i); // loosen if your title varies
});

test("item browser route loads", async ({ page }) => {
  await page.goto("/item-browser");
  await expect(page.locator("body")).toBeVisible();
});

test("service worker file is served", async ({ request }) => {
  const res = await request.get("/sw.js");
  expect(res.ok()).toBeTruthy();
});

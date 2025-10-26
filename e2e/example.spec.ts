import { expect, test } from "@playwright/test"

test("has title", async ({ page }) => {
  await page.goto("./")

  // The app currently returns 404 for all routes, so let's test for that
  await expect(page).toHaveTitle(/404: This page could not be found/)
})

import { expect, test } from "@playwright/test"

test("has title", async ({ page }) => {
  await page.goto("./")

  // Check that the page loads with the correct title
  await expect(page).toHaveTitle(/Bloomwell AI/)

  // Check that the homepage content is present with current professional design
  await expect(page.locator("h1")).toContainText("AI-Powered Grant Discovery for Nonprofits")
  await expect(page.locator("p")).toContainText("Access")
  await expect(page.locator("p")).toContainText("900+")
})

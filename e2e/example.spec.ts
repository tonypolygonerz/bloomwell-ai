import { expect, test } from "@playwright/test"

test("has title", async ({ page }) => {
  await page.goto("./")

  // Check that the page loads with the correct title
  await expect(page).toHaveTitle(/Bloomwell AI/)
  
  // Check that the homepage content is present
  await expect(page.locator("h1")).toContainText("Welcome to Bloomwell AI")
  await expect(page.locator("p")).toContainText("This is the homepage")
})

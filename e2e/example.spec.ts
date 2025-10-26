import { expect, test } from "@playwright/test"

test("has title", async ({ page }) => {
  await page.goto("./")

  // Expect the homepage to have the correct title
  await expect(page).toHaveTitle(/Bloomwell AI/)
})

test("displays homepage content", async ({ page }) => {
  await page.goto("./")

  // Expect the homepage heading to be visible
  await expect(page.getByRole("heading", { name: "Welcome to Bloomwell AI" })).toBeVisible()
})

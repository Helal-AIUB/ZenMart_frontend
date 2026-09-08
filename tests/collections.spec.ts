import { test, expect } from "@playwright/test";

test.describe("Collections Flow", () => {
  test("should click a collection category and display collection products", async ({
    page,
  }) => {
    // 1. Navigate to the homepage
    await page.goto("http://localhost:3000/", {
      waitUntil: "domcontentloaded",
    });

    // 2. Click on one of the collection categories in the navigation (e.g., Pets Book or Toys)
    const collectionLink = page
      .getByRole("link", { name: /Beauty|Toys|Beauty/i })
      .first();
    await collectionLink.click();

    // 3. Verify that the URL matches a collection route
    await expect(page).toHaveURL(/.*\/collections\/.*/);

    // 4. Verify that the collection products or page header is visible
    const collectionHeader = page.locator("main, h1, h2").first();
    await expect(collectionHeader).toBeVisible({ timeout: 10000 });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Homepage and Product Navigation', () => {
  
  test('should load homepage and interact with a product card', async ({ page }) => {
    // Navigate to the frontend homepage
    await page.goto('http://localhost:3000/');

    // Verify the page title matches exactly
    await expect(page).toHaveTitle(/PetoraBD \| Your Ultimate Pet Store/i);

    // Locate the first product card link pointing to the products route
    const productCardLink = page.locator('a[href*="/products"]').first();
    
    // Verify the product card is rendered and visible
    await expect(productCardLink).toBeVisible();

    // Click the product card to navigate
    await productCardLink.click();

    // Verify successful navigation to the products page
    await expect(page).toHaveURL(/.*\/products.*/);

    // Wait for the actual product content to render after the loading spinner
    // Adjust the locator based on what actually renders on your /products page (e.g., a specific heading or product card)
    const productGrid = page.locator('main').first(); // Targets the main content area
    await expect(productGrid).toBeVisible({ timeout: 10000 });
  });
  
});
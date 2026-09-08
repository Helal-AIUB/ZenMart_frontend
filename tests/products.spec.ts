import { test, expect } from '@playwright/test';

test.describe('Product Page Flow', () => {
  
  test('should navigate to products page and display catalog', async ({ page }) => {
    // 1. Navigate directly to the products page URL
    await page.goto('http://localhost:3000/products');

    // 2. Wait for the products page content to load fully
    await page.waitForLoadState('networkidle');

    // 3. Verify that the URL is correct
    await expect(page).toHaveURL('http://localhost:3000/products');

    // 4. Verify that product items or grid container are visible on the page
    const productContainer = page.locator('main, div').filter({ has: page.locator('img') }).first();
    await expect(productContainer).toBeVisible({ timeout: 15000 });
  });

});
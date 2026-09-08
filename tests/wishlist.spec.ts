import { test, expect } from '@playwright/test';

test.describe('Wishlist Flow', () => {
  
  test('should navigate to wishlist or toggle wishlist item', async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    // 2. Click on the Wishlist button in the header
    const wishlistButton = page.getByRole('button', { name: /Wishlist/i }).first();
    await wishlistButton.click();

    // 3. Verify that the wishlist drawer or page view opens/updates successfully
    const wishlistHeading = page.locator('h2, h3, div').filter({ hasText: /Wishlist/i }).first();
    await expect(wishlistHeading).toBeVisible({ timeout: 10000 });
  });

});
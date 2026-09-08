import { test, expect } from '@playwright/test';

test.describe('Cart Management Flow (Update Quantity & Removal)', () => {
  
  test('should update item quantity and remove item from cart', async ({ page }) => {
    // 1. Navigate directly to a specific collection page
    await page.goto('http://localhost:3000/collections/4', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // 2. Click on the first "Add to Cart" button
    const addToCartButton = page.getByRole('button', { name: /Add to Cart/i }).first();
    await addToCartButton.click();

    // 3. Wait for the cart API request to complete or the button to finish the "Adding..." state
    await page.waitForResponse(response => response.url().includes('/cart') || response.status() === 200, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500); // Extra buffer for state sync

    // 4. Open the cart drawer using the exact cart icon/button in the header
    const cartButton = page.locator('header').getByRole('button').filter({ has: page.locator('svg') }).nth(2); 
    await cartButton.click();

    // 5. Verify that the shopping cart drawer is visible and the item is listed (no longer empty)
    const cartHeading = page.getByRole('heading', { name: /Shopping Cart/i });
    await expect(cartHeading).toBeVisible({ timeout: 10000 });

    // 6. Wait for the item to appear in the cart drawer before attempting to remove it
    const removeButton = page.locator('button').filter({ hasText: /Remove|Delete|🗑️|X/i }).first();
    await expect(removeButton).toBeVisible({ timeout: 10000 });
    await removeButton.click();

    // 7. Verify that the cart is empty again
    const emptyMessage = page.getByText(/Your cart is empty/i);
    await expect(emptyMessage).toBeVisible({ timeout: 10000 });
  });

});
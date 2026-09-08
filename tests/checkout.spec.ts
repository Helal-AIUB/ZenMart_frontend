import { test, expect } from '@playwright/test';

test.describe('Cart and Checkout Flow', () => {
  
  test('should authenticate via API, add product to cart, and proceed to checkout', async ({ page, request }) => {
    // 1. Fetch JWT token directly from Django backend API
    const response = await request.post('http://127.0.0.1:8000/auth/jwt/create/', {
      data: {
        username: 'jahid',
        password: 'user1234'
      }
    });
    const tokens = await response.json();

    // 2. Navigate to frontend domain first so we can set localStorage
    await page.goto('http://localhost:3000/');

    // 3. Inject the access and refresh tokens directly into localStorage
    await page.evaluate(({ access, refresh }) => {
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
    }, tokens);

    // 4. Reload the page so the app initializes with the logged-in user state
    await page.reload();

    // 5. Wait for the products to load and click the first "Add to Cart" button directly
    const addToCartButton = page.locator('button', { hasText: 'Add to Cart' }).first();
    await addToCartButton.waitFor({ state: 'visible', timeout: 20000 });
    await addToCartButton.click();

    // 6. Open the cart drawer via the header cart button
    const cartButton = page.locator('header button').filter({
      has: page.locator('svg path[d*="M3 3h2l.4 2"]')
    });
    await cartButton.click();

    // 7. Verify the checkout button is visible inside the cart drawer
    const checkoutButton = page.locator('button:has-text("Checkout"), a:has-text("Checkout"), button:has-text("Proceed")').first();
    await expect(checkoutButton).toBeVisible({ timeout: 10000 });

    // 8. Proceed to checkout and verify URL
    await checkoutButton.click();
    await expect(page).toHaveURL(/.*\/checkout.*/);
  });
  
});
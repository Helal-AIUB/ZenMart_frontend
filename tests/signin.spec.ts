import { test, expect } from '@playwright/test';

test.describe('Sign In Flow', () => {
  
  test('should sign in successfully with valid credentials', async ({ page }) => {
    // 1. Navigate to the Sign In page
    await page.goto('http://localhost:3000/signin');

    // 2. Fill in valid user credentials using accurate labels/placeholders
    await page.getByRole('textbox', { name: /username/i }).fill('jahid');
    await page.getByRole('textbox', { name: /password/i }).fill('user1234');

    // 3. Submit the sign-in form
    await page.getByRole('button', { name: /sign in/i }).click();

    // 4. Wait for the JWT token to be stored in localStorage confirming successful authentication
    await page.waitForFunction(() => localStorage.getItem('access') !== null, { timeout: 15000 });

    // 5. Verify successful redirection to the homepage
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 15000 });
    
    // 6. Verify that account or user profile element is visible in the header
    const accountButton = page.locator('header button').filter({ hasText: /Account|J Account/i });
    await expect(accountButton).toBeVisible();
  });

});
import { test, expect } from '@playwright/test';

test.describe('Sign Up Flow', () => {
  
  test('should register a new user successfully', async ({ page }) => {
    // 1. Navigate to the sign up page
    await page.goto('http://localhost:3000/signup', { waitUntil: 'domcontentloaded' });

    // 2. Fill in the registration form fields using precise IDs
    await page.locator('#first_name').fill('Shamsul');
    await page.locator('#last_name').fill('Haque');
    await page.locator('#username').fill('shamsul' + Date.now());
    await page.locator('#email').fill(`user_${Date.now()}@example.com`);
    await page.locator('#password').fill('securepassword123');
    await page.locator('#re_password').fill('securepassword123');

    // 3. Submit the sign up form and wait for network response / API completion
    const signUpButton = page.getByRole('button', { name: /Sign Up|Creating Account/i });
    
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/auth/users/') && response.status() === 201).catch(() => {}),
      signUpButton.click()
    ]);

    // 4. Verify successful redirection to the signin page
    await expect(page).toHaveURL('http://localhost:3000/signin', { timeout: 15000 });
  });

});
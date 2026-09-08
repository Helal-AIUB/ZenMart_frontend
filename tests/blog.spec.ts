import { test, expect } from '@playwright/test';

test.describe('Blog Page Flow', () => {
  
  test('should navigate to blog page and display expert articles', async ({ page }) => {
    // 1. Navigate to the homepage first
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    // 2. Click the Blog link from the navigation/header
    const blogLink = page.getByRole('link', { name: /Blog/i }).first();
    await blogLink.click();

    // 3. Verify that the URL matches the blog route
    await expect(page).toHaveURL('http://localhost:3000/blog');

    // 4. Verify that blog content or heading is visible
    const blogHeading = page.locator('h1, h2, h3').filter({ hasText: /Blog|Tips|Article/i }).first();
    await expect(blogHeading).toBeVisible({ timeout: 10000 });
  });

});
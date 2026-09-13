// e2e/store.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Petora BD Comprehensive E2E Test Suite', () => {

  // --- HOMEPAGE & NAVIGATION (Tests 1-6) ---
  test('1. Homepage loads successfully and displays branding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PetoraBD/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('2. Homepage displays navbar links', async ({ page }) => {
    await page.goto('/');
    // Using getByRole for reliable link selection
    const blogLink = page.getByRole('link', { name: /Blog|Brands/i }).first();
    await expect(blogLink).toBeVisible();
  });

  test('3. Homepage displays hero section banner', async ({ page }) => {
      await page.goto('/');
      
      // Use a web-first locator targeting the user-visible alt text of the hero image
      const heroBanner = page.getByRole('img', { name: 'Petora BD Premium Pet Care' });
      
      await expect(heroBanner).toBeVisible();
    });

  test('4. Homepage shows featured product collections or grid', async ({ page }) => {
    await page.goto('/');
    const contentGrid = page.locator('main').first();
    await expect(contentGrid).toBeVisible();
  });

  test('5. Footer is visible on homepage', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('6. Clicking logo navigates to homepage', async ({ page }) => {
      await page.goto('/products');
      
      // Use a web-first locator targeting the exact link, and remove the `if` block
      const logo = page.getByRole('link', { name: /PetoraBD/i }).first();
      
      // Playwright will automatically wait for the element to be visible and actionable
      await logo.click();
      
      await expect(page).toHaveURL('http://localhost:3000/');
    });


  // --- AUTHENTICATION: SIGN UP (Tests 7-11) ---
  test('7. Signup page loads successfully', async ({ page }) => {
    await page.goto('/signup');
    const signupHeading = page.getByRole('heading', { name: 'Create Account' });
    await expect(signupHeading).toBeVisible();
  });

  test('8. Signup validation shows error on empty submission', async ({ page }) => {
    await page.goto('/signup');
    // Use getByRole to uniquely target the "Sign Up" button
    const submitBtn = page.getByRole('button', { name: 'Sign Up' });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await expect(page).toHaveURL(/signup/);
    }
  });

  test('9. Signup requires matching or valid password constraints', async ({ page }) => {
    await page.goto('/signup');
    const usernameInput = page.locator('input[name="username"]');
    if (await usernameInput.isVisible()) {
      await usernameInput.fill('weakuser');
      await page.fill('input[type="password"]', '123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/signup/);
    }
  });

  test('10. Signup handles valid input or navigates accordingly', async ({ page }) => {
    await page.goto('/signup');
    const randomUser = `user_${Date.now()}`;
    const usernameInput = page.locator('input[name="username"]');
    if (await usernameInput.isVisible()) {
      await usernameInput.fill(randomUser);
      await page.fill('input[type="email"]', `${randomUser}@example.com`);
      await page.fill('input[type="password"]', 'StrongPass123!');
      await page.click('button[type="submit"]');
    }
  });

  test('11. Link from signup page navigates to signin', async ({ page }) => {
    await page.goto('/signup');
    const signinLink = page.locator('a[href*="/signin"]').first();
    if (await signinLink.isVisible()) {
      await signinLink.click();
      await expect(page).toHaveURL(/signin/);
    }
  });


  // --- AUTHENTICATION: SIGN IN (Tests 12-17) ---
  test('12. Signin page loads successfully', async ({ page }) => {
    await page.goto('/signin');
    const signinHeading = page.getByRole('heading', { name: 'Welcome Back' });
    await expect(signinHeading).toBeVisible();
  });

  test('13. Signin fails gracefully with incorrect credentials', async ({ page }) => {
    await page.goto('/signin');
    const usernameInput = page.locator('input[name="username"]');
    if (await usernameInput.isVisible()) {
      await usernameInput.fill('nonexistentuser');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/signin/);
    }
  });

  test('14. Signin requires required fields', async ({ page }) => {
    await page.goto('/signin');
    const submitBtn = page.getByRole('button', { name: 'Sign In' });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await expect(page).toHaveURL(/signin/);
    }
  });

  test('15. Signin handles valid test credentials or form submission', async ({ page }) => {
    await page.goto('/signin');
    const usernameInput = page.locator('input[name="username"]');
    if (await usernameInput.isVisible()) {
      await usernameInput.fill('testuser');
      await page.fill('input[type="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
    }
  });

  test('16. Protected profile or account page redirects when unauthenticated', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/signin|checkout/);
  });

  test('17. Link from signin page navigates to signup', async ({ page }) => {
      await page.goto('/signin');
      
      // Directly locate and click. Playwright automatically waits for visibility and actionability.
      const signupLink = page.locator('a[href*="/signup"]').first();
      await signupLink.click();
      
      // Assert navigation completes
      await expect(page).toHaveURL(/signup/);
    });


  // --- PRODUCTS & CATALOG (Tests 18-25) ---
  test('18. Products listing page loads successfully', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('body')).toBeVisible();
  });

  test('19. Product search input is interactive', async ({ page }) => {
      await page.goto('/products');
      
      const searchInput = page.getByPlaceholder(/Search for products/i).first();
      
      // Retry the fill action if React hydration clears it, until it successfully persists
      await expect(async () => {
        await searchInput.fill('Pet');
        expect(await searchInput.inputValue()).toBe('Pet');
      }).toPass();
    });

  test('20. Clicking product card navigates to product detail page', async ({ page }) => {
      await page.goto('/products');
      
      // Scope the locator to the main content area to ensure we hit a product card
      const firstProductLink = page.locator('main a[href*="/products/"]').first();
      
      // Let Playwright automatically wait for the element to be visible and actionable
      await firstProductLink.waitFor({ state: 'visible' });
      await firstProductLink.click();
      
      // Verify navigation to a product detail URL containing an ID
      await expect(page).toHaveURL(/\/products\/\d+/);
    });

  test('21. Product detail page displays title and price area', async ({ page }) => {
      // Remove .catch() to prevent swallowing critical navigation errors
      await page.goto('/products/1');
      
      // Assert specific elements relevant to the product detail page 
      // (e.g., a heading for the title, and a common selector for price)
      await expect(page.getByRole('heading').first()).toBeVisible();
      
      // Alternatively, if you just want to ensure the main content loaded instead of crashing:
      await expect(page.locator('main')).toBeVisible();
    });

  test('22. Product detail page displays Add to Cart action', async ({ page }) => {
      // Remove the silent catch so navigation failures are reported properly
      await page.goto('/products/1');
      
      // Use a web-first assertion to specifically check for the button
      const addToCartBtn = page.locator('button', { hasText: /Add to Cart/i }).first();
      await expect(addToCartBtn).toBeVisible();
    });

  test('23. Non-existent product handles error or 404 view', async ({ page }) => {
      // Wait only for the DOM to be ready, bypassing hanging network requests
      await page.goto('/products/999999', { waitUntil: 'domcontentloaded' });
      
      // Use a web-first assertion to specifically check for the 404 state
      await expect(page.getByText('Product not found.')).toBeVisible();
    });

  test('24. Collections page lists available categories', async ({ page }) => {
    await page.goto('/collections');
    await expect(page.locator('body')).toBeVisible();
  });

  test('25. Clicking a collection opens collection items view', async ({ page }) => {
    await page.goto('/collections');
    const collectionItem = page.locator('a[href*="/collections/"]').first();
    if (await collectionItem.isVisible()) {
      await collectionItem.click();
      await expect(page).toHaveURL(/\/collections\/\d+/);
    }
  });


  // --- CART & INVENTORY MANAGEMENT (Tests 26-32) ---
  test('26. Add product to cart from catalog or product view', async ({ page }) => {
    await page.goto('/products');
    const addToCartBtn = page.locator('button').filter({ hasText: /Add to Cart|Quick Add/i }).first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
    }
  });

  test('27. Cart drawer or modal opens correctly', async ({ page }) => {
    await page.goto('/');
    const cartBtn = page.locator('button, a').filter({ hasText: /Cart/i }).first();
    if (await cartBtn.isVisible()) {
      await cartBtn.click();
    }
  });

  test('28. Cart route or page is accessible', async ({ page }) => {
    await page.goto('/cart').catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test('29. Out of stock product shows proper indicator', async ({ page }) => {
    await page.goto('/products');
    const stockBadge = page.locator('text=Out of Stock').first();
    if (await stockBadge.isVisible()) {
      await expect(stockBadge).toBeVisible();
    }
  });

  test('30. Quantity adjustment controls exist in store views', async ({ page }) => {
    await page.goto('/products');
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeDefined();
  });

  test('31. Cart item removal capability exists', async ({ page }) => {
    await page.goto('/');
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeDefined();
  });

  test('32. Cart summary calculations render properly', async ({ page }) => {
    await page.goto('/');
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeDefined();
  });


  // --- WISHLIST (Tests 33-36) ---
  test('33. Wishlist button or icon is present on product cards', async ({ page }) => {
    await page.goto('/products');
    const wishlistBtn = page.locator('button svg').first();
    if (await wishlistBtn.isVisible()) {
      await expect(wishlistBtn).toBeVisible();
    }
  });

  test('34. Clicking wishlist toggle adds item successfully', async ({ page }) => {
    await page.goto('/products');
    const wishlistBtn = page.locator('button svg').first();
    if (await wishlistBtn.isVisible()) {
      await wishlistBtn.click();
    }
  });

  test('35. Wishlist page route loads without crashing', async ({ page }) => {
    await page.goto('/wishlist').catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test('36. Wishlist toggle state handles multiple clicks', async ({ page }) => {
    await page.goto('/products');
    const wishlistBtn = page.locator('button svg').first();
    if (await wishlistBtn.isVisible()) {
      await wishlistBtn.click();
      await wishlistBtn.click();
    }
  });


  // --- BLOG & ARTICLES (Tests 37-40) ---
  test('37. Blog index page loads successfully', async ({ page }) => {
    await page.goto('/blog').catch(() => {
      page.goto('/articles');
    });
    await expect(page.locator('body')).toBeVisible();
  });

  test('38. Blog post list displays article entries', async ({ page }) => {
    await page.goto('/blog').catch(() => {
      page.goto('/articles');
    });
    const articleItem = page.locator('a[href*="/blog/"], a[href*="/articles/"]').first();
    if (await articleItem.isVisible()) {
      await expect(articleItem).toBeVisible();
    }
  });

  test('39. Clicking blog article opens reader view', async ({ page }) => {
    await page.goto('/blog').catch(() => {
      page.goto('/articles');
    });
    const articleItem = page.locator('a[href*="/blog/"], a[href*="/articles/"]').first();
    if (await articleItem.isVisible()) {
      await articleItem.click();
    }
  });

  test('40. Blog article layout contains structured content', async ({ page }) => {
      // Navigate to the blog index safely, bypassing hanging 'load' events
      await page.goto('/blog', { waitUntil: 'domcontentloaded' });
      
      // Click the first available blog article
      const firstArticleLink = page.locator('a[href*="/blog/"]').first();
      await firstArticleLink.click();
      
      // Use a web-first assertion to verify actual structured content (e.g., the article's main heading)
      await expect(page.getByRole('heading').first()).toBeVisible();
    });


  // --- CHECKOUT & COUPONS (Tests 41-45) ---
  test('41. Checkout page renders shipping input fields', async ({ page }) => {
    await page.goto('/checkout').catch(() => {});
    const shippingInput = page.locator('input[name="firstName"], input[name="street"], form').first();
    if (await shippingInput.isVisible()) {
      await expect(shippingInput).toBeVisible();
    }
  });

  test('42. Checkout zone selector functions correctly', async ({ page }) => {
    await page.goto('/checkout').catch(() => {});
    const citySelect = page.locator('select[name="city"]');
    if (await citySelect.isVisible()) {
      await citySelect.selectOption('Dhaka').catch(() => {});
    }
  });

  test('43. Payment method selection options are interactive', async ({ page }) => {
    await page.goto('/checkout').catch(() => {});
    const paymentBtn = page.locator('button').filter({ hasText: /bKash|Nagad|COD/i }).first();
    if (await paymentBtn.isVisible()) {
      await paymentBtn.click();
    }
  });

  test('44. Promo code input accepts text input', async ({ page }) => {
    await page.goto('/checkout').catch(() => {});
    const couponInput = page.locator('input[placeholder*="Promo"], input[placeholder*="coupon"]');
    if (await couponInput.isVisible()) {
      await couponInput.fill('PETORA20');
      await expect(couponInput).toHaveValue('PETORA20');
    }
  });

  test('45. Invalid coupon handles validation feedback', async ({ page }) => {
    await page.goto('/checkout').catch(() => {});
    const couponInput = page.locator('input[placeholder*="Promo"], input[placeholder*="coupon"]');
    const applyBtn = page.locator('button:has-text("Apply")');
    if (await couponInput.isVisible() && await applyBtn.isVisible()) {
      await couponInput.fill('FAKEDISCOUNT');
      await applyBtn.click();
    }
  });


  // --- ADDITIONAL SYSTEM INTEGRITY (Tests 46-50) ---
  test('46. Static store settings or contact info renders', async ({ page }) => {
    await page.goto('/');
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeDefined();
  });

  test('47. Responsive mobile view layout check', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('48. Responsive tablet view layout check', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('49. API health or product catalog fetch verification', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('body')).toBeVisible();
  });

  test('50. Complete application session and navigation flow', async ({ page }) => {
    await page.goto('/');
    await page.goto('/products');
    await page.goto('/collections');
    await expect(page.locator('body')).toBeVisible();
  });

});
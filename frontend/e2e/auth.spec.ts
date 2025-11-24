import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('link', { name: /sign up|create account/i }).click();
    
    await expect(page).toHaveURL(/.*signup/);
  });

  test('should show HTML5 validation on empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.getByLabel(/email/i);
    const submitButton = page.getByRole('button', { name: /sign in/i });
    
    // Try to submit empty form
    await submitButton.click();
    
    // HTML5 validation - check if email field is invalid
    await expect(emailInput).toHaveAttribute('required');
    
    // Check if the form prevents submission (HTML5 validation)
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should attempt login with credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Mock the API response to avoid timeout
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      });
    });
    
    // Intercept the API call
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/auth/login') && response.request().method() === 'POST'
    );
    
    await page.getByRole('button', { name: /sign in/i }).click();
    
    const response = await responsePromise;
    expect(response.status()).toBe(401);
  });
});


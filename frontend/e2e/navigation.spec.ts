import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to homepage', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveURL('/');
    // Check for the WorkTide logo in navbar (more specific)
    await expect(page.getByRole('link', { name: 'WorkTide' }).first()).toBeVisible();
  });

  test('should navigate to Find Work page', async ({ page }) => {
    await page.goto('/');
    
    // Use the navbar link specifically (first one in navigation)
    await page.getByRole('navigation').getByRole('link', { name: /find work/i }).first().click();
    
    await expect(page).toHaveURL(/.*find-work/);
  });

  test('should navigate to Find Freelancers page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('navigation').getByRole('link', { name: /find freelancers/i }).first().click();
    
    await expect(page).toHaveURL(/.*find-freelancers/);
  });

  test('should show login button when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // The navbar shows "Log in" text, not "Login"
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
  });
});


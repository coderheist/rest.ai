import { test, expect } from '@playwright/test';

test.describe('Dashboard and Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should display dashboard statistics', async ({ page }) => {
    await expect(page.locator('text=/Total Jobs|Active Jobs/i')).toBeVisible();
    await expect(page.locator('text=/Total Resumes|Total Matches/i')).toBeVisible();
  });

  test('should show recent activity', async ({ page }) => {
    await expect(page.locator('text=/Recent Activity|Latest/i')).toBeVisible();
  });

  test('should navigate to different sections from dashboard', async ({ page }) => {
    await page.click('text=View All Jobs');
    await expect(page).toHaveURL(/.*jobs/);
    
    await page.click('text=Dashboard');
    await page.click('text=View All Resumes');
    await expect(page).toHaveURL(/.*resumes/);
  });

  test('should display usage analytics', async ({ page }) => {
    await page.click('text=Usage');
    
    await expect(page.locator('text=/API Calls|Credits Used/i')).toBeVisible();
  });
});

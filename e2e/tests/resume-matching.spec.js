import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Resume Upload and Matching Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should create a new job posting', async ({ page }) => {
    await page.click('text=Jobs');
    await page.click('text=Create Job');
    
    // Fill job form
    await page.fill('input[name="title"]', 'Senior React Developer');
    await page.fill('input[name="company"]', 'Tech Corp');
    await page.fill('textarea[name="description"]', 'Looking for an experienced React developer');
    await page.fill('input[name="location"]', 'Remote');
    
    // Add skills
    await page.fill('input[placeholder*="skill"]', 'React');
    await page.keyboard.press('Enter');
    await page.fill('input[placeholder*="skill"]', 'JavaScript');
    await page.keyboard.press('Enter');
    await page.fill('input[placeholder*="skill"]', 'Node.js');
    await page.keyboard.press('Enter');
    
    // Salary range
    await page.fill('input[name="salaryMin"]', '100000');
    await page.fill('input[name="salaryMax"]', '150000');
    
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=/success|created/i')).toBeVisible();
    
    // Should see the job in the list
    await expect(page.locator('text=Senior React Developer')).toBeVisible();
  });

  test('should upload resume', async ({ page }) => {
    await page.click('text=Resumes');
    
    // Upload resume file
    const fileInput = page.locator('input[type="file"]');
    const testResumePath = path.join(__dirname, '../fixtures/sample-resume.pdf');
    
    // Create a sample file if it doesn't exist
    await fileInput.setInputFiles({
      name: 'sample-resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Sample PDF content')
    });
    
    await page.click('button:has-text("Upload")');
    
    // Wait for upload and parsing
    await expect(page.locator('text=/success|uploaded/i')).toBeVisible({ timeout: 10000 });
  });

  test('should match resume to job', async ({ page }) => {
    // Navigate to a job detail page
    await page.click('text=Jobs');
    await page.click('text=Senior React Developer');
    
    // Click match candidates
    await page.click('text=Match Candidates');
    
    // Should show matches
    await expect(page.locator('text=/candidates|matches/i')).toBeVisible({ timeout: 10000 });
  });

  test('should view match details', async ({ page }) => {
    await page.click('text=Jobs');
    await page.click('text=Senior React Developer');
    
    // Click on first match
    const firstMatch = page.locator('[data-testid="match-card"]').first();
    await firstMatch.click();
    
    // Should show match details
    await expect(page.locator('text=/Match Score|Overall Score/i')).toBeVisible();
    await expect(page.locator('text=/Skills|Experience|Education/i')).toBeVisible();
  });

  test('should shortlist a candidate', async ({ page }) => {
    await page.click('text=Jobs');
    await page.click('text=Senior React Developer');
    
    // Shortlist first candidate
    await page.click('button:has-text("Shortlist")');
    
    await expect(page.locator('text=/shortlisted/i')).toBeVisible();
  });

  test('should generate interview kit', async ({ page }) => {
    await page.click('text=Jobs');
    await page.click('text=Senior React Developer');
    
    // Navigate to match detail
    await page.click('[data-testid="match-card"]');
    
    // Generate interview kit
    await page.click('text=Generate Interview Kit');
    
    // Should show loading state
    await expect(page.locator('text=/generating|loading/i')).toBeVisible();
    
    // Should show interview questions
    await expect(page.locator('text=/Technical Questions|Behavioral Questions/i')).toBeVisible({ timeout: 15000 });
  });

  test('should rescreen candidates', async ({ page }) => {
    await page.click('text=Jobs');
    await page.click('text=Senior React Developer');
    
    // Click rescreen button
    await page.click('text=Rescreen Candidates');
    
    // Confirm action
    await page.click('button:has-text("Confirm")');
    
    // Should show success message
    await expect(page.locator('text=/rescreening|updated/i')).toBeVisible({ timeout: 15000 });
  });

  test('should view job insights', async ({ page }) => {
    await page.click('text=Jobs');
    await page.click('text=Senior React Developer');
    
    // Navigate to insights tab
    await page.click('text=AI Insights');
    
    // Should show insights data
    await expect(page.locator('text=/Total Applications|Average Score/i')).toBeVisible();
    await expect(page.locator('text=/Recommendations/i')).toBeVisible();
  });

  test('should export candidates to CSV', async ({ page }) => {
    await page.click('text=Jobs');
    await page.click('text=Senior React Developer');
    
    // Setup download listener
    const downloadPromise = page.waitForEvent('download');
    
    await page.click('text=Export');
    await page.click('text=CSV');
    
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.csv');
  });
});


import { test, expect } from '@playwright/test';

test('application loads successfully', async ({ page }) => {
  await page.goto('http://localhost');
  
  // Check if the main page title exists
  const pageTitle = await page.title();
  expect(pageTitle).toContain('Leave Management System');
  
  // Verify basic UI elements
  const loginButton = await page.getByRole('button', { name: /log in/i });
  expect(loginButton).toBeTruthy();
});

test('login functionality works', async ({ page }) => {
  await page.goto('http://localhost');
  
  // Mock login credentials (replace with actual test credentials)
  await page.fill('input[name="email"]', 'reviewer@example.com');
  await page.fill('input[name="password"]', 'TestReview2024!');
  
  const loginButton = await page.getByRole('button', { name: /log in/i });
  await loginButton.click();
  
  // Check if redirected to dashboard or main application page
  await page.waitForURL('**/dashboard');
  expect(page.url()).toContain('/dashboard');
});

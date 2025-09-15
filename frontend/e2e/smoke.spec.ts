import { test, expect } from '@playwright/test';

const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
const path = (p: string) => `${bp}${p}`;

test('home links render', async ({ page }) => {
  await page.goto(path('/'));
  await expect(page.getByRole('link', { name: 'Store' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  await expect(page.getByRole('img', { name: /al noor/i })).toBeVisible();
});

test('products page loads', async ({ page }) => {
  await page.goto(path('/products'));
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
});

test('admin login page loads', async ({ page }) => {
  await page.goto(path('/admin/login'));
  await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
});


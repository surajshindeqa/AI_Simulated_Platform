import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/');
  await page.getByPlaceholder('name@example.com').fill('suraj@audirie.com');
  await page.getByPlaceholder('Password').fill('Test@1234');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForTimeout(5000);
  await page.close();
});
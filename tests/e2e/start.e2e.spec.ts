import { expect, test } from '@playwright/test'

test('home page responds', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('admin panel renders', async ({ page }) => {
  const response = await page.goto('/admin')
  expect(response?.status()).toBe(200)
  // Fresh database shows "create first user", otherwise the login form; both have an email field.
  await expect(page.locator('input[name="email"]')).toBeVisible()
})

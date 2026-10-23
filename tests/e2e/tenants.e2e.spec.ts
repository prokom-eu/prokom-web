import { expect, test } from '@playwright/test'

import { site } from './helpers'

// Matches src/seed/tenants.ts (run `pnpm seed` before the e2e tests).
// The Biznes home page has its own hero (B7, `seedBiznesHome`); the others the sample one.
const TENANTS = [
  { host: 'biznes.localhost', name: 'PRO-KOM Biznes', h1: /^Kasy, komputery i opieka IT\./ },
  { host: 'instalacje.localhost', name: 'PRO-KOM Instalacje', h1: 'PRO-KOM Instalacje' },
  { host: 'software.localhost', name: 'PRO-KOM Software', h1: 'PRO-KOM Software' },
]

test.describe('tenant isolation', () => {
  for (const tenant of TENANTS) {
    test(`${tenant.host} shows only its own tenant`, async ({ page }) => {
      const response = await page.goto(site(tenant.host))
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveText(tenant.h1)
      await expect(page).toHaveTitle(tenant.name)

      const html = await page.content()
      for (const other of TENANTS.filter((t) => t !== tenant)) {
        expect(html).not.toContain(other.name)
      }
    })
  }
})

test.describe('cross-tenant paths', () => {
  // Review of S3: /<other domain> once rendered the other tenant through the [domain] segment.
  test('another domain in the path does not show that tenant', async ({ page }) => {
    const response = await page.goto(site('instalacje.localhost', '/biznes.localhost'))
    expect(response?.status()).toBe(404)
    expect(await page.content()).not.toContain('PRO-KOM Biznes')
  })

  test('the same trick on an unknown domain → 404', async ({ page }) => {
    const response = await page.goto(site('nieznana.localhost', '/biznes.localhost'))
    expect(response?.status()).toBe(404)
    expect(await page.content()).not.toContain('PRO-KOM Biznes')
  })
})

test.describe('unknown domains', () => {
  for (const host of ['nieznana.localhost', 'localhost']) {
    test(`${host} → 404`, async ({ page }) => {
      const response = await page.goto(site(host))
      expect(response?.status()).toBe(404)
      const html = await page.content()
      for (const tenant of TENANTS) {
        expect(html).not.toContain(tenant.name)
      }
    })
  }
})

test.describe('panel only on the panel domain', () => {
  for (const path of ['/admin', '/admin/login', '/api/users', '/api/tenants', '/api/graphql']) {
    test(`${path} on a site domain → 404`, async ({ page }) => {
      const response = await page.goto(site('biznes.localhost', path))
      expect(response?.status()).toBe(404)
    })
  }

  test('admin panel renders on panel.localhost', async ({ page }) => {
    const response = await page.goto('/admin')
    expect(response?.status()).toBe(200)
    // Fresh database shows "create first user", otherwise the login form; both have an email field.
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('panel root redirects to the admin panel', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/admin/)
  })

  test('panel domain does not serve site pages', async ({ page }) => {
    const response = await page.goto('/kontakt')
    expect(response?.status()).toBe(404)
  })
})

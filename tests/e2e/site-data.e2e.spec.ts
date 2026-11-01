import { expect, test } from '@playwright/test'

import { api, loginAsAdmin, site } from './helpers'

// S4 acceptance: CompanyData is shared by every domain, SiteSettings belong to one line.
// Edits go through the panel's REST API as the seed admin and are reverted afterwards,
// so the tests can run repeatedly on the same database (run `pnpm seed` first).

const HOSTS = ['biznes.localhost', 'instalacje.localhost', 'software.localhost']

const uniquePhone = () => `+48 000 ${String(Date.now()).slice(-6)}`

test.describe('company data and site settings', () => {
  test('a CompanyData change shows on every domain that prints the company name', async ({
    page,
  }) => {
    await loginAsAdmin(page)
    const { json: original } = await api(page, 'GET', '/api/globals/company-data?depth=0')
    const name = original.name as string
    expect(name).toBeTruthy()

    // Biznes takes its phones from its own settings (contact of 01.11.2026); the company name,
    // NIP and office stay shared — the footer prints the name next to the NIP.
    const changed = `${name} (${String(Date.now()).slice(-6)})`
    const updated = await api(page, 'POST', '/api/globals/company-data', { name: changed })
    expect(updated.status).toBe(200)

    try {
      // Software's company data is checked in software-frame.e2e.spec.ts. Instalacje: minimal
      // footer with the line's contact until its shell (I1 → I3).
      for (const host of HOSTS.filter(
        (h) => h !== 'software.localhost' && h !== 'instalacje.localhost',
      )) {
        await page.goto(site(host))
        await expect(page.locator('footer')).toContainText(changed)
      }
    } finally {
      await page.goto('/admin/login')
      const restored = await api(page, 'POST', '/api/globals/company-data', { name })
      expect(restored.status).toBe(200)
    }
  })

  test('a SiteSettings change shows only on its own domain', async ({ page }) => {
    await loginAsAdmin(page)
    const tenants = await api(page, 'GET', '/api/tenants?where[slug][equals]=biznes&depth=0')
    const [tenant] = tenants.json.docs as { id: number }[]
    expect(tenant).toBeDefined()

    const settings = await api(
      page,
      'GET',
      `/api/site-settings?where[tenant][equals]=${tenant?.id}&depth=0`,
    )
    const [doc] = settings.json.docs as { id: number; phone: string | null }[]
    expect(doc).toBeDefined()

    const phone = uniquePhone()
    const updated = await api(page, 'PATCH', `/api/site-settings/${doc?.id}`, { phone })
    expect(updated.status).toBe(200)

    try {
      await page.goto(site('biznes.localhost'))
      await expect(page.locator('footer')).toContainText(phone)

      for (const host of HOSTS.filter((h) => h !== 'biznes.localhost')) {
        await page.goto(site(host))
        await expect(page.locator('footer')).toBeVisible()
        expect(await page.content()).not.toContain(phone)
      }
    } finally {
      await page.goto('/admin/login')
      const restored = await api(page, 'PATCH', `/api/site-settings/${doc?.id}`, {
        phone: doc?.phone ?? null,
      })
      expect(restored.status).toBe(200)
    }
  })
})

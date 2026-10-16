import { expect, type Page, test } from '@playwright/test'

// S4 acceptance: CompanyData is shared by every domain, SiteSettings belong to one line.
// Edits go through the panel's REST API as the seed admin and are reverted afterwards,
// so the tests can run repeatedly on the same database (run `pnpm seed` first).

const HOSTS = ['biznes.localhost', 'instalacje.localhost', 'software.localhost']
const site = (host: string) => `http://${host}:3000/`

type ApiResult = { status: number; json: Record<string, unknown> }

/** REST call from inside the panel page: Chromium resolves *.localhost, Node.js may not. */
async function api(page: Page, method: string, path: string, body?: unknown): Promise<ApiResult> {
  return page.evaluate(
    async ({ method, path, body }) => {
      const response = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      return { status: response.status, json: (await response.json()) as Record<string, unknown> }
    },
    { method, path, body },
  )
}

async function loginAsAdmin(page: Page): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) throw new Error('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are not set.')
  await page.goto('/admin/login')
  const { status } = await api(page, 'POST', '/api/users/login', { email, password })
  expect(status).toBe(200)
}

const uniquePhone = () => `+48 000 ${String(Date.now()).slice(-6)}`

test.describe('company data and site settings', () => {
  test('a CompanyData phone change shows on all three domains', async ({ page }) => {
    await loginAsAdmin(page)
    const { json: original } = await api(page, 'GET', '/api/globals/company-data?depth=0')
    const phones = original.phones as { number: string }[]
    expect(phones.length).toBeGreaterThan(0)

    const phone = uniquePhone()
    const [first, ...rest] = phones
    const updated = await api(page, 'POST', '/api/globals/company-data', {
      phones: [{ ...first, number: phone }, ...rest],
    })
    expect(updated.status).toBe(200)

    try {
      for (const host of HOSTS) {
        await page.goto(site(host))
        await expect(page.locator('footer')).toContainText(phone)
      }
    } finally {
      await page.goto('/admin/login')
      const restored = await api(page, 'POST', '/api/globals/company-data', { phones })
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

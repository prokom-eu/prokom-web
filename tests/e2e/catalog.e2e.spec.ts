import { randomUUID } from 'node:crypto'

import { expect, test } from '@playwright/test'

import { api, loginAsAdmin, site, tenantId } from './helpers'

// B1 acceptance: catalog routes exist only on the Biznes domain; catalog data is tenant-scoped
// in the panel (slug unique per tenant, an editor sees only their own tenant's records).

const group = (tenant: number, slug: string) => ({
  tenant,
  name: `Grupa E2E ${slug}`,
  slug,
  icon: 'store',
  gradientFrom: '#244FB0',
  gradientTo: '#4FA3F0',
})

test.describe('Biznes-only routes', () => {
  test('/zapytanie renders on the Biznes domain', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/zapytanie'))
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Lista zapytania')
  })

  for (const host of ['instalacje.localhost', 'software.localhost']) {
    test(`/zapytanie on ${host} → 404`, async ({ page }) => {
      const response = await page.goto(site(host, '/zapytanie'))
      expect(response?.status()).toBe(404)
      await expect(page.locator('h1')).not.toHaveText('Lista zapytania')
    })
  }
})

test.describe('catalog data in the panel', () => {
  test('a slug is unique per tenant, not across tenants', async ({ page }) => {
    await loginAsAdmin(page)
    const [biznes, software] = await Promise.all([
      tenantId(page, 'biznes'),
      tenantId(page, 'software'),
    ])
    const slug = `e2e-${Date.now()}`
    const created: number[] = []
    try {
      const first = await api(page, 'POST', '/api/catalog-groups', group(biznes, slug))
      expect(first.status).toBe(201)
      created.push((first.json.doc as { id: number }).id)

      const duplicate = await api(page, 'POST', '/api/catalog-groups', group(biznes, slug))
      expect(duplicate.status).toBe(400)

      const otherTenant = await api(page, 'POST', '/api/catalog-groups', group(software, slug))
      expect(otherTenant.status).toBe(201)
      created.push((otherTenant.json.doc as { id: number }).id)
    } finally {
      for (const id of created) await api(page, 'DELETE', `/api/catalog-groups/${id}`)
    }
  })

  test('an editor of another tenant does not see Biznes catalog records', async ({
    page,
    browser,
  }) => {
    await loginAsAdmin(page)
    const [biznes, instalacje] = await Promise.all([
      tenantId(page, 'biznes'),
      tenantId(page, 'instalacje'),
    ])
    const record = await api(
      page,
      'POST',
      '/api/catalog-groups',
      group(biznes, `e2e-${Date.now()}`),
    )
    expect(record.status).toBe(201)
    const groupId = (record.json.doc as { id: number }).id

    // Throwaway test account of the local app, removed below.
    const email = `e2e-editor-${Date.now()}@example.test`
    const password = randomUUID()
    const editor = await api(page, 'POST', '/api/users', {
      email,
      password,
      role: 'editor',
      tenants: [{ tenant: instalacje }],
    })
    expect(editor.status).toBe(201)
    const editorId = (editor.json.doc as { id: number }).id

    const context = await browser.newContext()
    try {
      const editorPage = await context.newPage()
      await editorPage.goto('/admin/login')
      expect((await api(editorPage, 'POST', '/api/users/login', { email, password })).status).toBe(
        200,
      )
      const list = await api(editorPage, 'GET', '/api/catalog-groups?depth=0&limit=100')
      expect(list.status).toBe(200)
      const ids = (list.json.docs as { id: number }[]).map((doc) => doc.id)
      expect(ids).not.toContain(groupId)
      expect((await api(editorPage, 'GET', `/api/catalog-groups/${groupId}`)).status).not.toBe(200)

      // Anonymous: the catalog API is closed (the site reads through the Local API).
      const anonymous = await browser.newContext()
      try {
        const anonPage = await anonymous.newPage()
        await anonPage.goto('/admin/login')
        expect((await api(anonPage, 'GET', '/api/products')).status).not.toBe(200)
      } finally {
        await anonymous.close()
      }
    } finally {
      await context.close()
      await api(page, 'DELETE', `/api/users/${editorId}`)
      await api(page, 'DELETE', `/api/catalog-groups/${groupId}`)
    }
  })
})

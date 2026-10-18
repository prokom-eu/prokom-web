import { randomUUID } from 'node:crypto'

import { expect, type Page, test } from '@playwright/test'
import sharp from 'sharp'

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

/** Partner (upload collection) from inside the panel page: multipart `file` + `_payload`. */
async function createPartner(page: Page, data: Record<string, unknown>) {
  const png = await sharp({
    create: { width: 320, height: 120, channels: 3, background: { r: 230, g: 230, b: 230 } },
  })
    .png()
    .toBuffer()
  return page.evaluate(
    async ({ base64, name, data }) => {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
      const form = new FormData()
      form.append('file', new File([bytes], name, { type: 'image/png' }))
      form.append('_payload', JSON.stringify(data))
      const response = await fetch('/api/partners', { method: 'POST', body: form })
      return { status: response.status, json: (await response.json()) as Record<string, unknown> }
    },
    { base64: png.toString('base64'), name: `e2e-partner-${Date.now()}.png`, data },
  )
}

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

  test('partners without an address do not collide on the unique slug', async ({ page }) => {
    await loginAsAdmin(page)
    const created: number[] = []
    try {
      for (const name of ['Partner E2E bez adresu 1', 'Partner E2E bez adresu 2']) {
        const result = await createPartner(page, { name, slug: '' })
        expect(result.status).toBe(201)
        const doc = result.json.doc as { id: number; slug?: string | null }
        created.push(doc.id)
        expect(doc.slug ?? null).toBeNull()
      }
    } finally {
      for (const id of created) await api(page, 'DELETE', `/api/partners/${id}`)
    }
  })
})

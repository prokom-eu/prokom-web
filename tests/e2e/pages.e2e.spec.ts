import { expect, type Page, test } from '@playwright/test'

import { createPreviewToken } from '../../src/lib/preview/token'
import { api, loginAsAdmin, site, tenantId } from './helpers'

// S5 acceptance: drafts stay private, publishing shows the change on the right domain only,
// live preview shows the draft. Each test creates its own page and deletes it afterwards.

const hero = (heading: string) => [{ blockType: 'hero', heading }]

async function createPage(page: Page, tenant: number, slug: string, heading: string) {
  const created = await api(page, 'POST', '/api/pages?draft=true', {
    tenant,
    title: `E2E ${slug}`,
    slug,
    layout: hero(heading),
    _status: 'draft',
  })
  expect(created.status).toBe(201)
  return (created.json.doc as { id: number }).id
}

/** The panel remembers per user whether live preview is open, so toggle only when closed. */
async function openLivePreview(page: Page) {
  const open = page.getByRole('button', { name: /^live preview$/i })
  const exit = page.getByRole('button', { name: /^exit live preview$/i })
  await expect(open.or(exit)).toBeVisible()
  if (await open.isVisible()) await open.click()
  await expect(page.locator('iframe')).toBeVisible()
}

const uniqueSlug = () => `e2e-${Date.now()}`

test.describe('pages from blocks', () => {
  test('edit → publish → visible on its own domain only', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const slug = uniqueSlug()
    const id = await createPage(page, biznes, slug, 'Szkic E2E')

    try {
      // A draft is not public.
      let response = await page.goto(site('biznes.localhost', `/${slug}`))
      expect(response?.status()).toBe(404)

      await page.goto('/admin/login')
      const published = await api(page, 'PATCH', `/api/pages/${id}`, {
        layout: hero('Opublikowane E2E'),
        _status: 'published',
      })
      expect(published.status).toBe(200)

      response = await page.goto(site('biznes.localhost', `/${slug}`))
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveText('Opublikowane E2E')

      // Same address on another line: its own (missing) page, never this one.
      response = await page.goto(site('instalacje.localhost', `/${slug}`))
      expect(response?.status()).toBe(404)
      expect(await page.content()).not.toContain('Opublikowane E2E')

      // A new draft of a published page leaves the public version alone…
      await page.goto('/admin/login')
      const draft = await api(page, 'PATCH', `/api/pages/${id}?draft=true`, {
        layout: hero('Nowy szkic E2E'),
        _status: 'draft',
      })
      expect(draft.status).toBe(200)
      await page.goto(site('biznes.localhost', `/${slug}`))
      await expect(page.locator('h1')).toHaveText('Opublikowane E2E')

      // …and publishing it shows at once (cache revalidated for this tenant).
      await page.goto('/admin/login')
      const republished = await api(page, 'PATCH', `/api/pages/${id}`, {
        layout: hero('Druga wersja E2E'),
        _status: 'published',
      })
      expect(republished.status).toBe(200)
      await page.goto(site('biznes.localhost', `/${slug}`))
      await expect(page.locator('h1')).toHaveText('Druga wersja E2E')
    } finally {
      await page.goto('/admin/login')
      expect((await api(page, 'DELETE', `/api/pages/${id}`)).status).toBe(200)
    }
  })

  test('a javascript: link in rich text is rejected', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const link = (url: string) => ({
      type: 'link',
      version: 3,
      fields: { linkType: 'custom', url, newTab: false },
      children: [{ type: 'text', text: 'Kliknij', version: 1 }],
    })
    const content = (url: string) => ({
      root: {
        type: 'root',
        version: 1,
        children: [{ type: 'paragraph', version: 1, children: [link(url)] }],
      },
    })
    const save = (url: string) =>
      api(page, 'POST', '/api/pages', {
        tenant: biznes,
        title: 'Link E2E',
        slug: uniqueSlug(),
        layout: [{ blockType: 'richText', content: content(url) }],
        _status: 'published',
      })
    const cleanUp = async (result: Awaited<ReturnType<typeof save>>) => {
      if (result.status === 201) {
        await api(page, 'DELETE', `/api/pages/${(result.json.doc as { id: number }).id}`)
      }
    }

    // The same document with a valid link saves — so the 400 below comes from the URL rule.
    const valid = await save('https://pro-kom.eu')
    await cleanUp(valid)
    expect(valid.status).toBe(201)

    const invalid = await save('javascript:alert(1)')
    await cleanUp(invalid)
    expect(invalid.status).toBe(400)
  })

  test('the same slug twice on one line is rejected', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const duplicate = await api(page, 'POST', '/api/pages', {
      tenant: biznes,
      title: 'Duplikat',
      slug: 'kontakt',
      layout: hero('Duplikat'),
      _status: 'published',
    })
    expect(duplicate.status).toBe(400)
  })
})

test.describe('live preview', () => {
  test('shows the draft with a valid token only, on its own domain only', async ({ page }) => {
    const secret = process.env.PAYLOAD_SECRET
    if (!secret) throw new Error('PAYLOAD_SECRET is not set.')
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const id = await createPage(page, biznes, uniqueSlug(), 'Podgląd E2E')
    const token = createPreviewToken({ pageId: id, tenantId: biznes, secret })

    try {
      let response = await page.goto(site('biznes.localhost', `/podglad/${id}?token=${token}`))
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveText('Podgląd E2E')
      expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex')

      for (const path of [`/podglad/${id}`, `/podglad/${id}?token=1.${'a'.repeat(43)}`]) {
        response = await page.goto(site('biznes.localhost', path))
        expect(response?.status()).toBe(404)
      }
      response = await page.goto(site('instalacje.localhost', `/podglad/${id}?token=${token}`))
      expect(response?.status()).toBe(404)
      expect(await page.content()).not.toContain('Podgląd E2E')
    } finally {
      await page.goto('/admin/login')
      expect((await api(page, 'DELETE', `/api/pages/${id}`)).status).toBe(200)
    }
  })

  test('refreshes in the panel as the draft is typed', async ({ page }) => {
    // The panel links the preview to the tenant's domain for this NODE_ENV: the seed has only
    // local ones, so on the production build (CI, `E2E_SERVER=start`) there is no preview.
    test.skip(process.env.E2E_SERVER === 'start', 'needs `next dev` (local tenant domains)')
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const id = await createPage(page, biznes, uniqueSlug(), 'Podgląd E2E')

    try {
      // Typing autosaves the draft and the iframe refreshes itself — same URL, no reload
      // (`RefreshRouteOnSave`; the token stays stable within its time bucket).
      await page.goto(`/admin/collections/pages/${id}`)
      await openLivePreview(page)
      const frame = page.frameLocator('iframe')
      await expect(frame.locator('h1')).toHaveText('Podgląd E2E')
      const src = await page.locator('iframe').getAttribute('src')
      await page.locator('#field-layout__0__heading').fill('Podgląd na żywo E2E')
      await expect(frame.locator('h1')).toHaveText('Podgląd na żywo E2E', { timeout: 15_000 })
      expect(await page.locator('iframe').getAttribute('src')).toBe(src)
    } finally {
      await page.goto('/admin/login')
      expect((await api(page, 'DELETE', `/api/pages/${id}`)).status).toBe(200)
    }
  })
})

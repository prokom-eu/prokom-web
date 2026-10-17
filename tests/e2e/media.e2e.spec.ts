import { type Browser, expect, type Page, test } from '@playwright/test'
import sharp from 'sharp'

import { api, loginAsAdmin, site, tenantId } from './helpers'

// S7a acceptance: an image is served only on its own tenant's domain and never when it needs
// consent; a hero image and the partners block render through `next/image` with `alt`.

type Uploaded = { id: number; filename: string }

/** Multipart upload from inside the panel page (Payload REST: `file` + `_payload`). */
async function upload(page: Page, data: Record<string, unknown>): Promise<Uploaded> {
  const png = await sharp({
    create: { width: 1200, height: 600, channels: 3, background: { r: 200, g: 200, b: 200 } },
  })
    .png()
    .toBuffer()
  const name = `e2e-${Date.now()}.png`
  const result = await page.evaluate(
    async ({ base64, name, data }) => {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
      const form = new FormData()
      form.append('file', new File([bytes], name, { type: 'image/png' }))
      form.append('_payload', JSON.stringify(data))
      const response = await fetch('/api/media', { method: 'POST', body: form })
      return { status: response.status, json: (await response.json()) as Record<string, unknown> }
    },
    { base64: png.toString('base64'), name, data },
  )
  expect(result.status).toBe(201)
  return result.json.doc as Uploaded
}

/** Status of a GET in a fresh context: no panel session, like any visitor. */
async function anonymousStatus(browser: Browser, url: string): Promise<number | undefined> {
  const context = await browser.newContext()
  try {
    const response = await (await context.newPage()).goto(url)
    return response?.status()
  } finally {
    await context.close()
  }
}

test.describe('media and partners', () => {
  test('an image file is public only on its own domain and without consent flag', async ({
    page,
    browser,
  }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const image = await upload(page, { tenant: biznes, alt: 'Obraz E2E' })
    const consent = await upload(page, {
      tenant: biznes,
      alt: 'Logo klienta E2E',
      requiresConsent: true,
    })

    try {
      const file = (host: string, name: string) => site(host, `/api/media/file/${name}`)
      expect(await anonymousStatus(browser, file('biznes.localhost', image.filename))).toBe(200)
      // Another line's domain does not serve it.
      expect(await anonymousStatus(browser, file('software.localhost', image.filename))).not.toBe(
        200,
      )
      // Needs consent → not public anywhere.
      expect(await anonymousStatus(browser, file('biznes.localhost', consent.filename))).not.toBe(
        200,
      )
      // The rest of the upload API stays closed on a site domain.
      expect(await anonymousStatus(browser, site('biznes.localhost', '/api/media'))).toBe(404)
    } finally {
      await page.goto('/admin/login')
      await api(page, 'DELETE', `/api/media/${image.id}`)
      await api(page, 'DELETE', `/api/media/${consent.id}`)
    }
  })

  test('hero image and partner logos render with alt on the page', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const image = await upload(page, { tenant: biznes, alt: 'Stanowisko kasowe E2E' })
    const slug = `e2e-media-${Date.now()}`
    const created = await api(page, 'POST', '/api/pages', {
      tenant: biznes,
      title: `E2E ${slug}`,
      slug,
      layout: [
        { blockType: 'hero', heading: 'Obraz E2E', image: image.id },
        { blockType: 'partners', heading: 'Partnerzy E2E' },
      ],
      _status: 'published',
    })
    expect(created.status).toBe(201)
    const pageId = (created.json.doc as { id: number }).id

    try {
      const response = await page.goto(site('biznes.localhost', `/${slug}`))
      expect(response?.status()).toBe(200)

      const hero = page.getByRole('img', { name: 'Stanowisko kasowe E2E' })
      await expect(hero).toBeVisible()
      // Sizes made by Payload, not Next's optimizer.
      expect(await hero.getAttribute('srcset')).toMatch(/\/api\/media\/file\/.+\.webp/)
      expect(await hero.getAttribute('src')).not.toContain('/_next/image')
      expect(await hero.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)

      // Seed partner is shown on every line.
      await expect(page.getByRole('heading', { name: 'Partnerzy E2E' })).toBeVisible()
      await expect(page.getByRole('img', { name: 'Logo Partner przykładowy' })).toBeVisible()
    } finally {
      await page.goto('/admin/login')
      await api(page, 'DELETE', `/api/pages/${pageId}`)
      await api(page, 'DELETE', `/api/media/${image.id}`)
    }
  })

  test('a page cannot use an image of another line or one that needs consent', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const software = await tenantId(page, 'software')
    const foreign = await upload(page, { tenant: software, alt: 'Obraz Software E2E' })
    const consent = await upload(page, { tenant: biznes, alt: 'Zgoda E2E', requiresConsent: true })

    try {
      for (const image of [foreign, consent]) {
        const created = await api(page, 'POST', '/api/pages', {
          tenant: biznes,
          title: 'E2E obca grafika',
          slug: `e2e-foreign-${Date.now()}`,
          layout: [{ blockType: 'hero', heading: 'Obca grafika', image: image.id }],
          _status: 'published',
        })
        expect(created.status).toBe(400)
      }
    } finally {
      await api(page, 'DELETE', `/api/media/${foreign.id}`)
      await api(page, 'DELETE', `/api/media/${consent.id}`)
    }
  })
})

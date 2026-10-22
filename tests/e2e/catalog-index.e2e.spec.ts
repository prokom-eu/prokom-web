import { randomUUID } from 'node:crypto'
import { gzipSync } from 'node:zlib'

import { expect, type Page, test } from '@playwright/test'

import { api, loginAsAdmin, site, tenantId } from './helpers'

// B2 acceptance: `GET /api/catalog-index` serves the seeded catalog on the Biznes domain only,
// without hidden images or prices, and follows changes made in the panel right away.

type IndexProduct = { slug: string; image?: { url: string } }
type CatalogIndex = {
  products: IndexProduct[]
  categories: { slug: string; count: number }[]
  brands: unknown[]
}

/** The index as the server has it now — past the browser cache (`max-age=60`, by design). */
async function readIndex(page: Page): Promise<CatalogIndex> {
  const response = await page.goto(site('biznes.localhost', '/api/catalog-index'))
  expect(response?.status()).toBe(200)
  expect(response?.headers()['content-type']).toContain('application/json')
  return page.evaluate(async () => {
    const fresh = await fetch('/api/catalog-index', { cache: 'no-store' })
    return (await fresh.json()) as CatalogIndex
  })
}

test.describe('catalog index', () => {
  test('lists the seeded catalog on the Biznes domain', async ({ page }) => {
    const index = await readIndex(page)
    expect(index.products.length).toBeGreaterThanOrEqual(225)
    const jota = index.products.find((product) => product.slug === 'elzab-jota-online')
    // Katalog v2: the first gallery photo is the card photo.
    expect(jota?.image?.url).toMatch(/jota-01/)
    // Katalog v2: 23 categories, all with products (vending: 1).
    expect(index.categories.map((category) => category.slug)).toEqual(
      expect.arrayContaining([
        'wagi-sklepowe',
        'skanery-kolektory-etykiety',
        'automaty-vendingowe',
      ]),
    )
    // B2 acceptance: the whole index under 50 KB gzip.
    expect(gzipSync(JSON.stringify(index)).length).toBeLessThan(50 * 1024)
  })

  test('shows no client logo and no price', async ({ page }) => {
    const index = await readIndex(page)
    const text = JSON.stringify(index)
    expect(text).not.toContain('klient-')
    expect(text).not.toMatch(/"(price|cena|offers)"/i)
    // Every listed image is served on the Biznes domain.
    const withImage = index.products.find((product) => product.image)
    const image = await page.goto(site('biznes.localhost', withImage!.image!.url))
    expect(image?.status()).toBe(200)
  })

  for (const host of ['instalacje.localhost', 'software.localhost', 'panel.localhost']) {
    test(`is 404 on ${host}`, async ({ page }) => {
      const response = await page.goto(site(host, '/api/catalog-index'))
      expect(response?.status()).toBe(404)
      expect(await response!.text()).not.toContain('posnet-ergo-online')
    })
  }

  test('follows publishing and deleting a product', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const { json: categories } = await api(
      page,
      'GET',
      `/api/catalog-categories?where[tenant][equals]=${biznes}&where[slug][equals]=kasy-fiskalne&depth=0`,
    )
    const [category] = categories.docs as { id: number }[]
    const slug = `e2e-${randomUUID().slice(0, 8)}`
    const created = await api(page, 'POST', '/api/products', {
      tenant: biznes,
      name: `Produkt E2E ${slug}`,
      slug,
      kind: 'device',
      categories: [category!.id],
      _status: 'published',
    })
    expect(created.status).toBe(201)
    const id = (created.json.doc as { id: number }).id
    const panel = page.url()
    try {
      expect((await readIndex(page)).products.map((p) => p.slug)).toContain(slug)
    } finally {
      await page.goto(panel)
      expect((await api(page, 'DELETE', `/api/products/${id}`)).status).toBe(200)
    }
    expect((await readIndex(page)).products.map((p) => p.slug)).not.toContain(slug)
  })
})

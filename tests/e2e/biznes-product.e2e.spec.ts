import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { api, loginAsAdmin, site, tenantId } from './helpers'

// B6a: product page `/produkt/[slug]` (spec. §6.2). Catalog from `pnpm seed`.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const ERGO = '/produkt/posnet-ergo-online'

type JsonLd = { '@type'?: string; [key: string]: unknown }

test.describe('Biznes product page', () => {
  test('shows the product with breadcrumbs, canonical and JSON-LD without offers', async ({
    page,
  }) => {
    const response = await page.goto(site('biznes.localhost', ERGO))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Posnet Ergo Online')
    const crumbs = page.getByRole('navigation', { name: 'Okruszki' })
    await expect(crumbs.getByRole('link', { name: 'Kasy fiskalne' })).toHaveAttribute(
      'href',
      '/oferta?kategoria=kasy-fiskalne',
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      site('biznes.localhost', ERGO),
    )

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
    const data = scripts.map((text) => JSON.parse(text) as JsonLd)
    const product = data.find((item) => item['@type'] === 'Product')
    expect(product).toMatchObject({
      name: 'Posnet Ergo Online',
      brand: { '@type': 'Brand', name: 'Posnet' },
    })
    expect(JSON.stringify(product)).not.toMatch(/offers|price/i)
    const breadcrumbs = data.find((item) => item['@type'] === 'BreadcrumbList')
    // The category view has `noindex`: named, not linked, until B10 adds the category page.
    expect(breadcrumbs?.itemListElement).toEqual([
      expect.objectContaining({ position: 1, item: site('biznes.localhost', '/') }),
      expect.objectContaining({ position: 2, item: site('biznes.localhost', '/oferta') }),
      { '@type': 'ListItem', position: 3, name: 'Kasy fiskalne' },
      expect.objectContaining({ position: 4, item: site('biznes.localhost', ERGO) }),
    ])
  })

  test('switches photos and the inquiry switch updates the counter', async ({ page }) => {
    await page.goto(site('biznes.localhost', ERGO))
    const thumbs = page.getByRole('list', { name: 'Zdjęcia' }).getByRole('button')
    await expect(thumbs.first()).toHaveAttribute('aria-pressed', 'true')
    await thumbs.nth(1).click()
    await expect(thumbs.nth(1)).toHaveAttribute('aria-pressed', 'true')

    const add = page.getByRole('button', { name: 'Dodaj do zapytania: Posnet Ergo Online' })
    // The click works once the box is hydrated.
    await expect(async () => {
      await add.click({ timeout: 1000 })
      await expect(page.getByRole('button', { name: 'Na liście: Posnet Ergo Online' })).toBeVisible(
        { timeout: 1000 },
      )
    }).toPass()
    await expect(
      page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ }),
    ).toHaveAccessibleName('Zapytanie 1 pozycja')
  })

  test('a service without a photo still has a page, without WCAG violations', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/produkt/przeglad-kasy-fiskalnej'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Przegląd kasy fiskalnej')
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
    expect(results.violations).toEqual([])
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe without violations on a product with photos, ${theme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme })
      await page.goto(site('biznes.localhost', ERGO))
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(violations).toEqual([])
    })
  }

  test('unknown slug, malformed slug and another site answer 404', async ({ page }) => {
    for (const url of [
      site('biznes.localhost', '/produkt/nie-ma-takiego'),
      site('biznes.localhost', '/produkt/%20Zle'),
      site('instalacje.localhost', ERGO),
      site('software.localhost', ERGO),
    ]) {
      const response = await page.goto(url)
      expect(response?.status(), url).toBe(404)
    }
  })

  test('a draft product has no page and is not in the sitemap', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const { json } = await api(
      page,
      'GET',
      `/api/catalog-categories?where[slug][equals]=kasy-fiskalne&where[tenant][equals]=${biznes}&depth=0`,
    )
    const [category] = json.docs as { id: number }[]
    const slug = `e2e-szkic-produktu-${Date.now()}`
    const created = await api(page, 'POST', '/api/products?draft=true', {
      tenant: biznes,
      slug,
      name: 'Szkic produktu',
      kind: 'device',
      categories: [category!.id],
      _status: 'draft',
    })
    expect(created.status).toBe(201)
    try {
      const response = await page.goto(site('biznes.localhost', `/produkt/${slug}`))
      expect(response?.status()).toBe(404)
      const sitemap = await page.goto(site('biznes.localhost', '/sitemap.xml'))
      expect(await sitemap?.text()).not.toContain(slug)
    } finally {
      await page.goto('/admin/login')
      await api(page, 'DELETE', `/api/products/${(created.json.doc as { id: number }).id}`)
    }
  })

  test('the Biznes sitemap lists the catalog and products, other sites do not', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', '/sitemap.xml'))
    const biznes = await page.content()
    expect(biznes).toContain(site('biznes.localhost', '/oferta'))
    expect(biznes).toContain(site('biznes.localhost', ERGO))

    await page.goto(site('instalacje.localhost', '/sitemap.xml'))
    expect(await page.content()).not.toContain('/produkt/')
  })
})

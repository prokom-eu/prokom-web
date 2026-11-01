import { expect, test } from '@playwright/test'

import { api, loginAsAdmin, site, tenantId } from './helpers'

// B10a: category page `/oferta/[kategoria]` (spec. §6.1, board `Kategoria`). Catalog from
// `pnpm seed` (katalog v2): 11 cash registers — Elzab 5, Posnet 5, Fawag 1; register types only
// on the 7 from the board (Jota and Neo are „systemowa”).
const KASY = '/oferta/kasy-fiskalne'

type JsonLd = { '@type'?: string; [key: string]: unknown }

test.describe('Biznes category page', () => {
  test('shows the category with its grid, canonical and breadcrumbs JSON-LD', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', KASY))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Kasy fiskalne')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      site('biznes.localhost', KASY),
    )
    const grid = page.locator('[data-category-grid]')
    await expect(grid.getByRole('article')).toHaveCount(11)
    await expect(page.getByRole('status').filter({ hasText: 'pasuje' })).toHaveText('11 kas pasuje')
    // K4: „Nie wiesz, co wybrać?” in the side panel asks with the category's name (K36 §13).
    const panel = page.getByRole('complementary', { name: 'Filtry' })
    await expect(panel.getByRole('link', { name: 'Zapytaj o dobór' })).toHaveAttribute(
      'href',
      /^\/zapytanie\?fraza=Dob%C3%B3r%3A%20Kasy%20fiskalne/,
    )
    await expect(page.getByRole('navigation', { name: 'Okruszki' })).toHaveText(
      /^Start\s*\/\s*Oferta\s*\/\s*Kasy fiskalne$/,
    )

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
    const data = scripts.map((text) => JSON.parse(text) as JsonLd)
    const crumbs = data.find((item) => item['@type'] === 'BreadcrumbList')
    expect(crumbs?.itemListElement).toEqual([
      expect.objectContaining({ position: 1, item: site('biznes.localhost', '/') }),
      expect.objectContaining({ position: 2, item: site('biznes.localhost', '/oferta') }),
      expect.objectContaining({ position: 3, item: site('biznes.localhost', KASY) }),
    ])
    expect(JSON.stringify(data)).not.toMatch(/offers|price/i)
  })

  test('„Często dobierane razem” links the categories of the related products', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', KASY))
    const section = page.getByRole('region', { name: 'Często dobierane razem' })
    await expect(section.getByRole('link', { name: /Drukarki fiskalne/ })).toHaveAttribute(
      'href',
      '/oferta/drukarki-fiskalne',
    )
    await expect(section.getByRole('link')).toHaveCount(4)
  })

  test('the register picker and brand segments narrow the grid', async ({ page }) => {
    await page.goto(site('biznes.localhost', KASY))
    const grid = page.locator('[data-category-grid]')
    const big = page.getByRole('button', { name: /Sklep z dużą liczbą towarów/ })
    await big.click()
    await expect(big).toHaveAttribute('aria-pressed', 'true')
    await expect(grid.getByRole('article')).toHaveCount(2)

    await page.getByRole('group', { name: 'Marka' }).getByText('Elzab', { exact: true }).click()
    await expect(grid.getByRole('article')).toHaveCount(1)
    await expect(grid.getByRole('heading', { name: 'Elzab Jota Online' })).toBeVisible()

    // A second click clears the picker; the brand stays.
    await big.click()
    await expect(big).toHaveAttribute('aria-pressed', 'false')
    await expect(grid.getByRole('article')).toHaveCount(5)
  })

  test('„+ Do zapytania” on a category card counts in the header', async ({ page }) => {
    await page.goto(site('biznes.localhost', KASY))
    await page
      .locator('[data-category-grid]')
      .getByRole('button', { name: 'Do zapytania: Posnet Ergo Online' })
      .click()
    await expect(
      page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ }),
    ).toHaveAccessibleName('Zapytanie 1 pozycja')
  })

  test('no prices, leasing or instalments on the page', async ({ page }) => {
    await page.goto(site('biznes.localhost', KASY))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/leasing|\braty\b|\d+[,.]\d{2}\s*zł/i)
  })

  test('404 for an unknown slug, a category without products and on other domains', async ({
    page,
  }) => {
    for (const url of [
      site('biznes.localhost', '/oferta/nie-ma-takiej-kategorii'),
      site('instalacje.localhost', KASY),
      site('software.localhost', KASY),
    ]) {
      const response = await page.goto(url)
      expect(response?.status(), url).toBe(404)
    }

    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const groups = await api(
      page,
      'GET',
      `/api/catalog-groups?where[slug][equals]=sprzedaz&where[tenant][equals]=${biznes}&depth=0`,
    )
    const [group] = groups.json.docs as { id: number }[]
    const slug = `e2e-pusta-${Date.now()}`
    const created = await api(page, 'POST', '/api/catalog-categories', {
      tenant: biznes,
      name: 'Pusta kategoria',
      slug,
      group: group!.id,
    })
    expect(created.status).toBe(201)
    try {
      const response = await page.goto(site('biznes.localhost', `/oferta/${slug}`))
      expect(response?.status()).toBe(404)
      const sitemap = await page.goto(site('biznes.localhost', '/sitemap.xml'))
      const xml = (await sitemap?.text()) ?? ''
      expect(xml).toContain(site('biznes.localhost', KASY))
      expect(xml).not.toContain(slug)
    } finally {
      await page.goto('/admin/login')
      await api(
        page,
        'DELETE',
        `/api/catalog-categories/${(created.json.doc as { id: number }).id}`,
      )
    }
  })
})

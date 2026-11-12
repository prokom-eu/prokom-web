import { expect, test } from '@playwright/test'

import { site } from './helpers'

// BIZ-3 B5-2 (audit 0611 P1-8 – P1-10): titles 30–60 and descriptions 100–155 on every page type,
// BreadcrumbList where crumbs show, ItemList in categories, /konfigurator in the site maps.
const biznes = (path: string) => site('biznes.localhost', path)

const PAGES = [
  '/gopos',
  '/kontakt',
  '/o-firmie',
  '/opieka-it',
  '/ksef',
  '/oferta',
  '/oferta/laptopy',
  '/produkt/posnet-ergo-online',
  '/zestawy',
  '/zestawy/zestaw-biuro-3-5',
  '/marki/posnet',
  '/branze/gastronomia',
  '/aktualnosci',
  '/mapa-strony',
  '/konfigurator',
]

test.describe('Biznes SEO of subpages (B5-2)', () => {
  for (const path of PAGES) {
    test(`${path}: title 30–60, description 100–155`, async ({ page }) => {
      await page.goto(biznes(path))
      const title = await page.title()
      expect(title.length, title).toBeGreaterThanOrEqual(30)
      expect(title.length, title).toBeLessThanOrEqual(60)
      const description =
        (await page.locator('meta[name="description"]').getAttribute('content')) ?? ''
      expect(description.length, description).toBeGreaterThanOrEqual(100)
      expect(description.length, description).toBeLessThanOrEqual(155)
    })
  }

  test('BreadcrumbList on pages with crumbs, ItemList in a category', async ({ page }) => {
    for (const path of ['/gopos', '/ksef', '/kontakt', '/oferta', '/mapa-strony']) {
      await page.goto(biznes(path))
      const jsonLd = (
        await page.locator('script[type="application/ld+json"]').allTextContents()
      ).join('\n')
      expect(jsonLd, path).toContain('"@type":"BreadcrumbList"')
    }
    await page.goto(biznes('/oferta/laptopy'))
    const category = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).join('\n')
    expect(category).toContain('"@type":"ItemList"')
  })

  test('/konfigurator in sitemap.xml and /mapa-strony; og:image on /aktualnosci', async ({
    page,
  }) => {
    const xml = (await (await page.goto(biznes('/sitemap.xml')))?.text()) ?? ''
    expect(xml).toContain('/konfigurator</loc>')
    await page.goto(biznes('/mapa-strony'))
    await expect(page.locator('main a[href="/konfigurator"]')).toHaveCount(1)
    await page.goto(biznes('/aktualnosci'))
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1)
  })
})

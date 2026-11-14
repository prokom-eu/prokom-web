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

// Audit 14.11 P1-5: /marki/niszczarki had the title of /oferta/niszczarki. The sitemap lists only
// indexed pages, so every one of them needs its own title. Fetched in the page (the browser
// resolves `*.localhost`), a few at once.
test('every page of sitemap.xml has its own title', async ({ page }) => {
  test.setTimeout(240_000)
  const response = await page.goto(biznes('/sitemap.xml'))
  const xml = (await response?.text()) ?? ''
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]!).pathname,
  )
  expect(paths.length).toBeGreaterThan(100)
  const titles = await page.evaluate(async (list) => {
    const queue = [...list]
    const found: [string, string][] = []
    const worker = async () => {
      for (let path = queue.shift(); path; path = queue.shift()) {
        const html = await (await fetch(path)).text()
        const title = new DOMParser().parseFromString(html, 'text/html').title
        found.push([path, title])
      }
    }
    await Promise.all(Array.from({ length: 6 }, worker))
    return found
  }, paths)
  const byTitle = new Map<string, string[]>()
  for (const [path, title] of titles) byTitle.set(title, [...(byTitle.get(title) ?? []), path])
  const shared = [...byTitle.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([title, list]) => `${title}: ${list.sort().join(', ')}`)
  expect(shared).toEqual([])
})

// SEO lokalne 13.11: where we work in the titles, a Service on service pages, llms.txt for AI.
test.describe('Biznes local SEO', () => {
  for (const path of ['/oferta', '/marki', '/zestawy', '/marki/elzab', '/marki/godex']) {
    test(`${path}: the region in the title`, async ({ page }) => {
      await page.goto(biznes(path))
      expect(await page.title()).toMatch(/Rabka-Zdrój/)
    })
  }

  test('a service page names the region and og:title follows the title', async ({ page }) => {
    await page.goto(biznes('/opieka-it'))
    const title = await page.title()
    expect(title).toMatch(/Rabka-Zdrój|Podhal/)
    const og = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(title.startsWith(og ?? '-')).toBe(true)
  })

  test('a category title names the region', async ({ page }) => {
    await page.goto(biznes('/oferta/kasy-fiskalne'))
    expect(await page.title()).toMatch(/Rabka-Zdrój/)
  })

  test('a service page carries a Service with the area and no price', async ({ page }) => {
    await page.goto(biznes('/opieka-it'))
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    const service = blocks
      .map((text) => JSON.parse(text) as { '@type'?: string; areaServed?: { name: string }[] })
      .find((data) => data['@type'] === 'Service')
    expect(service?.areaServed?.map((area) => area.name)).toContain('Podhale')
    expect(JSON.stringify(service)).not.toMatch(/offers|price/i)
  })

  test('llms.txt sums up the company for AI assistants', async ({ request }) => {
    const response = await request.get(biznes('/llms.txt'))
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/plain')
    const text = await response.text()
    expect(text.startsWith('# PRO-KOM Biznes')).toBe(true)
    expect(text).toContain('/oferta/kasy-fiskalne')
    expect(text).toMatch(/Rabk/)
    expect(text).not.toMatch(/\d+\s?zł/)
  })
})

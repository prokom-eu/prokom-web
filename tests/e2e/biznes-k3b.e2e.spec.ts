import { gzipSync } from 'node:zlib'

import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// K3b′: brand pages, subcategory pages, the mega menu, the footer showrooms and the search with
// brands (K3-KATALOG §6, §9; spec. §6.11). Catalog from `pnpm seed` (K3 import).
const biznes = (path: string) => site('biznes.localhost', path)

const overlay = (page: Page) => page.getByRole('dialog', { name: 'Szukaj w ofercie' })
const field = (page: Page) => overlay(page).getByRole('searchbox', { name: 'Szukaj w ofercie' })

/** JSON-LD blocks of the page, flattened (a block may hold a list). */
async function jsonLd(page: Page): Promise<{ '@type': string; [key: string]: unknown }[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.flatMap((block) => JSON.parse(block))
}

test.describe('Biznes brand pages (K3b′)', () => {
  test('shows the brand, its facts and products, with Brand and BreadcrumbList', async ({
    page,
  }) => {
    const response = await page.goto(biznes('/marki/dibal'))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dibal w PRO-KOM')
    await expect(page.getByRole('heading', { name: 'Fakty' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'W katalogu' })).toBeVisible()
    await expect(page.locator('[data-category-grid] > li').first()).toBeVisible()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/marki\/dibal$/)
    const types = (await jsonLd(page)).map((item) => item['@type'])
    expect(types).toEqual(expect.arrayContaining(['Brand', 'BreadcrumbList']))
    const brand = (await jsonLd(page)).find((item) => item['@type'] === 'Brand')
    expect(brand).toMatchObject({ name: 'Dibal' })
  })

  test('has no page for a brand without one (Ingenico, PRO-KOM) or an unknown one', async ({
    page,
  }) => {
    for (const slug of ['ingenico', 'pro-kom', 'nie-ma-takiej']) {
      const response = await page.goto(biznes(`/marki/${slug}`))
      expect(response?.status(), slug).toBe(404)
    }
  })

  test('filters the products of a brand with several categories', async ({ page }) => {
    // Lenovo and Dell have a showroom instead (K31c): a template brand with categories.
    await page.goto(biznes('/marki/elzab'))
    const segments = page.getByRole('group', { name: 'Kategoria' })
    await expect(segments).toBeVisible()
    const all = await page.locator('[data-category-grid] > li').count()
    await segments.locator('label').nth(2).click()
    await expect.poll(() => page.locator('[data-category-grid] > li').count()).toBeLessThan(all)
  })

  test('the product hero links the brand page', async ({ page }) => {
    await page.goto(biznes('/produkt/lenovo-thinkbook-14-g8-g9'))
    await page.locator('main a[href="/marki/lenovo"]').first().click()
    await expect(page).toHaveURL(biznes('/marki/lenovo'))
  })

  // The K4 footer has no showroom links (K36 §1); the showrooms are on /marki (K4f).
})

test.describe('Biznes subcategory pages (K3b′)', () => {
  test('a subcategory has its own H1, canonical and only its products', async ({ page }) => {
    const response = await page.goto(biznes('/oferta/serwery-nas-ups/ups'))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Zasilacze UPS dla firm/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/oferta\/serwery-nas-ups\/ups$/,
    )
    const nav = page.getByRole('navigation', { name: 'Podkategorie' })
    await expect(nav.getByRole('link', { name: /^Zasilacze UPS/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
    const names = await page.locator('[data-category-grid] h3').allTextContents()
    expect(names.length).toBeGreaterThan(0)
    expect(names.join(' ')).not.toMatch(/Synology|QNAP|PowerEdge/i)
  })

  test('the category page links its subcategories', async ({ page }) => {
    await page.goto(biznes('/oferta/serwery-nas-ups'))
    const nav = page.getByRole('navigation', { name: 'Podkategorie' })
    await nav.getByRole('link', { name: /^Serwery plików NAS/ }).click()
    await expect(page).toHaveURL(biznes('/oferta/serwery-nas-ups/nas'))
  })

  test('a chip without an address shows as many products as it counts', async ({ page }) => {
    await page.goto(biznes('/oferta/akcesoria-pos'))
    const chips = page.getByRole('group', { name: 'Podkategoria' })
    const chip = chips.locator('label').filter({ hasText: 'Szuflady kasowe' })
    const count = Number(await chip.locator('span').innerText())
    await chip.click()
    await expect(page.getByRole('status').filter({ hasText: /pozycj/ })).toContainText(
      String(count),
    )
    await expect(page.locator('[data-category-grid] > li h3 a')).toHaveCount(count)
  })

  test('a subcategory without an address or in another category is 404', async ({ page }) => {
    for (const path of ['/oferta/akcesoria-pos/szuflady-kasowe', '/oferta/kasy-fiskalne/ups']) {
      const response = await page.goto(biznes(path))
      expect(response?.status(), path).toBe(404)
    }
  })

  // The K4 mega menu lists categories only (v147c); subcategory pages hang off their category.
  test('the category page links its subcategory pages', async ({ page }) => {
    await page.goto(biznes('/oferta/serwery-nas-ups'))
    await expect(page.locator('main a[href="/oferta/serwery-nas-ups/ups"]').first()).toBeVisible()
  })

  test('the site map lists brand and subcategory pages', async ({ page }) => {
    // `page.goto`: the API request context does not resolve `*.localhost` (as in seo.e2e).
    const xml = (await (await page.goto(biznes('/sitemap.xml')))?.text()) ?? ''
    expect(xml).toContain('/marki/lenovo</loc>')
    expect(xml).toContain('/oferta/laptopy</loc>')
    expect(xml).toContain('/oferta/serwery-nas-ups/ups</loc>')
    expect(xml).not.toContain('/oferta/komputery-monitory')
    expect(xml).not.toContain('/marki/ingenico</loc>')
  })
})

test.describe('Biznes search with brands (K3b′)', () => {
  test('„laptop” finds laptops and „lenovo” the brand page', async ({ page }) => {
    await page.goto(biznes('/'))
    await expect(async () => {
      await page.keyboard.press('/')
      await expect(overlay(page)).toBeVisible({ timeout: 1000 })
    }).toPass()
    await field(page).fill('laptop')
    await expect(
      overlay(page)
        .getByRole('link', { name: /ThinkBook|Latitude|ThinkPad/ })
        .first(),
    ).toBeVisible()
    await field(page).fill('lenovo')
    await expect(overlay(page).getByRole('link', { name: 'Lenovo w PRO-KOM' })).toHaveAttribute(
      'href',
      '/marki/lenovo',
    )
  })

  test('a model code finds its multi-model card (spec. §8.2)', async ({ page }) => {
    await page.goto(biznes('/'))
    await expect(async () => {
      await page.keyboard.press('/')
      await expect(overlay(page)).toBeVisible({ timeout: 1000 })
    }).toPass()
    for (const [code, name] of [
      ['U2724D', /Dell/],
      ['C301i', /bizhub C301i/],
    ] as const) {
      await field(page).fill(code)
      await expect(overlay(page).locator('a[href^="/produkt/"]').first(), code).toContainText(name)
    }
  })

  // 80 KB since K4a-1b-2 (~430 cards, 74 KB); see catalog-index.e2e.
  test('the catalog index stays under 80 KB gzip', async ({ page }) => {
    const response = await page.goto(biznes('/api/catalog-index'))
    expect(response?.status()).toBe(200)
    const body = (await response?.body()) ?? Buffer.alloc(0)
    expect(gzipSync(body).length).toBeLessThan(80 * 1024)
  })
})

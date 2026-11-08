import { expect, test } from '@playwright/test'

import { api, hydrated, loginAsAdmin, site, tenantId } from './helpers'

// K3c: ready bundles (`/zestawy`, `/zestawy/[slug]`), K3-KATALOG §7, spec. §6.10. Bundles from
// `pnpm seed` (`seed:biznes`): 23, of them 19 „Gotowe” (BIZ-3 B4-1, `docs/zadania/zestawy-zgodnosci.md`).
const biznesUrl = (path: string) => site('biznes.localhost', path)
const KAWIARNIA = '/zestawy/zestaw-kawiarnia-lada'

test.describe('Biznes ready bundles (K3c)', () => {
  test('lists the „Gotowe” bundles only and filters them by area and size', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const found = await api(
      page,
      'GET',
      `/api/bundles?where[tenant][equals]=${biznes}&where[contentStatus][equals]=ready&depth=0&limit=0`,
    )
    const ready = (found.json as { totalDocs: number }).totalDocs
    const response = await page.goto(biznesUrl('/zestawy'))
    expect(response?.status()).toBe(200)
    const areas = page.getByRole('group', { name: 'Obszar' })
    const cards = page.locator('main ul:has(a[href^="/zestawy/"]) > li')
    await expect(areas.getByRole('button', { name: /^Wszystkie/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    // BIZ-3 §9.2: the cards are the „Gotowe” bundles of the database, none „Do sprawdzenia”.
    await expect(cards).toHaveCount(ready)
    await expect(page.locator('a[href="/zestawy/zestaw-sklep-spozywczy-market-pos"]')).toHaveCount(
      0,
    )
    await areas.getByRole('button', { name: /^Gastronomia/ }).click()
    await expect(cards.filter({ hasText: 'Kawiarnia' })).toHaveCount(1)
    await page
      .getByRole('group', { name: 'Wielkość firmy' })
      .getByRole('button', { name: 'Duży' })
      .click()
    await expect(cards).toHaveCount(1)
    await expect(cards.first()).toContainText('Restauracja')
  })

  test('„Dodaj zestaw do zapytania” on the tile puts the required items on the list', async ({
    page,
  }) => {
    await page.goto(biznesUrl('/zestawy'))
    await page.evaluate(() => localStorage.removeItem('pk-cart'))
    await page.reload()
    const tile = page.locator('article').filter({ hasText: 'Kawiarnia' })
    const add = tile.getByRole('button', { name: 'Dodaj zestaw do zapytania' })
    await hydrated(add)
    await add.click()
    await expect(tile.getByRole('button', { name: 'W zapytaniu' })).toBeVisible()
    const cart = await page.evaluate(
      () => JSON.parse(localStorage.getItem('pk-cart') ?? '[]') as { uwaga?: string }[],
    )
    expect(cart).toHaveLength(5)
    for (const item of cart) expect(item.uwaga).toMatch(/^Zestaw: Kawiarnia — /)
  })

  test('/zestawy and every bundle fit 360 and 390 px without sideways scroll', async ({ page }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(biznesUrl('/zestawy'))
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `/zestawy ${width}px`).toBeLessThanOrEqual(0)
    }
  })

  test('„Zapytaj o ten zestaw” lists the 5 required items and a ticked optional one', async ({
    page,
  }) => {
    await page.goto(biznesUrl(KAWIARNIA))
    await page.evaluate(() => localStorage.removeItem('pk-cart'))
    await page.reload()
    // „Gotowe” after the compatibility check (BIZ-3 B4-1): in the index.
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    const card = page.locator('#twoj-zestaw')
    await expect(card.getByRole('button', { name: /Zapytaj o ten zestaw · 5 poz\./ })).toBeVisible()

    await page.getByRole('checkbox').first().check()
    await card.getByRole('button', { name: /Zapytaj o ten zestaw · 6 poz\./ }).click()
    await expect(card.getByRole('button', { name: 'Zestaw jest w zapytaniu' })).toBeVisible()

    const cart = await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('pk-cart') ?? '[]') as {
          id: string
          q: number
          uwaga?: string
        }[],
    )
    expect(cart).toHaveLength(6)
    for (const item of cart) expect(item.uwaga).toMatch(/^Zestaw: Kawiarnia — /)
    expect(cart[0]?.uwaga).toContain('wersja: D3 PRO')
    // K4 dropped the router (`ux`) from this kit: the first optional item is the UPS (K4a-2).
    expect(cart.at(-1)?.id).toBe('apc-back-ups')
    // Never a price on the page.
    expect(await page.locator('main').innerText()).not.toMatch(/\d+[,.]\d{2}\s*zł|\d\s*zł\b/)
  })

  test('a bundle page links the official sources of its pairs („Źródło ↗”)', async ({ page }) => {
    await page.goto(biznesUrl('/zestawy/zestaw-biuro-3-5'))
    const sources = page.getByRole('region', { name: 'Sprawdzone zgodności' })
    const links = sources.getByRole('link', { name: /Źródło/ })
    expect(await links.count()).toBeGreaterThan(0)
    await expect(links.first()).toHaveAttribute('href', /^https:\/\//)
    const box = await links.first().boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24)
  })

  test('a „Gotowe” bundle has JSON-LD ItemList without offers and FAQPage', async ({ page }) => {
    await page.goto(biznesUrl('/zestawy/zestaw-wifi-omada'))
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    const jsonLd = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).join('\n')
    expect(jsonLd).toContain('"@type":"ItemList"')
    expect(jsonLd).toContain('"@type":"FAQPage"')
    expect(jsonLd).not.toContain('offers')
  })

  test('sitemap lists /zestawy and „Gotowe” bundles only', async ({ page }) => {
    const xml = (await (await page.goto(biznesUrl('/sitemap.xml')))?.text()) ?? ''
    expect(xml).toContain('/zestawy</loc>')
    expect(xml).toContain('/zestawy/zestaw-wifi-omada</loc>')
    expect(xml).toContain('/zestawy/zestaw-kawiarnia-lada</loc>')
    // Hidden until Insoft answers (STAN, plan §13 #11).
    expect(xml).not.toContain('/zestawy/zestaw-sklep-spozywczy-market-pos</loc>')
  })

  test('the product page shows „W zestawach”, at most 3', async ({ page }) => {
    await page.goto(biznesUrl('/produkt/sunmi-d3-pro'))
    const section = page.locator('#zestawy')
    await expect(section.getByRole('heading', { name: 'W zestawach' })).toBeVisible()
    const links = section.locator('a[href^="/zestawy/"]')
    expect(await links.count()).toBeGreaterThan(0)
    expect(await links.count()).toBeLessThanOrEqual(3)
  })

  test('an unknown bundle answers 404', async ({ page }) => {
    const response = await page.goto(biznesUrl('/zestawy/nie-ma-takiego'))
    expect(response?.status()).toBe(404)
  })
})

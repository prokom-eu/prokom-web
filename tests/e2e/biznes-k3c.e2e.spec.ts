import { expect, test } from '@playwright/test'

import { site } from './helpers'

// K3c: ready bundles (`/zestawy`, `/zestawy/[slug]`), K3-KATALOG §7, spec. §6.10. Bundles from
// `pnpm seed` (`seed:biznes`): 23, of them 3 „Gotowe”.
const biznes = (path: string) => site('biznes.localhost', path)
const KAWIARNIA = '/zestawy/zestaw-kawiarnia-lada'

test.describe('Biznes ready bundles (K3c)', () => {
  test('lists the bundles and filters them by area', async ({ page }) => {
    const response = await page.goto(biznes('/zestawy'))
    expect(response?.status()).toBe(200)
    const areas = page.getByRole('group', { name: 'Obszar' })
    const cards = page.locator('main ul:has(a[href^="/zestawy/"]) > li')
    await expect(areas.getByRole('button', { name: /^Wszystkie/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const all = await cards.count()
    expect(all).toBeGreaterThanOrEqual(20)
    await areas.getByRole('button', { name: /^Gastronomia/ }).click()
    await expect.poll(() => cards.count()).toBe(5)
    await expect(cards.filter({ hasText: 'Kawiarnia' })).toHaveCount(1)
  })

  test('„Zapytaj o ten zestaw” lists the 5 required items and a ticked optional one', async ({
    page,
  }) => {
    await page.goto(biznes(KAWIARNIA))
    await page.evaluate(() => localStorage.removeItem('pk-cart'))
    await page.reload()
    // „Do sprawdzenia”: shown, but out of the index (K3-KATALOG §7).
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
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
    // `ux` of the K3 kit is the K4 card since K4a-1b (mapa-slugow-k4.json).
    expect(cart.at(-1)?.id).toBe('ubiquiti-unifi-express-7')
    // Never a price on the page.
    expect(await page.locator('main').innerText()).not.toMatch(/\d+[,.]\d{2}\s*zł|\d\s*zł\b/)
  })

  test('a „Gotowe” bundle has JSON-LD ItemList without offers and FAQPage', async ({ page }) => {
    await page.goto(biznes('/zestawy/zestaw-wifi-omada'))
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    const jsonLd = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).join('\n')
    expect(jsonLd).toContain('"@type":"ItemList"')
    expect(jsonLd).toContain('"@type":"FAQPage"')
    expect(jsonLd).not.toContain('offers')
  })

  test('sitemap lists /zestawy and „Gotowe” bundles only', async ({ page }) => {
    const xml = (await (await page.goto(biznes('/sitemap.xml')))?.text()) ?? ''
    expect(xml).toContain('/zestawy</loc>')
    expect(xml).toContain('/zestawy/zestaw-wifi-omada</loc>')
    expect(xml).not.toContain('/zestawy/zestaw-kawiarnia-lada</loc>')
  })

  test('the product page shows „W zestawach”, at most 3', async ({ page }) => {
    await page.goto(biznes('/produkt/sunmi-d3-pro'))
    const section = page.locator('#zestawy')
    await expect(section.getByRole('heading', { name: 'W zestawach' })).toBeVisible()
    const links = section.locator('a[href^="/zestawy/"]')
    expect(await links.count()).toBeGreaterThan(0)
    expect(await links.count()).toBeLessThanOrEqual(3)
  })

  test('an unknown bundle answers 404', async ({ page }) => {
    const response = await page.goto(biznes('/zestawy/nie-ma-takiego'))
    expect(response?.status()).toBe(404)
  })
})

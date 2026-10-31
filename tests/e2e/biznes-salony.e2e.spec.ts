import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// K4f: salon 2.0 `/marki/[slug]` (K4-FINAL §6) — one template driven by `Showrooms`; a block
// without data has no section. Salons from `pnpm seed` (K4a-2).
const biznes = (path: string) => site('biznes.localhost', path)

const cartButton = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ })

/** JSON-LD blocks of the page, flattened (a block may hold a list). */
async function jsonLdTypes(page: Page): Promise<string[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.flatMap((block) => JSON.parse(block)).map((item) => item['@type'])
}

test.describe('Biznes salon 2.0 (K4f)', () => {
  test('Posnet: hero, models with the table, service, FAQ and JSON-LD', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const response = await page.goto(biznes('/marki/posnet'))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Kasy i\s+drukarki Posnet/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/marki\/posnet$/)
    await expect(page.getByRole('heading', { level: 2, name: 'Która kasa Posnet?' })).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
    await page.getByRole('button', { name: 'Zwiń tabelę' }).click()
    await expect(page.getByRole('table')).toBeHidden()
    await expect(
      page.getByRole('heading', { level: 2, name: /^Autoryzowany serwis/ }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Zanim wybierzesz Posnet' }),
    ).toBeVisible()
    expect(await jsonLdTypes(page)).toEqual(
      expect.arrayContaining(['Brand', 'FAQPage', 'BreadcrumbList']),
    )
  })

  test('„Zapytaj” on a model adds it to the inquiry with the model as a note', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(biznes('/marki/posnet'))
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 0 pozycji')
    // The click works once the page is hydrated.
    await expect(async () => {
      await page.locator('#oferta').getByRole('button', { name: 'Zapytaj' }).first().click()
      await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 1 pozycja', { timeout: 1000 })
    }).toPass()
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('pk-cart') ?? '[]'))
    expect(cart[0].uwaga).toMatch(/^Posnet — /)
  })

  test('„Pomóż mi wybrać” changes the hint with the answer', async ({ page }) => {
    await page.goto(biznes('/marki/posnet'))
    const chooser = page.locator('#dobor')
    const hint = chooser.locator('[aria-live]')
    const first = await hint.innerText()
    await expect(async () => {
      await chooser.getByRole('radio').nth(1).check()
      expect(await hint.innerText()).not.toBe(first)
    }).toPass()
  })

  test('a theme salon: two brands, neutral headings; a brand of it redirects there', async ({
    page,
  }) => {
    await page.goto(biznes('/marki/kyocera'))
    await expect(page).toHaveURL(biznes('/marki/druk'))
    const hero = page.locator('section[aria-labelledby="salon-h1"]')
    await expect(hero.getByRole('img', { name: 'Kyocera', exact: true })).toBeVisible()
    await expect(hero.getByRole('img', { name: 'Konica Minolta', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Najczęstsze pytania' })).toBeVisible()
  })

  test('a salon without „Pomóż mi wybrać” asks for an offer in the hero (ESET)', async ({
    page,
  }) => {
    await page.goto(biznes('/marki/eset'))
    await expect(page.locator('#dobor')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Zapytaj o ofertę' })).toHaveAttribute(
      'href',
      '#sl-ask',
    )
  })

  test('a brand without a salon keeps the brand page; an unknown slug is 404', async ({ page }) => {
    await page.goto(biznes('/marki/dibal'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dibal w PRO-KOM')
    const missing = await page.goto(biznes('/marki/nie-ma-takiej-marki'))
    expect(missing?.status()).toBe(404)
  })

  test('has no horizontal scroll at 390 px; models are a carousel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(biznes('/marki/posnet'))
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }))
    expect(scrollWidth).toBe(innerWidth)
    const list = page.locator('#oferta ul').first()
    expect(await list.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true)
  })
})

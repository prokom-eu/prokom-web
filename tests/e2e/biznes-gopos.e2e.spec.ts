import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// K4h: `/gopos` of the Biznes line from K4 sections (K32 §3, plansza Web-GoPOS): hero with the
// stage of devices and the 4-step flow, „Twój lokal”, areas, GoHub, the package configurator,
// films behind a facade, FAQ. Axe at 360 px in `a11y`.

const cartButton = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ })

test.describe('Biznes /gopos (K4h)', () => {
  test('shows the hero, the venues, the package and the FAQ', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('Sala, kuchnia i dowozy.')
    await expect(page.getByRole('navigation', { name: 'Okruszki' })).toHaveText(
      /Strona główna\s*\/\s*Oferta\s*\/\s*GoPOS/,
    )
    await expect(page.getByText('Autoryzowany partner GoPOS')).toBeVisible()
    await expect(page.locator('#lokal').getByRole('tab')).toHaveCount(5)
    await expect(page.locator('#pakiet')).toContainText('bez cen — wycena na piśmie')
    await expect(page.locator('#faq details')).toHaveCount(8)
    // No YouTube request before „▶” (ADR-016).
    await expect(page.locator('#film-gopos iframe')).toHaveCount(0)
  })

  test('clicking „Kuchnia” lights the KDS screen up', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    const hero = page.locator('section[aria-labelledby="gopos-h"]')
    await hero.getByRole('button', { name: /Kuchnia.*Od razu na ekranie/ }).click()
    await expect(hero.getByRole('button', { name: /^Kuchnia — / })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(hero.getByRole('button', { name: /^Sala — / })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  test('a package of 3 modules gives 3 positions with the note', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 0 pozycji')

    // „Food truck i sezon” starts with GoPOS + the number system; KDS makes it three.
    await page.locator('#lokal').getByRole('tab', { name: 'Food truck i sezon' }).click()
    const pack = page.locator('#pakiet')
    await pack.getByRole('button', { name: /^✓?\s*KDS/ }).click()
    await expect(
      pack.getByRole('complementary', { name: 'Twój pakiet GoPOS' }).locator('dd'),
    ).toHaveCount(3)

    await pack.getByRole('button', { name: 'Zapytaj o ten pakiet' }).click()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 3 pozycje')
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('pk-cart') ?? '[]'))
    expect(cart.map((item: { uwaga?: string }) => item.uwaga)).toEqual([
      'Pakiet GoPOS',
      'Pakiet GoPOS',
      'Pakiet GoPOS',
    ])
  })

  test('„Dodaj GoHub do pakietu” marks GoHub in the package', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    await page.locator('#lokal').getByRole('tab', { name: 'Kawiarnia' }).click()
    const hub = page.getByRole('button', { name: 'Dodaj GoHub do pakietu' })
    await hub.click()
    await expect(page.getByRole('button', { name: 'GoHub jest w pakiecie ✓' })).toBeVisible()
    await expect(
      page.locator('#pakiet').getByRole('complementary', { name: 'Twój pakiet GoPOS' }),
    ).toContainText('GoHub')
  })

  test('no prices, leasing or instalments on the page', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/leasing|\braty\b|\d+[,.]\d{2}\s*zł|\bAut\./i)
  })

  test('no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(site('biznes.localhost', '/gopos'))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('the page belongs to the Biznes line only', async ({ page }) => {
    const response = await page.goto(site('instalacje.localhost', '/gopos'))
    expect(response?.status()).toBe(404)
  })
})

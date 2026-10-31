import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// B9b: `/gopos` of the Biznes line from its own blocks (spec. §6.5, plansza Gopos): navy hero
// over a photo (partner figures only with a source — the seed has none), the module explorer
// (ARIA tabs), one order in four steps, three kits added to the inquiry list at once, the steps,
// two panels, the FAQ and the v20 form. Axe at 360 px in `a11y`.

const cartButton = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ })

test.describe('Biznes /gopos (B9b)', () => {
  test('shows the hero, the explorer, the kits, the FAQ and the form', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('GoPOS w Twoim lokalu.')
    await expect(page.getByRole('navigation', { name: 'Okruszki' })).toHaveText(
      /Strona główna\s*\/\s*Oferta\s*\/\s*GoPOS/,
    )
    // No source in the panel → no partner figures (plan §4).
    await expect(page.locator('main')).not.toContainText(/6000\+|14 dni/)

    await expect(page.locator('#jak-to-dziala')).toContainText('Restauracja, która nie gubi')
    await expect(page.locator('#zestawy').getByRole('heading', { level: 3 })).toHaveText([
      'Kawiarnia, food truck',
      'Restauracja',
      'Fast food, samoobsługa',
    ])
    await expect(page.locator('#faq details')).toHaveCount(6)
    await expect(page.locator('#kontakt form')).toBeVisible()
  })

  test('the explorer switches modules with a click and the arrow keys', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    const tabs = page.getByRole('tablist', { name: 'Moduły' }).getByRole('tab')
    await expect(tabs).toHaveCount(8)
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tabpanel')).toContainText('Plan sali i stolików')

    await page.getByRole('tab', { name: /Dowozy GoHub/ }).click()
    await expect(page.getByRole('tabpanel')).toContainText('Jedna kolejka na kuchni')

    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('tab', { name: /E-Menu QR/ })).toBeFocused()
    await expect(page.getByRole('tabpanel')).toContainText('Kod QR na stoliku')
    await page.keyboard.press('Home')
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
  })

  test('„Dodaj zestaw do zapytania” puts the whole kit on the list', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 0 pozycji')

    const add = page
      .locator('#zestawy > div > ul > li')
      .filter({ has: page.getByRole('heading', { name: 'Restauracja', exact: true }) })
      .getByRole('button')
    await expect(add).toHaveText('Dodaj zestaw do zapytania (7)')
    await add.click()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 7 pozycji')
    await expect(add).toContainText('Zestaw jest w zapytaniu')

    // The café kit shares GoPOS and the terminal: only the 2 new products are added.
    const cafe = page
      .locator('#zestawy > div > ul > li')
      .filter({ has: page.getByRole('heading', { name: 'Kawiarnia, food truck' }) })
      .getByRole('button')
    await cafe.click()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 9 pozycji')
  })

  test('no prices, leasing or instalments on the page', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/leasing|\braty\b|\d+[,.]\d{2}\s*zł/i)
  })

  test('the page belongs to the Biznes line only', async ({ page }) => {
    const response = await page.goto(site('instalacje.localhost', '/gopos'))
    expect(response?.status()).toBe(404)
  })
})

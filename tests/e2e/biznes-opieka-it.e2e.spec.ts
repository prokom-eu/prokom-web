import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// K4i: `/opieka-it` from K4 sections (K34 §6, K35 §0, plansza Web-Opieka): hero with the sample
// IT review report, areas as tabs, „Z opieką i bez”, the steps switch, FAQ and „Ile masz
// stanowisk?”. No price model, no downtime calculator (K4-FINAL §1). Axe in `a11y`.

const cartButton = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ })

test.describe('Biznes /opieka-it (K4i)', () => {
  test('shows the hero with the report, the areas, the steps and the FAQ', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/opieka-it'))

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('pod jedną opieką')
    await expect(page.getByRole('figure', { name: 'Raport z przeglądu IT' })).toBeVisible()
    await expect(page.locator('#zakres').getByRole('tab')).toHaveCount(8)
    await expect(page.locator('#faq details')).toHaveCount(8)
  })

  test('the areas switch with a click and the arrow keys', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/opieka-it'))
    const tabs = page.locator('#zakres').getByRole('tab')
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
    await tabs.nth(2).click()
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('ArrowDown')
    await expect(tabs.nth(3)).toBeFocused()
    await page.keyboard.press('Home')
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
  })

  test('„Gdy coś się dzieje” shows the other steps', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/opieka-it'))
    await page.getByRole('button', { name: 'Gdy coś się dzieje' }).click()
    await expect(page.getByText('Diagnoza zdalna')).toBeVisible()
  })

  test('„Umów bezpłatny przegląd IT” lists the free review', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/opieka-it'))
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 0 pozycji')
    await page.getByRole('button', { name: 'Umów bezpłatny przegląd IT' }).first().click()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 1 pozycja')
  })

  test('the number of seats goes into the note of the inquiry', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/opieka-it'))
    await page.getByRole('button', { name: '4–10', exact: true }).click()
    await page.getByRole('button', { name: /^Zapytaj o opiekę · stanowiska: 4–10/ }).click()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 1 pozycja')
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('pk-cart') ?? '[]'))
    expect(cart.map((item: { uwaga?: string }) => item.uwaga)).toEqual(['Stanowiska: 4–10'])
  })

  test('no prices, no price model and no calculator (K4-FINAL §1)', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/opieka-it'))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/leasing|\braty\b|\d\s?zł|\bAut\./i)
    expect(text).not.toMatch(/abonament|stała opłata|przestoju/i)
  })

  test('no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(site('biznes.localhost', '/opieka-it'))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('the page belongs to the Biznes line only', async ({ page }) => {
    const response = await page.goto(site('instalacje.localhost', '/opieka-it'))
    expect(response?.status()).toBe(404)
  })
})

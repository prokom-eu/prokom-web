import { expect, test } from '@playwright/test'

import { site } from './helpers'

// K4i: `/o-firmie` from K4 sections (K34 §7, plansza Web-OFirmie): hero with the business card
// from the panel and four authorizations, „Nie musisz wierzyć nam na słowo”, the principles,
// four lines (decyzja Krystiana 01.11), brands, „Gdzie nas znaleźć”, the band.
const ABOUT = '/o-firmie'

test.describe('Biznes about page (K4i)', () => {
  test('shows the hero, the card from the panel, the principles, lines and brands', async ({
    page,
  }) => {
    const response = await page.goto(site('biznes.localhost', ABOUT))
    expect(response?.status()).toBe(200)

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('PRO-KOM z Rabki-Zdroju')
    await expect(
      page.getByRole('navigation', { name: 'Okruszki' }).locator('[aria-current="page"]'),
    ).toHaveText('O firmie')
    await expect(page.getByText('100+')).toBeVisible()
    // In the page content: the phone menu (closed) shows partner statuses too (M1′).
    const main = page.locator('main')
    await expect(main.getByText('Autoryzowany serwis').first()).toBeVisible()
    await expect(main.getByText('Autoryzowany partner').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /CEIDG/ }).first()).toHaveAttribute(
      'href',
      /biznes\.gov\.pl/,
    )

    await expect(page.locator('#zasady li')).toHaveCount(8)
    const lines = page.locator('#linie')
    await expect(lines.getByRole('heading', { level: 2 })).toHaveText('Jedna firma, cztery linie.')
    await expect(lines.getByText('Jesteś tutaj')).toHaveCount(1)

    const brands = page.getByRole('region', {
      name: 'Marki, które sprzedajemy, wdrażamy i serwisujemy',
    })
    await expect(brands).toContainText('Pozostałe marki w ofercie')

    // Address and phone from the panel, Google Maps as links (no iframe).
    const location = page.locator('section[aria-labelledby^="lokalizacja"]')
    await expect(location.locator('a[href^="tel:"]').first()).toBeVisible()
    await expect(page.locator('iframe')).toHaveCount(0)
  })

  test('no prices, „Aut.” or another e-mail than the line inbox', async ({ page }) => {
    await page.goto(site('biznes.localhost', ABOUT))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/leasing|\braty\b|\d\s?zł|\bAut\./i)
    const emails = text.match(/[\w.+-]+@[\w.-]+\.\w+/g) ?? []
    expect(emails.every((email) => email === 'kontakt@prokombiznes.pl')).toBe(true)
  })

  test('no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(site('biznes.localhost', ABOUT))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})

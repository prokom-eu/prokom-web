import { expect, test, type Page } from '@playwright/test'

import { forbiddenContent } from '../../src/lib/catalog/contentRules'
import { site } from './helpers'

// K4h: `/insert` of the Biznes line from K4 sections (K33 §7, K34 §5, plansza Web-InsERT): hero
// with the program boxes, „Który Subiekt”, the comparison, KSeF with a day counter, the
// InsPunkty calculator, the whole offer, requirements, films, FAQ. Axe in `a11y`.

const cartButton = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ })

test.describe('Biznes /insert (K4h)', () => {
  test('shows the hero, the picker, KSeF, InsPunkty and the FAQ', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/insert'))

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('Programy InsERT dobrane do firmy.')
    await expect(page.getByRole('navigation', { name: 'Okruszki' })).toHaveText(
      /Strona główna\s*\/\s*Oferta\s*\/\s*InsERT/,
    )
    await expect(page.locator('#ktory')).toBeVisible()
    await expect(page.locator('#ksef')).toContainText('dni do 1 stycznia 2027')
    await expect(page.locator('#inspunkty')).toBeVisible()
    await expect(page.locator('#faq details')).toHaveCount(7)
  })

  test('„Który Subiekt”: three combinations give 123, GT and nexo', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/insert'))
    const picker = page.locator('#ktory')
    const result = picker.getByTestId('subiekt-result')
    await expect(result).toContainText('nexo')

    await picker.getByRole('button', { name: 'W przeglądarce, bez instalacji' }).click()
    await expect(result).toContainText('123')

    await picker.getByRole('button', { name: 'Na komputerach w firmie' }).click()
    await picker.getByRole('button', { name: 'Tak', exact: true }).click()
    await expect(result).toContainText('GT')

    await expect(cartButton(page)).toHaveAccessibleName(/^Zapytanie 0 pozycji$/)
    await result.getByRole('button', { name: 'Dodaj do zapytania' }).click()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 1 pozycja')
  })

  test('InsPunkty: 40 + 30 → 70 a month and 840 a year', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/insert'))
    const points = page.locator('#inspunkty')
    await expect(points.getByTestId('inspunkty-month')).toHaveText('70 InsPunktów')
    await expect(points.getByTestId('inspunkty-year')).toHaveText('840 InsPunktów')

    await points.getByRole('button', { name: 'Faktury sprzedaży: więcej' }).click()
    await expect(points.getByTestId('inspunkty-month')).toHaveText('75 InsPunktów')

    await points.getByRole('button', { name: 'Zapytaj o paczkę InsPunktów' }).click()
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('pk-cart') ?? '[]'))
    expect(cart[0]?.uwaga).toBe('InsPunkty: 75 / mies.')
  })

  test('the KSeF counter counts days in the browser', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-20T10:00:00+02:00'))
    await page.goto(site('biznes.localhost', '/insert'))
    await expect(page.getByTestId('ksef-days')).toHaveText('73')
  })

  test('after the date the browser shows no number (not „0 dni”)', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2027-01-02T10:00:00+01:00'))
    await page.goto(site('biznes.localhost', '/insert'))
    await expect(page.locator('#ksef h2')).toBeVisible()
    await expect(page.getByTestId('ksef-days')).toHaveCount(0)
  })

  test('no prices, leasing or instalments on the page', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/insert'))
    const text = await page.locator('main').innerText()
    // „do 10 000 zł brutto” is the KSeF threshold, not a price (K4-FINAL §1).
    expect(forbiddenContent(text, { legalAmounts: true })).toEqual([])
    expect(text).not.toMatch(/\bAut\./)
  })

  test('no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(site('biznes.localhost', '/insert'))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('the page belongs to the Biznes line only', async ({ page }) => {
    const response = await page.goto(site('instalacje.localhost', '/insert'))
    expect(response?.status()).toBe(404)
  })
})

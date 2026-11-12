import { expect, test, type Page } from '@playwright/test'

import { forbiddenContent } from '../../src/lib/catalog/contentRules'
import { site } from './helpers'

// K4h: `/insert` of the Biznes line from K4 sections (K33 §7, K34 §5, plansza Web-InsERT): hero
// with the program boxes, „Który Subiekt”, the comparison, KSeF with a day counter, the
// InsPunkty calculator, the whole offer, requirements, films, FAQ. Axe in `a11y`.

const cartButton = (page: Page) =>
  page.locator('[data-site-header]').getByRole('link', { name: /^Zapytanie/ })

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

  test('PREMIUM-1011: the box composition, KSeF on navy, the InsERT lines, the film poster', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost', '/insert'))
    // Subiekt nexo in the middle, the programs around it, each opening its card.
    const orbit = page.locator('[data-insert-orbit]')
    await expect(orbit.locator('[data-orbit-center] a')).toHaveAttribute('href', /^\/produkt\//)
    expect(await orbit.locator('a[href^="/produkt/"]').count()).toBeGreaterThanOrEqual(5)
    // KSeF: three dates in the glass timeline, six steps, the two actions.
    const ksef = page.locator('#ksef')
    await expect(ksef.locator('[data-ksef-timeline] > li')).toHaveCount(3)
    await expect(ksef.getByRole('link', { name: 'InsPunkty — opłaty za KSeF' })).toBeVisible()
    // The four InsERT lines under the comparison.
    await expect(page.locator('[data-table-lines] > ul > li')).toHaveCount(4)
    await expect(page.locator('[data-table-lines]')).toContainText('InsERT nexo PRO+')
    await expect(
      page.locator('section').filter({ hasText: 'Filmy o programach InsERT' }).locator('img'),
    ).toHaveCount(1)
  })

  test('PRODUKCJA-BIZNES-1211: programs in action, program care with the form topic', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost', '/insert'))
    // Five programs, each with its real screen and „Dodaj do zapytania”.
    const programs = page.locator('#programy')
    await expect(programs.getByRole('tab')).toHaveCount(5)
    await expect(programs.getByRole('tabpanel').locator('figure img')).toHaveCount(1)
    await programs.getByRole('tab', { name: 'Rewizor' }).click()
    await expect(programs.getByRole('tabpanel')).toContainText('Rewizor')
    await expect(
      programs.getByRole('tabpanel').getByRole('button', { name: /Dodaj do zapytania/ }),
    ).toBeVisible()
    // Program care: five tiles and the form with its topic.
    await expect(page.locator('#opieka li')).toHaveCount(5)
    await expect(
      page.getByRole('link', { name: 'Zapytaj o opiekę nad programem' }),
    ).toHaveAttribute('href', /\/kontakt\?temat=KSeF%2C%20programy%20i%20opieka%20IT#formularz/)
  })

  test('PREMIUM-1011: on a phone the boxes are a row to swipe', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(site('biznes.localhost', '/insert'))
    await expect(page.locator('[data-insert-carousel]')).toBeVisible()
    await expect(page.locator('[data-insert-orbit]')).toBeHidden()
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

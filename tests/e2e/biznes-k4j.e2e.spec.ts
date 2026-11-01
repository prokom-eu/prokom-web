import { expect, test, type Page } from '@playwright/test'

import { forbiddenContent } from '../../src/lib/catalog/contentRules'
import { site } from './helpers'

// K4j: /automaty-vendingowe (K32 §2), /ksef (K35 §2, K36 §3, D-K4-7 — two versions switched on
// 1.01.2027, `?ksefpo=1` shows the later one) and /ulga-na-kase-fiskalna (K35 §3). Axe in `a11y`.

const cartButton = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ })

const PAGES = ['/automaty-vendingowe', '/ksef', '/ulga-na-kase-fiskalna']

test.describe('Biznes K4j pages', () => {
  for (const path of PAGES) {
    test(`${path}: one H1, FAQPage, no prices, no horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      const response = await page.goto(site('biznes.localhost', path))
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)
      const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
      expect(scripts.join('\n')).toContain('"FAQPage"')
      // „do 700 zł” and the KSeF thresholds are not prices (K4-FINAL §1).
      const text = await page.locator('main').innerText()
      expect(forbiddenContent(text, { legalAmounts: true })).toEqual([])
      expect(text).not.toMatch(/\bAut\./)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test('the pages belong to the Biznes line only', async ({ page }) => {
    for (const path of PAGES) {
      const response = await page.goto(site('instalacje.localhost', path))
      expect(response?.status(), path).toBe(404)
    }
  })
})

test.describe('Biznes /ksef (K4j)', () => {
  test('before 1.01.2027: the counter, the limit question and the deadline band', async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date('2026-11-02T10:00:00+01:00'))
    await page.goto(site('biznes.localhost', '/ksef'))
    await expect(page.locator('h1')).toContainText('KSeF bez wyjątków od 1 stycznia 2027.')
    await expect(page.getByTestId('ksef-days')).toHaveText('60')
    await expect(
      page.getByText('Ile sprzedajesz na fakturach poza KSeF miesięcznie?'),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Zdążmy przed 1 stycznia.' })).toBeVisible()
  })

  test('?ksefpo=1 shows the version after the date', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/ksef?ksefpo=1'))
    await expect(page.locator('h1')).toContainText('KSeF obowiązuje wszystkie firmy.')
    await expect(page.getByText('KSeF · obowiązuje od 1 stycznia 2027')).toBeVisible()
    await expect(page.getByText('Ile sprzedajesz na fakturach poza KSeF miesięcznie?')).toHaveCount(
      0,
    )
    await expect(page.getByRole('heading', { name: 'Sprawdźmy Twój KSeF.' })).toBeVisible()
  })

  test('the quiz answers and the checklist remembers its ticks', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-02T10:00:00+01:00'))
    await page.goto(site('biznes.localhost', '/ksef'))
    const result = page.getByTestId('ksef-result')
    await expect(result).toContainText('Masz czas do 31 grudnia 2026 r.')
    await page.getByRole('button', { name: 'więcej', exact: true }).click()
    await expect(result).toContainText('Już teraz wystawiasz faktury w KSeF')
    await page.getByRole('button', { name: 'Nie, tylko konsumentom' }).click()
    await expect(result).toContainText('Faktury dla konsumentów nie muszą trafiać do KSeF')

    await expect(page.getByTestId('ksef-progress')).toHaveText('0 z 6 gotowe')
    await page.getByRole('button', { name: /Certyfikat KSeF/ }).click()
    await expect(page.getByTestId('ksef-progress')).toHaveText('1 z 6 gotowe')
    await page.reload()
    await expect(page.getByTestId('ksef-progress')).toHaveText('1 z 6 gotowe')
  })

  test('„Przygotujcie moją firmę” lists KSeF with the note', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/ksef'))
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 0 pozycji')
    await page.getByRole('button', { name: 'Przygotujcie moją firmę' }).click()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 1 pozycja')
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('pk-cart') ?? '[]'))
    expect(cart[0]?.uwaga).toBe('Przygotowanie firmy do KSeF')
  })
})

test.describe('Biznes /automaty-vendingowe (K4j)', () => {
  test('„Partner Optivendi”, the machines by product and the whole offer', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/automaty-vendingowe'))
    await expect(page.getByText(/Partner Optivendi/).first()).toBeVisible()
    await expect(page.locator('main')).not.toContainText(/autoryzowan/i)
    const picker = page.locator('#co')
    await expect(picker.getByRole('tab')).toHaveCount(7)
    await picker
      .getByRole('button', { name: /^Dodaj do zapytania: / })
      .first()
      .click()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 1 pozycja')
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('pk-cart') ?? '[]'))
    expect(cart[0]?.uwaga).toBe('Automat vendingowy: dobór')
    await expect(page.getByRole('tab', { name: /Boxomaty i skrytki/ })).toBeVisible()
  })
})

test.describe('Biznes /ulga-na-kase-fiskalna (K4j)', () => {
  test('the amount always with „rozlicza księgowa” and four cash registers', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/ulga-na-kase-fiskalna'))
    await expect(page.locator('h1')).toContainText('Ulga na kasę fiskalną:')
    await expect(page.locator('main')).toContainText('rozlicza Twoja księgowa')
    await expect(page.getByRole('navigation', { name: 'Okruszki' })).toContainText('Kasy fiskalne')
    await expect(page.locator('main article')).toHaveCount(4)
  })
})

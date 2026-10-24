import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// B9c: `/insert` of the Biznes line from its own blocks (spec. §6.6, plansza Insert): hero with
// a program screen, the program picker (one tile = one program, switch on the inquiry list), the
// program family, KSeF with a day counter, services, the FAQ and the v20 form. Axe in `a11y`.

const cartButton = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ })

test.describe('Biznes /insert (B9c)', () => {
  test('shows the hero, the picker, the family, KSeF, the FAQ and the form', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/insert'))

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('Subiekt dobrany do firmy.')
    await expect(page.getByRole('navigation', { name: 'Okruszki' })).toHaveText(
      /Strona główna\s*\/\s*Oferta\s*\/\s*InsERT/,
    )
    await expect(page.locator('#dobor')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Rewizor' })).toBeVisible()
    await expect(page.locator('#ksef')).toContainText('dni do 1 stycznia 2027')
    await expect(page.locator('#faq details')).toHaveCount(6)
    await expect(page.locator('#kontakt form')).toBeVisible()
  })

  test('the picker shows the program of the chosen tile', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/insert'))
    const result = page.getByTestId('program-result')
    // Start: Subiekt nexo (the panel's „Wybrany na start”).
    await expect(page.getByRole('radio', { name: /Sklep, hurtownia, warsztat/ })).toBeChecked()
    await expect(result.getByRole('heading', { level: 3 })).toHaveText('Subiekt nexo')

    await page.getByRole('radio', { name: /Jednoosobowa firma/ }).check()
    await expect(result.getByRole('heading', { level: 3 })).toHaveText('Subiekt 123')

    // Arrow keys move within the radio group.
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('radio', { name: /Sklep, hurtownia, warsztat/ })).toBeChecked()
    await expect(result.getByRole('heading', { level: 3 })).toHaveText('Subiekt nexo')
  })

  test('„Dodaj do zapytania” switches the program on the list', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/insert'))
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie')
    const result = page.getByTestId('program-result')

    await result.getByRole('button', { name: /^Dodaj do zapytania/ }).click()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 1 pozycja')
    await expect(result.getByRole('button', { name: /^W zapytaniu/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await result.getByRole('button', { name: /^W zapytaniu/ }).click()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie')
  })

  test('the KSeF counter counts days in the browser', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-20T10:00:00+02:00'))
    await page.goto(site('biznes.localhost', '/insert'))
    await expect(page.getByTestId('ksef-days')).toHaveText('73')
  })

  test('after the date the browser shows no number (not „0 dni”)', async ({ page }) => {
    // The fake clock is the browser's only; the server still renders the counter for today.
    await page.clock.setFixedTime(new Date('2027-01-02T10:00:00+01:00'))
    await page.goto(site('biznes.localhost', '/insert'))
    await expect(page.locator('#ksef h2')).toBeVisible()
    await expect(page.getByTestId('ksef-days')).toHaveCount(0)
  })

  test('no prices, leasing or instalments on the page', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/insert'))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/leasing|\braty\b|\d+[,.]\d{2}\s*zł/i)
  })

  test('the page belongs to the Biznes line only', async ({ page }) => {
    const response = await page.goto(site('instalacje.localhost', '/insert'))
    expect(response?.status()).toBe(404)
  })
})

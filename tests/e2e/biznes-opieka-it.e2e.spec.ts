import { expect, test } from '@playwright/test'

import { site } from './helpers'

// B9a: `/opieka-it` of the Biznes line from its own blocks (spec. §6.4, plansza Dzial): hero with
// the „Jak to działa” card, sample care panel, downtime calculator (counted in the browser), the
// free IT audit `#przeglad`, ten questions and the v20 form. Axe at 360 px in `a11y`.

test.describe('Biznes /opieka-it (B9a)', () => {
  test('shows the hero, the panel, the audit, the FAQ and the form', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/opieka-it'))

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('Informatyk, który zna Twoją firmę')
    await expect(page.getByRole('navigation', { name: 'Okruszki' })).toContainText('Opieka IT')

    await expect(page.getByText('Panel opieki PRO-KOM')).toBeVisible()
    await expect(page.locator('#przeglad')).toContainText('Raport z przeglądu IT')
    // The report summary is counted from its rows (3 urgent, 4 to improve, 1 fine).
    await expect(page.locator('#przeglad dl').first()).toContainText(
      /pilne\s*3.*do poprawy\s*4.*w porządku\s*1/,
    )
    await expect(page.locator('#faq details')).toHaveCount(10)
    await expect(page.locator('#kontakt form')).toBeVisible()
  })

  test('the hero button leads to the free audit', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/opieka-it'))
    await page.getByRole('link', { name: 'Umów bezpłatny przegląd IT' }).first().click()
    await expect(page).toHaveURL(/\/opieka-it#przeglad$/)
    await expect(page.getByRole('heading', { name: /Sprawdzimy Twoją firmę/ })).toBeInViewport()
  })

  test('the calculator counts the cost of a failure in the browser', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/opieka-it'))
    const result = page.getByTestId('downtime-result')
    // Start: 5 000 zł a day, 10 h, a whole day → 500 zł an hour, 5 000 zł.
    await expect(result).toContainText('5 000 zł')
    await expect(result).toContainText('ok. 500 zł')

    // 8 h and a weekend: 625 zł an hour × 16 h = 10 000 zł.
    await page.getByRole('radio', { name: '8 h' }).check()
    await page.getByRole('radio', { name: 'Weekend' }).check()
    await expect(result).toContainText('10 000 zł')
    await expect(result).toContainText('Weekend przestoju')

    // Keyboard on the slider: one step up = +500 zł a day → 5 500 / 8 × 16 = 11 000 zł.
    const slider = page.getByRole('slider', { name: 'Dzienny utarg' })
    await slider.focus()
    await page.keyboard.press('ArrowRight')
    await expect(slider).toHaveValue('5500')
    await expect(result).toContainText('11 000 zł')
  })

  test('no prices, leasing or instalments on the page', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/opieka-it'))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/leasing|\braty\b|\d+[,.]\d{2}\s*zł/i)
  })

  test('the page belongs to the Biznes line only', async ({ page }) => {
    const response = await page.goto(site('instalacje.localhost', '/opieka-it'))
    expect(response?.status()).toBe(404)
  })
})

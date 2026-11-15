import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { hydrated, setTheme, site } from './helpers'

// pro-kom.eu `/inwestycje-i-dostawy` (H4-1, spec §6.5, board 17): the request list, example
// objects, copy and the way to the form. Needs `pnpm seed` (tenant `prokom`).
const HUB = 'prokom.localhost'

test.describe('pro-kom.eu — /inwestycje-i-dostawy (spec §6.5)', () => {
  test('add three items → load „Restauracja” → copy → go to the form', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.setViewportSize({ width: 1440, height: 900 })
    const response = await page.goto(site(HUB, '/inwestycje-i-dostawy'))
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Większe zamówienie albo cały obiekt?')

    const plus = page.locator('#lista .pk-qty__ctl button', { hasText: /^\+$/ })
    await hydrated(plus.first())
    await plus.nth(0).click()
    await plus.nth(1).click()
    await plus.nth(2).click()
    await expect(page.locator('.pk-dsum__totals')).toContainText('3 szt.')
    await expect(page.locator('.pk-dbar')).toBeVisible()

    const restaurant = page.locator('#obiekty .pk-ind__item', { hasText: 'Restauracja' })
    await restaurant.click()
    await expect(restaurant).toHaveAttribute('aria-pressed', 'true')
    await page.locator('#obiekty button', { hasText: 'Wczytaj przykład' }).click()
    const totals = page.locator('.pk-dsum__totals')
    await expect(totals).not.toContainText('3 szt. · 3')

    await page.locator('#lista button', { hasText: 'Kopiuj listę' }).click()
    await expect(page.locator('#lista [role="status"]')).toHaveText('Skopiowano listę')
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toContain('szt.')

    await page.locator('.pk-dbar a', { hasText: 'Wyślij zapytanie' }).click()
    await expect(page.locator('#formularz')).toBeInViewport()
    await expect(page.locator('.pk-dbar')).toBeHidden()
  })

  test('the list survives a reload in the same tab; clearing empties it', async ({ page }) => {
    await page.goto(site(HUB, '/inwestycje-i-dostawy'))
    const plus = page.locator('#lista .pk-qty__ctl button', { hasText: /^\+10$/ })
    await hydrated(plus.first())
    await plus.first().click()
    await expect(page.locator('.pk-dsum__totals')).toContainText('10 szt.')
    await page.reload()
    await expect(page.locator('.pk-dsum__totals')).toContainText('10 szt.')
    const clear = page.locator('#lista button', { hasText: 'Wyczyść' })
    await hydrated(clear)
    await clear.click()
    await expect(page.locator('.pk-dsum__totals')).toContainText('0 szt.')
  })

  test('is not a page of the line domains', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/inwestycje-i-dostawy'))
    expect(response?.status()).toBe(404)
  })

  for (const theme of ['dark', 'light'] as const) {
    test(`no axe violations in the ${theme} theme`, async ({ page }) => {
      await setTheme(page, theme)
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(site(HUB, '/inwestycje-i-dostawy'))
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  }

  test('no sideways scroll at 360 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(site(HUB, '/inwestycje-i-dostawy'))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { hydrated, setTheme, site } from './helpers'

// pro-kom.eu `/dla-firm` (H3-2, spec §6.3, board 03): industries from `HubPlans`, areas in line
// tabs, situations, the way to the form. Needs `pnpm seed` (tenant `prokom`).
const HUB = 'prokom.localhost'

test.describe('pro-kom.eu — /dla-firm (spec §6.3)', () => {
  test('H1, title and the sections of the page', async ({ page }) => {
    const response = await page.goto(site(HUB, '/dla-firm'))
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle('Dla firm: kasy, IT, sieć, kamery, strona | PRO-KOM')
    await expect(page.locator('h1')).toHaveText('Wszystko dla Twojej firmy w jednej firmie.')
    for (const id of [
      'branze',
      'zakres',
      'sytuacje',
      'wdrozenie',
      'porownanie',
      'pytania',
      'formularz',
    ]) {
      await expect(page.locator(`section#${id}`), id).toHaveCount(1)
    }
    // No financing and no price promises (spec §3, §6.3).
    await expect(page.locator('main')).not.toContainText(/leasing|rat[ya] |finansowani[ea] zakupu/i)
  })

  test('is not a page of the line domains', async ({ page }) => {
    const response = await page.goto(site('instalacje.localhost', '/dla-firm'))
    expect(response?.status()).toBe(404)
  })

  test('an industry shows its plan; a line tab shows its area', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HUB, '/dla-firm'))
    const industries = page.locator('#branze .pk-ind__item')
    expect(await industries.count()).toBeGreaterThan(5)
    const title = page.locator('#branze .pk-plan h3')
    const before = await title.textContent()
    await hydrated(industries.nth(1))
    await industries.nth(1).click()
    await expect(industries.nth(1)).toHaveAttribute('aria-pressed', 'true')
    await expect(title).not.toHaveText(before ?? '')

    const tabs = page.locator('#zakres [role="tab"]')
    await hydrated(tabs.nth(1))
    await tabs.nth(1).click()
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    await tabs.nth(1).press('ArrowRight')
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true')
    await expect(tabs.nth(2)).toBeFocused()
  })

  test('a situation shows its order of lines', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HUB, '/dla-firm#sytuacje'))
    const items = page.locator('#sytuacje .pk-help__list button')
    await hydrated(items.nth(2))
    await items.nth(2).click()
    await expect(items.nth(2)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('#sytuacje .pk-situation h3')).toHaveText(
      (await items.nth(2).textContent()) ?? '',
    )
    await expect(page.locator('#sytuacje .pk-situation__order li')).toHaveCount(3)
  })

  test('the form section has the hub form with consent', async ({ page }) => {
    await page.goto(site(HUB, '/dla-firm#formularz'))
    const form = page.locator('#formularz form')
    await expect(form).toBeVisible()
    await expect(form.getByLabel('Imię i firma')).toBeVisible()
    await expect(form.getByRole('button', { name: /Wyślij/ })).toBeVisible()
  })

  for (const theme of ['dark', 'light'] as const) {
    test(`no axe violations in the ${theme} theme`, async ({ page }) => {
      await setTheme(page, theme)
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(site(HUB, '/dla-firm'))
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
      // The other lines' colours in the area panel (Instalacje, Software, Tech).
      for (const at of [1, 2, 3]) {
        const tab = page.locator('#zakres [role="tab"]').nth(at)
        await hydrated(tab)
        await tab.click()
        await expect(tab).toHaveAttribute('aria-selected', 'true')
        const area = await new AxeBuilder({ page }).include('#zakres').analyze()
        expect(area.violations).toEqual([])
      }
    })
  }

  test('no sideways scroll at 360 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(site(HUB, '/dla-firm'))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})

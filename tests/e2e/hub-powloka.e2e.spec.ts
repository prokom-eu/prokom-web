import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { setTheme, site } from './helpers'

// pro-kom.eu shell (H1-2, spec §5): capsule with the „Oferta” mega menu, rail on every page (runda 1811 D8),
// bottom bar and sheet on a phone, dark theme by default. Needs `pnpm seed` (tenant `prokom`).
const HUB = 'prokom.localhost'

const capsule = (page: Page) => page.locator('.cap')

/** The theme on `<html>` at the moment `<body>` is created — i.e. before the first paint. */
async function themeBeforeBody(page: Page): Promise<string | null> {
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      if (!document.body) return
      ;(window as unknown as { __theme: string | null }).__theme =
        document.documentElement.getAttribute('data-theme')
      observer.disconnect()
    })
    observer.observe(document, { childList: true, subtree: true })
  })
  await page.goto(site(HUB))
  return page.evaluate(() => (window as unknown as { __theme: string | null }).__theme)
}

test.describe('pro-kom.eu — capsule widths (spec §5.2)', () => {
  for (const width of [1440, 1340, 1180, 1081]) {
    test(`the menu stays on one row at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site(HUB))
      const tops = await capsule(page)
        .locator('.cap__nav .cap-link')
        .evaluateAll((links) => [
          ...new Set(
            links
              .filter((link) => (link as HTMLElement).offsetParent)
              .map((link) => Math.round(link.getBoundingClientRect().top)),
          ),
        ])
      expect(tops).toHaveLength(1)
      expect(await capsule(page).evaluate((cap) => cap.scrollWidth <= cap.clientWidth)).toBe(true)
      const narrow = width <= 1340
      await expect(page.locator('.cap__nav [data-cap-key="/o-firmie"]')).toBeVisible({
        visible: !narrow,
      })
    })
  }

  test('„Oferta” opens the mega menu with the lines as tabs; Esc closes it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HUB))
    const trigger = page.getByRole('button', { name: 'Oferta', exact: true })
    await trigger.click()
    const mega = page.getByRole('region', { name: 'Oferta PRO-KOM' })
    await expect(mega).toBeVisible()
    const tabs = mega.getByRole('tab')
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
    await tabs.first().press('ArrowDown')
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(mega.getByRole('tabpanel').locator('.pk-mega__service')).toHaveCount(6)
    await page.keyboard.press('Escape')
    await expect(mega).toBeHidden()
    await expect(trigger).toBeFocused()
  })
})

test.describe('pro-kom.eu — phone (spec §5.4)', () => {
  test('bottom bar with the raised „Dobierz”, the sheet, no sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(site(HUB))
    const bar = page.locator('[data-tab-bar]')
    await expect(bar.locator('[data-tab-center]')).toHaveText(/Dobierz/)
    await expect(bar.locator('[data-tab-center]')).toHaveAttribute('href', '/#dobierz')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).toBe(false)
    await bar.getByRole('button', { name: 'Menu' }).click()
    const sheet = page.getByRole('dialog')
    await expect(sheet.getByRole('navigation', { name: 'Menu PRO-KOM' })).toBeVisible()
  })
})

test.describe('pro-kom.eu — theme (ADR-H001 pkt 4)', () => {
  test('dark by default, before the first paint', async ({ page }) => {
    expect(await themeBeforeBody(page)).toBe('dark')
  })

  test('a stored light choice applies before the first paint', async ({ page }) => {
    await setTheme(page, 'light')
    expect(await themeBeforeBody(page)).toBe('light')
  })

  for (const theme of ['dark', 'light'] as const) {
    test(`no axe violations in the ${theme} theme`, async ({ page }) => {
      await setTheme(page, theme)
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(site(HUB))
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  }
})

test('the side rail never covers the 1560 px content box, also on wide monitors', async ({
  page,
}) => {
  for (const width of [1440, 1600, 1920]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(site(HUB))
    await expect(page.locator('[data-site-rail]')).toBeVisible()
    const gap = await page.evaluate(() => {
      const rail = document.querySelector('.srail-wrap')!.getBoundingClientRect()
      const wrap = document.querySelector<HTMLElement>('.pk-wrap')!
      const left =
        wrap.getBoundingClientRect().left + parseFloat(getComputedStyle(wrap).paddingLeft)
      return left - (rail.left + 64)
    })
    expect(gap, `${width} px`).toBeGreaterThanOrEqual(16)
  }
})

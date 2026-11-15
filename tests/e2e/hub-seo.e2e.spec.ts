import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { site } from './helpers'

// Audit H8 (15.11): meta description, og:image and `BreadcrumbList` of the hub's v1 pages, and the
// hub's own 404 (spec §6.15). Needs `pnpm seed`.
const HUB = 'prokom.localhost'

test.describe('pro-kom.eu — SEO of the pages (spec §4)', () => {
  for (const path of [
    '/',
    '/linie',
    '/dla-firm',
    '/inwestycje-i-dostawy',
    '/o-firmie',
    '/kontakt',
  ]) {
    test(`${path}: description 140–160 characters and the hub's link picture`, async ({ page }) => {
      await page.goto(site(HUB, path))
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description?.length ?? 0).toBeGreaterThanOrEqual(140)
      expect(description?.length ?? 0).toBeLessThanOrEqual(160)
      await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute(
        'content',
        /\/brand\/prokom-glowna_og\.png$/,
      )
      if (path !== '/') {
        // `hasText` does not read a <script>'s content — compare the JSON-LD texts instead.
        const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
        expect(jsonLd.filter((text) => text.includes('"BreadcrumbList"'))).toHaveLength(1)
      }
    })
  }
})

test.describe('pro-kom.eu — 404 (spec §6.15)', () => {
  test('message, search to /szukaj, the five lines and the phone', async ({ page }) => {
    const response = await page.goto(site(HUB, '/nie-ma-takiej-strony'))
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ta strona się rozłączyła.')
    await expect(page.locator('.pk-404__line')).toHaveCount(5)
    await expect(page.locator('.pk-404 a[href^="tel:"]')).toHaveCount(2)
    await page.getByLabel('Czego potrzebujesz?').fill('kamery')
    await page.getByRole('button', { name: 'Szukaj' }).click()
    await expect(page).toHaveURL(/\/szukaj\?q=kamery$/)
  })

  test('has no axe violations', async ({ page }) => {
    await page.goto(site(HUB, '/nie-ma-takiej-strony'))
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})

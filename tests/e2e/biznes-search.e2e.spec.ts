import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// B4a: search overlay of the Biznes header (spec. §3.2, §8.2, §9 pkt 2 and 7). Catalog from
// `pnpm seed`; the cases do not rely on synonyms (BiznesSettings), which other tests replace.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const overlay = (page: Page) => page.getByRole('dialog', { name: 'Szukaj w ofercie' })
const field = (page: Page) => overlay(page).getByRole('searchbox', { name: 'Szukaj w ofercie' })

/** "/" works once the header is hydrated: press until the overlay shows. */
async function openWithSlash(page: Page) {
  await expect(async () => {
    await page.keyboard.press('/')
    await expect(overlay(page)).toBeVisible({ timeout: 1000 })
  }).toPass()
}

test.describe('Biznes search', () => {
  test('"/" opens it, a typo still finds registers, Esc closes', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await openWithSlash(page)
    await expect(field(page)).toBeFocused()

    await field(page).fill('kasa fiskalan')
    const results = overlay(page).getByRole('region', { name: /Produkty i usługi/ })
    await expect(results.getByRole('link').first()).toHaveAttribute('href', /^\/produkt\//)
    await expect(results.getByRole('link', { name: /Posnet Ergo Online/ })).toBeVisible()
    await expect(overlay(page).getByRole('link', { name: /^Kasy fiskalne/ })).toHaveAttribute(
      'href',
      '/oferta/kasy-fiskalne',
    )

    // Arrow down leaves the field for the first result.
    await page.keyboard.press('ArrowDown')
    await expect(overlay(page).locator('[data-result]:focus')).toHaveCount(1)

    await page.keyboard.press('Escape')
    await expect(overlay(page)).toBeHidden()
  })

  test('"/" typed in a form field does not open it', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await openWithSlash(page)
    await field(page).fill('a/b')
    await expect(field(page)).toHaveValue('a/b')
    await page.keyboard.press('Escape')
    await expect(overlay(page)).toBeHidden()
  })

  test('a phrase with no results offers to ask about it', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await page.getByRole('button', { name: 'Szukaj w ofercie' }).first().click()
    await field(page).fill('zxqvbn')
    await expect(
      overlay(page).getByText('Nie znaleźliśmy „zxqvbn”', { exact: false }),
    ).toBeVisible()
    await expect(overlay(page).getByRole('link', { name: 'Zapytaj o „zxqvbn”' })).toHaveAttribute(
      'href',
      '/zapytanie?fraza=zxqvbn',
    )
  })

  test('the magnifier opens it on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await page.goto(site('biznes.localhost'))
    await page.getByRole('banner').getByRole('button', { name: 'Szukaj w ofercie' }).click()
    await expect(field(page)).toBeFocused()
    await field(page).fill('terminal')
    await expect(
      overlay(page).getByRole('link', { name: /Terminal płatniczy PolCard/ }),
    ).toBeVisible()
    const width = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(width).toBeLessThanOrEqual(360)
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`axe passes with results open — ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto(site('biznes.localhost'))
      await openWithSlash(page)
      await field(page).fill('kasa')
      await expect(
        overlay(page)
          .getByRole('link', { name: /Posnet/ })
          .first(),
      ).toBeVisible()
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(
        violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([])
    })
  }
})

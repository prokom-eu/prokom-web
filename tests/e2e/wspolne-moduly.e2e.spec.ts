import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { setTheme, site } from './helpers'

// D2-3b (plan `docs/zadania/wspolne-elementy.md` F3, spec §5): the modules of the Kontakt and
// O firmie templates on the preview page, on the line's seed data. Needs `pnpm seed`.
const modules = (page: Page) => page.locator('[data-wspolne] [data-modules-preview]')

test.describe('/_wspolne — modules of Kontakt and O firmie', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('the area map finds the zone of a listed town and says so for one off the list', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', '/_wspolne'))
    const area = modules(page).locator('[data-service-area]')
    const field = area.getByLabel('Sprawdź swoją miejscowość')
    await field.fill('Nowy Targ')
    await expect(area.getByText('Nowy Targ · strefa Podhale')).toBeVisible()
    await field.fill('Gdańsk')
    await expect(area.getByText('Nie ma jej na liście — zadzwoń, ustalimy dojazd.')).toBeVisible()
  })

  test('company card, stats, rules, lines and verify cards come from the data', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', '/_wspolne'))
    const card = modules(page).locator('[data-company-card]')
    await expect(card).toContainText('NIP')
    await expect(card.locator('a[href^="tel:"]').first()).toBeVisible()

    // Outside production a flagged stat stays visible (D1 flag; hidden on production — unit test).
    const stats = modules(page).locator('[data-stats-strip] li')
    expect(await stats.count()).toBeGreaterThanOrEqual(3)

    const rules = modules(page).locator('[data-rules-bento] > li')
    await expect(rules.first()).toBeVisible()
    expect(await modules(page).locator('[data-rules-bento] b').count()).toBeLessThanOrEqual(8)

    const current = modules(page).locator('[data-family-strip] [aria-current="page"]')
    await expect(current).toHaveCount(1)
    await expect(current).toHaveAttribute('data-family-line', 'biznes')

    const verify = modules(page).locator('[data-verify-cards] a')
    expect(await verify.count()).toBeGreaterThan(0)
    for (const link of await verify.all()) {
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', /noopener/)
    }
  })

  test('every line marks itself in the family strip', async ({ page }) => {
    for (const [host, key] of [
      ['instalacje.localhost', 'instalacje'],
      ['software.localhost', 'software'],
    ] as const) {
      await page.goto(site(host, '/_wspolne'))
      await expect(
        modules(page).locator('[data-family-strip] [aria-current="page"]'),
      ).toHaveAttribute('data-family-line', key)
    }
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe on the modules (${theme})`, async ({ page }) => {
      await setTheme(page, theme)
      await page.goto(site('software.localhost', '/_wspolne'))
      await modules(page).locator('[data-service-area] input').fill('Szaflary')
      const results = await new AxeBuilder({ page }).include('[data-modules-preview]').analyze()
      expect(results.violations).toEqual([])
    })
  }
})

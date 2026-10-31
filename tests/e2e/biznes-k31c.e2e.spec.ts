import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// K31c: the series filter of a category (`?seria=`), K31-ZMIANY §5, spec. §6.11. The showrooms
// of Lenovo and Dell became salons 2.0 (K4f, `biznes-salony.e2e.spec.ts`).
const biznes = (path: string) => site('biznes.localhost', path)

test.describe('Biznes category series filter (K31c)', () => {
  const LAPTOPS = '/oferta/laptopy'
  const grid = (page: Page) => page.locator('[data-category-grid] [data-card]')

  test('`?seria=` filters from the first render, the canonical stays without it', async ({
    page,
  }) => {
    await page.goto(biznes(`${LAPTOPS}?seria=thinkpad-p`))
    await expect(page.locator('input[name="seria"]:checked')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${LAPTOPS}$`),
    )
    const filtered = await grid(page).count()
    await page
      .locator('label', { hasText: /^Wszystkie/ })
      .first()
      .click()
    await expect(page).toHaveURL(biznes(LAPTOPS))
    await expect.poll(() => grid(page).count()).toBeGreaterThan(filtered)
  })

  test('a series chip writes `?seria=`; „Nie wiesz, który?” goes to the wizard', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(biznes(LAPTOPS))
    await page.locator('label', { hasText: /^ThinkBook\s*\d+$/ }).click()
    await expect(page).toHaveURL(biznes(`${LAPTOPS}?seria=thinkbook`))
    await expect(page.getByRole('complementary', { name: 'Filtry' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Dobierz w 3 pytaniach' })).toHaveAttribute(
      'href',
      /^\/marki\/(lenovo|dell)#dobor$/,
    )
  })
})

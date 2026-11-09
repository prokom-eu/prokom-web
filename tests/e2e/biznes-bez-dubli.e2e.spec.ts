import { expect, test } from '@playwright/test'

import { site } from './helpers'

// BIZ-3 B5-3 (audit 0611 P1-2, P1-4, P1-13): no block said twice on the subpages.
const biznes = (path: string) => site('biznes.localhost', path)

test.describe('Biznes subpages without repetition (B5-3)', () => {
  test('a category has one help block: the form with the inquiry steps as its heading', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(biznes('/oferta/laptopy'))
    await expect(page.locator('#jak-zapytac')).toHaveCount(0)
    const help = page.locator('#kontakt')
    await expect(help.getByRole('list', { name: 'Jak wysłać zapytanie' }).first()).toBeVisible()
    await expect(help.getByRole('heading', { name: 'Formularz zapytania' })).toBeVisible()
  })

  test('a brand page without a salon ends with one call to action, no form', async ({ page }) => {
    await page.goto(biznes('/marki/dibal'))
    const cta = page.locator('#kontakt')
    await expect(cta.getByRole('heading', { level: 2 })).toContainText('Dibal')
    await expect(cta.getByRole('link', { name: /Napisz do nas/ })).toHaveAttribute(
      'href',
      '/kontakt#formularz',
    )
    await expect(page.locator('main form')).toHaveCount(0)
    await expect(page.locator('#jak-zapytac')).toHaveCount(0)
  })

  test('the product bento does not repeat the hero highlights', async ({ page }) => {
    await page.goto(biznes('/produkt/posnet-ergo-online'))
    const highlights = await page.locator('main ul[data-highlights] li').allInnerTexts()
    const bento = await page.locator('main [data-bento] [data-tile-value]').allInnerTexts()
    for (const value of bento) {
      expect(highlights.some((text) => text.includes(value.trim()))).toBe(false)
    }
  })
})

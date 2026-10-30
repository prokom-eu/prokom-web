import { expect, test } from '@playwright/test'

import { site } from './helpers'

// K4a-1: the 29 K4 categories (D-K4-2, ADR-017) and 301 from the K3 addresses they replace.
// Catalog from `pnpm seed` (K4 dictionary on top of the K3 / K3.1 cards).
const biznes = (path: string) => site('biznes.localhost', path)

test.describe('Biznes K4 categories (K4a-1)', () => {
  test('the K3 "Komputery i monitory" addresses answer 301 to the K4 categories', async ({
    page,
  }) => {
    for (const [from, to] of [
      ['/oferta/komputery-monitory/laptopy', '/oferta/laptopy'],
      ['/oferta/komputery-monitory/monitory', '/oferta/monitory'],
      ['/oferta/komputery-monitory/stacje-robocze', '/oferta/komputery'],
      ['/oferta/komputery-monitory', '/oferta'],
    ] as const) {
      const response = await page.goto(biznes(from))
      expect(response?.request().redirectedFrom()?.url(), from).toBe(biznes(from))
      await expect(page).toHaveURL(biznes(to))
    }
  })

  test('laptops have their own category page with the K4 name', async ({ page }) => {
    const response = await page.goto(biznes('/oferta/laptopy'))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Laptopy')
    await expect(page.locator('[data-category-grid] > li h3 a')).not.toHaveCount(0)
  })

  test('the breadcrumb of a laptop leads to the K4 category', async ({ page }) => {
    await page.goto(biznes('/produkt/lenovo-yoga-pro-7-15'))
    const crumbs = page.getByRole('navigation', { name: /okruszk|ścieżk/i })
    await expect(crumbs.getByRole('link', { name: 'Laptopy' })).toHaveAttribute(
      'href',
      '/oferta/laptopy',
    )
  })
})

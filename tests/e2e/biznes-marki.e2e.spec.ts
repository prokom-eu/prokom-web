import { expect, test } from '@playwright/test'

import { site } from './helpers'

// K4f-1: page `/marki` (K33 §6, board `Web-Marki`). Groups and brands from `pnpm seed` (K4a-2).
const biznes = (path: string) => site('biznes.localhost', path)

test.describe('Biznes /marki (K4f)', () => {
  test('lists the groups, filters by search and tab, leads tiles to showrooms or the offer', async ({
    page,
  }) => {
    const response = await page.goto(biznes('/marki'))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Wszystkie marki w ofercie')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/marki$/)
    await expect(
      page.getByRole('heading', { level: 2, name: 'Kasy, POS i płatności' }),
    ).toBeVisible()

    // Kyocera sits in the theme showroom „Druk”; HP has none — the offer filtered by the brand.
    await expect(page.getByRole('link', { name: /^Kyocera — wejdź do salonu/ })).toHaveAttribute(
      'href',
      '/marki/druk',
    )
    await expect(page.getByRole('link', { name: /^HP — zobacz ofertę/ })).toHaveAttribute(
      'href',
      '/oferta?marka=hp',
    )

    // The search ignores diacritics; nothing found → the empty state.
    const search = page.getByRole('searchbox', { name: 'Szukaj marki' })
    await search.fill('unifi')
    await expect(page.getByRole('link', { name: /^Ubiquiti/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /^Posnet — / })).toHaveCount(0)
    await search.fill('zzzz')
    await expect(page.getByText('Nie mamy jeszcze salonu tej marki')).toBeVisible()
    await search.fill('')

    // A tab shows one group only.
    await page.getByRole('button', { name: /^Wagi/ }).click()
    await expect(page.getByRole('heading', { level: 2, name: /^Wagi/ })).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Kasy, POS i płatności' }),
    ).toHaveCount(0)
  })

  test('is linked from the header, the footer and the side rail', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(biznes('/kontakt'))
    await expect(
      page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Marki' }),
    ).toHaveAttribute('href', '/marki')
    await expect(
      page.getByRole('contentinfo').getByRole('link', { name: 'Wszystkie marki' }),
    ).toHaveAttribute('href', '/marki')
    // The shared side rail (D3-B): on a subpage its „Strona główna” group leads to the brands
    // section of the home page. Kontakt is on the shared template (#401) with its own sections, so
    // once the rail reads them the group folds (`hidden`) under „Na tej stronie” — a CSS locator
    // finds the link in both states (a role query skips hidden elements and raced the rail).
    await expect(
      page.locator('[data-site-rail] [role="group"][aria-label="Strona główna"] a', {
        hasText: 'Marki',
      }),
    ).toHaveAttribute('href', '/#marki')
  })

  test('has no horizontal scroll at 390 px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(biznes('/marki'))
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }))
    expect(scrollWidth).toBe(innerWidth)
  })
})

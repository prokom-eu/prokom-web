import { expect, test } from '@playwright/test'

import { site } from './helpers'

// K4f-1, runda 1411 R7: page `/marki` (board `Marki.dc.html`). Brands from `pnpm seed` (K4a-2).
const biznes = (path: string) => site('biznes.localhost', path)

test.describe('Biznes /marki (K4f)', () => {
  test('four authorisations, one grid of the others with Optivendi and COMEX, search (runda 1411 R7)', async ({
    page,
  }) => {
    const response = await page.goto(biznes('/marki'))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Wszystkie marki w ofercie')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/marki$/)

    // „Producenci, z którymi pracujemy”: the four authorisations of K4-FINAL §1.
    await expect(
      page.getByRole('heading', { level: 2, name: 'Producenci, z którymi pracujemy' }),
    ).toBeVisible()
    const auth = page.locator('[data-auth-cards] > li')
    await expect(auth).toHaveCount(4)
    await expect(auth.filter({ hasText: 'Posnet' })).toContainText('Autoryzowany serwis')
    await expect(auth.filter({ hasText: 'Elzab' })).toContainText('Autoryzowany serwis')
    await expect(auth.filter({ hasText: 'GoPOS' })).toContainText('Autoryzowany partner')
    await expect(auth.filter({ hasText: 'InsERT' })).toContainText('Autoryzowany partner')

    // „Pozostałe marki”: one grid, no group rows; Optivendi and COMEX in it with their status.
    const grid = page.locator('[data-others-grid]')
    await expect(page.getByRole('group', { name: 'Grupy marek' })).toHaveCount(0)
    await expect(grid.locator('[data-brand-tile="optivendi"] [data-brand-status]')).toHaveText(
      'Partner',
    )
    await expect(grid.locator('[data-brand-tile="comex"] [data-brand-status]')).toHaveText(
      'We współpracy',
    )
    await expect(grid.locator('[data-brand-tile="posnet"]')).toHaveCount(0)
    await expect(page.getByText('Logotypy należą do ich właścicieli.')).toBeVisible()
    // No empty tile: each one shows a logo or the name, and its number of items or a label.
    for (const tile of await grid.locator('[data-brand-tile]').all()) {
      expect(
        (await tile.innerText()).trim().length,
        await tile.getAttribute('href'),
      ).toBeGreaterThan(0)
      expect(await tile.locator('img, [aria-hidden="true"]').count()).toBeGreaterThan(0)
    }
    // Sorted by the number of items: the first tile has no fewer than the last.
    const counts = await grid
      .locator('[data-brand-tile]')
      .evaluateAll((tiles) =>
        tiles.map((tile) => Number(/(\d+) pozycj/.exec(tile.textContent ?? '')?.[1] ?? 0)),
      )
    expect(counts[0]).toBeGreaterThanOrEqual(counts.at(-1) ?? 0)

    // Kyocera sits in the theme showroom „Druk”; HP has none — the offer filtered by the brand.
    await expect(grid.locator('[data-brand-tile="kyocera"]')).toHaveAttribute('href', '/marki/druk')
    await expect(grid.locator('[data-brand-tile="hp"]')).toHaveAttribute('href', '/oferta?marka=hp')

    // The search ignores diacritics; nothing found → the empty state.
    const search = page.getByRole('searchbox', { name: 'Szukaj marki' })
    await search.fill('unifi')
    await expect(grid.locator('[data-brand-tile="ubiquiti"]')).toBeVisible()
    await expect(auth).toHaveCount(0)
    await search.fill('zzzz')
    await expect(page.getByText('Nie mamy jeszcze salonu tej marki')).toBeVisible()
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

  test('has no horizontal scroll at 360 px; three tiles a row', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(biznes('/marki'))
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }))
    expect(scrollWidth).toBe(innerWidth)
    const tops = await page
      .locator('[data-others-grid] > li')
      .evaluateAll((items) => items.slice(0, 4).map((item) => item.getBoundingClientRect().top))
    expect(tops[0]).toBe(tops[2])
    expect(tops[3]).toBeGreaterThan(tops[0]!)
  })
})

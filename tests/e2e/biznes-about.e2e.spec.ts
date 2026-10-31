import { expect, test } from '@playwright/test'

import { site } from './helpers'

// B11c: `/o-firmie` from Biznes blocks (board OFirmie), content from `pnpm seed`.
const ABOUT = '/o-firmie'

test.describe('Biznes about page', () => {
  test('shows the six sections with the years counted from 2004', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', ABOUT))
    expect(response?.status()).toBe(200)

    const years = new Date().getFullYear() - 2004
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toContainText(`${years} lat`)
    await expect(h1).not.toContainText('{lata}')
    // The current page is text, not a link (K4d).
    await expect(
      page.getByRole('navigation', { name: 'Okruszki' }).locator('[aria-current="page"]'),
    ).toHaveText('O firmie')
    await expect(page.getByText('rok założenia')).toBeVisible()

    const main = page.getByRole('main')
    await expect(
      main.getByRole('heading', { name: 'Zasady, które łatwo sprawdzić.' }),
    ).toBeVisible()

    const lines = page.getByRole('region', { name: 'Jedna firma, cztery linie. Ten sam telefon.' })
    await expect(lines.getByRole('listitem')).toHaveCount(4)
    // This site's card: its link is `aria-current`, its name says „(ta strona)” to screen readers.
    await expect(lines.getByRole('link', { name: 'prokombiznes.pl' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(lines.getByText('(ta strona)')).toHaveCount(1)

    // Logos come from Partners of this site, as a grid.
    const brands = page.getByRole('region', {
      name: 'Marki, które sprzedajemy, wdrażamy i serwisujemy',
    })
    expect(await brands.getByRole('img').count()).toBeGreaterThan(0)

    // Address, phone and e-mail from the panel, with the Google Maps links (no iframe).
    const location = page.locator('section[aria-labelledby^="lokalizacja"]')
    await expect(location.getByRole('link', { name: /Otwórz w Mapach Google/ })).toHaveAttribute(
      'href',
      /^https:\/\/www\.google\.com\/maps/,
    )
    await expect(location.locator('a[href^="tel:"]').first()).toBeVisible()
    await expect(page.locator('iframe')).toHaveCount(0)

    await expect(page.locator('#kontakt')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Porozmawiajmy' })).toHaveAttribute(
      'href',
      `${ABOUT}#kontakt`,
    )
  })

  test('no prices, leasing or instalments on the page', async ({ page }) => {
    await page.goto(site('biznes.localhost', ABOUT))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/leasing|\braty\b|\d+[,.]\d{2}\s*zł/i)
  })
})

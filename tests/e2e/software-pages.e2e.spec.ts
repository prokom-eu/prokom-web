import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SW11b: system and legal pages of the Software line (spec. §6.11; boards `Dziekujemy`,
// `NieZnaleziono`, `Polityka`). Data from `pnpm seed`: `SoftwareSettings.thanks` / `.notFound`
// and the privacy policy draft (`src/seed/software/legal.ts`).
const HOST = 'software.localhost'

/** Wider than the window = horizontal scroll of the page (MOBILE-APLIKACJA §5 pkt 1). */
const pageWidth = (page: Page) => page.evaluate(() => document.scrollingElement!.scrollWidth)

test.describe('Software /dziekujemy', () => {
  test('number, „Co dalej”, three cards, noindex, no CTA band', async ({ page }) => {
    await page.goto(site(HOST, '/dziekujemy?nr=PKS-2026-0145'))
    await expect(page.locator('h1')).toHaveText('Dziękujemy, mamy to.')
    await expect(page.getByTestId('inquiry-number')).toHaveText('PKS-2026-0145')
    await expect(page.getByRole('heading', { name: 'Co dalej' })).toBeVisible()
    await expect(page.getByText('W ciągu 1 dnia roboczego')).toBeVisible()
    await expect(page.getByRole('link', { name: /Podglądy do klikania/ })).toHaveAttribute(
      'href',
      '/#podglady',
    )
    await expect(page.getByRole('link', { name: /Aktualności i poradnik/ })).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.locator('[data-footer-cta]')).toBeHidden()
    await expect(page.locator('main')).not.toContainText('KSeF')
  })
})

test.describe('Software 404', () => {
  test('status 404 inside the frame: search, popular, wizard card, 6 tiles', async ({ page }) => {
    const response = await page.goto(site(HOST, '/nie-ma-takiej-strony'))
    expect(response?.status()).toBe(404)
    await expect(page.locator('h1')).toHaveText('Tej strony tu nie ma. Reszta jest.')
    await expect(page.locator('header')).toBeVisible()
    const search = page.getByRole('search')
    await expect(search.getByRole('button', { name: 'Szukaj' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Uruchom kreator/ })).toHaveAttribute(
      'href',
      '/dobierz',
    )
    await expect(page.getByRole('link', { name: /Nie wiesz, czego szukać/ })).toContainText(
      '4 krótkie kroki',
    )
    const places = page.locator('section', {
      has: page.getByRole('heading', { name: 'Dokąd chcesz pójść?' }),
    })
    const tiles = places.getByRole('list').first()
    await expect(tiles.getByRole('listitem')).toHaveCount(6)
    // Tile prices come from the solutions (`{cena:<slug>}`), never a raw template.
    await expect(tiles).toContainText(/od 999\szł netto/)
    await expect(tiles).not.toContainText('{cena')
  })

  test('the search opens the catalog with the query', async ({ page }) => {
    await page.goto(site(HOST, '/nie-ma-takiej-strony'))
    await page.getByRole('search').getByRole('searchbox').fill('pensjonat')
    await page.getByRole('search').getByRole('button', { name: 'Szukaj' }).click()
    await expect(page).toHaveURL(/\/rozwiazania\?q=pensjonat$/)
  })

  test('another line keeps its own generic 404', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/nie-ma-takiej-strony'))
    expect(response?.status()).toBe(404)
    await expect(page.locator('h1')).toHaveText('Nie znaleziono strony')
  })
})

test.describe('Software /polityka-prywatnosci', () => {
  test('draft notice, accent H1, 8 numbered sections with a table of contents', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/polityka-prywatnosci'))
    await expect(page.locator('h1')).toHaveText('Twoje dane. Krótko i po ludzku.')
    // Local and CI run outside production: the draft notice is there.
    await expect(page.getByRole('note')).toContainText('Wersja robocza')
    const toc = page.getByRole('navigation', { name: 'Spis treści' })
    await expect(toc.getByRole('link')).toHaveCount(8)
    await toc.getByRole('link', { name: /Cookies i statystyki/ }).click()
    await expect(page).toHaveURL(/#cookies-i-statystyki$/)
    const cookies = page.getByRole('article', { name: /Cookies i statystyki/ })
    await expect(cookies).toContainText('pk-project')
    await expect(cookies).toContainText('pk-theme')
    await expect(page.locator('main')).not.toContainText(/newsletter/i)
  })

  test('is not on another line', async ({ page }) => {
    // Biznes has its own policy; the Software text never shows there.
    await page.goto(site('biznes.localhost', '/polityka-prywatnosci'))
    await expect(page.locator('main')).not.toContainText('Krótko i po ludzku')
  })
})

test.describe('Software /mapa-strony', () => {
  test('lists the policy in the Software look', async ({ page }) => {
    await page.goto(site(HOST, '/mapa-strony'))
    await expect(page.locator('h1')).toHaveText('Mapa strony')
    await expect(page.getByRole('link', { name: 'Polityka prywatności' }).first()).toBeVisible()
    await expect(page.locator('main a[href="/dziekujemy"]')).toHaveCount(0)
  })
})

test.describe('Software system pages on the phone', () => {
  for (const width of [360, 390, 414]) {
    test(`fit ${width} px without sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      for (const path of [
        '/dziekujemy?nr=PKS-2026-0145',
        '/nie-ma-takiej',
        '/polityka-prywatnosci',
      ]) {
        await page.goto(site(HOST, path))
        expect(await pageWidth(page), path).toBeLessThanOrEqual(width)
      }
    })
  }
})

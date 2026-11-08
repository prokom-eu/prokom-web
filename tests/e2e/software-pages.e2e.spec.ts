import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// System and legal pages of the Software line (SW11b; SWA6a: ZMIANY-v24 §9.6, boards
// `AU-polityka`, `AU-regulamin`, `AU-cookies`, `AU-dostepnosc`, `AU-mapa`). Data from `pnpm seed`:
// `SoftwareSettings.thanks` / `.notFound` and the legal drafts (`src/seed/software/legal.ts`).
const HOST = 'software.localhost'

/** Wider than the window = horizontal scroll of the page (MOBILE-APLIKACJA §5 pkt 1). */
const pageWidth = (page: Page) => page.evaluate(() => document.scrollingElement!.scrollWidth)

test.describe('Software /dziekujemy (v24)', () => {
  test('number, H1, three steps, buttons with the phone, noindex, no CTA band', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/dziekujemy?nr=PKS-2026-0145'))
    await expect(page.locator('h1')).toHaveText(
      'Dziękujemy. Odezwiemy się w ciągu 1 dnia roboczego.',
    )
    await expect(page.getByTestId('inquiry-number')).toHaveText('PKS-2026-0145')
    const steps = page.locator('main ol li')
    await expect(steps).toHaveCount(3)
    await expect(steps.first()).toContainText('Odpowiadamy')
    const main = page.locator('main')
    await expect(main.getByRole('link', { name: /Zobacz podglądy/ })).toHaveAttribute(
      'href',
      '/#podglady',
    )
    await expect(main.locator('a[href^="tel:"]')).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.locator('[data-footer-cta]')).toBeHidden()
  })

  test('without a valid number there is no pill, the page still stands', async ({ page }) => {
    await page.goto(site(HOST, '/dziekujemy?nr=<b>x</b>'))
    await expect(page.getByTestId('inquiry-number')).toHaveCount(0)
    await expect(page.locator('h1')).toContainText('Dziękujemy.')
  })
})

test.describe('Software 404 (v24)', () => {
  test('status 404 inside the frame: planet, search field, six tiles, home and phone', async ({
    page,
  }) => {
    const response = await page.goto(site(HOST, '/nie-ma-takiej-strony'))
    expect(response?.status()).toBe(404)
    await expect(page.locator('h1')).toHaveText('Tej strony tu nie ma.')
    await expect(page.locator('header')).toBeVisible()
    const tiles = page.locator('main ul').first()
    await expect(tiles.getByRole('listitem')).toHaveCount(6)
    await expect(tiles.getByRole('link', { name: /Kreator 60 s/ })).toHaveAttribute(
      'href',
      '/dobierz',
    )
    // Facts are filled, never a raw template.
    await expect(tiles).not.toContainText(/\[|\{cena/)
    const main = page.locator('main')
    await expect(main.getByRole('link', { name: /Strona główna/ })).toHaveAttribute('href', '/')
    await expect(main.locator('a[href^="tel:"]')).toContainText('Zadzwoń:')
    await expect(page.locator('[data-footer-cta]')).toBeHidden()
  })

  test('the search field opens the search window', async ({ page }) => {
    await page.goto(site(HOST, '/nie-ma-takiej-strony'))
    await page
      .locator('main')
      .getByRole('button', { name: /Czego szukasz/ })
      .click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('another line keeps its own 404, not the Software one', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/nie-ma-takiej-strony'))
    expect(response?.status()).toBe(404)
    // Biznes has its own 404 since the audit of 01.11 (search and popular places).
    await expect(page.locator('h1')).toHaveText('Tej strony tu nie ma.')
  })
})

test.describe('Software legal pages v24 (swLegal)', () => {
  test('policy: draft notice, badges, 11 numbered sections, tables', async ({ page }) => {
    await page.goto(site(HOST, '/polityka-prywatnosci'))
    await expect(page.locator('h1')).toHaveText('Polityka prywatności.')
    // Local and CI run outside production: the draft notice is there.
    await expect(page.getByRole('note').filter({ hasText: 'Wersja robocza' })).toBeVisible()
    const badges = page.getByRole('list', { name: 'O dokumencie' })
    await expect(badges).toContainText('Wersja 1.0')
    await expect(badges).toContainText(/Czas czytania: \d+ min/)
    const toc = page.getByRole('navigation', { name: 'Spis treści', exact: true })
    await expect(toc.getByRole('link')).toHaveCount(11)
    await toc.getByRole('link', { name: /Jak długo przechowujemy dane/ }).click()
    await expect(page).toHaveURL(/#jak-dlugo-przechowujemy-dane$/)
    const retention = page.getByRole('region', { name: /Jak długo przechowujemy dane/ })
    await expect(retention.getByRole('table')).toContainText('Dziennik serwera')
    await expect(page.getByRole('table')).toHaveCount(2)
    await expect(page.locator('main')).not.toContainText(/newsletter|składnik/i)
  })

  test('terms, cookies and accessibility have their sections', async ({ page }) => {
    for (const [path, h1, sections] of [
      ['/regulamin', 'Regulamin strony.', 9],
      ['/cookies', 'Pliki cookies.', 5],
      ['/dostepnosc', 'Deklaracja dostępności.', 5],
    ] as const) {
      await page.goto(site(HOST, path))
      await expect(page.locator('h1'), path).toHaveText(h1)
      const toc = page.getByRole('navigation', { name: 'Spis treści', exact: true })
      await expect(toc.getByRole('link'), path).toHaveCount(sections)
    }
    await page.goto(site(HOST, '/cookies'))
    const storage = page.getByRole('table')
    for (const key of ['pk-theme', 'pk-project', 'sesja panelu']) {
      await expect(storage).toContainText(key)
    }
  })

  test('the question card takes the line contact from the settings', async ({ page }) => {
    await page.goto(site(HOST, '/regulamin'))
    const card = page.locator('.sw-lask')
    await expect(card.getByRole('link', { name: /@/ })).toHaveAttribute('href', /^mailto:/)
    await expect(card.locator('a[href^="tel:"]')).toBeVisible()
  })

  test('is not on another line', async ({ page }) => {
    // Biznes has its own policy and no terms page; the Software text never shows there.
    await page.goto(site('biznes.localhost', '/polityka-prywatnosci'))
    await expect(page.locator('main')).not.toContainText('Strona prokomsoftware.pl')
    const terms = await page.goto(site('biznes.localhost', '/regulamin'))
    expect(terms?.status()).toBe(404)
  })
})

test.describe('Software /mapa-strony', () => {
  test('six cards of the board, the terms, the search and every solution', async ({ page }) => {
    await page.goto(site(HOST, '/mapa-strony'))
    await expect(page.locator('h1')).toHaveText('Mapa strony.')
    const main = page.locator('main')
    for (const title of ['Strona główna', 'Oferta', 'Narzędzia', 'Firma', 'Informacje']) {
      await expect(main.getByRole('heading', { level: 2, name: title, exact: true })).toBeVisible()
    }
    await expect(main.getByRole('link', { name: /Regulamin/ })).toHaveAttribute(
      'href',
      '/regulamin',
    )
    await main.getByRole('button', { name: /Wyszukiwarka/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(main.locator('a[href^="/rozwiazania/"]').first()).toBeVisible()
    await expect(main.locator('a[href="/dziekujemy"]')).toHaveCount(0)
  })
})

test.describe('Software forms: the consent clause links the policy (ZMIANY-v24 §11)', () => {
  // The wizard shows its consent only on the last step (`WizardSend`, same clause and link).
  for (const path of ['/', '/kontakt', '/audyt']) {
    test(`${path} form`, async ({ page }) => {
      await page.goto(site(HOST, path))
      const consent = page.locator('form input[type="checkbox"]').first()
      await consent.scrollIntoViewIfNeeded()
      await expect(page.locator('form a[href="/polityka-prywatnosci"]').first()).toBeVisible()
    })
  }
})

test.describe('Software system pages on the phone', () => {
  for (const width of [360, 390, 414]) {
    test(`fit ${width} px without sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      for (const path of [
        '/dziekujemy?nr=PKS-2026-0145',
        '/nie-ma-takiej',
        '/polityka-prywatnosci',
        '/cookies',
        '/mapa-strony',
      ]) {
        await page.goto(site(HOST, path))
        expect(await pageWidth(page), path).toBeLessThanOrEqual(width)
      }
    })
  }
})

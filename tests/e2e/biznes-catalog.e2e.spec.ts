import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// B5a: catalog `/oferta` — filters in the URL with facet counts, sort, „Pokaż kolejne”,
// cards with „+ Do zapytania”, SEO of filtered views (spec. §5, §8.3, §9 pkt 4; ADR-012 §2.2).
// Catalog from `pnpm seed`: 272 published cards (K3 + K3.1, K31a-1).
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const oferta = (query = '') => site('biznes.localhost', `/oferta${query}`)

const cards = (page: Page) => page.locator('article[data-card]')
const count = (page: Page) =>
  page.getByRole('region', { name: 'Produkty i usługi' }).locator('p[aria-live]')
const filters = (page: Page) => page.getByRole('complementary', { name: 'Filtry katalogu' })

/** Clicks work once the island is hydrated: retry until the URL follows. */
async function clickUntilUrl(page: Page, click: () => Promise<void>, url: RegExp) {
  await expect(async () => {
    await click()
    await expect(page).toHaveURL(url, { timeout: 1000 })
  }).toPass()
}

test.describe('Biznes catalog /oferta', () => {
  test('renders 12 of 272 positions on the server', async ({ page }) => {
    await page.route('**/*.js', (route) => route.abort())
    const response = await page.goto(oferta())
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText('Wszystko dla firmy.')
    await expect(count(page)).toHaveText('272 pozycje')
    await expect(cards(page)).toHaveCount(12)
    // Without JavaScript „Pokaż kolejne” is a plain link to the next page (spec. §5.3).
    await expect(page.getByRole('link', { name: /Pokaż kolejne/ })).toHaveAttribute(
      'href',
      '/oferta?strona=2',
    )
  })

  for (const host of ['instalacje.localhost', 'software.localhost']) {
    test(`/oferta on ${host} → 404`, async ({ page }) => {
      const response = await page.goto(site(host, '/oferta'))
      expect(response?.status()).toBe(404)
    })
  }

  test('filters combine, counts agree and the URL restores the view (kryterium 4)', async ({
    page,
  }) => {
    await page.goto(oferta())
    const panel = filters(page)
    // A brand tile is a label with the logo: clicked like a user would, not the hidden box.
    await clickUntilUrl(page, () => panel.locator('label[title="Posnet"]').click(), /marka=posnet/)
    // The facets follow the URL a moment later: wait for them before reading a count.
    await expect(panel.getByRole('checkbox', { name: /^Posnet/ })).toBeChecked()

    // The facet of a category says how many the click will show.
    const kasy = panel.getByRole('checkbox', { name: /^Kasy fiskalne/ })
    const expected = Number(
      (await kasy.locator('xpath=..').locator('span').last().textContent())?.trim(),
    )
    expect(expected).toBeGreaterThan(0)
    // Not `check()`: the box follows the URL a moment after the click (Next 16.4 router),
    // and `check()` reads its state at once.
    await kasy.click()
    await expect(page).toHaveURL(/kategoria=kasy-fiskalne/)
    await expect(kasy).toBeChecked()
    await expect(count(page)).toContainText(String(expected))
    await expect(cards(page)).toHaveCount(expected)

    // Back undoes the last filter, Forward brings it back.
    await page.goBack()
    await expect(page).not.toHaveURL(/kategoria=/)
    await expect(kasy).not.toBeChecked()
    await page.goForward()
    await expect(kasy).toBeChecked()

    // A refresh (or a shared link) shows the same view, rendered by the server.
    await page.reload()
    await expect(filters(page).getByRole('checkbox', { name: /^Posnet/ })).toBeChecked()
    await expect(kasy).toBeChecked()
    await expect(cards(page)).toHaveCount(expected)
  })

  test('chips remove one filter, „Wyczyść wszystko” every one', async ({ page }) => {
    await page.goto(oferta('?rodzaj=uslugi&nowosci=1&marka=posnet'))
    const chips = page.getByRole('region', { name: 'Produkty i usługi' })
    await clickUntilUrl(
      page,
      () => chips.getByRole('button', { name: 'Usługi — usuń filtr' }).click(),
      /^(?!.*rodzaj=).*$/,
    )
    await expect(page).toHaveURL(/nowosci=1/)
    await expect(count(page)).toBeFocused()
    await chips.getByRole('button', { name: 'Wyczyść wszystko' }).click()
    await expect(page).toHaveURL(/\/oferta$/)
    await expect(count(page)).toHaveText('272 pozycje')
  })

  test('group tiles and sort write the URL', async ({ page }) => {
    await page.goto(oferta())
    await clickUntilUrl(
      page,
      () => page.getByRole('button', { name: /^Kasy i sprzedaż/ }).click(),
      /grupa=sprzedaz/,
    )
    await expect(count(page)).toHaveText('87 pozycji')
    await page.getByRole('button', { name: 'A–Z' }).click()
    await expect(page).toHaveURL(/sortuj=a-z/)
    // The list follows the URL a moment later: retry until it is sorted.
    await expect(async () => {
      const names = await cards(page).locator('h3').allTextContents()
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'pl')))
    }).toPass()
  })

  test('reads the phrase of the search (?szukaj=) and asks when nothing matches', async ({
    page,
  }) => {
    await page.goto(oferta('?szukaj=terminal'))
    await expect(page.getByRole('searchbox', { name: 'Szukaj w katalogu' })).toHaveValue('terminal')
    await expect(cards(page).first()).toContainText(/Terminal/i)

    await page.goto(oferta('?szukaj=zzzbrak'))
    await expect(page.getByText('Nie mamy „zzzbrak” w katalogu')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Zapytaj o „zzzbrak”' })).toHaveAttribute(
      'href',
      '/zapytanie?fraza=zzzbrak',
    )
  })

  test('typing in the box filters at once and writes ?szukaj= after a pause', async ({ page }) => {
    await page.goto(oferta())
    const box = page.getByRole('searchbox', { name: 'Szukaj w katalogu' })
    await expect(async () => {
      await box.fill('kasa fiskalan')
      await expect(page).toHaveURL(/szukaj=kasa\+fiskalan/, { timeout: 1500 })
    }).toPass()
    // K3 has a UPS named „… kasa i komputer”, ahead of the registers (search tuning: K3b′).
    await expect(cards(page).locator('h3').nth(2)).toBeVisible()
    const top = await cards(page)
      .locator('h3')
      .evaluateAll((h) => h.slice(0, 3).map((item) => item.textContent ?? ''))
    expect(top.some((name) => /Online/.test(name))).toBe(true)
  })

  test('„Pokaż kolejne” adds 12, writes ?strona=2 and moves focus to the first new card', async ({
    page,
  }) => {
    await page.goto(oferta())
    const more = page.getByRole('link', { name: /Pokaż kolejne/ })
    await clickUntilUrl(page, () => more.click(), /strona=2/)
    await expect(cards(page)).toHaveCount(24)
    await expect(cards(page).nth(12).locator('h3 a')).toBeFocused()
    await expect(page.getByText('Widzisz 24 z 272')).toBeVisible()
  })

  test('„+ Do zapytania” on a card switches, shows the toast and counts', async ({ page }) => {
    await page.goto(oferta())
    const card = cards(page).filter({ hasText: 'Posnet Ergo Online' })
    const add = card.getByRole('button', { name: 'Do zapytania: Posnet Ergo Online' })
    const added = card.getByRole('button', { name: 'W zapytaniu: Posnet Ergo Online' })
    // Clicked until hydrated — and never twice once it worked (the button is a switch).
    await expect(async () => {
      if (await add.isVisible()) await add.click()
      await expect(added).toBeVisible({ timeout: 1000 })
    }).toPass()
    await expect(added).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('Dodano do zapytania:')).toBeVisible()
    await expect(
      page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ }),
    ).toHaveAccessibleName('Zapytanie 1 pozycja')
  })

  test('SEO: filtered views are noindex with the catalog as canonical (ADR-012 §2.2)', async ({
    page,
  }) => {
    await page.goto(oferta())
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/oferta$/)
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)

    await page.goto(oferta('?marka=posnet'))
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/oferta$/)

    await page.goto(oferta('?strona=2'))
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/oferta\?strona=2$/,
    )
    await expect(cards(page)).toHaveCount(24)

    // Past the end: the same list as the last page, so the canonical points there.
    await page.goto(oferta('?strona=999'))
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/oferta\?strona=23$/,
    )
  })

  test('no prices, leasing or instalments in the catalog (spec. §1)', async ({ page }) => {
    await page.goto(oferta('?strona=6'))
    const text = (await page.locator('main').textContent()) ?? ''
    expect(text).not.toMatch(/leasing|\braty\b|\d+[,.]\d{2}\s*zł/i)
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe without violations, ${theme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme })
      await page.goto(oferta('?marka=posnet'))
      await expect(cards(page).first()).toBeVisible()
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(violations).toEqual([])
    })
  }

  test('promo cards: the wizard after the 5th card, GoPOS and InsERT after the 11th (B5b)', async ({
    page,
  }) => {
    await page.goto(oferta())
    const items = page.locator('ul[data-catalog-grid] > li')
    await expect(items.nth(5)).toContainText('Nie wiesz, co wybrać?')
    await expect(items.nth(5).getByRole('link', { name: 'Dobierz w 60 sekund' })).toHaveAttribute(
      'href',
      '/kreator',
    )
    await expect(items.nth(12).getByRole('link', { name: /Poznaj GoPOS/ })).toHaveAttribute(
      'href',
      '/gopos',
    )
    await expect(items.nth(12).getByRole('link', { name: /Który Subiekt/ })).toHaveAttribute(
      'href',
      '/insert',
    )
    // The seed confirms no partner status ([SZEF]): no „Autoryzowany partner” on the card.
    await expect(items.nth(12)).not.toContainText('Autoryzowany partner')

    // A search shows only what was asked for.
    await page.goto(oferta('?szukaj=kasa'))
    await expect(cards(page).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Dobierz w 60 sekund' })).toHaveCount(0)
  })

  test('the list view is a switch in the URL and survives a refresh (B5b)', async ({ page }) => {
    await page.goto(oferta())
    const list = page.getByRole('group', { name: 'Widok' }).getByRole('button', { name: 'Lista' })
    await clickUntilUrl(page, () => list.click(), /widok=lista/)
    await expect(list).toHaveAttribute('aria-pressed', 'true')
    await page.reload()
    await expect(
      page.getByRole('group', { name: 'Widok' }).getByRole('button', { name: 'Lista' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/oferta$/)
  })

  test('an empty result suggests three products (B5b)', async ({ page }) => {
    await page.goto(oferta('?szukaj=zzzbrak'))
    const suggestions = page.getByText('Może chodziło o:').locator('xpath=..').getByRole('listitem')
    await expect(suggestions).toHaveCount(3)
    await expect(page.getByRole('button', { name: /^Dodaj do zapytania:/ })).toHaveCount(3)
  })

  test('„Jedna lista, jeden formularz” under the list, no call-back time without the panel', async ({
    page,
  }) => {
    await page.goto(oferta())
    const how = page.getByRole('region', {
      name: 'Jedna lista, jeden formularz, wycena na piśmie.',
    })
    await expect(how.getByRole('listitem')).toHaveCount(3)
    // The seed sets no call-back promise ([SZEF]): the neutral step 3, no „60 minut”.
    await expect(how).toContainText('Oddzwaniamy z wyceną')
    await expect(how).not.toContainText('60 minut')
  })

  test.describe('phone (360 px)', () => {
    test.use({ viewport: { width: 360, height: 740 } })

    test('no horizontal scroll; filters in a sheet from the bottom (B5b)', async ({ page }) => {
      await page.goto(oferta())
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBe(0)
      await expect(filters(page)).toBeHidden()

      const open = page.getByRole('button', { name: 'Filtry', exact: true })
      const sheet = page.getByRole('dialog', { name: 'Filtry' })
      await expect(async () => {
        await open.click()
        await expect(sheet).toBeVisible({ timeout: 1000 })
      }).toPass()

      // A choice applies at once; the button says how many it shows and closes the sheet.
      const uslugi = sheet.getByRole('radio', { name: /^Usługi/ })
      await uslugi.click()
      await expect(page).toHaveURL(/rodzaj=uslugi/)
      await expect(uslugi).toBeChecked()
      await sheet.getByRole('button', { name: 'Pokaż 10 pozycji' }).click()
      await expect(sheet).toBeHidden()
      await expect(count(page)).toHaveText('10 pozycji')
      await expect(page.getByRole('button', { name: 'Filtry (1)', exact: true })).toBeVisible()

      // „Wyczyść” inside the sheet disappears with the filters: focus stays in the sheet.
      await page.getByRole('button', { name: 'Filtry (1)', exact: true }).click()
      await sheet.getByRole('button', { name: 'Wyczyść (1)' }).click()
      await expect(page).not.toHaveURL(/rodzaj=/)
      await expect(sheet.getByText('Filtry', { exact: true })).toBeFocused()
      await page.keyboard.press('Escape')

      // Esc closes it and focus goes back to the button.
      const reopen = page.getByRole('button', { name: 'Filtry', exact: true })
      await reopen.click()
      await expect(sheet).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(sheet).toBeHidden()
      await expect(reopen).toBeFocused()
    })
  })
})

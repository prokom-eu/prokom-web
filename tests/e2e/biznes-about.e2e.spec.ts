import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { setTheme, site } from './helpers'

// D3-B PR 2 (docs/zadania/prokombiznes-0611.md §8.2): `/o-firmie` of Biznes on the shared O firmie
// template — the company card with the four authorisation logos, the stats, rules, steps, the
// lines and the visit card. No people, no photos. Runda 1411: no CEIDG and no „Nie musisz wierzyć
// nam na słowo” (the line's switch), both numbers. Data from `pnpm seed`.
const ABOUT = '/o-firmie'

test.describe('Biznes /o-firmie (shared template, §8.2)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('one H1, the company card with NIP, both numbers and four authorisation logos', async ({
    page,
  }) => {
    const response = await page.goto(site('biznes.localhost', ABOUT))
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText(
      'Lokalna firma IT, która zostaje z klientem na lata.',
    )
    await expect(
      page.getByRole('navigation', { name: 'Okruszki' }).locator('[aria-current="page"]'),
    ).toHaveText('O firmie')
    const card = page.locator('[data-company-card]')
    await expect(card).toContainText('NIP')
    // Runda 1411: NIP as plain text, no CEIDG link; both numbers as `tel:`.
    await expect(card.getByRole('link', { name: /CEIDG/ })).toHaveCount(0)
    await expect(card.locator('a[href="tel:+48889003889"]')).toHaveCount(1)
    await expect(card.locator('a[href="tel:+48883200151"]')).toHaveCount(1)
    const logos = card.locator('[data-auth-logo]')
    await expect(logos).toHaveCount(4)
    await expect(logos.locator('img').first()).toHaveAttribute('alt', /.+/)
    // K4-FINAL §1: Posnet and Elzab „Autoryzowany serwis”, GoPOS and InsERT „Autoryzowany partner”.
    await expect(logos.filter({ hasText: 'Autoryzowany serwis' })).toHaveCount(2)
    await expect(logos.filter({ hasText: 'Autoryzowany partner' })).toHaveCount(2)
  })

  test('stats from 2004, the sections of the template, no photos of people', async ({ page }) => {
    await page.goto(site('biznes.localhost', ABOUT))
    const root = page.locator('[data-about-page]')
    await expect(root.locator('[data-stats-strip] li').first()).toContainText('2004')
    for (const id of ['dlaczego', 'marki', 'wspolpraca', 'linie', 'wizyta']) {
      await expect(root.locator(`#${id}`)).toHaveCount(1)
    }
    // Images on the page are logos and maps only (zasada 01.11: bez zdjęć ludzi).
    const pictures = await root
      .locator('img')
      .evaluateAll((images) => images.map((image) => image.getAttribute('alt') ?? ''))
    expect(pictures.every((alt) => !/zespół|właściciel|pracown/i.test(alt))).toBe(true)
  })

  test('runda 1411: brands, no verify cards, the final call with both numbers, no footer lines band', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', ABOUT))
    const brands = page.locator('[data-about-brands]')
    await expect(brands.getByRole('heading', { level: 2 })).toHaveText(
      'Marki, które sprzedajemy, wdrażamy i serwisujemy',
    )
    // Runda 1411 (OFirmie): four authorisation cards, Optivendi and COMEX with their badge in the
    // wall of the other brands, „+ N marek” to /marki.
    const cards = brands.locator('ul').first().locator(':scope > li')
    await expect(cards.filter({ hasText: 'Autoryzowany serwis' })).toHaveCount(2)
    await expect(cards.filter({ hasText: 'Autoryzowany partner' })).toHaveCount(2)
    const wall = brands.getByRole('list', { name: 'Pozostałe marki w ofercie' })
    await expect(wall.getByText('Partner', { exact: true })).toBeVisible()
    await expect(wall.getByText('We współpracy', { exact: true })).toBeVisible()
    await expect(wall.getByRole('link', { name: /\+ \d+ marek/ })).toHaveAttribute('href', '/marki')
    await expect(brands.getByText('Logotypy należą do ich właścicieli.')).toBeVisible()
    // Runda 1411 (ADR-017 „Rozstrzygnięcia 15.11”): „Nie musisz wierzyć nam na słowo” is gone.
    await expect(page.locator('[data-verify-cards]')).toHaveCount(0)
    await expect(page.locator('#sprawdz')).toHaveCount(0)
    const talk = page.locator('[data-talk-band]')
    await expect(talk.getByRole('link', { name: 'Napisz do nas' })).toHaveAttribute(
      'href',
      '/kontakt#formularz',
    )
    await expect(talk.locator('a[href="tel:+48889003889"]')).toBeVisible()
    await expect(talk.locator('a[href="tel:+48883200151"]')).toBeVisible()
    await expect(page.locator('[data-lines-band]')).toBeHidden()
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe on the page (${theme})`, async ({ page }) => {
      await setTheme(page, theme)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(site('biznes.localhost', ABOUT))
      const results = await new AxeBuilder({ page }).include('[data-about-page]').analyze()
      expect(results.violations).toEqual([])
    })
  }
})

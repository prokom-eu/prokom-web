import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { setTheme, site } from './helpers'

// D3-B PR 2 (docs/zadania/prokombiznes-0611.md §8.2): `/o-firmie` of Biznes on the shared O firmie
// template — the company card with the four authorisation logos, the stats, rules, steps, the
// lines, „Nie musisz wierzyć nam na słowo” and the visit card. No people, no photos. Data from
// `pnpm seed`.
const ABOUT = '/o-firmie'

test.describe('Biznes /o-firmie (shared template, §8.2)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('one H1, the company card with NIP, CEIDG and four authorisation logos', async ({
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
    await expect(card.getByRole('link', { name: /CEIDG/ })).toHaveAttribute(
      'href',
      /biznes\.gov\.pl/,
    )
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
    for (const id of ['dlaczego', 'wspolpraca', 'linie', 'wizyta']) {
      await expect(root.locator(`#${id}`)).toHaveCount(1)
    }
    // Images on the page are logos and maps only (zasada 01.11: bez zdjęć ludzi).
    const pictures = await root
      .locator('img')
      .evaluateAll((images) => images.map((image) => image.getAttribute('alt') ?? ''))
    expect(pictures.every((alt) => !/zespół|właściciel|pracown/i.test(alt))).toBe(true)
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

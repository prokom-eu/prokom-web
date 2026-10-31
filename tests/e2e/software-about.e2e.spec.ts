import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SW11b: `/o-firmie` and `/jedna-firma` of the Software line (spec. §6.6–6.7; boards `ONas`,
// `Wszystko`). Data from `pnpm seed` (`src/seed/software/about.ts`); outside production, so the
// photo placeholders and the `[ROK …]` items with raw placeholders are shown.
const HOST = 'software.localhost'

const pageWidth = (page: Page) => page.evaluate(() => document.scrollingElement!.scrollWidth)
const main = (page: Page) => page.locator('main')

test.describe('Software /o-firmie', () => {
  test('hero, numbers, comparison, history, people, salons, own CTA', async ({ page }) => {
    await page.goto(site(HOST, '/o-firmie'))
    await expect(page.locator('h1')).toHaveText('Firma z Rabki. Od 2004 roku.')
    await expect(main(page).getByRole('link', { name: 'Umów rozmowę' }).first()).toHaveAttribute(
      'href',
      '/kontakt',
    )
    await expect(
      main(page).getByRole('heading', { name: 'Konkretnie, bez dmuchania.' }),
    ).toBeVisible()
    await expect(
      main(page)
        .getByRole('img', { name: /Zdjęcie do zrobienia/ })
        .first(),
    ).toBeVisible()
    await expect(main(page).getByRole('heading', { name: 'Kto z Tobą pracuje.' })).toBeVisible()
    await expect(main(page).getByRole('heading', { name: 'Krystian Potaczek' })).toBeVisible()
    // v21: „Jak robimy” and technologies are on the start page only.
    await expect(main(page)).not.toContainText('Jak robimy')
    await expect(page.locator('[data-footer-cta]')).toBeHidden()
  })

  test('comparison switches the rival column', async ({ page }) => {
    await page.goto(site(HOST, '/o-firmie'))
    const section = page.locator('#porownanie')
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(
      'Freelancer, agencja czy PRO-KOM?',
    )
    const table = section.getByRole('table')
    await expect(table).toContainText('rzadko, zwykle po zaliczce')
    await section.getByRole('button', { name: 'vs agencja z miasta' }).click()
    await expect(section.getByRole('button', { name: 'vs agencja z miasta' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(table).toContainText('makiety, zwykle płatne')
    await expect(table).not.toContainText('rzadko, zwykle po zaliczce')
  })

  test('the history keeps the order of the board', async ({ page }) => {
    await page.goto(site(HOST, '/o-firmie'))
    const history = page.locator('section', {
      has: page.getByRole('heading', { name: /Najpierw sprzęt i serwis/ }),
    })
    await expect(history.getByRole('listitem')).toHaveCount(5)
    await expect(history.getByRole('listitem').first()).toContainText('2004')
  })
})

test.describe('Software /jedna-firma', () => {
  test('hero with the lines, five line cards, two examples, gains, CTA', async ({ page }) => {
    await page.goto(site(HOST, '/jedna-firma'))
    await expect(page.locator('h1')).toHaveText(
      'Strona, program, sprzęt i serwis. W jednej firmie.',
    )
    const lines = page.locator('section', {
      has: page.getByRole('heading', { name: 'Każda robi swoje. Razem robią całość.' }),
    })
    await expect(lines.getByRole('heading', { level: 3 })).toHaveCount(5)
    await expect(lines.getByRole('link', { name: 'prokombiznes.pl' })).toHaveAttribute(
      'href',
      'https://prokombiznes.pl',
    )
    await expect(lines).toContainText('PRO-KOM Tech')
    await expect(
      main(page).getByRole('heading', { name: 'Dwa przykłady z Podhala.' }),
    ).toBeVisible()
    await expect(main(page).getByRole('article')).toHaveCount(2)
    await expect(
      main(page).getByRole('heading', { name: 'Jeden kontakt zamiast pięciu.' }),
    ).toBeVisible()
    await expect(page.locator('[data-footer-cta]')).toBeHidden()
  })
})

test.describe('Software about pages on the phone', () => {
  for (const width of [360, 390, 414]) {
    test(`fit ${width} px without sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      for (const path of ['/o-firmie', '/jedna-firma']) {
        await page.goto(site(HOST, path))
        expect(await pageWidth(page), path).toBeLessThanOrEqual(width)
      }
    })
  }

  test('comparison as cards on the phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(site(HOST, '/o-firmie'))
    const section = page.locator('#porownanie')
    await expect(section.getByRole('table')).toBeHidden()
    await expect(section.getByRole('listitem')).toHaveCount(6)
  })
})

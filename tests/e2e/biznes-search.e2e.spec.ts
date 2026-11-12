import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { clickUntilVisible, hydrated, setTheme, site } from './helpers'

// Ctrl K of Biznes on the shared search dialog (plan 0611 §8.1 pkt 5; before: B4a overlay).
// Catalog from `pnpm seed`; the cases do not rely on synonyms (BiznesSettings), which other tests replace.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const overlay = (page: Page) => page.getByRole('dialog', { name: 'Szukaj w ofercie' })
const field = (page: Page) => overlay(page).getByRole('searchbox', { name: 'Szukaj w ofercie' })

/**
 * Types into the search field once it is hydrated: the overlay can show before its field
 * listens, and a phrase typed then never reaches the search (flaky in CI, 08.11).
 */
async function typeIn(page: Page, text: string) {
  await hydrated(field(page))
  await field(page).fill(text)
}

/** "/" works once the header is hydrated: press until the overlay shows. */
async function openWithSlash(page: Page) {
  await expect(async () => {
    await page.keyboard.press('/')
    await expect(overlay(page)).toBeVisible({ timeout: 1000 })
  }).toPass()
}

test.describe('Biznes search', () => {
  test('"/" opens it, a typo still finds registers, Esc closes', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await openWithSlash(page)
    await expect(field(page)).toBeFocused()

    await typeIn(page, 'kasa fiskalan')
    const results = overlay(page).getByRole('region', { name: /Produkty i usługi/ })
    await expect(results.getByRole('link').first()).toHaveAttribute('href', /^\/produkt\//)
    await expect(results.getByRole('link', { name: /Posnet Ergo Online/ })).toBeVisible()
    await expect(overlay(page).getByRole('link', { name: /^Kasy fiskalne/ })).toHaveAttribute(
      'href',
      '/oferta/kasy-fiskalne',
    )

    // Arrow down leaves the field for the first result.
    await page.keyboard.press('ArrowDown')
    await expect(overlay(page).locator('[data-result]:focus')).toHaveCount(1)

    await page.keyboard.press('Escape')
    await expect(overlay(page)).toBeHidden()
  })

  // Plan 0611 §8.1 pkt 5: the preview of the focused result next to the list (from 900 px).
  test('the preview shows the product, adds it to the inquiry and leads to its card', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(site('biznes.localhost'))
    await page.evaluate(() => localStorage.removeItem('pk-cart'))
    await openWithSlash(page)
    await typeIn(page, 'kasa')
    const results = overlay(page).getByRole('region', { name: /Produkty i usługi/ })
    const first = results.getByRole('link').first()
    await expect(first).toHaveAttribute('href', /^\/produkt\//)
    const name = (await first.locator('.font-bold').first().textContent())!.trim()
    const preview = overlay(page).getByRole('complementary', { name: `Podgląd: ${name}` })
    await expect(preview).toBeVisible()
    await expect(preview.getByRole('link', { name: 'Karta →' })).toHaveAttribute(
      'href',
      (await first.getAttribute('href'))!,
    )
    // The second result takes the preview when it gets the focus.
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expect(preview).toBeHidden()

    await page.keyboard.press('ArrowUp')
    await preview.getByRole('button', { name: /^Do zapytania/ }).click()
    await expect(preview.getByRole('button', { name: /^W zapytaniu/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    // „Karta →” leaves a usable page: nothing invisible stays in the top layer.
    await preview.getByRole('link', { name: 'Karta →' }).click()
    await expect(page).toHaveURL(/\/produkt\//)
    await expect(page.locator('dialog[open]')).toHaveCount(0)
    await page
      .getByRole('navigation', { name: 'Menu główne' })
      .getByRole('button', { name: /^Oferta/ })
      .click()
    await expect(page.locator('#oferta-mega')).toBeVisible()
  })

  test('„tel” brings the contact actions on top, „Pokaż wszystkie” leads to the catalog', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    await openWithSlash(page)
    await typeIn(page, 'tel')
    const actions = overlay(page).locator('[data-result]').first()
    await expect(actions).toHaveAttribute('href', /^tel:/)
    await typeIn(page, 'laptop')
    await expect(
      overlay(page).getByRole('link', { name: /^Wszystkie wyniki w ofercie/ }),
    ).toHaveAttribute('href', '/oferta?szukaj=laptop')
  })

  test('"/" can be typed in the search field', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await openWithSlash(page)
    await typeIn(page, 'a/b')
    await expect(field(page)).toHaveValue('a/b')
    await page.keyboard.press('Escape')
    await expect(overlay(page)).toBeHidden()
  })

  test('a phrase with no results offers to ask about it', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await clickUntilVisible(
      page.getByRole('button', { name: 'Szukaj w ofercie' }).first(),
      field(page),
    )
    await typeIn(page, 'zxqvbn')
    await expect(
      overlay(page).getByText('Nie znaleźliśmy „zxqvbn”', { exact: false }),
    ).toBeVisible()
    await expect(overlay(page).getByRole('link', { name: 'Zapytaj o „zxqvbn”' })).toHaveAttribute(
      'href',
      '/zapytanie?fraza=zxqvbn',
    )
  })

  test('the menu sheet opens it on a phone (no room for the loupe in the capsule)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await page.goto(site('biznes.localhost'))
    const sheet = page.getByRole('dialog', { name: 'Menu' })
    await clickUntilVisible(
      page.locator('[data-site-header]').getByRole('button', { name: 'Menu' }),
      sheet,
    )
    await sheet.getByRole('button', { name: 'Szukaj w ofercie' }).click()
    await expect(field(page)).toBeFocused()
    await typeIn(page, 'terminal')
    await expect(
      overlay(page).getByRole('link', { name: /Terminal płatniczy PolCard/ }),
    ).toBeVisible()
    const width = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(width).toBeLessThanOrEqual(360)
  })

  test('closes on the backdrop, not on the empty inside', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await openWithSlash(page)
    await typeIn(page, 'subiekt')
    const box = (await overlay(page).boundingBox())!
    // Empty margin of the dialog, left of the content column.
    await page.mouse.click(box.x + 4, box.y + box.height - 4)
    await expect(overlay(page)).toBeVisible()
    // The backdrop below the dialog.
    await page.mouse.click(box.x + box.width / 2, box.y + box.height + 40)
    await expect(overlay(page)).toBeHidden()
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`axe passes with results open — ${colorScheme}`, async ({ page }) => {
      await setTheme(page, colorScheme)
      await page.goto(site('biznes.localhost'))
      await openWithSlash(page)
      await typeIn(page, 'kasa')
      await expect(
        overlay(page)
          .getByRole('link', { name: /Posnet/ })
          .first(),
      ).toBeVisible()
      // R2: the dialog scales in and the results rise in; axe reads the colours once they stand
      // still (looping animations, e.g. the brand marquee, are left out).
      await page.evaluate(() =>
        Promise.all(
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
            .map((animation) => animation.finished.catch(() => undefined)),
        ),
      )
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(
        violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([])
    })
  }
})

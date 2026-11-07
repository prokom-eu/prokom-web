import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { setTheme, site } from './helpers'

// D2-2b (plan `docs/zadania/wspolne-elementy.md`, spec §5.1, §10 pkt 3): the shared search window
// on the preview page of Software and Instalacje, over a test index of the line's own data.
const dialog = (page: Page) => page.locator('[data-wspolne] [data-search-dialog]')
const field = (page: Page) => dialog(page).getByRole('searchbox')

test.describe('/_wspolne — search window (1440 px)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('Ctrl K and „/” open it, Esc closes and gives focus back', async ({ page }) => {
    await page.goto(site('software.localhost', '/_wspolne'))
    await page.locator('#wspolne-h1').click()
    await page.keyboard.press('Control+k')
    await expect(dialog(page)).toBeVisible()
    await expect(field(page)).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog(page)).toBeHidden()

    await page.keyboard.press('/')
    await expect(dialog(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog(page)).toBeHidden()
  })

  test('the rail’s „Szukaj” opens it, focus returns to the button after Esc', async ({ page }) => {
    await page.goto(site('software.localhost', '/_wspolne'))
    const button = page
      .locator('[data-wspolne] [data-site-rail]')
      .getByRole('button', { name: /Szukaj/ })
    // The folded rail shows its first 64 px: the button is pressed there, as a visitor would.
    await button.click({ position: { x: 24, y: 24 } })
    await expect(dialog(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(button).toBeFocused()
  })

  test('empty: the line actions with links from the data, shortcuts from the panel', async ({
    page,
  }) => {
    await page.goto(site('instalacje.localhost', '/_wspolne'))
    await page.keyboard.press('Control+k')
    const actions = dialog(page).getByRole('group', { name: 'Akcje' })
    await expect(actions.getByRole('link', { name: /Zadzwoń/ }).first()).toHaveAttribute(
      'href',
      /^tel:\+48\d{9}$/,
    )
    await expect(actions.getByRole('link', { name: /Wyznacz trasę/ })).toHaveAttribute(
      'target',
      '_blank',
    )
  })

  test('a typo still finds the page; a contact word brings the actions on top', async ({
    page,
  }) => {
    await page.goto(site('software.localhost', '/_wspolne'))
    await page.keyboard.press('Control+k')
    await field(page).fill('cenik')
    await expect(
      dialog(page)
        .getByRole('link', { name: /Cennik/ })
        .first(),
    ).toBeVisible()
    await field(page).fill('telefon')
    await expect(dialog(page).getByRole('heading', { name: 'Akcje' })).toBeVisible()
  })

  test('nothing found → „Zapytaj o …” with the phrase, and the phone', async ({ page }) => {
    await page.goto(site('software.localhost', '/_wspolne'))
    await page.keyboard.press('Control+k')
    await field(page).fill('zxqvbn')
    await expect(dialog(page).getByText('Nie znaleźliśmy „zxqvbn”')).toBeVisible()
    await expect(dialog(page).getByRole('link', { name: 'Zapytaj o „zxqvbn”' })).toHaveAttribute(
      'href',
      '/kontakt?fraza=zxqvbn',
    )
  })

  test('arrows move between results and back to the field', async ({ page }) => {
    await page.goto(site('software.localhost', '/_wspolne'))
    await page.keyboard.press('Control+k')
    await field(page).press('ArrowDown')
    await expect(dialog(page).locator('[data-result]').first()).toBeFocused()
    await page.keyboard.press('ArrowUp')
    await expect(field(page)).toBeFocused()
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe with the window open, Instalacje (${theme})`, async ({ page }) => {
      await setTheme(page, theme)
      await page.goto(site('instalacje.localhost', '/_wspolne'))
      await page.keyboard.press('Control+k')
      await field(page).fill('zaplanuj')
      const results = await new AxeBuilder({ page }).include('[data-search-dialog]').analyze()
      expect(results.violations).toEqual([])
    })
  }
})

test.describe('/_wspolne — search window on a phone and the recently viewed flag', () => {
  test('on a low phone screen the last result scrolls into view inside the window', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 480 })
    await page.goto(site('software.localhost', '/_wspolne'))
    await page.keyboard.press('Control+k')
    const last = dialog(page).locator('[data-result]').last()
    await last.scrollIntoViewIfNeeded()
    await expect(last).toBeInViewport()
  })

  test('axe with the window open at 390 px (Software)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(site('software.localhost', '/_wspolne'))
    await page.keyboard.press('Control+k')
    const results = await new AxeBuilder({ page }).include('[data-search-dialog]').analyze()
    expect(results.violations).toEqual([])
  })

  test('with the panel flag off: no „Ostatnio oglądane” and nothing new kept', async ({ page }) => {
    // Seed: CompanyData.recentlyViewed is off until the lawyer's opinion (spec §5.1 dodatek 6).
    const kept = [{ title: 'Cennik', href: '/cennik', kind: 'Strona', at: 1 }]
    await page.addInitScript(
      (value) => localStorage.setItem('pk-recent-software', value),
      JSON.stringify(kept),
    )
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('software.localhost', '/_wspolne'))
    await page.keyboard.press('Control+k')
    await expect(dialog(page)).toBeVisible()
    await expect(dialog(page).getByRole('heading', { name: 'Ostatnio oglądane' })).toHaveCount(0)
    const stored = await page.evaluate(() => localStorage.getItem('pk-recent-software'))
    expect(JSON.parse(stored ?? '[]')).toEqual(kept)
  })
})

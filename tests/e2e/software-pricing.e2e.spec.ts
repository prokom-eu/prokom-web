import { expect, test } from '@playwright/test'

import { site } from './helpers'

// SW11a: `/cennik` of the Software line (spec. §6.4, v22; board `Cennik`, stan `89b`). Data from
// `pnpm seed`: the `swPricing` block and the FAQ, solutions of the package (prices, levels).
const HOST = 'software.localhost'
const NBSP = ' '

test.describe('Software /cennik', () => {
  test('hero card, 5 tabs with counts, one „od” price per solution', async ({ page }) => {
    await page.goto(site(HOST, '/cennik'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Ceny bez gwiazdek. Na piśmie.',
    )
    await expect(page.getByText(/^Wszystkie 29 rozwiązań/)).toBeVisible()
    await expect(page.getByText('Najczęściej wybierana')).toBeVisible()

    const tabs = page.getByRole('tablist', { name: 'Kategorie cennika' }).getByRole('tab')
    await expect(tabs).toHaveCount(5)
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
    const panel = page.getByRole('tabpanel')
    await expect(panel.getByRole('heading', { level: 3 })).toHaveCount(8)
    const card = panel.getByRole('listitem').filter({ hasText: 'Strona wizytówka' })
    await expect(card).toContainText(`od${NBSP}999${NBSP}zł`)
    await expect(card).toContainText('W cenie')

    // Keyboard of the ARIA tabs: the arrow moves to „Aplikacje” after two steps.
    await tabs.first().focus()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true')
    await expect(panel.getByRole('listitem').first()).toContainText('Zapytaj o wycenę')
  })

  test('care levels from the solution, each asking the contact form with its level', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/cennik'))
    const care = page.locator('#opieka')
    // DOM order; on the phone CSS puts the recommended one first (tested below).
    await expect(care.getByRole('heading', { level: 3 })).toHaveText([
      'Podstawowa',
      'Rozszerzona',
      'Systemy',
    ])
    await expect(care).toContainText(`299${NBSP}zł`)
    await expect(care).toContainText('Polecamy')
    const ask = care.getByRole('link', { name: 'Zapytaj o opiekę Rozszerzoną →' })
    await expect(ask).toHaveAttribute('href', '/kontakt?poziom=rozszerzona')
    await ask.click()
    await expect(page).toHaveURL(/\/kontakt\?poziom=rozszerzona$/)
    await expect(page.getByRole('radio', { name: 'Opieka lub ratunek' })).toBeChecked()
  })

  test('audit kinds, „Tego nie dopłacasz”, FAQ and its own CTA instead of the footer band', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/cennik'))
    await expect(page.locator('#audyt')).toContainText(`990${NBSP}zł`)
    await expect(page.getByText('Tego nie dopłacasz.')).toBeVisible()
    await expect(page.locator('#faq')).toContainText('Co oznacza cena „od”?')
    await expect(page.locator('[data-footer-cta]')).toBeHidden()
  })
})

test.describe('Software /cennik on a phone', () => {
  // Touch phone emulation in Chromium (`devices[...]` would switch the browser: not in a group).
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  for (const width of [360, 390, 414]) {
    test(`fits ${width} px: no sideways scroll, the recommended care level first`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(site(HOST, '/cennik'))
      const sizes = await page.evaluate(() => ({
        page: Math.max(document.scrollingElement!.scrollWidth, window.innerWidth),
        view: document.documentElement.clientWidth,
      }))
      expect(sizes.page).toBeLessThanOrEqual(sizes.view)
      const levels = page.locator('#opieka').getByRole('heading', { level: 3 })
      const tops = await levels.evaluateAll((elements) =>
        elements.map((element) => [element.textContent, element.getBoundingClientRect().top]),
      )
      const first = [...tops].sort((a, b) => Number(a[1]) - Number(b[1]))[0]
      expect(first?.[0]).toBe('Rozszerzona')
    })
  }
})

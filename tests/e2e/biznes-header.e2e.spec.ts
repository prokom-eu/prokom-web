import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// B3a + B3c (v20): top bar and header of the Biznes line, Oferta ▾ (spec. §3.1–3.2). Data
// from `pnpm seed` (navigation of the design, catalog of B2).
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Główna' })

test.describe('Biznes header', () => {
  test('top bar shows the opening status and the main phone number', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await expect(page.getByText(/^(Otwarte teraz · do|Zamknięte · otwieramy) /)).toBeVisible()
    await expect(page.getByText('Oferty i serwis:').getByRole('link')).toHaveAttribute(
      'href',
      /^tel:\+?\d+$/,
    )
  })

  test('Oferta ▾ works from the keyboard', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const button = mainNav(page).getByRole('button', { name: 'Oferta' })
    await expect(button).toHaveAttribute('aria-expanded', 'false')

    await button.focus()
    await page.keyboard.press('Enter')
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    const panel = page.locator(`#${await button.getAttribute('aria-controls')}`)
    await expect(panel).toBeVisible()

    // Tab goes from the button straight into the panel (DOM order), Esc brings focus back.
    await page.keyboard.press('Tab')
    await expect(panel.locator(':focus')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(button).toBeFocused()
  })

  test('the mega menu lists only categories with products and links them', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await mainNav(page).getByRole('button', { name: 'Oferta' }).click()
    const panel = page.locator('[id$="-offer"]')

    await expect(panel.getByRole('link', { name: 'Kasy i sprzedaż', exact: true })).toHaveAttribute(
      'href',
      /^\/oferta\?grupa=/,
    )
    await expect(panel.getByRole('link', { name: /^Kasy fiskalne \d+ pozycj/ })).toHaveAttribute(
      'href',
      '/oferta/kasy-fiskalne',
    )
    // ADR-012, rozstrzygnięcie 7: the vending category has no products yet.
    await expect(panel.getByText('Maszyny vendingowe')).toHaveCount(0)
    await expect(panel.getByRole('link', { name: /^Cały katalog · \d+ pozycj/ })).toBeVisible()
  })

  test('stays open on a click inside the panel, closes on a click outside', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const button = mainNav(page).getByRole('button', { name: 'Oferta' })
    await button.click()
    // Plain text of the panel: focus leaves the button without a new target.
    await page.getByText('Bez cen na stronie').click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    // Bottom of the window, below the panel.
    await page.mouse.click(10, (page.viewportSize()?.height ?? 720) - 10)
    await expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  test('v20 menu: no Branże ▾, the industries are linked from the mega menu', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const items = mainNav(page).locator(':scope > ul > li')
    await expect(items).toHaveText([
      /^Oferta/,
      'Opieka IT',
      /^GoPOS/,
      /^InsERT/,
      'O firmie',
      'Kontakt',
    ])
    await expect(mainNav(page).getByRole('button', { name: 'Branże' })).toHaveCount(0)
    await mainNav(page).getByRole('button', { name: 'Oferta' }).click()
    await expect(
      page.getByRole('link', { name: 'Rozwiązania dla branż: gastronomia, handel, hotele' }),
    ).toHaveAttribute('href', '/branze/gastronomia')
  })

  // "Zgłoś awarię" → `#kontakt` on the home page once its form section exists (B7).
  test('top bar: no remote help, "Zgłoś awarię" leads to the contact page', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await expect(page.getByRole('link', { name: 'Pomoc zdalna' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Zgłoś awarię' })).toHaveAttribute(
      'href',
      '/kontakt',
    )
  })

  test('the magnifier opens the search', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const magnifier = page
      .getByRole('banner')
      .getByRole('button', { name: 'Szukaj w ofercie (skrót /)' })
    await expect(magnifier).toHaveAttribute('aria-keyshortcuts', '/')
    await magnifier.click()
    await expect(page.getByRole('dialog', { name: 'Szukaj w ofercie' })).toBeVisible()
  })

  // v20: the row fits without scrolling; below 1080 px the full-screen menu takes over.
  for (const width of [1100, 1280, 1440]) {
    test(`the header fits at ${width} px without horizontal scrolling`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site('biznes.localhost'))
      await expect(mainNav(page)).toBeVisible()
      await expect(page.getByRole('banner').getByRole('button', { name: 'Menu' })).toBeHidden()
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }))
      expect(scrollWidth).toBe(innerWidth)
      // One line per item: every item is as tall as the first.
      const heights = await mainNav(page)
        .locator(':scope > ul > li')
        .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height))
      expect(new Set(heights).size).toBe(1)
    })
  }

  test('below 1080 px the full-screen menu replaces the row', async ({ page }) => {
    await page.setViewportSize({ width: 1079, height: 800 })
    await page.goto(site('biznes.localhost'))
    await expect(mainNav(page)).toBeHidden()
    await expect(page.getByRole('banner').getByRole('button', { name: 'Menu' })).toBeVisible()
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`axe passes with the mega menu open — ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto(site('biznes.localhost'))
      await mainNav(page).getByRole('button', { name: 'Oferta' }).click()
      await expect(page.locator('[id$="-offer"]')).toBeVisible()
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(
        violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([])
    })
  }

  test('other lines keep their own header', async ({ page }) => {
    await page.goto(site('instalacje.localhost'))
    await expect(page.getByRole('button', { name: 'Oferta' })).toHaveCount(0)
    await expect(page.getByText('Oferty i serwis:')).toHaveCount(0)
  })
})

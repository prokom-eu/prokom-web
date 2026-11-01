import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { setTheme, site } from './helpers'

// B3a + B3c (v20): top bar and header of the Biznes line, Oferta ▾ (spec. §3.1–3.2). Data
// from `pnpm seed` (navigation of the design, catalog of B2).
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Główna' })

test.describe('Biznes header', () => {
  test('top bar shows the opening status and the main phone number', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    // The home page shows the status in its sections too (B7d); the top bar comes first.
    await expect(
      page.getByText(/^(Otwarte teraz · do|Zamknięte · otwieramy) /).first(),
    ).toBeVisible()
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

  // K4 mega menu v147c (K35 7a): departments switch the middle, categories link their pages.
  test('the mega menu switches departments and links categories and shortcuts', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    await mainNav(page).getByRole('button', { name: 'Oferta' }).click()
    const panel = page.locator('[id$="-offer"]')
    const heading = panel.getByRole('heading', { level: 2 })
    await expect(heading).toHaveText('Kasy i sprzedaż')
    await expect(panel.getByRole('link', { name: /^Kasy fiskalne \d+ pozycj/ })).toHaveAttribute(
      'href',
      '/oferta/kasy-fiskalne',
    )
    await expect(panel.getByRole('link', { name: /^Cały dział · \d+ pozycj/ })).toHaveAttribute(
      'href',
      /^\/oferta\?grupa=/,
    )
    await panel.getByRole('tab', { name: /^Oprogramowanie/ }).hover()
    await expect(heading).toHaveText('Oprogramowanie')
    await expect(panel.getByRole('link', { name: /^Konfigurator/ })).toHaveAttribute(
      'href',
      '/konfigurator',
    )
    await expect(panel.getByRole('link', { name: /^Gotowe zestawy/ })).toHaveAttribute(
      'href',
      '/zestawy',
    )
  })

  // Tabs pattern: arrows switch the department, Tab goes on into the one shown (WCAG 2.1.1).
  test('the departments work from the keyboard', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const button = mainNav(page).getByRole('button', { name: 'Oferta' })
    await button.click()
    const panel = page.locator('[id$="-offer"]')
    await page.keyboard.press('Tab')
    await expect(panel.getByRole('tab', { selected: true })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    const second = panel.getByRole('tab').nth(1)
    await expect(second).toBeFocused()
    await expect(second).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Tab')
    await expect(panel.getByRole('tabpanel').locator(':focus')).toHaveCount(1)
    await expect(panel.getByRole('tabpanel').getByRole('heading', { level: 2 })).toHaveText(
      'Komputery i biuro',
    )
  })

  test('stays open on a click inside the panel, closes on a click outside', async ({ page }) => {
    // A tall window: with the subcategories (K3b′) the panel fills a 720 px one (it scrolls).
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto(site('biznes.localhost'))
    const button = mainNav(page).getByRole('button', { name: 'Oferta' })
    await button.click()
    // Plain text of the panel: focus leaves the button without a new target.
    await page.locator('[id$="-offer"]').getByText('Na skróty').click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    // Below the panel, measured from its own bottom edge.
    const box = await page.locator(`#${await button.getAttribute('aria-controls')}`).boundingBox()
    await page.mouse.click(10, (box?.y ?? 0) + (box?.height ?? 0) + 20)
    await expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  // K4 menu (K33 §2.2): „Gotowe zestawy” moved to the mega menu and the footer; „Marki” (K4f).
  test('K4 menu: Oferta ▾, Marki, Opieka IT, GoPOS, InsERT, O firmie, Kontakt', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    const items = mainNav(page).locator(':scope > ul > li')
    await expect(items).toHaveText([
      /^Oferta/,
      'Marki',
      'Opieka IT',
      /^GoPOS/,
      /^InsERT/,
      'O firmie',
      'Kontakt',
    ])
    await expect(mainNav(page).getByRole('button', { name: 'Branże' })).toHaveCount(0)
  })

  // K4 (K33 §2.1, K36 §1): five lines with their colours, the Konfigurator, no „Zgłoś awarię”.
  test('top bar: the PRO-KOM lines and the Konfigurator, no „Zgłoś awarię”', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const lines = page.getByRole('navigation', { name: 'Linie PRO-KOM' }).getByRole('link')
    await expect(lines).toHaveText(['Biznes', 'Instalacje', 'Software', 'Tech'])
    await expect(page.getByRole('link', { name: 'Zgłoś awarię' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Konfigurator' }).first()).toHaveAttribute(
      'href',
      '/konfigurator',
    )
  })

  test('the magnifier opens the search', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const magnifier = page
      .getByRole('banner')
      .getByRole('button', { name: 'Szukaj w ofercie Ctrl K' })
    await expect(magnifier).toHaveAttribute('aria-keyshortcuts', 'Control+K Meta+K /')
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
      // Shown items only: below 1280 px „Gotowe zestawy” steps out of the row (K3c).
      const heights = await mainNav(page)
        .locator(':scope > ul > li:visible')
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
      await setTheme(page, colorScheme)
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

  test('side rail of subpages from 1400 px: „Szukaj” and the menu with the current page (K33 §2.4)', async ({
    page,
  }) => {
    const hydrationErrors: string[] = []
    page.on('console', (message) => {
      if (/hydrat/i.test(message.text())) hydrationErrors.push(message.text())
    })
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost', '/kontakt'))
    const rail = page.getByRole('navigation', { name: 'Menu boczne' })
    await expect(rail.getByRole('link')).toHaveCount(9)
    await expect(rail.getByRole('link', { name: 'Kontakt' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(rail.getByRole('link', { name: 'Oferta' })).not.toHaveAttribute('aria-current')
    // The click works once the page is hydrated.
    await expect(async () => {
      await rail.getByRole('button', { name: /^Szukaj w ofercie/ }).click()
      await expect(page.getByRole('dialog', { name: 'Szukaj w ofercie' })).toBeVisible({
        timeout: 1000,
      })
    }).toPass()
    expect(hydrationErrors).toEqual([])

    // Below 1400 px the rail is hidden; the start page has its section rail instead.
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(site('biznes.localhost', '/kontakt'))
    await expect(page.getByRole('navigation', { name: 'Menu boczne' })).toBeHidden()
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost'))
    await expect(page.getByRole('navigation', { name: 'Menu boczne' })).toHaveCount(0)
    await expect(
      page.getByRole('navigation', { name: 'Na tej stronie' }).getByRole('button', {
        name: /^Szukaj w ofercie/,
      }),
    ).toBeVisible()
  })
})

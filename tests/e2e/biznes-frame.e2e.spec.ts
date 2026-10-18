import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { api, loginAsAdmin, site } from './helpers'

// B3b: phone menu and bottom bar, the five-column footer and the closable seasonal bar of the
// Biznes line (spec. §3.3, §3.4, §3.6). Data from `pnpm seed`.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) }))).toEqual([])
}

test.describe('Biznes on a phone', () => {
  test.use({ viewport: { width: 390, height: 800 } })

  test('the full-screen menu works from the keyboard', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const open = page.getByRole('button', { name: 'Menu' })
    await open.focus()
    await page.keyboard.press('Enter')
    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu).toBeVisible()

    // Groups fold out into their categories.
    await menu.getByText('Kasy i sprzedaż').click()
    await expect(menu.getByRole('link', { name: 'Kasy fiskalne' })).toBeVisible()
    // On phones the theme switch is in the menu, not in the header.
    await expect(menu.getByRole('button', { name: 'Tryb ciemny' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(open).toBeFocused()
  })

  test('the menu closes when a link is followed', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await page.getByRole('button', { name: 'Menu' }).click()
    await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Kontakt' }).click()
    await expect(page).toHaveURL(/\/kontakt$/)
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden()
  })

  test('the bottom bar calls and leads to the inquiry', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const bar = page.getByRole('navigation', { name: 'Szybki kontakt' })
    await expect(bar.getByRole('link', { name: 'Zadzwoń' })).toHaveAttribute('href', /^tel:/)
    await expect(bar.getByRole('link', { name: 'Zapytanie' })).toHaveAttribute('href', '/zapytanie')
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`axe passes with the menu open — ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto(site('biznes.localhost'))
      await page.getByRole('button', { name: 'Menu' }).click()
      await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()
      await expectNoViolations(page)
    })
  }
})

test.describe('Biznes footer', () => {
  test('has the five columns and the bottom row', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const footer = page.locator('footer')
    for (const name of ['Oferta', 'Najważniejsze', 'Branże i firma', 'Kontakt']) {
      await expect(footer.getByRole('heading', { name, exact: true })).toBeVisible()
    }
    await expect(footer.getByRole('link', { name: 'Cały katalog' })).toHaveAttribute(
      'href',
      '/oferta',
    )
    await expect(footer.getByRole('link', { name: 'Kontakt i dojazd →' })).toBeVisible()
    await expect(footer).toContainText(/NIP \d{10}/)
    // No bottom bar on a desktop.
    await expect(page.getByRole('navigation', { name: 'Szybki kontakt' })).toBeHidden()
  })

  test('other lines keep their own footer', async ({ page }) => {
    await page.goto(site('instalacje.localhost'))
    await expect(
      page.locator('footer').getByRole('heading', { name: 'Najważniejsze' }),
    ).toHaveCount(0)
  })
})

test.describe('seasonal bar', () => {
  test('stays closed for its campaign and comes back with a new one', async ({ page }) => {
    await loginAsAdmin(page)
    const { json: original } = await api(page, 'GET', '/api/globals/company-data?depth=0')
    const setPromo = (campaignId: string) =>
      api(page, 'POST', '/api/globals/company-data', {
        promoBar: { text: 'Przegląd kas przed sezonem', campaignId, lines: ['biznes'] },
      })

    try {
      expect((await setPromo('e2e-a')).status).toBe(200)
      await page.goto(site('biznes.localhost'))
      const bar = page.getByRole('complementary', { name: 'Promocja' })
      await expect(bar).toBeVisible()

      await bar.getByRole('button', { name: 'Zamknij pasek promocji' }).click()
      await expect(bar).toBeHidden()
      await page.reload()
      await expect(page.getByRole('complementary', { name: 'Promocja' })).toBeHidden()

      await page.goto('/admin/login')
      expect((await setPromo('e2e-b')).status).toBe(200)
      await page.goto(site('biznes.localhost'))
      await expect(page.getByRole('complementary', { name: 'Promocja' })).toBeVisible()
    } finally {
      await page.goto('/admin/login')
      const restored = await api(page, 'POST', '/api/globals/company-data', {
        promoBar: original.promoBar ?? {},
      })
      expect(restored.status).toBe(200)
    }
  })
})

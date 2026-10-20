import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// B4b: inquiry list `pk-cart` — counter, drawer, toast, shared between tabs (spec. §3.2, §8.1,
// §9 pkt 3 and 7). Catalog from `pnpm seed`.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const ERGO = 'posnet-ergo-online'
const TERMINAL = 'terminal-platniczy-polcard'

const cartButton = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ })
const drawer = (page: Page) => page.getByRole('dialog', { name: 'Twoje zapytanie' })

/** Sets the list before the page scripts run (as if added on an earlier visit). */
async function withCart(page: Page, items: { id: string; q: number }[]) {
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('e2e-cart-set')) {
      localStorage.setItem('pk-cart', value)
      sessionStorage.setItem('e2e-cart-set', '1')
    }
  }, JSON.stringify(items))
}

async function openDrawer(page: Page) {
  // The click works once the header is hydrated.
  await expect(async () => {
    await cartButton(page).click()
    await expect(drawer(page)).toBeVisible({ timeout: 1000 })
  }).toPass()
}

test.describe('Biznes inquiry list', () => {
  test('adding from the search shows the toast and the counter; it survives a reload', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie')
    await page.getByRole('banner').getByRole('button', { name: 'Szukaj w ofercie' }).first().click()
    const search = page.getByRole('dialog', { name: 'Szukaj w ofercie' })
    await search.getByRole('searchbox').fill('terminal')
    const add = search.getByRole('button', {
      name: 'Dodaj do zapytania: Terminal płatniczy PolCard',
    })
    await add.click()
    await expect(
      search.getByRole('button', { name: 'Usuń z zapytania: Terminal płatniczy PolCard' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('Escape')

    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 1 pozycja')
    await page.reload()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 1 pozycja')
  })

  test('the drawer changes quantities, adds a suggestion, removes and closes on Esc', async ({
    page,
  }) => {
    await withCart(page, [{ id: ERGO, q: 1 }])
    await page.goto(site('biznes.localhost'))
    await openDrawer(page)

    const ergo = drawer(page).getByRole('listitem').filter({ hasText: 'Posnet Ergo Online' })
    await expect(ergo.getByRole('button', { name: 'mniej' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await ergo.getByRole('button', { name: 'więcej' }).click()
    await expect(ergo.getByText('2 szt.')).toBeVisible()

    // "Często dobierane razem" from the keyboard: the suggestion moves onto the list, its row
    // (and the focused button) disappears — focus goes to the drawer's title.
    const title = drawer(page).getByRole('heading', { name: 'Twoje zapytanie' })
    const suggestions = drawer(page).getByRole('region', { name: 'Często dobierane razem' })
    await suggestions
      .getByRole('button', { name: /^Dodaj do zapytania: / })
      .first()
      .focus()
    await page.keyboard.press('Enter')
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 2 pozycje')
    await expect(title).toBeFocused()
    // No toast under the drawer's backdrop: the list itself shows the new position.
    await expect(page.getByText('Dodano do zapytania:')).toHaveCount(0)
    await expect(
      drawer(page).getByRole('link', { name: 'Przejdź do zapytania (2)' }),
    ).toHaveAttribute('href', '/zapytanie')

    await ergo.getByRole('button', { name: 'Usuń: Posnet Ergo Online' }).click()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 1 pozycja')
    await expect(title).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(drawer(page)).toBeHidden()
    await expect(cartButton(page)).toBeFocused()
  })

  test('the list is shared between tabs', async ({ page, context }) => {
    await page.goto(site('biznes.localhost'))
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie')

    const other = await context.newPage()
    await other.goto(site('biznes.localhost'))
    await other.evaluate(
      ([key, value]) => localStorage.setItem(key!, value!),
      ['pk-cart', JSON.stringify([{ id: TERMINAL, q: 1 }])],
    )
    // `storage` fires in the other tabs only: the first one updates without a reload.
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 1 pozycja')
  })

  test('products the catalog does not know leave the list when the drawer opens', async ({
    page,
  }) => {
    await withCart(page, [
      { id: 'nie-ma-takiego', q: 1 },
      { id: ERGO, q: 1 },
    ])
    await page.goto(site('biznes.localhost'))
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 2 pozycje')
    await openDrawer(page)
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 1 pozycja')
    await expect(
      drawer(page).getByRole('listitem').filter({ hasText: 'Posnet Ergo Online' }),
    ).toBeVisible()
  })

  test('an empty list leads to the offer and the contact form', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await openDrawer(page)
    await expect(drawer(page).getByText('Lista jest pusta')).toBeVisible()
    await expect(drawer(page).getByRole('link', { name: 'Przeglądaj ofertę' })).toHaveAttribute(
      'href',
      '/oferta',
    )
    await expect(drawer(page).getByRole('link', { name: /napisz do nas/ })).toHaveAttribute(
      'href',
      '/kontakt#formularz',
    )
  })

  test('the bottom bar opens it on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await withCart(page, [{ id: ERGO, q: 1 }])
    await page.goto(site('biznes.localhost'))
    const bar = page.getByRole('navigation', { name: 'Szybki kontakt' })
    await expect(bar.getByRole('button', { name: 'Zapytanie 1 pozycja' })).toBeVisible()
    await bar.getByRole('button', { name: /^Zapytanie/ }).click()
    await expect(drawer(page)).toBeVisible()
    const width = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(width).toBeLessThanOrEqual(360)
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`axe passes with the drawer open — ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await withCart(page, [{ id: ERGO, q: 2 }])
      await page.goto(site('biznes.localhost'))
      await openDrawer(page)
      await expect(drawer(page).getByText('Posnet Ergo Online').first()).toBeVisible()
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(
        violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([])
    })
  }
})

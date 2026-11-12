import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// M1′ (MOBILE-APLIKACJA §1): screens with their own sticky action show it instead of the tab
// bar. Tab bar, top bar and menu sheet: biznes-frame.e2e.spec.ts. Data from `pnpm seed`.
const THINKBOOK = '/produkt/lenovo-thinkbook-14-g8-g9'
const tabBar = (page: Page) => page.getByRole('navigation', { name: 'Pasek aplikacji' })

test.describe('Biznes phone app — sticky actions', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('a product adds itself from the bottom bar, without the tab bar', async ({ page }) => {
    await page.goto(site('biznes.localhost', THINKBOOK))
    await expect(tabBar(page)).toBeHidden()
    const bar = page.locator('[data-sticky-action]')
    const add = bar.getByRole('button', { name: /^Dodaj do zapytania: / })
    // Clicks work once the page is hydrated.
    await expect(async () => {
      await add.click({ timeout: 1000 })
      await expect(bar.getByRole('button', { name: /^Na liście zapytania: / })).toBeVisible({
        timeout: 1000,
      })
    }).toPass()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('the inquiry page sends from the bottom bar with the count', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pk-cart', JSON.stringify([{ id: 'lenovo-thinkbook-14-g8-g9', q: 1 }]))
    })
    await page.goto(site('biznes.localhost', '/zapytanie'))
    await expect(
      page
        .locator('[data-sticky-action]')
        .getByRole('button', { name: 'Wyślij zapytanie · 1 poz.' }),
    ).toBeVisible()
    await expect(tabBar(page)).toBeHidden()
  })

  test('pages without an action keep the tab bar', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/oferta'))
    await expect(tabBar(page)).toBeVisible()
    await expect(page.locator('[data-sticky-action]')).toHaveCount(0)
  })
})

test.describe('Biznes desktop', () => {
  test('shows neither the tab bar nor a sticky action', async ({ page }) => {
    await page.goto(site('biznes.localhost', THINKBOOK))
    await expect(tabBar(page)).toBeHidden()
    await expect(page.locator('[data-sticky-action]')).toBeHidden()
  })
})

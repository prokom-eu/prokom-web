import { expect, test, type Page } from '@playwright/test'

import { hydrated, site } from './helpers'

// B2-3b: hook-ins of the procurement pages (plan 0611 §6.4, ZAOPATRZENIE §10). Texts from
// `SiteSettings → biznes.procurement` and both pages published by `pnpm seed`.
const biznes = (path: string) => site('biznes.localhost', path)
const IT = '/dostawy-it-dla-firm'
const AGD = '/agd-rtv-dla-firm'

const overlay = (page: Page) => page.getByRole('dialog', { name: 'Szukaj w ofercie' })
const field = (page: Page) => overlay(page).getByRole('searchbox', { name: 'Szukaj w ofercie' })

test.describe('Zaopatrzenie — wpięcia (B2-3b)', () => {
  test('category „Laptopy”: the band above the grid leads to the IT deliveries', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(biznes('/oferta/laptopy'))
    const band = page.locator('[data-supply-band]').first()
    await expect(band).toBeVisible()
    await expect(band).toContainText('Kupujesz 5 sztuk lub więcej?')
    await expect(band.getByRole('link')).toHaveAttribute('href', IT)
  })

  test('category „Laptopy” on a phone: the band follows the 6th card', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(biznes('/oferta/laptopy'))
    const items = page.locator('[data-category-grid] > li')
    await expect(items.nth(6).locator('[data-supply-band]')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
  })

  test('a laptop card links „Policz stanowiska” to the configurator of the IT page', async ({
    page,
  }) => {
    await page.goto(biznes('/produkt/lenovo-thinkbook-14-g8-g9'))
    await expect(page.locator('main [data-supply-link]')).toHaveAttribute('href', `${IT}#zestaw`)
  })

  test('„Hotele i pensjonaty” shows the AGD tile', async ({ page }) => {
    await page.goto(biznes('/branze/noclegi'))
    const tile = page.locator('[data-supply-tiles]').getByRole('link', {
      name: /Telewizory i lodówki do pokoi/,
    })
    await expect(tile).toHaveAttribute('href', AGD)
  })

  test('configurator at „Ponad 10”: the delivery card, for a hotel also AGD', async ({ page }) => {
    await page.goto(biznes(`/konfigurator?kr=${encodeURIComponent('hotel|nowa|10||')}`))
    const card = page.locator('[data-supply-card]')
    await expect(card).toContainText('Przy tej skali zrobimy dostawę')
    await expect(card.getByRole('link', { name: /Dostawy IT dla firm/ })).toHaveAttribute(
      'href',
      `${IT}?typ=recepcja&n=10#zestaw`,
    )
    await expect(card.getByRole('link', { name: /AGD i RTV dla firm/ })).toHaveAttribute(
      'href',
      `${AGD}?typ=pokoj&n=10#zestaw`,
    )

    await page.goto(biznes(`/konfigurator?kr=${encodeURIComponent('hotel|nowa|2||')}`))
    await expect(page.getByRole('heading', { name: 'Twój zestaw jest gotowy' })).toBeVisible()
    await expect(page.locator('[data-supply-card]')).toHaveCount(0)
  })

  test('the footer column „Oferta” lists both pages', async ({ page }) => {
    await page.goto(biznes('/'))
    const footer = page.getByRole('contentinfo')
    await expect(footer.getByRole('link', { name: 'AGD i RTV dla firm' })).toHaveAttribute(
      'href',
      AGD,
    )
    await expect(footer.getByRole('link', { name: 'Dostawy IT dla firm' })).toHaveAttribute(
      'href',
      IT,
    )
  })

  test('Ctrl K „lodówka”: the AGD page on top of the results', async ({ page }) => {
    await page.goto(biznes('/'))
    await expect(async () => {
      await page.keyboard.press('/')
      await expect(overlay(page)).toBeVisible({ timeout: 1000 })
    }).toPass()
    await hydrated(field(page))
    await field(page).fill('lodówka')
    await expect(overlay(page).locator('[data-result]').first()).toHaveAttribute('href', AGD)
  })
})

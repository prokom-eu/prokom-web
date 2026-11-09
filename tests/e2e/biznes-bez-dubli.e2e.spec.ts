import { expect, test } from '@playwright/test'

import { site } from './helpers'

// BIZ-3 B5-3 (audit 0611 P1-2, P1-4, P1-13): no block said twice on the subpages.
const biznes = (path: string) => site('biznes.localhost', path)

test.describe('Biznes subpages without repetition (B5-3)', () => {
  test('a category has one help block: the form with the inquiry steps as its heading', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(biznes('/oferta/laptopy'))
    await expect(page.locator('#jak-zapytac')).toHaveCount(0)
    const help = page.locator('#kontakt')
    await expect(help.getByRole('list', { name: 'Jak wysłać zapytanie' }).first()).toBeVisible()
    await expect(help.getByRole('heading', { name: 'Formularz zapytania' })).toBeVisible()
  })

  test('a brand page without a salon ends with one call to action, no form', async ({ page }) => {
    await page.goto(biznes('/marki/dibal'))
    const cta = page.locator('#kontakt')
    await expect(cta.getByRole('heading', { level: 2 })).toContainText('Dibal')
    await expect(cta.getByRole('link', { name: /Napisz do nas/ })).toHaveAttribute(
      'href',
      '/kontakt#formularz',
    )
    await expect(page.locator('main form')).toHaveCount(0)
    await expect(page.locator('#jak-zapytac')).toHaveCount(0)
  })

  test('the product bento does not repeat the hero highlights', async ({ page }) => {
    await page.goto(biznes('/produkt/posnet-ergo-online'))
    const highlights = await page.locator('main ul[data-highlights] li').allInnerTexts()
    const bento = await page.locator('main [data-bento] [data-tile-value]').allInnerTexts()
    expect(highlights.length).toBeGreaterThan(0)
    expect(bento.length).toBeGreaterThan(0)
    for (const value of bento) {
      expect(highlights.some((text) => text.includes(value.trim()))).toBe(false)
    }
  })

  test('a salon: service and rollout in one block, plan models not repeated below', async ({
    page,
  }) => {
    await page.goto(biznes('/marki/posnet'))
    const care = page.getByRole('region', { name: /Uruchomimy/ })
    await expect(care.locator('#serwis')).toHaveCount(1)
    await expect(care.locator('#wdrozenie')).toHaveCount(1)
    const plans = await page
      .locator('#oferta a[href^="/produkt/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')))
    const rest = await page
      .locator('#oferta-cala a[href^="/produkt/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')))
    expect(plans.length).toBeGreaterThan(0)
    for (const href of plans) expect(rest).not.toContain(href)
  })

  test('GoPOS: the first venue does not repeat the H1', async ({ page }) => {
    await page.goto(biznes('/gopos'))
    const h1 = (await page.getByRole('heading', { level: 1 }).innerText()).replace(/\s+/g, ' ')
    const venue = (await page.locator('#lokal h3').first().innerText()).replace(/\s+/g, ' ')
    expect(venue).not.toBe(h1)
    // Not even a half of it: the first venue is the page's own, only its name shows.
    expect(h1).not.toContain(venue.split(':').at(-1)!.trim() || '—')
  })

  test('an industry links to /gopos instead of repeating its order steps', async ({ page }) => {
    await page.goto(biznes('/branze/gastronomia'))
    await expect(page.getByRole('link', { name: /Zobacz, jak działa GoPOS/ })).toHaveAttribute(
      'href',
      '/gopos',
    )
  })
})

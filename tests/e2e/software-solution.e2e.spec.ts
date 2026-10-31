import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { site } from './helpers'

// SW10a: solution page `/rozwiazania/[slug]` (spec. §6.1, board `Rozwiazanie`, `stany/89a`).
// Data from `pnpm seed`: the field crew app has the full page (`Solutions.page`), the others
// the template from the card and the offer window.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const HOST = 'software.localhost'
const FULL = '/rozwiazania/aplikacja-dla-ekip-w-terenie'
const TEMPLATE = '/rozwiazania/strona-firmowa-z-panelem'

/** JSON-LD objects of the page. */
async function jsonLd(page: import('@playwright/test').Page): Promise<Record<string, unknown>[]> {
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
  return scripts.map((text) => JSON.parse(text) as Record<string, unknown>)
}

test.describe('Software solution page', () => {
  test('full page: hero, tiles, demo, offer, questions and one contact block', async ({ page }) => {
    expect((await page.goto(site(HOST, FULL)))?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /^Aplikacja dla ekip w\sterenie\. Działa bez zasięgu\.$/,
    )
    await expect(page.getByText('Zapytaj o wycenę').first()).toBeVisible()
    await expect(page.getByText('Pierwszy etap', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'W cenie wdrożenia' })).toBeVisible()
    await expect(page.getByText('+ Publikacja w App Store i Google Play')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Zanim zapytasz' })).toBeVisible()
    await expect(page.locator('section[data-final-cta]')).toHaveCount(1)

    const types = (await jsonLd(page)).map((data) => data['@type'])
    expect(types).toEqual(expect.arrayContaining(['BreadcrumbList', 'Service', 'FAQPage']))
    const service = (await jsonLd(page)).find((data) => data['@type'] === 'Service')
    // No price → no offers (spec. §6.1).
    expect(service).not.toHaveProperty('offers')
  })

  test('the demo moves the job when the visitor clicks', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(site(HOST, FULL))
    const steps = page.getByRole('group', { name: 'Etapy zlecenia' })
    await steps.getByRole('button', { name: /Podpis/ }).click()
    await expect(steps.getByRole('button', { name: /Podpis/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByText('Przechodzi samo')).toHaveCount(0)
    const phone = page
      .locator('#jak-dziala')
      .getByRole('button', { name: 'Poproś klienta o podpis' })
    await phone.first().click()
    await expect(
      page.locator('#jak-dziala').getByRole('button', { name: 'Zakończ zlecenie' }).first(),
    ).toBeVisible()
  })

  test('„Chcę takie u siebie” adds the solution to the project', async ({ page }) => {
    await page.goto(site(HOST, FULL))
    const add = page.getByRole('button', { name: 'Chcę takie u siebie' }).first()
    await add.click()
    await expect(page.getByRole('button', { name: '✓ W Twoim projekcie' }).first()).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const stored = await page.evaluate(() => localStorage.getItem('pk-project'))
    expect(stored).toContain('aplikacja-dla-ekip-w-terenie')
  })

  test('template page: name as H1, price offer in JSON-LD, the window steps', async ({ page }) => {
    expect((await page.goto(site(HOST, TEMPLATE)))?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Strona firmowa z panelem')
    await expect(page.getByRole('heading', { name: 'Jak to wygląda' })).toBeVisible()
    const service = (await jsonLd(page)).find((data) => data['@type'] === 'Service')
    expect(service).toHaveProperty('offers.priceSpecification.minPrice')
  })

  test('404 for an unknown solution and on the other lines', async ({ page }) => {
    expect((await page.goto(site(HOST, '/rozwiazania/nie-ma-takiego')))?.status()).toBe(404)
    for (const host of ['biznes.localhost', 'instalacje.localhost']) {
      expect((await page.goto(site(host, TEMPLATE)))?.status()).toBe(404)
    }
  })

  test('no horizontal scroll at 360 px and no axe violations', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    for (const path of [FULL, TEMPLATE]) {
      await page.goto(site(HOST, path))
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, path).toBeLessThanOrEqual(0)
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(violations, path).toEqual([])
    }
  })
})

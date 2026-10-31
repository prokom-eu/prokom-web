import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { site } from './helpers'

// SW10b: industry page `/dla-branz/[branza]` (spec. §6.2, board `Branza` v22). Data from
// `pnpm seed`: only construction is active with its texts; the other 11 answer 404.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const HOST = 'software.localhost'
const PATH = '/dla-branz/budownictwo-i-wykonczenia'

test.describe('Software industry page', () => {
  test('hero opens the wizard with the kind of firm, no „W 60 sekund” section', async ({
    page,
  }) => {
    expect((await page.goto(site(HOST, PATH)))?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Oprogramowanie dla firm, które pracują w terenie, nie przy biurku.',
    )
    await expect(page.getByRole('link', { name: 'Złóż system dla swojej firmy' })).toHaveAttribute(
      'href',
      '/dobierz?firma=bud',
    )
    await expect(page.getByText('W 60 sekund.')).toHaveCount(0)
  })

  test('a problem shows its answer and adds the solution to the quote', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await page.getByRole('button', { name: /Wyceny robię w nocy w Excelu/ }).click()
    const panel = page.locator('#problem-panel')
    await expect(panel.getByRole('heading', { level: 3 })).not.toBeEmpty()
    await panel.getByRole('button', { name: /^Dodaj do wyceny: / }).click()
    await expect(panel.getByRole('button', { name: /^W wycenie: / })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('six cards with prices; a card opens the offer window', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    const cards = page.locator('section[aria-labelledby="rozwiazania-h"] article')
    await expect(cards).toHaveCount(6)
    await expect(cards.first()).toContainText('zł netto')
    await cards.first().getByRole('button').first().click()
    await expect(page.getByRole('dialog', { name: 'System zleceń i grafik ekip' })).toBeVisible()
  })

  test('FAQPage JSON-LD with the four questions', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
    const faq = scripts
      .map((text) => JSON.parse(text) as { '@type': string; mainEntity?: unknown[] })
      .find((data) => data['@type'] === 'FAQPage')
    expect(faq?.mainEntity).toHaveLength(4)
  })

  test('404 for an industry without text, an unknown one and on the other lines', async ({
    page,
  }) => {
    expect((await page.goto(site(HOST, '/dla-branz/transport')))?.status()).toBe(404)
    expect((await page.goto(site(HOST, '/dla-branz/nie-ma-takiej')))?.status()).toBe(404)
    for (const host of ['biznes.localhost', 'instalacje.localhost']) {
      expect((await page.goto(site(host, PATH)))?.status()).toBe(404)
    }
  })

  test('no horizontal scroll at 360 px and no axe violations', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(site(HOST, PATH))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
    expect(violations).toEqual([])
  })
})

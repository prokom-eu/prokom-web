import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// BIZ-1 PR 2 — D12 (docs/zadania/prokombiznes-0611.md §5.3): a phone does not hide what a
// computer shows. Every H2 seen at 1440 px is seen at 390 px too, or it is the title row of a
// section that unfolds (accordion). Long blocks get a shorter form, not `display: none`.

const PAGES = [
  '/',
  '/kontakt',
  '/o-firmie',
  '/ksef',
  '/ulga-na-kase-fiskalna',
  '/oferta/kasy-fiskalne',
  '/oferta/laptopy',
  '/branze/gastronomia',
  '/opieka-it',
]

/** Visible H2 texts of `main`; a heading inside a folded row counts by its title. */
async function headings(page: Page, path: string, width: number): Promise<string[]> {
  await page.setViewportSize({ width, height: 900 })
  await page.goto(site('biznes.localhost', path))
  return page.locator('main h2').evaluateAll((list) =>
    list
      .filter((h) => {
        const box = h.getBoundingClientRect()
        return (box.width > 0 && box.height > 0) || h.closest('summary') !== null
      })
      .map(
        (h) =>
          (h.querySelector('[data-fold-title]') ?? h).textContent?.replace(/\s+/g, ' ').trim() ??
          '',
      ),
  )
}

test.describe('Biznes — telefon nie chowa treści (D12)', () => {
  for (const path of PAGES) {
    test(`${path}: every heading of a computer is on a phone too`, async ({ page }) => {
      test.slow()
      const height = () => page.evaluate(() => document.documentElement.scrollHeight)
      const wide = await headings(page, path, 1440)
      const wideHeight = await height()
      const phone = new Set(await headings(page, path, 390))
      // §5.3: a phone page up to 1.3× the computer one; above that it is listed in the PR.
      const ratio = (await height()) / wideHeight
      test.info().annotations.push({ type: 'wysokość 390/1440', description: ratio.toFixed(2) })
      expect(wide.filter((text) => !phone.has(text))).toEqual([])
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth).toBeLessThanOrEqual(390)
    })
  }

  test('FAQPage data only where the questions are in the page', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    for (const path of ['/ksef', '/oferta/kasy-fiskalne']) {
      await page.goto(site('biznes.localhost', path))
      const data = await page.locator('script[type="application/ld+json"]').allTextContents()
      const faq = data.map((text) => JSON.parse(text)).find((item) => item['@type'] === 'FAQPage')
      expect(faq, path).toBeTruthy()
      const first = faq.mainEntity[0].name as string
      await expect(page.locator('main summary', { hasText: first }).first()).toBeVisible()
    }
  })

  test('a category ends on a phone with the help card: call or describe the need', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto(site('biznes.localhost', '/oferta/kasy-fiskalne'))
    const card = page.locator('[data-phone-help]')
    await expect(card.getByRole('heading', { level: 2 })).toBeVisible()
    await expect(card.getByRole('link', { name: /^\d{3} \d{3} \d{3}$/ })).toHaveAttribute(
      'href',
      /^tel:/,
    )
    await expect(card.getByRole('link', { name: 'Opisz, czego potrzebujesz' })).toHaveAttribute(
      'href',
      /\/zapytanie\?fraza=Kasy/,
    )
    // The full form stays on a computer only: no second form on the phone.
    await expect(page.locator('#kontakt form')).toBeHidden()
  })
})

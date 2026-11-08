import { expect, test } from '@playwright/test'

import { site } from './helpers'

// BIZ-3 B5-1 (audit 0611 P0-7, P3): product photos are described „Marka Model” everywhere they
// show, and small links are at least 24 px tall. Content from `pnpm seed`.
const biznes = (path: string) => site('biznes.localhost', path)

const PAGES = ['/oferta', '/oferta/laptopy', '/zestawy', '/marki/posnet', '/gopos']

test.describe('Biznes product photos and touch targets (B5-1)', () => {
  for (const path of PAGES) {
    test(`${path}: no product photo with an empty alt`, async ({ page }) => {
      await page.goto(biznes(path))
      // Product and bundle cards: the photos inside the card link (brand logo chips are separate).
      const empty = await page
        .locator('main article a img, main article img[src*="/api/media"]')
        .evaluateAll(
          (images) =>
            images.filter(
              (image) =>
                !(image as HTMLImageElement).alt.trim() && !image.closest('.pointer-events-none'),
            ).length,
        )
      expect(empty).toBe(0)
    })
  }

  test('series labels keep their spelling; card names and crumbs are 24 px targets', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(biznes('/oferta/laptopy'))
    const transforms = await page
      .locator('main article[data-card] p.text-xs')
      .evaluateAll((labels) => labels.map((label) => getComputedStyle(label).textTransform))
    // Grouped by series on this page: „Lenovo · ThinkBook”, never „LENOVO · THINKBOOK”.
    expect(transforms.length).toBeGreaterThan(0)
    expect(transforms).not.toContain('uppercase')
    const small = await page
      .locator('main article[data-card] h3 a, main nav[aria-label] li a')
      .evaluateAll(
        (links) =>
          links.filter((link) => {
            const box = link.getBoundingClientRect()
            return box.height > 0 && box.height < 24
          }).length,
      )
    expect(small).toBe(0)
  })
})

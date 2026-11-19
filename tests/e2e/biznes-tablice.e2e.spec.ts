import { expect, test } from '@playwright/test'

import { site } from './helpers'

// Runda 18.11 (D1): „Ekrany i projektory” split into Tablice interaktywne, Projektory and
// Ekrany informacyjne i wideokonferencje; every old address answers 301. Catalog from `pnpm seed`.
const biznes = (path: string) => site('biznes.localhost', path)

test.describe('Biznes: tablice interaktywne, projektory, ekrany (runda 1811, D1)', () => {
  test('every old address of „Ekrany i projektory” answers 301 to its new page', async ({
    page,
    request,
  }) => {
    for (const [from, to] of [
      ['/oferta/ekrany-projektory', '/oferta/tablice-interaktywne'],
      ['/oferta/ekrany-projektory/monitory-interaktywne', '/oferta/tablice-interaktywne'],
      ['/oferta/ekrany-projektory/projektory', '/oferta/projektory'],
      [
        '/oferta/ekrany-projektory/ekrany-informacyjne',
        '/oferta/ekrany-informacyjne/ekrany-informacyjne',
      ],
      [
        '/oferta/ekrany-projektory/wideokonferencje',
        '/oferta/ekrany-informacyjne/wideokonferencje',
      ],
    ] as const) {
      const raw = await request.get(biznes(from), { maxRedirects: 0 })
      expect(raw.status(), from).toBe(301)
      const response = await page.goto(biznes(from))
      expect(response?.status(), from).toBe(200)
      await expect(page).toHaveURL(biznes(to))
    }
  })

  test('the boards name both phrases in the H1 and list FrameWings', async ({ page }) => {
    await page.goto(biznes('/oferta/tablice-interaktywne'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Tablice interaktywne i monitory interaktywne dla szkół i firm',
    )
    await page.goto(biznes('/oferta/tablice-interaktywne/suchoscieralne-akcesoria'))
    await expect(page.locator('[data-category-grid] > li h3 a')).toContainText([/FrameWings/])
  })

  test('projectors have their own category with at least 6 cards, without prices', async ({
    page,
  }) => {
    const response = await page.goto(biznes('/oferta/projektory'))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Projektory')
    expect(await page.locator('[data-category-grid] > li h3 a').count()).toBeGreaterThanOrEqual(6)
    await expect(page.locator('main')).not.toContainText(/\d\s?zł/)
  })

  test('the sitemap lists the new categories, not the old address', async ({ request }) => {
    const xml = await (await request.get(biznes('/sitemap.xml'))).text()
    expect(xml).toContain('/oferta/tablice-interaktywne')
    expect(xml).toContain('/oferta/projektory')
    expect(xml).toContain('/oferta/ekrany-informacyjne/wideokonferencje')
    expect(xml).not.toContain('/oferta/ekrany-projektory')
  })
})

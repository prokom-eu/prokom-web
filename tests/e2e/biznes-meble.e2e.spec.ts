import { expect, test } from '@playwright/test'

import { site } from './helpers'

// Runda 18.11 (D2): „Meble akustyczne” in „Komputery i biuro” — Avtek booths and screens (Vidis
// materials, consent of Vidis), no prices. Catalog from `pnpm seed`.
const biznes = (path: string) => site('biznes.localhost', path)

test.describe('Biznes: meble akustyczne (runda 1811, D2)', () => {
  test('the category lists the booths and the screens, without prices', async ({ page }) => {
    const response = await page.goto(biznes('/oferta/meble-akustyczne'))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Meble akustyczne')
    const cards = page.locator('[data-category-grid] > li h3 a')
    await expect(cards).toHaveCount(5)
    for (const name of ['SonoCubo S', 'SonoCubo M', 'SonoCubo L', 'SonoVelo (']) {
      await expect(cards.filter({ hasText: name }), name).toHaveCount(1)
    }
    await expect(page.locator('main')).not.toContainText(/\d\s?zł/)
  })

  test('a booth card names its source and its sound reduction', async ({ page }) => {
    await page.goto(biznes('/produkt/avtek-sonocubo-s'))
    await expect(page.getByRole('heading', { level: 1 })).toContainText('SonoCubo S')
    await expect(page.locator('main')).toContainText('29,4 dB')
    await expect(page.locator('main a[href*="avtek.pl"]').first()).toBeAttached()
  })

  test('the office plan has the acoustic booth', async ({ page }) => {
    await page.goto(biznes('/plan-firmy?scena=biuro'))
    await expect(
      page.locator('.fp-stage').getByRole('button', { name: /Budka akustyczna/ }),
    ).toBeVisible()
  })

  test('the sitemap lists the category', async ({ request }) => {
    const xml = await (await request.get(biznes('/sitemap.xml'))).text()
    expect(xml).toContain('/oferta/meble-akustyczne')
  })
})

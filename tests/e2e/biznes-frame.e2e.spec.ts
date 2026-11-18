import { expect, test } from '@playwright/test'

import { api, hydrated, loginAsAdmin, site } from './helpers'

// B3b: the theme, the closable seasonal bar and product pictures of the Biznes line (spec. §3.6).
// The shell (brand bar, capsule, rail, footer, bottom bar, menu sheet): biznes-powloka.e2e.spec.ts.
// Data from `pnpm seed`.

test.describe('Biznes theme (ADR-028, replaces D-K4-5)', () => {
  // Keeping the choice after a reload: a11y.e2e.spec.ts („toggles, is announced and survives a reload”).
  // Auto in detail (clock, parameter): wspolne-motyw.e2e.spec.ts.
  test('without a choice: light by day, dark with a dark system', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-18T11:00:00Z')) // 12:00 in Warsaw
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(site('biznes.localhost'))
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })
})

test.describe('seasonal bar', () => {
  test('stays closed for its campaign and comes back with a new one', async ({ page }) => {
    await loginAsAdmin(page)
    const { json: original } = await api(page, 'GET', '/api/globals/company-data?depth=0')
    const setPromo = (campaignId: string) =>
      api(page, 'POST', '/api/globals/company-data', {
        promoBar: { text: 'Przegląd kas przed sezonem', campaignId, lines: ['biznes'] },
      })

    try {
      expect((await setPromo('e2e-a')).status).toBe(200)
      await page.goto(site('biznes.localhost'))
      const bar = page.getByRole('complementary', { name: 'Promocja' })
      await expect(bar).toBeVisible()

      const close = bar.getByRole('button', { name: 'Zamknij pasek promocji' })
      await hydrated(close)
      await close.click()
      await expect(bar).toBeHidden()
      await page.reload()
      await expect(page.getByRole('complementary', { name: 'Promocja' })).toBeHidden()

      await page.goto('/admin/login')
      expect((await setPromo('e2e-b')).status).toBe(200)
      await page.goto(site('biznes.localhost'))
      await expect(page.getByRole('complementary', { name: 'Promocja' })).toBeVisible()
    } finally {
      await page.goto('/admin/login')
      const restored = await api(page, 'POST', '/api/globals/company-data', {
        promoBar: original.promoBar ?? {},
      })
      expect(restored.status).toBe(200)
    }
  })
})

// K31b: product photos stand on the studio; a product without a photo shows its category icon —
// never an empty `<img>` (K31-ZMIANY §4.10).
test.describe('product pictures', () => {
  for (const path of [
    '/',
    '/oferta',
    '/oferta/kasy-fiskalne',
    '/produkt/posnet-ergo-online',
    // A card without a manufacturer photo (K31-ZMIANY §4.10); the ThinkPad P1 Gen 9 used before
    // has PSREF photos since 14.11.
    '/produkt/eset-small-business-security',
  ]) {
    test(`no empty or broken <img> on ${path}`, async ({ page }) => {
      await page.goto(site('biznes.localhost', path))
      await page.evaluate(async () => {
        // Lazy pictures below the fold load only when scrolled to.
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y)
          await new Promise((resolve) => setTimeout(resolve, 30))
        }
      })
      await page.waitForLoadState('networkidle')
      const broken = await page
        .locator('img')
        .evaluateAll((images) =>
          (images as HTMLImageElement[])
            .filter((img) => !img.getAttribute('src') || (img.complete && img.naturalWidth === 0))
            .map((img) => img.outerHTML.slice(0, 120)),
        )
      expect(broken).toEqual([])
    })
  }

  test('a licence without a photo shows the licence key, never „no photo”', async ({ page }) => {
    // Audit 14.11 P1-1, runda 1411 R8: software says what it is — the „klucz licencji” cover
    // with the licence model, never „no photo”.
    await page.goto(site('biznes.localhost', '/produkt/eset-small-business-security'))
    await expect(page.getByText('Zdjęcia producenta jeszcze nie ma.')).toHaveCount(0)
    const cover = page.locator('[data-cover="licence"]').first()
    await expect(cover).toBeVisible()
    await expect(cover).toContainText('Licencja elektroniczna')
    await expect(cover).toContainText('Small Business Security')
  })
})

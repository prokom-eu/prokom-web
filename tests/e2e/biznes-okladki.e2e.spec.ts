import { expect, test } from '@playwright/test'

import { site } from './helpers'

// Runda 1411 R8 (board `Karty.dc.html`): a licence or a service without a photo gets a cover built
// from its data — no card of the catalog shows the empty stand-in (icon + „Licencja
// elektroniczna” / „Usługa PRO-KOM”). Catalog from `pnpm seed`.
const biznes = (path: string) => site('biznes.localhost', path)

test.describe('Biznes — covers of licences and services (runda 1411 R8)', () => {
  test('no card of the catalog renders the empty stand-in', async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto(biznes('/oferta'))
    const groups = await page
      .locator('a[href^="/oferta?grupa="]')
      .evaluateAll((links) => [
        ...new Set(
          links.map((link) => new URL((link as HTMLAnchorElement).href).searchParams.get('grupa')),
        ),
      ])
    expect(groups.length).toBeGreaterThan(3)
    let covers = 0
    for (const group of groups) {
      // `strona` keeps the earlier pages: a high one lists the whole group.
      await page.goto(biznes(`/oferta?grupa=${group}&strona=60`))
      const cards = page.locator('[data-card]')
      expect(await cards.count(), group ?? '').toBeGreaterThan(0)
      await expect(
        cards.locator('[data-stage-fallback]:not([data-cover])'),
        group ?? '',
      ).toHaveCount(0)
      covers += await cards.locator('[data-cover]').count()
    }
    expect(covers).toBeGreaterThan(10)
  })

  test('a licence: the key with the logo, the plan and the subscription', async ({ page }) => {
    await page.goto(biznes('/produkt/m365-business-standard'))
    const cover = page.locator('[data-cover="licence"]').first()
    await expect(cover).toBeVisible()
    await expect(cover).toContainText('Microsoft 365 Business Standard')
    await expect(cover).toContainText('Subskrypcja · na użytkownika')
    await expect(page.getByText('Licencja elektroniczna — bez pudełka')).toHaveCount(0)
  })

  test('a service: the register on a navy cover, the authorised badge, three words', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(biznes('/produkt/przeglad-kasy-fiskalnej'))
    const cover = page.locator('[data-cover="service"]').first()
    await expect(cover).toBeVisible()
    await expect(cover.locator('img')).toHaveCount(1)
    await expect(cover).toContainText('Autoryzowany serwis')
    await expect(cover).toContainText('Posnet')
    await expect(page.getByText('Usługa PRO-KOM · u Ciebie w firmie')).toHaveCount(0)
    // Only the fiscal registers carry the badge.
    await page.goto(biznes('/produkt/przeglad-it'))
    await expect(page.locator('[data-cover="service"]').first()).not.toContainText(
      'Autoryzowany serwis',
    )
  })
})

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { hydrated, setTheme, site } from './helpers'

// pro-kom.eu `/linie` (H3-1, spec §6.2, board 02): the catalog of `HubServices` with filters, the
// chosen service in the address (`?u=`), the sheet on a phone. Needs `pnpm seed` (tenant `prokom`).
const HUB = 'prokom.localhost'

test.describe('pro-kom.eu — /linie (spec §6.2)', () => {
  test('H1, title and every section of the page', async ({ page }) => {
    const response = await page.goto(site(HUB, '/linie'))
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle('Linie PRO-KOM — co gdzie załatwisz')
    await expect(page.locator('h1')).toHaveText('Co gdzie załatwisz.')
    for (const id of ['katalog', 'linie', 'razem', 'dalej']) {
      await expect(page.locator(`section#${id}`), id).toHaveCount(1)
    }
  })

  test('is not a page of the line domains', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/linie'))
    expect(response?.status()).toBe(404)
  })

  test('the search filters the catalog and the chosen service goes to the address', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HUB, '/linie'))
    const services = page.locator('#katalog .pk-osv')
    const all = await services.count()
    expect(all).toBeGreaterThan(20)
    const search = page.getByRole('searchbox')
    await hydrated(search)
    await search.fill('kasa fiskalna')
    await expect.poll(() => services.count()).toBeLessThan(all)
    await services.first().click()
    await expect(page).toHaveURL(/[?&]u=[a-z0-9]+/)
    await expect(page.locator('#usluga h2')).toHaveText(
      (await services.first().locator('.pk-osv__title').textContent()) ?? '',
    )
  })

  test('a link to a service opens it, the line filter keeps only that line', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HUB, '/linie?linia=tech&u=nie-ma'))
    const groups = page.locator('#katalog .pk-ogr')
    await expect(groups).toHaveCount(1)
    // An unknown service key is ignored: the first matching one is shown.
    await expect(page.locator('#usluga h2')).toHaveText(
      (await groups.locator('.pk-osv__title').first().textContent()) ?? '',
    )
  })

  test('nothing found: the phone and „show everything”', async ({ page }) => {
    await page.goto(site(HUB, '/linie?q=zzzzzz'))
    const reset = page.getByRole('button', { name: 'Pokaż całą ofertę' })
    await expect(reset).toBeVisible()
    await expect(page.locator('#katalog a[href^="tel:"]')).toHaveCount(1)
    await hydrated(reset)
    await reset.click()
    await expect(page.locator('#katalog .pk-osv').first()).toBeVisible()
  })

  test('on a phone the service opens as a modal sheet; Esc gives focus back', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(site(HUB, '/linie'))
    await expect(page.locator('#usluga')).toBeHidden()
    const first = page.locator('#katalog .pk-osv').first()
    const title = (await first.locator('.pk-osv__title').textContent()) ?? ''
    await hydrated(first)
    await first.click()
    const sheet = page.getByRole('dialog', { name: title })
    await expect(sheet).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(first).toBeFocused()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  for (const theme of ['dark', 'light'] as const) {
    test(`no axe violations in the ${theme} theme`, async ({ page }) => {
      await setTheme(page, theme)
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(site(HUB, '/linie'))
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  }
})

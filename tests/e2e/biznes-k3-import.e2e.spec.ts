import { expect, test, type Page } from '@playwright/test'

import { forbiddenContent } from '../../src/lib/catalog/contentRules'
import { slugFromName } from '../../src/seed/biznes/map'
import { site } from './helpers'

// K3a-2: the catalog after the K3 import (`pnpm seed` → `seed:biznes`, K3-KATALOG §4, §10).
const THINKBOOK = '/produkt/lenovo-thinkbook-14-g8-g9'

/** Status and target of the first answer of a path (the browser follows redirects itself). */
async function firstHop(page: Page, path: string) {
  const response = await page.goto(site('biznes.localhost', path))
  const first = response?.request().redirectedFrom()?.response() ?? null
  return { first: await first, final: response }
}

test.describe('Biznes catalog after the K3 import', () => {
  test('shows a new K3 card with its content, indexed', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', THINKBOOK))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lenovo ThinkBook 14 G8 / G9')
    await expect(page.getByText('Lekki 14-calowy laptop do biura').first()).toBeVisible()
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0)
  })

  test('sends the address of a card replaced by a family to the new card (301)', async ({
    page,
  }) => {
    const { first, final } = await firstHop(
      page,
      `/produkt/${slugFromName('Lenovo ThinkBook 14 Gen 8')}`,
    )
    expect(first?.status()).toBe(301)
    expect(final?.url()).toBe(site('biznes.localhost', THINKBOOK))
    expect(final?.status()).toBe(200)
  })

  test('sends the address of a removed card to its category (301)', async ({ page }) => {
    const { first, final } = await firstHop(page, `/produkt/${slugFromName('Honeywell CT45')}`)
    expect(first?.status()).toBe(301)
    expect(final?.url()).toBe(site('biznes.localhost', '/oferta/skanery-kolektory-etykiety'))
  })

  test('hides a card waiting for the boss (404)', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/produkt/opieka-informatyczna'))
    expect(response?.status()).toBe(404)
  })

  test('keeps a card „Do sprawdzenia” visible but out of the index', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/produkt/samsung-om'))
    expect(response?.status()).toBe(200)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
  })

  test('shows a new K3.1 card (K31a)', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/produkt/dell-pro-14-premium'))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dell Pro 14 Premium')
  })

  test('sends a split multi-model card to its first new card, „Do sprawdzenia” (301)', async ({
    page,
  }) => {
    const { first, final } = await firstHop(page, '/produkt/lenovo-yoga-pro')
    expect(first?.status()).toBe(301)
    expect(final?.url()).toBe(site('biznes.localhost', '/produkt/lenovo-yoga-pro-7-15'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Lenovo Yoga Pro 7 15 (Gen 11)',
    )
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
  })

  test('links only producers among the sources, never a shop (K31-ZMIANY §4.9)', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', '/produkt/lenovo-yoga-pro-7-15'))
    await expect(page.locator('a[href*="psref.lenovo.com"]')).not.toHaveCount(0)
    await expect(page.locator('a[href*="elenovo.pl"]')).toHaveCount(0)
  })

  test('shows no price and no banned brand on catalog pages (K3-KATALOG §10)', async ({ page }) => {
    // „W cenie” is still a section name of the category and product pages — renamed in K3b′
    // and K31b; the K3 data itself is checked for it in `k3-content.test.ts`.
    const rules = (text: string) => forbiddenContent(text).filter((rule) => rule !== 'w cenie')
    for (const path of [
      '/oferta',
      '/oferta/komputery-monitory',
      THINKBOOK,
      '/produkt/posnet-ergo-online',
    ]) {
      await page.goto(site('biznes.localhost', path))
      const text = await page.locator('main').innerText()
      expect(rules(text), path).toEqual([])
    }
  })
})

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { pressUntilVisible, site } from './helpers'

// pro-kom.eu search (H1-3, spec §5.6): the window with the hub's index and `/szukaj`.
// Needs `pnpm seed` (tenant `prokom` with `pnpm seed:prokom` content).
const HUB = 'prokom.localhost'

test.describe('pro-kom.eu — search window', () => {
  test('Ctrl K finds a service of a line in the hub index', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HUB))
    const dialog = page.locator('[data-search-dialog]')
    // Retried until the page is hydrated (before that nothing listens to the keys).
    await pressUntilVisible(page, 'Control+k', dialog)
    await dialog.getByRole('searchbox').fill('kamery')
    await expect(dialog.getByRole('link', { name: /Monitoring i kamery/ })).toBeVisible()
  })
})

test.describe('pro-kom.eu — /szukaj', () => {
  test('results: the best hit, a line filter with counts, noindex', async ({ page }) => {
    await page.goto(site(HUB, '/szukaj?q=kamery'))
    await expect(page.locator('h1')).toHaveText('Szukasz: „kamery”')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    const best = page.locator('section', { hasText: 'Najlepsze dopasowanie' })
    await expect(best).toContainText('Monitoring i kamery')
    const filters = page.getByRole('navigation', { name: 'Filtruj według linii' })
    await filters.getByRole('link', { name: /Instalacje/ }).click()
    await expect(page).toHaveURL(/linia=instalacje/)
    await expect(filters.getByRole('link', { name: /Instalacje/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('nothing found: „Nie mamy …” with the company phone and a contact link', async ({
    page,
  }) => {
    await page.goto(site(HUB, '/szukaj?q=zzqqxx'))
    const none = page.locator('section', { hasText: 'Nie mamy „zzqqxx” na liście.' })
    await expect(none).toBeVisible()
    await expect(none.locator('a[href^="tel:"]')).toBeVisible()
    await expect(none.getByRole('link', { name: 'Napisz, o co chodzi →' })).toHaveAttribute(
      'href',
      '/kontakt?fraza=zzqqxx',
    )
  })

  test('no axe violations on the results page', async ({ page }) => {
    await page.goto(site(HUB, '/szukaj?q=kasa'))
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('the hub search is not on a line domain, and its title does not leak there', async ({
    page,
  }) => {
    const response = await page.goto(site('biznes.localhost', '/szukaj?q=kamery'))
    expect(response?.status()).toBe(404)
    await expect(page).not.toHaveTitle(/Szukaj w PRO-KOM/)
    const api = await page.evaluate(() => fetch('/api/hub-search-index').then((r) => r.status))
    expect(api).toBe(404)
  })
})

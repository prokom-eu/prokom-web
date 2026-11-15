import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// ADR-I006: town pages `/obszar/<slug>` (texts in code, services and salon from `pnpm seed`).
const HOST = 'instalacje.localhost'

async function jsonLdTypes(page: Page) {
  return page.locator('script[type="application/ld+json"]').evaluateAll((els) =>
    els.flatMap((e) => {
      const data = JSON.parse(e.textContent ?? '{}') as unknown
      const nodes = (Array.isArray(data) ? data : [data]) as Record<string, unknown>[]
      return nodes
        .flatMap((n) => [n, ...((n['@graph'] as Record<string, unknown>[]) ?? [])])
        .map((n) => n['@type'])
    }),
  )
}

test.describe('Instalacje town pages', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('a town page: h1, title, services with links, FAQ and structured data', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const response = await page.goto(site(HOST, '/obszar/nowy-targ'))
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle('Instalacje Nowy Targ: monitoring | PRO-KOM Instalacje')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Instalacje Nowy Targ: monitoring, alarmy, smart home',
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/obszar\/nowy-targ$/,
    )
    // Services from the panel: each card links to its service page.
    const services = page.locator('#uslugi .sgpc')
    await expect(services).toHaveCount(5)
    await expect(services.first().getByRole('link')).toHaveAttribute('href', '/monitoring')
    await expect(page.locator('#faq')).toContainText('Czy kamery wytrzymają mróz w Nowym Targu?')
    const types = await jsonLdTypes(page)
    for (const type of ['Service', 'BreadcrumbList', 'FAQPage']) expect(types).toContain(type)
    // Nearby towns link to their own pages, the footer to the area.
    await expect(page.getByRole('link', { name: 'Poronin' }).first()).toHaveAttribute(
      'href',
      '/obszar/poronin',
    )
    await expect(
      page.locator('[data-site-footer]').getByRole('link', { name: 'Obszar działania' }).first(),
    ).toHaveAttribute('href', '/obszar')
  })

  test('the list links every town; unknown towns and districts are 404', async ({ page }) => {
    await page.goto(site(HOST, '/obszar'))
    await expect(page.locator('.sgq a')).toHaveCount(17)
    for (const path of ['/obszar/gdansk', '/obszar/krakow-podgorze']) {
      const response = await page.goto(site(HOST, path))
      expect(response?.status(), path).toBe(404)
    }
  })

  test('a service page links the town pages', async ({ page }) => {
    await page.goto(site(HOST, '/monitoring'))
    const strip = page.getByRole('region', { name: 'Obszar działania' })
    await expect(strip.getByRole('link', { name: 'Kraków' })).toHaveAttribute(
      'href',
      '/obszar/krakow',
    )
  })
})

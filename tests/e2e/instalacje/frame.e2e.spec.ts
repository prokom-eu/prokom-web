import { expect, test } from '@playwright/test'

import { api, loginAsAdmin, site, tenantId } from '../helpers'

// I1: smoke test of the Instalacje line — its own frame, the theme from the system (ADR-I003 §6),
// and invisibility of an inactive tenant (ADR-I001 §6). Data from `pnpm seed`. The line-only
// routes get their 404 test with their first page (I10, I11): until then they 404 everywhere.
const HOST = 'instalacje.localhost'

const surface = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--surface').trim().toLowerCase()

test.describe('Instalacje frame', () => {
  test('answers 200 on its own domain with its line and frame', async ({ page }) => {
    const response = await page.goto(site(HOST))
    expect(response?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('data-line', 'instalacje')
    await expect(
      page.locator('#naglowek').getByRole('link', { name: 'PRO-KOM Instalacje — strona główna' }),
    ).toHaveCount(1)
    // I3: the footer of the design shows the line's phone (the e-mail is on the contact page).
    await expect(page.locator('#stopka a[href^="tel:"]').first()).toBeVisible()
  })

  test('follows the system theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(site(HOST))
    expect(await page.evaluate(surface)).toBe('#f4f5f1')

    await page.emulateMedia({ colorScheme: 'dark' })
    expect(await page.evaluate(surface)).toBe('#101412')
  })

  test('is installable: theme colour, safe areas and a manifest (ADR-I004)', async ({ page }) => {
    await page.goto(site(HOST))
    const themeColors = await page
      .locator('meta[name="theme-color"]')
      .evaluateAll((metas) =>
        metas.map((m) => [m.getAttribute('media'), m.getAttribute('content')]),
      )
    expect(themeColors).toEqual([
      ['(prefers-color-scheme: light)', '#f4f5f1'],
      ['(prefers-color-scheme: dark)', '#101412'],
    ])
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      /viewport-fit=cover/,
    )
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      'href',
      '/manifest.webmanifest',
    )

    // Through the browser: Node does not resolve `*.localhost`.
    const manifest = await page.goto(site(HOST, '/manifest.webmanifest'))
    expect(manifest?.status()).toBe(200)
    expect(manifest?.headers()['content-type']).toContain('application/manifest+json')
    expect(await manifest?.json()).toMatchObject({
      name: 'PRO-KOM Instalacje',
      display: 'standalone',
      start_url: '/',
    })
  })

  test('other lines get no manifest nor theme colour', async ({ page }) => {
    // Biznes: Software has its own since SWR2 (MOBILE-APLIKACJA §4 pkt 8).
    const manifest = await page.goto(site('biznes.localhost', '/manifest.webmanifest'))
    expect(manifest?.status()).toBe(404)
    await page.goto(site('biznes.localhost'))
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(0)
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(0)
  })

  test('an inactive tenant answers 404', async ({ page, context }) => {
    await loginAsAdmin(page)
    const id = await tenantId(page, 'instalacje')
    const setActive = async (active: boolean) =>
      expect((await api(page, 'PATCH', `/api/tenants/${id}`, { active })).status).toBe(200)

    const visitor = await context.newPage()
    try {
      await setActive(false)
      expect((await visitor.goto(site(HOST)))?.status()).toBe(404)
    } finally {
      await setActive(true)
    }
    expect((await visitor.goto(site(HOST)))?.status()).toBe(200)
  })
})

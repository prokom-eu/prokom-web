import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { api, loginAsAdmin, site, tenantId } from './helpers'

// B7a: the Biznes home page — hero with the department wheel, need tiles, brands bar
// (spec. §4 pkt 1–3, ZMIANY-v20 §2). Data from `pnpm seed` (catalog and `seedBiznesHome`).

test.describe('Biznes home page', () => {
  test('hero: one h1, wizard CTA, phone, trust line', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const hero = page.locator('#start')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('Kasy, komputery i opieka IT.')
    await expect(page.locator('h1')).toContainText('Jeden telefon do')
    await expect(hero.getByRole('link', { name: /Dobierz zestaw w 60 sekund/ })).toHaveAttribute(
      'href',
      '/kreator',
    )
    await expect(hero.locator('a[href^="tel:"]')).toBeVisible()
    await expect(hero).toContainText('Serwis Posnet i Elzab · partner GoPOS i InsERT')
    await expect(hero.getByRole('link', { name: 'Zobacz plan Twojej firmy ↓' })).toHaveAttribute(
      'href',
      '#plan',
    )
  })

  test('the department wheel shows the picked department with its count', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const departments = page.getByRole('list', { name: 'Działy oferty' }).getByRole('button')
    await expect(departments).toHaveCount(5)

    const software = departments.filter({ hasText: 'Oprogramowanie' })
    await software.click()
    await expect(software).toHaveAttribute('aria-pressed', 'true')
    const core = page.locator('#start [data-surface="dark"]')
    await expect(core).toContainText('Oprogramowanie')
    await expect(core).toContainText(/\d+ pozycj/)

    // A second click goes back to "your company"; the automatic switching stopped.
    await software.click()
    await expect(software).toHaveAttribute('aria-pressed', 'false')
    await expect(core).toContainText('Twoja firma')
    await page.waitForTimeout(4500)
    await expect(core).toContainText('Twoja firma')
  })

  test('product pictures of the wheel link to product pages', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const pictures = page
      .getByRole('list', { name: 'Przykładowe produkty działów' })
      .getByRole('link')
    expect(await pictures.count()).toBeGreaterThan(5)
    await expect(pictures.first()).toHaveAttribute('href', /^\/produkt\//)
  })

  test('four need tiles with their links, KSeF counting days', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const tiles = page.getByTestId('need-tile')
    await expect(tiles).toHaveCount(4)
    await expect(tiles.nth(0)).toHaveAttribute('href', '/kreator')
    await expect(tiles.nth(1)).toHaveAttribute('href', /^tel:/)
    await expect(tiles.nth(3)).toHaveAttribute('href', '/opieka-it')
    await expect(tiles.nth(0)).toContainText('700 zł')
    await expect(tiles.nth(2)).toContainText(/\d+ dni|1 dzień|dziś/)
    await expect(tiles.nth(3)).toContainText('0 zł przegląd')
  })

  test('brands bar: every logo once for screen readers, with alt', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await expect(
      page.getByRole('heading', { name: 'Marki, które sprzedajemy, wdrażamy i serwisujemy' }),
    ).toBeVisible()
    const logos = page.locator('.animate-marquee > ul:not([aria-hidden]) img')
    expect(await logos.count()).toBeGreaterThan(5)
    for (const alt of await logos.evaluateAll((imgs) => imgs.map((i) => i.getAttribute('alt'))))
      expect(alt).toMatch(/^Logo /)
  })

  test('reduced motion: no turning wheel, no moving brands', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(site('biznes.localhost'))
    const animation = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el).animationName)
    expect(await animation('.animate-marquee')).toBe('none')
    expect(await animation('[aria-label="Przykładowe produkty działów"]')).toBe('none')
    // A static, wrapped set of logos: no scroll area that a keyboard cannot reach.
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violations.map((v) => v.id)).toEqual([])
    await context.close()
  })

  test('no prices, leasing or instalments on the page', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/leasing|\braty\b|\d+[,.]\d{2}\s*zł/i)
  })
})

test.describe('Biznes blocks on other lines', () => {
  // Without `?draft=true`: Payload does not validate drafts (known since S5), the renderer
  // skips such a block anyway (`renderableBlocks`).
  test('a Biznes block cannot be published on another line', async ({ page }) => {
    await loginAsAdmin(page)
    const software = await tenantId(page, 'software')
    const result = await api(page, 'POST', '/api/pages', {
      tenant: software,
      title: 'E2E bzHero',
      slug: `e2e-bz-${Date.now()}`,
      layout: [{ blockType: 'bzHero', heading: 'Nie tutaj', cta: { label: 'x', href: '/x' } }],
      _status: 'published',
    })
    const created = result.json.doc as { id?: number } | undefined
    if (created?.id) await api(page, 'DELETE', `/api/pages/${created.id}`)
    expect(result.status).toBe(400)
  })
})

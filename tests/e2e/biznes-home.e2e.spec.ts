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

// B7b: „Oferta” and „Najczęściej wybierane” (spec. §4 pkt 4–5, ZMIANY-v20 §2.2–2.3).
test.describe('Biznes home page: offer and featured', () => {
  test('offer: lead with catalog numbers, five departments with their top categories', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    const offer = page.getByRole('region', { name: 'Wszystko dla firmy, w pięciu działach.' })
    await expect(offer).toContainText(/\d+ produktów i usług od \d+ marek\./)
    await expect(offer).not.toContainText('{produkty}')
    await expect(offer.getByRole('link', { name: /Cały katalog · \d+ pozycj/ })).toHaveAttribute(
      'href',
      '/oferta',
    )
    const departments = offer
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { level: 3 }) })
    await expect(departments.filter({ hasText: 'Cały dział' })).toHaveCount(5)
    const sales = departments.filter({ hasText: 'Kasy i sprzedaż' })
    await expect(sales.getByRole('link', { name: /Cały dział/ })).toHaveAttribute(
      'href',
      '/oferta?grupa=sprzedaz',
    )
    await expect(sales.locator('a[href^="/oferta/"]')).toHaveCount(3)
    // Services show status rows instead of pictures.
    await expect(departments.filter({ hasText: 'Serwis i usługi' })).toContainText('Opieka IT')
  })

  test('offer: three system cards with partner logos and links', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const offer = page.locator('#oferta')
    const systems = offer.getByRole('heading', { level: 4 })
    await expect(systems).toHaveText([
      'GoPOS dla gastronomii',
      'Subiekt i programy InsERT',
      'Opieka IT w abonamencie',
    ])
    await expect(offer.getByRole('link', { name: 'Poznaj GoPOS z PRO-KOM' })).toHaveAttribute(
      'href',
      '/gopos',
    )
    await expect(offer.locator('img[src*="logo-gopos"]')).toHaveAttribute('alt', 'GoPOS')
    await expect(offer.getByRole('img', { name: 'PRO-KOM Biznes' })).toBeVisible()
    // Partner badges come only from statuses confirmed in the panel (seed: none) — [SZEF].
    await expect(offer).not.toContainText('Autoryzowany partner')
    await expect(offer).toContainText('Usługa PRO-KOM')
  })

  test('featured: eight products, one badge at most, added to the inquiry', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const featured = page.locator('#wybierane')
    const cards = featured.locator('[data-card]')
    await expect(cards).toHaveCount(8)
    for (const card of await cards.all()) {
      expect(await card.locator('ul li').count()).toBeLessThanOrEqual(1)
    }
    const first = cards.first()
    const add = first.getByRole('button', { name: /Do zapytania|W zapytaniu/ })
    const before = await add.getAttribute('aria-pressed')
    await add.click()
    await expect(add).not.toHaveAttribute('aria-pressed', before ?? '')
    await add.click()
  })

  test('featured: the whole offer and the wizard cards', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const featured = page.locator('#wybierane')
    await expect(featured.getByRole('link', { name: 'Poznaj całą ofertę' })).toHaveAttribute(
      'href',
      '/oferta',
    )
    await expect(
      featured.getByRole('link', { name: 'Dobierz zestaw w 60 sekund' }),
    ).toHaveAttribute('href', '/kreator')
    await expect(featured).toContainText('Potrzeby')
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('departments are rows and the products a horizontal strip', async ({ page }) => {
      await page.goto(site('biznes.localhost'))
      const rows = page.locator('#oferta ul').first().getByRole('link')
      await expect(rows).toHaveCount(5)
      await expect(rows.first()).toContainText(/\d+ pozycj/)
      const strip = page.locator('#wybierane ul').first()
      const { scrollWidth, clientWidth } = await strip.evaluate((el) => ({
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      }))
      expect(scrollWidth).toBeGreaterThan(clientWidth)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
    })
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

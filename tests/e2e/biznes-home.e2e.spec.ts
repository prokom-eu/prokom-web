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
    await page.clock.install()
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
    await page.mouse.move(0, 0)
    await page.clock.runFor(9000)
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

// B7c: „Plan Twojej firmy”, „Jak pracujemy”, „Pięć firm czy jedna” (spec. §4 pkt 6–8).
test.describe('Biznes home page: plan, steps, one partner', () => {
  test('plan: tabs switch the scene, from the keyboard too', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const plan = page.locator('#plan')
    const tabs = plan.getByRole('tab')
    await expect(tabs).toHaveCount(8)
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
    const panel = plan.getByRole('tabpanel')
    await expect(panel.getByRole('heading', { level: 3 })).toHaveText('Sklep spożywczy')
    await expect(panel.getByRole('listitem')).toHaveCount(12)

    await tabs.nth(1).click()
    await expect(panel.getByRole('heading', { level: 3 })).toHaveText('Restauracja')
    await page.keyboard.press('ArrowRight')
    await expect(tabs.nth(2)).toBeFocused()
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true')
    await expect(
      panel.getByRole('link', { name: 'Przygotuj zapytanie: Pensjonat' }),
    ).toHaveAttribute('href', '/kreator')
  })

  test('industries: nine tiles, the rest unfolds in place', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const grid = page.locator('#plan').getByRole('list').filter({ hasText: 'Sklep spożywczy' })
    const tiles = grid.getByRole('link')
    await expect(tiles).toHaveCount(9)
    await expect(tiles.filter({ hasText: 'Gmina, urząd, biblioteka' })).toBeVisible()
    await expect(tiles.filter({ hasText: 'Restauracja, bar, kawiarnia' })).toHaveAttribute(
      'href',
      '/branze/gastronomia',
    )
    await grid.getByRole('button', { name: /Pokaż wszystkie branże/ }).click()
    await expect(tiles).toHaveCount(20)
    // First of the rest in the order of ZMIANY-v20 §2.4.
    await expect(tiles.filter({ hasText: 'Stragan, handel obwoźny' })).toBeFocused()
    await expect(tiles.filter({ hasText: 'Każda inna firma' })).toHaveAttribute('href', '/kreator')
  })

  test('steps and guarantees', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const steps = page.locator('#jak-pracujemy')
    await expect(steps.getByRole('heading', { level: 3 })).toHaveText([
      'Krok 1: Rozmowa',
      'Krok 2: Oferta',
      'Krok 3: Wdrożenie',
      'Krok 4: Opieka',
    ])
    await expect(steps).toContainText('Wycena bez zobowiązań')
  })

  test('one partner: the switch changes rows and phone, and stops switching by itself', async ({
    page,
  }) => {
    // A fake clock instead of waiting 6.5 s for real (Playwright `page.clock`).
    await page.clock.install()
    await page.goto(site('biznes.localhost'))
    const section = page.locator('#jeden')
    const one = section.getByRole('button', { name: 'Jeden partner: PRO-KOM' })
    const separate = section.getByRole('button', { name: 'Osobne firmy' })
    // Untouched, it flips by itself.
    await expect(separate).toHaveAttribute('aria-pressed', 'true')
    // In small steps: on a slow build (CI) one 7 s jump can pass before the island hydrates and
    // starts its timer, which then never fires.
    await expect(async () => {
      await page.clock.runFor(1000)
      await expect(one).toHaveAttribute('aria-pressed', 'true', { timeout: 100 })
    }).toPass({ timeout: 20_000 })

    await separate.click()
    await expect(separate).toHaveAttribute('aria-pressed', 'true')
    await expect(section).toContainText('Serwis drukarek')
    await one.click()
    await expect(one).toHaveAttribute('aria-pressed', 'true')
    await expect(section).toContainText('Pilnujemy za Ciebie')
    await expect(section).toContainText('Jeden telefon. Sprawdzamy całość')
    // After a click it stays where the visitor put it.
    await page.mouse.move(0, 0)
    await page.clock.runFor(14000)
    await expect(one).toHaveAttribute('aria-pressed', 'true')
    // Short version (ZMIANY-v20 §2.5): no 6 → 1 bar.
    await expect(section).not.toContainText('Firmy do koordynowania')
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('five industries and the unfold tile, rows as titles only', async ({ page }) => {
      await page.goto(site('biznes.localhost'))
      const grid = page.locator('#plan').getByRole('list').filter({ hasText: 'Sklep spożywczy' })
      await expect(grid.getByRole('link').filter({ visible: true })).toHaveCount(5)
      await expect(grid.getByRole('button', { name: /Pokaż wszystkie branże/ })).toBeVisible()
      await expect(
        page.locator('#jeden').getByText('Jeden telefon. Sprawdzamy całość'),
      ).toBeHidden()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
    })
  })
})

// B7d: „Dla kogo”, „Fakty”, „Ostatnio w Aktualnościach”, FAQ, `#kontakt`, the section rail
// (spec. §3.7, §4 pkt 9–13).
test.describe('Biznes home page: references, facts, news, FAQ, contact', () => {
  test('references: six kinds; reviews and logos stay hidden without the settings', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    const section = page.locator('#referencje')
    await expect(section.getByRole('heading', { level: 3 })).toHaveCount(6)
    // Seed: „Pokaż opinie klientów” off, so the real review is not shown either.
    await expect(section).not.toContainText('Smołecka')
    await expect(section).toContainText('Logotypy klientów pojawią się')
    await expect(section).not.toContainText('Miejsce na opinię')
  })

  test('facts: owner quote, contact from the settings, authorization logos', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const facts = page.locator('#fakty')
    await expect(facts.locator('blockquote')).toContainText('u klienta po prostu działało')
    await expect(facts).not.toContainText('Zdjęcie właściciela')
    await expect(facts.locator('a[href^="tel:"]').first()).toBeVisible()
    await expect(facts.locator('a[href^="mailto:"]')).toBeVisible()
    await expect(facts.locator('a[href^="https://www.google.com/maps/dir/"]')).toHaveAttribute(
      'target',
      '_blank',
    )
    for (const name of ['Posnet', 'Elzab', 'InsERT', 'GoPOS']) {
      await expect(facts.getByRole('img', { name, exact: true })).toBeVisible()
    }
  })

  test('FAQ: numbered cards, the first open, FAQPage data', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const faq = page.locator('#faq')
    const items = faq.locator('details')
    await expect(items).toHaveCount(6)
    await expect(items.first()).toHaveAttribute('open', '')
    await expect(items.nth(1)).not.toHaveAttribute('open', '')
    await items.nth(1).locator('summary').click()
    await expect(items.nth(1)).toHaveAttribute('open', '')
    const jsonLd = await faq.locator('script[type="application/ld+json"]').textContent()
    expect(JSON.parse(jsonLd ?? '{}')['@type']).toBe('FAQPage')
  })

  test('contact: the panel channels and a working form at #kontakt', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/#kontakt'))
    const contact = page.locator('#kontakt')
    await expect(contact.getByRole('heading', { level: 2 })).toHaveText(
      'Napisz, czego potrzebujesz. Odezwiemy się szybko.',
    )
    await expect(contact.locator('a[href^="tel:"]')).toBeVisible()
    await expect(contact.locator('form')).toBeVisible()
    await expect(contact).toContainText('Wycena na piśmie')
  })

  test('section rail: anchors of the sections, the current one marked', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost'))
    const rail = page.getByRole('navigation', { name: 'Na tej stronie' })
    await expect(rail.getByRole('link')).toHaveCount(9)
    await rail.getByRole('link', { name: 'Fakty' }).click()
    await expect(page).toHaveURL(/#fakty$/)
    await expect(rail.getByRole('link', { name: 'Fakty' })).toHaveAttribute('aria-current', 'true')
  })

  test('news: the latest posts of this site only', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const software = await tenantId(page, 'software')
    const stamp = Date.now()
    const create = (tenant: number, title: string, slug: string, publishedAt = new Date()) =>
      api(page, 'POST', '/api/posts', {
        tenant,
        title,
        slug,
        category: 'ksef',
        publishedAt: publishedAt.toISOString(),
        content: {
          root: {
            type: 'root',
            version: 1,
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [{ type: 'text', text: 'E2E', version: 1 }],
              },
            ],
          },
        },
        _status: 'published',
      })
    const own = await create(biznes, `E2E wpis Biznesu ${stamp}`, `e2e-${biznes}-${stamp}`)
    const foreign = await create(software, `E2E wpis Software ${stamp}`, `e2e-sw-${stamp}`)
    // Dated in the future: published, but not yet on the home page.
    const future = await create(
      biznes,
      `E2E wpis z przyszłości ${stamp}`,
      `e2e-future-${stamp}`,
      new Date(Date.now() + 7 * 86_400_000),
    )
    try {
      expect(own.status).toBe(201)
      // Without the foreign post the isolation check below would prove nothing.
      expect(foreign.status).toBe(201)
      expect(future.status).toBe(201)
      // `Posts` hooks mark the posts cache stale at once; a short retry covers the dev server.
      await expect(async () => {
        await page.goto(site('biznes.localhost'))
        await expect(page.getByText(`E2E wpis Biznesu ${stamp}`)).toBeVisible({ timeout: 1000 })
      }).toPass({ timeout: 20_000, intervals: [2000] })
      await expect(page.getByText(`E2E wpis Software ${stamp}`)).toHaveCount(0)
      await expect(page.getByText(`E2E wpis z przyszłości ${stamp}`)).toHaveCount(0)
      await expect(
        page.getByRole('link', { name: `E2E wpis Biznesu ${stamp}`, exact: true }),
      ).toHaveAttribute('href', `/aktualnosci/e2e-${biznes}-${stamp}`)
    } finally {
      await page.goto('/admin/login')
      for (const result of [own, foreign, future]) {
        const id = (result.json.doc as { id?: number } | undefined)?.id
        if (id) await api(page, 'DELETE', `/api/posts/${id}`)
      }
    }
  })
})

import { expect, test, type Page } from '@playwright/test'

import { api, clickUntilVisible, loginAsAdmin, site, tenantId } from './helpers'

// B7a + K4c (v150): the Biznes home page — hero with the department wheel, „Szybki start”,
// brands, „Najczęściej wybierane” (K36 §1, §11, §12; K35 7a). Data from `pnpm seed`.

/** Top-level anchors of the home page in the order of plan 0611 §7.1 (B3-1, B3-2). */
const HOME_ANCHORS = [
  'start',
  'oferta',
  'zaopatrzenie',
  'marki',
  'wybierane',
  'ksef',
  'plan',
  'jak-pracujemy',
  'fakty',
  'aktualnosci',
  'faq',
  'kontakt',
]

test.describe('Biznes home page', () => {
  test('hero: one h1, wizard CTA, the offer with its count, phone, trust line', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    const hero = page.locator('#start')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('Kasy, komputery i programy dla firm.')
    await expect(page.locator('h1')).toContainText('Wszystko z jednego miejsca w Rabce.')
    await expect(hero.getByRole('link', { name: /Dobierz rozwiązanie dla firmy/ })).toHaveAttribute(
      'href',
      '/konfigurator',
    )
    await expect(hero.getByRole('link', { name: /^Przeglądaj ofertę · \d+$/ })).toHaveAttribute(
      'href',
      '/oferta',
    )
    await expect(hero.locator('a[href^="tel:"]')).toBeVisible()
    // Board v150: the trust line split into its statuses. The call-back promise by the phone
    // comes from the panel only (plan 0611 §7.1 pkt 9) — the seed leaves it empty.
    await expect(hero).toContainText('Autoryzowany serwis Posnet i Elzab')
    await expect(hero).toContainText('Autoryzowany partner GoPOS i InsERT')
    await expect(hero).toContainText('100+ klientów firmowych')
    await expect(hero.getByRole('link', { name: 'Zobacz plan Twojej firmy ↓' })).toHaveAttribute(
      'href',
      '#plan',
    )
  })

  test('quick start: five ways in with counts from the database (K36 §11)', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const start = page.getByRole('region', { name: 'Od czego zaczynasz?' })
    await expect(start.getByRole('listitem')).toHaveCount(5)
    const offer = start.getByRole('link', { name: /Cała oferta/ })
    await expect(offer).toHaveAttribute('href', '/oferta')
    await expect(offer).toContainText(/\d+ pozycj/)
    await expect(start.getByRole('link', { name: /Plan Twojej firmy/ })).toContainText(/\d+ rodza/)
    await expect(start.getByRole('link', { name: /Salony marek/ })).toContainText(/\d+ mar/)
    // „Zapytaj o wycenę” opens the inquiry drawer.
    await expect(async () => {
      await start.getByRole('button', { name: /Zapytaj o wycenę/ }).click()
      await expect(page.getByRole('dialog', { name: /^Twoje zapytanie/ })).toBeVisible({
        timeout: 1000,
      })
    }).toPass()
  })

  test('brands: two strips, panel order first, status and count, link to all (§9)', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    const brands = page.locator('#marki')
    await expect(
      brands.getByRole('heading', { name: 'Marki, które znamy od środka.' }),
    ).toBeVisible()
    // ZAOPATRZENIE §9: two strips replace the 16 tiles; the first copies (the loop is hidden).
    const tiles = brands.locator('.zp-marq-group:not([aria-hidden]) > li > a')
    await expect(tiles).not.toHaveCount(0)
    // The whole tile is read: name, description, count, status.
    // Panel order (W2): GoPOS first; the name is read once, before the description.
    await expect(tiles.first()).toHaveAccessibleName(/^GoPOS: .*Autoryzowany partner/)
    await expect(tiles.first()).toContainText('Autoryzowany partner')
    await expect(tiles.first()).toContainText(/\d+ pozycj/)
    await expect(brands.getByRole('link', { name: /^Wszystkie marki · \d+$/ })).toBeVisible()
    // The banner of the old grid is gone.
    await expect(brands).not.toContainText('Zobacz wszystkie marki')
    // K4-FINAL §1: no shortened status anywhere.
    await expect(brands).not.toContainText('Aut.')
    // POPRAWKI-0311 §D: logos in colour before any pointer — no grey filter.
    await expect(tiles.first().locator('img')).toHaveCSS('filter', 'none')
    await expect(tiles.first().locator('img')).toHaveCSS('opacity', '1')
  })

  test('no prices, leasing or instalments on the page', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/leasing|\braty\b|\d+[,.]\d{2}\s*zł/i)
  })

  // Plan 0611 §7.1 (B3-1, B3-2: KSeF band from the seed's deadline, news; reviews off in the seed).
  test('sections in the order of plan 0611 §7.1', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const found = await page.evaluate((ids) => {
      const nodes = ids.flatMap((id) => document.getElementById(id) ?? [])
      // Document order of the anchors that are on the page.
      return nodes
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        .map((node) => node.id)
    }, HOME_ANCHORS)
    expect(found).toEqual(HOME_ANCHORS)
    await expect(page.locator('#dla-kogo')).toHaveCount(0)
  })

  test('„60 minut” only in the hero, „Nasze zobowiązania” and the contact form (§7.1 pkt 9)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost'))
    const sections = await page.evaluate(
      (ids) => ids.filter((id) => /60\s*min/.test(document.getElementById(id)?.innerText ?? '')),
      HOME_ANCHORS,
    )
    expect(sections.filter((id) => !['start', 'jak-pracujemy', 'kontakt'].includes(id))).toEqual([])
    expect(sections).toContain('start')
    expect(sections).toContain('jak-pracujemy')
    expect(sections).toContain('kontakt')
    // „Zapytaj o wycenę” in „Szybki start” says the written quote, not the call-back time.
    const start = page.getByRole('region', { name: 'Od czego zaczynasz?' })
    await expect(start.getByRole('button', { name: /Zapytaj o wycenę/ })).toContainText(
      'Wycena na piśmie',
    )
  })
})

// B7b: „Oferta” and „Najczęściej wybierane” (spec. §4 pkt 4–5, ZMIANY-v20 §2.2–2.3).
test.describe('Biznes home page: offer and featured', () => {
  test('departments: catalog numbers, categories unfold, „Cały dział”', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const offer = page.getByRole('region', {
      name: 'Kasy, komputery, programy, sieć i serwis',
    })
    await expect(offer).toContainText(/OFERTA · 5 DZIAŁÓW · \d+ POZYCJ/i)
    await expect(offer).toContainText(/Sprzęt, programy i usługi od \d+ marek/)
    await expect(offer).not.toContainText('{marki}')
    await expect(offer.getByRole('link', { name: /Cała oferta · \d+ pozycj/ })).toHaveAttribute(
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
    // Six categories at once, the rest after „Wszystkie kategorie · N” (board `#s4-dz`).
    const categories = sales.locator('a[href^="/oferta/"]')
    await expect(categories).toHaveCount(6)
    const more = sales.getByRole('button', { name: /Wszystkie kategorie · \d+/ })
    const total = Number((await more.textContent())?.match(/\d+/)?.[0])
    await more.click()
    await expect(categories).toHaveCount(total)
    await sales.getByRole('button', { name: 'Zwiń kategorie' }).click()
    await expect(categories).toHaveCount(6)
    // Services show status rows instead of pictures.
    await expect(departments.filter({ hasText: 'Serwis i usługi' })).toContainText('Opieka IT')
  })

  test('the sixth tile opens the search, a popular phrase typed in', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const tile = page.getByRole('article', { name: /znajdziemy to za\sCiebie/ })
    await expect(tile.getByRole('button', { name: /Szukaj w \d+ pozycj/ })).toBeVisible()
    // B3-1 (audit P1.1): no shortcuts to the plan, bundles or the whole offer — „Szybki start” is
    // the hub of the page.
    await expect(tile.getByRole('link')).toHaveCount(0)
    const phrase = tile.getByRole('list', { name: 'Najczęściej szukane' }).getByRole('button')
    const first = (await phrase.first().textContent())?.trim() ?? ''
    const dialog = page.getByRole('dialog')
    await clickUntilVisible(phrase.first(), dialog)
    await expect(dialog.getByRole('searchbox').or(dialog.locator('input')).first()).toHaveValue(
      first,
    )
  })

  test('offer: three system cards with partner logos and links', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const offer = page.locator('#oferta')
    const systems = offer.getByRole('heading', { level: 4 })
    await expect(systems).toHaveText([
      'GoPOS dla gastronomii',
      'Subiekt i programy InsERT',
      'Stała opieka IT',
    ])
    // K4-FINAL §1: no pricing model of the IT care.
    await expect(offer).not.toContainText('abonament')
    await expect(offer).not.toContainText('stałej opłacie')
    await expect(offer.getByRole('link', { name: 'Poznaj GoPOS z PRO-KOM' })).toHaveAttribute(
      'href',
      '/gopos',
    )
    await expect(offer.locator('img[src*="logo-gopos"]')).toHaveAttribute('alt', 'GoPOS')
    await expect(offer.getByRole('img', { name: 'PRO-KOM Biznes' })).toBeVisible()
    // Statuses of K4-FINAL §1 (K4a-2 seed): GoPOS and InsERT are authorized partners.
    await expect(offer.getByText('Autoryzowany partner', { exact: true })).toHaveCount(2)
    await expect(offer).toContainText('Usługa PRO-KOM')
  })

  test('featured: sixteen products, one badge at most, added to the inquiry', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const featured = page.locator('#wybierane')
    const cards = featured.locator('[data-card]')
    await expect(cards).toHaveCount(16)
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

  test('featured: pills filter the cards by group (K35 7a)', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const featured = page.locator('#wybierane')
    const pills = featured.getByRole('group', { name: 'Filtr najczęściej wybieranych' })
    await expect(pills.getByRole('button', { name: /^Wszystkie/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const power = pills.getByRole('button', { name: /^Zasilanie awaryjne/ })
    await expect(async () => {
      await power.click()
      await expect(power).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 })
    }).toPass()
    await expect(featured.locator('[data-card]').filter({ visible: true })).toHaveCount(2)
    // v150: no cards under the list (they repeated „Szybki start”).
    await expect(featured.getByRole('link', { name: 'Poznaj całą ofertę' })).toHaveCount(0)
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('App-Start: hero search, shortcuts, departments and products to swipe', async ({
      page,
    }) => {
      await page.goto(site('biznes.localhost'))
      const hero = page.locator('#start')
      await expect(hero.getByRole('button', { name: /Szukaj: kasa/ })).toBeVisible()
      await expect(hero.getByRole('link', { name: /^Przeglądaj ofertę/ })).toBeHidden()
      const start = page.getByRole('region', { name: 'Od czego zaczynasz?' })
      for (const name of ['KSeF 2027', 'Zestawy', 'Opieka IT']) {
        await expect(start.getByRole('link', { name, exact: true })).toBeVisible()
      }
      const departments = page.locator('#oferta ul').first()
      await expect(departments.locator(':scope > li')).toHaveCount(5)
      await expect(departments.locator('article').first()).toContainText(/\d+ pozycj/)
      const deptSize = await departments.evaluate((el) => [el.scrollWidth, el.clientWidth])
      expect(deptSize[0]).toBeGreaterThan(deptSize[1])
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

// B3-1 (D8): „Plan Twojej firmy” with the industries in one section; „Jak pracujemy” (K36 §1).
test.describe('Biznes home page: industries, plan, steps', () => {
  test('plan with the industries: tabs switch the plan, six points and „Pokaż wszystkie”', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost'))
    const plan = page.locator('#plan')
    await expect(plan.getByRole('heading', { level: 2 })).toHaveText(
      /Wybierz branżę i\s+zobacz, co ustawimy w\s+Twoim lokalu/,
    )
    const tabs = plan.getByRole('tablist', { name: 'Branże' }).getByRole('tab')
    await expect(tabs).toHaveCount(12)
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
    const panel = plan.getByRole('tabpanel')
    await expect(panel.getByRole('heading', { level: 3, name: 'Sklep spożywczy' })).toBeVisible()
    await expect(plan).toContainText('186')

    // Six points first, the rest after „Pokaż wszystkie N”.
    const list = panel.getByRole('region', { name: 'Na tym planie' }).getByRole('listitem')
    await expect(list).toHaveCount(6)
    const all = panel.getByRole('button', { name: /^Pokaż wszystkie \d+/ })
    const total = Number((await all.textContent())?.match(/\d+/)?.[0])
    expect(total).toBeGreaterThan(6)
    // A lazy island (ADR-023, #426): a click before hydration is lost.
    await clickUntilVisible(all, list.nth(total - 1))
    await expect(list).toHaveCount(total)

    await tabs.filter({ hasText: 'Biuro' }).click()
    await expect(tabs.filter({ hasText: 'Biuro' })).toHaveAttribute('aria-selected', 'true')
    await expect(panel.getByRole('heading', { level: 3, name: /^Biuro/ })).toBeVisible()
    // On the home page switching does not rewrite the address (only /plan-firmy keeps ?scena=).
    await expect(page).not.toHaveURL(/scena=/)
    // A new industry starts with the short list again.
    await expect(list).toHaveCount(6)

    // ARIA tabs: the arrow shows the next industry and moves the focus to it.
    await page.keyboard.press('ArrowRight')
    await expect(tabs.filter({ hasText: 'Szkoła' })).toBeFocused()
    await expect(tabs.filter({ hasText: 'Szkoła' })).toHaveAttribute('aria-selected', 'true')

    // The funding bar closes the same section.
    await expect(plan).toContainText('Masz dofinansowanie na sprzęt lub oprogramowanie?')
    await expect(plan.getByRole('link', { name: /Zapytaj o realizację/ })).toBeVisible()
  })

  test('no „Firmy każdej wielkości” section of its own (D8)', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await expect(page.locator('#dla-kogo')).toHaveCount(0)
    await expect(
      page.getByRole('heading', { name: /Firmy każdej wielkości, od straganu po urząd gminy/ }),
    ).toHaveCount(0)
  })

  test('„Gotowy zestaw dla tej branży” only for a home bundle marked „Gotowe”', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    // `zestawy_na_glownej`: the shop bundle on the „Sklep” scene, the café one on „Restauracja”.
    const found = await api(
      page,
      'GET',
      `/api/bundles?where[tenant][equals]=${biznes}&where[slug][in]=zestaw-sklep-kasa-start,zestaw-kawiarnia-lada&depth=0&limit=2`,
    )
    const bundles = found.json.docs as { id: number; slug: string; contentStatus: string }[]
    const shop = bundles.find((bundle) => bundle.slug === 'zestaw-sklep-kasa-start')!
    const cafe = bundles.find((bundle) => bundle.slug === 'zestaw-kawiarnia-lada')!
    const status = (id: number, contentStatus: string) =>
      api(page, 'PATCH', `/api/bundles/${id}`, { contentStatus })
    try {
      expect((await status(shop.id, 'ready')).status).toBe(200)
      expect((await status(cafe.id, 'needs-review')).status).toBe(200)
      await page.goto(site('biznes.localhost'))
      const plan = page.locator('#plan')
      const card = plan.locator('[data-home-bundle]')
      await expect(card).toHaveCount(1)
      await expect(card).toHaveAttribute('href', '/zestawy/zestaw-sklep-kasa-start')
      await expect(plan).toContainText('Gotowy zestaw dla tej branży')
      await plan.getByRole('tab', { name: /Restauracja/ }).click()
      await expect(plan.getByRole('tab', { name: /Restauracja/ })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      await expect(card).toHaveCount(0)
    } finally {
      await page.goto('/admin/login')
      await status(shop.id, shop.contentStatus)
      await status(cafe.id, cafe.contentStatus)
    }
  })

  test('steps and „Nasze zobowiązania”', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const steps = page.locator('#jak-pracujemy')
    await expect(steps.getByRole('heading', { level: 3 })).toHaveText([
      'Krok 1: Rozmowa',
      'Krok 2: Oferta',
      'Krok 3: Wdrożenie',
      'Krok 4: Opieka',
      /^Tak pracujemy na co dzień$/,
    ])
    await expect(steps).toContainText('Pierwszy kontakt')
    await expect(steps).toContainText('Nasze zobowiązania')
    await expect(steps).toContainText('oddzwaniamy w godzinach pracy')
    await expect(steps.getByRole('link', { name: /Zadzwoń/ })).toHaveAttribute('href', /^tel:/)
  })

  test('v150 has no „Jedna firma czy pięć” and no old „Ostatnio w Aktualnościach”', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    await expect(page.locator('#jeden')).toHaveCount(0)
    await expect(page.getByText('Ostatnio w Aktualnościach')).toHaveCount(0)
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('the plan section: scenes as links, the funding bar, no horizontal scroll', async ({
      page,
    }) => {
      await page.goto(site('biznes.localhost'))
      await expect(page.locator('#dla-kogo')).toHaveCount(0)
      const plan = page.locator('#plan')
      await expect(plan.getByRole('heading', { level: 2 })).toBeVisible()
      await expect(plan.getByRole('link', { name: 'Biuro', exact: true })).toHaveAttribute(
        'href',
        '/plan-firmy?scena=biuro',
      )
      await expect(plan.getByRole('link', { name: /Zapytaj o realizację/ })).toBeVisible()
      // Plan 0611 §7.1: FAQ and „O firmie” are on a phone too.
      await expect(page.locator('#faq').getByRole('heading', { level: 2 })).toBeVisible()
      await expect(page.locator('#fakty').getByRole('heading', { level: 2 })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
    })

    test('App-Start: plan scenes as links, FAQ shown, the help card instead of the form', async ({
      page,
    }) => {
      await page.goto(site('biznes.localhost'))
      const plan = page.locator('#plan')
      await expect(plan.getByRole('link', { name: 'Restauracja', exact: true })).toHaveAttribute(
        'href',
        /^\/plan-firmy\?scena=/,
      )
      // D12: the help card keeps the form's heading; the FAQ is on the phone too (accordion).
      const last = page.locator('#kontakt [data-phone-help]')
      await expect(last.getByRole('link', { name: /\d{3} \d{3} \d{3}/ })).toHaveAttribute(
        'href',
        /^tel:/,
      )
      await expect(last.getByRole('button', { name: 'Opisz, czego potrzebujesz' })).toBeVisible()
      await expect(page.locator('#faq')).toBeVisible()
      // `#kontakt` lands on the closing card; the form itself is from 768 px.
      await expect(page.locator('#kontakt form')).toBeHidden()
    })
  })
})

// K4c PR 3b (v150): „Opinie”, „Słowo od właściciela”, FAQ, `#kontakt`, the section rail.
test.describe('Biznes home page: reviews, owner, FAQ, contact', () => {
  test('reviews: the section stays hidden without the setting (D-K4-6)', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    // Seed: „Pokaż opinie klientów” off — no section, no real review, no placeholder.
    await expect(page.locator('#opinie')).toHaveCount(0)
    await expect(page.getByText('Smołecka')).toHaveCount(0)
    await expect(page.getByText('[do podmiany]')).toHaveCount(0)
  })

  test('„O firmie” without the quote: H2, two numbers, four authorizations, the company page', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    const facts = page.locator('#fakty')
    // Seed: „Pokaż słowo od właściciela” off — the quote waits for the owner (audit 01.11).
    await expect(facts.locator('blockquote')).toHaveCount(0)
    await expect(facts).not.toContainText('u klienta po prostu działało')
    // POPRAWKI-0311 §C: a visible H2 and two numbers — the authorizations say the rest.
    await expect(facts.getByRole('heading', { level: 2 })).toBeVisible()
    await expect(facts.getByRole('heading', { level: 2 })).toHaveText(
      'Od 2004 roku przy kasach i komputerach firm z Podhala',
    )
    await expect(facts.locator('dd')).toHaveText(['2004', '100+'])
    await expect(facts).toContainText('klientów firmowych')
    await expect(facts).not.toContainText('pod stałą opieką')
    const authorizations = facts.getByRole('list', { name: 'Autoryzacje i partnerstwa' })
    for (const [name, status] of [
      ['Posnet', 'Autoryzowany serwis'],
      ['Elzab', 'Autoryzowany serwis'],
      ['InsERT', 'Autoryzowany partner'],
      ['GoPOS', 'Autoryzowany partner'],
    ]) {
      const item = authorizations.getByRole('listitem').filter({
        has: page.getByRole('img', { name, exact: true }),
      })
      await expect(item).toBeVisible()
      await expect(item).toContainText(status!)
    }
    await expect(
      facts.getByRole('link', { name: 'Poznaj PRO-KOM i pozostałe linie firmy' }),
    ).toHaveAttribute('href', '/o-firmie')
  })

  test('FAQ: numbered cards, the first open, FAQPage data', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const faq = page.locator('#faq')
    await expect(faq.getByRole('heading', { level: 2 })).toHaveText('Zanim zadzwonisz')
    const items = faq.locator('details')
    await expect(items).toHaveCount(6)
    await expect(items.first()).toHaveAttribute('open', '')
    await expect(items.nth(1)).not.toHaveAttribute('open', '')
    await items.nth(1).locator('summary').click()
    await expect(items.nth(1)).toHaveAttribute('open', '')
    // K4-FINAL §1: no pricing model of the IT care.
    await expect(items.nth(1)).toContainText('przygotowujemy wycenę')
    await expect(faq).not.toContainText('miesięczną opłatą')
    const jsonLd = await faq.locator('script[type="application/ld+json"]').textContent()
    expect(JSON.parse(jsonLd ?? '{}')['@type']).toBe('FAQPage')
  })

  test('contact: the panel channels and a working form at #kontakt', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/#kontakt'))
    const contact = page.locator('#kontakt')
    await expect(contact.getByRole('heading', { level: 2 })).toHaveText(
      'Napisz, czego potrzebujesz. Oddzwonimy w ciągu 60 minut w godzinach pracy.',
    )
    // `#kontakt` also wraps the phone card (hidden here): the visible phone link only.
    await expect(contact.locator('a[href^="tel:"]').filter({ visible: true })).toHaveCount(1)
    await expect(contact.locator('form')).toBeVisible()
    await expect(contact).toContainText('Wycena na piśmie')
  })

  test('section rail: the sections of plan 0611 §7.1, the current one marked', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost'))
    // The shared side rail (D3-B): sections from `SiteSettings.shared.rail`, the ones without a
    // block on the page left out („Opinie” — reviews off in the seed).
    const rail = page.locator('[data-site-rail]').getByRole('group', { name: 'Na tej stronie' })
    await expect(rail.getByRole('link')).toHaveText([
      'Start',
      'Oferta',
      'Zaopatrzenie firm',
      'Marki',
      'Najczęściej wybierane',
      'KSeF',
      'Plan Twojej firmy',
      'Jak pracujemy',
      'O firmie',
      'Aktualności',
      'Pytania',
      'Kontakt',
    ])
    // The folded rail shows its first 64 px (icons): the pointer there unfolds the labels first.
    await page.locator('[data-site-rail]').hover({ position: { x: 24, y: 24 } })
    await rail.getByRole('link', { name: 'O firmie' }).click()
    await expect(page).toHaveURL(/#fakty$/)
    await expect(rail.getByRole('link', { name: 'O firmie' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })
})

// BIZ-2 B3-2 (plan 0611 §7.1 pkt 7, 12, 14): the KSeF band with the deadline from the panel,
// „Aktualności” (3 cards, sister lines as links to their own sites), the contact with location.
test.describe('Biznes home page: KSeF band, news, contact location', () => {
  type Settings = { id: number; biznes?: Record<string, unknown> | null }

  /** The Biznes settings with `biznes.ksef` changed for the callback, restored afterwards. */
  async function withKsef(
    page: Page,
    ksef: Record<string, unknown>,
    check: () => Promise<void>,
  ): Promise<void> {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const { json } = await api(
      page,
      'GET',
      `/api/site-settings?where[tenant][equals]=${biznes}&depth=0`,
    )
    const [settings] = json.docs as Settings[]
    if (!settings) throw new Error('Biznes settings missing — run pnpm seed.')
    const original = settings.biznes ?? {}
    const updated = await api(page, 'PATCH', `/api/site-settings/${settings.id}`, {
      biznes: { ...original, ksef: { ...(original.ksef as object), ...ksef } },
    })
    expect(updated.status).toBe(200)
    try {
      await check()
    } finally {
      await page.goto('/admin/login')
      const restored = await api(page, 'PATCH', `/api/site-settings/${settings.id}`, {
        biznes: original,
      })
      expect(restored.status).toBe(200)
    }
  }

  test('the band: deadline and heading from the panel, countdown, six steps → /ksef', async ({
    page,
  }) => {
    const heading = `Termin KSeF z panelu E2E ${Date.now()}`
    await withKsef(
      page,
      { deadline: '2099-01-01T00:00:00.000Z', textBefore: heading },
      async () => {
        await page.goto(site('biznes.localhost'))
        const band = page.locator('#ksef')
        await expect(band.getByRole('heading', { level: 2 })).toHaveText(heading)
        await expect(band.locator('time')).toHaveText('1 stycznia 2099')
        // Counted in the browser: whole numbers after hydration (the boxes are reserved before).
        await expect(band.locator('[data-unit="days"]')).toHaveText(/^\d+$/)
        const steps = band.getByRole('list', { name: 'Kroki przygotowania do KSeF' })
        await expect(steps.getByRole('listitem')).toHaveCount(6)
        await expect(band.getByRole('link', { name: /Przygotuj firmę do KSeF/ })).toHaveAttribute(
          'href',
          '/ksef',
        )
        // No penalty dates in the band (MF bill postponing penalties, 08.11.2026).
        await expect(band).not.toContainText(/\bkar[ay]?\b/i)
      },
    )
  })

  test('from the deadline day on: the „after” heading, no countdown', async ({ page }) => {
    const after = `KSeF obowiązuje E2E ${Date.now()}`
    await withKsef(page, { deadline: '2020-01-01T00:00:00.000Z', textAfter: after }, async () => {
      await page.goto(site('biznes.localhost'))
      const band = page.locator('#ksef')
      await expect(band.getByRole('heading', { level: 2 })).toHaveText(after)
      await expect(band.locator('[data-testid="ksef-countdown"]')).toHaveCount(0)
    })
  })

  test('no deadline in the panel: no band, no rail entry', async ({ page }) => {
    await withKsef(page, { deadline: null }, async () => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(site('biznes.localhost'))
      await expect(page.locator('#wybierane')).toBeVisible()
      await expect(page.locator('#ksef')).toHaveCount(0)
      const rail = page.locator('[data-site-rail]').getByRole('group', { name: 'Na tej stronie' })
      await expect(rail.getByRole('link', { name: 'Plan Twojej firmy' })).toBeVisible()
      await expect(rail.getByRole('link', { name: 'KSeF', exact: true })).toHaveCount(0)
    })
  })

  test('„Aktualności”: at most three cards, sister lines link to their own sites', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    const news = page.locator('#aktualnosci')
    await expect(news.getByRole('heading', { level: 2 })).toBeVisible()
    const cards = news.locator('[data-news-home] > li')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThanOrEqual(3)
    // Seed: one Biznes post (KSeF) on /aktualnosci, the rest from Instalacje and Software.
    await expect(news.locator('a[href^="/aktualnosci/"]').first()).toBeVisible()
    const sister = news.locator('[data-sister-line]')
    const sisterCount = await sister.count()
    for (let i = 0; i < sisterCount; i++) {
      const card = sister.nth(i)
      await expect(card.getByRole('link')).toHaveAttribute(
        'href',
        /^https:\/\/(prokominstalacje|prokomsoftware)\.pl\/(poradnik|aktualnosci)\//,
      )
      // Title only — no lead and no cover from the other line (SEO).
      await expect(card.locator('img')).toHaveCount(0)
      await expect(card.locator('p')).toHaveCount(1)
    }
  })

  test('contact: the location column — map, open status, address, phone, „Wyznacz trasę”', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost', '/#kontakt'))
    const place = page.locator('#kontakt [data-contact-place]')
    await expect(place.locator('[data-address-map]')).toBeVisible()
    await expect(place.locator('[data-contact-address]')).toContainText('Orkana 16B')
    await expect(place.locator('a[href^="tel:"]')).toBeVisible()
    const route = place.getByRole('link', { name: /Wyznacz trasę/ })
    await expect(route).toHaveAttribute('href', /^https:\/\//)
    await expect(route).toHaveAttribute('target', '_blank')
    // Live status (open, or closed with the next opening) above the heading.
    await expect(page.locator('#kontakt-formularz')).toContainText(/Otwarte|Zamknięte/)
    // The form keeps the chip of larger deliveries (B2-3).
    await expect(
      page.locator('#kontakt form').getByRole('button', { name: 'Większa dostawa sprzętu' }),
    ).toBeVisible()
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('the band, the news and the address with the route stay reachable', async ({ page }) => {
      await page.goto(site('biznes.localhost'))
      await expect(page.locator('#ksef').getByRole('heading', { level: 2 })).toBeVisible()
      await expect(page.locator('#aktualnosci').getByRole('heading', { level: 2 })).toBeVisible()
      const help = page.locator('#kontakt [data-phone-help]')
      await expect(help.locator('[data-contact-address]')).toContainText('Orkana 16B')
      await expect(help.getByRole('link', { name: /Wyznacz trasę/ })).toHaveAttribute(
        'href',
        /^https:\/\//,
      )
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
    })
  })
})

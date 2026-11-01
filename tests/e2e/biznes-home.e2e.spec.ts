import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { api, loginAsAdmin, site, tenantId } from './helpers'

// B7a + K4c (v150): the Biznes home page — hero with the department wheel, „Szybki start”,
// brands, „Najczęściej wybierane” (K36 §1, §11, §12; K35 7a). Data from `pnpm seed`.

test.describe('Biznes home page', () => {
  test('hero: one h1, wizard CTA, the offer with its count, phone, trust line', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    const hero = page.locator('#start')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('Kasy, komputery i programy dla firm.')
    await expect(page.locator('h1')).toContainText('Wszystko z jednego miejsca — z Rabki.')
    await expect(hero.getByRole('link', { name: /Dobierz rozwiązanie dla firmy/ })).toHaveAttribute(
      'href',
      '/kreator',
    )
    await expect(hero.getByRole('link', { name: /^Przeglądaj ofertę · \d+$/ })).toHaveAttribute(
      'href',
      '/oferta',
    )
    await expect(hero.locator('a[href^="tel:"]')).toBeVisible()
    await expect(hero).toContainText(
      'Autoryzowany serwis Posnet i Elzab · Autoryzowany partner GoPOS i InsERT',
    )
    await expect(hero).toContainText('100+ klientów firmowych')
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

  test('brands: sixteen from the panel with status and count, then all brands (K35 7a)', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    const brands = page.locator('#marki')
    await expect(
      brands.getByRole('heading', { name: 'Marki, które znamy od środka.' }),
    ).toBeVisible()
    const tiles = brands.locator('ul').first().locator(':scope > li > a')
    await expect(tiles).toHaveCount(16)
    // The whole tile is read: name, description, status, count.
    await expect(tiles.first()).toHaveAccessibleName(/^Posnet .*Autoryzowany serwis/)
    await expect(tiles.first()).toContainText('Autoryzowany serwis')
    await expect(tiles.first()).toContainText(/\d+ pozycj/)
    await expect(brands.getByRole('link', { name: /Wszystkie marki/ })).toBeVisible()
    // K4-FINAL §1: no shortened status anywhere.
    await expect(brands).not.toContainText('Aut.')
  })

  test('reduced motion: no turning wheel', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(site('biznes.localhost'))
    const animation = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el).animationName)
    expect(await animation('[aria-label="Przykładowe produkty działów"]')).toBe('none')
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
  test('departments: catalog numbers, categories unfold, „Cały dział”', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const offer = page.getByRole('region', {
      name: 'Kasy, komputery, programy, sieć i serwis — wybierz dział.',
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
    await expect(tile.getByRole('link', { name: /Gotowe zestawy/ })).toHaveAttribute(
      'href',
      '/zestawy',
    )
    const phrase = tile.getByRole('list', { name: 'Najczęściej szukane' }).getByRole('button')
    const first = (await phrase.first().textContent())?.trim() ?? ''
    await phrase.first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
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

// K4c PR 3b (v150): „Dla kogo”, „Plan Twojej firmy”, „Jak pracujemy” (K36 §1).
test.describe('Biznes home page: industries, plan, steps', () => {
  test('plan 2.0: the scenes of „Plany firmy”, a tile sets the scene (K31d′)', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const plan = page.locator('#plan')
    const scenes = plan.getByRole('group', { name: 'Rodzaj firmy' }).getByRole('button')
    await expect(scenes).toHaveCount(12)
    await expect(scenes.first()).toHaveAttribute('aria-pressed', 'true')
    await expect(plan.getByRole('heading', { level: 3, name: 'Sklep spożywczy' })).toBeVisible()
    await expect(plan).toContainText('186')

    await scenes.filter({ hasText: 'Biuro' }).click()
    await expect(plan.getByRole('heading', { level: 3, name: /^Biuro/ })).toBeVisible()
    await expect(page).toHaveURL(/\?scena=biuro/)

    await page
      .locator('#dla-kogo')
      .getByRole('link', { name: /Apteka/ })
      .click()
    await expect(plan.getByRole('heading', { level: 3, name: 'Apteka' })).toBeVisible()
    await expect(page).toHaveURL(/\?scena=apteka/)
  })

  test('industries: eleven tiles and the funding bar, the rest unfolds in place', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    const section = page.getByRole('region', {
      name: 'Firmy każdej wielkości. Od straganu po urząd gminy.',
    })
    const grid = section.getByRole('list').filter({ hasText: 'Sklep spożywczy' })
    const tiles = grid.getByRole('link')
    await expect(tiles).toHaveCount(11)
    await expect(tiles.filter({ hasText: 'Fryzjer, kosmetyka, beauty' })).toBeVisible()
    // A tile with a scene of the plan shows it (K31d′); without JavaScript it opens the plan page.
    await expect(tiles.filter({ hasText: 'Restauracja, bar, kawiarnia' })).toHaveAttribute(
      'href',
      '/plan-firmy?scena=gastro',
    )
    await expect(section).toContainText('Masz dofinansowanie na sprzęt lub oprogramowanie?')
    await grid.getByRole('button', { name: /Pokaż wszystkie branże/ }).click()
    await expect(tiles).toHaveCount(22)
    // First of the rest in the order of the board (`KG5`).
    await expect(tiles.filter({ hasText: 'Zakład produkcyjny' })).toBeFocused()
    await expect(tiles.filter({ hasText: 'Każda inna firma' })).toHaveAttribute('href', '/kreator')
  })

  test('steps and „Nasze zobowiązania”', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const steps = page.locator('#jak-pracujemy')
    await expect(steps.getByRole('heading', { level: 3 })).toHaveText([
      'Krok 1: Rozmowa',
      'Krok 2: Oferta',
      'Krok 3: Wdrożenie',
      'Krok 4: Opieka',
      /^Tak pracujemy — nie tylko na\sstronie\.$/,
    ])
    await expect(steps).toContainText('Pierwszy kontakt')
    await expect(steps).toContainText('Nasze zobowiązania')
    await expect(steps).toContainText('oddzwaniamy w godzinach pracy')
    await expect(steps.getByRole('link', { name: /Zadzwoń/ })).toHaveAttribute('href', /^tel:/)
  })

  test('v150 has no „Jedna firma czy pięć” and no news on the home page', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await expect(page.locator('#jeden')).toHaveCount(0)
    await expect(page.getByText('Ostatnio w Aktualnościach')).toHaveCount(0)
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('five industries and the unfold tile, no horizontal scroll', async ({ page }) => {
      await page.goto(site('biznes.localhost'))
      const grid = page
        .locator('#dla-kogo')
        .getByRole('list')
        .filter({ hasText: 'Sklep spożywczy' })
      await expect(grid.getByRole('link').filter({ visible: true })).toHaveCount(5)
      await expect(grid.getByRole('button', { name: /Pokaż wszystkie branże/ })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
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

  test('owner: quote, four numbers, authorization logos, the company page', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const facts = page.locator('#fakty')
    await expect(facts.locator('blockquote')).toContainText('u klienta po prostu działało')
    await expect(facts).toContainText('Słowo od właściciela')
    await expect(facts).not.toContainText('Zdjęcie właściciela')
    await expect(facts.locator('dd')).toHaveText(['2004', '100+', '2', '2'])
    await expect(facts).toContainText('klientów firmowych')
    await expect(facts).not.toContainText('pod stałą opieką')
    for (const name of ['Posnet', 'Elzab', 'InsERT', 'GoPOS']) {
      await expect(facts.getByRole('img', { name, exact: true })).toBeVisible()
    }
    await expect(
      facts.getByRole('link', { name: 'Poznaj PRO-KOM i pozostałe linie firmy' }),
    ).toHaveAttribute('href', '/o-firmie')
  })

  test('FAQ: numbered cards, the first open, FAQPage data', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const faq = page.locator('#faq')
    await expect(faq.getByRole('heading', { level: 2 })).toHaveText('Zanim zadzwonisz.')
    const items = faq.locator('details')
    await expect(items).toHaveCount(6)
    await expect(items.first()).toHaveAttribute('open', '')
    await expect(items.nth(1)).not.toHaveAttribute('open', '')
    await items.nth(1).locator('summary').click()
    await expect(items.nth(1)).toHaveAttribute('open', '')
    // K4-FINAL §1: no pricing model of the IT care.
    await expect(items.nth(1)).toContainText('wycenę na piśmie')
    await expect(faq).not.toContainText('miesięczną opłatą')
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

  test('section rail: the anchors of K36 §1, the current one marked', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost'))
    const rail = page.getByRole('navigation', { name: 'Na tej stronie' })
    // 12 entries of K36 §1; „Opinie” only with reviews switched on (off in the seed).
    await expect(rail.getByRole('link')).toHaveText([
      'Start',
      'Działy oferty',
      'Systemy i opieka IT',
      'Marki',
      'Najczęściej wybierane',
      'Dla kogo',
      'Plan Twojej firmy',
      'Jak pracujemy',
      'O firmie',
      'Pytania',
      'Kontakt',
    ])
    await rail.getByRole('link', { name: 'O firmie' }).click()
    await expect(page).toHaveURL(/#fakty$/)
    await expect(rail.getByRole('link', { name: 'O firmie' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })
})

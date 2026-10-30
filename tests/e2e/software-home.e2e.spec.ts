import { expect, test, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from './helpers'

// SW5–SW8b: start page of the Software line (spec. §4 pkt 1–12; §3.3 section rail; §7). Data
// from `pnpm seed`: the home page blocks in the order of `homeOrder`, texts in
// `SoftwareSettings.home`, areas and solutions of the package.
const HOST = 'software.localhost'

const areaTabs = (page: Page) =>
  page.getByRole('tablist', { name: 'Obszary oferty' }).getByRole('tab')
const areaPanel = (page: Page) => page.locator('#oferta').getByRole('tabpanel')
const previewTabs = (page: Page) =>
  page.getByRole('tablist', { name: 'Rodzaj rozwiązania' }).getByRole('tab')
const previewPanel = (page: Page) => page.locator('#podglady [role=tabpanel]:not([inert])')
const stageTabs = (page: Page) => page.getByRole('tablist', { name: 'Etapy' }).getByRole('tab')
const stagePanel = (page: Page) => page.locator('#proces [role=tabpanel]:not([inert])')
const modules = (page: Page) =>
  page.getByRole('group', { name: 'Moduły Twojego systemu' }).getByRole('button')

test.describe('Software start page', () => {
  test('sections in the order of the blocks, hero with the H1', async ({ page }) => {
    await page.goto(site(HOST))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Strony, systemy i aplikacje szyte pod Twoją firmę.',
    )
    const ids = await page
      .locator('main section[id]')
      .evaluateAll((sections) => sections.map((section) => section.id))
    expect(ids).toEqual([
      'start',
      'oferta',
      'popularne',
      'podglady',
      'proces',
      'dobierz',
      'bez-wordpressa',
      'zasady',
      'realizacje',
      'faq',
      'kontakt',
    ])
    await expect(
      page.locator('#start').getByRole('link', { name: /Dobierz rozwiązanie/ }),
    ).toHaveAttribute('href', '/#dobierz')
    await expect(page.locator('#start')).toContainText('Odpowiadamy w ciągu 1 dnia roboczego')
  })

  test('four intent tiles lead to the catalog and the wizard', async ({ page }) => {
    await page.goto(site(HOST))
    const tiles = page.locator('#start ul').last().getByRole('link')
    await expect(tiles).toHaveCount(4)
    await expect(tiles.nth(0)).toHaveAttribute('href', '/rozwiazania?kategoria=strony')
    await expect(tiles.nth(1)).toHaveAttribute('href', '/dobierz?potrzeba=prog')
  })

  test('„Twój system”: modules switch, „Chcę taki system” adds one project item', async ({
    page,
  }) => {
    // No self-assembling with reduced motion: the default three modules stay.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    await expect(modules(page)).toHaveCount(7)
    await expect(modules(page).and(page.locator('[aria-pressed="true"]'))).toHaveCount(3)

    await modules(page).filter({ hasText: 'Asystent AI' }).click()
    await expect(modules(page).filter({ hasText: 'Asystent AI' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.locator('#start')).toContainText('4moduływłasny system firmy')

    await page.getByRole('button', { name: 'Chcę taki system' }).click()
    await expect(page.getByRole('button', { name: '✓ W Twoim projekcie' })).toBeVisible()
    const stored = await page.evaluate(() => localStorage.getItem('pk-project'))
    expect(JSON.parse(stored ?? '[]')).toContainEqual({
      id: 'build-www-zlec-app-ai',
      name: 'system z 4 modułów',
    })
  })

  test('areas: tabs with arrows, a price, switching itself until picked', async ({ page }) => {
    await page.clock.install()
    await page.goto(site(HOST))
    await expect(areaTabs(page)).toHaveCount(8)
    await expect(areaTabs(page).first()).toHaveAttribute('aria-selected', 'true')
    await expect(areaPanel(page).getByRole('heading', { level: 3 })).toHaveText(
      'Strony internetowe',
    )
    await expect(areaPanel(page)).toContainText('od 999 zł')

    // Every 5,5 s the next area (pointer outside the section).
    await page.mouse.move(0, 0)
    await page.clock.runFor(5600)
    await expect(areaTabs(page).nth(1)).toHaveAttribute('aria-selected', 'true')

    // Picked by keyboard: stops for good.
    await areaTabs(page).nth(1).focus()
    await page.keyboard.press('ArrowRight')
    await expect(areaTabs(page).nth(2)).toHaveAttribute('aria-selected', 'true')
    await expect(areaTabs(page).nth(2)).toBeFocused()
    await page.keyboard.press('End')
    await expect(areaTabs(page).last()).toHaveAttribute('aria-selected', 'true')
    await page.mouse.move(0, 0)
    await page.locator('body').click({ position: { x: 1, y: 1 } })
    await page.clock.runFor(12_000)
    await expect(areaTabs(page).last()).toHaveAttribute('aria-selected', 'true')
  })

  test('areas do not switch themselves with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.clock.install()
    await page.goto(site(HOST))
    // The section first, then the time: the clock only runs once the tabs are on the page.
    await expect(areaTabs(page)).toHaveCount(8)
    await page.mouse.move(0, 0)
    await page.clock.runFor(12_000)
    await expect(areaTabs(page).first()).toHaveAttribute('aria-selected', 'true')
  })

  test('12 rzeczy: tabs filter the cards, a card expands', async ({ page }) => {
    await page.goto(site(HOST))
    const section = page.locator('#popularne')
    const cards = section.getByTestId('popular-card')
    await expect(cards).toHaveCount(12)
    await expect(section).toContainText('12 pozycji · kliknij kartę, żeby rozwinąć')

    await section.getByRole('tab', { name: /Systemy/ }).click()
    await expect(cards).toHaveCount(4)
    await expect(section).toContainText('4 pozycje')

    const first = cards.first()
    await first.getByRole('button', { name: 'CRM dla małej i średniej firmy', exact: true }).click()
    await expect(first).toContainText('Co dostajesz')
    await expect(section).toContainText('Opieka i rozwój')
    await expect(section).toContainText('od 149 zł / mies.')
  })

  test('previews: 5 tabs, switching itself every 6 s until picked', async ({ page }) => {
    await page.clock.install()
    await page.goto(site(HOST))
    await expect(previewTabs(page)).toHaveText([
      'Strona',
      'Rezerwacje',
      'System firmowy',
      'Aplikacja mobilna',
      'Automatyzacje i AI',
    ])
    await expect(previewTabs(page).first()).toHaveAttribute('aria-selected', 'true')
    await expect(previewPanel(page).getByRole('heading', { level: 3 })).toHaveText(
      'Strona, która zbiera zapytania, a nie kurz',
    )
    await expect(previewPanel(page)).toContainText('w mniej niż 2,5 sekundy') // Google LCP
    await expect(page.locator('#podglady')).toContainText('Przełącza się samo.')

    // Switching by itself never moves the page below (no layout shift).
    const height = async () => (await page.locator('#podglady').boundingBox())?.height
    const before = await height()
    await page.mouse.move(0, 0)
    await page.clock.runFor(6100)
    await expect(previewTabs(page).nth(1)).toHaveAttribute('aria-selected', 'true')
    expect(await height()).toBe(before)

    // Picked by keyboard: stops for good, the hint says so.
    await previewTabs(page).nth(1).focus()
    await page.keyboard.press('ArrowRight')
    await expect(previewTabs(page).nth(2)).toBeFocused()
    await expect(previewPanel(page).getByRole('heading', { level: 3 })).toHaveText(
      'Cała firma w jednym panelu',
    )
    await expect(page.locator('#podglady')).toContainText('Twój wybór. Klikaj po ekranach.')
    await page.mouse.move(0, 0)
    await page.locator('body').click({ position: { x: 1, y: 1 } })
    await page.clock.runFor(20_000)
    await expect(previewTabs(page).nth(2)).toHaveAttribute('aria-selected', 'true')
  })

  test('„Chcę takie u siebie” adds the preview to „Twój projekt”', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    await previewTabs(page).nth(1).click()
    await previewPanel(page).getByRole('button', { name: 'Chcę takie u siebie' }).click()
    await expect(
      previewPanel(page).getByRole('button', { name: '✓ W Twoim projekcie' }),
    ).toHaveAttribute('aria-pressed', 'true')
    const stored = await page.evaluate(() => localStorage.getItem('pk-project'))
    expect(JSON.parse(stored ?? '[]')).toContainEqual({ id: 'hero-rez', name: 'rezerwacje' })
    await expect(
      previewPanel(page).getByRole('link', { name: 'Otwórz pełny podgląd' }),
    ).toHaveAttribute('href', '/rozwiazania')
  })

  test('process: 5 stages, the sample quote, switching itself until picked', async ({ page }) => {
    await page.clock.install()
    await page.goto(site(HOST))
    await expect(stageTabs(page)).toHaveCount(5)
    await expect(stageTabs(page).first()).toContainText('Rozmowa')
    await expect(stagePanel(page).getByRole('heading', { level: 3 })).toHaveText(
      'Opowiadasz, jak pracuje firma. My słuchamy.',
    )
    await expect(stagePanel(page)).toContainText('Płacisz: 0 zł')

    const height = async () => (await page.locator('#proces').boundingBox())?.height
    const before = await height()
    await page.mouse.move(0, 0)
    await page.clock.runFor(5300)
    await expect(stageTabs(page).nth(1)).toHaveAttribute('aria-selected', 'true')
    expect(await height()).toBe(before)
    // Stage 2: the quote of `proceduralMock` — amounts of the price list.
    await expect(stagePanel(page)).toContainText('Wycena nr PKS-2026-0142')
    await expect(stagePanel(page)).toContainText('8 980 zł netto')

    await stageTabs(page).nth(4).click()
    await expect(stagePanel(page)).toContainText('Etap 05')
    await page.mouse.move(0, 0)
    await page.clock.runFor(20_000)
    await expect(stageTabs(page).nth(4)).toHaveAttribute('aria-selected', 'true')
  })

  test('previews and process do not switch themselves with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.clock.install()
    await page.goto(site(HOST))
    await expect(previewTabs(page)).toHaveCount(5)
    await expect(stageTabs(page)).toHaveCount(5)
    await page.mouse.move(0, 0)
    await page.clock.runFor(20_000)
    await expect(previewTabs(page).first()).toHaveAttribute('aria-selected', 'true')
    await expect(stageTabs(page).first()).toHaveAttribute('aria-selected', 'true')
  })

  test('the wizard is a section of the page, its title an h2', async ({ page }) => {
    await page.goto(site(HOST))
    const wizard = page.locator('#dobierz')
    await expect(wizard.getByRole('heading', { level: 2 })).toHaveText(
      'Kliknij kilka razy. Zobacz, co dla Ciebie zbudujemy.',
    )
    await expect(wizard.getByRole('heading', { level: 3 }).first()).toBeVisible()
  })

  test('„Dlaczego nie WordPress”: facts with sources, 6 rows, the rebuild price from Solutions', async ({
    page,
  }) => {
    await page.goto(site(HOST))
    const section = page.locator('#bez-wordpressa')
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(
      'Bez wtyczek do łatania. Bez nocnych aktualizacji.',
    )
    const facts = section.getByRole('listitem')
    await expect(facts).toHaveCount(3)
    await expect(facts.nth(0)).toContainText('Źródło: Patchstack')
    await expect(facts.nth(1)).toContainText('Źródło: RODO, art. 33 i art. 83 ust. 4')
    const table = section.getByRole('table', { name: 'WordPress z wtyczkami a Strona od PRO-KOM' })
    await expect(table.getByRole('rowheader')).toHaveText([
      'Szybkość',
      'Bezpieczeństwo',
      'Aktualizacje',
      'Wygląd',
      'Google i AI',
      'Zmiana treści',
    ])
    await expect(table.getByRole('columnheader').nth(2)).toHaveText('Strona od PRO-KOM')
    await expect(
      section.getByRole('link', { name: 'Sprawdź swoją stronę za darmo' }),
    ).toHaveAttribute('href', '/audyt')
    // The price is filled from `Solutions` (`{cena:przebudowa-starej-strony}`), no token left.
    const rebuild = section.getByRole('link', { name: /^Przebudowa od / })
    await expect(rebuild).toHaveText(/^Przebudowa od 1\s?499 zł →$/)
    await expect(rebuild).toHaveAttribute('href', '/rozwiazania/przebudowa-starej-strony')
    await expect(section).not.toContainText('{cena')
  })

  test('„Zasady”: 6 guarantee cards and „Czasem powiemy”', async ({ page }) => {
    await page.goto(site(HOST))
    const section = page.locator('#zasady')
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(
      'Zasady, których się trzymamy.',
    )
    await expect(section.getByRole('listitem')).toHaveCount(6)
    await expect(section.getByRole('listitem').first()).toContainText('Stała cena za zakres')
    await expect(section).toContainText('Czasem powiemy: nie budujcie.')
  })

  test('„Realizacje”: 3 own systems with their status and the figures', async ({ page }) => {
    await page.goto(site(HOST))
    const section = page.locator('#realizacje')
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(
      'Najpierw zbudowaliśmy to dla siebie.',
    )
    const systems = section.getByRole('link')
    await expect(systems).toHaveCount(3)
    await expect(systems.nth(0)).toHaveAttribute('href', 'https://prokomserwis.pl')
    await expect(systems.nth(0)).toContainText('działa')
    await expect(systems.nth(2)).toContainText('prokombiznes.pl')
    await expect(systems.nth(2)).toContainText('w budowie')
    // Locally the empty fact `[WYNIK]` stays visible; production drops that figure.
    await expect(section.locator('ul').last().getByRole('listitem')).toHaveCount(4)
    await expect(section).toContainText('2004')
    await expect(section).toContainText('100+')
  })

  test('FAQ: 6 questions, the first open, facts filled, FAQPage JSON-LD', async ({ page }) => {
    await page.goto(site(HOST))
    const section = page.locator('#faq')
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(
      'Pytania, które słyszymy najczęściej',
    )
    const items = section.locator('details')
    await expect(items).toHaveCount(6)
    await expect(items.nth(0)).toHaveAttribute('open', '')
    await expect(items.nth(1)).not.toHaveAttribute('open', '')
    await expect(items.nth(0)).toContainText('od 149 zł miesięcznie')
    await items.nth(1).locator('summary').click()
    await expect(items.nth(1)).toContainText('Wersję testową oglądasz co tydzień')
    const jsonLd = await section
      .locator('script[type="application/ld+json"]')
      .evaluate((script) => JSON.parse(script.textContent ?? '{}'))
    expect(jsonLd['@type']).toBe('FAQPage')
    expect(jsonLd.mainEntity).toHaveLength(6)
    expect(JSON.stringify(jsonLd)).not.toContain('[OPIEKA OD]')
  })

  test('section rail above 1400 px, hidden below', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HOST))
    const rail = page.getByRole('navigation', { name: 'Na tej stronie' })
    await expect(rail.getByRole('link')).toHaveText([
      'Start',
      'Oferta',
      'Najczęściej zamawiane',
      'Podglądy na żywo',
      'Jak pracujemy i cena',
      'Dobierz rozwiązanie',
      'Dlaczego nie WordPress',
      'Realizacje',
      'Pytania',
      'Kontakt',
    ])
    await expect(rail).toBeVisible()
    await page.setViewportSize({ width: 1400, height: 900 })
    await expect(rail).toBeHidden()
  })
})

// Own client address per run (benchmark range 198.18.0.0/15): the limit of 5 inquiries per
// 10 minutes keys on `X-Real-IP`, so this send never uses up the limit of other specs.
const clientIp = `198.19.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`

test.describe('Software start page — contact form', () => {
  const contact = (page: Page) => page.locator('#kontakt')
  const send = (page: Page) => contact(page).getByRole('button', { name: 'Wyślij' })

  test('promises, audit card and phone next to the form', async ({ page }) => {
    await page.goto(site(HOST))
    const section = contact(page)
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(
      'Powiedz, co Cię boli. Resztą zajmiemy się my.',
    )
    await expect(section).toContainText('Odpowiadamy w ciągu 1 dnia roboczego')
    await expect(section.getByRole('link', { name: /Masz już stronę\?/ })).toHaveAttribute(
      'href',
      '/audyt',
    )
    await expect(section.locator('a[href^="tel:"]')).toHaveCount(1)
    await expect(section.getByRole('radio')).toHaveCount(6)
    await expect(section.getByRole('radio', { name: 'System lub panel' })).toBeChecked()
  })

  test('77: errors under the fields and in the box, then sending → /dziekujemy', async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ 'X-Real-IP': clientIp })
    const name = `E2E kontakt SW8b ${Date.now()}`
    await page.goto(site(HOST, '/#kontakt'))
    const section = contact(page)
    await send(page).click()
    await expect(section.getByLabel('Opisz krótko, po swojemu')).toBeFocused()
    await expect(
      section.getByText('Podaj telefon albo e-mail, żebyśmy mogli wysłać wycenę.').first(),
    ).toBeVisible()

    // stany/77: everything filled but the consent.
    // The radio is visually hidden; its label card is what people click.
    await section.locator('label', { hasText: 'Opieka lub ratunek' }).click()
    await expect(section.getByRole('radio', { name: 'Opieka lub ratunek' })).toBeChecked()
    await section.getByLabel('Opisz krótko, po swojemu').fill('Strona po kimś, kto zniknął.')
    await section.getByLabel('Imię i firma').fill(name)
    await section.getByLabel('E-mail albo telefon').fill('e2e-kontakt@example.test')
    await send(page).click()
    await expect(section.getByRole('checkbox', { name: /Wyrażam zgodę/ })).toBeFocused()
    await expect(
      section.getByText('Zaznacz zgodę na kontakt w sprawie wyceny.').first(),
    ).toBeVisible()

    await section.getByRole('checkbox', { name: /Wyrażam zgodę/ }).check()
    // The server refuses forms sent faster than a person can fill them (spam protection).
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await send(page).click()
    await expect(page).toHaveURL(/\/dziekujemy\?nr=PKS-\d{4}-\d{4,}$/)

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[name][equals]=${encodeURIComponent(name)}&depth=0`,
    )
    const record = (json.docs as Record<string, unknown>[])[0]
    try {
      expect(record).toMatchObject({
        line: 'software',
        type: 'contact',
        topics: ['opieka'],
        email: 'e2e-kontakt@example.test',
        message: 'Strona po kimś, kto zniknął.',
      })
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })

  test('a server error is announced in the box', async ({ page }) => {
    await page.route('**/api/inquiry', (route) =>
      route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
    )
    await page.goto(site(HOST, '/#kontakt'))
    const section = contact(page)
    await section.getByLabel('Opisz krótko, po swojemu').fill('Test błędu serwera.')
    await section.getByLabel('Imię i firma').fill('E2E')
    await section.getByLabel('E-mail albo telefon').fill('600 100 200')
    await section.getByRole('checkbox', { name: /Wyrażam zgodę/ }).check()
    await send(page).click()
    const box = section.locator('div[tabindex="-1"]')
    await expect(box).toContainText('Nie udało się wysłać zapytania')
    await expect(box).toBeFocused()
    await expect(page).not.toHaveURL(/dziekujemy/)
  })
})

test.describe('Software start page on a phone', () => {
  for (const width of [390, 360]) {
    test(`fits ${width} px: no sideways scroll, intents without texts`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(site(HOST))
      const scroll = await page.evaluate(() => document.scrollingElement?.scrollWidth)
      expect(scroll).toBe(width)
      const intent = page.locator('#start ul').last().getByRole('link').first()
      await expect(intent.locator('span').last()).toBeHidden()
      // Touch targets of the sections ≥ 44 px.
      for (const target of [
        modules(page).first(),
        areaTabs(page).first(),
        page.locator('#popularne').getByRole('tab').first(),
        previewTabs(page).first(),
        stageTabs(page).first(),
      ]) {
        const box = await target.boundingBox()
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
      }
      // 12 rzeczy as a carousel: a card is 84% wide, the next one peeks in.
      const card = await page.getByTestId('popular-card').first().boundingBox()
      expect(card?.width ?? 0).toBeLessThan(width * 0.9)
      // Previews: the laptop only, no phone and no floating notes; process without the sketch.
      await expect(previewPanel(page).getByText('Nowe zapytanie z formularza')).toBeHidden()
      const stage = await previewPanel(page).locator('[aria-hidden="true"]').first().boundingBox()
      expect(stage?.width ?? 0).toBeGreaterThan(width * 0.8)
      expect((stage?.x ?? 0) + (stage?.width ?? 0)).toBeLessThanOrEqual(width)
      await stageTabs(page).nth(1).click()
      await expect(stagePanel(page).getByText('szkic Twojego systemu, za darmo')).toBeHidden()
      // „Bez WordPressa”: facts as a carousel, the table as cards (no column header row).
      const why = page.locator('#bez-wordpressa')
      const fact = await why.getByRole('listitem').first().boundingBox()
      expect(fact?.width ?? 0).toBeLessThan(width * 0.9)
      const row = why.getByRole('row').nth(1)
      const name = await row.getByRole('rowheader').boundingBox()
      const theirs = await row.getByRole('cell').nth(0).boundingBox()
      const ours = await row.getByRole('cell').nth(1).boundingBox()
      expect(theirs?.y ?? 0).toBeGreaterThan(name?.y ?? 0)
      expect(ours?.y ?? 0).toBeGreaterThan(theirs?.y ?? 0)
      const header = await why.getByRole('row').first().boundingBox()
      expect(header?.height ?? 0).toBeLessThanOrEqual(1)
      // Realizacje: a carousel of systems, the figures 2×2.
      const showcase = page.locator('#realizacje')
      const system = await showcase.getByRole('link').first().boundingBox()
      expect(system?.width ?? 0).toBeLessThan(width * 0.9)
      const figures = showcase.locator('ul').last().getByRole('listitem')
      const [first, second, third] = await Promise.all(
        [0, 1, 2].map((index) => figures.nth(index).boundingBox()),
      )
      expect(Math.round(second?.y ?? 0)).toBe(Math.round(first?.y ?? 0))
      expect(third?.y ?? 0).toBeGreaterThan(first?.y ?? 0)
      // Kontakt: the form under the promises, topics as large targets.
      const side = await page.locator('#kontakt').getByText('Najpierw zobaczysz').boundingBox()
      const form = await page.locator('#kontakt form').boundingBox()
      expect(form?.y ?? 0).toBeGreaterThan(side?.y ?? 0)
      const topic = await page
        .locator('#kontakt label:has(input[type=radio])')
        .first()
        .boundingBox()
      expect(topic?.height ?? 0).toBeGreaterThanOrEqual(44)
    })
  }
})

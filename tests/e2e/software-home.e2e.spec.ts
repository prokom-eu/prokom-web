import { expect, test, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, hydrated, loginAsAdmin, site } from './helpers'

// Start page of the Software line — v24 (ZMIANY-v24 §4: hero in software-hero, the new sections in
// software-podglad; here the order, the rail, the process, the wizard, FAQ and the contact form).
// Data from `pnpm seed`: the blocks in the order of `HOME_ORDER_V24`, texts in `SoftwareSettings.home`.
const HOST = 'software.localhost'

const stageTabs = (page: Page) => page.getByRole('tablist', { name: 'Etapy' }).getByRole('tab')
const stagePanel = (page: Page) => page.locator('#proces [role=tabpanel]:not([inert])')

test.describe('Software start page', () => {
  test('sections in the order of the blocks, hero with the H1', async ({ page }) => {
    await page.goto(site(HOST))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Zrobimy Ci /)
    const ids = await page
      .locator('main section[id]')
      .evaluateAll((sections) => sections.map((section) => section.id))
    // v24 (ZMIANY-v24 §4): the order of HOME_ORDER_V24; the v23 sections render nothing.
    expect(ids).toEqual([
      'start',
      'obietnice',
      'sytuacje',
      'oferta',
      'podglady',
      'technologia',
      'dobierz',
      'cennik',
      'proces',
      'faq',
    ])
    // v24: „Napisz po swojemu” is the card next to the FAQ, in its section.
    await expect(page.locator('#faq #kontakt')).toBeVisible()
    // Hero v24 (SWA2a): details in software-hero.e2e.spec.ts.
    await expect(page.locator('#start h1')).toContainText('Zrobimy Ci')
  })

  test('process: 5 stages, the stage card, switching itself until picked', async ({ page }) => {
    await page.clock.install()
    await page.goto(site(HOST))
    await expect(stageTabs(page)).toHaveCount(5)
    await expect(stageTabs(page).first()).toContainText('Rozmowa')
    await expect(stagePanel(page).getByRole('heading', { level: 3 })).toHaveText(
      'Najpierw słuchamy, jak pracuje Twoja firma',
    )
    await expect(stagePanel(page)).toContainText('Płacisz: 0 zł')
    await expect(stageTabs(page).nth(2)).toContainText('od 1 tyg.')

    const height = async () => (await page.locator('#proces').boundingBox())?.height
    const before = await height()
    await page.mouse.move(0, 0)
    await page.clock.runFor(6300)
    await expect(stageTabs(page).nth(1)).toHaveAttribute('aria-selected', 'true')
    expect(await height()).toBe(before)
    // v24: the card shows the stage's eyebrow, heading and what you pay — no sample quote.
    await expect(stagePanel(page)).toContainText('Etap 02')
    await expect(stagePanel(page)).toContainText('Płacisz:')

    await stageTabs(page).nth(4).click()
    await expect(stagePanel(page)).toContainText('Etap 05')
    await page.mouse.move(0, 0)
    await page.clock.runFor(20_000)
    await expect(stageTabs(page).nth(4)).toHaveAttribute('aria-selected', 'true')
  })

  test('tech section: 4 tabs, the picked one shows its picture and „them vs us”', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    const tech = page.locator('#technologia')
    const tabs = tech.getByRole('tab')
    await expect(tabs).toHaveCount(4)
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
    // A lazy island (ADR-023): a click before hydration is lost.
    await hydrated(tabs.nth(3))
    await tabs.nth(3).click()
    await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true')
    await expect(tech.getByRole('tabpanel')).toContainText('PostgreSQL')
    await expect(tech.getByRole('tabpanel')).toContainText('Strona od PRO-KOM')
  })

  test('price list: filters with counts, cards with the price from Solutions', async ({ page }) => {
    await page.goto(site(HOST))
    const pricing = page.locator('#cennik')
    const cards = pricing.locator('.v-card')
    await expect(cards).toHaveCount(16)
    // The filters work once the section is hydrated: clicked until the list follows.
    await expect(async () => {
      await pricing.getByRole('button', { name: /^Systemy · 4$/ }).click()
      await expect(cards).toHaveCount(4, { timeout: 1000 })
    }).toPass()
    await expect(cards.first()).toContainText(/od [\d\s]+zł/)
    await expect(cards.first()).toHaveAttribute('href', /\/rozwiazania\?rozwiazanie=/)
  })

  test('the process does not switch itself with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.clock.install()
    await page.goto(site(HOST))
    await expect(stageTabs(page)).toHaveCount(5)
    await page.mouse.move(0, 0)
    await page.clock.runFor(20_000)
    await expect(stageTabs(page).first()).toHaveAttribute('aria-selected', 'true')
  })

  test('the wizard is a section of the page, its title an h2', async ({ page }) => {
    await page.goto(site(HOST))
    const wizard = page.locator('#dobierz')
    await expect(wizard.getByRole('heading', { level: 2 })).toHaveText('Policz swój projekt.')
    await expect(wizard.getByRole('heading', { level: 2 }).locator('em')).toHaveText(
      'swój projekt.',
    )
    await expect(wizard.getByRole('heading', { level: 3 }).first()).toBeVisible()
  })

  test('FAQ: 6 questions, the first open, facts filled, FAQPage JSON-LD', async ({ page }) => {
    await page.goto(site(HOST))
    const section = page.locator('#faq')
    await expect(section.locator('#faq-h')).toHaveText('Zanim napiszesz')
    await expect(section.locator('#faq-h em')).toHaveText('napiszesz')
    const items = section.locator('details')
    await expect(items).toHaveCount(6)
    await expect(items.nth(0)).toHaveAttribute('open', '')
    await expect(items.nth(1)).not.toHaveAttribute('open', '')
    await expect(items.nth(0)).toContainText('od 149 zł miesięcznie')
    await items.nth(1).locator('summary').click()
    // „Ile to trwa?” with the „od” terms of the solutions (decyzja 10), no token left.
    await expect(items.nth(1)).toContainText('Wizytówka i landing od 1 tygodnia')
    await expect(items.nth(1)).not.toContainText('{termin')
    const jsonLd = await section
      .locator('script[type="application/ld+json"]')
      .evaluate((script) => JSON.parse(script.textContent ?? '{}'))
    expect(jsonLd['@type']).toBe('FAQPage')
    expect(jsonLd.mainEntity).toHaveLength(6)
    expect(JSON.stringify(jsonLd)).not.toContain('[OPIEKA OD]')
  })

  // SWA5a: the shared side rail of the frame (`SiteRail`, sections from `shared.rail`) from 1400 px.
  test('section rail from 1400 px, hidden below', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HOST))
    const rail = page.locator('[data-site-rail]').getByRole('group', { name: 'Na tej stronie' })
    await expect(rail.getByRole('link')).toHaveText([
      'Start',
      'Od czego zaczynasz',
      'Oferta',
      'Podglądy na żywo',
      'Jak robimy',
      'Kreator 60 s',
      'Cennik',
      'Jak pracujemy',
      'Pytania',
      'Kontakt',
    ])
    await expect(rail).toBeVisible()
    // SWV6: the marked entry is the section whose top passed 40% of the screen; at the bottom of
    // the page — „Kontakt”.
    const marked = rail.locator('[aria-current="location"]')
    await page.evaluate(() => {
      const top = document.getElementById('proces')!.getBoundingClientRect().top
      window.scrollTo({ top: window.scrollY + top - 100, behavior: 'instant' })
    })
    await expect(marked).toHaveText('Jak pracujemy')
    await page.evaluate(() =>
      window.scrollTo({ top: document.scrollingElement!.scrollHeight, behavior: 'instant' }),
    )
    await expect(marked).toHaveText('Kontakt')
    await page.setViewportSize({ width: 1399, height: 900 })
    await expect(rail).toBeHidden()
  })
})

// Own client address per run (benchmark range 198.18.0.0/15): the limit of 5 inquiries per
// 10 minutes keys on `X-Real-IP`, so this send never uses up the limit of other specs.
const clientIp = `198.19.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`

test.describe('Software start page — contact form', () => {
  const contact = (page: Page) => page.locator('#kontakt')
  const send = (page: Page) => contact(page).getByRole('button', { name: 'Wyślij' })

  test('v24: heading, the line under it, topics as chips, phone and e-mail', async ({ page }) => {
    await page.goto(site(HOST))
    const section = contact(page)
    await expect(section.locator('#kontakt-h')).toHaveText('Napisz po swojemu')
    await expect(section).toContainText('Odpowiadamy w ciągu 1 dnia roboczego. Zawsze człowiek.')
    // The v23 side (promises, audit card, second number) is gone; the line's phone and e-mail stay.
    await expect(section.getByRole('link', { name: /Masz już stronę\?/ })).toHaveCount(0)
    await expect(section.locator('a[href^="tel:"]')).toHaveCount(1)
    await expect(section.locator('a[href^="mailto:"]')).toHaveCount(1)
    await expect(section).not.toContainText('[MIESIĄC]')
    await expect(section.getByRole('radio')).toHaveCount(6)
    // v21: no topic picked at first.
    await expect(section.getByRole('radio', { checked: true })).toHaveCount(0)
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
    await expect(section.getByText('Wpisz telefon albo adres e-mail.').first()).toBeVisible()

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
      section.getByText('Zaznacz zgodę, bez niej nie możemy odpowiedzieć.').first(),
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
    // The form is a lazy widget (ADR-023): typing before it hydrates would be reset. An empty send
    // moves focus to the first field only once it is hydrated (as in test 77).
    await send(page).click()
    await expect(section.getByLabel('Opisz krótko, po swojemu')).toBeFocused()
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
    test(`fits ${width} px: no sideways scroll, sections as on a phone`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(site(HOST))
      const scroll = await page.evaluate(() => document.scrollingElement?.scrollWidth)
      expect(scroll).toBe(width)
      // Touch targets of the sections ≥ 44 px.
      for (const target of [
        stageTabs(page).first(),
        page.locator('#oferta').getByRole('button', { name: 'Firmowa' }),
        page.locator('#podglady').getByRole('tab').first(),
      ]) {
        const box = await target.boundingBox()
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
      }
      // Hero v24 on a phone (ZMIANY-v24 §10): one window — 320 px since SWA8, so it ends above
      // the tab bar (AUDYT po SWA7 #3) — the tiles in a row, the caption button across the width.
      const hero = page.locator('#start')
      const active = await hero.locator('.hx-win[data-rank="r0"]').boundingBox()
      expect(Math.round(active?.width ?? 0)).toBe(320)
      const capButton = await hero.locator('.hx-cap a').boundingBox()
      expect(capButton?.width ?? 0).toBeGreaterThan(width - 80)
      // Kontakt v24: the card under the FAQ (one column), topics as large targets.
      const faq = await page.locator('#faq-h').boundingBox()
      const form = await page.locator('#kontakt form').boundingBox()
      expect(form?.y ?? 0).toBeGreaterThan(faq?.y ?? 0)
      const topic = await page
        .locator('#kontakt label:has(input[type=radio])')
        .first()
        .boundingBox()
      expect(topic?.height ?? 0).toBeGreaterThanOrEqual(44)
    })
  }
})

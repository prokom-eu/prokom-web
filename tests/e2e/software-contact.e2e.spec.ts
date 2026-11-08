import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, setTheme, site } from './helpers'

// SWA5b: `/kontakt` of the Software line on the shared Kontakt template (spec §6.1,
// ZMIANY-v24 §9.3): texts from `SiteSettings.shared.contact` (`src/seed/shared/software.ts`),
// „Twój projekt” in the `formPrefill` slot — its items make the inquiry a `list`, then the list
// is emptied; `?poziom=` adds the care level to the message. Success stays on the page (shared
// SuccessPanel). Data from `pnpm seed`; inquiries made here are deleted at the end.
const HOST = 'software.localhost'

// Own client address per test (benchmark range 198.18.0.0/15): the limit of 5 inquiries per
// 10 minutes keys on `X-Real-IP`, so these sends never use up the limit of other specs.
const newVisitor = (page: Page) =>
  page.setExtraHTTPHeaders({
    'X-Real-IP': `198.18.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
  })

const PROJECT = [
  { id: 'strona-firmowa-z-panelem', name: 'Strona firmowa z panelem' },
  { id: 'opieka-nad-strona-i-systemem', name: 'Opieka nad stroną i systemem · poziom Rozszerzona' },
]

const withProject = (page: Page, project: unknown) =>
  page.addInitScript((value) => localStorage.setItem('pk-project', value), JSON.stringify(project))

const contact = (page: Page) => page.locator('[data-contact-page]')
const form = (page: Page) => page.locator('[data-contact-page] [data-contact-form]')
const projectBox = (page: Page) => form(page).getByRole('region', { name: 'Twój projekt' })
const submit = (page: Page) => form(page).locator('button[type="submit"]')

/** The inquiry saved under this name (panel REST from the logged-in page). */
async function findInquiry(page: Page, name: string) {
  await loginAsAdmin(page)
  const { json } = await api(
    page,
    'GET',
    `/api/inquiries?where[name][equals]=${encodeURIComponent(name)}&depth=0`,
  )
  return (json.docs as Record<string, unknown>[])[0]
}

test.describe('Software /kontakt (shared template)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('hero: H1, phone 883 200 151, second number tile, address card with CEIDG', async ({
    page,
  }) => {
    const response = await page.goto(site(HOST, '/kontakt'))
    expect(response?.status()).toBe(200)
    await expect(page.locator('main h1')).toHaveCount(1)
    await expect(contact(page).getByRole('heading', { level: 1 })).toHaveText(
      'Porozmawiajmy o Twoim projekcie.',
    )
    const hero = contact(page).locator('section[aria-labelledby="kontakt-h1"]')
    await expect(hero.getByRole('link', { name: '883 200 151', exact: true })).toHaveAttribute(
      'href',
      'tel:+48883200151',
    )
    await expect(hero.getByRole('link', { name: /Opisz projekt/ })).toHaveAttribute(
      'href',
      '#formularz',
    )
    // Facts: the second number from the line's settings, the answer time, the e-mail.
    const second = hero.getByRole('listitem').filter({ hasText: 'Albo drugi numer' })
    await expect(second.getByRole('link', { name: '788 986 074' })).toHaveAttribute(
      'href',
      'tel:+48788986074',
    )
    await expect(hero.getByRole('listitem').filter({ hasText: 'Na odpowiedź' })).toContainText(
      '1 dzień roboczy',
    )
    await expect(hero.locator('a[href="mailto:kontakt@prokomsoftware.pl"]')).toBeVisible()

    const card = hero.locator('[data-address-card]')
    await expect(card).toContainText('ul. Orkana 16B')
    await expect(card).toContainText('Rabka-Zdrój')
    await expect(card.getByRole('list', { name: 'Godziny otwarcia' })).toBeVisible()
    await expect(card.getByRole('link', { name: /Sprawdź w CEIDG/ })).toHaveAttribute(
      'href',
      'https://www.biznes.gov.pl/pl/wyszukiwarka-firm',
    )
    // v23 leftovers are gone: no Zakopane, no WhatsApp, no „Jak wolisz rozmawiać?”.
    await expect(page.locator('main')).not.toContainText(/Zakopan|WhatsApp|Jak wolisz rozmawiać/i)
  })

  test('routes, the form with next steps, service area, other lines, FAQ, the band', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/kontakt'))
    const routes = page.locator('#z-czym-dzwonisz')
    await expect(routes.getByRole('heading', { level: 2 })).toHaveText('Z czym dzwonisz?')
    await expect(routes.locator('a[href="/dobierz"]')).toHaveText(/Kreator · 60 s/)
    await expect(routes.locator('a[href="/audyt"]')).toHaveText(/Darmowy audyt/)
    await expect(routes.locator('a[href="/kontakt#formularz"]')).toHaveText(/Opisz zmianę/)

    const section = page.locator('#formularz')
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(
      'Opisz, co chcesz usprawnić',
    )
    await expect(section).toContainText('1 dzień roboczy · Odpowiadamy')
    await expect(section).toContainText('Ty decydujesz · Bez zobowiązań')
    // Topic chips of the line; none picked at first. No „Twój projekt” without a list.
    const chips = form(page).locator('fieldset button')
    await expect(chips).toHaveText(['Strona', 'System lub panel', 'Aplikacja', 'Opieka', 'Audyt'])
    await expect(form(page).locator('[aria-pressed="true"]')).toHaveCount(0)
    await expect(projectBox(page)).toHaveCount(0)
    await expect(submit(page)).toHaveText(/Wyślij zgłoszenie/)

    await expect(page.locator('#dojazd').getByRole('heading', { level: 2 })).toHaveText(
      'Kod nie zna granic. Kawa jest w Rabce.',
    )
    await expect(page.locator('#dojazd [data-service-area]')).toBeVisible()
    await expect(page.locator('#inne-linie')).toBeVisible()

    const faq = page.locator('#pytania')
    await expect(faq.locator('details')).toHaveCount(4)
    await expect(faq).toContainText('Czy muszę mieć specyfikację?')
    await expect(faq).toContainText('Czy mogę przyjść bez umawiania?')
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
    const faqLd = ld.filter((text) => text.includes('"FAQPage"'))
    expect(faqLd).toHaveLength(1)
    expect(faqLd[0]).toContain('Czy muszę mieć specyfikację?')
    expect(ld.some((text) => text.includes('"BreadcrumbList"'))).toBe(true)

    // The template ends with the FAQ, no CTA of its own: the „Zacznij od podglądu” band follows.
    await expect(page.locator('section[data-footer-cta]')).toBeVisible()
  })

  test('empty form: the list of errors on top, message required', async ({ page }) => {
    await page.goto(site(HOST, '/kontakt'))
    const summary = form(page).getByRole('alert')
    await expect(async () => {
      // A click before hydration is lost — repeat until the summary shows.
      await submit(page).click()
      await expect(summary).toBeVisible({ timeout: 1000 })
    }).toPass()
    await expect(summary).toContainText('Podaj imię albo nazwę firmy.')
    // Software without a list: name, contact, message and consent (the server's rules).
    await expect(form(page).locator('[aria-invalid="true"]')).toHaveCount(4)
  })

  test('a contact inquiry with ?poziom= carries the care level; success stays on the page', async ({
    page,
  }) => {
    await newVisitor(page)
    const name = `E2E Kontakt SWA5b ${Date.now()}`
    const email = `swa5b-${Date.now()}@example.test`
    await page.goto(site(HOST, '/kontakt?poziom=rozszerzona#formularz'))
    // No list and no `?projekt=1`: no „Twój projekt” box, the level goes in at sending.
    await expect(projectBox(page)).toHaveCount(0)
    await form(page).getByLabel('Imię i firma').fill(name)
    await form(page).getByLabel('Telefon lub e-mail').fill(email)
    await form(page).getByLabel('Wiadomość').fill('Chcemy oddać stronę pod stałą opiekę.')
    await form(page).getByRole('checkbox').check()
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await submit(page).click()

    const done = contact(page).locator('[data-success-panel]')
    await expect(done).toContainText('Numer zgłoszenia: PKS-')
    await expect(done).toContainText('Potwierdzenie wyślemy na podany adres.')
    await expect(page).toHaveURL(/\/kontakt\?poziom=rozszerzona#formularz$/)

    const record = await findInquiry(page, name)
    expect(record, 'the inquiry is in the panel').toBeDefined()
    try {
      expect(record).toMatchObject({ line: 'software', type: 'contact', email })
      expect(String(record?.message)).toContain('Chcemy oddać stronę pod stałą opiekę.')
      expect(String(record?.message)).toContain('Poziom opieki: Rozszerzona')
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })

  test('an empty ?projekt=1 shows the box with a link to the offer', async ({ page }) => {
    await page.goto(site(HOST, '/kontakt?projekt=1#formularz'))
    await expect(projectBox(page)).toContainText('Twój projekt jest pusty.')
    await expect(projectBox(page).getByRole('link', { name: 'pełnej oferty' })).toHaveAttribute(
      'href',
      '/rozwiazania',
    )
    await expect(projectBox(page).getByRole('listitem')).toHaveCount(0)
  })

  test('„Twój projekt” goes with the inquiry as a list, then the list is cleared', async ({
    page,
  }) => {
    await newVisitor(page)
    await withProject(page, PROJECT)
    const name = `E2E Twój projekt SWA5b ${Date.now()}`
    await page.goto(site(HOST, '/kontakt'))
    // The seeded list shows the box without `?projekt=1`.
    await expect(projectBox(page).getByRole('listitem')).toHaveCount(2)
    await expect(projectBox(page)).toContainText('Razem (netto)')
    await expect(projectBox(page)).toContainText(/299\szł\/mies\./)
    // With a list the message is optional (as on the server).
    await expect(form(page).locator('label', { hasText: 'Wiadomość' })).toContainText(
      '(opcjonalnie)',
    )

    await form(page).getByLabel('Imię i firma').fill(name)
    await form(page).getByLabel('Telefon lub e-mail').fill('e2e-projekt@example.test')
    await form(page).getByRole('checkbox').check()
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await submit(page).click()

    await expect(contact(page).locator('[data-success-panel]')).toContainText(
      'Numer zgłoszenia: PKS-',
    )
    // No redirect to /dziekujemy any more.
    await expect(page).not.toHaveURL(/dziekujemy/)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('pk-project'))).toBe('[]')

    const record = await findInquiry(page, name)
    expect(record, 'the inquiry is in the panel').toBeDefined()
    try {
      expect(record).toMatchObject({
        line: 'software',
        type: 'list',
        email: 'e2e-projekt@example.test',
      })
      // No description typed: the server writes the message from the list.
      expect(String(record?.message)).toContain(
        'Strona firmowa z panelem, Opieka nad stroną i systemem',
      )
      const items = record?.items as { nameSnapshot: string; solution: number | null }[]
      expect(items.map((item) => item.nameSnapshot)).toEqual([
        'Strona firmowa z panelem',
        'Opieka nad stroną i systemem',
      ])
      expect(items.every((item) => typeof item.solution === 'number')).toBe(true)
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe on the page with the project box (${theme})`, async ({ page }) => {
      await setTheme(page, theme, { reducedMotion: 'reduce' })
      await withProject(page, PROJECT)
      await page.goto(site(HOST, '/kontakt'))
      await expect(projectBox(page)).toBeVisible()
      const { violations } = await new AxeBuilder({ page })
        .include('[data-contact-page]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(
        violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([])
    })
  }
})

test.describe('Software /kontakt on a phone', () => {
  // Touch phone emulation in Chromium (`devices[...]` would switch the browser: not in a group).
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  for (const width of [360, 390]) {
    test(`fits ${width} px with the project box: no sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await withProject(page, PROJECT)
      await page.goto(site(HOST, '/kontakt?projekt=1#formularz'))
      await expect(projectBox(page)).toBeVisible()
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test('topic chips are at least 44 px high', async ({ page }) => {
    await page.goto(site(HOST, '/kontakt'))
    const heights = await form(page)
      .locator('fieldset button')
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height))
    expect(heights.length).toBe(5)
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44)
  })
})

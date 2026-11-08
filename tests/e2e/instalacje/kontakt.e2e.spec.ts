import AxeBuilder from '@axe-core/playwright'
import { expect, type APIRequestContext, type Page, test } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../../src/lib/inquiry/spam'
import { api, loginAsAdmin, setTheme, site } from '../helpers'

// L2-I: `/kontakt` of Instalacje on the shared Kontakt template (spec §6.1) — the line's
// routes („Zgłoś awarię”, decision D4), no CTA band (D5), no WhatsApp, the shared form →
// a contact inquiry of the Instalacje tenant with the chosen topic, e-mails in Mailpit.
// Data from `pnpm seed`; records made here are deleted.
const HOST = 'instalacje.localhost'
const MAILPIT = 'http://localhost:8025/api/v1'

const form = (page: Page) => page.locator('[data-contact-page] [data-contact-form]')
const randomIp = () => `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250)).join('.')}`

async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const response = await page.goto(site(HOST, '/kontakt'))
  await page.waitForLoadState('networkidle')
  return response
}

async function mailCount(request: APIRequestContext, query: string): Promise<number> {
  const response = await request.get(`${MAILPIT}/search`, { params: { query } })
  return ((await response.json()) as { messages: unknown[] }).messages.length
}

test.describe('Instalacje contact page (shared template)', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test.beforeEach(async ({ page }) => {
    // Its own client address, so the per-IP limit of other tests does not leak in (ADR-003).
    await page.setExtraHTTPHeaders({ 'X-Real-IP': randomIp() })
  })

  test('the template with the line data: H1, phone, routes, FAQ; no band, no WhatsApp', async ({
    page,
  }) => {
    expect((await open(page))?.status()).toBe(200)
    const main = page.locator('main')
    await expect(main.locator('h1')).toHaveCount(1)
    await expect(main.locator('h1')).toHaveText(/Kontakt z PRO-KOM Instalacje/)
    await expect(main.locator('[data-contact-page] a[href^="tel:"]').first()).toBeVisible()
    const routes = page.locator('#z-czym-dzwonisz')
    await expect(routes.locator('a[href="/zaplanuj"]')).toHaveText(/Zaplanuj instalację/)
    await expect(routes.locator('a[href="/serwis#zglos"]')).toHaveText(/Zgłoś awarię/)
    await expect(routes.locator('a[href="/dla-architektow"]')).toBeVisible()
    await expect(page.locator('#dojazd')).toBeVisible()
    await expect(page.locator('#pytania')).toContainText('Czy przyjeżdżacie na miejsce?')
    // The template ends with FAQ: no CTA band of the line (D5).
    await expect(main.locator('#cta-contact-title, .cta[data-surface="dark"]')).toHaveCount(0)
    await expect(main).not.toContainText(/WhatsApp|\[SZEF|\[Krystian/)
    expect(await page.locator('a[href*="wa.me"]').count()).toBe(0)
    // One salon today (Zakopane unpublished) — no second salon card.
    await expect(page.locator('[data-other-salons]')).toHaveCount(0)
    // BreadcrumbList of the template; LocalBusiness of the salon comes from the site layout.
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join()
    expect(ld).toContain('BreadcrumbList')
    expect(ld).toContain('LocalBusiness')
  })

  test('the form asks for what is missing, then saves a contact inquiry of Instalacje', async ({
    page,
    request,
  }) => {
    const name = `E2E Kontakt Inst ${Date.now()}`
    await open(page)
    const submit = form(page).locator('button[type="submit"]')
    await submit.click()
    await expect(form(page).getByRole('alert')).toContainText('Podaj numer telefonu')

    const chip = form(page).locator('fieldset button').first()
    const topic = (await chip.innerText()).trim()
    await chip.click()
    await form(page).getByLabel('Imię i firma').fill(name)
    await form(page).getByLabel('Telefon lub e-mail').fill('600 100 200')
    await form(page).getByLabel('Wiadomość').fill('Kamera nie nagrywa.')
    await form(page).getByRole('checkbox').check()
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await submit.click()

    const done = page.locator('[data-contact-page] [data-success-panel]')
    await expect(done).toContainText('Numer zgłoszenia: PKI-')

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[name][equals]=${encodeURIComponent(name)}&depth=0`,
    )
    const [record] = json.docs as Record<string, unknown>[]
    expect(record, 'the inquiry is in the panel').toBeDefined()
    try {
      expect(record).toMatchObject({
        line: 'instalacje',
        type: 'contact',
        category: topic,
        phone: '600 100 200',
      })
      const { json: tenants } = await api(
        page,
        'GET',
        '/api/tenants?where[slug][equals]=instalacje',
      )
      expect(record?.tenant).toBe((tenants.docs as { id: number }[])[0]?.id)
      await expect
        .poll(() => mailCount(request, `"${name}"`), { timeout: 15_000 })
        .toBeGreaterThan(0)
    } finally {
      expect((await api(page, 'DELETE', `/api/inquiries/${record?.id}`)).status).toBe(200)
    }
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`has no accessibility violations (${theme})`, async ({ page }) => {
      await setTheme(page, theme)
      await open(page)
      const { violations } = await new AxeBuilder({ page })
        .include('[data-contact-page]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(violations.map((v) => v.id)).toEqual([])
    })
  }
})

test.describe('Instalacje contact page on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('no sideways scroll; the phone and the form are reachable', async ({ page }) => {
    await open(page)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    await expect(page.locator('#formularz')).toBeAttached()
  })
})

test.describe('Instalacje O firmie (shared template)', () => {
  test('H1 and stats of the line, no people photos, no markers', async ({ page }) => {
    await page.goto(site(HOST, '/o-firmie'))
    const main = page.locator('main')
    await expect(main.locator('h1')).toHaveText(/instalacje w Rabce-Zdroju i na Podhalu/)
    // Runda v6 §1.8: one number for the years (the shared „2004”), the line adds another fact.
    await expect(main).toContainText('rodzajów instalacji u jednego wykonawcy')
    await expect(main).not.toContainText('lat na Podhalu')
    await expect(main).not.toContainText(/\[SZEF|\[Krystian|WhatsApp/)
    // Only line logos as images — no portraits (rule 01.11).
    const sources = await main
      .locator('img')
      .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src') ?? ''))
    expect(sources.every((src) => src.startsWith('/brand/'))).toBe(true)
  })

  test('the architects’ guardian has no photo or silhouette', async ({ page }) => {
    await page.goto(site(HOST, '/dla-architektow'))
    const guardian = page.locator('#opiekun')
    // `pnpm seed` sets the guardian's name, so the section is there.
    await expect(guardian).toBeAttached()
    await expect(guardian.locator('img, .aropi')).toHaveCount(0)
    // The former person silhouette (head circle) is gone; the ruler icon stands in its place.
    await expect(guardian.locator('.aropa svg circle[cx="60"][cy="46"]')).toHaveCount(0)
    await expect(guardian.locator('.aropa svg')).toHaveCount(1)
  })
})

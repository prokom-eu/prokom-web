import AxeBuilder from '@axe-core/playwright'
import { expect, type APIRequestContext, type Page, test } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from '../helpers'

// I11: the planner `/zaplanuj` (4 steps, ADR-I002 §4) and `/wyslane`. A wizard inquiry
// „Instalacje — Zaplanuj”: answers checked and named on the server, the office e-mail in
// Mailpit. Data from `pnpm seed` (the seed publishes the page with its `instPlanner` block).
const HOST = 'instalacje.localhost'
const MAILPIT = 'http://localhost:8025/api/v1'

// Own client address per run: the inquiry limit keys on `X-Real-IP` (see software-home spec).
const clientIp = `198.18.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`

async function open(page: Page, path = '/zaplanuj') {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  return page.goto(site(HOST, path))
}

async function mailCount(request: APIRequestContext, query: string): Promise<number> {
  const response = await request.get(`${MAILPIT}/search`, { params: { query } })
  return ((await response.json()) as { messages: unknown[] }).messages.length
}

const card = (page: Page) => page.locator('.zkcard')
const next = (page: Page) => card(page).getByRole('button', { name: /Dalej|Wyślij zgłoszenie/ })

test.describe('Instalacje planner', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('goes through the steps, asks for what is missing and saves a wizard inquiry', async ({
    page,
    request,
  }) => {
    await page.setExtraHTTPHeaders({ 'X-Real-IP': clientIp })
    const name = `E2E Zaplanuj ${Date.now()}`
    await open(page)

    // Step 1: nothing chosen → the error; a quick pick fills services and the object.
    await next(page).click()
    await expect(card(page).getByRole('alert')).toContainText('Zaznacz przynajmniej jedną')
    await card(page)
      .getByRole('button', { name: /Pensjonat, apartamenty/ })
      .click()
    await expect(page.locator('.zktsv .zktag')).toHaveCount(4)
    await next(page).click()

    // Step 2: the heading gets the focus; town → travel zone.
    await expect(card(page).getByRole('heading', { name: 'Gdzie to będzie?' })).toBeFocused()
    await card(page)
      .getByRole('button', { name: /Średni/ })
      .click()
    await card(page)
      .getByRole('button', { name: /Działa/ })
      .click()
    await card(page).getByRole('button', { name: 'Zakopane', exact: true }).click()
    await expect(page.locator('.zkzone')).toHaveText('Zakopane i Tatry')
    await next(page).click()

    // Step 3: one question per chosen service (alarm brings the video intercom).
    await expect(card(page).locator('.zkqc')).toHaveCount(5)
    await card(page).locator('.zkqc').first().getByRole('button', { name: '5–8' }).click()
    await card(page)
      .getByLabel(/Coś jeszcze/)
      .fill('Kamery na parking.')
    // No upload in v1: the photos go by e-mail.
    await expect(card(page).locator('input[type="file"]')).toHaveCount(0)
    await next(page).click()

    // Step 4: name, phone, consent — in this order.
    await next(page).click()
    await expect(card(page).getByRole('alert')).toContainText('Podaj imię')
    await expect(card(page).getByLabel('Imię')).toBeFocused()
    await card(page).getByLabel('Imię').fill(name)
    await next(page).click()
    await expect(card(page).getByRole('alert')).toContainText('numer telefonu')
    await card(page).getByLabel('Telefon').fill('600 100 200')
    await card(page).getByRole('button', { name: 'WhatsApp' }).click()
    await next(page).click()
    await expect(card(page).getByRole('alert')).toContainText('Zaznacz zgodę')
    await card(page).getByRole('checkbox').check()

    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await next(page).click()
    await expect(page).toHaveURL(/\/wyslane\?nr=PKI-\d{4}-\d{4,}&kontakt=whatsapp$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Dziękujemy! Zgłoszenie jest u nas.',
    )
    await expect(page.locator('.zkdone')).toContainText('na WhatsAppie')
    // The address carries the number and the contact way only — never the name or the phone.
    expect(page.url()).not.toContain('600')

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[name][equals]=${encodeURIComponent(name)}&depth=0`,
    )
    const record = (json.docs as Record<string, unknown>[])[0]
    try {
      expect(record).toMatchObject({
        line: 'instalacje',
        type: 'wizard',
        category: 'Instalacje — Zaplanuj',
        city: 'Zakopane',
        phone: '600 100 200',
        preferredContact: 'whatsapp',
        message: 'Kamery na parking.',
        topics: ['kam', 'wifi', 'kd', 'alarm'],
      })
      expect(record?.wizard).toMatchObject({
        Obiekt: 'Pensjonat',
        'Strefa dojazdu': 'Zakopane i Tatry',
        'Monitoring i kamery — Ile miejsc chcesz obserwować?': '5–8',
      })
      await expect
        .poll(() => mailCount(request, `"${name}"`), { timeout: 15_000 })
        .toBeGreaterThan(0)
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })

  test('takes the choices of other pages from the address', async ({ page }) => {
    await open(page, '/zaplanuj#obiekt=biuro&uslugi=ev,kam')
    await expect(page.locator('.zktsv .zktag')).toHaveText([/Monitoring/, /Ładowarki/])
    await expect(page.locator('.zkhint')).toContainText('Zaznaczyliśmy instalacje')
    await open(page, '/zaplanuj?usluga=ant')
    await expect(page.locator('.zktsv .zktag')).toHaveText([/Anteny/])
  })

  test('has no accessibility violations on the first step', async ({ page }) => {
    await open(page)
    const { violations } = await new AxeBuilder({ page })
      .include('.zkw')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violations.map((v) => v.id)).toEqual([])
  })
})

test.describe('Instalacje planner on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('one step on the screen, Wstecz/Dalej stick above the bar, no sideways scroll', async ({
    page,
  }) => {
    await open(page)
    await page.getByRole('button', { name: /Nowy dom/ }).click()
    await next(page).click()
    const nav = page.locator('.zknav')
    await expect(nav).toHaveCSS('position', 'sticky')
    await expect(page.locator('.xa-zkno')).toHaveText('Krok 2 z 4')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    for (const box of await page.locator('.zkbody button, .zknav button').all()) {
      const rect = await box.boundingBox()
      if (rect) expect(rect.height, await box.innerText()).toBeGreaterThanOrEqual(44)
    }
  })
})

test.describe('Instalacje /wyslane', () => {
  test('is not indexed and shows only a number of its own format', async ({ page }) => {
    await open(page, '/wyslane?nr=<b>x</b>&kontakt=telefon')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.getByTestId('inquiry-number')).toHaveCount(0)
    await expect(page.locator('.zkdone')).not.toContainText('<b>')
    await open(page, '/wyslane?nr=PKI-2026-0042&kontakt=phone')
    await expect(page.getByTestId('inquiry-number')).toHaveText('PKI-2026-0042')
    await expect(page.locator('.zkdone')).toContainText('telefonem')
  })

  test('is a 404 on another line', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/wyslane'))
    expect(response?.status()).toBe(404)
  })
})

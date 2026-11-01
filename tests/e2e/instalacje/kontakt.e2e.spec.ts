import AxeBuilder from '@axe-core/playwright'
import { expect, type APIRequestContext, type Page, test } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from '../helpers'

// I11: the contact page `/kontakt` (block `instContact`): the zone map, the contact cards from
// the panel, the form `#napisz` → a contact inquiry „Instalacje — kontakt” → `/wyslane`, the
// office e-mail in Mailpit. Data from `pnpm seed` (the seed replaces the sample page).
const HOST = 'instalacje.localhost'
const MAILPIT = 'http://localhost:8025/api/v1'

// Own client address per run: the inquiry limit keys on `X-Real-IP` (see software-home spec).
const clientIp = `198.17.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`

async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  return page.goto(site(HOST, '/kontakt'))
}

async function mailCount(request: APIRequestContext, query: string): Promise<number> {
  const response = await request.get(`${MAILPIT}/search`, { params: { query } })
  return ((await response.json()) as { messages: unknown[] }).messages.length
}

test.describe('Instalacje contact page', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('a typed town lights its zone and says the nearest salon', async ({ page }) => {
    await open(page)
    const field = page.locator('#kt-q')
    await field.fill('Szczaw')
    await expect(page.locator('#kt-q-res')).toContainText('Podhale')
    await expect(page.locator('#kt-q-res')).toContainText('najbliżej z salonu: Rabka-Zdrój')
    await expect(page.locator('svg.kmap2 .kroute')).toHaveCount(1)
    // A town outside the map still gets its zone.
    await field.fill('Kraków')
    await expect(page.locator('#kt-q-res')).toContainText('Małopolska')
  })

  test('shows the phone, e-mail and salons of the panel, no placeholders', async ({ page }) => {
    await open(page)
    await expect(page.locator('.ctc2 a[href^="tel:"]')).toHaveCount(1)
    await expect(page.locator('.ctc2 a[href^="mailto:"]')).toHaveCount(1)
    await expect(page.locator('.zsum a[href^="https://www.google.com/maps/"]')).not.toHaveCount(0)
    await expect(page.locator('main')).not.toContainText('[SZEF')
    // The footer drops its contact row: the page shows it (prototype `.ctc2`).
    await expect(page.locator('#stopka .ftc')).toBeHidden()
  })

  test('the form asks for what is missing, then saves a contact inquiry', async ({
    page,
    request,
  }) => {
    await page.setExtraHTTPHeaders({ 'X-Real-IP': clientIp })
    const name = `E2E Kontakt ${Date.now()}`
    await open(page)
    const form = page.locator('#napisz form')
    const send = form.getByRole('button', { name: 'Wyślij wiadomość' })

    await send.click()
    await expect(form.getByRole('alert')).toContainText('Podaj imię')
    await form.getByLabel('Imię').fill(name)
    await send.click()
    await expect(form.getByRole('alert')).toContainText('numer telefonu')
    await form.getByLabel('Telefon').fill('600 100 200')
    await form.getByRole('button', { name: 'Awaria lub serwis' }).click()
    await form.getByLabel('Wiadomość').fill('Kamera nie nagrywa.')
    await send.click()
    await expect(form.getByRole('alert')).toContainText('Zaznacz zgodę')
    await form.locator('label.consent input').check()

    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await send.click()
    await expect(page).toHaveURL(/\/wyslane\?kontakt=phone&nr=PKI-\d{4}-\d{4,}$/)
    await expect(page.getByTestId('inquiry-number')).toBeVisible()

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
        type: 'contact',
        category: 'Instalacje — kontakt',
        phone: '600 100 200',
        message: 'Sprawa: Awaria lub serwis\nKamera nie nagrywa.',
      })
      await expect
        .poll(() => mailCount(request, `"${name}"`), { timeout: 15_000 })
        .toBeGreaterThan(0)
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })

  test('has no accessibility violations in the form', async ({ page }) => {
    await open(page)
    const { violations } = await new AxeBuilder({ page })
      .include('#napisz')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violations.map((v) => v.id)).toEqual([])
  })
})

test.describe('Instalacje contact page on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('the town field sits under the lead, the map hides, no sideways scroll', async ({
    page,
  }) => {
    await open(page)
    await expect(page.locator('svg.kmap2')).toBeHidden()
    await page.locator('#kt-q-m').fill('Chabówka')
    await expect(page.locator('#kt-q-m-res')).toContainText('Rabka-Zdrój i okolice')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})

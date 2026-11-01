import AxeBuilder from '@axe-core/playwright'
import { expect, type APIRequestContext, type Page, test } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from '../helpers'

// I11: the service desk page `/serwis` (block `instServiceDesk`): the fault form `#zglos` → a
// contact inquiry „Instalacje — serwis” (urgency → `deadline`), the confirmation with the
// tracker, the office e-mail in Mailpit; care plans without prices. Data from `pnpm seed`.
const HOST = 'instalacje.localhost'
const MAILPIT = 'http://localhost:8025/api/v1'

// Own client address per run: the inquiry limit keys on `X-Real-IP` (see software-home spec).
const clientIp = `198.16.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`

async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  return page.goto(site(HOST, '/serwis'))
}

async function mailCount(request: APIRequestContext, query: string): Promise<number> {
  const response = await request.get(`${MAILPIT}/search`, { params: { query } })
  return ((await response.json()) as { messages: unknown[] }).messages.length
}

test.describe('Instalacje service desk', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('the fault form asks for what is missing, then saves a report', async ({
    page,
    request,
  }) => {
    await page.setExtraHTTPHeaders({ 'X-Real-IP': clientIp })
    const name = `E2E Serwis ${Date.now()}`
    await open(page)
    const form = page.locator('form#zglos')

    await form.getByRole('button', { name: 'Inna firma' }).click()
    await form.getByRole('button', { name: 'Zamki' }).click()
    // Another system brings its own symptoms.
    await expect(form.getByRole('button', { name: 'Słaba bateria' })).toBeVisible()
    await form.getByRole('button', { name: 'Słaba bateria' }).click()
    await form.getByRole('button', { name: /^Pilne/ }).click()
    await expect(form.locator('.xa-urg')).toContainText('Pilne? Zadzwoń:')

    const send = form.getByRole('button', { name: 'Wyślij zgłoszenie' })
    await send.click()
    await expect(form.getByRole('alert')).toContainText('Podaj imię')
    await form.getByLabel('Imię').fill(name)
    await send.click()
    await expect(form.getByRole('alert')).toContainText('numer telefonu')
    await form.getByLabel('Telefon').fill('600 100 200')
    await form.getByLabel('Miejscowość').fill('Zakopane')
    await send.click()
    await expect(form.getByRole('alert')).toContainText('Zaznacz zgodę')
    await form.locator('label.consent input').check()

    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await send.click()
    const done = page.locator('#zglos')
    await expect(done.getByText('Dziękujemy, zgłoszenie przyjęte')).toBeFocused()
    await expect(done.getByTestId('inquiry-number')).toHaveText(/PKI-\d{4}-\d{4,}/)
    await expect(done.locator('.zsl')).toContainText('Słaba bateria')

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
        category: 'Instalacje — serwis',
        city: 'Zakopane',
        deadline: 'Pilne: obiekt bez zabezpieczenia',
        topics: ['kd'],
        phone: '600 100 200',
      })
      expect(String(record?.message)).toContain('Instalacja: Inna firma')
      await expect
        .poll(() => mailCount(request, `"${name}"`), { timeout: 15_000 })
        .toBeGreaterThan(0)
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })

  test('shows the care plans without prices and the services we look after', async ({ page }) => {
    await open(page)
    await expect(page.locator('#plany .plan')).toHaveCount(3)
    await expect(page.locator('#plany')).not.toContainText('zł')
    await expect(page.locator('#powiazane .relc')).toHaveCount(4)
    // The plan cards' rules never reach the footer's „Zaplanuj” card (`.ftci.plan`).
    await expect(page.locator('#stopka .ftci.plan')).toHaveCSS('flex-direction', 'row')
  })

  test('has no accessibility violations in the fault form', async ({ page }) => {
    await open(page)
    const { violations } = await new AxeBuilder({ page })
      .include('#zglos')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violations.map((v) => v.id)).toEqual([])
  })
})

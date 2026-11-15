import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { hydrated, site } from './helpers'

// pro-kom.eu forms (H6-1, spec §7, ADR-003): the shared ContactForm on the hub pages, saved for
// the `prokom` tenant; the request list of „Inwestycje i dostawy” joins the message and the office
// mail (Mailpit). Needs `pnpm seed` and Mailpit.
const HUB = 'prokom.localhost'
const MAILPIT = 'http://localhost:8025/api/v1'

// Own client address per test: the per-IP limit must not leak between runs.
async function asNewVisitor(page: Page) {
  const ip = `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250)).join('.')}`
  await page.setExtraHTTPHeaders({ 'X-Real-IP': ip })
}

async function officeMail(request: APIRequestContext, marker: string): Promise<string> {
  let text = ''
  await expect
    .poll(async () => {
      const search = await request.get(`${MAILPIT}/search`, { params: { query: marker } })
      const { messages } = (await search.json()) as { messages: { ID: string; Subject: string }[] }
      const office = messages.find((message) => message.Subject.startsWith('[PRO-KOM]'))
      if (!office) return ''
      const message = await request.get(`${MAILPIT}/message/${office.ID}`)
      text = ((await message.json()) as { Text: string }).Text
      return text
    })
    .toContain(marker)
  return text
}

test.describe('pro-kom.eu — forms (spec §7)', () => {
  test('the delivery inquiry carries the request list to the office', async ({ page, request }) => {
    const marker = `E2E Dostawy ${Date.now()}`
    await asNewVisitor(page)
    await page.goto(site(HUB, '/inwestycje-i-dostawy'))
    const plus = page.locator('#lista .pk-qty__ctl button', { hasText: /^\+10$/ })
    await hydrated(plus.first())
    await plus.first().click()

    const form = page.locator('#formularz form')
    await form.getByLabel(/^Imię/).fill(marker)
    await form.getByLabel(/^Telefon/).fill('600 100 200')
    await form.getByLabel(/^Wiadomość/).fill('Wyposażenie biura na nowy rok.')
    await form.getByLabel(/Wyrażam zgodę/).check()
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await form.getByRole('button', { name: 'Wyślij zapytanie' }).click()
    await expect(page.locator('#formularz [role="status"]')).toContainText(/PK-\d{4}-\d+/)

    const mail = await officeMail(request, marker)
    expect(mail).toContain('10 szt.')
    // A sent inquiry empties the list.
    await expect(page.locator('#lista .pk-dsum__totals')).toContainText('0 szt.')
  })

  test('the contact page picks the topic from the home page chip', async ({ page }) => {
    await page.goto(site(HUB, `/kontakt?temat=${encodeURIComponent('Instalacje')}#formularz`))
    await expect(page.getByRole('button', { name: 'Instalacje', pressed: true })).toBeVisible()
  })
})

import AxeBuilder from '@axe-core/playwright'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from './helpers'

// B8a: the one-screen contact form of the Biznes line (ZMIANY-v20 §2.9) on the home page
// `#kontakt` and under the catalog: sent → panel → Mailpit; required fields with readable,
// accessible errors, also at 390 px. Records made here are deleted at the end.

const MAILPIT = 'http://localhost:8025/api/v1'

// Own client address per test: the per-IP limit (5 / 10 min) must not leak between runs.
async function asNewVisitor(page: Page) {
  const ip = `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250)).join('.')}`
  await page.setExtraHTTPHeaders({ 'X-Real-IP': ip })
}

// The server refuses forms sent faster than a person can type (spam protection).
const waitMinimumFillTime = (page: Page) => page.waitForTimeout(FORM_MIN_FILL_MS + 500)

async function subjects(request: APIRequestContext, query: string): Promise<string[]> {
  const response = await request.get(`${MAILPIT}/search`, { params: { query } })
  return ((await response.json()) as { messages: { Subject: string }[] }).messages.map(
    (message) => message.Subject,
  )
}

test.describe('Biznes contact form v20 (B8a)', () => {
  test('a visitor sends it from the home page; the inquiry gets a number', async ({
    page,
    request,
  }) => {
    const marker = `E2E Kontakt ${Date.now()}`
    await asNewVisitor(page)
    await page.goto(site('biznes.localhost', '/#kontakt'))

    const contact = page.locator('#kontakt')
    // One screen, no topics and no steps.
    await expect(contact.getByRole('checkbox')).toHaveCount(1)
    await contact.getByLabel(/^Imię/).fill(marker)
    await contact.getByLabel(/^Telefon/).fill('600 100 200')
    // K4-FINAL §5: the town instead of a separate company field; the message is optional.
    await contact.getByLabel(/^Miejscowość/).fill('Nowy Targ')
    await contact.getByLabel(/^Wiadomość/).fill('Otwieramy kawiarnię, potrzebujemy kasy.')
    await contact.getByLabel(/Wyrażam zgodę/).check()
    await waitMinimumFillTime(page)
    await contact.getByRole('button', { name: 'Wyślij zapytanie' }).click()

    const done = contact.getByRole('status')
    await expect(done).toContainText('Dziękujemy, zapytanie wysłane.')
    await expect(done).toBeFocused()
    // „Wyślij kolejne” brings back an empty form.
    await done.getByRole('button', { name: 'Wyślij kolejne' }).click()
    await expect(contact.getByLabel(/^Imię/)).toHaveValue('')
    await expect(contact.getByLabel(/^Imię/)).toBeFocused()

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[name][equals]=${encodeURIComponent(marker)}&depth=0`,
    )
    const [record] = json.docs as Record<string, unknown>[]
    expect(record, 'the inquiry is in the panel').toBeDefined()
    try {
      expect(record).toMatchObject({
        line: 'biznes',
        type: 'contact',
        phone: '600 100 200',
        city: 'Nowy Targ',
        source: { url: expect.stringMatching(/^http:\/\/biznes\.localhost(:\d+)?\/$/) },
      })
      // No e-mail given: only the office notification, with the number in the subject.
      await expect
        .poll(() => subjects(request, `"${marker}"`), { timeout: 15_000 })
        .toContain(`Zapytanie ${String(record?.number)} — Biznes`)
    } finally {
      expect((await api(page, 'DELETE', `/api/inquiries/${record?.id}`)).status).toBe(200)
    }
  })

  test('required fields and a bad e-mail are explained next to them, at 390 px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await asNewVisitor(page)
    await page.goto(site('biznes.localhost', '/#kontakt'))
    const contact = page.locator('#kontakt')
    await contact.getByRole('button', { name: 'Wyślij zapytanie' }).click()

    const name = contact.getByLabel(/^Imię/)
    await expect(name).toBeFocused()
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(name).toHaveAccessibleDescription(/Podaj imię/)
    await expect(contact.getByLabel(/^Telefon/)).toHaveAccessibleDescription(/telefon albo e-mail/)
    // „Wiadomość (opcjonalnie)”: not an error when empty.
    await expect(contact.getByLabel(/^Wiadomość/)).not.toHaveAttribute('aria-invalid', 'true')
    await expect(contact.getByLabel(/Wyrażam zgodę/)).toHaveAttribute('aria-invalid', 'true')
    // A phone or an e-mail (K4-FINAL §5): the missing contact is reported on the phone only.
    await expect(contact.getByLabel(/^lub e-mail/)).not.toHaveAttribute('aria-invalid', 'true')

    // One column on a phone: no horizontal scroll.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(overflow).toBe(false)

    const { violations } = await new AxeBuilder({ page })
      .include('#kontakt')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violations.map((v) => v.id)).toEqual([])

    // The format of a given e-mail is the server's verdict.
    await contact.getByLabel(/^Imię/).fill('Test E2E')
    await contact.getByLabel(/^Telefon/).fill('600 100 200')
    await contact.getByLabel(/^lub e-mail/).fill('jan@')
    await contact.getByLabel(/^Wiadomość/).fill('Test.')
    await contact.getByLabel(/Wyrażam zgodę/).check()
    await waitMinimumFillTime(page)
    await contact.getByRole('button', { name: 'Wyślij zapytanie' }).click()
    const email = contact.getByLabel(/^lub e-mail/)
    await expect(email).toBeFocused()
    await expect(email).toHaveAccessibleDescription(/adres e-mail/)
    await expect(contact.getByRole('status')).toHaveCount(0)
  })
})

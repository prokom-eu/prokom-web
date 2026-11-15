import AxeBuilder from '@axe-core/playwright'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, setTheme, site } from './helpers'

// D2-3a (plan `docs/zadania/wspolne-elementy.md` F3, spec §5 `ContactForm`, ADR-003): the shared
// contact form on the preview page — errors, success, the record in Inquiries with its tenant and
// subject, the e-mails in Mailpit. Needs `pnpm seed` and Mailpit; records made here are deleted.
const MAILPIT = 'http://localhost:8025/api/v1'

const form = (page: Page) => page.locator('[data-wspolne] [data-contact-form]')
const randomIp = () => `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250)).join('.')}`

async function mailSubjects(request: APIRequestContext, query: string): Promise<string[]> {
  const response = await request.get(`${MAILPIT}/search`, { params: { query } })
  const body = (await response.json()) as { messages: { Subject: string }[] }
  return body.messages.map((message) => message.Subject)
}

test.describe('/_wspolne — shared contact form', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    // Its own client address, so the per-IP limit of other tests does not leak in (ADR-003).
    await page.setExtraHTTPHeaders({ 'X-Real-IP': randomIp() })
  })

  test('empty: a list of errors on top with links, messages under the fields', async ({ page }) => {
    await page.goto(site('instalacje.localhost', '/_wspolne'))
    // The button text is the line's (Instalacje: „Zamów oddzwonienie”).
    await form(page).locator('button[type="submit"]').click()
    const summary = form(page).getByRole('alert')
    await expect(summary).toContainText('Podaj imię albo nazwę firmy.')
    // Instalacje call back: a phone, always (ADR-I002 §4).
    await expect(summary).toContainText('Podaj numer telefonu')
    // Instalacje: name, phone, message and consent — the same rules as the server (`sharedRulesFor`).
    await expect(form(page).locator('[aria-invalid="true"]')).toHaveCount(4)
    await summary.getByRole('link', { name: /Imię i firma/ }).click()
    await expect(form(page).getByLabel('Imię i firma')).toBeFocused()
  })

  test('the town shows its zone; „?fraza=” starts the message', async ({ page }) => {
    await page.goto(site('instalacje.localhost', '/_wspolne?fraza=monitoring%20domu'))
    await expect(form(page).getByLabel('Wiadomość')).toHaveValue('monitoring domu')
    await form(page)
      .getByLabel(/Miejscowość/)
      .fill('Szaflary')
    await expect(form(page).getByText('Szaflary · strefa Podhale')).toBeVisible()
  })

  test('sent: number, next steps; the record has its tenant and subject; the e-mails go out', async ({
    page,
    request,
  }) => {
    const marker = `E2E Wspolny ${Date.now()}`
    const email = `wspolny-${Date.now()}@example.test`
    await page.goto(site('software.localhost', '/_wspolne'))
    const chip = form(page).locator('fieldset button').first()
    const topic = (await chip.innerText()).trim()
    await chip.click()
    await expect(chip).toHaveAttribute('aria-pressed', 'true')
    await form(page).getByLabel('Imię i firma').fill(marker)
    await form(page).getByLabel('Telefon lub e-mail').fill(email)
    await form(page).getByLabel('Wiadomość').fill('Potrzebujemy systemu rezerwacji.')
    await form(page).getByRole('checkbox').check()
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await form(page).locator('button[type="submit"]').click()

    const done = page.locator('[data-wspolne] [data-success-panel]')
    await expect(done).toContainText('Numer zgłoszenia: PKS-')
    await expect(done).toContainText('Potwierdzenie wyślemy na podany adres.')
    await expect(done).toBeFocused()

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[name][equals]=${encodeURIComponent(marker)}&depth=0`,
    )
    const [record] = json.docs as Record<string, unknown>[]
    expect(record, 'the inquiry is in the panel').toBeDefined()
    try {
      expect(record).toMatchObject({ line: 'software', type: 'contact', category: topic, email })
      const { json: tenants } = await api(page, 'GET', '/api/tenants?where[slug][equals]=software')
      expect(record?.tenant).toBe((tenants.docs as { id: number }[])[0]?.id)
      await expect
        .poll(() => mailSubjects(request, String(record?.number)), { timeout: 15_000 })
        .toEqual(expect.arrayContaining([expect.stringContaining(String(record?.number))]))
    } finally {
      expect((await api(page, 'DELETE', `/api/inquiries/${record?.id}`)).status).toBe(200)
    }
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe on the form with its errors (${theme})`, async ({ page }) => {
      await setTheme(page, theme)
      await page.goto(site('software.localhost', '/_wspolne'))
      await form(page).locator('button[type="submit"]').click()
      await expect(form(page).getByRole('alert')).toBeVisible()
      const results = await new AxeBuilder({ page }).include('[data-contact-form]').analyze()
      expect(results.violations).toEqual([])
    })
  }
})

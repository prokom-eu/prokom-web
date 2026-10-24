import AxeBuilder from '@axe-core/playwright'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from './helpers'

// S8b acceptance: the form on a site page → record in the panel → e-mail in Mailpit, with
// readable errors. Seed: the `kontakt` page of every line but Biznes (its own form since B8c,
// `biznes-contact`) has the form block. Records made
// here are deleted at the end. axe and 360 px of `/kontakt` (with the form) are in a11y.e2e.

const MAILPIT = 'http://localhost:8025/api/v1'

// Own client address per test: the per-IP limit (5 / 10 min) must not leak between runs.
async function asNewVisitor(page: Page) {
  const ip = `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250)).join('.')}`
  await page.setExtraHTTPHeaders({ 'X-Real-IP': ip })
}

// The server refuses forms sent faster than a person can type (spam protection).
const waitMinimumFillTime = (page: Page) => page.waitForTimeout(FORM_MIN_FILL_MS + 500)

async function mailCount(request: APIRequestContext, query: string): Promise<number> {
  const response = await request.get(`${MAILPIT}/search`, { params: { query } })
  return ((await response.json()) as { messages: unknown[] }).messages.length
}

test.describe('inquiry form (S8b)', () => {
  test('a visitor sends the form and the inquiry reaches the panel and the inbox', async ({
    page,
    request,
  }) => {
    const marker = `E2E Formularz ${Date.now()}`
    await asNewVisitor(page)
    // B8c: Biznes has its own contact form; the generic one stays on the other lines.
    await page.goto(site('instalacje.localhost', '/kontakt?utm_source=e2e#formularz'))

    const form = page.locator('#formularz')
    await form.getByLabel('Imię i nazwisko').fill(marker)
    await form.getByLabel(/^E-mail/).fill('formularz-e2e@example.test')
    await form.getByLabel('NIP').fill('526-000-12-46')
    await form.getByLabel('W czym możemy pomóc?').fill('Test formularza.')
    await form.getByLabel(/Wyrażam zgodę/).check()
    await waitMinimumFillTime(page)
    await form.getByRole('button', { name: 'Wyślij zapytanie' }).click()

    const done = form.getByRole('status')
    await expect(done).toContainText('zapytanie zostało wysłane')
    await expect(done).toBeFocused()

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[name][equals]=${encodeURIComponent(marker)}&depth=0`,
    )
    const [record] = json.docs as Record<string, unknown>[]
    expect(record, 'the inquiry is in the panel').toBeDefined()
    expect(record).toMatchObject({
      line: 'instalacje',
      nip: '5260001246',
      marketingConsent: false,
      source: { url: site('instalacje.localhost', '/kontakt'), utmSource: 'e2e' },
    })
    try {
      await expect
        .poll(() => mailCount(request, 'to:formularz-e2e@example.test'), { timeout: 15_000 })
        .toBeGreaterThan(0)
      await expect
        .poll(() => mailCount(request, `"${marker}"`), { timeout: 15_000 })
        .toBeGreaterThan(0)
    } finally {
      expect((await api(page, 'DELETE', `/api/inquiries/${record?.id}`)).status).toBe(200)
    }
  })

  test('missing fields are explained next to them, accessibly', async ({ page }) => {
    await asNewVisitor(page)
    await page.goto(site('instalacje.localhost', '/kontakt'))
    const form = page.locator('#formularz')
    await form.getByRole('button', { name: 'Wyślij zapytanie' }).click()

    const name = form.getByLabel('Imię i nazwisko')
    await expect(name).toBeFocused()
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(name).toHaveAccessibleDescription(/Podaj imię i nazwisko/)
    await expect(form.getByLabel(/^E-mail/)).toHaveAccessibleDescription(/e-mail albo telefon/)
    await expect(form.getByLabel(/Wyrażam zgodę/)).toHaveAttribute('aria-invalid', 'true')
    await expect(form.getByText('Napisz, w czym możemy pomóc')).toBeVisible()

    const { violations } = await new AxeBuilder({ page })
      .include('#formularz')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violations.map((v) => v.id)).toEqual([])
  })

  test('the server’s verdict on a field shows next to it', async ({ page }) => {
    await asNewVisitor(page)
    await page.goto(site('software.localhost', '/kontakt'))
    const form = page.locator('#formularz')
    await form.getByLabel('Imię i nazwisko').fill('Test E2E')
    await form.getByLabel(/^Telefon/).fill('600 100 200')
    await form.getByLabel('NIP').fill('1234567890')
    await form.getByLabel('W czym możemy pomóc?').fill('Test formularza.')
    await form.getByLabel(/Wyrażam zgodę/).check()
    await waitMinimumFillTime(page)
    await form.getByRole('button', { name: 'Wyślij zapytanie' }).click()

    const nip = form.getByLabel('NIP')
    await expect(nip).toBeFocused()
    await expect(nip).toHaveAccessibleDescription(/Sprawdź NIP/)
    await expect(form.getByRole('status')).toHaveCount(0)
  })
})

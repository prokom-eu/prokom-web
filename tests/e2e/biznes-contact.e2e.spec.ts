import AxeBuilder from '@axe-core/playwright'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, setTheme, site } from './helpers'

// D3-B PR 2 (docs/zadania/prokombiznes-0611.md §8.2): `/kontakt` of Biznes on the shared Kontakt
// template — phone first, the salon card (Rabka only), „Z czym dzwonisz?” (4 matters, each picks
// the topic of the form), the form with the inquiry list attached. Needs `pnpm seed` and
// Mailpit; records made here are deleted.

const MAILPIT = 'http://localhost:8025/api/v1'
const CONTACT = '/kontakt'
const page_ = (page: Page) => page.locator('[data-contact-page]')
const form = (page: Page) => page.locator('[data-contact-form]')

async function mailSubjects(request: APIRequestContext, query: string): Promise<string[]> {
  const response = await request.get(`${MAILPIT}/search`, { params: { query } })
  return ((await response.json()) as { messages: { Subject: string }[] }).messages.map(
    (message) => message.Subject,
  )
}

// Own client address per test: the per-IP limit (5 / 10 min) must not leak between runs.
async function asNewVisitor(page: Page) {
  const ip = `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250)).join('.')}`
  await page.setExtraHTTPHeaders({ 'X-Real-IP': ip })
}

test.describe('Biznes /kontakt (shared template, §8.2)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('hero: one H1, the phone first, e-mail and second number; Rabka only', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', CONTACT))
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText(
      'Powiedz, czego potrzebuje firma. Resztę ustalimy na miejscu.',
    )
    const root = page_(page)
    await expect(root.locator('a[href^="tel:"]').first()).toContainText('889 003 889')
    await expect(root).toContainText('kontakt@prokombiznes.pl')
    await expect(root).toContainText('883 200 151')
    await expect(root).toContainText('Orkana 16B')
    // The salon card names no other salon (D18: bez Zakopanego).
    await expect(root.locator('address, [data-salon]').filter({ hasText: 'Zakopane' })).toHaveCount(
      0,
    )
  })

  test('„Z czym dzwonisz?”: 4 matters, each leads to the form with its topic picked', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', CONTACT))
    const routes = page_(page).locator('a[href*="temat="]')
    await expect(routes).toHaveCount(4)
    const href = (await routes.nth(1).getAttribute('href'))!
    expect(href).toMatch(/^\/kontakt\?temat=.+#formularz$/)
    await routes.nth(1).click()
    await expect(page).toHaveURL(/temat=.*#formularz$/)
    await expect(form(page).getByRole('button', { name: 'Awaria albo serwis' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('sent with the topic and the inquiry list: the record, the mail, the list emptied', async ({
    page,
    request,
  }) => {
    const marker = `E2E Kontakt Biznes ${Date.now()}`
    await asNewVisitor(page)
    await page.goto(site('biznes.localhost', '/'))
    await page.evaluate(() =>
      localStorage.setItem('pk-cart', JSON.stringify([{ id: 'posnet-ergo-online', q: 2 }])),
    )
    await page.goto(site('biznes.localhost', '/kontakt?temat=Awaria%20albo%20serwis#formularz'))
    await expect(page.locator('[data-cart-attachment]')).toContainText('Posnet Ergo Online × 2')
    const topic = form(page).getByRole('button', { name: 'Awaria albo serwis' })
    await expect(topic).toHaveAttribute('aria-pressed', 'true')

    await form(page).getByLabel('Imię i firma').fill(marker)
    await form(page).getByLabel('Telefon lub e-mail').fill('600 100 200')
    await form(page).getByRole('checkbox').check()
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await form(page).locator('button[type="submit"]').click()
    await expect(page.locator('[data-success-panel]')).toBeVisible()
    // Sent: the list is empty, as after the drawer's form.
    expect(await page.evaluate(() => localStorage.getItem('pk-cart'))).toBe('[]')

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
        category: 'Awaria albo serwis',
        phone: '600 100 200',
      })
      expect(String(record?.message)).toContain('Lista „Do zapytania” (1 pozycja):')
      expect(String(record?.message)).toContain('Posnet Ergo Online × 2')
      await expect
        .poll(() => mailSubjects(request, String(record?.number)), { timeout: 15_000 })
        .toEqual(expect.arrayContaining([expect.stringContaining(String(record?.number))]))
    } finally {
      expect((await api(page, 'DELETE', `/api/inquiries/${record?.id}`)).status).toBe(200)
    }
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe on the page (${theme})`, async ({ page }) => {
      await setTheme(page, theme)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(site('biznes.localhost', CONTACT))
      const results = await new AxeBuilder({ page }).include('[data-contact-page]').analyze()
      expect(results.violations).toEqual([])
    })
  }
})

for (const width of [360, 390]) {
  test(`/kontakt fits ${width} px without scrolling sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto(site('biznes.localhost', CONTACT))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

import AxeBuilder from '@axe-core/playwright'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from './helpers'

// B8b: the inquiry list `/zapytanie` (spec. §6.3, plansza Zapytanie, kryterium §9 pkt 3 i 5):
// items with quantities and notes → panel and Mailpit, number on the success screen, list
// cleared; validation at 390 px; an empty list and „Zapytaj o X”. Records are deleted at the end.

const MAILPIT = 'http://localhost:8025/api/v1'

type Product = { slug: string; name: string }

// Own client address per test: the per-IP limit (5 / 10 min) must not leak between runs.
async function asNewVisitor(page: Page) {
  const ip = `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250)).join('.')}`
  await page.setExtraHTTPHeaders({ 'X-Real-IP': ip })
}

// The server refuses forms sent faster than a person can type (spam protection).
const waitMinimumFillTime = (page: Page) => page.waitForTimeout(FORM_MIN_FILL_MS + 500)

/** Two products of the Biznes catalog on the list, as the cards would put them there. */
async function fillCart(page: Page): Promise<Product[]> {
  await page.goto(site('biznes.localhost', '/oferta'))
  return page.evaluate(async () => {
    const index = (await (await fetch('/api/catalog-index')).json()) as { products: Product[] }
    const products = index.products.slice(0, 2).map(({ slug, name }) => ({ slug, name }))
    localStorage.setItem(
      'pk-cart',
      JSON.stringify(products.map((product, i) => ({ id: product.slug, q: i === 0 ? 2 : 1 }))),
    )
    return products
  })
}

async function findInquiry(page: Page, name: string) {
  const { json } = await api(
    page,
    'GET',
    `/api/inquiries?where[name][equals]=${encodeURIComponent(name)}&depth=0`,
  )
  return (json.docs as Record<string, unknown>[])[0]
}

async function mailText(request: APIRequestContext, query: string): Promise<string> {
  const search = await request.get(`${MAILPIT}/search`, { params: { query } })
  const [message] = ((await search.json()) as { messages: { ID: string }[] }).messages
  if (!message) return ''
  const full = await request.get(`${MAILPIT}/message/${message.ID}`)
  return ((await full.json()) as { Text: string }).Text
}

const form = (page: Page) => page.getByRole('region', { name: 'Dane do kontaktu' })

test.describe('inquiry list /zapytanie (B8b)', () => {
  test('a visitor sends the list with a note; the office gets every item', async ({
    page,
    request,
  }) => {
    const marker = `E2E Lista ${Date.now()}`
    await asNewVisitor(page)
    const [first, second] = (await fillCart(page)) as [Product, Product]
    await page.goto(site('biznes.localhost', '/zapytanie'))

    const list = page.getByRole('region', { name: 'Pozycje na liście' })
    await expect(list.getByRole('link', { name: first.name })).toBeVisible()
    await expect(list.getByRole('link', { name: second.name })).toBeVisible()
    await list.getByRole('button', { name: '+ Dodaj uwagę do pozycji' }).first().click()
    await list.getByLabel(`Uwagi do: ${first.name}`).fill('Czarna, na otwarcie')

    const contact = form(page)
    await contact.getByLabel(/^Imię/).fill(marker)
    await contact.getByRole('textbox', { name: /^Telefon/ }).fill('600 100 200')
    await contact.getByLabel('Miejscowość').fill('Nowy Targ')
    // The chips are radios under their labels: a click on the label, as a person does.
    await contact.locator('label', { hasText: 'WhatsApp' }).click()
    await contact.locator('label', { hasText: 'Przed sezonem' }).click()
    await expect(contact.getByRole('radio', { name: 'WhatsApp' })).toBeChecked()
    await contact.getByLabel(/Wyrażam zgodę/).check()
    await waitMinimumFillTime(page)
    await contact.getByRole('button', { name: 'Wyślij zapytanie (2 pozycje)' }).click()

    const done = page.getByRole('status').filter({ hasText: 'Dziękujemy — mamy Twoją listę.' })
    await expect(done).toBeFocused()
    await expect(done).toContainText(/Zapytanie nr PKB-\d{4}-\d{4,}/)
    await expect(done).toContainText(`${first.name} ×2, ${second.name}`)
    // The list is cleared once it is sent.
    expect(await page.evaluate(() => localStorage.getItem('pk-cart'))).toBe('[]')
    await expect(
      page.getByRole('region', { name: 'Pozycje na liście' }).getByText('Lista jest pusta'),
    ).toBeVisible()

    await loginAsAdmin(page)
    const record = await findInquiry(page, marker)
    expect(record, 'the inquiry is in the panel').toBeDefined()
    try {
      expect(record).toMatchObject({
        type: 'list',
        phone: '600 100 200',
        city: 'Nowy Targ',
        preferredContact: 'whatsapp',
        deadline: 'Przed sezonem',
        items: [
          expect.objectContaining({
            nameSnapshot: first.name,
            quantity: 2,
            note: 'Czarna, na otwarcie',
          }),
          expect.objectContaining({ nameSnapshot: second.name, quantity: 1 }),
        ],
      })
      await expect
        .poll(() => mailText(request, `"${marker}"`), { timeout: 15_000 })
        .toContain(`- 2 × ${first.name} — uwaga: Czarna, na otwarcie`)
    } finally {
      expect((await api(page, 'DELETE', `/api/inquiries/${record?.id}`)).status).toBe(200)
    }
  })

  test('required fields are explained next to them, at 390 px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await asNewVisitor(page)
    const [first] = (await fillCart(page)) as [Product]
    await page.goto(site('biznes.localhost', '/zapytanie'))
    // The list comes from the browser after hydration: wait for it, then send.
    await expect(page.getByRole('link', { name: first.name })).toBeVisible()
    const contact = form(page)
    await contact.getByRole('button', { name: /^Wyślij zapytanie/ }).click()

    const name = contact.getByLabel(/^Imię/)
    await expect(name).toBeFocused()
    await expect(name).toHaveAccessibleDescription(/Podaj imię/)
    await expect(contact.getByRole('textbox', { name: /^Telefon/ })).toHaveAccessibleDescription(
      /telefon albo e-mail/,
    )
    await expect(contact.getByLabel(/Wyrażam zgodę/)).toHaveAttribute('aria-invalid', 'true')
    // With items on the list the notes are optional.
    await expect(contact.getByLabel('Wiadomość (opcjonalnie)')).not.toHaveAttribute(
      'aria-invalid',
      'true',
    )

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(overflow).toBe(false)
    const { violations } = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violations.map((v) => v.id)).toEqual([])
  })

  test('an empty list still takes a message', async ({ page }) => {
    await asNewVisitor(page)
    await page.goto(site('biznes.localhost', '/oferta'))
    await page.evaluate(() => localStorage.removeItem('pk-cart'))
    await page.goto(site('biznes.localhost', '/zapytanie'))
    await expect(
      page.getByRole('region', { name: 'Pozycje na liście' }).getByText('Lista jest pusta'),
    ).toBeVisible()

    const contact = form(page)
    await contact.getByLabel(/^Imię/).fill('Test E2E')
    await contact.getByRole('textbox', { name: /^Telefon/ }).fill('600 100 200')
    await contact.getByLabel(/Wyrażam zgodę/).check()
    await contact.getByRole('button', { name: 'Wyślij zapytanie' }).click()
    const message = contact.getByLabel(/^Czego potrzebujesz/)
    await expect(message).toBeFocused()
    await expect(message).toHaveAccessibleDescription(/lista zapytania jest pusta/)
  })

  test('„Zapytaj o X” sends the phrase with an empty list', async ({ page }) => {
    const marker = `E2E Fraza ${Date.now()}`
    await asNewVisitor(page)
    await page.goto(site('biznes.localhost', '/oferta'))
    await page.evaluate(() => localStorage.removeItem('pk-cart'))
    await page.goto(site('biznes.localhost', '/zapytanie?fraza=drukarka%20etykiet'))
    await expect(page.getByText('Szukałeś: „drukarka etykiet”')).toBeVisible()

    const contact = form(page)
    await contact.getByLabel(/^Imię/).fill(marker)
    await contact.getByRole('textbox', { name: /^Telefon/ }).fill('600 100 200')
    await contact.getByLabel(/Wyrażam zgodę/).check()
    await waitMinimumFillTime(page)
    await contact.getByRole('button', { name: 'Wyślij zapytanie' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Dziękujemy' })).toBeVisible()
    // Sent: the phrase leaves the address, so a refresh starts clean.
    await expect(page).toHaveURL(/\/zapytanie$/)

    await loginAsAdmin(page)
    const record = await findInquiry(page, marker)
    try {
      expect(record).toMatchObject({ type: 'search', topics: ['drukarka etykiet'] })
    } finally {
      expect((await api(page, 'DELETE', `/api/inquiries/${record?.id}`)).status).toBe(200)
    }
  })

  test('the drawer sends the list with an e-mail only (K4-FINAL §5)', async ({ page }) => {
    const marker = `E2E Szuflada ${Date.now()}`
    await asNewVisitor(page)
    const [first] = (await fillCart(page)) as [Product]
    await page.goto(site('biznes.localhost'))
    const drawer = page.getByRole('dialog', { name: /^Twoje zapytanie \(2\)$/ })
    await expect(async () => {
      await page
        .getByRole('banner')
        .getByRole('button', { name: /^Zapytanie/ })
        .click()
      await expect(drawer).toBeVisible({ timeout: 1000 })
    }).toPass()
    await expect(drawer.getByRole('link', { name: first.name })).toBeVisible()

    const contact = drawer.getByRole('region', { name: 'Dokąd wysłać ofertę?' })
    await contact.getByLabel(/^Imię lub firma/).fill(marker)
    await contact.getByLabel(/^lub e-mail/).fill('e2e-szuflada@example.test')
    await contact.getByLabel(/Wyrażam zgodę/).check()
    await expect(contact).toContainText('Oddzwaniamy w ciągu 60 minut w godzinach pracy.')
    await waitMinimumFillTime(page)
    await contact.getByRole('button', { name: 'Wyślij zapytanie (2 pozycje)' }).click()

    const done = drawer.getByRole('status').filter({ hasText: 'Dziękujemy, zapytanie wysłane' })
    await expect(done).toBeFocused()
    await expect(done).toContainText(/Zapytanie nr PKB-\d{4}-\d{4,}/)
    // No phone given: the answer comes by e-mail, not a call.
    await expect(done).toContainText('Odpowiemy e-mailem w godzinach pracy')
    expect(await page.evaluate(() => localStorage.getItem('pk-cart'))).toBe('[]')

    await loginAsAdmin(page)
    const record = await findInquiry(page, marker)
    expect(record, 'the inquiry is in the panel').toBeDefined()
    try {
      expect(record).toMatchObject({
        type: 'list',
        email: 'e2e-szuflada@example.test',
        preferredContact: 'email',
      })
      expect(record?.phone ?? null).toBeNull()
    } finally {
      expect((await api(page, 'DELETE', `/api/inquiries/${record?.id}`)).status).toBe(200)
    }
  })
})

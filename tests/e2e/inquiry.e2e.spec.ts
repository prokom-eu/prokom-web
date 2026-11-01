import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { CONSENT_CLAUSE } from '../../src/lib/inquiry/consent'
import { issueFormToken } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site, type ApiResult } from './helpers'

// S8a acceptance (ADR-003): POST /api/inquiry on a site domain → record in the panel →
// e-mails in Mailpit; spam rejected; no public read. Needs `pnpm seed` and Mailpit
// (docker/compose.dev.yml; in CI a service). Records made here are deleted at the end.

const MAILPIT = 'http://localhost:8025/api/v1'

function formToken(ageMs = 5_000): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET is not set.')
  return issueFormToken(secret, Date.now() - ageMs)
}

// Each test gets its own client address, so the per-IP limit of one test does not leak into
// another. The route trusts only `X-Real-IP`, which Nginx overwrites on the server.
const randomIp = () => `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250)).join('.')}`

function inquiry(marker: string, patch: Record<string, unknown> = {}) {
  return {
    name: 'Test E2E',
    email: `${marker.toLowerCase()}@example.test`,
    phone: '+48 600 100 200',
    message: `Wiadomość testowa ${marker}`,
    category: marker,
    source: { url: 'http://biznes.localhost:3000/kontakt?utm_source=e2e' },
    consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
    website: '',
    formToken: formToken(),
    ...patch,
  }
}

/** POST from a page of the site domain, like the form will (S8b). */
async function post(page: Page, body: unknown, ip: string): Promise<ApiResult> {
  return page.evaluate(
    async ({ body, ip }) => {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Real-IP': ip },
        body: JSON.stringify(body),
      })
      return { status: response.status, json: (await response.json()) as Record<string, unknown> }
    },
    { body, ip },
  )
}

type MailpitMessage = {
  ID: string
  Subject: string
  To: { Address: string }[]
  ReplyTo: { Address: string }[]
}

async function mails(request: APIRequestContext, query: string): Promise<MailpitMessage[]> {
  const response = await request.get(`${MAILPIT}/search`, { params: { query } })
  expect(response.ok()).toBe(true)
  return ((await response.json()) as { messages: MailpitMessage[] }).messages
}

async function findInquiries(page: Page, marker: string) {
  const { json } = await api(
    page,
    'GET',
    `/api/inquiries?where[category][equals]=${encodeURIComponent(marker)}&depth=0`,
  )
  return json.docs as Record<string, unknown>[]
}

test.describe('inquiry inbox (ADR-003)', () => {
  test('an inquiry is saved for its domain, e-mailed, and only its status can change', async ({
    page,
    request,
  }) => {
    const marker = `E2E-${Date.now()}`
    await page.goto(site('biznes.localhost', '/kontakt'))
    const sent = await post(page, inquiry(marker, { tenant: 3, line: 'software' }), randomIp())
    expect(sent).toEqual({
      status: 201,
      json: { ok: true, number: expect.stringMatching(/^PKB-\d{4}-\d{4,}$/) },
    })

    await loginAsAdmin(page)
    const [record] = await findInquiries(page, marker)
    expect(record).toMatchObject({ line: 'biznes', status: 'new', name: 'Test E2E' })
    const { json: tenants } = await api(page, 'GET', '/api/tenants?where[slug][equals]=biznes')
    expect(record?.tenant).toBe((tenants.docs as { id: number }[])[0]?.id)
    const id = record?.id as number
    // B1b: the server numbers every inquiry (PKB = Biznes) and the form sends the contact type.
    expect(record).toMatchObject({ type: 'contact' })
    expect(record?.number).toMatch(new RegExp(`^PKB-\\d{4}-${String(id).padStart(4, '0')}$`))
    // B8: the customer gets the same number on the success screen.
    expect(sent.json.number).toBe(record?.number)

    try {
      // Notification to the line inbox (seed:biznes: kontakt@prokombiznes.pl, Mailpit locally and in CI), customer as Reply-To.
      await expect
        .poll(async () => mails(request, marker), { timeout: 15_000 })
        .toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              Subject: `Zapytanie ${String(record?.number)} — Biznes — ${marker}`,
              To: [expect.objectContaining({ Address: 'kontakt@prokombiznes.pl' })],
              ReplyTo: [
                expect.objectContaining({ Address: `${marker.toLowerCase()}@example.test` }),
              ],
            }),
          ]),
        )
      // Confirmation to the customer.
      await expect
        .poll(
          async () => (await mails(request, `to:${marker.toLowerCase()}@example.test`)).length,
          {
            timeout: 15_000,
          },
        )
        .toBe(1)

      // What the customer sent stays as sent, even for an admin; the status changes.
      const before = record?.statusChangedAt
      const otherTenant = (
        await api(page, 'GET', '/api/tenants?where[slug][equals]=software&depth=0')
      ).json.docs as { id: number }[]
      const edited = await api(page, 'PATCH', `/api/inquiries/${id}`, {
        message: 'zmienione',
        tenant: otherTenant[0]?.id,
        status: 'in_progress',
      })
      expect(edited.status).toBe(200)
      const { json: after } = await api(page, 'GET', `/api/inquiries/${id}?depth=0`)
      expect(after.message).toBe(`Wiadomość testowa ${marker}`)
      expect(after.tenant).toBe(record?.tenant)
      expect(after.status).toBe('in_progress')
      expect(after.statusChangedAt).not.toBe(before)

      // Nobody creates inquiries through the Payload API, not even an admin.
      const created = await api(page, 'POST', '/api/inquiries', { name: 'x', message: 'x' })
      expect(created.status).toBe(403)
    } finally {
      const removed = await api(page, 'DELETE', `/api/inquiries/${id}`)
      expect(removed.status).toBe(200)
    }

    // The deletion leaves a trail without the content.
    const { json: trail } = await api(
      page,
      'GET',
      `/api/inquiry-deletions?where[inquiryId][equals]=${id}&depth=0`,
    )
    expect(trail.docs).toEqual([
      expect.objectContaining({
        inquiryId: id,
        reason: 'request',
        deletedByEmail: process.env.SEED_ADMIN_EMAIL,
      }),
    ])
  })

  test('an inquiry list keeps only products of its site and e-mails the full list (B8)', async ({
    page,
    request,
  }) => {
    const marker = `E2E-LIST-${Date.now()}`
    await page.goto(site('biznes.localhost', '/oferta'))
    const products = await page.evaluate(async () => {
      const response = await fetch('/api/catalog-index')
      const index = (await response.json()) as { products: { slug: string; name: string }[] }
      return index.products.slice(0, 2)
    })
    expect(products).toHaveLength(2)
    const [first, second] = products as [
      { slug: string; name: string },
      { slug: string; name: string },
    ]

    const sent = await post(
      page,
      inquiry(marker, {
        type: 'list',
        message: '',
        city: 'Nowy Targ',
        deadline: 'Przed sezonem',
        preferredContact: 'whatsapp',
        items: [
          { slug: first.slug, quantity: 2, note: `Uwaga ${marker}` },
          // Not a product of this site: dropped, never saved under a made-up name.
          { slug: 'produkt-innej-strony', quantity: 1 },
          { slug: second.slug, quantity: 1 },
        ],
      }),
      randomIp(),
    )
    expect(sent.status).toBe(201)

    await loginAsAdmin(page)
    const [record] = await findInquiries(page, marker)
    const id = record?.id as number
    try {
      expect(record).toMatchObject({
        type: 'list',
        city: 'Nowy Targ',
        deadline: 'Przed sezonem',
        preferredContact: 'whatsapp',
        items: [
          expect.objectContaining({
            nameSnapshot: first.name,
            quantity: 2,
            note: `Uwaga ${marker}`,
          }),
          expect.objectContaining({ nameSnapshot: second.name, quantity: 1 }),
        ],
      })
      expect(record?.items).toHaveLength(2)

      const subject = `Zapytanie ${String(record?.number)} — Biznes — Lista zapytania — ${marker}`
      await expect
        .poll(async () => (await mails(request, marker)).map((mail) => mail.Subject), {
          timeout: 15_000,
        })
        .toContain(subject)
      const [notification] = (await mails(request, marker)).filter((m) => m.Subject === subject)
      const message = await request.get(`${MAILPIT}/message/${notification?.ID}`)
      const text = ((await message.json()) as { Text: string }).Text
      expect(text).toContain(`- 2 × ${first.name} — uwaga: Uwaga ${marker}`)
      expect(text).toContain(`- 1 × ${second.name}`)
      expect(text).not.toContain('produkt-innej-strony')
    } finally {
      expect((await api(page, 'DELETE', `/api/inquiries/${id}`)).status).toBe(200)
    }
  })

  test('a list with products of another site only is rejected (B8)', async ({ page }) => {
    const marker = `E2E-FOREIGN-${Date.now()}`
    // The slug comes from the Biznes catalog; on Software it is nobody's product.
    await page.goto(site('biznes.localhost', '/oferta'))
    const slug = await page.evaluate(async () => {
      const index = (await (await fetch('/api/catalog-index')).json()) as {
        products: { slug: string }[]
      }
      return index.products[0]?.slug
    })
    await page.goto(site('software.localhost'))
    const foreign = inquiry(marker, { type: 'list', items: [{ slug, quantity: 1 }] })
    expect(await post(page, foreign, randomIp())).toEqual({
      status: 400,
      json: { error: 'invalid', fields: ['items'] },
    })
  })

  test('Software saves „Twój projekt” as its solutions and an audit with its site (SW2b)', async ({
    page,
  }) => {
    const marker = `E2E-SW-${Date.now()}`
    await page.goto(site('software.localhost'))
    const project = await post(
      page,
      inquiry(`${marker}-P`, {
        type: 'list',
        message: '',
        preferredContact: 'meeting',
        topics: ['strona'],
        items: [
          { slug: 'strona-firmowa-z-panelem', quantity: 1 },
          // A Biznes product slug: nobody's solution here, dropped.
          { slug: 'posnet-ergo-online', quantity: 1 },
        ],
      }),
      randomIp(),
    )
    expect(project.status).toBe(201)
    const audit = await post(
      page,
      inquiry(`${marker}-A`, { type: 'audit', message: '', auditUrl: 'https://firma.example' }),
      randomIp(),
    )
    expect(audit.status).toBe(201)

    await loginAsAdmin(page)
    const [saved] = await findInquiries(page, `${marker}-P`)
    const [auditRecord] = await findInquiries(page, `${marker}-A`)
    try {
      expect(saved).toMatchObject({
        line: 'software',
        type: 'list',
        preferredContact: 'meeting',
        topics: ['strona'],
        items: [
          expect.objectContaining({
            nameSnapshot: 'Strona firmowa z panelem',
            quantity: 1,
            solution: expect.any(Number),
            product: null,
          }),
        ],
      })
      expect(saved?.items).toHaveLength(1)
      expect(auditRecord).toMatchObject({
        type: 'audit',
        auditUrl: 'https://firma.example',
        message: 'Prośba o audyt strony: https://firma.example',
      })
    } finally {
      for (const record of [saved, auditRecord]) {
        if (record) await api(page, 'DELETE', `/api/inquiries/${record.id as number}`)
      }
    }
  })

  test('spam is rejected and nothing is saved', async ({ page }) => {
    const marker = `E2E-SPAM-${Date.now()}`
    await page.goto(site('biznes.localhost'))

    const honeypot = await post(
      page,
      inquiry(marker, { website: 'https://spam.example' }),
      randomIp(),
    )
    expect(honeypot).toEqual({ status: 400, json: { error: 'rejected' } })
    const tooFast = await post(page, inquiry(marker, { formToken: formToken(0) }), randomIp())
    expect(tooFast).toEqual({ status: 400, json: { error: 'rejected' } })
    const forged = await post(
      page,
      inquiry(marker, { formToken: `${Date.now() - 5000}.x` }),
      randomIp(),
    )
    expect(forged.status).toBe(400)

    await loginAsAdmin(page)
    expect(await findInquiries(page, marker)).toEqual([])
  })

  test('one address may send 5 inquiries per 10 minutes', async ({ page }) => {
    const marker = `E2E-LIMIT-${Date.now()}`
    await page.goto(site('biznes.localhost'))
    const ip = randomIp()

    // A person correcting the form does not use up the limit.
    for (let i = 0; i < 3; i++) {
      const invalid = await post(page, inquiry(marker, { name: '' }), ip)
      expect(invalid).toEqual({ status: 400, json: { error: 'invalid', fields: ['name'] } })
    }
    try {
      for (let i = 0; i < 5; i++) {
        expect((await post(page, inquiry(marker), ip)).status).toBe(201)
      }
      expect(await post(page, inquiry(marker), ip)).toEqual({
        status: 429,
        json: { error: 'rate_limited' },
      })
    } finally {
      await loginAsAdmin(page)
      const removed = await api(
        page,
        'DELETE',
        `/api/inquiries?where[category][equals]=${encodeURIComponent(marker)}`,
      )
      expect(removed.status).toBe(200)
    }
    expect(await findInquiries(page, marker)).toEqual([])
  })

  test('inquiries cannot be read publicly', async ({ page, browser }) => {
    // Through the browser (Node.js may not resolve *.localhost, see helpers).
    for (const path of ['/api/inquiries', '/api/inquiry-deletions', '/api/inquiry']) {
      const response = await page.goto(site('biznes.localhost', path))
      expect(response?.status()).toBe(404)
    }

    // The panel API without a session: no records.
    const anonymous = await browser.newPage()
    await anonymous.goto('/admin/login')
    for (const path of ['/api/inquiries', '/api/inquiry-deletions']) {
      const { status } = await api(anonymous, 'GET', path)
      expect(status).toBe(403)
    }
    // The endpoint belongs to site domains only: the panel host has no tenant.
    const onPanel = await post(anonymous, inquiry(`E2E-PANEL-${Date.now()}`), randomIp())
    expect(onPanel.status).toBe(404)
    await anonymous.close()
  })
})

import { describe, expect, it, vi } from 'vitest'

import { CONSENT_CLAUSE } from './consent'
import { createRateLimiter, FORM_MIN_FILL_MS, issueFormToken } from './spam'
import { submitInquiryWith, type SubmitDeps } from './submit'

const secret = 's'.repeat(32)
const now = Date.UTC(2026, 9, 17, 12)

const body = {
  name: 'Jan Kowalski',
  email: 'jan@example.test',
  phone: '600 100 200',
  message: 'Proszę o ofertę.',
  category: 'Kasy fiskalne',
  source: { url: 'https://prokombiznes.pl/kasy' },
  consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
  website: '',
  formToken: issueFormToken(secret, now - FORM_MIN_FILL_MS),
}

function deps(overrides: Partial<SubmitDeps> = {}): SubmitDeps {
  return {
    secret,
    now: () => now,
    limiter: createRateLimiter({ limit: 5, windowMs: 600_000, now: () => now }),
    findTenant: vi.fn(async (host: string) =>
      host === 'biznes.localhost'
        ? { id: 1, name: 'PRO-KOM Biznes', line: 'biznes' as const, notificationEmail: 'b@p.pl' }
        : null,
    ),
    save: vi.fn(async () => ({ id: 42, number: 'PKB-2026-0042' })),
    // Products of tenant 1 only — any other slug belongs to another site or does not exist.
    findProducts: vi.fn(async (tenantId: number, slugs: string[]) =>
      tenantId === 1
        ? [
            { id: 7, slug: 'posnet-ergo-online', name: 'Posnet Ergo Online' },
            { id: 8, slug: 'szuflada-posnet-skl', name: 'Szuflada Posnet SKL' },
          ].filter((product) => slugs.includes(product.slug))
        : [],
    ),
    sendEmail: vi.fn(async () => undefined),
    panelUrl: (id: number) => `http://panel.localhost:3000/admin/collections/inquiries/${id}`,
    log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    ...overrides,
  }
}

const request = { host: 'Biznes.localhost:3000', ip: '203.0.113.7' }

describe('submitInquiry (ADR-003)', () => {
  it('saves the inquiry with the tenant and line of the host, then sends both e-mails', async () => {
    const d = deps()
    expect(await submitInquiryWith(d, { ...request, body })).toEqual({
      ok: true,
      id: 42,
      number: 'PKB-2026-0042',
    })
    expect(d.save).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: 1,
        line: 'biznes',
        name: 'Jan Kowalski',
        status: 'new',
        consent: {
          accepted: true,
          clauseVersion: CONSENT_CLAUSE.version,
          acceptedAt: new Date(now).toISOString(),
        },
      }),
    )
    expect(d.sendEmail).toHaveBeenCalledTimes(2)
    expect(d.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'b@p.pl', replyTo: 'jan@example.test' }),
    )
    expect(d.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'jan@example.test' }))
  })

  it('never takes the tenant or line from the body', async () => {
    const d = deps()
    await submitInquiryWith(d, { ...request, body: { ...body, tenant: 3, line: 'software' } })
    expect(d.save).toHaveBeenCalledWith(expect.objectContaining({ tenant: 1, line: 'biznes' }))
  })

  it('rejects an unknown host', async () => {
    const d = deps()
    expect(await submitInquiryWith(d, { ...request, host: 'evil.pl', body })).toEqual({
      ok: false,
      error: 'unknown_host',
    })
    expect(d.save).not.toHaveBeenCalled()
  })

  it.each([
    ['honeypot', { website: 'https://spam.example' }],
    ['too fast', { formToken: issueFormToken(secret, now - 500) }],
    ['forged token', { formToken: 'x' }],
    ['missing token', { formToken: undefined }],
  ])('rejects spam (%s) without saving', async (_, patch) => {
    const d = deps()
    expect(await submitInquiryWith(d, { ...request, body: { ...body, ...patch } })).toEqual({
      ok: false,
      error: 'spam',
    })
    expect(d.save).not.toHaveBeenCalled()
  })

  it('rate-limits one IP', async () => {
    const d = deps({ limiter: createRateLimiter({ limit: 2, windowMs: 600_000, now: () => now }) })
    await submitInquiryWith(d, { ...request, body })
    await submitInquiryWith(d, { ...request, body })
    expect(await submitInquiryWith(d, { ...request, body })).toEqual({
      ok: false,
      error: 'rate_limited',
    })
    expect(await submitInquiryWith(d, { ...request, ip: '203.0.113.8', body })).toMatchObject({
      ok: true,
    })
  })

  it('does not count invalid attempts against the limit (a person fixing the form)', async () => {
    const d = deps({ limiter: createRateLimiter({ limit: 1, windowMs: 600_000, now: () => now }) })
    for (let i = 0; i < 3; i++) {
      expect(await submitInquiryWith(d, { ...request, body: { ...body, name: '' } })).toMatchObject(
        { error: 'invalid' },
      )
    }
    expect(await submitInquiryWith(d, { ...request, body })).toMatchObject({ ok: true })
  })

  it('answers "unavailable" when the database fails, and logs no personal data', async () => {
    // Drizzle puts the query parameters (the form data) into the error message.
    const failure = new Error('Failed query: insert ...\nparams: Jan Kowalski,jan@example.test')
    const d = deps({ save: vi.fn(async () => Promise.reject(failure)) })
    expect(await submitInquiryWith(d, { ...request, body })).toEqual({
      ok: false,
      error: 'unavailable',
    })
    const logged = JSON.stringify(vi.mocked(d.log.error).mock.calls)
    expect(logged).toContain('Error')
    for (const personal of ['Jan', 'jan@example.test']) {
      expect(logged).not.toContain(personal)
    }
    expect(d.sendEmail).not.toHaveBeenCalled()
  })

  it('answers "unavailable" when the tenant lookup fails', async () => {
    const d = deps({ findTenant: vi.fn(async () => Promise.reject(new Error('db down'))) })
    expect(await submitInquiryWith(d, { ...request, body })).toEqual({
      ok: false,
      error: 'unavailable',
    })
  })

  it('returns the invalid fields', async () => {
    const d = deps()
    expect(
      await submitInquiryWith(d, { ...request, body: { ...body, email: 'x', name: '' } }),
    ).toEqual({ ok: false, error: 'invalid', fields: ['name', 'email'] })
    expect(d.save).not.toHaveBeenCalled()
  })

  it('rejects a body that is not an object', async () => {
    expect(await submitInquiryWith(deps(), { ...request, body: 'x' })).toMatchObject({
      ok: false,
      error: 'invalid',
    })
  })

  it('keeps the saved inquiry when an e-mail fails, and logs no personal data', async () => {
    const d = deps({ sendEmail: vi.fn(async () => Promise.reject(new Error('SMTP down'))) })
    expect(await submitInquiryWith(d, { ...request, body })).toEqual({
      ok: true,
      id: 42,
      number: 'PKB-2026-0042',
    })
    expect(d.log.error).toHaveBeenCalled()
    const logged = JSON.stringify(vi.mocked(d.log.error).mock.calls)
    for (const personal of ['Jan', 'jan@example.test', 'Proszę']) {
      expect(logged).not.toContain(personal)
    }
  })

  it('saves and warns when the tenant has no notification e-mail', async () => {
    const d = deps({
      findTenant: vi.fn(async () => ({
        id: 1,
        name: 'PRO-KOM Biznes',
        line: 'biznes' as const,
        notificationEmail: null,
      })),
    })
    expect(await submitInquiryWith(d, { ...request, body })).toEqual({
      ok: true,
      id: 42,
      number: 'PKB-2026-0042',
    })
    expect(d.log.warn).toHaveBeenCalled()
    expect(d.sendEmail).toHaveBeenCalledTimes(1) // confirmation only
  })

  it('saves a contact inquiry without looking up products', async () => {
    const d = deps()
    await submitInquiryWith(d, { ...request, body })
    expect(d.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'contact', items: [] }))
    expect(d.findProducts).not.toHaveBeenCalled()
  })

  describe('inquiry list (B8)', () => {
    const list = {
      ...body,
      type: 'list',
      message: '',
      city: 'Nowy Targ',
      deadline: 'Przed sezonem',
      preferredContact: 'whatsapp',
      items: [
        { slug: 'posnet-ergo-online', quantity: 2, note: 'Czarna' },
        { slug: 'szuflada-posnet-skl', quantity: 1 },
      ],
    }

    it('saves the items of this tenant with the product name from the database', async () => {
      const d = deps()
      expect(
        await submitInquiryWith(d, {
          ...request,
          body: {
            ...list,
            items: [{ slug: 'posnet-ergo-online', quantity: 2, note: 'Czarna' }],
          },
        }),
      ).toEqual({ ok: true, id: 42, number: 'PKB-2026-0042' })
      expect(d.findProducts).toHaveBeenCalledWith(1, ['posnet-ergo-online'])
      expect(d.save).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'list',
          city: 'Nowy Targ',
          deadline: 'Przed sezonem',
          preferredContact: 'whatsapp',
          items: [{ product: 7, nameSnapshot: 'Posnet Ergo Online', quantity: 2, note: 'Czarna' }],
        }),
      )
    })

    it('puts the full list into the office e-mail', async () => {
      const d = deps()
      await submitInquiryWith(d, { ...request, body: list })
      expect(d.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'b@p.pl',
          subject: 'Zapytanie PKB-2026-0042 — Biznes — Lista zapytania — Kasy fiskalne',
          text: expect.stringContaining('- 1 × Szuflada Posnet SKL'),
        }),
      )
    })

    it('skips items that are not products of this site', async () => {
      const d = deps()
      await submitInquiryWith(d, {
        ...request,
        body: {
          ...list,
          items: [
            { slug: 'produkt-innej-strony', quantity: 1 },
            { slug: 'szuflada-posnet-skl', quantity: 3 },
          ],
        },
      })
      expect(d.save).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [{ product: 8, nameSnapshot: 'Szuflada Posnet SKL', quantity: 3 }],
        }),
      )
    })

    it('rejects a list with no item of this site, without saving or using the limit', async () => {
      const d = deps({
        limiter: createRateLimiter({ limit: 1, windowMs: 600_000, now: () => now }),
      })
      const foreign = { ...list, items: [{ slug: 'produkt-innej-strony', quantity: 1 }] }
      expect(await submitInquiryWith(d, { ...request, body: foreign })).toEqual({
        ok: false,
        error: 'invalid',
        fields: ['items'],
      })
      expect(d.save).not.toHaveBeenCalled()
      expect(await submitInquiryWith(d, { ...request, body: list })).toMatchObject({ ok: true })
    })

    it('answers "unavailable" when the product lookup fails', async () => {
      const d = deps({ findProducts: vi.fn(async () => Promise.reject(new Error('db down'))) })
      expect(await submitInquiryWith(d, { ...request, body: list })).toEqual({
        ok: false,
        error: 'unavailable',
      })
      expect(d.save).not.toHaveBeenCalled()
    })
  })

  it('saves the phrase of „Zapytaj o X” as a topic', async () => {
    const d = deps()
    await submitInquiryWith(d, {
      ...request,
      body: { ...body, type: 'search', topics: ['drukarka etykiet'] },
    })
    expect(d.save).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'search', topics: ['drukarka etykiet'] }),
    )
  })

  it('requires the phone on the Biznes contact form, not on other lines', async () => {
    const noPhone = { ...body, phone: '' }
    expect(await submitInquiryWith(deps(), { ...request, body: noPhone })).toEqual({
      ok: false,
      error: 'invalid',
      fields: ['phone'],
    })
    const software = deps({
      findTenant: vi.fn(async () => ({
        id: 2,
        name: 'PRO-KOM Software',
        line: 'software' as const,
        notificationEmail: 's@p.pl',
      })),
    })
    expect(await submitInquiryWith(software, { ...request, body: noPhone })).toMatchObject({
      ok: true,
    })
  })
})

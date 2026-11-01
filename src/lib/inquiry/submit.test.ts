import { describe, expect, it, vi } from 'vitest'

import konfigurator from '../../../seed/prokombiznes/k4/konfigurator-k4.json'
import softwareKreator from '../../../seed/prokomsoftware/kreator.json'
import { wizardSeed } from '../../seed/software/wizardExtras'
import { k4Wizard, type K4WizardFile } from '../../seed/biznes/k4Wizard'
import { wizardSchema } from '../catalog/wizard'
import { softwareWizardSchema } from '../software/wizard'
import { CONSENT_CLAUSE } from './consent'
import { createRateLimiter, FORM_MIN_FILL_MS, issueFormToken } from './spam'
import { siteUrl, submitInquiryWith, type SubmitDeps } from './submit'

// Konfigurator rules of tenant 1 (K4g): the package with product keys kept as slugs.
const rules = wizardSchema.parse(
  k4Wizard(konfigurator as unknown as K4WizardFile, (key) => key).wizard,
)

// Software wizard rules (tenant 2): the seed value.
const softwareRules = softwareWizardSchema.parse(wizardSeed(softwareKreator))

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
    // Solutions of tenant 2 (Software) only.
    findSolutions: vi.fn(async (tenantId: number, slugs: string[]) =>
      tenantId === 2
        ? [{ id: 11, slug: 'strona-firmowa-z-panelem', name: 'Strona firmowa z panelem' }].filter(
            (solution) => slugs.includes(solution.slug),
          )
        : [],
    ),
    findWizard: vi.fn(async (tenantId: number) => (tenantId === 1 ? rules : null)),
    findSoftwareWizard: vi.fn(async (tenantId: number) => (tenantId === 2 ? softwareRules : null)),
    sendEmail: vi.fn(async () => undefined),
    panelUrl: (id: number) => `http://panel.localhost:3000/admin/collections/inquiries/${id}`,
    siteOrigin: (host: string) => `http://${host.toLowerCase()}`,
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

  it('accepts a phone or an e-mail on the Biznes contact form (K4-FINAL §5)', async () => {
    const noPhone = { ...body, phone: '' }
    expect(await submitInquiryWith(deps(), { ...request, body: noPhone })).toMatchObject({
      ok: true,
    })
    const neither = { ...body, phone: '', email: '' }
    expect(await submitInquiryWith(deps(), { ...request, body: neither })).toEqual({
      ok: false,
      error: 'invalid',
      fields: ['phone'],
    })
  })

  describe('Konfigurator 3.0 (K4g)', () => {
    const wizardBody = {
      ...body,
      type: 'wizard',
      message: undefined,
      email: undefined,
      wizard: { kr: 'gastro|nowa|2||dowozy:1' },
      items: [
        { slug: 'posnet-ergo-online', quantity: 1, note: 'Konfigurator: Kasa fiskalna' },
        { slug: 'cudza-karta', quantity: 1 },
      ],
    }

    it('saves the chosen items of this tenant and the profile named from the rules', async () => {
      const d = deps()
      expect(await submitInquiryWith(d, { ...request, body: wizardBody })).toMatchObject({
        ok: true,
      })
      expect(d.save).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'wizard',
          items: [
            {
              product: 7,
              nameSnapshot: 'Posnet Ergo Online',
              quantity: 1,
              note: 'Konfigurator: Kasa fiskalna',
            },
          ],
          wizard: expect.objectContaining({
            'Rodzaj firmy': 'Gastronomia',
            Sytuacja: 'Otwieram firmę lub lokal',
            Skala: '2–3 stanowiska',
            // Clickable in the panel and the e-mail: the site's address from `Host`.
            Link: 'http://biznes.localhost:3000/konfigurator?kr=gastro%7Cnowa%7C2%7C%7Cdowozy%3A1',
          }),
        }),
      )
      const notification = vi.mocked(d.sendEmail).mock.calls[0]?.[0]
      expect(notification?.text).toContain('Gastronomia')
      expect(notification?.text).toContain('Posnet Ergo Online')
    })

    it('refuses a list whose every item is gone, like the list form', async () => {
      const d = deps()
      const result = await submitInquiryWith(d, {
        ...request,
        body: { ...wizardBody, items: [{ slug: 'cudza-karta', quantity: 1 }] },
      })
      expect(result).toEqual({ ok: false, error: 'invalid', fields: ['items'] })
      expect(d.save).not.toHaveBeenCalled()
    })

    it('accepts a profile without items — „Nie musisz nic wybierać”', async () => {
      const d = deps()
      const result = await submitInquiryWith(d, {
        ...request,
        body: { ...wizardBody, items: [] },
      })
      expect(result).toMatchObject({ ok: true })
      expect(d.save).toHaveBeenCalledWith(expect.objectContaining({ items: [] }))
    })

    it('rejects a link outside the rules, an old answers object or a site without rules', async () => {
      for (const [d, wizard] of [
        [deps(), { kr: 'kosmos|nowa|2||' }],
        [deps(), { kr: 'gastro|nowa|2||teleport:1' }],
        [deps(), { businessType: 'gastro' }],
        [deps({ findWizard: vi.fn(async () => null) }), { kr: 'gastro|nowa|2||' }],
      ] as const) {
        expect(await submitInquiryWith(d, { ...request, body: { ...wizardBody, wizard } })).toEqual(
          { ok: false, error: 'invalid', fields: ['wizard'] },
        )
        expect(d.save).not.toHaveBeenCalled()
      }
    })

    it('answers „unavailable” when the rules cannot be read', async () => {
      const d = deps({ findWizard: vi.fn(async () => Promise.reject(new Error('db down'))) })
      expect(await submitInquiryWith(d, { ...request, body: wizardBody })).toEqual({
        ok: false,
        error: 'unavailable',
      })
    })
  })

  describe('Software (SW2b)', () => {
    const software = (overrides: Partial<SubmitDeps> = {}) =>
      deps({
        findTenant: vi.fn(async () => ({
          id: 2,
          name: 'PRO-KOM Software',
          line: 'software' as const,
          notificationEmail: 's@p.pl',
        })),
        ...overrides,
      })
    const softwareRequest = { host: 'software.localhost:3000', ip: '203.0.113.9' }
    const project = {
      ...body,
      type: 'list',
      message: '',
      items: [
        { slug: 'strona-firmowa-z-panelem', quantity: 1 },
        { slug: 'posnet-ergo-online', quantity: 1 },
      ],
    }

    it('saves „Twój projekt” as solutions of this tenant, never as products', async () => {
      const d = software()
      expect((await submitInquiryWith(d, { ...softwareRequest, body: project })).ok).toBe(true)
      expect(d.findSolutions).toHaveBeenCalledWith(2, [
        'strona-firmowa-z-panelem',
        'posnet-ergo-online',
      ])
      expect(d.findProducts).not.toHaveBeenCalled()
      expect(d.save).toHaveBeenCalledWith(
        expect.objectContaining({
          line: 'software',
          items: [{ solution: 11, nameSnapshot: 'Strona firmowa z panelem', quantity: 1 }],
        }),
      )
    })

    it('writes the message of a project sent without a description: topic and names', async () => {
      const d = software({
        findSolutions: vi.fn(async () => [
          { id: 11, slug: 'strona-firmowa-z-panelem', name: 'Strona firmowa z panelem' },
          { id: 12, slug: 'opieka', name: 'Opieka nad stroną i systemem' },
        ]),
      })
      const sent = {
        ...project,
        topics: ['strona'],
        items: [
          { slug: 'strona-firmowa-z-panelem', quantity: 1 },
          { slug: 'opieka', quantity: 1 },
        ],
      }
      expect((await submitInquiryWith(d, { ...softwareRequest, body: sent })).ok).toBe(true)
      expect(d.save).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Twój projekt (Strona): Strona firmowa z panelem, Opieka nad stroną i systemem',
        }),
      )
    })

    it('keeps the description of a project as written', async () => {
      const d = software()
      const sent = { ...project, message: 'Mamy 3 ekipy.' }
      expect((await submitInquiryWith(d, { ...softwareRequest, body: sent })).ok).toBe(true)
      expect(d.save).toHaveBeenCalledWith(expect.objectContaining({ message: 'Mamy 3 ekipy.' }))
    })

    it('rejects a project with no solution of this site, without saving', async () => {
      const d = software()
      const result = await submitInquiryWith(d, {
        ...softwareRequest,
        body: { ...project, items: [{ slug: 'posnet-ergo-online', quantity: 1 }] },
      })
      expect(result).toEqual({ ok: false, error: 'invalid', fields: ['items'] })
      expect(d.save).not.toHaveBeenCalled()
    })

    it('saves an audit with the address and writes its message from it', async () => {
      const d = software()
      const audit = { ...body, type: 'audit', message: '', auditUrl: 'https://firma.pl' }
      expect((await submitInquiryWith(d, { ...softwareRequest, body: audit })).ok).toBe(true)
      expect(d.save).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'audit',
          auditUrl: 'https://firma.pl',
          message: 'Prośba o audyt strony: https://firma.pl',
        }),
      )
    })
  })

  describe('Software wizard (SW7, v22)', () => {
    const software = (overrides: Partial<SubmitDeps> = {}) =>
      deps({
        findTenant: vi.fn(async () => ({
          id: 2,
          name: 'PRO-KOM Software',
          line: 'software' as const,
          notificationEmail: 's@p.pl',
        })),
        // Published on tenant 2 (in this order — the inquiry keeps the wizard's order).
        findSolutions: vi.fn(async (tenantId: number, slugs: string[]) =>
          tenantId === 2
            ? [
                { id: 13, slug: 'opieka-nad-strona-i-systemem', name: 'Opieka nad stroną' },
                { id: 11, slug: 'strona-firmowa-z-panelem', name: 'Strona firmowa z panelem' },
                { id: 12, slug: 'przebudowa-starej-strony', name: 'Przebudowa starej strony' },
              ].filter((solution) => slugs.includes(solution.slug))
            : [],
        ),
        ...overrides,
      })
    const softwareRequest = { host: 'software.localhost:3000', ip: '203.0.113.9' }
    const answers = {
      need: 'firm',
      own: false,
      options: ['bud'],
      have: null,
      url: '',
      when: 'lato',
      description: 'Chcę więcej telefonów.',
      checklist: [],
      more: ['blog'],
      addOns: ['opieka', 'sms'],
      shop: false,
      contactPref: 'salon',
    }
    const wizardBody = {
      ...body,
      phone: undefined,
      type: 'wizard',
      message: undefined,
      wizard: answers,
    }

    it('saves the recommendation and the add-ons, the named answers and the message', async () => {
      const d = software()
      expect((await submitInquiryWith(d, { ...softwareRequest, body: wizardBody })).ok).toBe(true)
      expect(d.findWizard).not.toHaveBeenCalled()
      expect(d.findSolutions).toHaveBeenCalledWith(2, [
        'strona-firmowa-z-panelem',
        'opieka-nad-strona-i-systemem',
        'powiadomienia-sms-i-e-mail',
      ])
      expect(d.save).toHaveBeenCalledWith(
        expect.objectContaining({
          line: 'software',
          type: 'wizard',
          // The result first; the SMS add-on is not published on this site, so it is dropped.
          items: [
            { solution: 11, nameSnapshot: 'Strona firmowa z panelem', quantity: 1 },
            { solution: 13, nameSnapshot: 'Opieka nad stroną', quantity: 1 },
          ],
          preferredContact: 'meeting',
          deadline: 'Przed latem',
          message: expect.stringContaining('+ do wyceny: Aktualności i blog'),
          wizard: expect.objectContaining({
            Potrzeba: 'Strona dla firmy',
            Szczegóły: ['Budowlanka i remonty'],
            'Do wyceny': ['Aktualności i blog'],
            Dodatki: ['Opieka nad stroną', 'Powiadomienia SMS i e-mail'],
          }),
        }),
      )
      const saved = vi.mocked(d.save).mock.calls[0]?.[0]
      expect(saved?.message).toMatch(/^Kreator: Strona firmowa z panelem\n/)
    })

    it('keeps the current site of a refresh as the address to look at', async () => {
      const d = software()
      const refresh = {
        ...answers,
        need: 'odsw',
        options: ['wolna'],
        url: 'stara-firma.pl',
        more: [],
        addOns: [],
      }
      const result = await submitInquiryWith(d, {
        ...softwareRequest,
        body: { ...wizardBody, wizard: refresh },
      })
      expect(result.ok).toBe(true)
      expect(d.save).toHaveBeenCalledWith(
        expect.objectContaining({
          auditUrl: 'https://stara-firma.pl/',
          items: [{ solution: 12, nameSnapshot: 'Przebudowa starej strony', quantity: 1 }],
        }),
      )
    })

    it('rejects answers that do not fit the rules, and a site without rules', async () => {
      for (const [d, wizard] of [
        [software(), { ...answers, options: ['zlec'] }],
        [software(), { ...answers, size: 'start' }],
        [software(), { ...answers, addOns: ['opiekaSys'] }],
        [software({ findSoftwareWizard: vi.fn(async () => null) }), answers],
      ] as const) {
        expect(
          await submitInquiryWith(d, { ...softwareRequest, body: { ...wizardBody, wizard } }),
        ).toEqual({ ok: false, error: 'invalid', fields: ['wizard'] })
        expect(d.save).not.toHaveBeenCalled()
      }
    })

    it('asks for the contact the preference needs: a phone for „Telefon”, an e-mail for „E-mail”', async () => {
      const phonePref = { ...wizardBody, wizard: { ...answers, contactPref: 'tel' } }
      const d = software()
      expect(await submitInquiryWith(d, { ...softwareRequest, body: phonePref })).toEqual({
        ok: false,
        error: 'invalid',
        fields: ['phone'],
      })
      expect(d.save).not.toHaveBeenCalled()
      const withPhone = { ...phonePref, email: undefined, phone: '600 100 200' }
      expect(
        (await submitInquiryWith(software(), { ...softwareRequest, body: withPhone })).ok,
      ).toBe(true)
      const mailPref = {
        ...wizardBody,
        email: undefined,
        phone: '600 100 200',
        wizard: { ...answers, contactPref: 'mail' },
      }
      expect(await submitInquiryWith(software(), { ...softwareRequest, body: mailPref })).toEqual({
        ok: false,
        error: 'invalid',
        fields: ['email'],
      })
    })

    it('reads the rules of its own tenant only', async () => {
      const d = software()
      await submitInquiryWith(d, { ...softwareRequest, body: wizardBody })
      expect(d.findSoftwareWizard).toHaveBeenCalledWith(2)
    })

    it('saves the advice without an item when nothing prices it („Opisz po swojemu”)', async () => {
      const d = software()
      const own = { ...answers, need: null, own: true, options: [], more: [], addOns: [] }
      expect(
        (await submitInquiryWith(d, { ...softwareRequest, body: { ...wizardBody, wizard: own } }))
          .ok,
      ).toBe(true)
      expect(d.save).toHaveBeenCalledWith(expect.objectContaining({ items: [] }))
    })
  })

  describe('Instalacje planner (I11, ADR-I002 §4)', () => {
    const instRequest = { host: 'instalacje.localhost:3002', ip: '203.0.113.9' }
    const installations = () =>
      deps({
        findTenant: vi.fn(async () => ({
          id: 3,
          name: 'PRO-KOM Instalacje',
          line: 'instalacje' as const,
          notificationEmail: 'i@p.pl',
        })),
        save: vi.fn(async () => ({ id: 50, number: 'PKI-2026-0050' })),
      })
    const plan = {
      services: ['kam', 'ev'],
      object: 'pens',
      answers: { kam: 0, ev: 1 },
      via: 0,
      when: 1,
    }
    const planBody = {
      ...body,
      type: 'wizard',
      category: 'Instalacje — Zaplanuj',
      email: undefined,
      message: undefined,
      city: 'Rabka-Zdrój',
      topics: ['wifi'],
      source: { url: 'https://prokominstalacje.pl/zaplanuj' },
      wizard: plan,
    }

    it('saves the named answers, the services as topics and the contact preference', async () => {
      const d = installations()
      expect(await submitInquiryWith(d, { ...instRequest, body: planBody })).toEqual({
        ok: true,
        id: 50,
        number: 'PKI-2026-0050',
      })
      expect(d.save).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant: 3,
          line: 'instalacje',
          type: 'wizard',
          // From the answers, not from the sent topics.
          topics: ['kam', 'ev'],
          preferredContact: 'phone',
          items: [],
          wizard: expect.objectContaining({
            Instalacje: ['Monitoring i kamery', 'Ładowarki EV'],
            Obiekt: 'Pensjonat',
            'Strefa dojazdu': 'Rabka-Zdrój i okolice',
            'Pora kontaktu': 'Po południu',
          }),
        }),
      )
      expect(d.findWizard).not.toHaveBeenCalled()
      expect(d.findSoftwareWizard).not.toHaveBeenCalled()
    })

    it('names the services in the office e-mail', async () => {
      const d = installations()
      await submitInquiryWith(d, { ...instRequest, body: planBody })
      expect(d.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'i@p.pl',
          text: expect.stringContaining('Monitoring i kamery, Ładowarki EV'),
        }),
      )
    })

    it('rejects answers outside the rules and saves nothing', async () => {
      const d = installations()
      const wrong = { ...planBody, wizard: { ...plan, answers: { snd: 0 } } }
      expect(await submitInquiryWith(d, { ...instRequest, body: wrong })).toEqual({
        ok: false,
        error: 'invalid',
        fields: ['wizard'],
      })
      expect(d.save).not.toHaveBeenCalled()
    })

    it('asks for an e-mail when the customer chose „E-mail”', async () => {
      const d = installations()
      const byEmail = { ...planBody, wizard: { ...plan, via: 2 } }
      expect(await submitInquiryWith(d, { ...instRequest, body: byEmail })).toEqual({
        ok: false,
        error: 'invalid',
        fields: ['email'],
      })
    })
  })
})

describe('siteUrl (the current site from the wizard)', () => {
  it.each([
    ['stara.pl', 'https://stara.pl/'],
    ['https://www.stara.pl/o-nas', 'https://www.stara.pl/o-nas'],
    ['HTTP://stara.pl', 'http://stara.pl/'],
    ['localhost', undefined],
    ['javascript:alert(1)', undefined],
    ['program do faktur', undefined],
    ['', undefined],
  ])('%s', (text, expected) => {
    expect(siteUrl(text)).toBe(expected)
  })
})

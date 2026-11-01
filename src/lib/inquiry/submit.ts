import type { Inquiry } from '@/payload-types'

import type { Wizard } from '../catalog/wizard'
import { parseKr, wizardProfile } from '../catalog/wizardEngine'
import { parsePlanAnswers, planContact, planSummary } from '../instalacje/plan'
import { errorFields, log } from '../log'
import type { ContactField, SoftwareWizard } from '../software/wizard'
import {
  addOnSlugsOf,
  contactPrefOf,
  needOf,
  parseSoftwareAnswers,
  resultIdOf,
  wizardMessage,
  wizardSummary as softwareWizardSummary,
} from '../software/wizardFlow'
import { normalizeHost } from '../tenant/host'
import type { Line } from '../tenant/lines'
import {
  confirmationEmail,
  notificationEmail,
  type Email,
  type InquiryForEmail,
  type ItemForEmail,
} from './emails'
import { inquiryFieldErrors, parseInquiryInput, type InquiryInput } from './schema'
import {
  checkFormToken,
  createRateLimiter,
  HONEYPOT_FIELD,
  isHoneypotFilled,
  rateLimitKey,
} from './spam'
import { isSoftwareTopic, SOFTWARE_TOPIC_LABELS } from './types'

export type SubmitResult =
  | { ok: true; id: number; number: string | null }
  | { ok: false; error: 'unknown_host' | 'spam' | 'rate_limited' | 'unavailable' }
  | { ok: false; error: 'invalid'; fields: string[] }

type InquiryTenant = { id: number; name: string; line: Line; notificationEmail?: string | null }

type NewInquiry = Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt' | 'statusChangedAt'>

/** A published product (Biznes) or solution (Software) of the tenant, as an inquiry needs it. */
export type InquiryProduct = { id: number; slug: string; name: string }

/** Everything `submitInquiry` touches outside itself — injected, so the logic is unit-tested. */
export type SubmitDeps = {
  secret: string
  now: () => number
  limiter: { hit: (key: string) => boolean }
  findTenant: (host: string) => Promise<InquiryTenant | null>
  /** Published products of this tenant with these slugs (tenant isolation, ADR-012 §3). */
  findProducts: (tenantId: number, slugs: string[]) => Promise<InquiryProduct[]>
  /** Published solutions of this tenant with these slugs — „Twój projekt” (ADR-014 §3). */
  findSolutions: (tenantId: number, slugs: string[]) => Promise<InquiryProduct[]>
  /** Valid wizard rules of this tenant (`BiznesSettings.wizard`), or `null` without them. */
  findWizard: (tenantId: number) => Promise<Wizard | null>
  /** Valid wizard rules of a Software tenant (`SoftwareSettings.wizard`), or `null`. */
  findSoftwareWizard: (tenantId: number) => Promise<SoftwareWizard | null>
  /** Returns the record after the hooks, so with the number (`Inquiries.assignNumber`). */
  save: (data: NewInquiry) => Promise<{ id: number; number?: string | null }>
  sendEmail: (email: Email) => Promise<unknown>
  panelUrl: (id: number) => string
  /** The site's address for a `Host` (`siteOrigin`), or `null` — links to the site in a record. */
  siteOrigin: (host: string) => string | null
  // Structured fields only: ids, tenant, `errorFields()` of a caught error — never form data
  // (ADR-003); database errors quote the query parameters, SMTP errors the recipients.
  log: Record<'info' | 'warn' | 'error', (fields: Record<string, unknown>, msg: string) => void>
}

export type SubmitRequest = {
  /** The `Host` header; the tenant comes only from here, never from the body. */
  host: string | null
  /** Client IP set by the reverse proxy; `null` locally (one shared limit). */
  ip: string | null
  body: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** „Twój projekt (Strona): Strona firmowa z panelem, …” — names as saved, not as sent. */
function projectMessage(topics: readonly string[], items: readonly SavedItem[]): string {
  const topic = topics.find(isSoftwareTopic)
  const head = topic ? `Twój projekt (${SOFTWARE_TOPIC_LABELS[topic]})` : 'Twój projekt'
  return `${head}: ${items.map((item) => item.nameSnapshot).join(', ')}`
}

type SavedItem = {
  product?: number
  solution?: number
  nameSnapshot: string
  quantity: number
  note?: string
}

/**
 * The list items as records of this tenant (products, or solutions on Software), in the
 * customer's order. The name is taken from the database, never from the browser; a slug of
 * another site or a removed record is dropped.
 */
function matchItems(
  items: InquiryInput['items'],
  records: InquiryProduct[],
  relation: 'product' | 'solution',
): SavedItem[] {
  const bySlug = new Map(records.map((record) => [record.slug, record]))
  return items.flatMap((item) => {
    const record = bySlug.get(item.slug)
    if (!record) return []
    return [
      {
        [relation]: record.id,
        nameSnapshot: record.name,
        quantity: item.quantity,
        ...(item.note ? { note: item.note } : {}),
      },
    ]
  })
}

/**
 * Konfigurator 3.0 (K4g, K35 §1.3): the browser sends the `?kr=` link of the result and the items
 * the customer chose (matched like a list — published products of this tenant). The link is
 * checked against this site's rules and named for people as the profile — or `null` when it does
 * not fit them (or the site has none).
 */
async function composeWizard(
  deps: SubmitDeps,
  tenantId: number,
  input: unknown,
  host: string,
): Promise<ComposedWizard | null> {
  const kr = isRecord(input) && typeof input.kr === 'string' ? input.kr : null
  if (kr === null) return null
  const rules = await deps.findWizard(tenantId)
  const state = rules ? parseKr(rules, kr) : null
  if (!rules || !state) return null
  return { summary: wizardProfile(rules, state, deps.siteOrigin(host) ?? '') }
}

type ComposedWizard = {
  /** Absent: the items sent by the browser stand (Konfigurator 3.0). */
  items?: SavedItem[]
  summary: Record<string, unknown>
  when?: string
  message?: string
  preferredContact?: InquiryInput['preferredContact']
  auditUrl?: string
  /** Software: what the chosen contact preference needs (`contactPrefs[].field`). */
  contactField?: ContactField
  /** Instalacje: the services come from the answers, not from the sent topics. */
  topics?: string[]
}

/**
 * The Instalacje planner's answers as an inquiry (I11, ADR-I002 §4): checked against the rules
 * in code (`lib/instalacje/plan`), named for people, the services as topics — or `null` when the
 * answers do not fit. No items: Instalacje quote after a site visit.
 */
function composeInstalacjePlan(input: unknown, city: string | undefined): ComposedWizard | null {
  const answers = parsePlanAnswers(input)
  if (!answers) return null
  const contact = planContact(answers)
  return {
    items: [],
    summary: planSummary(answers, city),
    topics: answers.services,
    preferredContact: contact,
    ...(contact === 'email' && { contactField: 'email' as const }),
  }
}

/**
 * The contact the wizard's preference needs, checked on the server too (the browser asks for it
 * first): a phone of at least 9 digits for „Telefon”, an e-mail for „E-mail”. `null` = fine.
 */
function missingContact(
  field: ContactField | undefined,
  input: { phone?: string; email?: string },
): 'phone' | 'email' | null {
  if (field === 'phone' && (input.phone ?? '').replace(/\D/g, '').length < 9) return 'phone'
  if (field === 'email' && !input.email) return 'email'
  return null
}

/** `stara.pl` → `https://stara.pl/`; anything that is not a web address → `undefined`. */
export function siteUrl(text: string): string | undefined {
  if (!text) return undefined
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)
    return url.hostname.includes('.') ? url.href : undefined
  } catch {
    return undefined
  }
}

/**
 * The Software wizard's answers as an inquiry (spec. §6.3): checked against this site's rules,
 * the recommended solution and the added add-ons as items (published, this tenant), the answers named for people,
 * the message written here and the contact preference mapped — or `null` when the answers do
 * not fit the rules (or there are none).
 */
async function composeSoftwareWizard(
  deps: SubmitDeps,
  tenantId: number,
  input: unknown,
): Promise<ComposedWizard | null> {
  const rules = await deps.findSoftwareWizard(tenantId)
  const answers = rules ? parseSoftwareAnswers(rules, input) : null
  if (!rules || !answers) return null
  // The recommended solution first, then the added add-ons (each solution once).
  const result = rules.resultToSolutionSlug[resultIdOf(rules, answers)] ?? null
  const slugs = [...new Set([...(result ? [result] : []), ...addOnSlugsOf(rules, answers)])]
  const found = slugs.length > 0 ? await deps.findSolutions(tenantId, slugs) : []
  const bySlug = new Map(found.map((solution) => [solution.slug, solution]))
  const items = slugs.flatMap((slug) => {
    const solution = bySlug.get(slug)
    return solution ? [{ solution: solution.id, nameSnapshot: solution.name, quantity: 1 }] : []
  })
  const when = rules.whens.find((option) => option.id === answers.when)?.n
  return {
    items,
    summary: softwareWizardSummary(rules, answers),
    message: wizardMessage(rules, answers),
    preferredContact: contactPrefOf(rules, answers)?.inquiryValue,
    contactField: contactPrefOf(rules, answers)?.field,
    ...(when && { when }),
    ...(needOf(rules, answers)?.url && { auditUrl: siteUrl(answers.url) }),
  }
}

/** The one place that accepts an inquiry (ADR-003); see `submitInquiry`. */
export async function submitInquiryWith(
  deps: SubmitDeps,
  { host, ip, body }: SubmitRequest,
): Promise<SubmitResult> {
  const normalized = normalizeHost(host)
  let tenant: InquiryTenant | null = null
  try {
    tenant = normalized ? await deps.findTenant(normalized) : null
  } catch (error) {
    deps.log.error(errorFields(error), 'Inquiry tenant lookup failed')
    return { ok: false, error: 'unavailable' }
  }
  if (!tenant) return { ok: false, error: 'unknown_host' }
  if (!isRecord(body)) return { ok: false, error: 'invalid', fields: [] }

  const now = deps.now()
  if (
    isHoneypotFilled(body[HONEYPOT_FIELD]) ||
    checkFormToken(body.formToken, deps.secret, now) !== 'ok'
  ) {
    deps.log.info({ tenant: tenant.id }, 'Inquiry rejected as spam')
    return { ok: false, error: 'spam' }
  }

  // Validation first: invalid attempts save nothing, so they do not use up the limit of
  // a person correcting the form; the limit guards what costs — records and e-mails.
  const parsed = parseInquiryInput(body, tenant.line)
  if (!parsed.success) {
    return { ok: false, error: 'invalid', fields: inquiryFieldErrors(parsed.error) }
  }
  const input = parsed.data

  // Like validation, before the limit: a stale list (products removed meanwhile) is the
  // customer's to fix, not an attempt that counts.
  let items: SavedItem[] = []
  if (input.items.length > 0) {
    try {
      const slugs = input.items.map((item) => item.slug)
      items =
        tenant.line === 'software'
          ? matchItems(input.items, await deps.findSolutions(tenant.id, slugs), 'solution')
          : matchItems(input.items, await deps.findProducts(tenant.id, slugs), 'product')
    } catch (error) {
      deps.log.error({ tenant: tenant.id, ...errorFields(error) }, 'Inquiry products lookup failed')
      return { ok: false, error: 'unavailable' }
    }
    // A list whose every item is gone (products removed meanwhile) is the customer's to fix —
    // also in the Biznes Konfigurator, which sends what was chosen.
    if ((input.type === 'list' || input.type === 'wizard') && items.length === 0) {
      return { ok: false, error: 'invalid', fields: ['items'] }
    }
  }

  // The wizard's answers are checked against this site's rules and named here — never taken as
  // sent; Software and Instalacje also compute the items from them, Biznes keeps the chosen ones.
  let wizard = input.wizard
  let deadline = input.deadline
  let topics = input.topics
  let { message, preferredContact, auditUrl } = input
  if (input.type === 'wizard') {
    let composed: ComposedWizard | null
    try {
      composed =
        tenant.line === 'software'
          ? await composeSoftwareWizard(deps, tenant.id, input.wizard)
          : tenant.line === 'instalacje'
            ? composeInstalacjePlan(input.wizard, input.city)
            : await composeWizard(deps, tenant.id, input.wizard, host ?? '')
    } catch (error) {
      deps.log.error({ tenant: tenant.id, ...errorFields(error) }, 'Inquiry wizard lookup failed')
      return { ok: false, error: 'unavailable' }
    }
    if (!composed) return { ok: false, error: 'invalid', fields: ['wizard'] }
    // „Zadzwonimy” needs a phone, „napiszemy” an e-mail (the field of the chosen preference).
    const contactError = missingContact(composed.contactField, input)
    if (contactError) return { ok: false, error: 'invalid', fields: [contactError] }
    items = composed.items ?? items
    wizard = composed.summary
    deadline = composed.when ?? deadline
    // Software: the server writes the message and maps the preference (spec. §6.3).
    message = composed.message ?? message
    preferredContact = composed.preferredContact ?? preferredContact
    auditUrl = composed.auditUrl ?? auditUrl
    topics = composed.topics ?? topics
  }

  // The audit form sends the address only; the message says what is asked (rozstrz. SW0 6).
  if (input.type === 'audit' && message === undefined) {
    message = `Prośba o audyt strony: ${input.auditUrl}`
  }

  // „Twój projekt” sent without a description (spec. §6.10): the topic and the list say it all.
  if (tenant.line === 'software' && input.type === 'list' && message === undefined) {
    message = projectMessage(topics, items)
  }

  if (!deps.limiter.hit(rateLimitKey(ip ?? 'unknown', deps.secret))) {
    deps.log.warn({ tenant: tenant.id }, 'Inquiry rate-limited')
    return { ok: false, error: 'rate_limited' }
  }
  const acceptedAt = new Date(now).toISOString()

  let saved: { id: number; number?: string | null }
  try {
    saved = await deps.save({
      tenant: tenant.id,
      line: tenant.line,
      status: 'new',
      type: input.type,
      category: input.category,
      name: input.name,
      company: input.company,
      nip: input.nip,
      email: input.email,
      phone: input.phone,
      city: input.city,
      message,
      auditUrl,
      preferredContact,
      deadline,
      topics,
      items,
      wizard,
      source: input.source,
      consent: { ...input.consent, acceptedAt },
      marketingConsent: input.marketingConsent,
    })
  } catch (error) {
    deps.log.error({ tenant: tenant.id, ...errorFields(error) }, 'Inquiry not saved')
    return { ok: false, error: 'unavailable' }
  }
  const { id } = saved
  const number = saved.number ?? null
  deps.log.info({ tenant: tenant.id, inquiry: id }, 'Inquiry saved')

  // The record is the source of truth: a failed e-mail is logged, the customer still gets 201.
  const forEmail: InquiryForEmail = {
    ...input,
    topics,
    message,
    auditUrl,
    preferredContact,
    deadline,
    wizard,
    id,
    number,
    line: tenant.line,
    tenantName: tenant.name,
    items: items.map((item): ItemForEmail => ({
      name: item.nameSnapshot,
      quantity: item.quantity,
      note: item.note,
    })),
    consent: { clauseVersion: input.consent.clauseVersion, acceptedAt },
  }
  const emails: { kind: string; email: Email }[] = []
  if (tenant.notificationEmail) {
    emails.push({
      kind: 'notification',
      email: notificationEmail(forEmail, {
        to: tenant.notificationEmail,
        panelUrl: deps.panelUrl(id),
      }),
    })
  } else {
    deps.log.warn({ tenant: tenant.id, inquiry: id }, 'Tenant has no notification e-mail')
  }
  const confirmation = confirmationEmail(forEmail)
  if (confirmation) emails.push({ kind: 'confirmation', email: confirmation })

  const results = await Promise.allSettled(emails.map(({ email }) => deps.sendEmail(email)))
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      deps.log.error(
        { tenant: tenant.id, inquiry: id, email: emails[i]?.kind, ...errorFields(result.reason) },
        'Inquiry e-mail not sent',
      )
    }
  })

  return { ok: true, id, number }
}

// One limiter per process, shared across bundles like the tenant cache (`lib/tenant/byHost`).
const LIMITER_KEY = Symbol.for('prokom.inquiryRateLimiter')
const store = globalThis as typeof globalThis & {
  [LIMITER_KEY]?: ReturnType<typeof createRateLimiter>
}
// 5 inquiries per 10 minutes from one address — plenty for a person, little for a script.
const limiter = (store[LIMITER_KEY] ??= createRateLimiter({ limit: 5, windowMs: 10 * 60_000 }))

/**
 * Accepts an inquiry from a site form (ADR-003): tenant from `Host`, spam checks, validation,
 * save, e-mails. In 2027 `save` moves to the PRO-KOM System API; the forms stay as they are.
 */
export async function submitInquiry(
  request: SubmitRequest,
  context: { requestId: string },
): Promise<SubmitResult> {
  // Imported lazily, like `lib/tenant/byHost`: keeps the Payload config out of unit tests.
  const [{ getPayload }, { default: config }, { getEnv }, { getTenantByHost }, { siteOrigin }] =
    await Promise.all([
      import('payload'),
      import('@payload-config'),
      import('../env'),
      import('../tenant/byHost'),
      import('../seo/origin'),
    ])
  const payload = await getPayload({ config })
  const env = getEnv()

  return submitInquiryWith(
    {
      secret: env.PAYLOAD_SECRET,
      now: Date.now,
      limiter,
      findTenant: async (host) => {
        const tenant = await getTenantByHost(host)
        if (!tenant) return null
        // Not part of the cached `SiteTenant` on purpose; read fresh, server-side only.
        const { notificationEmail } = await payload.findByID({
          collection: 'tenants',
          id: tenant.id,
          depth: 0,
          select: { notificationEmail: true },
          overrideAccess: true,
        })
        return { ...tenant, notificationEmail }
      },
      findProducts: async (tenantId, slugs) => {
        const { docs } = await payload.find({
          collection: 'products',
          where: {
            and: [
              { tenant: { equals: tenantId } },
              { slug: { in: slugs } },
              { _status: { equals: 'published' } },
            ],
          },
          draft: false,
          depth: 0,
          limit: slugs.length,
          pagination: false,
          select: { slug: true, name: true },
          overrideAccess: true,
        })
        return docs.map(({ id, slug, name }) => ({ id, slug, name }))
      },
      findSolutions: async (tenantId, slugs) => {
        const { docs } = await payload.find({
          collection: 'solutions',
          where: {
            and: [
              { tenant: { equals: tenantId } },
              { slug: { in: slugs } },
              { _status: { equals: 'published' } },
            ],
          },
          draft: false,
          depth: 0,
          limit: slugs.length,
          pagination: false,
          select: { slug: true, name: true },
          overrideAccess: true,
        })
        return docs.map(({ id, slug, name }) => ({ id, slug, name }))
      },
      findSoftwareWizard: async (tenantId) => {
        const { readSoftwareWizard } = await import('../software/wizardRules')
        return readSoftwareWizard(payload, tenantId)
      },
      findWizard: async (tenantId) => {
        const { readWizardRules } = await import('../catalog/wizardRules')
        return readWizardRules(payload, tenantId)
      },
      save: (data) =>
        payload.create({ collection: 'inquiries', data, depth: 0, overrideAccess: true }),
      sendEmail: (email) => payload.sendEmail(email),
      siteOrigin: (host) => siteOrigin(host, env.SITE_ENV),
      panelUrl: (id) => {
        // Same scheme rules as the sites; locally the panel runs on the request's port.
        const port = request.host?.trim().match(/:(\d+)$/)?.[1]
        const origin = siteOrigin(port ? `${env.PANEL_HOST}:${port}` : env.PANEL_HOST, env.SITE_ENV)
        return `${origin}/admin/collections/inquiries/${id}`
      },
      log: log.child({ requestId: context.requestId }),
    },
    request,
  )
}

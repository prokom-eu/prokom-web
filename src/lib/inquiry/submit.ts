import type { Inquiry } from '@/payload-types'

import type { Wizard } from '../catalog/wizard'
import { buildKit, parseWizardAnswers, proposedSlugs, wizardSummary } from '../catalog/wizardKit'
import { errorFields, log } from '../log'
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

export type SubmitResult =
  | { ok: true; id: number; number: string | null }
  | { ok: false; error: 'unknown_host' | 'spam' | 'rate_limited' | 'unavailable' }
  | { ok: false; error: 'invalid'; fields: string[] }

type InquiryTenant = { id: number; name: string; line: Line; notificationEmail?: string | null }

type NewInquiry = Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt' | 'statusChangedAt'>

/** A published product of the tenant, as far as an inquiry needs it. */
export type InquiryProduct = { id: number; slug: string; name: string }

/** Everything `submitInquiry` touches outside itself — injected, so the logic is unit-tested. */
export type SubmitDeps = {
  secret: string
  now: () => number
  limiter: { hit: (key: string) => boolean }
  findTenant: (host: string) => Promise<InquiryTenant | null>
  /** Published products of this tenant with these slugs (tenant isolation, ADR-012 §3). */
  findProducts: (tenantId: number, slugs: string[]) => Promise<InquiryProduct[]>
  /** Valid wizard rules of this tenant (`BiznesSettings.wizard`), or `null` without them. */
  findWizard: (tenantId: number) => Promise<Wizard | null>
  /** Returns the record after the hooks, so with the number (`Inquiries.assignNumber`). */
  save: (data: NewInquiry) => Promise<{ id: number; number?: string | null }>
  sendEmail: (email: Email) => Promise<unknown>
  panelUrl: (id: number) => string
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

type SavedItem = { product: number; nameSnapshot: string; quantity: number; note?: string }

/**
 * The list items as products of this tenant, in the customer's order. The name is taken from
 * the database, never from the browser; a slug of another site or a removed product is dropped.
 */
function matchItems(items: InquiryInput['items'], products: InquiryProduct[]): SavedItem[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]))
  return items.flatMap((item) => {
    const product = bySlug.get(item.slug)
    if (!product) return []
    return [
      {
        product: product.id,
        nameSnapshot: product.name,
        quantity: item.quantity,
        ...(item.note ? { note: item.note } : {}),
      },
    ]
  })
}

/**
 * The wizard's answers as an inquiry: the kit's products of this tenant as items (with the
 * quantity per sales point) and the answers named for people — or `null` when the answers do
 * not fit the rules of this site (or it has none).
 */
async function composeWizard(
  deps: SubmitDeps,
  tenantId: number,
  input: unknown,
): Promise<{ items: SavedItem[]; summary: Record<string, unknown>; when?: string } | null> {
  const rules = await deps.findWizard(tenantId)
  const answers = rules ? parseWizardAnswers(rules, input) : null
  if (!rules || !answers) return null
  // Which products the rules propose, then only the published ones of this tenant.
  const proposed = proposedSlugs(rules, answers)
  const products = proposed.length > 0 ? await deps.findProducts(tenantId, proposed) : []
  const bySlug = new Map(products.map((product) => [product.slug, product]))
  const kit = buildKit(rules, answers, (slug) => bySlug.get(slug))
  const items = kit.items.flatMap((item) => {
    const product = item.slug ? bySlug.get(item.slug) : undefined
    return product
      ? [{ product: product.id, nameSnapshot: product.name, quantity: item.quantity }]
      : []
  })
  return { items, summary: wizardSummary(rules, answers, kit), when: answers.when }
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
      items = matchItems(input.items, await deps.findProducts(tenant.id, slugs))
    } catch (error) {
      deps.log.error({ tenant: tenant.id, ...errorFields(error) }, 'Inquiry products lookup failed')
      return { ok: false, error: 'unavailable' }
    }
    if (input.type === 'list' && items.length === 0) {
      return { ok: false, error: 'invalid', fields: ['items'] }
    }
  }

  // The wizard sends its answers only: they are checked against this site's rules and the kit
  // is computed here, from published products of this tenant (B10c) — never taken as sent.
  let wizard = input.wizard
  let deadline = input.deadline
  if (input.type === 'wizard') {
    let composed: { items: SavedItem[]; summary: Record<string, unknown>; when?: string } | null
    try {
      composed = await composeWizard(deps, tenant.id, input.wizard)
    } catch (error) {
      deps.log.error({ tenant: tenant.id, ...errorFields(error) }, 'Inquiry wizard lookup failed')
      return { ok: false, error: 'unavailable' }
    }
    if (!composed) return { ok: false, error: 'invalid', fields: ['wizard'] }
    items = composed.items
    wizard = composed.summary
    deadline = composed.when ?? deadline
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
      message: input.message,
      preferredContact: input.preferredContact,
      deadline,
      topics: input.topics,
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
      findWizard: async (tenantId) => {
        const { readWizardRules } = await import('../catalog/wizardRules')
        return readWizardRules(payload, tenantId)
      },
      save: (data) =>
        payload.create({ collection: 'inquiries', data, depth: 0, overrideAccess: true }),
      sendEmail: (email) => payload.sendEmail(email),
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

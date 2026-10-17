import type { Inquiry } from '@/payload-types'

import { errorFields, log } from '../log'
import { normalizeHost } from '../tenant/host'
import type { Line } from '../tenant/lines'
import { confirmationEmail, notificationEmail, type Email, type InquiryForEmail } from './emails'
import { inquiryFieldErrors, parseInquiryInput } from './schema'
import {
  checkFormToken,
  createRateLimiter,
  HONEYPOT_FIELD,
  isHoneypotFilled,
  rateLimitKey,
} from './spam'

export type SubmitResult =
  | { ok: true; id: number }
  | { ok: false; error: 'unknown_host' | 'spam' | 'rate_limited' | 'unavailable' }
  | { ok: false; error: 'invalid'; fields: string[] }

type InquiryTenant = { id: number; name: string; line: Line; notificationEmail?: string | null }

type NewInquiry = Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt' | 'statusChangedAt'>

/** Everything `submitInquiry` touches outside itself — injected, so the logic is unit-tested. */
export type SubmitDeps = {
  secret: string
  now: () => number
  limiter: { hit: (key: string) => boolean }
  findTenant: (host: string) => Promise<InquiryTenant | null>
  save: (data: NewInquiry) => Promise<{ id: number }>
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
  const parsed = parseInquiryInput(body)
  if (!parsed.success) {
    return { ok: false, error: 'invalid', fields: inquiryFieldErrors(parsed.error) }
  }
  if (!deps.limiter.hit(rateLimitKey(ip ?? 'unknown', deps.secret))) {
    deps.log.warn({ tenant: tenant.id }, 'Inquiry rate-limited')
    return { ok: false, error: 'rate_limited' }
  }
  const input = parsed.data
  const acceptedAt = new Date(now).toISOString()

  let saved: { id: number }
  try {
    saved = await deps.save({
      tenant: tenant.id,
      line: tenant.line,
      status: 'new',
      category: input.category,
      name: input.name,
      company: input.company,
      nip: input.nip,
      email: input.email,
      phone: input.phone,
      message: input.message,
      source: input.source,
      consent: { ...input.consent, acceptedAt },
      marketingConsent: input.marketingConsent,
    })
  } catch (error) {
    deps.log.error({ tenant: tenant.id, ...errorFields(error) }, 'Inquiry not saved')
    return { ok: false, error: 'unavailable' }
  }
  const { id } = saved
  deps.log.info({ tenant: tenant.id, inquiry: id }, 'Inquiry saved')

  // The record is the source of truth: a failed e-mail is logged, the customer still gets 201.
  const forEmail: InquiryForEmail = {
    ...input,
    id,
    line: tenant.line,
    tenantName: tenant.name,
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

  return { ok: true, id }
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

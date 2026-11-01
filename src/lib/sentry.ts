import type { ErrorEvent, NodeOptions } from '@sentry/nextjs'

/**
 * Sentry (ADR-021): server errors only, nothing about the people who sent a request. Personal
 * data (e-mail, phone, name, inquiry text) must never reach Sentry (ADR-003), so the SDK collects
 * no request data, user, cookies, headers, query, bodies, database values or local variables,
 * and `scrubEvent` removes whatever an integration still attaches — including values inside error
 * messages (a failed query lists its parameters). No tracing: `tracesSampleRate` stays unset
 * (even 0 would load tracing and add trace headers to outgoing requests) — errors only.
 */
export function sentryOptions(env: {
  SENTRY_DSN?: string
  SITE_ENV: string
}): NodeOptions | undefined {
  if (!env.SENTRY_DSN) return undefined
  return {
    dsn: env.SENTRY_DSN,
    environment: env.SITE_ENV,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
    },
    beforeSend: scrubEvent,
    // Breadcrumbs repeat log lines and outgoing requests — not needed to fix an error.
    beforeBreadcrumb: () => null,
  }
}

const EMAIL = /[^\s@"'<>(),;:]+@[^\s@"'<>(),;:]+\.[^\s@"'<>(),;:]+/g
// 9+ digits, optionally with spaces, dashes, dots or a leading +48 — Polish phone numbers.
const PHONE = /\+?\d(?:[\s.-]?\d){8,}/g
// Values a database error quotes: `invalid input syntax …: "value"`, `Key (email)=(value)`.
const QUOTED = /: "[^"]*"/g
const KEY_VALUE = /=\([^)]*\)/g

/**
 * Error text without personal data: drops the parameter list of a failed query (drizzle:
 * `Failed query: … \nparams: …`) and masks e-mails, phone numbers and quoted values.
 */
export function scrubMessage(text: string): string {
  const cut = text.indexOf('\nparams:')
  return (cut === -1 ? text : text.slice(0, cut) + '\nparams: [removed]')
    .replace(EMAIL, '[email]')
    .replace(PHONE, '[phone]')
    .replace(QUOTED, ': "[value]"')
    .replace(KEY_VALUE, '=([value])')
}

/** Keeps the error (type, message, stack, URL path) and drops request and user details. */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  const scrubbed: ErrorEvent = { ...event }
  if (scrubbed.message) scrubbed.message = scrubMessage(scrubbed.message)
  if (scrubbed.exception?.values) {
    // Also the linked errors (`cause`), which the SDK adds to the same list.
    scrubbed.exception = {
      ...scrubbed.exception,
      values: scrubbed.exception.values.map((value) =>
        value.value ? { ...value, value: scrubMessage(value.value) } : value,
      ),
    }
  }
  delete scrubbed.user
  delete scrubbed.breadcrumbs
  if (scrubbed.request) {
    const url = scrubbed.request.url
    scrubbed.request = url ? { url: url.split('?')[0], method: scrubbed.request.method } : {}
  }
  delete scrubbed.extra
  return scrubbed
}

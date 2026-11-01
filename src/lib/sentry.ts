import type { ErrorEvent, NodeOptions } from '@sentry/nextjs'

/**
 * Sentry (ADR-021): server errors only, nothing about the people who sent a request. Personal
 * data (e-mail, phone, name, inquiry text) must never reach Sentry (ADR-003), so the SDK collects
 * no request data, user, cookies, headers, query, bodies, database values or local variables,
 * and `scrubEvent` removes whatever an integration still attaches. No tracing (spans may carry
 * queries) — errors only.
 */
export function sentryOptions(env: {
  SENTRY_DSN?: string
  SITE_ENV: string
}): NodeOptions | undefined {
  if (!env.SENTRY_DSN) return undefined
  return {
    dsn: env.SENTRY_DSN,
    environment: env.SITE_ENV,
    tracesSampleRate: 0,
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

/** Keeps the error (type, message, stack, URL path) and drops request and user details. */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  const scrubbed: ErrorEvent = { ...event }
  delete scrubbed.user
  delete scrubbed.breadcrumbs
  if (scrubbed.request) {
    const url = scrubbed.request.url
    scrubbed.request = url ? { url: url.split('?')[0], method: scrubbed.request.method } : {}
  }
  delete scrubbed.extra
  return scrubbed
}

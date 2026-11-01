import * as Sentry from '@sentry/nextjs'

/**
 * Error reporting (ADR-021): Sentry starts only on the Node.js server and only with SENTRY_DSN
 * set. No client (browser) SDK — visitors' browsers talk to no third party.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { getEnv } = await import('./lib/env')
  const { sentryOptions } = await import('./lib/sentry')
  const options = sentryOptions(getEnv())
  if (options) Sentry.init(options)
}

// Errors of Server Components, route handlers and the proxy; a no-op while Sentry is off.
export const onRequestError = Sentry.captureRequestError

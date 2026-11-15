import type { Env } from '../env'
import type { Line } from '../tenant/lines'

/** Same-origin path of the Umami proxy (`lib/tenant/routing`, ADR-020). */
export const ANALYTICS_PATH = '/_s'

/**
 * Umami website id of a line, or null when its pages are not counted: no container address or
 * no id for the line (ADR-020).
 */
export function umamiWebsiteId(
  env: Pick<Env, 'UMAMI_URL' | 'UMAMI_WEBSITES'>,
  line: Line,
): string | null {
  if (!env.UMAMI_URL) return null
  return env.UMAMI_WEBSITES[line] ?? null
}

/**
 * Attributes of the Umami script tag. `data-exclude-search`: page views go without the query —
 * `/dziekujemy?nr=PKS-…` carries the inquiry number, which links a visit to a person.
 */
export function umamiScriptAttributes(websiteId: string) {
  return {
    src: `${ANALYTICS_PATH}/script.js`,
    'data-website-id': websiteId,
    'data-host-url': ANALYTICS_PATH,
    'data-do-not-track': 'true',
    'data-exclude-search': 'true',
  } as const
}

// What Umami needs from a visitor's request: the device (user agent, language), the address
// for unique visits (set by Nginx) and the body type. Never cookies or the staging password.
const FORWARDED_HEADERS = [
  'user-agent',
  'accept-language',
  'content-type',
  'x-forwarded-for',
  'x-real-ip',
]

/** Request headers passed to the Umami container (ADR-020). */
export function analyticsRequestHeaders(source: Headers): Headers {
  const headers = new Headers()
  for (const name of FORWARDED_HEADERS) {
    const value = source.get(name)
    if (value !== null) headers.set(name, value)
  }
  return headers
}

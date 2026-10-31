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

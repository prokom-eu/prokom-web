import { clampCount } from './logic'

/** Query of the home page cards (ZAOPATRZENIE §3, §8): `?typ=<slug>&n=<count>`. */
export const TYPE_PARAM = 'typ'
export const COUNT_PARAM = 'n'
export const CONFIGURATOR_ANCHOR = 'zestaw'

export type Handoff = { type: number | null; count: number | null }

/**
 * Configurator state handed over from the home page. `null` when neither parameter is there
 * (nothing to set, no scroll); an unknown type or a count that is not a whole number stays
 * `null` (default); a count is clamped to 1–500.
 */
export function parseHandoff(
  params: URLSearchParams,
  types: readonly { slug: string }[],
): Handoff | null {
  const rawType = params.get(TYPE_PARAM)
  const rawCount = params.get(COUNT_PARAM)
  if (rawType === null && rawCount === null) return null
  const slug = rawType?.trim().toLowerCase() ?? ''
  const index = types.findIndex((type) => type.slug === slug)
  const number = rawCount === null ? Number.NaN : Number(rawCount.trim())
  return {
    type: index >= 0 ? index : null,
    count: Number.isInteger(number) ? clampCount(number) : null,
  }
}

export function handoffHref(page: string, type: string, count: number): string {
  const query = new URLSearchParams({ [TYPE_PARAM]: type, [COUNT_PARAM]: String(count) })
  return `/${page}?${query.toString()}#${CONFIGURATOR_ANCHOR}`
}

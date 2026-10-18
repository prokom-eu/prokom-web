import type { Line } from '../tenant/lines'

export type PromoBar = {
  text?: string | null
  startsAt?: string | null
  endsAt?: string | null
}

function parseDate(value: string | null | undefined): number | null | undefined {
  if (!value) return undefined
  const time = Date.parse(value)
  return Number.isNaN(time) ? null : time
}

/** The promo bar shows only with text and inside its optional `startsAt`–`endsAt` window. */
export function isPromoActive(promo: PromoBar | null | undefined, now: Date): boolean {
  if (!promo?.text?.trim()) return false
  const start = parseDate(promo.startsAt)
  const end = parseDate(promo.endsAt)
  if (start === null || end === null) return false

  const time = now.getTime()
  if (start !== undefined && time < start) return false
  if (end !== undefined && time > end) return false
  return true
}

/**
 * `CompanyData` is one global for every domain, so a campaign names its lines; none = all
 * lines (ADR-012, rozstrzygnięcie 3).
 */
export function isPromoForLine(lines: readonly Line[] | null | undefined, line: Line): boolean {
  return !lines?.length || lines.includes(line)
}

/** `endsAt` must come after `startsAt` when both are set; otherwise the bar would never show. */
export function isValidPromoRange(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
): boolean {
  if (!startsAt || !endsAt) return true
  return Date.parse(endsAt) > Date.parse(startsAt)
}

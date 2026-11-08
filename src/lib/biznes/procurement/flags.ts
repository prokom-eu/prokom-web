/**
 * Texts of the procurement pages that need the boss's yes (ZAOPATRZENIE §0, plan §13 #1): in
 * the data an item carries `when: <flag>` and, optionally, a `fallback` shown while the flag is
 * off. Without the panel entry the conditional text never shows.
 */
export type ProcurementFlags = {
  /** Old equipment taken back 1 for 1 (§0 pkt 1). */
  pickup: boolean
  /** Warranty claims accepted on site (§0 pkt 3). */
  warranty: boolean
  /** LG delivered by the wholesaler (§0 pkt 4). */
  lg: boolean
  /** The list of IT services before the delivery is filled in (§0 pkt 2). */
  services: boolean
  /**
   * The call-back promise from `SiteSettings` → „Obietnice” (§0 pkt 7): put in place of
   * `{callback}`; empty = items flagged `callback` do not show.
   */
  callback: string | null
}

export const NO_FLAGS: ProcurementFlags = {
  pickup: false,
  warranty: false,
  lg: false,
  services: false,
  callback: null,
}

const CALLBACK = '{callback}'

type Flagged = { when?: unknown; fallback?: unknown }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function flagOn(when: unknown, flags: ProcurementFlags): boolean {
  if (typeof when !== 'string' || !Object.hasOwn(flags, when)) return false
  const value = flags[when as keyof ProcurementFlags]
  return typeof value === 'string' ? value.trim() !== '' : value === true
}

/**
 * Drops (or swaps for `fallback`) items whose flag is off, strips the markers and puts the
 * panel's promise in place of `{callback}`.
 */
export function applyFlags<T>(value: T, flags: ProcurementFlags): T {
  if (typeof value === 'string') {
    return (
      value.includes(CALLBACK) ? value.replaceAll(CALLBACK, flags.callback?.trim() ?? '') : value
    ) as T
  }
  if (Array.isArray(value)) {
    return value.flatMap((item: unknown) => {
      if (!isRecord(item) || !('when' in item)) return [applyFlags(item, flags)]
      const { when, fallback, ...rest } = item as Record<string, unknown> & Flagged
      if (flagOn(when, flags)) return [applyFlags(rest, flags)]
      return isRecord(fallback) ? [applyFlags(fallback, flags)] : []
    }) as T
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, applyFlags(item, flags)]),
    ) as T
  }
  return value
}

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
  /** The call-back promise is set in `SiteSettings` → „Obietnice” (§0 pkt 7). */
  callback: boolean
}

export const NO_FLAGS: ProcurementFlags = {
  pickup: false,
  warranty: false,
  lg: false,
  callback: false,
}

type Flagged = { when?: unknown; fallback?: unknown }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function flagOn(when: unknown, flags: ProcurementFlags): boolean {
  return typeof when === 'string' && when in flags && flags[when as keyof ProcurementFlags]
}

/** Drops (or swaps for `fallback`) items whose flag is off and strips the markers. */
export function applyFlags<T>(value: T, flags: ProcurementFlags): T {
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

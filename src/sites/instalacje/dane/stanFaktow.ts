/**
 * The date of the facts the pages state (law, rules of producers, TV standards) — one place
 * (P1-7, audit 06.11). The chat checks the law before production (plan „domknięcie” §5); after
 * each check only this constant changes, the sentences say „stan na …” instead of a hard date.
 */
export const STAN_FAKTOW = {
  /** „stan na październik 2026” */
  month: 'październik 2026',
  /** The day of the last check (law section of `/dla-architektow`). */
  date: '28.10.2026',
} as const

/** „stan na październik 2026” — for sentences and eyebrows. */
export const stanNa = () => `stan na ${STAN_FAKTOW.month}`

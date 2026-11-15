const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7]

/** NIP as stored: digits only, without separators or the `PL` prefix. */
export function normalizeNip(value: string): string {
  return value.replace(/^\s*PL/i, '').replace(/[\s-]/g, '')
}

/** Polish NIP: 10 digits with a valid check digit. */
export function isValidNip(value: string): boolean {
  const nip = normalizeNip(value)
  if (!/^\d{10}$/.test(nip)) return false
  const digits = [...nip].map(Number)
  const sum = NIP_WEIGHTS.reduce((acc, weight, i) => acc + weight * (digits[i] as number), 0)
  return sum % 11 === digits[9]
}

/** Opening hours as `HH:MM`, 24-hour clock. */
export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

export const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

/** Days in calendar order (Monday first), not in the order they were picked in the panel. */
export function sortDays<T extends string>(days: readonly T[]): T[] {
  const rank = (day: string) => (DAY_ORDER as readonly string[]).indexOf(day)
  return [...days].sort((a, b) => rank(a) - rank(b))
}

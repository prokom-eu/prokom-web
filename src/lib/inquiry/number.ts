import type { Line } from '../tenant/lines'

/** Prefix of the inquiry number per line (B1b decision; PKB = PRO-KOM Biznes). */
const PREFIX: Record<Line, string> = {
  prokom: 'PK',
  biznes: 'PKB',
  instalacje: 'PKI',
  software: 'PKS',
}

const yearInPoland = new Intl.DateTimeFormat('pl-PL', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
})

/**
 * Number the customer sees after sending (e.g. `PKB-2026-0042`, ADR-012 §3). Built from the
 * record id, so it is unique without a counter; no yearly reset (only the year part changes).
 */
export function inquiryNumber(inquiry: { id: number; line: Line; createdAt: string }): string {
  const year = yearInPoland.format(new Date(inquiry.createdAt))
  return `${PREFIX[inquiry.line]}-${year}-${String(inquiry.id).padStart(4, '0')}`
}

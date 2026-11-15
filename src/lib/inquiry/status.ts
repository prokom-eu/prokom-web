/** Inquiry lifecycle (ADR-003): `new` → `in_progress` → `closed`. */
export const INQUIRY_STATUSES = [
  { label: 'Nowe', value: 'new' },
  { label: 'W toku', value: 'in_progress' },
  { label: 'Zamknięte', value: 'closed' },
] as const

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]['value']

/**
 * When the status changed last — the start of the retention period. Set on create and on any
 * status change; other saves keep the previous value.
 */
export function nextStatusChangedAt(args: {
  operation: 'create' | 'update'
  status: unknown
  previousStatus: unknown
  previousChangedAt: string | null | undefined
  now: Date
}): string | null | undefined {
  const { operation, status, previousStatus, previousChangedAt, now } = args
  if (operation === 'create') return now.toISOString()
  if (status !== undefined && status !== previousStatus) return now.toISOString()
  return previousChangedAt
}

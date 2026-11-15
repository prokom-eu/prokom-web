import type { TaskConfig } from 'payload'

import type { InquiryStatus } from './status'

type RetentionCandidate = {
  id: number
  status: InquiryStatus
  statusChangedAt?: string | null
}

/** `now` minus whole months, clamped to the last day of a shorter month (31.03 − 1 → 28.02). */
export function retentionCutoff(now: Date, months: number): Date {
  const cutoff = new Date(now)
  const day = cutoff.getUTCDate()
  cutoff.setUTCDate(1)
  cutoff.setUTCMonth(cutoff.getUTCMonth() - months)
  const lastDay = new Date(
    Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0),
  ).getUTCDate()
  cutoff.setUTCDate(Math.min(day, lastDay))
  return cutoff
}

/**
 * Retention rule (ADR-003): only `closed` inquiries, counted from the last status change.
 * `new` and `in_progress` stay however old they are — someone still owes an answer.
 */
export function isExpired(inquiry: Omit<RetentionCandidate, 'id'>, cutoff: Date): boolean {
  if (inquiry.status !== 'closed' || !inquiry.statusChangedAt) return false
  return new Date(inquiry.statusChangedAt) < cutoff
}

export async function deleteExpiredInquiries({
  now,
  months,
  findClosed,
  remove,
}: {
  now: Date
  months: number
  /** Closed inquiries (a coarse database filter; the rule itself is `isExpired`). */
  findClosed: () => Promise<RetentionCandidate[]>
  /** Deletes by ids, returns how many were deleted. */
  remove: (ids: number[]) => Promise<number>
}): Promise<{ deleted: number }> {
  const cutoff = retentionCutoff(now, months)
  const ids = (await findClosed()).filter((doc) => isExpired(doc, cutoff)).map((doc) => doc.id)
  if (ids.length === 0) return { deleted: 0 }
  return { deleted: await remove(ids) }
}

/**
 * Daily retention job (ADR-003), run by the in-process job runner (`jobs.autoRun`, ADR-011).
 * Deleting goes through Payload, so each record leaves a trail in `inquiry-deletions`.
 */
export const inquiryRetentionTask: TaskConfig<'inquiryRetention'> = {
  slug: 'inquiryRetention',
  label: 'Usuwanie zamkniętych zapytań po okresie przechowywania',
  schedule: [{ cron: '0 3 * * *', queue: 'default' }],
  outputSchema: [{ name: 'deleted', type: 'number', required: true }],
  handler: async ({ req }) => {
    const { getEnv } = await import('../env')
    const { payload } = req
    const result = await deleteExpiredInquiries({
      now: new Date(),
      months: getEnv().INQUIRY_RETENTION_MONTHS,
      findClosed: async () => {
        const { docs } = await payload.find({
          collection: 'inquiries',
          where: { status: { equals: 'closed' } },
          select: { status: true, statusChangedAt: true },
          pagination: false,
          depth: 0,
          overrideAccess: true,
          req,
        })
        return docs
      },
      remove: async (ids) => {
        const { docs, errors } = await payload.delete({
          collection: 'inquiries',
          where: { id: { in: ids } },
          depth: 0,
          overrideAccess: true,
          req,
        })
        if (errors.length > 0) {
          payload.logger.error({ failed: errors.length }, 'Inquiry retention: some deletes failed')
        }
        return docs.length
      },
    })
    // The count only — no personal data in logs (ADR-003).
    payload.logger.info({ deleted: result.deleted }, 'Inquiry retention done')
    return { output: result }
  },
}

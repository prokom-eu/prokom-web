import type { TaskConfig } from 'payload'

import { checkVideos, switchOff, switchedOffMail, type CheckedRecord } from './videoCheck'

/** A hung YouTube answer must not hold the job runner. */
const OEMBED_TIMEOUT_MS = 10_000

async function fetchStatus(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(OEMBED_TIMEOUT_MS),
    })
    return response.status
  } catch {
    return null
  }
}

/**
 * Weekly film check (ADR-016), run by the in-process job runner (`jobs.autoRun`, ADR-011):
 * films of products (`Products.videos`). Unavailable → `active = false` and one mail to the
 * administrators; a product with an unpublished draft only in the mail (switched off by hand).
 * The page cache picks the change up within its TTL — a job runs outside a request, where
 * nothing can be revalidated.
 */
export const videoAvailabilityTask: TaskConfig<'videoAvailability'> = {
  slug: 'videoAvailability',
  label: 'Sprawdzanie filmów YouTube (oEmbed)',
  schedule: [{ cron: '0 4 * * 1', queue: 'default' }],
  outputSchema: [
    { name: 'checked', type: 'number', required: true },
    { name: 'switchedOff', type: 'number', required: true },
    { name: 'manual', type: 'number', required: true },
    { name: 'unknown', type: 'number', required: true },
  ],
  handler: async ({ req }) => {
    const { payload } = req
    const local = { overrideAccess: true, depth: 0, req } as const

    // Records with films; whether a film is active is `checkVideos`' business (null = active).
    const { docs: products } = await payload.find({
      collection: 'products',
      where: { 'videos.youtubeId': { exists: true } },
      select: { videos: true },
      pagination: false,
      ...local,
    })

    const result = await checkVideos(
      products.flatMap((product) => product.videos ?? []),
      fetchStatus,
    )

    // Checking takes minutes: each record is read again right before it is written, so an
    // edit made in the panel meanwhile is not overwritten.
    const report: CheckedRecord[] = []
    const affected = (product: (typeof products)[number]) =>
      (product.videos ?? []).some((video) => result.unavailable.has(video.youtubeId))
    for (const { id } of products.filter(affected)) {
      const product = await payload.findByID({ collection: 'products', id, ...local })
      const { videos, switched } = switchOff(product.videos ?? [], result.unavailable)
      if (switched.length === 0) continue
      const where = `Produkt „${product.name}”`
      // Saving a draft does not touch the main record: writing it would bury the newer draft
      // (or, for a never-published card, its content). Such a product is left to the panel.
      const { docs: latest } = await payload.findVersions({
        collection: 'products',
        where: { and: [{ parent: { equals: id } }, { latest: { equals: true } }] },
        limit: 1,
        ...local,
      })
      if (latest[0]?.version._status === 'draft') {
        report.push({ where, films: switched, manual: true })
        continue
      }
      await payload.update({ collection: 'products', id, data: { videos }, ...local })
      report.push({ where, films: switched })
    }

    const switchedOff = report
      .filter((record) => !record.manual)
      .reduce((sum, record) => sum + record.films.length, 0)
    if (report.length > 0) {
      const { docs: admins } = await payload.find({
        collection: 'users',
        where: { role: { equals: 'admin' } },
        select: { email: true },
        pagination: false,
        ...local,
      })
      const to = admins.map((admin) => admin.email).filter(Boolean)
      if (to.length > 0) {
        try {
          await payload.sendEmail({ to, ...switchedOffMail(report) })
        } catch (error) {
          // The films are off already; the next run does not repeat the mail for them.
          // Not the error object: a mailer error may carry the recipients' addresses.
          const code = (error as { code?: unknown }).code
          payload.logger.error(
            { error: error instanceof Error ? error.name : 'unknown', code },
            'Video check: mail to the administrators failed',
          )
        }
      } else {
        payload.logger.warn('Video check: no administrator to notify')
      }
    }

    // Counts only (ADR-003 style logs).
    const output = {
      checked: result.checked,
      switchedOff,
      manual: report.filter((record) => record.manual).length,
      unknown: result.unknown,
    }
    payload.logger.info(output, 'Video check done')
    return { output }
  },
}

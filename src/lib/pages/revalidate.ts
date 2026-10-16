import { revalidateTag } from 'next/cache'
import type { Payload } from 'payload'

/**
 * Marks cached pages as stale right away (`expire: 0`: the next visit renders fresh content).
 *
 * Outside a Next.js request — `pnpm seed`, migrations, a scheduled publish run by the jobs
 * cron — Next has no cache store and `revalidateTag` throws. That is not an error for us:
 * the page cache also expires on its own after `PAGE_CACHE_SECONDS` (see `data.ts`).
 */
export function revalidatePageTags(tags: string[], payload: Payload): void {
  try {
    for (const tag of tags) revalidateTag(tag, { expire: 0 })
  } catch {
    payload.logger.info({ tags }, 'Page cache not revalidated outside a request; TTL applies.')
  }
}

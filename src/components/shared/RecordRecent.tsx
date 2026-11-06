'use client'

import { useEffect } from 'react'

import { recordRecent, type RecentItem } from '@/lib/shared/recent'

type Props = {
  /** `CompanyData.recentlyViewed` — the component writes nothing while it is off. */
  enabled: boolean
  line: string
  item: Omit<RecentItem, 'at'>
}

/**
 * Records the open page in „Ostatnio oglądane” of the search (spec §5.1 dodatek 6). Pages of the
 * lines (product, solution, service, object) render it with their title — D3 adds no storage code
 * of its own, so the flag is checked in one place. Renders nothing.
 */
export function RecordRecent({ enabled, line, item }: Props) {
  const { title, href, kind } = item
  useEffect(() => {
    recordRecent(enabled, line, { title, href, kind })
  }, [enabled, line, title, href, kind])
  return null
}

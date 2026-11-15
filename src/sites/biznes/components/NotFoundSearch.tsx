'use client'

import { Icon } from '@/components/ui/Icon'
import { requestSearch } from '@/lib/site/searchOpen'

/** „Szukaj w ofercie” of the 404 page: the same overlay as Ctrl K and the bottom bar's „Szukaj”. */
export function NotFoundSearch() {
  return (
    <button
      type="button"
      onClick={() => requestSearch()}
      className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent-text px-6 font-extrabold text-accent-ink"
    >
      <Icon name="search" className="size-5" strokeWidth={2.2} />
      Szukaj w ofercie
    </button>
  )
}

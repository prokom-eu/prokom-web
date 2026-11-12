'use client'

import type { ReactNode } from 'react'

import { requestSearch } from '@/lib/site/searchOpen'

/**
 * Opens the line's search window (`SearchDialog` listens to `requestSearch`) from a server page:
 * the site map „Wyszukiwarka” and the 404 search field (ZMIANY-v24 §9.6–9.7).
 */
export function SearchTrigger({
  className,
  children,
  label,
}: {
  className?: string
  children: ReactNode
  /** Accessible name when the visible text is not enough (a placeholder-like field). */
  label?: string
}) {
  return (
    <button type="button" className={className} aria-label={label} onClick={() => requestSearch()}>
      {children}
    </button>
  )
}

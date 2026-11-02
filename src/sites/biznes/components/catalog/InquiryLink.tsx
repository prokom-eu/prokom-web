'use client'

import type { ReactNode } from 'react'

import { INQUIRY_PAGE_PATH } from '@/lib/biznes/mobileNav'
import { openCartDrawer } from '@/lib/cart/store'

/**
 * A link to `/zapytanie` that opens the inquiry drawer instead — so it works without JavaScript
 * and in a new tab (modifier or middle button keep the link).
 */
export function InquiryLink({ className, children }: { className: string; children: ReactNode }) {
  return (
    <a
      href={INQUIRY_PAGE_PATH}
      aria-haspopup="dialog"
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return
        }
        event.preventDefault()
        openCartDrawer()
      }}
      className={className}
    >
      {children}
    </a>
  )
}

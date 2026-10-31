'use client'

import type { ReactNode } from 'react'

import { openCartDrawer } from '@/lib/cart/store'

/** „Zapytaj o wycenę” of the quick start: opens the inquiry drawer (K36 §11). */
export function AskQuoteTile({ className, children }: { className: string; children: ReactNode }) {
  return (
    <button type="button" aria-haspopup="dialog" onClick={openCartDrawer} className={className}>
      {children}
    </button>
  )
}

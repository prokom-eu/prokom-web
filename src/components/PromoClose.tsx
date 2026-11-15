'use client'

import { PROMO_CLOSED_ATTRIBUTE, PROMO_CLOSED_KEY } from '@/lib/site/promo'

/**
 * Closes the promo bar and remembers it for this campaign (`pk-sz-closed`). The bar is hidden
 * through the attribute on `<html>`, the same way the inline script does it on later pages.
 */
export function PromoClose({ campaignId }: { campaignId: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        try {
          localStorage.setItem(PROMO_CLOSED_KEY, campaignId)
        } catch {
          // Storage blocked (private mode): the bar is closed for this page only.
        }
        document.documentElement.setAttribute(PROMO_CLOSED_ATTRIBUTE, '')
        document.getElementById('tresc')?.focus()
      }}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-white/15 focus-visible:outline-accent-ink"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6L6 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">Zamknij pasek promocji</span>
    </button>
  )
}

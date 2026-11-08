'use client'

import { Icon } from '@/components/ui/Icon'
import { requestSearch } from '@/lib/site/searchOpen'

/**
 * „Szukaj w ofercie” at the top of the menu sheet: on a phone the shared capsule has no room for
 * the loupe (logo, „Zapytanie”, Menu), and the catalog search is the core of Biznes. The sheet
 * closes first — the search window opens only when no other dialog is open.
 */
export function SheetSearch() {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(event) => {
        event.currentTarget.closest('dialog')?.close()
        window.setTimeout(() => requestSearch(), 0)
      }}
      className="flex min-h-12 w-full items-center gap-3 rounded-2xl bg-surface-2 px-4 text-left font-bold text-ink-2 shadow-[inset_0_0_0_1px_var(--border)]"
    >
      <Icon name="search" className="size-[18px]" />
      Szukaj w ofercie
    </button>
  )
}

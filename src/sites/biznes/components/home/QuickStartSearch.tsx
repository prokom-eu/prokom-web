'use client'

import { requestSearch } from '@/lib/site/searchOpen'

import { SearchIcon } from '../SearchIcon'

/**
 * The search field of „Od czego zaczynasz” (runda 1411, board `Start.dc.html`): opens the site's
 * existing search window (the one of Ctrl K), never a search of its own.
 */
export function QuickStartSearch() {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => requestSearch()}
      className="flex min-h-11 w-full items-center gap-2.5 rounded-xl bg-white/8 px-3.5 text-left text-[13.5px] text-white/80 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_16%,transparent)] transition-colors hover:bg-white/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      data-quick-search
    >
      <SearchIcon size={18} />
      <span className="flex-1">Szukaj: kasa, laptop, KSeF…</span>
      <kbd className="rounded-md bg-white/14 px-1.5 py-0.5 font-sans text-[11px] font-extrabold text-white max-[1079px]:hidden">
        Ctrl K
      </kbd>
    </button>
  )
}

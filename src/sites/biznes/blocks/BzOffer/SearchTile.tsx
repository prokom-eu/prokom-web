'use client'

import { useId } from 'react'

import { Icon } from '@/components/ui/Icon'
import { requestSearch } from '@/lib/site/searchOpen'

type Props = {
  eyebrow: string | null
  heading: string
  /** „Szukaj w 427 pozycjach”. */
  searchLabel: string
  /** `BiznesSettings.search.popular`: each phrase opens the search with it typed. */
  popular: string[]
}

/**
 * Sixth tile of the departments (board `#s4-dz`, „Nie wiesz, w którym dziale szukać?”, texts from
 * the block): the site search (same overlay as Ctrl K) and popular phrases. No shortcuts to the
 * plan, bundles or the whole offer — „Szybki start” is the one hub of the page (plan 0611 §7.1).
 */
export function SearchTile({ eyebrow, heading, searchLabel, popular }: Props) {
  const headingId = useId()
  return (
    <article
      data-surface="dark"
      aria-labelledby={headingId}
      className="flex flex-col rounded-[26px] bg-linear-160 from-surface-dark to-[color-mix(in_srgb,var(--accent)_35%,var(--surface-dark))] p-6 text-white"
    >
      {eyebrow && (
        <p className="text-[12px] font-extrabold tracking-[0.1em] text-accent-on-dark uppercase">
          {eyebrow}
        </p>
      )}
      <h3
        id={headingId}
        className="mt-2 font-display text-[clamp(1.35rem,1.8vw,1.6rem)] leading-tight font-extrabold text-balance text-white"
      >
        {heading}
      </h3>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K /"
        onClick={() => requestSearch()}
        className="mt-5 flex min-h-12 w-full items-center gap-2.5 rounded-2xl bg-white px-4 text-left text-[15px] font-semibold text-surface-dark shadow-[0_16px_30px_-18px_var(--glow)]"
      >
        <Icon name="search" className="size-[18px] shrink-0" />
        <span className="flex-1">{searchLabel}</span>
        <kbd className="rounded-md max-[1079px]:hidden bg-[color-mix(in_srgb,var(--surface-dark)_8%,transparent)] px-1.5 py-0.5 font-sans text-xs font-bold">
          Ctrl K
        </kbd>
      </button>
      {popular.length > 0 && (
        <ul aria-label="Najczęściej szukane" className="mt-4 flex flex-wrap gap-2">
          {popular.map((phrase) => (
            <li key={phrase}>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => requestSearch(phrase)}
                className="inline-flex min-h-9 items-center rounded-full bg-white/10 px-3 text-[13px] font-bold text-white shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_14%,transparent)] transition-colors hover:bg-white/20"
              >
                {phrase}
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

'use client'

import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import { requestSearch } from '@/lib/site/searchOpen'

type Shortcut = { label: string; note: string; href: string; icon: IconName }

type Props = {
  /** „Szukaj w 427 pozycjach”. */
  searchLabel: string
  /** `BiznesSettings.search.popular`: each phrase opens the search with it typed. */
  popular: string[]
  shortcuts: Shortcut[]
}

/**
 * Sixth tile of the departments (board `#s4-dz`, „Nie wiesz, w którym dziale szukać?”): the site
 * search (same overlay as Ctrl K), popular phrases and three shortcuts.
 */
export function SearchTile({ searchLabel, popular, shortcuts }: Props) {
  return (
    <article
      data-surface="dark"
      aria-labelledby="dzial-szukaj-h"
      className="flex flex-col rounded-[26px] bg-linear-160 from-surface-dark to-[color-mix(in_srgb,var(--accent)_35%,var(--surface-dark))] p-6 text-white"
    >
      <p className="text-[12px] font-extrabold tracking-[0.1em] text-accent-on-dark uppercase">
        Nie wiesz, w którym dziale szukać?
      </p>
      <h3
        id="dzial-szukaj-h"
        className="mt-2 font-display text-[clamp(1.35rem,1.8vw,1.6rem)] leading-tight font-extrabold text-balance text-white"
      >
        Wpisz, czego potrzebujesz — znajdziemy to za&nbsp;Ciebie.
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
      <ul className="mt-auto flex flex-col gap-2 pt-5">
        {shortcuts.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-3 rounded-2xl bg-white/5 p-2.5 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_10%,transparent)] transition-colors hover:bg-white/10"
            >
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10"
              >
                <Icon name={item.icon} className="size-[18px]" />
              </span>
              <span className="flex flex-col">
                <span className="text-[14px] font-extrabold text-white">{item.label}</span>
                <span className="text-[12.5px] text-white/70">{item.note}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}

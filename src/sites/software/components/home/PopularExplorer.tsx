'use client'

import { type KeyboardEvent, useId, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { plural } from '@/lib/plural'
import type { OfferView } from '@/lib/software/offer'
import { type PopularTab, visibleCards } from '@/lib/software/popular'
import type { IndexSolution } from '@/lib/software/solutionsIndex'
import type { PriceDisplay } from '@/lib/software/wizard'

import { SolutionCard } from '../catalog/SolutionCard'
import { SolutionDialog } from '../offer/SolutionDialog'
import { SlidingPill } from '../SlidingPill'

type Props = {
  cards: IndexSolution[]
  tabs: PopularTab[]
  display: PriceDisplay
  /** Offer windows of the published solutions by slug (`getOfferViews`). */
  offers: Readonly<Record<string, OfferView>>
  /** [1, 2–4, 5+] with `{n}`, then the hint („kliknij kartę, żeby zobaczyć szczegóły”). */
  count: readonly [string, string, string]
  hint: string
}

const KEYS: Record<string, (index: number, count: number) => number> = {
  ArrowRight: (i, n) => (i + 1) % n,
  ArrowLeft: (i, n) => (i - 1 + n) % n,
  Home: () => 0,
  End: (_, n) => n - 1,
}

/**
 * „12 rzeczy” (spec. §4 pkt 4, v22): filter tabs with counts (ARIA tabs over one list) and the
 * catalog cards with a thumbnail; a card opens the offer window (←/→ along the visible cards,
 * „n / 12”) — on the start page without a change of the address (decyzja 1). From 640 px a grid
 * (4 columns from 1081 px); on a phone a carousel of cards 84% wide, the next one peeking in.
 */
export function PopularExplorer({ cards, tabs, display, offers, count, hint }: Props) {
  const id = useId()
  const [tab, setTab] = useState(tabs[0]?.key ?? 'all')
  const [open, setOpen] = useState<string | null>(null)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const tablist = useRef<HTMLDivElement>(null)
  const shown = visibleCards(cards, tab)
  // Only cards with a window: a solution without one (cannot happen with the seed) has no ←/→ stop.
  const list = shown.map((card) => card.slug).filter((slug) => offers[slug])
  const active = Math.max(
    0,
    tabs.findIndex((item) => item.key === tab),
  )

  function choose(index: number) {
    const next = tabs[index]
    if (next) setTab(next.key)
  }

  function onKeyDown(event: KeyboardEvent) {
    const move = KEYS[event.key]
    if (!move) return
    event.preventDefault()
    const next = move(active, tabs.length)
    choose(next)
    buttons.current[next]?.focus()
  }

  const [one, few, many] = count
  const countText = plural(shown.length, [one, few, many]).replace('{n}', String(shown.length))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
        <div
          ref={tablist}
          role="tablist"
          aria-label="Rodzaj"
          onKeyDown={onKeyDown}
          className="group/pills relative -mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] min-[640px]:mx-0 min-[640px]:w-fit min-[640px]:rounded-2xl min-[640px]:border min-[640px]:border-border min-[640px]:bg-card min-[640px]:p-1.5"
        >
          <SlidingPill container={tablist} active={active} className="bg-button" />
          {tabs.map((item, i) => {
            const selected = i === active
            return (
              <button
                key={item.key}
                ref={(element) => {
                  buttons.current[i] = element
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${item.key}`}
                aria-selected={selected}
                aria-controls={`${id}-list`}
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(i)}
                className={cx(
                  'relative z-[1] inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-[15px] font-extrabold transition-colors',
                  // The pill (`SlidingPill`) is the background of the chosen tab; until it is
                  // drawn (or without JavaScript) the tab keeps a background of its own.
                  selected
                    ? 'bg-button text-accent-ink group-has-[[data-sliding-pill]]/pills:bg-transparent'
                    : 'border border-border bg-card text-ink hover:bg-surface-2 min-[640px]:border-0 min-[640px]:bg-transparent',
                )}
              >
                {item.label}
                <span
                  className={cx(
                    'rounded-full px-1.5 py-0.5 text-[11px]',
                    selected ? 'ring-1 ring-current/40' : 'bg-surface-2 text-ink-2',
                  )}
                >
                  {item.count}
                </span>
              </button>
            )
          })}
        </div>
        <p aria-live="polite" className="text-sm font-bold text-ink-2">
          {countText} · {hint}
        </p>
      </div>

      <div id={`${id}-list`} role="tabpanel" aria-labelledby={`${id}-tab-${tab}`}>
        <ul
          data-reveal-cards
          className="-mx-4 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] min-[640px]:mx-0 min-[640px]:grid min-[640px]:items-stretch min-[640px]:grid-cols-2 min-[640px]:gap-4 min-[640px]:overflow-visible min-[640px]:px-0 min-[640px]:pb-0 min-[1081px]:grid-cols-4"
        >
          {shown.map((card, i) => (
            <li
              key={card.slug}
              className="w-[84%] shrink-0 snap-start min-[640px]:w-auto"
              data-testid="popular-card"
            >
              <SolutionCard
                solution={card}
                display={display}
                eager={i < 4}
                onOpen={() => setOpen(card.slug)}
              />
            </li>
          ))}
        </ul>
      </div>

      <SolutionDialog
        views={offers}
        slug={open && offers[open] ? open : null}
        list={list}
        onSwitch={setOpen}
        onClose={() => setOpen(null)}
        closeOnBack
      />
    </div>
  )
}

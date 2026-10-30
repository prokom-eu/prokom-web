'use client'

import { type KeyboardEvent, useId, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { plural } from '@/lib/plural'
import { type PopularCard, type PopularTab, visibleCards } from '@/lib/software/popular'
import type { PriceDisplay } from '@/lib/software/wizard'

import { PopularSolutionCard } from './PopularSolutionCard'

type Props = {
  cards: PopularCard[]
  tabs: PopularTab[]
  display: PriceDisplay
  situationNames: Readonly<Record<string, string>>
  /** [1, 2–4, 5+] with `{n}`, then the hint („kliknij kartę, żeby rozwinąć”). */
  count: readonly [string, string, string]
  hint: string
}

const KEYS: Record<string, (index: number, count: number) => number> = {
  ArrowRight: (i, n) => (i + 1) % n,
  ArrowLeft: (i, n) => (i - 1 + n) % n,
  Home: () => 0,
  End: (_, n) => n - 1,
}

/** Link label of a generic card: it leads to the catalog filtered by its category. */
const GENERIC_LINK = 'Zobacz w ofercie'

/**
 * „12 rzeczy” (spec. §4 pkt 4): filter tabs with counts (ARIA tabs over one list) and the cards
 * of the catalog (SW9) — one expanded at a time. From 640 px a grid (4 columns from 1081 px);
 * on a phone a carousel of cards 84% wide, the next one peeking in.
 */
export function PopularExplorer({ cards, tabs, display, situationNames, count, hint }: Props) {
  const id = useId()
  const [tab, setTab] = useState(tabs[0]?.key ?? 'all')
  const [open, setOpen] = useState<string | null>(null)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const shown = visibleCards(cards, tab)
  const active = Math.max(
    0,
    tabs.findIndex((item) => item.key === tab),
  )

  function choose(index: number) {
    const next = tabs[index]
    if (!next) return
    setTab(next.key)
    setOpen(null)
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
          role="tablist"
          aria-label="Rodzaj"
          onKeyDown={onKeyDown}
          className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] min-[640px]:mx-0 min-[640px]:w-fit min-[640px]:rounded-2xl min-[640px]:border min-[640px]:border-border min-[640px]:bg-card min-[640px]:p-1.5"
        >
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
                  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-[15px] font-extrabold transition-colors',
                  selected
                    ? 'bg-button text-accent-ink'
                    : 'border border-border bg-card text-ink hover:bg-surface-2 min-[640px]:border-0',
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
        <ul className="-mx-4 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] min-[640px]:mx-0 min-[640px]:grid min-[640px]:grid-cols-2 min-[640px]:gap-4 min-[640px]:overflow-visible min-[640px]:px-0 min-[640px]:pb-0 min-[1081px]:grid-cols-4">
          {shown.map((card) => (
            <li
              key={card.solution.slug}
              className="w-[84%] shrink-0 snap-start min-[640px]:w-auto"
              data-testid="popular-card"
            >
              <PopularSolutionCard
                solution={card.solution}
                display={display}
                situationNames={situationNames}
                open={open === card.solution.slug}
                onToggle={() =>
                  setOpen((current) => (current === card.solution.slug ? null : card.solution.slug))
                }
                link={card.href ? { href: card.href, label: GENERIC_LINK } : undefined}
                variants={card.variants}
                className="max-[639px]:flex max-[639px]:flex-col"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

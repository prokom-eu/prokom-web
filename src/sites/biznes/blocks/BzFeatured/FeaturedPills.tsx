'use client'

import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

import { useRevealCards } from '@/components/motion/RevealObserver'
import { SlidingPill } from '@/components/motion/SlidingPill'
import { cx } from '@/components/ui/cx'

import { useSwap } from '../../components/motion/useSwap'

export type FeaturedPill = { value: string; label: string; count: number }

type Props = {
  pills: FeaturedPill[]
  /** Cards rendered on the server, each with the pill it belongs to (or none). */
  cards: { key: string; group: string | null; card: ReactNode }[]
}

const ALL = 'all'

/**
 * Pills of „O to firmy pytają najczęściej” (K35 7a): „Wszystkie 16” and the groups that have
 * cards. Plain buttons with `aria-pressed`; the list keeps its cards, the others are hidden.
 * R2: the chosen pill flows (`SlidingPill`), and after a change the shown cards rise in one by
 * one (`data-cascade`) — never on page load.
 */
export function FeaturedPills({ pills, cards }: Props) {
  const [picked, setPicked] = useState(ALL)
  const group = useRef<HTMLDivElement>(null)
  const changed = 'data-swap' in useSwap(picked)
  // P3: on the way down the cards rise in one by one; set only once hydrated (a lazy island).
  const revealCards = useRevealCards()
  let shown = 0
  const options = [{ value: ALL, label: 'Wszystkie', count: cards.length }, ...pills]
  return (
    <>
      <div
        ref={group}
        data-pill-list
        role="group"
        aria-label="Filtr najczęściej wybieranych"
        className="relative mt-8 flex flex-wrap gap-2 [scrollbar-width:none] max-md:-mx-4 max-md:mt-4 max-md:flex-nowrap max-md:overflow-x-auto max-md:px-4"
      >
        <SlidingPill container={group} active={picked} className="bg-accent-text" radius={9999} />
        {options.map((option) => {
          const on = option.value === picked
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(option.value)}
              className={cx(
                'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-bold whitespace-nowrap transition-colors max-md:text-[14px]',
                on
                  ? 'bg-accent-text text-accent-ink'
                  : 'bg-card text-ink-2 shadow-[inset_0_0_0_1px_var(--border)] hover:text-ink',
              )}
            >
              {option.label}
              <span className={cx('text-xs font-extrabold', on ? 'text-accent-ink' : 'text-ink-2')}>
                {option.count}
              </span>
            </button>
          )
        })}
      </div>
      {/* Phone strip (audit 0611 P0.6): `scroll-px-4` keeps the snapped first card 16 px from
          the edge, as in the other strips (MOBILE-APLIKACJA). */}
      <ul
        key={picked}
        {...revealCards}
        className="-mx-4 mt-6 flex max-md:mt-4 snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 min-[640px]:mx-0 min-[640px]:grid min-[640px]:grid-cols-2 min-[640px]:overflow-visible min-[640px]:px-0 min-[640px]:pb-0 min-[900px]:grid-cols-3 min-[1080px]:grid-cols-4"
      >
        {cards.map(({ key, group: cardGroup, card }) => {
          const hidden = picked !== ALL && cardGroup !== picked
          const position = hidden ? 0 : shown++
          return (
            <li
              key={key}
              hidden={hidden}
              data-cascade={changed && !hidden ? '' : undefined}
              style={changed ? ({ '--reveal-i': position } as CSSProperties) : undefined}
              className="flex w-[180px] shrink-0 snap-start min-[640px]:w-auto"
            >
              {card}
            </li>
          )
        })}
      </ul>
    </>
  )
}

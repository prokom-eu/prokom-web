'use client'

import { useState, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'

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
 */
export function FeaturedPills({ pills, cards }: Props) {
  const [picked, setPicked] = useState(ALL)
  const options = [{ value: ALL, label: 'Wszystkie', count: cards.length }, ...pills]
  return (
    <>
      <div
        role="group"
        aria-label="Filtr najczęściej wybieranych"
        className="mt-8 flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const on = option.value === picked
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(option.value)}
              className={cx(
                'inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] font-bold transition-colors',
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
      <ul className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 min-[640px]:mx-0 min-[640px]:grid min-[640px]:grid-cols-2 min-[640px]:overflow-visible min-[640px]:px-0 min-[640px]:pb-0 min-[900px]:grid-cols-3 min-[1080px]:grid-cols-4">
        {cards.map(({ key, group, card }) => (
          <li
            key={key}
            hidden={picked !== ALL && group !== picked}
            className="flex w-[78%] shrink-0 snap-start min-[640px]:w-auto"
          >
            {card}
          </li>
        ))}
      </ul>
    </>
  )
}

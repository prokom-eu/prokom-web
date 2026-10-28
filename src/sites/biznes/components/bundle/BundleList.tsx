'use client'

import { useState } from 'react'

import { cx } from '@/components/ui/cx'

import type { BundleCardData } from '@/lib/catalog/bundle'

import { BundleCard } from './BundleCard'

/**
 * `/zestawy` grid with the area chips (`Web-Zestawy-1440`, `App-Zestawy-390`): „Wszystkie N”,
 * then each area with its count; the chips scroll sideways on the phone. Toggle buttons
 * (`aria-pressed`), the grid announces nothing — the count in the chip says it.
 */
export function BundleList({
  bundles,
  areas,
}: {
  bundles: BundleCardData[]
  areas: { value: string; label: string }[]
}) {
  const [area, setArea] = useState<string | null>(null)
  const chips = [
    { value: null, label: 'Wszystkie', count: bundles.length },
    ...areas
      .map(({ value, label }) => ({
        value,
        label,
        count: bundles.filter((bundle) => bundle.area === value).length,
      }))
      .filter((chip) => chip.count > 0),
  ]
  const shown = area ? bundles.filter((bundle) => bundle.area === area) : bundles
  return (
    <div className="flex flex-col gap-6">
      <div
        role="group"
        aria-label="Obszar"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {chips.map((chip) => {
          const active = chip.value === area
          return (
            <button
              key={chip.label}
              type="button"
              aria-pressed={active}
              onClick={() => setArea(chip.value)}
              className={cx(
                'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-extrabold transition-colors',
                active
                  ? 'bg-ink text-surface'
                  : 'bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]',
              )}
            >
              {chip.label}
              <span className={cx('text-xs', active ? 'text-surface/70' : 'text-ink-3')}>
                {chip.count}
              </span>
            </button>
          )
        })}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {shown.map((bundle) => (
          <li key={bundle.slug}>
            <BundleCard bundle={bundle} headingLevel="h2" />
          </li>
        ))}
      </ul>
    </div>
  )
}

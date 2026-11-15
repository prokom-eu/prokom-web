'use client'

import { useId, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { filterBundleCards, type BundleCardData, type BundleFilter } from '@/lib/catalog/bundle'
import type { BundleArea } from '@/lib/catalog/options'
import { plural } from '@/lib/plural'

import { BundleTile } from './BundleTile'

const CHIP =
  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-extrabold transition-colors'
const chipState = (active: boolean) =>
  active
    ? 'bg-ink text-surface'
    : 'bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]'

/**
 * `/zestawy` (BIZ-3 §9.2, `Web-Zestawy-1440`, `App-Zestawy-390`): „Gotowe” bundles only, area
 * chips with their count, then industry (list) and size (Mały / Średni / Duży). Toggle buttons
 * (`aria-pressed`); the result count is announced politely. Every tile can put the bundle on the
 * inquiry list without leaving the page.
 */
export function BundleList({
  bundles,
  areas,
  industries,
  sizes,
}: {
  bundles: BundleCardData[]
  areas: { value: BundleArea; label: string }[]
  industries: { slug: string; name: string }[]
  sizes: string[]
}) {
  const [filter, setFilter] = useState<BundleFilter>({ area: null, industry: null, size: null })
  const industryId = useId()
  const set = (change: Partial<BundleFilter>) => setFilter((before) => ({ ...before, ...change }))
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
  const shown = filterBundleCards(bundles, filter)
  const filtered = filter.industry !== null || filter.size !== null
  return (
    <div className="flex flex-col gap-6 max-md:gap-4">
      <div
        role="group"
        aria-label="Obszar"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            aria-pressed={chip.value === filter.area}
            onClick={() => set({ area: chip.value })}
            className={cx(CHIP, chipState(chip.value === filter.area))}
          >
            {chip.label}
            <span
              className={cx(
                'text-xs',
                chip.value === filter.area ? 'text-surface/70' : 'text-ink-3',
              )}
            >
              {chip.count}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {industries.length > 1 && (
          <div className="flex min-w-0 items-center gap-3">
            <label htmlFor={industryId} className="text-sm font-extrabold text-ink">
              Branża
            </label>
            <select
              id={industryId}
              value={filter.industry ?? ''}
              onChange={(event) => set({ industry: event.target.value || null })}
              className="min-h-11 max-w-full min-w-0 rounded-xl bg-card px-3 text-sm font-bold text-ink shadow-[inset_0_0_0_1.5px_var(--border)]"
            >
              <option value="">Wszystkie branże</option>
              {industries.map((industry) => (
                <option key={industry.slug} value={industry.slug}>
                  {industry.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {sizes.length > 1 && (
          <div
            role="group"
            aria-label="Wielkość firmy"
            className="-mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:w-auto sm:flex-wrap sm:px-0"
          >
            {[null, ...sizes].map((size) => (
              <button
                key={size ?? 'all'}
                type="button"
                aria-pressed={size === filter.size}
                onClick={() => set({ size })}
                className={cx(CHIP, 'min-h-10', chipState(size === filter.size))}
              >
                {size ?? 'Każda wielkość'}
              </button>
            ))}
          </div>
        )}
      </div>
      <p aria-live="polite" className="text-sm text-ink-2">
        {shown.length} {plural(shown.length, ['zestaw', 'zestawy', 'zestawów'])}
        {filtered && shown.length < bundles.length ? ' po filtrach' : ''}
      </p>
      {shown.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {shown.map((bundle) => (
            <li key={bundle.slug} className="min-w-0">
              <BundleTile bundle={bundle} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-[22px] bg-surface-2 p-6">
          <p className="leading-relaxed text-ink-2">
            Nie mamy jeszcze gotowego zestawu z tymi filtrami. Dobierzemy go pod Twoją firmę.
          </p>
          <button
            type="button"
            onClick={() => setFilter({ area: null, industry: null, size: null })}
            className="inline-flex min-h-11 items-center font-extrabold text-accent-text hover:underline"
          >
            Pokaż wszystkie zestawy
          </button>
        </div>
      )}
    </div>
  )
}

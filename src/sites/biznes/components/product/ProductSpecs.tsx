'use client'

import { useState } from 'react'

import { cx } from '@/components/ui/cx'
import { plural } from '@/lib/plural'

import { ProductSection } from './ProductSection'

/** Rows a phone shows before „Pokaż wszystkie” (MOBILE-APLIKACJA §3, Produkt). */
const PHONE_ROWS = 6

/**
 * „Pełne parametry” (K31-ZMIANY §4 pkt 7): label and value in two columns on a desktop; on a
 * phone the first 6 rows and „Pokaż wszystkie”.
 */
export function ProductSpecs({
  id,
  rows,
}: {
  id: string
  rows: { label: string; value: string }[]
}) {
  const [all, setAll] = useState(false)
  if (rows.length === 0) return null
  return (
    <ProductSection
      id={id}
      eyebrow="Specyfikacja"
      heading="Pełne parametry"
      aside={`${rows.length} ${plural(rows.length, ['parametr', 'parametry', 'parametrów'])}`}
    >
      <dl className="grid gap-x-10 md:grid-cols-2">
        {rows.map((row, position) => (
          <div
            key={`${row.label}-${position}`}
            className={cx(
              'grid grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] gap-4 border-b border-border py-4 sm:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)]',
              !all && position >= PHONE_ROWS && 'max-md:hidden',
            )}
          >
            <dt className="text-sm font-bold text-ink-2">{row.label}</dt>
            <dd className="text-[0.95rem] leading-relaxed text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
      {rows.length > PHONE_ROWS && !all && (
        <button
          type="button"
          onClick={() => setAll(true)}
          className="inline-flex min-h-12 items-center justify-center self-start rounded-2xl bg-card px-5 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] md:hidden"
        >
          Pokaż wszystkie ({rows.length})
        </button>
      )}
    </ProductSection>
  )
}

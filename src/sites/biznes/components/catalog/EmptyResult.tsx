import Link from 'next/link'

import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'
import { productHref } from '@/lib/catalog/card'

import { AddToCartButton } from '../AddToCartButton'
import { ProductThumb, productSubtitle } from '../ProductThumb'
import { SearchIcon } from '../SearchIcon'

type Props = {
  query: string
  suggestions: IndexProduct[]
  index: CatalogIndex
  onClear: () => void
}

/**
 * No positions for the view (spec. §5.3, board `Katalog`): with a phrase — we may still have
 * it, ask about it; with filters only — clear them. „Może chodziło o” offers three products.
 * No call-back time here: that promise is a panel field ([SZEF]).
 */
export function EmptyResult({ query, suggestions, index, onClear }: Props) {
  return (
    <div className="grid gap-6 rounded-3xl bg-surface-2 p-6 sm:p-9 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
      <div className="flex flex-col gap-3">
        <span
          aria-hidden="true"
          className="flex size-16 items-center justify-center rounded-[20px] bg-card text-accent-text shadow-[0_18px_40px_-24px_var(--glow)]"
        >
          <SearchIcon size={30} />
        </span>
        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-ink-2">
          Brak wyników
        </p>
        <h3 className="font-display text-xl font-extrabold leading-tight sm:text-2xl">
          {query
            ? `Nie mamy „${query}” w katalogu. Ale to nie znaczy, że tego nie załatwimy.`
            : 'Żadna pozycja nie spełnia wszystkich filtrów naraz.'}
        </h3>
        <p className="leading-relaxed text-ink-2">
          Katalog to najczęściej wybierane pozycje. Pracujemy z dystrybutorami — napisz, czego
          szukasz, a sprawdzimy dostępność i oddzwonimy.
        </p>
        <div className="mt-1 flex flex-wrap gap-2.5">
          {query && (
            <Link
              href={`/zapytanie?fraza=${encodeURIComponent(query)}`}
              className="inline-flex min-h-11 items-center rounded-xl bg-accent-text px-5 font-bold text-accent-ink hover:bg-ink hover:text-surface"
            >
              Zapytaj o „{query}”
            </Link>
          )}
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center rounded-xl border-2 border-accent-text px-5 font-bold text-accent-text hover:bg-card"
          >
            Wyczyść filtry
          </button>
        </div>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-ink-2">
            Może chodziło o:
          </p>
          <ul className="flex flex-col gap-2">
            {suggestions.map((product) => (
              <li
                key={product.slug}
                className="flex items-center gap-3 rounded-2xl bg-card p-2.5 pr-3"
              >
                <ProductThumb product={product} index={index} />
                <Link href={productHref(product.slug)} className="min-w-0 flex-1 hover:underline">
                  <b className="block truncate font-bold text-ink">{product.name}</b>
                  <small className="block truncate text-[0.8rem] text-ink-3">
                    {productSubtitle(product, index)}
                  </small>
                </Link>
                <AddToCartButton slug={product.slug} name={product.name} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

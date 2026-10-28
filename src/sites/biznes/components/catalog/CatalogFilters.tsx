'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useId, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { brandPageHref } from '@/lib/catalog/brand'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import {
  KINDS,
  OWN_BRAND_SLUG,
  type CatalogFacets,
  type CatalogKind,
  type CatalogState,
} from '@/lib/catalog/filters'

/** Brands shown before „Pokaż wszystkie marki” (as in the design). */
const BRANDS_FIRST = 12

type Props = {
  index: CatalogIndex
  state: CatalogState
  facets: CatalogFacets
  onChange: (change: Partial<CatalogState>) => void
  onClear: () => void
  activeCount: number
  /** The „Filtry” heading; the phone sheet has its own title. */
  heading?: boolean
}

const LEGEND = 'mb-2 text-xs font-extrabold uppercase tracking-[0.08em] text-ink-3'
const ROW =
  'flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1 -mx-2 text-[0.95rem] font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink has-checked:text-ink'
const COUNT = 'ml-auto text-xs font-extrabold text-ink-3'
/**
 * A filter that would show nothing: dimmed but clickable (spec. §5.2). Dimmed with the third
 * ink (4.5:1 on the surface and cards, `themes.test.ts`) — opacity would break the contrast.
 */
const ZERO = 'text-ink-3 has-checked:text-ink-3'
/** Brand tiles are white in both themes: the logo is dimmed, the text keeps its colour. */
const ZERO_BRAND = '[&_img]:opacity-40 [&_img]:grayscale'
const SECTION = 'border-t border-border pb-2.5 pt-3.5'

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

/** Filters of the catalog (spec. §5.2): native radios and checkboxes, counts per facet. */
export function CatalogFilters({
  index,
  state,
  facets,
  onChange,
  onClear,
  activeCount,
  heading = true,
}: Props) {
  const id = useId()
  const [allBrands, setAllBrands] = useState(false)

  const groups = index.groups.filter((group) => !state.group || group.slug === state.group)
  // Like empty categories (ADR-012, rozstrzygnięcie 7): an industry without products is left out.
  const industries = index.industries.filter((industry) =>
    index.products.some((product) => product.industries.includes(industry.slug)),
  )
  const brandCounts = new Map<string, number>()
  for (const product of index.products) {
    if (product.brand) brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + 1)
  }
  const brands = index.brands
    .filter((brand) => brand.slug !== OWN_BRAND_SLUG)
    .sort(
      (a, b) =>
        (brandCounts.get(b.slug) ?? 0) - (brandCounts.get(a.slug) ?? 0) ||
        a.name.localeCompare(b.name, 'pl'),
    )
  // One brand chosen → „Zobacz markę” to its page (K3-KATALOG §6), when it has one.
  const chosenBrand =
    state.brands.length === 1 ? index.brands.find((b) => b.slug === state.brands[0]) : undefined
  const chosenBrandHref = chosenBrand ? brandPageHref(index, chosenBrand.slug) : null
  const shownBrands = allBrands
    ? brands
    : [
        ...brands.slice(0, BRANDS_FIRST),
        ...brands.slice(BRANDS_FIRST).filter((brand) => state.brands.includes(brand.slug)),
      ]

  const kinds: { value: CatalogKind | null; label: string }[] = [
    { value: null, label: 'Wszystko' },
    ...KINDS,
  ]

  return (
    <div className="flex flex-col">
      <div className="flex min-h-9 items-center justify-between gap-3 pb-3">
        {heading ? <h2 className="font-display text-lg font-extrabold">Filtry</h2> : <span />}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="min-h-9 text-sm font-extrabold text-accent-text hover:underline"
          >
            Wyczyść ({activeCount})
          </button>
        )}
      </div>

      <div className={SECTION}>
        <fieldset>
          <legend className={LEGEND}>Rodzaj</legend>
          {kinds.map((kind) => {
            const count = facets.kinds[kind.value ?? 'all']
            return (
              <label key={kind.label} className={cx(ROW, count === 0 && ZERO)}>
                <input
                  type="radio"
                  name={`${id}-kind`}
                  checked={state.kind === kind.value}
                  onChange={() => onChange({ kind: kind.value })}
                  className="size-[18px] shrink-0 accent-accent-text"
                />
                {kind.label}
                <span className={COUNT}>{count}</span>
              </label>
            )
          })}
        </fieldset>
      </div>

      <div className={SECTION}>
        <fieldset>
          <legend className={LEGEND}>Kategoria</legend>
          {groups.map((group) => (
            <div key={group.slug} className="mb-1.5">
              <p className="mb-0.5 mt-1 text-[0.82rem] font-extrabold text-ink">{group.name}</p>
              {index.categories
                .filter((category) => category.group === group.slug)
                .map((category) => {
                  const count = facets.categories[category.slug] ?? 0
                  const on = state.categories.includes(category.slug)
                  return (
                    <label key={category.slug} className={cx(ROW, count === 0 && !on && ZERO)}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() =>
                          onChange({ categories: toggle(state.categories, category.slug) })
                        }
                        className="size-[18px] shrink-0 accent-accent-text"
                      />
                      {category.name}
                      <span className={COUNT}>{count}</span>
                    </label>
                  )
                })}
            </div>
          ))}
        </fieldset>
      </div>

      <div className={SECTION}>
        <fieldset>
          <legend className={LEGEND}>Marka</legend>
          <div className="grid grid-cols-3 gap-1.5">
            {shownBrands.map((brand) => {
              const count = facets.brands[brand.slug] ?? 0
              const on = state.brands.includes(brand.slug)
              return (
                <label
                  key={brand.slug}
                  title={brand.name}
                  className={cx(
                    'relative flex h-12 cursor-pointer items-center justify-center rounded-xl bg-white p-1.5 shadow-[inset_0_0_0_1.5px_var(--border)] has-checked:shadow-[inset_0_0_0_2px_var(--accent-text)] has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-text',
                    count === 0 && !on && ZERO_BRAND,
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => onChange({ brands: toggle(state.brands, brand.slug) })}
                    className="sr-only"
                  />
                  {brand.logo ? (
                    <Image
                      src={brand.logo.url}
                      alt={brand.name}
                      width={brand.logo.width}
                      height={brand.logo.height}
                      unoptimized
                      className="h-auto max-h-[22px] w-auto max-w-full object-contain"
                    />
                  ) : (
                    // Fixed dark text: the tile is white in both themes, like the logos.
                    <span className="text-center text-[0.7rem] font-black uppercase leading-tight text-surface-dark">
                      {brand.name}
                    </span>
                  )}
                  <span className="absolute right-1 top-0.5 text-[0.62rem] font-black text-surface-dark">
                    {count}
                  </span>
                </label>
              )
            })}
          </div>
          {brands.length > BRANDS_FIRST && (
            <button
              type="button"
              aria-expanded={allBrands}
              onClick={() => setAllBrands((value) => !value)}
              className="mt-2 min-h-9 text-sm font-extrabold text-accent-text hover:underline"
            >
              {allBrands ? 'Pokaż mniej' : `Pokaż wszystkie marki (${brands.length})`}
            </button>
          )}
          {chosenBrand && chosenBrandHref && (
            <Link
              href={chosenBrandHref}
              className="mt-2 flex min-h-9 items-center text-sm font-extrabold text-accent-text hover:underline"
            >
              Zobacz markę {chosenBrand.name} →
            </Link>
          )}
        </fieldset>
      </div>

      <div className={SECTION}>
        <fieldset>
          <legend className={LEGEND}>Branża</legend>
          <div className="flex flex-wrap gap-1.5">
            {industries.map((industry) => {
              const count = facets.industries[industry.slug] ?? 0
              const on = state.industries.includes(industry.slug)
              return (
                <label
                  key={industry.slug}
                  className={cx(
                    'inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-bold has-checked:bg-accent-text has-checked:text-accent-ink has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-text',
                    // Dimmed on a card, not on surface-2: the third ink is too light there.
                    count === 0 && !on
                      ? 'bg-card text-ink-3 shadow-[inset_0_0_0_1px_var(--border)]'
                      : 'bg-surface-2 text-ink-2',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() =>
                      onChange({ industries: toggle(state.industries, industry.slug) })
                    }
                    className="sr-only"
                  />
                  {industry.name}
                  <span className="sr-only">({count})</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      </div>

      <div className={SECTION}>
        {(
          [
            { key: 'isNew', label: 'Tylko nowości', count: facets.isNew },
            { key: 'authorized', label: 'Autoryzacja PRO-KOM', count: facets.authorized },
          ] as const
        ).map((item) => (
          <label
            key={item.key}
            className={cx(
              'flex min-h-11 cursor-pointer items-center justify-between gap-3 text-[0.95rem] font-bold text-ink-2',
              item.count === 0 && !state[item.key] && ZERO,
            )}
          >
            <span>
              {item.label} <span className="text-xs font-extrabold text-ink-3">{item.count}</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={state[item.key]}
              onChange={() => onChange({ [item.key]: !state[item.key] })}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-6 w-10 shrink-0 rounded-full bg-surface-3 shadow-[inset_0_0_0_1px_var(--border-input)] transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-accent-text peer-checked:after:translate-x-4 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text motion-reduce:transition-none motion-reduce:after:transition-none"
            />
          </label>
        ))}
      </div>

      <div className="mt-2.5 flex flex-col gap-2 rounded-2xl bg-surface-2 p-4">
        <p className="font-bold">Nie wiesz, co wybrać?</p>
        <p className="text-sm leading-snug text-ink-2">
          Opisz firmę w 4 krokach — dobierzemy zestaw i dodamy go do zapytania.
        </p>
        <Link href="/kreator" className="text-sm font-extrabold text-accent-text hover:underline">
          Dobierz zestaw w 60 s →
        </Link>
      </div>
    </div>
  )
}

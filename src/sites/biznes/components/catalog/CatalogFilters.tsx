'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { brandPageHref } from '@/lib/catalog/brand'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import {
  OWN_BRAND_SLUG,
  type CatalogFacets,
  type CatalogKind,
  type CatalogState,
} from '@/lib/catalog/filters'
import { plural } from '@/lib/plural'

/** Options of a group shown before „Pokaż wszystkie (n)” (K4 board `Web-Oferta`). */
const FIRST = 8

/** The „Rodzaj” segment (K34 §4): short labels; the chips keep the full names (`KINDS`). */
const SEGMENT: { value: CatalogKind | null; label: string }[] = [
  { value: null, label: 'Wszystko' },
  { value: 'device', label: 'Sprzęt' },
  { value: 'software', label: 'Programy' },
  { value: 'service', label: 'Usługi' },
]

const ICONS = {
  filters: 'M4 5h16 M7 12h10 M10 19h4',
  category: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  brand: 'M3 12V4h8l10 10-8 8z M7.5 8.5h.01',
  industry: 'M3 11l9-7 9 7 M5 10v10h14V10 M10 20v-6h4v6',
  wizard:
    'M15 4V2 M15 16v-2 M8 9h2 M20 9h2 M17.8 11.8L19 13 M15 9h.01 M17.8 6.2L19 5 M3 21l9-9 M12.2 6.2L11 5',
} as const

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

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function Glyph({ d, size = 15 }: { d: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

/** Options with results, plus the ticked ones (a ticked option never disappears). */
function shown<T extends { slug: string }>(
  options: T[],
  counts: Record<string, number>,
  selected: string[],
): T[] {
  return options.filter((o) => (counts[o.slug] ?? 0) > 0 || selected.includes(o.slug))
}

/** A collapsible group of the panel: icon, name, number ticked, „Pokaż wszystkie (n)”. */
function FilterGroup({
  title,
  icon,
  selected,
  total,
  defaultOpen,
  children,
}: {
  title: string
  icon: string
  selected: number
  total: number
  defaultOpen: boolean
  children: (all: boolean) => ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [all, setAll] = useState(false)
  return (
    <fieldset className="border-t border-border py-3">
      <legend className="sr-only">{title}</legend>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-10 w-full items-center gap-2.5 text-left"
      >
        <span className="flex size-7 items-center justify-center rounded-lg bg-surface-2 text-accent-text">
          <Glyph d={icon} />
        </span>
        <b className="text-[0.95rem] font-extrabold text-ink">{title}</b>
        {selected > 0 && (
          <em className="rounded-full bg-accent-text px-2 text-xs font-extrabold not-italic text-accent-ink">
            {selected}
          </em>
        )}
        <span
          aria-hidden="true"
          className={cx('ml-auto text-ink-3 transition-transform', open && 'rotate-180')}
        >
          <Glyph d="M6 9l6 6 6-6" size={16} />
        </span>
      </button>
      {open && (
        <div className="pt-2">
          {children(all)}
          {total > FIRST && (
            <button
              type="button"
              aria-expanded={all}
              onClick={() => setAll((value) => !value)}
              className="mt-1.5 min-h-9 text-sm font-extrabold text-accent-text hover:underline"
            >
              {all ? 'Pokaż mniej' : `Pokaż wszystkie (${total})`}
            </button>
          )}
        </div>
      )}
    </fieldset>
  )
}

/**
 * Filters of the offer in one card (K34 §4, K4 board `Web-Oferta`): „Rodzaj” segment, „Tylko
 * nowości” switch, then Kategoria, Marka (logo tiles) and Branża — collapsible, with counts
 * per facet and only the options that show something.
 */
export function CatalogFilters({
  index,
  state,
  facets,
  onChange,
  onClear,
  activeCount,
  heading = true,
}: Props) {
  const categories = shown(
    index.categories.filter((category) => !state.group || category.group === state.group),
    facets.categories,
    state.categories,
  )
  const brands = shown(
    index.brands.filter((brand) => brand.slug !== OWN_BRAND_SLUG),
    facets.brands,
    state.brands,
  ).sort(
    (a, b) =>
      (facets.brands[b.slug] ?? 0) - (facets.brands[a.slug] ?? 0) ||
      a.name.localeCompare(b.name, 'pl'),
  )
  const industries = shown(index.industries, facets.industries, state.industries)
  // One brand chosen → „Zobacz markę” to its page or salon (K3-KATALOG §6).
  const chosenBrand =
    state.brands.length === 1 ? index.brands.find((b) => b.slug === state.brands[0]) : undefined
  const chosenBrandHref = chosenBrand ? brandPageHref(index, chosenBrand.slug) : null
  const firstOrTicked = <T extends { slug: string }>(list: T[], all: boolean, ticked: string[]) =>
    all ? list : list.filter((item, i) => i < FIRST || ticked.includes(item.slug))

  return (
    <div className="flex flex-col rounded-[22px] bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]">
      <div className="flex min-h-9 items-center gap-2 pb-3">
        {heading ? (
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
            <Glyph d={ICONS.filters} size={17} />
            Filtry
          </h2>
        ) : (
          <span />
        )}
        {activeCount > 0 && (
          <>
            <span className="rounded-full bg-surface-2 px-2 text-xs font-extrabold text-ink-2">
              {activeCount}
            </span>
            <button
              type="button"
              onClick={onClear}
              className="ml-auto min-h-9 text-sm font-extrabold text-accent-text hover:underline"
            >
              Wyczyść
            </button>
          </>
        )}
      </div>

      <div role="group" aria-label="Rodzaj" className="flex gap-0.5 rounded-xl bg-surface-2 p-1">
        {SEGMENT.map((kind) => {
          const on = state.kind === kind.value
          const count = facets.kinds[kind.value ?? 'all']
          return (
            <button
              key={kind.label}
              type="button"
              aria-pressed={on}
              aria-label={`${kind.label} (${count})`}
              onClick={() => onChange({ kind: kind.value })}
              className={cx(
                'min-h-9 min-w-0 flex-auto rounded-[9px] px-1 text-[0.72rem] font-extrabold',
                on ? 'bg-card text-ink shadow-sm' : 'text-ink-2 hover:text-ink',
              )}
            >
              {kind.label}
            </button>
          )
        })}
      </div>

      <label className="mt-3 flex min-h-12 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          role="switch"
          checked={state.isNew}
          onChange={() => onChange({ isNew: !state.isNew })}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-6 w-10 shrink-0 rounded-full bg-surface-3 shadow-[inset_0_0_0_1px_var(--border-input)] transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-accent-text peer-checked:after:translate-x-4 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text motion-reduce:transition-none motion-reduce:after:transition-none"
        />
        <span className="flex flex-col leading-tight">
          <b className="text-[0.95rem] font-extrabold text-ink">Tylko nowości</b>
          <small className="text-xs font-bold text-ink-3">
            {facets.isNew} {plural(facets.isNew, ['premiera', 'premiery', 'premier'])} na rynku
          </small>
        </span>
      </label>

      <FilterGroup
        title="Kategoria"
        icon={ICONS.category}
        selected={state.categories.length}
        total={categories.length}
        defaultOpen
      >
        {(all) =>
          firstOrTicked(categories, all, state.categories).map((category) => {
            const on = state.categories.includes(category.slug)
            return (
              <label
                key={category.slug}
                className="-mx-2 flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1 text-[0.92rem] font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink has-checked:text-ink"
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onChange({ categories: toggle(state.categories, category.slug) })}
                  className="size-[18px] shrink-0 accent-accent-text"
                />
                {category.name}
                <span className="ml-auto text-xs font-extrabold text-ink-3">
                  {facets.categories[category.slug] ?? 0}
                </span>
              </label>
            )
          })
        }
      </FilterGroup>

      <FilterGroup
        title="Marka"
        icon={ICONS.brand}
        selected={state.brands.length}
        total={brands.length}
        defaultOpen
      >
        {(all) => (
          <>
            <div className="grid grid-cols-2 gap-2">
              {firstOrTicked(brands, all, state.brands).map((brand) => (
                <label
                  key={brand.slug}
                  title={brand.name}
                  className="relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-white px-2 pb-1.5 pt-2.5 shadow-[inset_0_0_0_1.5px_var(--border)] has-checked:shadow-[inset_0_0_0_2px_var(--accent-text)] has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-text"
                >
                  <input
                    type="checkbox"
                    checked={state.brands.includes(brand.slug)}
                    onChange={() => onChange({ brands: toggle(state.brands, brand.slug) })}
                    className="peer sr-only"
                  />
                  <span className="flex h-6 items-center">
                    {brand.logo ? (
                      // Explicit box: the tile keeps its size while the logo loads (K4d).
                      <Image
                        src={brand.logo.url}
                        alt={brand.name}
                        width={Math.round((brand.logo.width / brand.logo.height) * 22)}
                        height={22}
                        unoptimized
                        className="h-[22px] w-auto max-w-[96px] object-contain"
                      />
                    ) : (
                      // Fixed dark text: the tile is white in both themes, like the logos.
                      <span className="text-center text-[0.72rem] font-black uppercase leading-tight text-surface-dark">
                        {brand.name}
                      </span>
                    )}
                  </span>
                  {/* Fixed dark ink: white tile in both themes. */}
                  <small className="text-[0.68rem] font-extrabold text-surface-dark">
                    {facets.brands[brand.slug] ?? 0}
                  </small>
                  <span
                    aria-hidden="true"
                    className="absolute right-1.5 top-1.5 hidden size-4 items-center justify-center rounded-full bg-accent-text text-accent-ink peer-checked:flex"
                  >
                    <Glyph d="M5 12.5l4 4 10-10" size={10} />
                  </span>
                </label>
              ))}
            </div>
            {chosenBrand && chosenBrandHref && (
              <Link
                href={chosenBrandHref}
                className="mt-2 flex min-h-9 items-center text-sm font-extrabold text-accent-text hover:underline"
              >
                Zobacz markę {chosenBrand.name} →
              </Link>
            )}
          </>
        )}
      </FilterGroup>

      <FilterGroup
        title="Branża"
        icon={ICONS.industry}
        selected={state.industries.length}
        total={industries.length}
        defaultOpen={state.industries.length > 0}
      >
        {(all) => (
          <div className="flex flex-wrap gap-1.5">
            {firstOrTicked(industries, all, state.industries).map((industry) => (
              <label
                key={industry.slug}
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full bg-surface-2 px-3 text-sm font-bold text-ink-2 has-checked:bg-accent-text has-checked:text-accent-ink has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-text"
              >
                <input
                  type="checkbox"
                  checked={state.industries.includes(industry.slug)}
                  onChange={() => onChange({ industries: toggle(state.industries, industry.slug) })}
                  className="sr-only"
                />
                {industry.name}
                <small className="text-xs font-extrabold opacity-80">
                  {facets.industries[industry.slug] ?? 0}
                </small>
              </label>
            ))}
          </div>
        )}
      </FilterGroup>

      <div className="mt-2 flex flex-col items-start gap-2 rounded-2xl bg-surface-2 p-4">
        <span className="flex size-9 items-center justify-center rounded-xl bg-card text-accent-text">
          <Glyph d={ICONS.wizard} size={20} />
        </span>
        <p className="font-bold text-ink">Nie wiesz, co wybrać?</p>
        <p className="text-sm leading-snug text-ink-2">
          Odpowiedz na kilka prostych pytań — pokażemy rozwiązania dobrane do Twojej firmy.
        </p>
        <Link
          href="/konfigurator"
          className="inline-flex min-h-10 items-center rounded-xl bg-accent-text px-4 text-sm font-bold text-accent-ink hover:bg-ink hover:text-surface"
        >
          Otwórz konfigurator
        </Link>
      </div>
    </div>
  )
}

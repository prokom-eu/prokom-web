'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { brandCategories } from '@/lib/catalog/brand'
import type { CatalogIndex, IndexSubcategory } from '@/lib/catalog/catalogIndex'
import {
  categoryBrands,
  categoryIndustries,
  filterCategoryProducts,
  helpCardSpan,
  registerOptions,
  SERIES_PARAM,
  seriesFilter,
  seriesFromParam,
  showroomHelpHref,
  type CategoryChoice,
} from '@/lib/catalog/category'
import { CATALOG_PAGE_SIZE } from '@/lib/catalog/filters'
import { plural } from '@/lib/plural'

import { ProductCard } from '../catalog/ProductCard'
import { ProductStage, STAGE_SHADOW } from '../ProductStage'

type Props = {
  /** Index with only this category's products (the page never sends the whole catalog). */
  index: CatalogIndex
  help: { title: string; text: string }
  /** „…potrzebujesz drukarki fiskalnej, nie kasy →” — only when that category is listed. */
  printersHref: string | null
  /** Segments above the grid: brands (category page) or main categories (brand page, K3b′). */
  segments?: 'brand' | 'category'
  /**
   * Subcategory chips without their own address (K3b′): filters in the browser. A subcategory
   * belongs to the main category (`category`), so the chip narrows to it too — like its count.
   */
  chips?: { category: string; items: IndexSubcategory[] } | null
  /** Visible heading of the grid (brand page: „W katalogu”); else a hidden „Produkty”. */
  title?: string
  /** Series row and side panel (K31c) — category pages only, when the cards have 2+ series. */
  bySeriesFilter?: boolean
}

const SPAN_2: Record<number, string> = { 1: 'col-span-1', 2: 'col-span-2' }
const SPAN_3: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
}

const SEGMENT =
  'relative inline-flex min-h-11 cursor-pointer items-center rounded-xl px-4 text-sm font-extrabold text-ink-2 has-checked:bg-card has-checked:text-ink has-checked:shadow-[0_6px_16px_-10px_var(--glow),inset_0_0_0_1px_var(--border)] has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-text'

/** Subcategory chip; checked = the accent fill, like the chips of the hero (K31 board). */
const CHIP =
  'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-card px-4 text-sm font-bold text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)] has-checked:bg-accent-text has-checked:text-accent-ink has-checked:shadow-none has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-text'

/**
 * Products of a category (spec. §6.1): the cash register picker (when the products have types),
 * brand segments, the grid with the „Nie wiesz, którą wybrać?” card and „Pokaż kolejne”. The
 * choice lives only in the browser — the page keeps one address for search engines.
 */
export function CategoryGrid({
  index,
  help,
  printersHref,
  segments = 'brand',
  chips = null,
  title,
  bySeriesFilter = false,
}: Props) {
  const products = index.products
  const [choice, setChoice] = useState<CategoryChoice>({})
  const searchParams = useSearchParams()
  const seriesList = useMemo(
    () => seriesFilter(bySeriesFilter, products),
    [bySeriesFilter, products],
  )
  // Series filter (K31c): its state is the address (`?seria=`, shareable), the canonical
  // address stays without it.
  const bySeries = seriesList.length > 0
  const series = bySeries ? seriesFromParam(searchParams.get(SERIES_PARAM), seriesList) : undefined
  const uses = useMemo(
    () => (bySeries ? categoryIndustries(products, index) : []),
    [bySeries, products, index],
  )
  const [shown, setShown] = useState(CATALOG_PAGE_SIZE)
  const focusCard = useRef<number | null>(null)

  const options = useMemo(() => registerOptions(products), [products])
  const segmentList = useMemo(
    () =>
      segments === 'brand' ? categoryBrands(products, index) : brandCategories(products, index),
    [segments, products, index],
  )
  const segmentKey = segments === 'brand' ? 'brand' : 'category'
  const results = useMemo(
    () => filterCategoryProducts(products, { ...choice, series }),
    [products, choice, series],
  )
  const helpHref = bySeries ? showroomHelpHref(products, index, choice.brands ?? []) : null
  const visible = results.slice(0, shown)
  const more = results.length - visible.length
  const registers = options !== null

  // After „Pokaż kolejne”: focus the first new card, so the keyboard continues there.
  useEffect(() => {
    if (focusCard.current === null) return
    const card = document.querySelector<HTMLElement>(`[data-card="${focusCard.current}"] h3 a`)
    focusCard.current = null
    card?.focus()
  })

  const choose = (change: CategoryChoice) => {
    setChoice((current) => ({ ...current, ...change }))
    setShown(CATALOG_PAGE_SIZE)
  }
  const chooseSeries = (slug: string | null) => {
    const url = new URL(window.location.href)
    if (slug) url.searchParams.set(SERIES_PARAM, slug)
    else url.searchParams.delete(SERIES_PARAM)
    // `replaceState`: the Next router follows it (`useSearchParams`), no new history entry.
    window.history.replaceState(null, '', url)
    setShown(CATALOG_PAGE_SIZE)
  }
  const toggle = (key: 'brands' | 'industries', slug: string) =>
    choose({
      [key]: (choice[key] ?? []).includes(slug)
        ? (choice[key] ?? []).filter((item) => item !== slug)
        : [...(choice[key] ?? []), slug],
    })

  const countLabel = registers
    ? plural(results.length, ['kasa pasuje', 'kasy pasują', 'kas pasuje'])
    : plural(results.length, ['pozycja', 'pozycje', 'pozycji'])

  return (
    <section
      id={registers ? 'dobor' : 'produkty'}
      aria-labelledby="produkty-h"
      className="scroll-mt-28"
    >
      {registers ? (
        <div className="max-w-[46rem]">
          <p className="mb-3 text-[13px] font-extrabold tracking-[0.08em] text-accent-text uppercase">
            Krok 1 · Jak pracujesz?
          </p>
          <h2
            id="produkty-h"
            className="font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] font-extrabold tracking-[-0.02em] font-stretch-110%"
          >
            Wybierz, a pokażemy pasujące kasy.
          </h2>
          {printersHref && (
            <p className="mt-4 text-[clamp(1.0625rem,1.3vw,1.2rem)] leading-relaxed text-ink-2">
              Masz program sprzedażowy albo planujesz GoPOS? Wtedy potrzebujesz{' '}
              <Link href={printersHref} className="font-extrabold text-accent-text hover:underline">
                drukarki fiskalnej, nie kasy →
              </Link>
            </p>
          )}
        </div>
      ) : (
        <h2
          id="produkty-h"
          className={
            title
              ? 'font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-tight font-extrabold tracking-[-0.02em]'
              : 'sr-only'
          }
        >
          {title ?? 'Produkty'}
        </h2>
      )}

      {options && (
        <ul className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
          {options.map((option) => {
            const on = choice.registerType === option.value
            return (
              <li key={option.value} className="flex">
                <button
                  type="button"
                  aria-pressed={on}
                  disabled={option.count === 0}
                  onClick={() => choose({ registerType: on ? undefined : option.value })}
                  className={cx(
                    'relative flex w-full flex-col gap-1.5 rounded-[22px] bg-card p-3 text-left shadow-[inset_0_0_0_1.5px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)] disabled:cursor-not-allowed disabled:opacity-55 sm:p-4',
                    on &&
                      'shadow-[0_20px_40px_-28px_var(--glow),inset_0_0_0_2px_var(--accent-text)] hover:shadow-[0_20px_40px_-28px_var(--glow),inset_0_0_0_2px_var(--accent-text)]',
                  )}
                >
                  <ProductStage as="span" className="h-24 rounded-2xl sm:h-28">
                    {option.image && (
                      <Image
                        src={option.image.url}
                        alt=""
                        width={option.image.width}
                        height={option.image.height}
                        unoptimized
                        className={cx(
                          'relative h-auto max-h-20 w-auto max-w-[70%] object-contain sm:max-h-24',
                          STAGE_SHADOW,
                        )}
                      />
                    )}
                  </ProductStage>
                  <span
                    aria-hidden="true"
                    className={cx(
                      'absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-card shadow-[inset_0_0_0_1.5px_var(--border)] sm:right-5 sm:top-5',
                      on && 'bg-accent-text text-accent-ink shadow-none',
                    )}
                  >
                    {on && <Icon name="check" strokeWidth={3} className="size-3.5" />}
                  </span>
                  <span className="mt-2 font-display text-base leading-tight font-extrabold text-ink sm:text-lg">
                    {option.title}
                  </span>
                  <span className="text-sm leading-snug text-ink-2">{option.text}</span>
                  <span className="mt-auto pt-1 text-sm font-extrabold text-accent-text">
                    {option.count} {plural(option.count, ['model', 'modele', 'modeli'])}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {chips && chips.items.length > 1 && (
        <fieldset className="mt-8 flex flex-wrap gap-2">
          <legend className="sr-only">Podkategoria</legend>
          {[{ name: '', count: products.length }, ...chips.items].map((chip) => (
            <label key={chip.name || 'all'} className={CHIP}>
              <input
                type="radio"
                name="podkategoria"
                checked={(choice.subcategory ?? '') === chip.name}
                onChange={() =>
                  choose({
                    subcategory: chip.name || undefined,
                    category: chip.name ? chips.category : undefined,
                  })
                }
                className="sr-only"
              />
              {chip.name || 'Wszystkie'}
              <span className="text-xs font-extrabold">{chip.count}</span>
            </label>
          ))}
        </fieldset>
      )}

      {bySeries && (
        <fieldset className="mt-8 flex min-w-0 items-start gap-3">
          <legend className="sr-only">Seria</legend>
          <span
            aria-hidden="true"
            className="mt-3.5 shrink-0 text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase max-sm:hidden"
          >
            Seria
          </span>
          <div className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            {[{ name: '', slug: '', count: products.length }, ...seriesList].map((item) => (
              <label key={item.slug || 'all'} className={cx(CHIP, 'shrink-0 whitespace-nowrap')}>
                <input
                  type="radio"
                  name="seria"
                  checked={(series ?? '') === item.name}
                  onChange={() => chooseSeries(item.slug || null)}
                  className="sr-only"
                />
                {item.name || 'Wszystkie'}
                <span className="text-xs font-extrabold">{item.count}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div
        className={cx(
          bySeries && 'lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-8',
        )}
      >
        {bySeries && (
          <SeriesAside
            brands={segments === 'brand' ? segmentList : []}
            uses={uses}
            choice={choice}
            onToggle={toggle}
            helpHref={helpHref}
          />
        )}
        <div className="min-w-0">
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p role="status" className="text-ink-2">
              <b className="font-display text-2xl font-extrabold text-ink">{results.length}</b>{' '}
              {countLabel}
            </p>
            {segmentList.length > 1 && (
              <fieldset
                className={cx(
                  'flex flex-wrap gap-1 rounded-2xl bg-surface-2 p-1',
                  // With the series filter the brands sit in the side panel (from 1024 px up).
                  bySeries && 'lg:hidden',
                )}
              >
                <legend className="sr-only">{segments === 'brand' ? 'Marka' : 'Kategoria'}</legend>
                {[{ slug: '', name: 'Wszystkie' }, ...segmentList].map((segment) => (
                  <label key={segment.slug || 'all'} className={SEGMENT}>
                    <input
                      type="radio"
                      name={segments === 'brand' ? 'marka' : 'kategoria'}
                      checked={(choice[segmentKey] ?? '') === segment.slug}
                      onChange={() => choose({ [segmentKey]: segment.slug || undefined })}
                      className="sr-only"
                    />
                    {segment.name}
                  </label>
                ))}
              </fieldset>
            )}
          </div>

          {results.length === 0 ? (
            <div className="mt-5 flex flex-col items-start gap-3 rounded-3xl bg-surface-2 p-6">
              <p className="font-extrabold text-ink">Nic nie pasuje do tego wyboru.</p>
              <button
                type="button"
                onClick={() => {
                  choose({
                    registerType: undefined,
                    brand: undefined,
                    category: undefined,
                    subcategory: undefined,
                    brands: undefined,
                    industries: undefined,
                  })
                  if (series) chooseSeries(null)
                }}
                className="inline-flex min-h-11 items-center rounded-xl bg-card px-4 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]"
              >
                Pokaż wszystkie
              </button>
            </div>
          ) : (
            <ul
              data-category-grid
              className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-3"
            >
              {visible.map((product, position) => (
                <li key={product.slug} className="flex">
                  <ProductCard
                    product={product}
                    index={index}
                    position={position}
                    meta={bySeries ? 'series' : 'category'}
                  />
                </li>
              ))}
              {more === 0 && (
                <li
                  className={cx(
                    'flex',
                    SPAN_2[helpCardSpan(visible.length, 2)],
                    SPAN_3[helpCardSpan(visible.length, 3)],
                  )}
                >
                  <div
                    data-surface="dark"
                    className="relative isolate flex w-full flex-col items-start justify-center gap-4 overflow-hidden rounded-[18px] bg-surface-dark bg-[radial-gradient(ellipse_at_85%_0%,var(--glow),transparent_60%)] p-6 text-white sm:rounded-3xl sm:p-8"
                  >
                    <p className="text-[13px] font-extrabold tracking-[0.08em] text-accent-on-dark uppercase">
                      Nie wiesz, którą wybrać?
                    </p>
                    <h3 className="max-w-[24ch] font-display text-[clamp(1.35rem,2.2vw,1.9rem)] leading-[1.08] font-extrabold">
                      {help.title}
                    </h3>
                    <p className="max-w-[48ch] leading-relaxed text-white/80">{help.text}</p>
                    <a
                      href="#kontakt"
                      className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 font-extrabold text-surface-dark hover:bg-white/85"
                    >
                      Zadzwoń albo napisz
                      <Icon name="arrow" strokeWidth={2.4} className="size-4" />
                    </a>
                  </div>
                </li>
              )}
            </ul>
          )}

          {more > 0 && (
            <div className="mt-6 flex flex-col items-center gap-2.5">
              <p className="text-sm font-bold text-ink-3">
                Widzisz {visible.length} z {results.length}
              </p>
              <button
                type="button"
                onClick={() => {
                  focusCard.current = visible.length
                  setShown((current) => current + CATALOG_PAGE_SIZE)
                }}
                className="inline-flex min-h-[50px] items-center gap-2 rounded-xl border-2 border-border-input px-6 font-bold text-ink hover:bg-surface-2"
              >
                Pokaż kolejne
                <span className="text-sm font-extrabold text-ink-3">
                  {Math.min(more, CATALOG_PAGE_SIZE)}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const CHECK =
  'flex min-h-10 cursor-pointer items-center gap-3 text-[15px] font-bold text-ink has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-text'

/**
 * Side panel of a category with series (`k31/screens/Web-Kategoria-1440`, from 1024 px up):
 * brands and „Do czego” as check boxes (any of the checked), and „Nie wiesz, który?” → the
 * wizard in the showroom.
 */
function SeriesAside({
  brands,
  uses,
  choice,
  onToggle,
  helpHref,
}: {
  brands: { slug: string; name: string; count: number }[]
  uses: { slug: string; name: string; count: number }[]
  choice: CategoryChoice
  onToggle: (key: 'brands' | 'industries', slug: string) => void
  helpHref: string | null
}) {
  const groups = [
    { key: 'brands' as const, legend: 'Marka', items: brands.length > 1 ? brands : [] },
    { key: 'industries' as const, legend: 'Do czego', items: uses },
  ]
  return (
    <aside
      aria-label="Filtry"
      className="mt-8 flex flex-col gap-7 max-lg:hidden lg:sticky lg:top-28"
    >
      {groups.map(
        ({ key, legend, items }) =>
          items.length > 0 && (
            <fieldset key={key}>
              <legend className="mb-2 text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase">
                {legend}
              </legend>
              {items.map((item) => (
                <label key={item.slug} className={CHECK}>
                  <input
                    type="checkbox"
                    checked={(choice[key] ?? []).includes(item.slug)}
                    onChange={() => onToggle(key, item.slug)}
                    className="size-[18px] shrink-0 accent-[var(--accent-text)]"
                  />
                  <span className="flex-1">{item.name}</span>
                  <span className="text-xs font-extrabold text-ink-2">{item.count}</span>
                </label>
              ))}
            </fieldset>
          ),
      )}
      {helpHref && (
        <div className="flex flex-col items-start gap-3 rounded-3xl bg-accent-soft p-5">
          <p className="font-display text-lg font-extrabold">Nie wiesz, który?</p>
          <p className="text-sm leading-relaxed text-ink-2">
            Odpowiedz na 3 pytania w salonie marki — podpowiemy serię.
          </p>
          <Link
            href={helpHref}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent-text px-3 text-center text-sm font-extrabold text-accent-ink hover:bg-ink hover:text-surface"
          >
            Dobierz w 3 pytaniach
          </Link>
        </div>
      )}
    </aside>
  )
}

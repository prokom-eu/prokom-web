'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'

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
  type CategoryChoice,
  type CategoryGuide,
} from '@/lib/catalog/category'
import { CATALOG_PAGE_SIZE, CATALOG_PAGE_SIZE_PHONE } from '@/lib/catalog/filters'
import { plural } from '@/lib/plural'
import { BZ_H2, BZ_LEAD } from '@/sites/biznes/typography'

import { ProductCard } from '../catalog/ProductCard'
import { SupplyBand } from '../SupplyBand'
import { ProductStage, STAGE_SHADOW } from '../ProductStage'
import { usePhone } from '../mobile/usePhone'

type Props = {
  /** Index with only this category's products (the page never sends the whole catalog). */
  index: CatalogIndex
  /** Dark card at the end of the grid — brand pages; category pages use `guide` instead. */
  help?: { title: string; text: string }
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
  /** Series row (K31c) — category pages only, when the cards have 2+ series. */
  bySeriesFilter?: boolean
  /**
   * Category pages (K4d): the side panel with brands, „Do czego” and this card, instead of the
   * dark card at the end of the grid (brand pages keep it).
   */
  guide?: CategoryGuide | null
  /** „Do czego” (the cards' industries) — laptops and computers only (K36 §13). */
  useCases?: boolean
  /**
   * „Kupujesz 5 sztuk lub więcej?” (plan 0611 §6.4 #2): above the grid; on a phone after the
   * 6th card (after the last one when fewer).
   */
  supply?: { text: string; cta: string; href: string } | null
}

/** The phone shows the procurement band after this many cards (§6.4 #2). */
const SUPPLY_AFTER = 6

const SPAN_2: Record<number, string> = { 1: 'col-span-1', 2: 'col-span-2' }
const SPAN_3: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
}

// Phone (board App-Kategoria): the segments as chips in one row to swipe.
const SEGMENT =
  'relative inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-xl px-4 text-sm font-extrabold whitespace-nowrap text-ink-2 max-md:bg-card max-md:shadow-[inset_0_0_0_1px_var(--border)] max-md:has-checked:bg-accent-text max-md:has-checked:text-accent-ink max-md:has-checked:shadow-none has-checked:bg-card has-checked:text-ink has-checked:shadow-[0_6px_16px_-10px_var(--glow),inset_0_0_0_1px_var(--border)] has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-text'

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
  guide = null,
  useCases = false,
  supply = null,
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
    () => (useCases ? categoryIndustries(products, index) : []),
    [useCases, products, index],
  )
  const aside = guide !== null
  // Pages, not cards: a page is 24 cards, 10 on a phone. The server renders the desktop page;
  // a phone shortens it once hydrated (the cards past the 10th are below the fold).
  const phone = usePhone()
  const pageSize = phone ? CATALOG_PAGE_SIZE_PHONE : CATALOG_PAGE_SIZE
  const [pages, setPages] = useState(1)
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
  const visible = results.slice(0, pages * pageSize)
  const more = results.length - visible.length
  const registers = options !== null

  // After „Pokaż kolejne”: focus the first new card, so the keyboard continues there.
  useEffect(() => {
    if (focusCard.current === null) return
    const card = document.querySelector<HTMLElement>(
      `[data-card-index="${focusCard.current}"] h3 a`,
    )
    focusCard.current = null
    card?.focus()
  })

  const choose = (change: CategoryChoice) => {
    setChoice((current) => ({ ...current, ...change }))
    setPages(1)
  }
  /** After a pick in the register picker under the grid: the grid it filtered. */
  // The keyboard and the screen reader go with it: the focus moves to the grid heading.
  const backToGrid = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('produkty')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
    document.getElementById('produkty-h')?.focus({ preventScroll: true })
  }
  const pickedType = options?.find((option) => option.value === choice.registerType) ?? null
  const chooseSeries = (slug: string | null) => {
    const url = new URL(window.location.href)
    if (slug) url.searchParams.set(SERIES_PARAM, slug)
    else url.searchParams.delete(SERIES_PARAM)
    // `replaceState`: the Next router follows it (`useSearchParams`), no new history entry.
    window.history.replaceState(null, '', url)
    setPages(1)
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
    <>
      <section id="produkty" aria-labelledby="produkty-h" className="scroll-mt-28">
        {/* Board `Web-kategoria-*`: no heading over the grid, only the count (H2 for readers). */}
        <h2 id="produkty-h" tabIndex={-1} className={cx(title ? BZ_H2 : 'sr-only', 'outline-none')}>
          {title ?? 'Produkty'}
        </h2>

        {chips && chips.items.length > 1 && (
          <fieldset className="mt-8 flex min-w-0 flex-wrap gap-2 [scrollbar-width:none] max-md:-mx-4 max-md:mt-3 max-md:flex-nowrap max-md:overflow-x-auto max-md:px-4">
            <legend className="sr-only">Podkategoria</legend>
            {[{ name: '', count: products.length }, ...chips.items].map((chip) => (
              <label
                key={chip.name || 'all'}
                className={cx(CHIP, 'relative shrink-0 whitespace-nowrap')}
              >
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
          <fieldset className="mt-8 flex min-w-0 items-start gap-3 max-md:mt-3">
            <legend className="sr-only">Seria</legend>
            <span
              aria-hidden="true"
              className="mt-3.5 shrink-0 text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase max-sm:hidden"
            >
              Seria
            </span>
            <div className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
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
            aside && 'lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-8',
          )}
        >
          {guide && (
            <CategoryAside
              brands={segments === 'brand' ? segmentList : []}
              uses={uses}
              choice={choice}
              onToggle={toggle}
              guide={guide}
            />
          )}
          <div className="min-w-0">
            {guide && (
              // Phones and tablets: the side panel is hidden, its card goes above the grid.
              <GuideCard guide={guide} className="mt-6 max-md:hidden lg:hidden" />
            )}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 max-md:mt-3 max-md:gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <p role="status" className="text-ink-2">
                  <b className="font-display text-2xl font-extrabold text-ink max-md:text-lg">
                    {results.length}
                  </b>{' '}
                  {countLabel}
                  {pickedType && <span className="sr-only"> · typ: {pickedType.title}</span>}
                </p>
                {/* The register type is picked under the grid: its filter shows (and clears) here. */}
                {pickedType && (
                  <button
                    type="button"
                    onClick={() => choose({ registerType: undefined })}
                    aria-label={`Usuń filtr typu: ${pickedType.title}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-accent-text px-3.5 text-sm font-extrabold text-accent-ink hover:bg-ink hover:text-surface"
                  >
                    Typ: {pickedType.title}
                    <span aria-hidden="true">✕</span>
                  </button>
                )}
              </div>
              {segmentList.length > 1 && (
                <fieldset
                  className={cx(
                    'flex min-w-0 flex-wrap gap-1 rounded-2xl bg-surface-2 p-1 [scrollbar-width:none] max-md:-mx-4 max-md:w-[calc(100%+2rem)] max-md:flex-nowrap max-md:gap-2 max-md:overflow-x-auto max-md:rounded-none max-md:bg-transparent max-md:px-4 max-md:py-0',
                    // With the side panel the brands sit there (from 1024 px up).
                    aside && segmentList.length > 1 && segments === 'brand' && 'lg:hidden',
                  )}
                >
                  <legend className="sr-only">
                    {segments === 'brand' ? 'Marka' : 'Kategoria'}
                  </legend>
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

            {supply && (
              <SupplyBand
                text={supply.text}
                links={[{ label: supply.cta, href: supply.href }]}
                className="mt-5 max-md:hidden"
              />
            )}
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
                  <Fragment key={product.slug}>
                    <li className="flex">
                      <ProductCard
                        product={product}
                        index={index}
                        position={position}
                        meta={bySeries ? 'series' : 'category'}
                      />
                    </li>
                    {supply && position + 1 === Math.min(SUPPLY_AFTER, visible.length) && (
                      <li className="col-span-2 md:hidden">
                        <SupplyBand
                          text={supply.text}
                          links={[{ label: supply.cta, href: supply.href }]}
                        />
                      </li>
                    )}
                  </Fragment>
                ))}
                {more === 0 && !guide && help && (
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
                    setPages((current) => current + 1)
                  }}
                  className="inline-flex min-h-[50px] items-center gap-2 rounded-xl border-2 border-border-input px-6 font-bold text-ink hover:bg-surface-2"
                >
                  Pokaż kolejne
                  <span className="text-sm font-extrabold text-ink-3">
                    {Math.min(more, pageSize)}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      {registers && (
        // K3 register picker under the grid (decision of Krystian 02.11): it filters the grid
        // and brings the visitor back to it.
        <section id="dobor" aria-labelledby="dobor-h" className="mt-16 scroll-mt-28">
          <div className="max-w-[46rem]">
            <p className="mb-3 text-[13px] font-extrabold tracking-[0.08em] text-accent-text uppercase">
              Dobór kasy
            </p>
            <h2 id="dobor-h" className={BZ_H2}>
              Wybierz, jak pracujesz, a pokażemy pasujące kasy
            </h2>
            {printersHref && (
              <p className={`${BZ_LEAD} mt-4 text-ink-2`}>
                Masz program sprzedażowy albo planujesz GoPOS? Wtedy potrzebujesz{' '}
                <Link
                  href={printersHref}
                  className="font-extrabold text-accent-text hover:underline"
                >
                  drukarki fiskalnej, nie kasy →
                </Link>
              </p>
            )}
          </div>
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
                      onClick={() => {
                        choose({ registerType: on ? undefined : option.value })
                        backToGrid()
                      }}
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
        </section>
      )}
    </>
  )
}

const CHECK =
  'flex min-h-10 cursor-pointer items-center gap-3 text-[15px] font-bold text-ink has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-text'

/** „Nie wiesz, co wybrać?” of a category (K4 board): text and one button. */
function GuideCard({ guide, className }: { guide: CategoryGuide; className?: string }) {
  return (
    <div
      className={cx('flex flex-col items-start gap-3 rounded-3xl bg-accent-soft p-5', className)}
    >
      <p className="font-display text-lg font-extrabold">{guide.title}</p>
      {guide.text && <p className="text-sm leading-relaxed text-ink-2">{guide.text}</p>}
      <Link
        href={guide.href}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent-text px-3 text-center text-sm font-extrabold text-accent-ink hover:bg-ink hover:text-surface"
      >
        {guide.button}
      </Link>
    </div>
  )
}

/**
 * Side panel of a category (K4 board `Web-Kategoria`, from 1024 px up): brands and „Do czego” as
 * check boxes (any of the checked), then „Nie wiesz, co wybrać?”.
 */
function CategoryAside({
  brands,
  uses,
  choice,
  onToggle,
  guide,
}: {
  brands: { slug: string; name: string; count: number }[]
  uses: { slug: string; name: string; count: number }[]
  choice: CategoryChoice
  onToggle: (key: 'brands' | 'industries', slug: string) => void
  guide: CategoryGuide
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
      <GuideCard guide={guide} />
    </aside>
  )
}

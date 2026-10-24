'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import {
  categoryBrands,
  filterCategoryProducts,
  helpCardSpan,
  registerOptions,
  type CategoryChoice,
} from '@/lib/catalog/category'
import { CATALOG_PAGE_SIZE } from '@/lib/catalog/filters'
import { plural } from '@/lib/plural'

import { ProductCard } from '../catalog/ProductCard'

type Props = {
  /** Index with only this category's products (the page never sends the whole catalog). */
  index: CatalogIndex
  help: { title: string; text: string }
  /** „…potrzebujesz drukarki fiskalnej, nie kasy →” — only when that category is listed. */
  printersHref: string | null
}

const SPAN_2: Record<number, string> = { 1: 'col-span-1', 2: 'col-span-2' }
const SPAN_3: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
}

const SEGMENT =
  'relative inline-flex min-h-11 cursor-pointer items-center rounded-xl px-4 text-sm font-extrabold text-ink-2 has-checked:bg-card has-checked:text-ink has-checked:shadow-[0_6px_16px_-10px_var(--glow),inset_0_0_0_1px_var(--border)] has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-text'

/**
 * Products of a category (spec. §6.1): the cash register picker (when the products have types),
 * brand segments, the grid with the „Nie wiesz, którą wybrać?” card and „Pokaż kolejne”. The
 * choice lives only in the browser — the page keeps one address for search engines.
 */
export function CategoryGrid({ index, help, printersHref }: Props) {
  const products = index.products
  const [choice, setChoice] = useState<CategoryChoice>({})
  const [shown, setShown] = useState(CATALOG_PAGE_SIZE)
  const focusCard = useRef<number | null>(null)

  const options = useMemo(() => registerOptions(products), [products])
  const brands = useMemo(() => categoryBrands(products, index), [products, index])
  const results = useMemo(() => filterCategoryProducts(products, choice), [products, choice])
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
        <h2 id="produkty-h" className="sr-only">
          Produkty
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
                  <span
                    aria-hidden="true"
                    className="flex h-24 items-center justify-center rounded-2xl bg-white shadow-[inset_0_0_0_1px_var(--border)] sm:h-28"
                  >
                    {option.image && (
                      <Image
                        src={option.image.url}
                        alt=""
                        width={option.image.width}
                        height={option.image.height}
                        unoptimized
                        className="h-auto max-h-20 w-auto max-w-[70%] object-contain sm:max-h-24"
                      />
                    )}
                  </span>
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

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="text-ink-2">
          <b className="font-display text-2xl font-extrabold text-ink">{results.length}</b>{' '}
          {countLabel}
        </p>
        {brands.length > 1 && (
          <fieldset className="flex flex-wrap gap-1 rounded-2xl bg-surface-2 p-1">
            <legend className="sr-only">Marka</legend>
            {[{ slug: '', name: 'Wszystkie' }, ...brands].map((brand) => (
              <label key={brand.slug || 'all'} className={SEGMENT}>
                <input
                  type="radio"
                  name="marka"
                  checked={(choice.brand ?? '') === brand.slug}
                  onChange={() => choose({ brand: brand.slug || undefined })}
                  className="sr-only"
                />
                {brand.name}
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
            onClick={() => choose({ registerType: undefined, brand: undefined })}
            className="inline-flex min-h-11 items-center rounded-xl bg-card px-4 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]"
          >
            Pokaż wszystkie
          </button>
        </div>
      ) : (
        <ul data-category-grid className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-3">
          {visible.map((product, position) => (
            <li key={product.slug} className="flex">
              <ProductCard product={product} index={index} position={position} />
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
    </section>
  )
}

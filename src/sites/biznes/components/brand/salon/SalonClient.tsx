'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useId, useState, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { productHref } from '@/lib/catalog/card'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'
import type { SalonView } from '@/lib/catalog/salon'
import { cartActions, openCartDrawer } from '@/lib/cart/store'
import { plural } from '@/lib/plural'

import { ProductCard } from '../../catalog/ProductCard'
import { ProductStage, STAGE_SHADOW } from '../../ProductStage'
import { CAROUSEL, CAROUSEL_ITEM } from './carousel'

export type AskItem = { id: string; note?: string }

const toast = (added: number) =>
  `${added} ${plural(added, ['pozycja', 'pozycje', 'pozycji'])} z salonu`

/**
 * „Zapytaj” of the salon: adds the items (with a note) to the inquiry and shows the toast; with
 * no items it opens the inquiry drawer. Notes go to the item, as everywhere (ADR-012 §6.2).
 */
export function SalonAsk({
  items,
  className,
  children,
}: {
  items: readonly AskItem[]
  className: string
  children: ReactNode
}) {
  const ask = () => {
    if (items.length === 0) return openCartDrawer()
    const result = cartActions.addItems(
      items.map(({ id, note }) => ({ id, q: 1, ...(note ? { uwaga: note } : {}) })),
      toast,
    )
    // Already listed (only a note, or nothing new): the drawer shows them.
    if (result.added === 0) openCartDrawer()
  }
  return (
    <button type="button" onClick={ask} className={className}>
      {children}
    </button>
  )
}

/** Comparison table (`cmp`): open on a computer by default, closed on a phone (K4-FINAL §6). */
export function SalonCompare({ compare }: { compare: NonNullable<SalonView['compare']> }) {
  const [open, setOpen] = useState<boolean | null>(null)
  const id = useId()
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        aria-expanded={open ?? undefined}
        aria-controls={id}
        onClick={() =>
          setOpen((value) => !(value ?? window.matchMedia('(min-width: 761px)').matches))
        }
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-card px-5 text-sm font-extrabold text-ink shadow-[inset_0_0_0_1px_var(--border)]"
      >
        {/* Before the first click the CSS decides (open from 761 px). */}
        <span className={cx(open === null && 'max-[760px]:hidden', open === false && 'hidden')}>
          Zwiń tabelę
        </span>
        <span className={cx(open === null && 'min-[761px]:hidden', open === true && 'hidden')}>
          Pokaż tabelę porównania
        </span>
        <Icon
          name="arrow"
          strokeWidth={2.4}
          className={cx(
            'size-4 transition-transform',
            open === null && 'max-[760px]:rotate-90 min-[761px]:-rotate-90',
            open === true && '-rotate-90',
            open === false && 'rotate-90',
          )}
        />
      </button>
      <div
        id={id}
        className={cx(
          'overflow-x-auto rounded-3xl bg-card shadow-[inset_0_0_0_1px_var(--border)]',
          open === null && 'max-[760px]:hidden',
          open === false && 'hidden',
        )}
      >
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="bg-surface-2">
              <th scope="col" className="px-5 py-4 text-left font-extrabold text-ink">
                {compare.title ?? 'Porównanie'}
              </th>
              {compare.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-4 text-center font-extrabold text-ink"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compare.rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <th scope="row" className="px-5 py-3.5 text-left font-semibold text-ink">
                  {row.label}
                </th>
                {compare.columns.map((column, i) => {
                  const cell = row.cells[i]
                  return (
                    <td key={column} className="px-4 py-3.5 text-center font-semibold text-ink">
                      {cell?.kind === 'yes' ? (
                        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-ok/15 text-ok-text">
                          <Icon name="check" strokeWidth={3} className="size-3.5" />
                          <span className="sr-only">tak</span>
                        </span>
                      ) : cell?.kind === 'text' ? (
                        cell.text
                      ) : (
                        <span className="text-ink-3">
                          <span aria-hidden="true">—</span>
                          <span className="sr-only">nie</span>
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Full offer (`fam`): tabs of kinds with their counts, the cards of the chosen one. */
export function SalonFamily({
  family,
  index,
}: {
  family: SalonView['family']
  index: CatalogIndex
}) {
  const [tab, setTab] = useState(0)
  const products = family[tab]?.products ?? []
  return (
    <div className="flex flex-col gap-6">
      {family.length > 1 && (
        <div
          role="group"
          aria-label="Rodzaje"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        >
          {family.map((item, i) => (
            <button
              key={item.title}
              type="button"
              aria-pressed={tab === i}
              onClick={() => setTab(i)}
              className={cx(
                'inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-full px-5 text-sm font-extrabold whitespace-nowrap transition-colors',
                tab === i
                  ? 'bg-ink text-surface'
                  : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:bg-surface-2',
              )}
            >
              {item.title}
              <span
                className={cx(
                  'rounded-full px-2 py-0.5 text-xs',
                  tab === i ? 'bg-accent text-white' : 'text-ink-2',
                )}
              >
                {item.products.length}
              </span>
            </button>
          ))}
        </div>
      )}
      <ul
        className={cx(
          'grid gap-x-4 gap-y-8 min-[761px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4',
          CAROUSEL,
        )}
      >
        {products.map((product, position) => (
          <li key={product.slug} className={cx('flex', CAROUSEL_ITEM)}>
            <ProductCard product={product} index={index} position={position} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** „Pomóż mi wybrać” (`dob`, `#dobor`): one question, the answer shows the models and why. */
export function SalonChooser({
  chooser,
  brand,
}: {
  chooser: NonNullable<SalonView['chooser']>
  brand: string
}) {
  const [picked, setPicked] = useState(0)
  const name = useId()
  const option = chooser.options[picked] ?? chooser.options[0]!
  return (
    <section
      id="dobor"
      aria-labelledby="dobor-h"
      className="grid scroll-mt-28 gap-6 rounded-[32px] bg-surface-2 p-5 sm:p-8 min-[960px]:grid-cols-2 min-[960px]:gap-8"
    >
      <div className="flex flex-col gap-4">
        <Eyebrow>Pomóż mi wybrać</Eyebrow>
        <h2 id="dobor-h" className="font-display text-3xl font-extrabold text-balance text-ink">
          {chooser.question ?? 'Od czego zacząć?'}
        </h2>
        <p className="text-ink-2">
          Jedno pytanie — podpowiemy, od czego zacząć. Ostateczny model dobierzemy po krótkiej
          rozmowie.
        </p>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="sr-only">{chooser.question ?? 'Od czego zacząć?'}</legend>
          {chooser.options.map((item, i) => (
            <label
              key={item.label}
              className={cx(
                'flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl bg-card px-5 font-extrabold text-ink transition-shadow',
                picked === i
                  ? 'shadow-[inset_0_0_0_1.5px_var(--accent-text)]'
                  : 'shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
              )}
            >
              <input
                type="radio"
                name={name}
                checked={picked === i}
                onChange={() => setPicked(i)}
                className="size-4 accent-[var(--accent-text)]"
              />
              {item.label}
            </label>
          ))}
        </fieldset>
      </div>
      <div
        aria-live="polite"
        className="flex flex-col gap-4 self-start rounded-3xl bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)] sm:p-6"
      >
        <Eyebrow>Podpowiadamy</Eyebrow>
        {option.why && <p className="text-ink-2">{option.why}</p>}
        {option.products.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {option.products.map((product) => (
              <li key={product.slug}>
                <MiniModel product={product} />
              </li>
            ))}
          </ul>
        )}
        <SalonAsk
          items={option.products.map((product) => ({
            id: product.slug,
            note: `${brand} — ${option.label}`,
          }))}
          className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-accent-text px-6 font-extrabold text-accent-ink"
        >
          {option.products.length > 1 ? 'Zapytaj o te modele' : 'Zapytaj o ten model'}
        </SalonAsk>
      </div>
    </section>
  )
}

function MiniModel({ product }: { product: IndexProduct }) {
  return (
    <Link
      href={productHref(product.slug)}
      className="flex items-center gap-4 rounded-2xl bg-surface-2 p-2.5 pr-4 transition-colors hover:bg-surface-3"
    >
      <ProductStage as="span" className="h-[60px] w-[76px] shrink-0 rounded-xl">
        {product.image && (
          <Image
            src={product.image.url}
            alt=""
            width={product.image.width}
            height={product.image.height}
            unoptimized
            className={cx('relative max-h-[78%] w-auto max-w-[80%] object-contain', STAGE_SHADOW)}
          />
        )}
      </ProductStage>
      <span className="flex min-w-0 flex-1 flex-col">
        <b className="font-extrabold text-ink">{product.name}</b>
        {product.benefit && (
          <small className="text-sm leading-snug text-ink-2">{product.benefit}</small>
        )}
      </span>
      <Icon name="arrow" strokeWidth={2.4} className="size-4 shrink-0 text-accent-text" />
    </Link>
  )
}

export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p
      className={cx(
        'flex items-center gap-2 text-xs font-black tracking-[0.12em] uppercase',
        dark ? 'text-accent-on-dark' : 'text-accent-text',
      )}
    >
      <span aria-hidden="true" className="h-px w-4 bg-current" />
      {children}
    </p>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { BundleCardData } from '@/lib/catalog/bundle'
import { cartActions, useCart } from '@/lib/cart/store'
import { plural } from '@/lib/plural'

import { ProductStage, STAGE_SHADOW } from '../ProductStage'

/**
 * Bundle tile of `/zestawy` (BIZ-3 §9.2): photos of the required items, „Obszar · Poziom”, the
 * name (the link, stretched over the tile), who it is for, up to 4 items and „Dodaj zestaw do
 * zapytania”, which puts the required items on the inquiry list with the bundle note. No prices.
 */
export function BundleTile({ bundle }: { bundle: BundleCardData }) {
  const cart = useCart()
  const listed =
    bundle.cartItems.length > 0 &&
    bundle.cartItems.every((item) => cart.some((entry) => entry.id === item.id))
  const add = () => {
    if (listed) return
    cartActions.addItems(bundle.cartItems, (added) =>
      added === bundle.cartItems.length
        ? `zestaw „${bundle.name}”`
        : `${added} ${plural(added, ['pozycja', 'pozycje', 'pozycji'])} zestawu`,
    )
  }
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[22px] bg-card has-[a:focus-visible]:ring-[3px] has-[a:focus-visible]:ring-accent-text shadow-[inset_0_0_0_1px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--ink-3),0_18px_40px_-28px_var(--glow)]">
      <ProductStage className="h-[180px] gap-1 px-4 max-md:h-[140px] min-[768px]:h-[200px]">
        {bundle.photos.map((photo, position) => (
          <Image
            key={photo.url}
            src={photo.url}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            unoptimized
            className={cx(
              'relative h-auto w-auto object-contain',
              STAGE_SHADOW,
              position === 0 ? 'max-h-[70%] max-w-[48%]' : 'max-h-[52%] max-w-[30%]',
            )}
          />
        ))}
      </ProductStage>
      <div className="flex flex-1 flex-col gap-2 p-5 max-md:p-4">
        <span className="self-start rounded-md bg-surface-2 px-2 py-1 text-xs font-bold text-ink-2">
          {bundle.label}
        </span>
        <h2 className="font-display text-lg leading-snug font-extrabold text-ink [overflow-wrap:anywhere]">
          <Link
            href={bundle.href}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-has-[a:focus-visible]:underline"
          >
            {bundle.name}
          </Link>
        </h2>
        <p className="line-clamp-3 text-sm leading-relaxed text-ink-2">{bundle.audience}</p>
        {bundle.items.length > 0 && (
          <ul className="mt-1 flex flex-col gap-1 text-sm text-ink">
            {bundle.items.map((item) => (
              <li key={item} className="flex min-w-0 items-start gap-2">
                <Icon
                  name="check"
                  strokeWidth={2.6}
                  className="mt-0.5 size-4 shrink-0 text-accent-text"
                />
                <span className="min-w-0 [overflow-wrap:anywhere]">{item}</span>
              </li>
            ))}
            {bundle.more > 0 && (
              <li className="pl-6 text-ink-2">
                i {bundle.more} {plural(bundle.more, ['element', 'elementy', 'elementów'])} więcej
              </li>
            )}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <span className="text-sm font-extrabold text-accent-text group-hover:underline">
            {bundle.count} {plural(bundle.count, ['element', 'elementy', 'elementów'])} · zobacz
          </span>
          <button
            type="button"
            onClick={add}
            aria-disabled={listed}
            className={cx(
              'relative z-10 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-extrabold transition-colors',
              listed ? 'cursor-default bg-ok/15 text-ink' : 'bg-ink text-surface hover:bg-ink/85',
            )}
          >
            <Icon name={listed ? 'check' : 'doc'} strokeWidth={2.6} className="size-4" />
            {listed ? 'W zapytaniu' : 'Dodaj zestaw do zapytania'}
          </button>
        </div>
      </div>
    </article>
  )
}

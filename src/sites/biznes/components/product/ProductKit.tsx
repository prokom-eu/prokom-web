'use client'

import Image from 'next/image'
import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { productHref } from '@/lib/catalog/card'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import type { IconName } from '@/lib/catalog/options'
import { cartActions, useCart } from '@/lib/cart/store'
import { plural } from '@/lib/plural'

import { AddToCartButton } from '../AddToCartButton'
import { ProductStage, STAGE_SHADOW, StageFallback } from '../ProductStage'

export type KitItem = {
  slug: string
  name: string
  benefit: string | null
  image: IndexImage | null
  /** Picture without a photo: the category icon on the studio, as on the catalog card. */
  icon: IconName
}

const added = (count: number) =>
  `${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])} ze stanowiska`

/**
 * „Skompletuj stanowisko jednym kliknięciem” (spec. §6.2): accessories from „pasuje do”, each
 * with its own switch, and „Dodaj wszystko do zapytania” — one write, one toast.
 */
export function ProductKit({ items }: { items: KitItem[] }) {
  const cart = useCart()
  const allListed = items.every((item) => cart.some((entry) => entry.id === item.slug))

  return (
    <section aria-labelledby="skompletuj" className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="skompletuj"
          className="font-display text-[clamp(1.5rem,2.6vw,2.25rem)] font-extrabold leading-tight text-ink font-stretch-110%"
        >
          Skompletuj stanowisko jednym kliknięciem.
        </h2>
        <button
          type="button"
          // `aria-disabled`, not `disabled`: the button keeps focus after the click (WCAG 2.4.3).
          aria-disabled={allListed}
          onClick={() => {
            if (allListed) return
            cartActions.addMany(
              items.map((item) => item.slug),
              added,
            )
          }}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-card px-5 font-extrabold text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)] aria-disabled:cursor-default aria-disabled:text-ok-text aria-disabled:hover:shadow-[inset_0_0_0_1px_var(--border)]"
        >
          <Icon name={allListed ? 'check' : 'arrow'} className="size-4" strokeWidth={2.4} />
          {allListed ? 'Wszystko na liście' : 'Dodaj wszystko do zapytania'}
        </button>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {items.map((item) => (
          <li
            key={item.slug}
            className="flex flex-col gap-3 rounded-[22px] bg-card p-3.5 shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <ProductStage className="h-28 rounded-2xl">
              {item.image ? (
                <Image
                  src={item.image.url}
                  alt={item.image.alt}
                  width={item.image.width}
                  height={item.image.height}
                  unoptimized
                  className={cx(
                    'relative max-h-[78%] w-auto max-w-[78%] object-contain',
                    STAGE_SHADOW,
                  )}
                />
              ) : (
                <StageFallback icon={item.icon} />
              )}
            </ProductStage>
            <h3 className="font-extrabold leading-snug">
              <Link href={productHref(item.slug)} className="text-ink hover:text-accent-text">
                {item.name}
              </Link>
            </h3>
            {item.benefit && <p className="text-sm leading-snug text-ink-3">{item.benefit}</p>}
            <AddToCartButton
              slug={item.slug}
              name={item.name}
              variant="label"
              className="mt-auto w-full"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

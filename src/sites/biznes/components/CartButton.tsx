'use client'

import { plural } from '@/lib/plural'
import { cartCount } from '@/lib/cart/cart'
import { openCartDrawer, useCart } from '@/lib/cart/store'

type Props = {
  className: string
  /** Classes of the "Zapytanie" text (hidden on phones in the header). */
  labelClassName?: string
  iconSize: number
}

/**
 * "Zapytanie" with the number of positions on the list (spec. §3.2, §8.1): opens the inquiry
 * drawer. In the header and in the phone's bottom bar; the count shows after hydration.
 */
export function CartButton({ className, labelClassName, iconSize }: Props) {
  const count = cartCount(useCart())
  return (
    <button type="button" aria-haspopup="dialog" onClick={openCartDrawer} className={className}>
      <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} aria-hidden="true">
        <path
          d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span className={labelClassName}>Zapytanie</span>
      {count > 0 && (
        <span
          // The button's colours swapped: white on blue by day, navy on light blue at night.
          className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-accent-ink px-1.5 text-[0.78rem] font-black text-accent-text"
        >
          {count}
          <span className="sr-only"> {plural(count, ['pozycja', 'pozycje', 'pozycji'])}</span>
        </span>
      )}
    </button>
  )
}

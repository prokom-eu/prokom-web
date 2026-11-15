'use client'

import { useEffect, useState } from 'react'

import { plural } from '@/lib/plural'
import { cartCount } from '@/lib/cart/cart'
import { onCartAdded, openCartDrawer, useCart } from '@/lib/cart/store'

type Props = {
  className: string
  /** Classes of the "Zapytanie" text (hidden on phones in the header). */
  labelClassName?: string
  iconSize: number
}

/**
 * "Zapytanie" with the number of positions on the list (spec. §3.2, §8.1): opens the inquiry
 * drawer. In the header and in the phone's bottom bar; the stored count shows after hydration.
 * R2: each item added bounces the badge once (`data-bump`, remounted per addition) — never on load.
 */
export function CartButton({ className, labelClassName, iconSize }: Props) {
  const count = cartCount(useCart())
  const [bumps, setBumps] = useState(0)
  useEffect(() => onCartAdded(() => setBumps((n) => n + 1)), [])
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
      {/* K4 board: the counter shows „0” too. Colours swapped: white on blue, navy at night. */}
      <span
        key={bumps}
        data-bump={bumps > 0 ? '' : undefined}
        className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-accent-ink px-1.5 text-[0.78rem] font-black text-accent-text"
      >
        {count}
        <span className="sr-only"> {plural(count, ['pozycja', 'pozycje', 'pozycji'])}</span>
      </span>
    </button>
  )
}

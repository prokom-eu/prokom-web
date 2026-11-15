'use client'

import { useEffect, useState } from 'react'

import { cartCount } from '@/lib/cart/cart'
import { onCartAdded, useCart } from '@/lib/cart/store'
import { plural } from '@/lib/plural'

/**
 * Live count of the inquiry list for the shared shell (capsule action, rail action, bottom bar
 * centre). The stored count shows after hydration; each addition bounces it once (`data-bump`).
 * K4: „0” shows too.
 */
export function CartCount({ className }: { className: string }) {
  const count = cartCount(useCart())
  const [bumps, setBumps] = useState(0)
  useEffect(() => onCartAdded(() => setBumps((n) => n + 1)), [])
  return (
    // `data-cart-count`: where „+ do zapytania” flies to (`flyToCart`).
    <em key={bumps} data-cart-count="" data-bump={bumps > 0 ? '' : undefined} className={className}>
      {count}
      <span className="sr-only"> {plural(count, ['pozycja', 'pozycje', 'pozycji'])}</span>
    </em>
  )
}

/** The plain number for slots that take a count (`SiteRail` action). */
export function useCartCount(): number {
  return cartCount(useCart())
}

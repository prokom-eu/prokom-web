'use client'

import Link from 'next/link'
import { useEffect, useMemo } from 'react'

import { cartMessage } from '@/lib/cart/cartMessage'
import { cartActions, useCart } from '@/lib/cart/store'
import { useCatalogIndex } from '@/lib/catalog/useCatalogIndex'
import { plural } from '@/lib/plural'
import { registerFormAttachment } from '@/lib/shared/formAttachment'

/**
 * The inquiry list „Do zapytania” on the Kontakt form (plan 0611 §8.2): shown above the fields and
 * sent under the message; a successful send empties it, as the drawer's form does. Nothing while
 * the list is empty.
 */
export function CartAttachment() {
  const cart = useCart()
  const catalog = useCatalogIndex(cart.length > 0)
  const names = useMemo(
    () => new Map(catalog.index?.products.map((product) => [product.slug, product.name])),
    [catalog.index],
  )
  const message = useMemo(() => cartMessage(cart, names), [cart, names])
  // Registered again when the list changes: the form reads the latest text when it sends.
  useEffect(
    () => registerFormAttachment(() => message, { onSent: () => cartActions.clear() }),
    [message],
  )

  if (cart.length === 0) return null
  return (
    <div className="mb-5 rounded-2xl border border-border bg-surface-2 p-4" data-cart-attachment>
      <p className="font-extrabold text-ink">
        Dołączymy Twoją listę „Do zapytania” · {cart.length}{' '}
        {plural(cart.length, ['pozycja', 'pozycje', 'pozycji'])}
      </p>
      <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-2">
        {cart.map((item) => (
          <li key={item.id}>
            {names.get(item.id) ?? item.id} × {item.q}
          </li>
        ))}
      </ul>
      <Link
        href="/zapytanie"
        className="mt-2 inline-block text-sm font-bold text-accent-text hover:underline"
      >
        Zmień listę →
      </Link>
    </div>
  )
}

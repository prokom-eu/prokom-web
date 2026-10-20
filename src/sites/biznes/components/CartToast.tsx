'use client'

import { useEffect, useState } from 'react'

import { cartCount } from '@/lib/cart/cart'
import { onCartAdded, openCartDrawer, useCart } from '@/lib/cart/store'

/** How long "Dodano do zapytania" stays (spec. §3.2: about 2.5 s). */
const SHOW_MS = 2500

/**
 * "Dodano do zapytania: <name>" after an item lands on the list (spec. §3.2), with a way to the
 * drawer — when added from the page (catalog card, product), not from inside a modal. A status region: screen readers announce it without moving focus. Above the phone's
 * bottom bar.
 */
export function CartToast() {
  const [added, setAdded] = useState<{ name: string; key: number } | null>(null)
  const count = cartCount(useCart())

  useEffect(
    () =>
      onCartAdded(({ name }) => {
        // Under an open modal (search, drawer) the toast would sit behind its backdrop: there
        // the ✓ switch and the list itself already show what happened.
        if (document.querySelector('dialog[open]')) return
        setAdded({ name, key: Date.now() })
      }),
    [],
  )

  useEffect(() => {
    if (!added) return
    const timer = window.setTimeout(() => setAdded(null), SHOW_MS)
    return () => window.clearTimeout(timer)
  }, [added])

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[5.5rem] z-50 flex justify-center px-4 sm:bottom-7"
    >
      {added && (
        <div
          key={added.key}
          className="pointer-events-auto flex max-w-full items-center gap-3.5 rounded-2xl bg-surface-dark py-3 pl-4 pr-3 text-[0.95rem] text-white shadow-2xl"
        >
          <span
            aria-hidden="true"
            className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full bg-ok"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M5 12l5 5L20 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="min-w-0">
            Dodano do zapytania: <b className="font-extrabold">{added.name}</b>
          </span>
          <button
            type="button"
            onClick={() => {
              setAdded(null)
              openCartDrawer()
            }}
            className="shrink-0 rounded-xl bg-white px-3 py-2 text-sm font-extrabold text-surface-dark"
          >
            Zobacz listę ({count})
          </button>
        </div>
      )}
    </div>
  )
}

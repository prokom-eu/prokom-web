'use client'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { cartActions, useCart } from '@/lib/cart/store'

/**
 * „Dodaj zestaw do zapytania (N)”: every product of the kit on the inquiry list in one write and
 * one toast (`addMany` skips what is listed already). Once all are listed it says so and does
 * nothing — `aria-disabled`, so the button keeps focus after the click (WCAG 2.4.3).
 */
export function AddKitButton({ name, slugs }: { name: string; slugs: string[] }) {
  const cart = useCart()
  const allListed = slugs.every((slug) => cart.some((entry) => entry.id === slug))
  return (
    <button
      type="button"
      aria-disabled={allListed}
      onClick={() => {
        if (allListed) return
        cartActions.addMany(slugs, () => `zestaw „${name}”`)
      }}
      className={cx(
        'inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-5 font-extrabold transition-colors',
        allListed
          ? 'cursor-default bg-ok/15 text-ink'
          : 'bg-accent-text text-accent-ink shadow-[0_14px_30px_-16px_var(--accent-text)] hover:bg-ink hover:text-surface',
      )}
    >
      {allListed ? (
        <>
          Zestaw jest w zapytaniu
          <Icon name="check" strokeWidth={2.6} className="size-4 text-ok-text" />
        </>
      ) : (
        `Dodaj zestaw do zapytania (${slugs.length})`
      )}
    </button>
  )
}

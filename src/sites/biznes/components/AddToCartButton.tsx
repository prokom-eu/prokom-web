'use client'

import { cx } from '@/components/ui/cx'
import { cartActions, useCart } from '@/lib/cart/store'

type Props = {
  slug: string
  name: string
  className?: string
  /** After the switch, e.g. to move focus when this button leaves the page. */
  onToggle?: () => void
}

/** Square "+ / ✓" switch of a product on the inquiry list (search results, suggestions). */
export function AddToCartButton({ slug, name, className, onToggle }: Props) {
  const on = useCart().some((item) => item.id === slug)
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${on ? 'Usuń z zapytania' : 'Dodaj do zapytania'}: ${name}`}
      onClick={() => {
        cartActions.toggle(slug, name)
        onToggle?.()
      }}
      className={cx(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-xl',
        on ? 'bg-accent-text text-accent-ink' : 'bg-surface-2 text-ink hover:bg-surface-3',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
        <path
          d={on ? 'M5 12l5 5L20 7' : 'M12 5v14M5 12h14'}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

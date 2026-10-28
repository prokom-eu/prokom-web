'use client'

import { cx } from '@/components/ui/cx'
import { addAction } from '@/lib/catalog/configurator'
import { cartActions, useCart } from '@/lib/cart/store'

import { useProductConfig } from './ProductConfig'

type Variant = 'primary' | 'compact' | 'light'

const STYLE: Record<Variant, string> = {
  primary:
    'min-h-[52px] rounded-2xl px-6 font-display text-base font-extrabold font-stretch-106% shadow-[0_18px_36px_-20px_var(--accent-text)]',
  compact: 'min-h-11 rounded-xl px-4 text-sm font-extrabold',
  light: 'min-h-[52px] rounded-2xl px-6 font-display text-base font-extrabold font-stretch-106%',
}

const IDLE: Record<Variant, string> = {
  primary: 'bg-accent-text text-accent-ink hover:bg-ink hover:text-surface',
  compact: 'bg-accent-text text-accent-ink hover:bg-ink hover:text-surface',
  light: 'bg-white text-surface-dark hover:bg-accent-on-dark',
}

const LISTED: Record<Variant, string> = {
  primary: 'bg-surface-2 text-ok-text shadow-[inset_0_0_0_1px_var(--border)] hover:text-warn',
  compact: 'bg-surface-2 text-ok-text shadow-[inset_0_0_0_1px_var(--border)] hover:text-warn',
  light: 'bg-white/10 text-white ring-1 ring-white/30 ring-inset hover:bg-white/20',
}

/**
 * „Dodaj do zapytania” of the product page: adds the product with the chosen version as the
 * item's note (K31-ZMIANY §13.7); on the list already — saves a changed version, else takes the
 * product off the list. Hero, section bar, configurator summary and the CTA band share it.
 */
export function ProductAddButton({
  variant = 'primary',
  className,
}: {
  variant?: Variant
  className?: string
}) {
  const { slug, name, note } = useProductConfig()
  const item = useCart().find((entry) => entry.id === slug)
  const action = addAction(Boolean(item), item?.uwaga ?? '', note)
  const label =
    action === 'add'
      ? 'Dodaj do zapytania'
      : action === 'update'
        ? 'Zapisz wybraną wersję'
        : 'Na liście zapytania'

  const onClick = () => {
    if (action === 'add') {
      cartActions.add(slug, name)
      if (note) cartActions.setNote(slug, note)
    } else if (action === 'update') {
      cartActions.setNote(slug, note)
    } else {
      cartActions.remove(slug)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={action === 'remove'}
      aria-label={action === 'remove' ? `Na liście zapytania: ${name} — usuń` : `${label}: ${name}`}
      className={cx(
        'inline-flex items-center justify-center gap-2 transition-colors',
        STYLE[variant],
        action === 'remove' ? LISTED[variant] : IDLE[variant],
        className,
      )}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d={action === 'remove' ? 'M5 12l5 5L20 7' : 'M12 5v14M5 12h14'}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  )
}

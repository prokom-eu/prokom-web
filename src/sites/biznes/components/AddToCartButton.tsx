'use client'

import { cx } from '@/components/ui/cx'
import { cartActions, useCart } from '@/lib/cart/store'

type Props = {
  slug: string
  name: string
  className?: string
  /**
   * `icon`: square "+ / ✓" (search results, suggestions);
   * `label`: "+ Do zapytania" / "✓ W zapytaniu" of the catalog cards (spec. §5.3);
   * `primary`: the big switch of the product box, "Dodaj do zapytania" / "✓ Na liście" (§6.2);
   * `onDark`: the same on a navy panel, "Dodaj do zapytania" / "✓ W zapytaniu" (/insert picker).
   */
  variant?: 'icon' | 'label' | 'primary' | 'onDark'
  /** After the switch, e.g. to move focus when this button leaves the page. */
  onToggle?: () => void
}

const PLUS = 'M12 5v14M5 12h14'
const CHECK = 'M5 12l5 5L20 7'

function Mark({ on, size, stroke }: { on: boolean; size: number; stroke: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d={on ? CHECK : PLUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Switch of a product on the inquiry list: adds, or removes when already there. */
export function AddToCartButton({ slug, name, className, variant = 'icon', onToggle }: Props) {
  const on = useCart().some((item) => item.id === slug)
  const toggle = () => {
    cartActions.toggle(slug, name)
    onToggle?.()
  }

  if (variant === 'primary') {
    const label = on ? 'Na liście' : 'Dodaj do zapytania'
    return (
      <button
        type="button"
        aria-pressed={on}
        aria-label={`${label}: ${name}`}
        onClick={toggle}
        className={cx(
          'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl px-5 font-display text-base font-extrabold transition-colors font-stretch-106%',
          on
            ? 'bg-surface-2 text-ok-text shadow-[inset_0_0_0_1px_var(--border)] hover:text-warn'
            : 'bg-accent-text text-accent-ink hover:bg-ink hover:text-surface',
          className,
        )}
      >
        <Mark on={on} size={18} stroke={2.6} />
        {label}
      </button>
    )
  }

  if (variant === 'onDark') {
    const label = on ? 'W zapytaniu' : 'Dodaj do zapytania'
    return (
      <button
        type="button"
        aria-pressed={on}
        aria-label={`${label}: ${name}`}
        onClick={toggle}
        className={cx(
          'inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl px-6 font-extrabold transition-colors',
          // Light surfaces in both themes: the panel is navy at day and at night.
          on
            ? 'bg-ok-text text-surface hover:bg-white hover:text-surface-dark'
            : 'bg-white text-surface-dark hover:bg-white/85',
          className,
        )}
      >
        <Mark on={on} size={16} stroke={2.6} />
        {label}
      </button>
    )
  }

  if (variant === 'label') {
    const label = on ? 'W zapytaniu' : 'Do zapytania'
    // The visible words start the accessible name (WCAG 2.5.3); the product name follows.
    return (
      <button
        type="button"
        aria-pressed={on}
        aria-label={`${label}: ${name}`}
        onClick={toggle}
        className={cx(
          'inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 text-sm font-extrabold transition-colors',
          on
            ? 'bg-surface-2 text-ok-text hover:text-warn'
            : 'bg-surface-2 text-ink hover:bg-accent-text hover:text-accent-ink',
          className,
        )}
      >
        <Mark on={on} size={15} stroke={2.6} />
        {label}
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${on ? 'Usuń z zapytania' : 'Dodaj do zapytania'}: ${name}`}
      onClick={toggle}
      className={cx(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-xl',
        on ? 'bg-accent-text text-accent-ink' : 'bg-surface-2 text-ink hover:bg-surface-3',
        className,
      )}
    >
      <Mark on={on} size={17} stroke={2.4} />
    </button>
  )
}

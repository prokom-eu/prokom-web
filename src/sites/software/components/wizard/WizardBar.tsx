'use client'

import { cx } from '@/components/ui/cx'

type Props = {
  label: string
  price: string
  /** Empty for a result without a price (the bar shows the price line only). */
  term: string
  action: { label: string; onClick: () => void } | null
  /** No price at all (apps, automations): the price reads as a plain line. */
  ask: boolean
}

/**
 * The live quote on the phone and tablet (≤ 1080 px, ZMIANY-v21 §3, MOBILE-APLIKACJA §3): a bar
 * at the bottom edge with the price, the term and the next step. While it is on the page,
 * `data-wizard-bar` hides the bottom tab bar and the „Twój projekt” pill (globals.css, `:has()`),
 * like the footer's CTA band — no JavaScript between the frame and the wizard.
 */
export function WizardBar({ label, price, term, action, ask }: Props) {
  return (
    <div
      data-wizard-bar
      className="fixed inset-x-2.5 bottom-[calc(10px+env(safe-area-inset-bottom))] z-40 flex items-center gap-3 rounded-[26px] border border-border bg-header-bg py-2.5 pl-4 pr-2.5 shadow-raised backdrop-blur-md backdrop-saturate-150 min-[1081px]:hidden"
    >
      <div className="min-w-0 flex-1" aria-live="polite">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-2">{label}</p>
        <p
          data-wizard-bar-price
          className={cx(
            'truncate font-display font-extrabold text-accent-text',
            ask ? 'text-base' : 'text-xl',
          )}
        >
          {price}
        </p>
        {term && <p className="truncate text-sm font-bold">{term}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-button px-5 font-display text-base font-extrabold text-accent-ink shadow-raised active:scale-[0.98]"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

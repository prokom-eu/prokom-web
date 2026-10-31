import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { LevelPlan } from '@/lib/software/pricing'

type Props = {
  plans: LevelPlan[]
  /** Text of each card's button and its link (care: the plan's `href`, the audit: one page). */
  button: (plan: LevelPlan) => { label: string; href: string } | null
  note?: string | null
}

/**
 * Levels of care or kinds of audit as cards (board `Cennik` „Spokój co miesiąc”, `Audyt`):
 * price, description, reaction or term, what the level gives and its button. The recommended
 * one is framed with „Polecamy” and comes first on the phone (spec. §6.4).
 */
export function LevelCards({ plans, button, note }: Props) {
  return (
    <ul className="grid gap-3 min-[1081px]:grid-cols-3 min-[1081px]:gap-3.5">
      {plans.map((plan) => {
        const link = button(plan)
        return (
          <li
            key={plan.name}
            className={cx(
              'relative flex flex-col gap-3 rounded-[26px] bg-card p-5 min-[641px]:p-6',
              plan.recommended
                ? 'order-first shadow-[inset_0_0_0_2px_var(--accent)] min-[1081px]:order-none'
                : 'shadow-[inset_0_0_0_1px_var(--border)]',
            )}
          >
            {plan.recommended ? (
              <span className="absolute -top-3 left-6 rounded-full bg-button px-3 py-1 text-xs font-extrabold text-accent-ink">
                Polecamy
              </span>
            ) : null}
            <h3 className="font-display text-xl font-extrabold">{plan.name}</h3>
            <p className="flex items-baseline gap-2">
              <b className="font-display text-[34px] font-extrabold leading-none text-accent-text">
                {plan.price}
              </b>
              {plan.period ? (
                <span className="text-sm font-bold text-ink-2">{plan.period}</span>
              ) : null}
            </p>
            {plan.description ? <p className="text-sm text-ink-2">{plan.description}</p> : null}
            {plan.term ? (
              <p className="flex items-center gap-2 rounded-xl bg-accent-soft px-3.5 py-2.5 text-sm font-extrabold text-accent-text">
                <Icon name="clock" className="size-4 shrink-0" />
                {plan.termLabel}: {plan.term}
              </p>
            ) : null}
            {plan.points.length > 0 ? (
              <ul className="flex flex-col gap-2 text-[15px]">
                {plan.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ok/15 text-ok-text"
                    >
                      <Icon name="check" strokeWidth={3} className="size-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            ) : null}
            {link ? (
              <div className="mt-auto flex flex-col items-stretch gap-2 pt-2">
                <Link
                  href={link.href}
                  className={cx(
                    'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-center font-extrabold active:scale-[0.98] motion-reduce:transition-none',
                    plan.recommended
                      ? 'bg-button text-accent-ink shadow-raised'
                      : 'border-[1.5px] border-border bg-card text-ink hover:border-accent-line',
                  )}
                >
                  {link.label}
                </Link>
                {note ? <small className="text-center text-xs text-ink-2">{note}</small> : null}
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

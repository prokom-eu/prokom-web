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
 * Levels of care or kinds of audit as v24 glass cards (ZMIANY-v24 §6.3, §9.1; board `AU-audyt`
 * „Trzy poziomy audytu”): price, description, reaction or term, what the level gives and its
 * button. The recommended one glows with „Polecamy” (closed list of glows, ADR-015 v24) and comes
 * first on the phone.
 */
export function LevelCards({ plans, button, note }: Props) {
  return (
    <ul className="grid gap-4 min-[1081px]:grid-cols-3">
      {plans.map((plan) => {
        const link = button(plan)
        return (
          <li
            key={plan.name}
            className={cx(
              'sw-glass relative flex flex-col gap-3 p-5 min-[641px]:p-6',
              plan.recommended && 'sw-glass-featured order-first min-[1081px]:order-none',
            )}
          >
            {plan.recommended ? (
              <span className="absolute top-5 right-5 rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-accent-ink">
                Polecamy
              </span>
            ) : null}
            <h3 className="pr-24 font-display text-xl font-extrabold">{plan.name}</h3>
            <p className="flex items-baseline gap-2">
              <b className="font-display text-[34px] font-black leading-none tracking-tight text-accent-text">
                {plan.price}
              </b>
              {plan.period ? (
                <span className="text-sm font-bold text-ink-2">{plan.period}</span>
              ) : null}
            </p>
            {plan.description ? <p className="text-sm text-ink-2">{plan.description}</p> : null}
            {plan.term ? (
              <p className="rounded-[14px] border border-border px-3.5 py-2.5 text-sm">
                <span className="sw-eyebrow block text-[10px]">{plan.termLabel}</span>
                <span className="font-bold">{plan.term}</span>
              </p>
            ) : null}
            {plan.points.length > 0 ? (
              <ul className="flex flex-col gap-2 text-[15px]">
                {plan.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text"
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
                  data-motion={plan.recommended ? 'button' : 'button-outline'}
                  className={cx(
                    'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-center font-extrabold',
                    plan.recommended
                      ? 'bg-button text-accent-ink'
                      : 'border border-border bg-card text-ink',
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

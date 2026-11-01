'use client'

import Link from 'next/link'
import { useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IndustryProblem } from '@/lib/software/industryPage'
import { projectActions, useProject } from '@/lib/software/projectStore'

import { OfferThumb } from '../offer/OfferThumb'

type Props = { problems: IndustryProblem[] }

/**
 * „Kliknij swój problem. Pokażemy, co na to mamy.” (spec. §6.2, board `Branza`): the problems as
 * buttons, the panel shows the answer — what we have, its points, the link and „+ Dodaj do
 * wyceny” (the problem's solution). The illustration is the solution's thumbnail (spec. §5.2).
 * Phone: the problems in a scrolled row above the panel.
 */
export function ProblemsExplorer({ problems }: Props) {
  const [active, setActive] = useState(0)
  const project = useProject()
  const [full, setFull] = useState(false)
  const problem = problems[active] ?? problems[0]
  if (!problem) return null
  const solution = problem.solution
  const added = solution ? project.some((entry) => entry.id === solution.slug) : false

  return (
    <div className="mt-6 grid gap-3 min-[1081px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] min-[1081px]:items-start">
      <ul
        aria-label="Problemy"
        className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] min-[1081px]:mx-0 min-[1081px]:flex-col min-[1081px]:overflow-visible min-[1081px]:px-0"
      >
        {problems.map((item, i) => {
          const on = i === active
          return (
            <li key={i} className="w-[82%] shrink-0 snap-start min-[1081px]:w-auto">
              <button
                type="button"
                aria-pressed={on}
                aria-controls="problem-panel"
                onClick={() => {
                  setActive(i)
                  setFull(false)
                }}
                className={cx(
                  'flex h-full min-h-[72px] w-full items-center gap-3.5 rounded-2xl bg-card p-3.5 text-left active:scale-[0.99] motion-reduce:transition-none',
                  on
                    ? 'shadow-[inset_0_0_0_2px_var(--accent)]'
                    : 'shadow-[inset_0_0_0_1px_var(--border)]',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    'inline-flex size-11 shrink-0 items-center justify-center rounded-xl',
                    on ? 'bg-button text-accent-ink' : 'bg-surface-2 text-accent-text',
                  )}
                >
                  <Icon name={item.icon ?? 'chat'} className="size-5" />
                </span>
                <span className="min-w-0">
                  <b className={cx('block font-extrabold', !on && 'text-ink-soft')}>
                    „{item.question}”
                  </b>
                  {item.note && <span className="text-sm text-ink-2">{item.note}</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div
        id="problem-panel"
        className="grid overflow-hidden rounded-[24px] bg-card shadow-[inset_0_0_0_1px_var(--border)] min-[641px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      >
        <div className="p-5 min-[641px]:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text">
            Na to mamy
          </p>
          <h3
            aria-live="polite"
            className="mt-2 font-display text-2xl font-extrabold leading-tight min-[641px]:text-[28px]"
          >
            {problem.title ?? solution?.name ?? problem.question}
          </h3>
          {problem.text && <p className="mt-3 text-[15px] text-ink-2">{problem.text}</p>}
          {problem.features.length > 0 && (
            <ul className="mt-4 space-y-2 text-[15px]">
              {problem.features.map((feature) => (
                <li key={feature} className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text"
                  >
                    <Icon name="check" className="size-3" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 flex flex-col gap-2.5 min-[641px]:items-start">
            {problem.cta && (
              <Link
                href={problem.cta.href}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card px-5 font-extrabold active:scale-[0.98] motion-reduce:transition-none"
              >
                {problem.cta.label}
              </Link>
            )}
            {solution && (
              <button
                type="button"
                aria-pressed={added}
                aria-label={
                  added ? `W wycenie: ${solution.name}` : `Dodaj do wyceny: ${solution.name}`
                }
                onClick={() => setFull(!projectActions.toggle(solution.slug, solution.name))}
                className={cx(
                  'inline-flex min-h-12 items-center justify-center rounded-2xl px-5 font-extrabold active:scale-[0.98] motion-reduce:transition-none',
                  added
                    ? 'bg-card text-accent-text ring-2 ring-accent-line'
                    : 'bg-button text-accent-ink shadow-raised',
                )}
              >
                {added ? '✓ W wycenie' : '+ Dodaj do wyceny'}
              </button>
            )}
            {full && (
              <p role="status" className="text-sm text-ink-2">
                Lista jest pełna — wyślij ją albo usuń coś z projektu.
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center bg-stage p-5 min-[641px]:p-7">
          <OfferThumb src={solution?.thumbnail ?? undefined} className="w-full" />
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useId, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { cardPrice } from '@/lib/software/cardPrice'
import { MAX_PROJECT_ITEMS } from '@/lib/software/project'
import { projectActions, useProject } from '@/lib/software/projectStore'
import type { IndexSolution } from '@/lib/software/solutionsIndex'
import type { PriceDisplay } from '@/lib/software/wizard'

import { CardScene } from './CardScene'

type Props = {
  solution: IndexSolution
  display: PriceDisplay
  /** Names of the situations (`Z` → „Zaczynam od zera”). */
  situationNames: Readonly<Record<string, string>>
  open: boolean
  onToggle: () => void
}

/** The solution page comes with SW10; without a live preview the card asks instead. */
const solutionHref = (slug: string) => `/rozwiazania/${slug}`

/**
 * Solution card of the catalog (spec. §5, board `Katalog`) — also the card of „12 rzeczy” later
 * (SW5). Collapsed: scene, category, „podgląd”, name, lead, the „od” price and the start term.
 * Its name is a disclosure button stretched over the card; the expanded part adds what you get,
 * the versions with price and term, the scope line, for whom and situations, and the actions:
 * „Zobacz podgląd” (or „Zapytaj”) and „+ Do projektu” / „✓ W projekcie”.
 */
export function SolutionCard({ solution, display, situationNames, open, onToggle }: Props) {
  const panelId = useId()
  const project = useProject()
  const [full, setFull] = useState(false)
  const added = project.some((item) => item.id === solution.slug)
  const price = cardPrice(solution, display)

  return (
    <article
      className={cx(
        'relative grid grid-cols-[104px_1fr] gap-x-3.5 rounded-[22px] border bg-card p-3.5 transition-shadow sm:flex sm:flex-col',
        open ? 'border-accent-text shadow-raised' : 'border-border hover:shadow-raised',
      )}
    >
      <CardScene
        category={solution.category}
        tag={solution.tag}
        cardGradient={solution.cardGradient}
      />
      <div className="flex min-w-0 flex-1 flex-col sm:px-1.5 sm:pb-1 sm:pt-4">
        <div className="flex min-h-7 items-center justify-between gap-2">
          {solution.label && (
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text">
              {solution.label}
            </span>
          )}
          {solution.hasLivePreview && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-ok-text">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-ok" />
              podgląd
            </span>
          )}
        </div>
        <h3 className="mt-1.5 font-display text-lg font-extrabold leading-snug">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
            // The whole card opens it; the actions of the expanded part sit above (z-10).
            className="text-left after:absolute after:inset-0 after:rounded-[22px] after:content-['']"
          >
            {solution.name}
          </button>
        </h3>
        {solution.lead && <p className="mt-1.5 text-sm text-ink-2">{solution.lead}</p>}
        <p className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pt-4">
          <span className={price.ask ? 'font-extrabold text-accent-text' : 'text-ink'}>
            {price.head.before && <small className="text-xs font-bold">{price.head.before} </small>}
            <b className={price.ask ? 'text-base' : 'text-lg font-extrabold'}>
              {price.head.amount}
            </b>
            {price.head.after && <small className="text-xs font-bold"> {price.head.after}</small>}
          </span>
          <span className="text-xs font-bold text-ink-2">{price.term}</span>
        </p>
      </div>

      <div
        id={panelId}
        hidden={!open}
        className="relative z-10 col-span-2 mt-3 border-t border-border px-1.5 pt-4"
      >
        {solution.features.length > 0 && (
          <>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-2">
              Co dostajesz
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {solution.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Icon name="check" strokeWidth={2.6} className="mt-0.5 size-4 text-ok-text" />
                  {feature}
                </li>
              ))}
            </ul>
          </>
        )}
        {price.versions.length > 0 && (
          <dl className="mt-4 grid grid-cols-3 gap-2">
            {price.versions.map((version, i) => (
              <div
                key={version.size}
                className={cx(
                  'rounded-xl border p-2.5 text-center',
                  i === 1 ? 'border-accent-line bg-accent-soft' : 'border-border',
                )}
              >
                <dt className="text-xs font-bold text-ink-2">{version.name}</dt>
                <dd className="mt-1 text-sm font-extrabold">{version.price}</dd>
                {version.term && <dd className="mt-0.5 text-xs text-ink-2">{version.term}</dd>}
              </div>
            ))}
          </dl>
        )}
        {solution.priceNote && <p className="mt-3 text-xs text-ink-2">{solution.priceNote}</p>}
        {solution.forWhom && (
          <p className="mt-3 text-sm text-ink-2">
            <b className="text-ink">Dla kogo:</b> {solution.forWhom}
          </p>
        )}
        {solution.situations.length > 0 && (
          <p className="mt-1.5 text-sm text-ink-2">
            <b className="text-ink">Sytuacja:</b>{' '}
            {solution.situations
              .map((situation) => situationNames[situation] ?? situation)
              .join(' · ')}
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={solution.hasLivePreview ? solutionHref(solution.slug) : '/kontakt'}
            className="flex min-h-11 items-center justify-center rounded-xl border border-border px-3 text-sm font-bold"
          >
            {solution.hasLivePreview ? 'Zobacz podgląd' : 'Zapytaj'}
          </Link>
          <button
            type="button"
            aria-pressed={added}
            onClick={() => setFull(!projectActions.toggle(solution.slug, solution.name))}
            className={cx(
              'flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-bold',
              added ? 'bg-accent-soft text-accent-text' : 'bg-button text-accent-ink',
            )}
          >
            {added ? '✓ W projekcie' : '+ Do projektu'}
          </button>
        </div>
        {full && !added && (
          <p role="status" className="mt-2 text-xs font-bold text-ink-2">
            Twój projekt ma już {MAX_PROJECT_ITEMS} pozycji — usuń którąś, żeby dodać tę.
          </p>
        )}
      </div>
    </article>
  )
}

'use client'

import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { CATALOG_PATH } from '@/lib/software/catalog'
import { projectActions } from '@/lib/software/projectStore'
import type { ProjectSummary } from '@/lib/software/projectSummary'
import { OfferThumb } from '@/sites/software/components/offer/OfferThumb'

/** Ticket icon of the board's „Twój projekt” header. */
function TicketIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4 shrink-0"
    >
      <path d="M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4zM10 7v12" />
    </svg>
  )
}

/**
 * „Twój projekt” above the `/kontakt` form (spec. §6.10; stany `kontakt-99b/99c`): items with
 * thumbnail, term and „od” price, ×, the sum and the note. Empty after `?projekt=1` → a line
 * with the link to the offer (the form works without a list).
 */
export function ProjectBox({ summary }: { summary: ProjectSummary }) {
  const count = summary.rows.length
  return (
    <section
      aria-labelledby="twoj-projekt-h"
      className="rounded-[22px] bg-accent-soft p-4 shadow-[inset_0_0_0_1.5px_var(--accent-line)] min-[641px]:p-[18px]"
    >
      <div className="flex items-center gap-2.5">
        <h3
          id="twoj-projekt-h"
          className="flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.12em] text-accent-text"
        >
          <TicketIcon />
          Twój projekt
        </h3>
        {count > 0 && (
          <span className="inline-flex min-w-8 justify-center rounded-full bg-button px-2.5 py-0.5 text-[13px] font-extrabold text-accent-ink">
            {count}
          </span>
        )}
        <Link
          href={CATALOG_PATH}
          className="ml-auto inline-flex min-h-11 items-center px-1 text-sm font-extrabold text-ink hover:text-accent-text"
        >
          + Dodaj<span className="max-[640px]:hidden">&nbsp;coś jeszcze</span>
        </Link>
      </div>

      {count === 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Twój projekt jest pusty. Dodaj rozwiązania z{' '}
          <Link href={CATALOG_PATH} className="font-bold text-accent-text underline">
            pełnej oferty
          </Link>{' '}
          albo po prostu opisz niżej, czego potrzebujesz.
        </p>
      ) : (
        <>
          <ul className="mt-3 flex flex-col gap-2">
            {summary.rows.map((row) => (
              <li
                key={row.id}
                className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-x-3 rounded-2xl bg-card p-2.5 shadow-[inset_0_0_0_1px_var(--border)] min-[641px]:grid-cols-[72px_minmax(0,1fr)_auto_auto]"
              >
                <OfferThumb src={row.thumbnail} className="rounded-[10px]" />
                <span className="min-w-0">
                  <b className="block text-[15px] leading-snug">{row.name}</b>
                  <span className="block text-[13px] text-ink-2">{row.sub}</span>
                  <b
                    className={cx(
                      'mt-1.5 block text-[15px] min-[641px]:hidden',
                      row.ask && 'text-ink-2',
                    )}
                  >
                    {row.price}
                  </b>
                </span>
                <b
                  className={cx(
                    'whitespace-nowrap text-[15px] max-[640px]:hidden',
                    row.ask && 'text-ink-2',
                  )}
                >
                  {row.price}
                </b>
                <button
                  type="button"
                  onClick={() => projectActions.remove(row.id)}
                  aria-label={`Usuń z projektu: ${row.name}`}
                  className="inline-flex size-11 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-ink active:scale-95 motion-reduce:transition-none"
                >
                  <Icon name="x" className="size-[18px]" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-dashed border-accent-line px-1.5 pt-3 max-[640px]:flex-col">
            <span className="text-[15px] font-semibold text-ink-2">{summary.sumLabel}</span>
            <b className="font-display text-[22px] font-extrabold">{summary.sum}</b>
          </div>
          <p className="mt-2 px-1.5 text-[13.5px] leading-relaxed text-ink-2">{summary.note}</p>
        </>
      )}
    </section>
  )
}

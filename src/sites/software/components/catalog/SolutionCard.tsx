import { cardPrice } from '@/lib/software/cardPrice'
import type { IndexSolution } from '@/lib/software/solutionsIndex'
import type { PriceDisplay } from '@/lib/software/wizard'

import { OfferThumb } from '../offer/OfferThumb'

type Props = {
  solution: IndexSolution
  display: PriceDisplay
  /** First row of the list: the thumbnail loads at once. */
  eager?: boolean
  /** The card opens the offer window (spec. §5.1). */
  onOpen: () => void
}

/**
 * Catalog card v22 (spec. §5, `stany/okno-99-katalog-karty-*`): thumbnail, category and
 * „podgląd”, name, lead, the „od” price and the „od” term. No expanding part and no versions —
 * the name is a button stretched over the card that opens the offer window; „+ Dodaj do wyceny”
 * lives there. Phone: thumbnail beside the name, the lead under both (board).
 */
export function SolutionCard({ solution, display, eager = false, onOpen }: Props) {
  const price = cardPrice(solution, display)
  return (
    <article
      // `data-card`: takes the press state of its stretched name button (globals.css).
      data-card
      className="relative grid h-full grid-cols-[128px_1fr] gap-x-4 rounded-[22px] border border-border bg-card p-3.5 transition-shadow hover:shadow-raised sm:flex sm:flex-col"
    >
      <OfferThumb src={solution.thumbnail} eager={eager} className="self-start" />
      <div className="flex min-w-0 flex-col sm:mt-4 sm:px-1.5">
        {/* Fixed height: the names of cards in one row start on one line (spec. §5). */}
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
            aria-haspopup="dialog"
            onClick={onOpen}
            // `data-stretched`: no press transform on it (globals.css), the card takes it.
            data-stretched
            className="text-left after:absolute after:inset-0 after:rounded-[22px] after:content-['']"
          >
            {solution.name}
          </button>
        </h3>
      </div>
      <div className="col-span-2 flex flex-1 flex-col sm:px-1.5 sm:pb-1">
        {solution.lead && <p className="mt-2 text-sm text-ink-2">{solution.lead}</p>}
        <p className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-dashed border-border pt-3 sm:border-0 sm:pt-4 max-sm:mt-3">
          <span className={price.ask ? 'font-extrabold text-accent-text' : 'text-ink'}>
            {price.head.before && <small className="text-xs font-bold">{price.head.before} </small>}
            <b className={price.ask ? 'text-base' : 'text-lg font-extrabold'}>
              {price.head.amount}
            </b>
            {price.head.after && <small className="text-xs font-bold"> {price.head.after}</small>}
          </span>
          <span className="text-xs font-bold text-ink-2">
            {solution.leadTime ? `termin ${price.term}` : price.term}
          </span>
        </p>
      </div>
    </article>
  )
}

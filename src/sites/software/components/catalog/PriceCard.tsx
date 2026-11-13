import type { MouseEvent } from 'react'

import type { PricingCard } from '@/lib/software/priceCards'
import { Mockup } from '@/sites/software/components/mockups/MockupLazy'

import { preloadSolutionDialog } from '../offer/SolutionDialogLazy'
import { NearScreen } from '../ui/NearScreen'
import { SolutionLink } from '../ui/SolutionLink'

type Props = {
  card: PricingCard
  /** Hover label on the mock-up („Szczegóły →”). */
  details: string
  /** The solution's own page (`/rozwiazania/<slug>`): indexable, opened by Ctrl/⌘-click (SEO). */
  href: string
  /** The offer window (`?rozwiazanie=`): where a plain click goes when the window is not here. */
  open: string
  /** Opens the window in place (catalog, price page); a plain click only. */
  onOpen?: () => void
  /** The mock-up mounts only near the screen (the start page's price list, SWA13 #7). */
  lazyThumb?: boolean
}

const plainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

/**
 * Price card of Software v24 (ZMIANY-v24 §4.2, §6.2): the solution's mock-up, group, name, lead,
 * „od” price and term. The same card on the start page, the catalog and the price page; a click
 * opens the offer window (`?rozwiazanie=`). The link is named by its visible text (no `aria-label`:
 * a name in another order than the text fails WCAG 2.5.3 „label in name”, axe).
 */
export function PriceCard({ card, details, href, open, onOpen, lazyThumb = false }: Props) {
  return (
    <SolutionLink
      href={href}
      open={open}
      className="sw-glass v-card"
      data-card=""
      onPointerEnter={onOpen ? preloadSolutionDialog : undefined}
      onFocus={onOpen ? preloadSolutionDialog : undefined}
      onClick={(event) => {
        if (!onOpen || !plainClick(event)) return
        event.preventDefault()
        // A plain CSS entry, no View Transitions (SWA14 §2: the page's named parts were drawn
        // over the window while it was captured).
        onOpen()
      }}
    >
      <div className="v-card-th" aria-hidden="true">
        {card.mockup && (
          // On the start page mounted near the screen only (16 cards × ~70 elements, SWA13 #7).
          <NearScreen eager={!lazyThumb}>
            <Mockup kind={card.mockup.kind} variant={card.mockup.variant} fit="contain" />
          </NearScreen>
        )}
        <span className="v-card-more">{details}</span>
      </div>
      <div className="v-card-bd">
        <span className="sw-eyebrow">{card.group}</span>
        <b>{card.name}</b>
        <span className="v-card-lead">{card.lead}</span>
        <div className="v-card-ft">
          {/* No price: a small badge, not the price's type; its term would only repeat it. */}
          {card.ask ? (
            <span className="v-ask">{card.price}</span>
          ) : (
            <>
              <b>{card.price}</b>
              {card.term}
            </>
          )}
        </div>
      </div>
    </SolutionLink>
  )
}

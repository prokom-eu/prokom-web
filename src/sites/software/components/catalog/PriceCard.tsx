import Link from 'next/link'
import type { MouseEvent } from 'react'

import type { PricingCard } from '@/lib/software/priceCards'
import { Mockup } from '@/sites/software/components/mockups/Mockup'

import { openOfferFrom } from '../offer/offerTransition'

type Props = {
  card: PricingCard
  /** Hover label on the mock-up („Szczegóły →”). */
  details: string
  /** Address of the offer window — works without JS and with Ctrl/⌘-click. */
  href: string
  /** Opens the window in place (catalog, price page); a plain click only. */
  onOpen?: () => void
}

const plainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

/**
 * Price card of Software v24 (ZMIANY-v24 §4.2, §6.2): the solution's mock-up, group, name, lead,
 * „od” price and term. The same card on the start page, the catalog and the price page; a click
 * opens the offer window (`?rozwiazanie=`). The link is named by its visible text (no `aria-label`:
 * a name in another order than the text fails WCAG 2.5.3 „label in name”, axe).
 */
export function PriceCard({ card, details, href, onOpen }: Props) {
  return (
    <Link
      href={href}
      className="sw-glass v-card"
      data-card=""
      onClick={(event) => {
        if (!onOpen || !plainClick(event)) return
        event.preventDefault()
        // The card's mock-up grows into the window's (OKNO-OFERTY-PREMIUM §2.5).
        openOfferFrom(event.currentTarget, onOpen)
      }}
    >
      <div className="v-card-th" aria-hidden="true">
        {card.mockup && (
          <Mockup kind={card.mockup.kind} variant={card.mockup.variant} fit="contain" />
        )}
        <span className="v-card-more">{details}</span>
      </div>
      <div className="v-card-bd">
        <span className="sw-eyebrow">{card.group}</span>
        <b>{card.name}</b>
        <span className="v-card-lead">{card.lead}</span>
        <div className="v-card-ft">
          <b>{card.price}</b>
          {card.term}
        </div>
      </div>
    </Link>
  )
}

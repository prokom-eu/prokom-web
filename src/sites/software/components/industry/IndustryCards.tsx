'use client'

import { useState } from 'react'

import { OFFER_GROUPS, offerGroup } from '@/lib/software/catalog'
import type { OfferView } from '@/lib/software/offer'
import { offerHref, solutionCard } from '@/lib/software/priceCards'
import type { IndexSolution } from '@/lib/software/solutionsIndex'
import type { PriceDisplay } from '@/lib/software/priceDisplay'

import { PriceCard } from '../catalog/PriceCard'
import { SolutionDialog } from '../offer/SolutionDialogLazy'

const groupName = (solution: IndexSolution) =>
  OFFER_GROUPS.find(({ value }) => value === offerGroup(solution))?.short ?? ''

type Props = {
  cards: IndexSolution[]
  display: PriceDisplay
  offers: Readonly<Record<string, OfferView>>
}

/**
 * „Sześć rzeczy, od których zaczynają firmy takie jak Twoja” (spec. §6.2 v22,
 * `stany/okno-99-branza-karty-1440-light`): the v24 price cards with a mock-up and the „od”
 * price; a card opens the offer window (←/→ along these cards, „+ Dodaj do wyceny” there). The
 * window keeps no address here — the phone's „back” closes it.
 */
export function IndustryCards({ cards, display, offers }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const list = cards.map((card) => card.slug).filter((slug) => offers[slug])
  return (
    <>
      <ul className="v-cards mt-6">
        {cards.map((card) => (
          <li key={card.slug}>
            <PriceCard
              card={solutionCard(card, display, groupName(card))}
              details="Szczegóły →"
              href={offerHref(card.slug)}
              onOpen={() => setOpen(card.slug)}
            />
          </li>
        ))}
      </ul>
      <SolutionDialog
        views={offers}
        slug={open && offers[open] ? open : null}
        list={list}
        onSwitch={setOpen}
        onClose={() => setOpen(null)}
        closeOnBack
      />
    </>
  )
}

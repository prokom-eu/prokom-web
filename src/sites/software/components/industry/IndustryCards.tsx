'use client'

import { useState } from 'react'

import type { OfferView } from '@/lib/software/offer'
import { CATEGORY_AREA } from '@/lib/software/options'
import type { IndexSolution } from '@/lib/software/solutionsIndex'
import type { PriceDisplay } from '@/lib/software/wizard'

import { SolutionCard } from '../catalog/SolutionCard'
import { SolutionDialog } from '../offer/SolutionDialog'

type Props = {
  cards: IndexSolution[]
  display: PriceDisplay
  offers: Readonly<Record<string, OfferView>>
}

/**
 * „Sześć rzeczy, od których zaczynają firmy takie jak Twoja” (spec. §6.2 v22,
 * `stany/okno-99-branza-karty-1440-light`): the catalog cards with a thumbnail and the „od”
 * price; a card opens the offer window (←/→ along these cards, „+ Dodaj do wyceny” there). The
 * window keeps no address here — the phone's „back” closes it.
 */
export function IndustryCards({ cards, display, offers }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const list = cards.map((card) => card.slug).filter((slug) => offers[slug])
  return (
    <>
      <ul className="mt-6 grid gap-3 min-[641px]:grid-cols-2 min-[1081px]:grid-cols-3">
        {cards.map((card, i) => (
          <li key={card.slug}>
            <SolutionCard
              solution={card}
              display={display}
              tone={offers[card.slug]?.tone ?? CATEGORY_AREA[card.category]}
              eager={i < 3}
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

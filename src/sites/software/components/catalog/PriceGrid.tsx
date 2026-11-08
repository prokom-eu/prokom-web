'use client'

import { useState } from 'react'

import { plural } from '@/lib/plural'
import { OFFER_GROUPS } from '@/lib/software/catalog'
import type { OfferView } from '@/lib/software/offer'
import { offerHref, type PricingCard } from '@/lib/software/priceCards'

import { SolutionDialog } from '../offer/SolutionDialogLazy'
import { Chip } from '../ui/Chip'
import { PriceCard } from './PriceCard'

type Props = {
  /** Every published solution as a card, group by group (\`card.group\` = the group's short name). */
  cards: PricingCard[]
  offers: Readonly<Record<string, OfferView>>
  /** Name of the chips' group for screen readers. */
  label: string
}

/**
 * The solutions grid of \`/cennik\` (ZMIANY-v24 §6.3): the price cards of the start page with the
 * four offer groups as filters; a card opens the offer window in place (it keeps no address of its
 * own here — the phone's „back” closes it). Without JS a card is a link to the catalog window.
 */
export function PriceGrid({ cards, offers, label }: Props) {
  const [filter, setFilter] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const shown = filter ? cards.filter((card) => card.group === filter) : cards
  const groups = OFFER_GROUPS.map(({ short }) => short).filter((short) =>
    cards.some((card) => card.group === short),
  )
  const list = shown.map((card) => card.slug).filter((slug) => offers[slug])
  return (
    <>
      <div className="v-chips v-chips-scroll v-filters" role="group" aria-label={label}>
        <Chip pressed={filter === null} onClick={() => setFilter(null)}>
          Wszystko · {cards.length}
        </Chip>
        {groups.map((group) => (
          <Chip key={group} pressed={filter === group} onClick={() => setFilter(group)}>
            {group} · {cards.filter((card) => card.group === group).length}
          </Chip>
        ))}
      </div>
      <p className="sr-only" role="status">
        {shown.length} {plural(shown.length, ['rozwiązanie', 'rozwiązania', 'rozwiązań'])}
      </p>
      <ul className="v-cards">
        {shown.map((card) => (
          <li key={card.slug}>
            <PriceCard
              card={card}
              details="Szczegóły →"
              href={offerHref(card.slug)}
              onOpen={offers[card.slug] ? () => setOpen(card.slug) : undefined}
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

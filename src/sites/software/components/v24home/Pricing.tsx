'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { MockupKind } from '@/lib/software/mockups'
import { Mockup } from '@/sites/software/components/mockups/Mockup'
import { Chip } from '@/sites/software/components/ui/Chip'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'

import { offerHref } from './prices'

/** One card: everything from `Solutions` (name, lead, price, term, mock-up), counted on the server. */
export type PricingCard = {
  slug: string
  name: string
  lead: string
  group: string
  price: string
  term: string
  mockup: { kind: MockupKind; variant: string | null } | null
}

type Props = {
  eyebrow: string
  title: string
  em?: string
  lead?: string
  all: string
  details: string
  groups: string[]
  cards: PricingCard[]
}

/**
 * „Cena i termin. Od razu.” (ZMIANY-v24 §4 pkt 8, §4.2): filters by group with their counts and
 * cards with the solution's mock-up, „od” price and term; a card opens the offer window
 * (`/rozwiazania?rozwiazanie=`). Prices and terms only from `Solutions`.
 */
export function PricingSection({ eyebrow, title, em, lead, all, details, groups, cards }: Props) {
  const [filter, setFilter] = useState<string | null>(null)
  const shown = filter ? cards.filter((card) => card.group === filter) : cards
  return (
    <section id="cennik" className="v-sec">
      <div className="v-wrap">
        <SectionHead eyebrow={eyebrow} title={title} em={em} lead={lead} />
        <div className="v-chips v-chips-scroll v-filters" role="group" aria-label={eyebrow}>
          <Chip pressed={filter === null} onClick={() => setFilter(null)}>
            {all} · {cards.length}
          </Chip>
          {groups.map((group) => (
            <Chip key={group} pressed={filter === group} onClick={() => setFilter(group)}>
              {group} · {cards.filter((card) => card.group === group).length}
            </Chip>
          ))}
        </div>
        <ul className="v-cards" aria-live="polite">
          {shown.map((card) => (
            <li key={card.slug}>
              <Link href={offerHref(card.slug)} className="sw-glass v-card" data-card="">
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
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

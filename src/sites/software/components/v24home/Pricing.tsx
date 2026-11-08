'use client'

import { useState } from 'react'

import type { SoftwareHome } from '@/lib/software/home'
import { plural } from '@/lib/plural'
import { PriceCard } from '@/sites/software/components/catalog/PriceCard'
import { Chip } from '@/sites/software/components/ui/Chip'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'

import { offerHref, type PricingCard } from '@/lib/software/priceCards'

type Props = { pricing: NonNullable<SoftwareHome['pricing']>; cards: PricingCard[] }

/**
 * „Cena i termin. Od razu.” (ZMIANY-v24 §4 pkt 8, §4.2): filters by group with their counts and
 * cards with the solution's mock-up, „od” price and term; a card opens the offer window
 * (`/rozwiazania?rozwiazanie=`). Prices and terms only from `Solutions`. After a filter a short
 * status says how many cards are left (the cards themselves are not read out).
 */
export function PricingSection({ pricing, cards }: Props) {
  const [filter, setFilter] = useState<string | null>(null)
  const shown = filter ? cards.filter((card) => card.group === filter) : cards
  const groups = pricing.groups.map((group) => group.label)
  return (
    <section id="cennik" className="v-sec">
      <div className="v-wrap">
        <SectionHead
          eyebrow={pricing.eyebrow}
          title={pricing.title}
          em={pricing.em}
          lead={pricing.lead}
        />
        <div className="v-chips v-chips-scroll v-filters" role="group" aria-label={pricing.eyebrow}>
          <Chip pressed={filter === null} onClick={() => setFilter(null)}>
            {pricing.all} · {cards.length}
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
            <li key={`${card.group}-${card.slug}`}>
              <PriceCard card={card} details={pricing.details} href={offerHref(card.slug)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

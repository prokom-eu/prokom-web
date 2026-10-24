import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import type { BzQuickCardsBlock as BzQuickCardsBlockData } from '@/payload-types'

/** Three cards with the usual matters and their next step (plansza Kontakt). */
export function BzQuickCardsBlock({ block }: { block: BzQuickCardsBlockData }) {
  const cards = block.cards ?? []
  if (cards.length === 0) return null
  return (
    <section aria-label="Najczęstsze sprawy" className="pb-4">
      <Container wide>
        <ul className="grid gap-4 md:grid-cols-3">
          {cards.map((card, i) => (
            <li
              key={card.id ?? i}
              className="flex flex-col gap-2.5 rounded-[26px] bg-card p-6 shadow-[inset_0_0_0_1px_var(--border)] sm:p-7"
            >
              <h2 className="font-display text-[1.375rem] leading-tight font-extrabold text-ink">
                {card.title}
              </h2>
              <p className="leading-relaxed text-ink-2">{card.text}</p>
              <Link
                href={card.href}
                className="mt-auto pt-3 font-extrabold text-accent-text hover:underline"
              >
                {card.linkLabel} →
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

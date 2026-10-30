import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'

import { WandIcon } from './FrameIcons'

type Card = { title: string; caption: string | null; href: string; icon: IconName | 'wand' }

type Props = {
  /** Texts with facts [SZEF] already filled (`fillText`); `null` = the line is hidden. */
  lead: string | null
  quoteCaption: string | null
  phone: { label: string; href: string; caption: string | null } | null
}

/**
 * Contact block at the end of every Software subpage (spec. §6.0; board `Katalog` → `#kontakt`):
 * three ways — the wizard, a free quote and the line's phone (`SiteSettings.phone`; without one
 * the card goes). Texts of the board; the promises [SZEF] come filled from the facts.
 */
export function ContactBlock({ lead, quoteCaption, phone }: Props) {
  const cards: Card[] = [
    {
      title: 'Kreator w 60 sekund',
      caption: '5 krótkich pytań, widełki ceny od razu',
      href: '/dobierz',
      icon: 'wand',
    },
    { title: 'Bezpłatna wycena', caption: quoteCaption, href: '/kontakt', icon: 'chat' },
    ...(phone
      ? [{ title: phone.label, caption: phone.caption, href: phone.href, icon: 'phone' as const }]
      : []),
  ]
  return (
    // `data-final-cta`: the page ends with this CTA — the footer drops its CTA band (SWR2).
    <section id="kontakt" aria-labelledby="kontakt-tytul" data-final-cta className="py-16">
      <Container wide>
        <div className="grid gap-8 rounded-[28px] border border-accent-line bg-accent-soft p-6 sm:p-10 min-[1081px]:grid-cols-[1fr_1.1fr] min-[1081px]:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text">
              Nie wiesz, co wybrać?
            </p>
            <h2
              id="kontakt-tytul"
              className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl"
            >
              Powiedz, co chcesz usprawnić. Resztę dobierzemy razem.
            </h2>
            {lead && <p className="mt-3 text-lg text-ink-2">{lead}</p>}
          </div>
          <ul className="space-y-3">
            {cards.map((card, i) => (
              <li key={card.href}>
                <Link
                  href={card.href}
                  className={
                    i === 0
                      ? 'flex min-h-[72px] items-center gap-4 rounded-2xl bg-button p-4 text-accent-ink shadow-raised'
                      : 'flex min-h-[72px] items-center gap-4 rounded-2xl border border-border bg-card p-4'
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      i === 0
                        ? 'inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface/20'
                        : 'inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-text'
                    }
                  >
                    {card.icon === 'wand' ? (
                      <WandIcon className="size-5" />
                    ) : (
                      <Icon name={card.icon} className="size-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block font-extrabold">{card.title}</b>
                    {card.caption && (
                      <small className={i === 0 ? 'block text-sm' : 'block text-sm text-ink-2'}>
                        {card.caption}
                      </small>
                    )}
                  </span>
                  <Icon name="arrow" strokeWidth={2.2} className="size-5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}

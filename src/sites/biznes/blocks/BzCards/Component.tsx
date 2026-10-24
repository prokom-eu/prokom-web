import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { BzCardsBlock as BzCardsBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { TONE_ICON } from '../../components/home/tones'
import { hasLink } from '../../components/PageLink'

type MonogramTone = NonNullable<BzCardsBlockData['cards'][number]['monogramTone']>

// Whole class names, so Tailwind finds them (tone tokens of the Biznes tiles).
const MONOGRAM: Record<MonogramTone, string> = {
  blue: cx('bg-linear-145', TONE_ICON.blue),
  green: cx('bg-linear-145', TONE_ICON.green),
  violet: cx('bg-linear-145', TONE_ICON.violet),
  red: cx('bg-linear-145', TONE_ICON.red),
  dark: 'bg-surface-dark',
}

/**
 * Cards of a Biznes subpage (plansze Dzial, Gopos, Insert): section head, then three or four
 * cards in a row with an optional icon and a link under the text.
 */
export function BzCardsBlock({ block }: { block: BzCardsBlockData }) {
  const headingId = `karty-${block.id ?? 'sekcja'}-h`
  const green = block.tone === 'green'
  return (
    <section
      aria-labelledby={headingId}
      className={cx('py-14 sm:py-20', block.surface === 'muted' && 'bg-surface-2')}
    >
      <Container wide>
        <SectionHead
          id={headingId}
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
          eyebrowClassName={green ? 'text-ok-text' : undefined}
        />
        <ul
          className={cx(
            'mt-9 grid gap-4 min-[640px]:grid-cols-2',
            block.columns === '4' ? 'min-[1080px]:grid-cols-4' : 'min-[1080px]:grid-cols-3',
          )}
        >
          {block.cards.map((card, i) => (
            <li
              key={card.id ?? i}
              className="flex flex-col gap-2.5 rounded-[24px] bg-card p-6 shadow-[inset_0_0_0_1px_var(--border)] sm:p-7"
            >
              {card.monogram ? (
                <span
                  aria-hidden="true"
                  className={cx(
                    'mb-2 flex size-12 items-center justify-center rounded-xl font-display text-lg font-extrabold text-white',
                    MONOGRAM[card.monogramTone ?? 'blue'],
                  )}
                >
                  {card.monogram}
                </span>
              ) : (
                card.icon && (
                  <span
                    aria-hidden="true"
                    className={cx(
                      'mb-2 flex size-11 items-center justify-center rounded-xl',
                      green
                        ? cx('bg-linear-145 text-white', TONE_ICON.green)
                        : 'bg-surface-2 text-accent-text',
                    )}
                  >
                    <Icon name={card.icon} strokeWidth={2.2} className="size-5" />
                  </span>
                )
              )}
              <h3 className="font-display text-[1.25rem] leading-tight font-extrabold text-ink">
                {card.title}
              </h3>
              <p className="leading-relaxed text-ink-2">{card.text}</p>
              {hasLink(card.link) && (
                <Link
                  href={card.link.href}
                  className="mt-auto inline-flex items-center gap-1.5 pt-2 font-extrabold text-accent-text hover:underline"
                >
                  {card.link.label}
                  <Icon name="arrow" strokeWidth={2.4} className="size-4" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

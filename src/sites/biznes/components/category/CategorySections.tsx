import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { BoughtWithTile, CategoryView } from '@/lib/catalog/category'
import { categoryHref } from '@/lib/catalog/category'
import { plural } from '@/lib/plural'

import { SectionHead } from '../home/SectionHead'

/** „W cenie” (board: „Kupujesz kasę, dostajesz spokój.”): cards with an icon, title and text. */
export function IncludedCards({ included }: { included: CategoryView['included'] }) {
  if (included.cards.length === 0) return null
  return (
    <section aria-labelledby="w-cenie-h" className="py-14 sm:py-20">
      <Container wide>
        <SectionHead id="w-cenie-h" eyebrow={included.eyebrow} heading={included.title} />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {included.cards.map((card, position) => (
            <li
              key={position}
              className="flex gap-4 rounded-[22px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)]"
            >
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-text text-accent-ink"
              >
                <Icon name={card.icon ?? 'check'} className="size-5" />
              </span>
              <span>
                <span className="block font-extrabold text-ink">{card.title}</span>
                {card.text && (
                  <span className="mt-1 block text-[15px] leading-relaxed text-ink-2">
                    {card.text}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

/**
 * „Przepisy w pigułce”: legal facts, each with its source (only those reach the view). The
 * first card is navy, as on the board.
 */
export function CategoryFacts({ facts }: { facts: CategoryView['facts'] }) {
  if (facts.items.length === 0) return null
  return (
    <section aria-labelledby="przepisy-h" className="pb-14 sm:pb-20">
      <Container wide>
        <SectionHead id="przepisy-h" eyebrow={facts.eyebrow} heading={facts.title} />
        <ul className="mt-8 grid gap-3 lg:grid-cols-3">
          {facts.items.map((fact, position) => {
            const dark = position === 0
            return (
              <li
                key={position}
                data-surface={dark ? 'dark' : undefined}
                className={cx(
                  'flex flex-col gap-3 rounded-[26px] p-6 sm:p-7',
                  dark ? 'bg-surface-dark text-white' : 'bg-surface-2',
                )}
              >
                <p
                  className={cx(
                    'font-display text-[clamp(2.6rem,4.4vw,3.6rem)] leading-none font-extrabold tracking-[-0.02em] font-stretch-112%',
                    dark ? 'text-promo' : 'text-accent-text',
                  )}
                >
                  {fact.value}
                </p>
                <h3 className={cx('text-lg font-extrabold', dark ? 'text-white' : 'text-ink')}>
                  {fact.title}
                </h3>
                <p className={cx('leading-relaxed', dark ? 'text-white/80' : 'text-ink-2')}>
                  {fact.text}
                </p>
                <a
                  href={fact.sourceUrl}
                  rel="noopener"
                  target="_blank"
                  className={cx(
                    'mt-auto text-sm hover:underline',
                    dark ? 'text-white/70' : 'text-ink-3',
                  )}
                >
                  {fact.source}
                  <span className="sr-only"> (otwiera się w nowej karcie)</span>
                </a>
                {fact.link && (
                  <Link
                    href={fact.link.href}
                    className={cx(
                      'text-sm font-extrabold hover:underline',
                      dark ? 'text-white' : 'text-accent-text',
                    )}
                  >
                    {fact.link.label} →
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}

/** „Do … często dobierane”: tiles of the categories of the related products. */
export function BoughtWith({ heading, tiles }: { heading: string; tiles: BoughtWithTile[] }) {
  if (tiles.length === 0) return null
  return (
    <section aria-labelledby="dobierane-h" className="pb-14 sm:pb-20">
      <Container wide>
        <h2
          id="dobierane-h"
          className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-extrabold tracking-[-0.02em] font-stretch-110%"
        >
          {heading}
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <li key={tile.slug}>
              <Link
                href={categoryHref(tile.slug)}
                className="flex items-center gap-4 rounded-[20px] bg-card p-3 shadow-[inset_0_0_0_1px_var(--border)] transition-shadow hover:shadow-[0_20px_40px_-28px_var(--glow),inset_0_0_0_1px_var(--ink-3)]"
              >
                <span
                  aria-hidden="true"
                  className="flex size-[72px] shrink-0 items-center justify-center rounded-2xl bg-surface-2"
                >
                  {tile.image ? (
                    <Image
                      src={tile.image.url}
                      alt=""
                      width={tile.image.width}
                      height={tile.image.height}
                      unoptimized
                      className="h-auto max-h-14 w-auto max-w-14 object-contain"
                    />
                  ) : (
                    <Icon name={tile.icon ?? 'store'} className="size-7 text-accent-text" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-extrabold text-ink">{tile.name}</span>
                  <span className="mt-0.5 block text-sm text-ink-3">
                    {tile.count} {plural(tile.count, ['pozycja', 'pozycje', 'pozycji'])}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

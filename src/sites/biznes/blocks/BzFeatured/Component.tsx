import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { getCatalogIndex } from '@/lib/catalog/data'
import { groupSummaries } from '@/lib/catalog/groups'
import { plural } from '@/lib/plural'
import type { BzFeaturedBlock as BzFeaturedBlockData } from '@/payload-types'

import { ProductCard } from '../../components/catalog/ProductCard'
import { SectionHead } from '../../components/home/SectionHead'

type Props = { block: BzFeaturedBlockData; tenantId: number }

/** Spec. §4 pkt 5: eight products, 4 in a row. */
const FEATURED = 8
/** Board: a mosaic of 7 pictures in the „Cała oferta” card. */
const MOSAIC = 7

// The second tile is wide, the third tall — the rhythm of the board's mosaic.
const MOSAIC_TILE = ['', 'col-span-2', 'row-span-2']

type Card = BzFeaturedBlockData['offerCard']

function CardText({ card, eyebrowClass }: { card: Card; eyebrowClass: string }) {
  return (
    <div className="flex flex-col gap-3">
      {card.eyebrow && (
        <p className={cx('text-[13px] font-extrabold tracking-[0.08em] uppercase', eyebrowClass)}>
          {card.eyebrow}
        </p>
      )}
      <h3 className="font-display text-[clamp(1.35rem,1.8vw,1.65rem)] leading-tight font-extrabold text-white">
        {card.heading}
      </h3>
      {card.text && <p className="leading-relaxed text-white/80">{card.text}</p>}
      <Link
        href={card.button.href}
        className="mt-3 inline-flex min-h-[52px] items-center gap-2 self-start rounded-2xl bg-white px-[22px] text-[15.5px] font-extrabold whitespace-nowrap text-surface-dark hover:underline"
      >
        {card.button.label}
        <Icon name="arrow" strokeWidth={2.4} className="size-[18px]" />
      </Link>
    </div>
  )
}

/**
 * „Najczęściej wybierane” (spec. §4 pkt 5, ZMIANY-v20 §2.3): the featured products as catalog
 * cards without tags (on a phone a horizontal strip, 78% wide cards), then two cards — the
 * whole offer with a mosaic from the departments, and the wizard with a preview of its steps.
 */
export async function BzFeaturedBlock({ block, tenantId }: Props) {
  const index = await getCatalogIndex(tenantId)
  const featured = index.products
    .filter((product) => product.featuredOrder !== undefined)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
    .slice(0, FEATURED)
  const departments = groupSummaries(index, { thumbs: 2 })
  const mosaic = [0, 1]
    .flatMap((round) => departments.flatMap((group) => group.thumbs[round] ?? []))
    .slice(0, MOSAIC)
  const total = index.products.length
  const steps = block.wizardCard.steps ?? []

  return (
    <section id="wybierane" aria-labelledby="wybierane-h" className="bg-surface-2 py-16 sm:py-24">
      <Container wide>
        <SectionHead
          id="wybierane-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
          action={
            block.catalogLabel
              ? {
                  label: `${block.catalogLabel} · ${total} ${plural(total, ['pozycja', 'pozycje', 'pozycji'])}`,
                  href: '/oferta',
                }
              : null
          }
        />

        {featured.length > 0 && (
          <ul className="-mx-4 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 min-[640px]:mx-0 min-[640px]:grid min-[640px]:grid-cols-2 min-[640px]:overflow-visible min-[640px]:px-0 min-[640px]:pb-0 min-[900px]:grid-cols-3 min-[1080px]:grid-cols-4">
            {featured.map((product, position) => (
              <li
                key={product.slug}
                className="flex w-[78%] shrink-0 snap-start min-[640px]:w-auto"
              >
                <ProductCard product={product} index={index} position={position} variant="home" />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 grid gap-3.5 min-[1080px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <article
            data-surface="dark"
            className="grid gap-6 overflow-hidden rounded-[30px] bg-surface-dark p-7 sm:p-8 min-[640px]:grid-cols-[minmax(0,1fr)_210px] min-[640px]:items-center"
          >
            <CardText card={block.offerCard} eyebrowClass="text-accent-on-dark" />
            {mosaic.length > 0 && (
              <ul
                aria-hidden="true"
                className="grid auto-rows-[60px] grid-cols-3 gap-2 min-[640px]:auto-rows-[62px]"
              >
                {mosaic.map((thumb, i) => (
                  <li
                    key={thumb.slug}
                    className={cx(
                      'flex items-center justify-center rounded-[14px] bg-white/5 p-2 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_12%,transparent)]',
                      MOSAIC_TILE[i],
                    )}
                  >
                    <Image
                      src={thumb.image.url}
                      alt=""
                      width={thumb.image.width}
                      height={thumb.image.height}
                      unoptimized
                      className="max-h-full w-auto max-w-full object-contain"
                    />
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article
            data-surface="dark"
            className="grid gap-6 overflow-hidden rounded-[30px] bg-linear-135 from-wizard to-surface-dark p-7 sm:p-8 min-[640px]:grid-cols-[minmax(0,1fr)_210px] min-[640px]:items-center"
          >
            <CardText card={block.wizardCard} eyebrowClass="text-tone-green-2" />
            {steps.length > 0 && (
              <div className="hidden flex-col gap-2 min-[640px]:flex">
                <ol className="flex flex-col gap-2">
                  {steps.map((step, i) => (
                    <li
                      key={step.id ?? i}
                      className={cx(
                        'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-white',
                        i === 2
                          ? 'bg-white/10 shadow-[inset_0_0_0_1.5px_var(--tone-green-2)]'
                          : 'bg-white/5',
                        i > 2 && 'text-white/70',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cx(
                          'flex size-[22px] shrink-0 items-center justify-center rounded-full font-display text-[11px] font-extrabold',
                          i < 2 && 'bg-ok text-surface-dark',
                          i === 2 && 'bg-white text-surface-dark',
                          i > 2 && 'shadow-[inset_0_0_0_1.5px_currentColor]',
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="font-extrabold">{step.label}</span>
                      <span className="ml-auto truncate text-xs text-white/70">{step.value}</span>
                    </li>
                  ))}
                </ol>
                {block.wizardCard.summary && (
                  <p className="rounded-xl bg-white/5 px-2.5 py-2 text-xs leading-snug text-white/70">
                    {block.wizardCard.summaryLabel}{' '}
                    <b className="font-extrabold text-white">{block.wizardCard.summary}</b>
                  </p>
                )}
              </div>
            )}
          </article>
        </div>
      </Container>
    </section>
  )
}

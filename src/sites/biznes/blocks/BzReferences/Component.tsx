import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { publicImage } from '@/lib/media/public'
import { getSiteSettings } from '@/lib/site/data'
import type { BzReferencesBlock as BzReferencesBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { reviewSlots } from './reviews'

type Props = { block: BzReferencesBlockData; tenantId: number }

/**
 * „Opinie” (board v150 `#s4-opinie`, ADR-017 D-K4-6): the section shows only after „Pokaż opinie
 * klientów” in the site settings ([SZEF]: consents). Up to three cards; the empty ones are
 * „[do podmiany]” placeholders — never in a production build. Client logos keep their own flag
 * (and the consent flag on the image).
 */
export async function BzReferencesBlock({ block, tenantId }: Props) {
  const settings = await getSiteSettings(tenantId)
  if (!settings?.biznes?.showReviews) return null
  const slots = reviewSlots(block.reviews ?? [], process.env.NODE_ENV !== 'production')
  if (slots.length === 0) return null
  const logos = settings.biznes.showClientLogos
    ? (block.logos ?? []).flatMap((logo) => publicImage(logo, tenantId) ?? [])
    : []

  return (
    <section id="opinie" aria-labelledby="opinie-h" className="bg-surface-2 py-16 sm:py-24">
      <Container wide>
        <SectionHead
          id="opinie-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
        />
        <ul className="mt-10 grid gap-3 min-[900px]:grid-cols-3">
          {slots.map((slot, i) =>
            slot.kind === 'review' ? (
              <li
                key={slot.review.id ?? i}
                className="flex flex-col rounded-[22px] bg-card p-6 shadow-[inset_0_0_0_1px_var(--border)]"
              >
                <figure className="flex h-full flex-col">
                  <blockquote className="text-[16px] leading-relaxed font-medium text-ink">
                    „{slot.review.quote}”
                  </blockquote>
                  <figcaption className="mt-auto pt-4 text-[13px] text-ink-2">
                    <b className="block text-[15px] font-extrabold text-ink">
                      {slot.review.author}
                    </b>
                    {slot.review.url ? (
                      <a
                        href={slot.review.url}
                        rel="noopener"
                        target="_blank"
                        className="underline"
                      >
                        {slot.review.source || 'źródło'}
                        <span className="sr-only"> (otwiera się w nowej karcie)</span>
                      </a>
                    ) : (
                      slot.review.source
                    )}
                  </figcaption>
                </figure>
              </li>
            ) : (
              <li
                key={`placeholder-${i}`}
                className="flex flex-col rounded-[22px] border border-dashed border-border bg-card p-6"
              >
                <p className="self-start rounded-full bg-promo px-2.5 py-1 text-[11.5px] font-extrabold tracking-[0.08em] text-promo-ink uppercase">
                  [do podmiany]
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-2 italic">{slot.text}</p>
                <p className="mt-auto pt-4 text-[13px] text-ink-3">
                  <b className="block text-[14px] text-ink-2">{slot.author}</b>
                  {slot.source}
                </p>
              </li>
            ),
          )}
        </ul>
        {logos.length > 0 && (
          <ul className="mt-8 grid grid-cols-2 gap-3 min-[640px]:grid-cols-4">
            {logos.map((logo, i) => (
              <li
                key={i}
                className="flex h-20 items-center justify-center rounded-2xl bg-white px-5 shadow-[inset_0_0_0_1px_var(--border)]"
              >
                <MediaImage image={logo} sizes="200px" className="max-h-12 w-auto object-contain" />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  )
}

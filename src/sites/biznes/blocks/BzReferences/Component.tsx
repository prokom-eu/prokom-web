import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { publicImage } from '@/lib/media/public'
import { getSiteSettings } from '@/lib/site/data'
import type { BzReferencesBlock as BzReferencesBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'

type Props = { block: BzReferencesBlockData; tenantId: number }

/**
 * „Dla kogo pracujemy” (spec. §4 pkt 9): six kinds of companies; reviews and client logos only
 * after they are switched on in the site settings ([SZEF]: consents), logos also only without
 * the consent flag on the image.
 */
export async function BzReferencesBlock({ block, tenantId }: Props) {
  const settings = await getSiteSettings(tenantId)
  const showReviews = Boolean(settings?.biznes?.showReviews)
  const logos = settings?.biznes?.showClientLogos
    ? (block.logos ?? []).flatMap((logo) => publicImage(logo, tenantId) ?? [])
    : []
  const reviews = showReviews ? (block.reviews ?? []) : []
  const kinds = block.kinds ?? []

  return (
    <section id="referencje" aria-labelledby="referencje-h" className="bg-surface-2 py-16 sm:py-24">
      <Container wide>
        <SectionHead
          id="referencje-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
        />
        {kinds.length > 0 && (
          <ul className="mt-10 grid gap-3 min-[640px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1180px]:grid-cols-6">
            {kinds.map((kind, i) => (
              <li
                key={kind.id ?? i}
                className="flex flex-col rounded-[22px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)]"
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-text"
                >
                  <Icon name={kind.icon} className="size-5" />
                </span>
                <h3 className="mt-4 text-[17px] leading-tight font-extrabold">{kind.title}</h3>
                {kind.examples && (
                  <p className="mt-2 text-[13.5px] leading-snug text-ink-2">{kind.examples}</p>
                )}
                {kind.solutions && (
                  <p className="mt-auto pt-4 text-[13.5px] leading-snug font-bold text-accent-text">
                    {kind.solutions}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        {reviews.length > 0 && (
          <ul className="mt-6 grid gap-3 min-[900px]:grid-cols-3">
            {reviews.map((review, i) => (
              <li
                key={review.id ?? i}
                className="flex flex-col rounded-[22px] bg-card p-6 shadow-[inset_0_0_0_1px_var(--border)]"
              >
                <figure className="flex h-full flex-col">
                  <blockquote className="text-[16px] leading-relaxed text-ink">
                    „{review.quote}”
                  </blockquote>
                  <figcaption className="mt-auto pt-4 text-[13px] text-ink-2">
                    <b className="block text-[15px] font-extrabold text-ink">{review.author}</b>
                    {review.url ? (
                      <a href={review.url} rel="noopener" target="_blank" className="underline">
                        {review.source || 'źródło'}
                        <span className="sr-only"> (otwiera się w nowej karcie)</span>
                      </a>
                    ) : (
                      review.source
                    )}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
        {logos.length > 0 ? (
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
        ) : (
          block.note && <p className="mt-6 text-[13.5px] text-ink-2">{block.note}</p>
        )}
      </Container>
    </section>
  )
}

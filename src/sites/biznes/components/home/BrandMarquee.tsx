import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { getPartners, type PublicPartner } from '@/lib/partners/data'
import type { PartnersBlock as PartnersBlockData } from '@/payload-types'

type Props = { block: PartnersBlockData; tenantId: number }

function Logos({ partners, copy }: { partners: PublicPartner[]; copy?: boolean }) {
  return (
    <ul
      aria-hidden={copy || undefined}
      // `pr-4` instead of a gap between the copies: -50% then moves by exactly one list.
      className={cx(
        'flex gap-4 pr-4 motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:pr-0',
        copy && 'motion-reduce:hidden',
      )}
    >
      {partners.map((partner) => (
        <li
          key={partner.id}
          className="flex h-[84px] w-[190px] shrink-0 items-center justify-center rounded-[18px] bg-white px-6 shadow-[inset_0_0_0_1px_var(--border)]"
        >
          <MediaImage
            image={copy ? { ...partner.logo, alt: '' } : partner.logo}
            sizes="160px"
            // Lazy loading lags behind the moving row: tiles would pass by empty.
            noLazy
            className="max-h-12 w-auto max-w-full object-contain"
          />
        </li>
      ))}
    </ul>
  )
}

/**
 * Biznes look of the shared Partners block — the brands bar of the home page (spec. §4 pkt 3):
 * one row of logos moving left, the list twice so the loop has no seam. CSS only: hover pauses
 * it (the logos are not links, nothing to focus); `prefers-reduced-motion`: a static, wrapped
 * set of logos.
 */
export async function BrandMarquee({ block, tenantId }: Props) {
  const partners = await getPartners(tenantId)
  if (partners.length === 0) return null
  // On Biznes the block's "Wstęp" is the short hint next to the heading.
  const { heading, lead: hint } = block
  return (
    <section className="pb-7">
      {(heading || hint) && (
        <Container wide className="mb-5.5 flex flex-wrap items-baseline justify-between gap-4">
          {heading && <h2 className="font-sans text-[17px] font-extrabold">{heading}</h2>}
          {hint && <p className="text-sm text-ink-3 motion-reduce:hidden">{hint}</p>}
        </Container>
      )}
      <div className="group/mq overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] motion-reduce:[mask-image:none]">
        <div className="flex w-max animate-marquee group-hover/mq:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:px-4">
          <Logos partners={partners} />
          <Logos partners={partners} copy />
        </div>
      </div>
    </section>
  )
}

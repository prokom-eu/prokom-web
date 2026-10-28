import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { brandPageHref } from '@/lib/catalog/brand'
import { getCatalogIndex } from '@/lib/catalog/data'
import { getPartners, type PublicPartner } from '@/lib/partners/data'
import type { PartnersBlock as PartnersBlockData } from '@/payload-types'

type Props = { block: PartnersBlockData; tenantId: number }

type BarPartner = PublicPartner & { href: string | null }

const TILE =
  'flex h-[84px] w-[190px] shrink-0 items-center justify-center rounded-[18px] bg-white px-6 shadow-[inset_0_0_0_1px_var(--border)]'

function Logos({ partners, copy }: { partners: BarPartner[]; copy?: boolean }) {
  return (
    <ul
      aria-hidden={copy || undefined}
      // `pr-4` instead of a gap between the copies: -50% then moves by exactly one list.
      className={cx(
        'flex gap-4 pr-4 motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:pr-0',
        copy && 'motion-reduce:hidden',
      )}
    >
      {partners.map((partner) => {
        const logo = (
          <MediaImage
            image={copy ? { ...partner.logo, alt: '' } : partner.logo}
            sizes="160px"
            // Lazy loading lags behind the moving row: tiles would pass by empty.
            noLazy
            className="max-h-12 w-auto max-w-full object-contain"
          />
        )
        return (
          <li key={partner.id} className="shrink-0">
            {partner.href ? (
              // The copy is hidden from assistive tech: out of the tab order too.
              <Link
                href={partner.href}
                tabIndex={copy ? -1 : undefined}
                className={cx(
                  TILE,
                  'hover:shadow-[inset_0_0_0_1.5px_var(--accent-text)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-text',
                )}
              >
                {logo}
              </Link>
            ) : (
              <div className={TILE}>{logo}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Biznes look of the shared Partners block — the brands bar of the home page (spec. §4 pkt 3):
 * one row of logos moving left, the list twice so the loop has no seam. CSS only: hover and
 * keyboard focus pause it — a logo with a brand page is a link (K3b′); `prefers-reduced-motion`:
 * a static, wrapped set of logos.
 */
export async function BrandMarquee({ block, tenantId }: Props) {
  const [logos, index] = await Promise.all([getPartners(tenantId), getCatalogIndex(tenantId)])
  if (logos.length === 0) return null
  // A logo with a brand page leads there (K3-KATALOG §6), the others stay pictures.
  const partners = logos.map((partner) => ({
    ...partner,
    href: partner.slug ? brandPageHref(index, partner.slug) : null,
  }))
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
        <div className="flex w-max animate-marquee group-hover/mq:[animation-play-state:paused] group-focus-within/mq:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:px-4">
          <Logos partners={partners} />
          <Logos partners={partners} copy />
        </div>
      </div>
    </section>
  )
}

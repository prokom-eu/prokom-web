import { withYears } from '@/lib/biznes/years'
import Image from 'next/image'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { brandLogo } from '@/lib/catalog/catalogIndex'
import { publicImage } from '@/lib/media/public'
import { partnerStatusLabel } from '@/lib/partners/badges'
import { shownPartner } from '@/lib/partners/shown'
import type { BzPageHeroBlock as BzPageHeroBlockData } from '@/payload-types'

import { Breadcrumbs, type Crumb } from '../../components/Breadcrumbs'
import { hasLink, PageLink } from '../../components/PageLink'

type Props = {
  block: BzPageHeroBlockData
  isFirst: boolean
  crumbs: Crumb[]
  tenantId: number
}

/**
 * Navy hero over a photo (plansza Gopos): partner logo with its status confirmed in the panel
 * ([SZEF] — no status, no badge), H1 with a plain green accent (ADR-013: no gradient), lead,
 * buttons and up to four figures. A figure needs its source in the panel (plan §4).
 */
export function PhotoHero({ block, isFirst, crumbs, tenantId }: Props) {
  const Title = isFirst ? 'h1' : 'h2'
  const photo = block.photo
  const image = publicImage(photo?.image, tenantId)
  const partner = shownPartner(photo?.partner, tenantId)
  const logo = partner ? brandLogo(partner) : undefined
  const status = partnerStatusLabel(partner?.partnerStatus)
  const stats = photo?.stats ?? []

  return (
    <section
      data-surface="dark"
      className="relative isolate overflow-hidden bg-surface-dark pt-6 text-white sm:pt-8"
    >
      {image && (
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[62%]">
          <MediaImage
            image={image}
            sizes="(min-width: 1024px) 62vw, 100vw"
            eager={isFirst}
            className="size-full object-cover opacity-60"
          />
        </div>
      )}
      <div
        aria-hidden="true"
        // Below `lg` the photo is under the text: a stronger, even veil keeps the lead readable.
        className="absolute inset-0 -z-10 bg-[color-mix(in_srgb,var(--surface-dark)_82%,transparent)] lg:bg-transparent lg:bg-[linear-gradient(90deg,var(--surface-dark)_30%,color-mix(in_srgb,var(--surface-dark)_55%,transparent)_70%,color-mix(in_srgb,var(--surface-dark)_30%,transparent))]"
      />
      <Container wide>
        {isFirst && (
          <div className="mb-7">
            <Breadcrumbs items={crumbs} onDark />
          </div>
        )}
        <div className="flex max-w-[44rem] flex-col gap-6">
          {(logo || status) && (
            <div className="flex flex-wrap items-center gap-3">
              {logo && partner && (
                <span className="inline-flex h-11 items-center rounded-xl bg-white px-3">
                  <Image
                    src={logo.url}
                    alt={partner.name}
                    width={logo.width}
                    height={logo.height}
                    unoptimized
                    className="h-auto max-h-7 w-auto max-w-[120px] object-contain"
                  />
                </span>
              )}
              {status && partner && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-[13px] font-extrabold tracking-[0.06em] text-footer-ok uppercase ring-1 ring-ok/40 ring-inset">
                  <Icon name="check" strokeWidth={2.6} className="size-4" />
                  {status} {partner.name}
                </span>
              )}
            </div>
          )}
          <Title className="font-display text-[clamp(2.6rem,5.6vw,5.1rem)] leading-[0.95] font-extrabold tracking-[-0.025em] font-stretch-112%">
            {withYears(block.heading, block.sinceYear, new Date())}
            {block.headingAccent && (
              <>
                {' '}
                <span className="text-ok">{block.headingAccent}</span>
              </>
            )}
          </Title>
          {block.lead && (
            <p className="max-w-[56ch] text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-relaxed text-white/85">
              {block.lead}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <PageLink href={block.primary.href} kind="light" arrow>
              {block.primary.label}
            </PageLink>
            {hasLink(block.secondary) && (
              <PageLink href={block.secondary.href} kind="outlineDark">
                {block.secondary.label}
              </PageLink>
            )}
          </div>
        </div>
        {stats.length > 0 ? (
          <dl className="mt-12 grid border-t border-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.id ?? i}
                className="flex flex-col-reverse gap-1.5 border-white/15 py-6 lg:border-l lg:px-7 lg:first:border-l-0 lg:first:pl-0"
              >
                <dt className="text-[15px] leading-snug text-white/75">{stat.label}</dt>
                <dd className="font-display text-[2.4rem] leading-none font-extrabold">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="pb-16 sm:pb-24" />
        )}
      </Container>
    </section>
  )
}

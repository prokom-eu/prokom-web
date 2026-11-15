import Image from 'next/image'
import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { brandAsset, HORIZONTAL_LOGO_SIZE } from '@/lib/brand/lines'
import { brandLogo } from '@/lib/catalog/brandLogo'
import { publicImage } from '@/lib/media/public'
import { partnerStatusLabel } from '@/lib/partners/badges'
import { shownPartner } from '@/lib/partners/shown'
import type { BzSystemsBlock as BzSystemsBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { StatusRows } from '../BzOffer/Component'

type Props = { block: BzSystemsBlockData; tenantId: number }
type System = NonNullable<BzSystemsBlockData['systems']>[number]

function SystemCard({ system, tenantId }: { system: System; tenantId: number }) {
  const statuses = system.mode === 'statuses' ? (system.statuses ?? []) : []
  const image = system.mode === 'statuses' ? null : publicImage(system.image, tenantId)
  const partner = shownPartner(system.partner, tenantId)
  const logo = partner ? brandLogo(partner) : undefined
  // With a partner the badge is its status confirmed in the panel ([SZEF]), never free text.
  const badge = system.partner ? partnerStatusLabel(partner?.partnerStatus) : system.badge
  return (
    <Link
      href={system.link.href}
      data-surface="dark"
      className="bzs group/bzs flex flex-col overflow-hidden rounded-[30px] bg-surface-dark text-white shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent-on-dark)_12%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-text"
    >
      {/* The picture with a glow over a fading grid (board); it floats slowly — not on phones. */}
      <div className="bzs-stage relative h-[270px] overflow-hidden max-[599px]:h-[200px]">
        <div aria-hidden="true" className="bzs-grid absolute inset-0" />
        <div
          aria-hidden="true"
          className="bzs-glow absolute bottom-[22px] left-1/2 h-[50px] w-[300px] -translate-x-1/2 rounded-full"
        />
        <div className="bzs-vis absolute inset-x-0 top-[34px] bottom-6 flex items-start justify-center px-8 max-[599px]:top-5">
          {statuses.length > 0 ? (
            <div className="w-full max-w-[300px] rounded-2xl bg-white/6 p-3 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_10%,transparent)]">
              <StatusRows rows={statuses} dark />
            </div>
          ) : image ? (
            <MediaImage
              image={image}
              sizes="(min-width: 1080px) 260px, 60vw"
              className="h-full w-auto max-w-[260px] object-contain drop-shadow-[0_24px_28px_rgba(0,0,0,0.6)]"
            />
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-7 pt-6 pb-[26px] max-[599px]:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-grid h-[38px] place-items-center rounded-[11px] bg-white px-3">
            {logo ? (
              <Image
                src={logo.url}
                alt={partner?.name ?? ''}
                width={logo.width}
                height={logo.height}
                unoptimized
                className="h-auto max-h-5 w-auto max-w-[96px] object-contain"
              />
            ) : (
              <Image
                src={brandAsset('biznes', 'poziome_kolor.svg')}
                alt="PRO-KOM Biznes"
                {...HORIZONTAL_LOGO_SIZE}
                className="h-5 w-auto"
              />
            )}
          </span>
          {badge && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--tone-green-2)_14%,transparent)] pr-[11px] pl-2 text-[12px] font-extrabold whitespace-nowrap text-tone-green-2">
              <Icon
                name={system.partner ? 'check' : 'shield'}
                strokeWidth={2.8}
                className="size-3.5"
              />
              {badge}
            </span>
          )}
        </div>
        <h3 className="font-display text-[25px] leading-[1.1] font-extrabold font-stretch-112%">
          {system.title}
        </h3>
        <p className="text-[15px] leading-relaxed text-white/75 min-[1080px]:text-[14px]">
          {system.text}
        </p>
        <span className="mt-auto flex items-center gap-2 border-t border-white/8 pt-3.5 text-[14px] font-extrabold text-accent-on-dark">
          {system.link.label}
          <span aria-hidden="true" className="bzs-arrow inline-block">
            →
          </span>
        </span>
      </div>
    </Link>
  )
}

/**
 * „Systemy, które u Ciebie wdrożymy” (runda 1411, board `Systemy.dc.html`): three navy cards —
 * GoPOS, InsERT (partners from `Partners`, their status as the badge) and Stała opieka IT — each a
 * link to its page; on top a big picture with a glow and a slow float (status bars for the IT
 * care), under it the logo, the badge, the title, the text and the action. Moved out of „Oferta”
 * with the same texts — no new promises. Phone (§5): the cards one under another, the picture at
 * most 200 px high, no floating below 600 px.
 */
export function BzSystemsBlock({ block, tenantId }: Props) {
  const systems = block.systems ?? []
  if (systems.length === 0) return null
  return (
    <section id="systemy" aria-labelledby="systemy-h" className="scroll-mt-24 py-14 max-md:py-8">
      <Container wide>
        <SectionHead
          id="systemy-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.note}
        />
        <div data-reveal-cards="" className="mt-8 grid gap-5 min-[1080px]:grid-cols-3">
          {systems.map((system, i) => (
            <SystemCard key={system.id ?? i} system={system} tenantId={tenantId} />
          ))}
        </div>
      </Container>
    </section>
  )
}

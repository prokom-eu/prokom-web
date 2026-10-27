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
 * Hero with a program screen (plansza Insert): partner logo and its status confirmed in the panel
 * ([SZEF] — no status, no badge), H1 with a plain accent part (ADR-013), lead and buttons; on the
 * right the screen in a laptop frame, the program box in front and two floating notes.
 */
export function ScreenHero({ block, isFirst, crumbs, tenantId }: Props) {
  const Title = isFirst ? 'h1' : 'h2'
  const screen = block.screen
  const partner = shownPartner(screen?.partner, tenantId)
  const logo = partner ? brandLogo(partner) : undefined
  const status = partnerStatusLabel(partner?.partnerStatus)
  const screenImage = publicImage(screen?.screenImage, tenantId)
  const boxImage = publicImage(screen?.boxImage, tenantId)
  const notes = screen?.notes ?? []

  return (
    <section className="relative overflow-hidden pt-6 pb-16 sm:pt-8 sm:pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_90%_10%,var(--glow),transparent_60%)]"
      />
      <Container wide className="relative">
        {isFirst && (
          <div className="mb-6">
            <Breadcrumbs items={crumbs} />
          </div>
        )}
        <div className="grid items-center gap-12 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col gap-6">
            {(logo || status) && partner && (
              <div className="flex flex-wrap items-center gap-3">
                {logo && (
                  <span className="inline-flex h-11 items-center rounded-xl bg-white px-3 shadow-[inset_0_0_0_1px_var(--border)]">
                    <Image
                      src={logo.url}
                      alt={partner.name}
                      width={logo.width}
                      height={logo.height}
                      unoptimized
                      className="h-auto max-h-7 w-auto max-w-[110px] object-contain"
                    />
                  </span>
                )}
                {status && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-ok/15 px-3.5 py-2 text-[13px] font-extrabold tracking-[0.06em] text-ink uppercase">
                    <Icon name="check" strokeWidth={2.6} className="size-4 text-ok-text" />
                    {status} {partner.name}
                  </span>
                )}
              </div>
            )}
            <Title className="font-display text-[clamp(2.6rem,5.2vw,4.6rem)] leading-[0.95] font-extrabold tracking-[-0.025em] font-stretch-112%">
              {withYears(block.heading, block.sinceYear, new Date())}
              {block.headingAccent && (
                <>
                  {' '}
                  <span className="text-h1-accent">{block.headingAccent}</span>
                </>
              )}
            </Title>
            {block.lead && (
              <p className="max-w-[54ch] text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-relaxed text-ink-2">
                {block.lead}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <PageLink href={block.primary.href} arrow>
                {block.primary.label}
              </PageLink>
              {hasLink(block.secondary) && (
                <PageLink href={block.secondary.href} kind="outline">
                  {block.secondary.label}
                </PageLink>
              )}
            </div>
          </div>

          {screenImage && (
            <div className="relative mx-auto w-full max-w-[600px] pb-10">
              <div className="rounded-t-[18px] bg-surface-dark p-2.5 shadow-[0_40px_80px_-40px_var(--glow)]">
                <MediaImage
                  image={screenImage}
                  sizes="(min-width: 1080px) 560px, 90vw"
                  eager={isFirst}
                  className="h-auto w-full rounded-lg"
                />
              </div>
              <div
                aria-hidden="true"
                className="mx-[-6%] h-3.5 rounded-b-2xl bg-linear-180 from-surface-3 to-ink-3"
              />
              {boxImage && (
                <MediaImage
                  image={boxImage}
                  sizes="160px"
                  className="absolute bottom-0 -left-4 h-auto w-[26%] max-w-[160px] drop-shadow-xl sm:-left-10"
                />
              )}
              {notes.map((note, i) => (
                <span
                  key={note.id ?? i}
                  className={
                    i === 0
                      ? 'absolute -top-5 right-0 hidden items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[0_20px_40px_-20px_var(--glow),inset_0_0_0_1px_var(--border)] sm:flex sm:-right-4'
                      : 'absolute right-6 bottom-0 hidden items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[0_20px_40px_-20px_var(--glow),inset_0_0_0_1px_var(--border)] sm:flex'
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      i === 0
                        ? 'flex size-9 items-center justify-center rounded-xl bg-ok-text text-surface'
                        : 'flex size-9 items-center justify-center rounded-xl bg-accent-text text-accent-ink'
                    }
                  >
                    <Icon name={note.icon} className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ink">{note.title}</span>
                    {note.text && <span className="block text-xs text-ink-2">{note.text}</span>}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

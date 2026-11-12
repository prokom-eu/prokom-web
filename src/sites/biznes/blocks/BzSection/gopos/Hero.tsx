import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { stagePlacement } from '@/lib/biznes/pages/gopos'
import type { SectionData } from '@/lib/biznes/pages/sections'
import type { CatalogIndex, IndexImage } from '@/lib/catalog/catalogIndex'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'
import { BZ_H1, BZ_LEAD } from '@/sites/biznes/typography'

import { Breadcrumbs, type Crumb } from '../../../components/Breadcrumbs'
import { BTN_ON_DARK, BTN_PRIMARY, EYEBROW, withTrail } from '../ui'
import { AddActionButton } from '../AddActionButton'
import type { StageDevice } from './Stage'
import { GoposFlow, GoposStage } from './StageLazy'

type Props = {
  block: BzSectionData
  data: SectionData<'gopos-hero'>
  index: CatalogIndex
  /** Stage photos by Media id (as text): the devices with the GoPOS screen on. */
  images: Record<string, IndexImage>
  crumbs: readonly Crumb[]
}

/**
 * GoPOS hero (K32 §3, plansza Web-GoPOS; POPRAWKI-0311 §A): logo and partner pill, H1, lead,
 * „Umów prezentację” / „Skonfiguruj pakiet”, four proofs; on the right the stage of devices with
 * the GoPOS screen on and the order ticket, under it the 4-step flow. The order plays by itself;
 * clicking a step or a device lights that device up (Kuchnia → KDS).
 */
export function GoposHero({ block, data, index, images, crumbs }: Props) {
  const logo = index.brands.find((brand) => brand.slug === 'gopos')?.logo
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  const devices: StageDevice[] = data.stage.flatMap((device) => {
    const product = bySlug.get(device.slug)
    // POPRAWKI-0311 §A: the photo with the screen on; the card's packshot only as a fallback.
    const image =
      (device.image !== undefined ? images[String(device.image)] : undefined) ?? product?.image
    return product && image
      ? [
          {
            slug: device.slug,
            label: device.label,
            step: device.step,
            name: product.name,
            image,
            pos: stagePlacement(device.pos),
            lab: stagePlacement(device.lab),
          },
        ]
      : []
  })
  return (
    <section
      aria-labelledby="gopos-h"
      data-surface="dark"
      // Phone (App-GoPOS): a card with a margin, like the other heroes of the phone screens.
      className="gps-hero relative isolate overflow-hidden bg-surface-dark pt-6 pb-12 text-white max-md:mx-4 max-md:mt-3 max-md:rounded-[26px] max-md:pt-5 max-md:pb-5 min-[768px]:pt-8 min-[768px]:pb-16"
    >
      <Container wide>
        <div className="mb-7 max-md:hidden">
          <Breadcrumbs items={withTrail(crumbs, data.trail)} onDark />
        </div>
        <div className="grid items-center gap-10 max-md:gap-4 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6 max-md:gap-3.5">
            <div className="flex flex-wrap items-center gap-3 max-md:gap-2">
              {logo && (
                <span className="inline-flex h-11 items-center rounded-xl bg-white px-3">
                  <Image
                    unoptimized
                    src={logo.url}
                    alt="GoPOS"
                    width={logo.width}
                    height={logo.height}
                    className="h-auto max-h-7 w-auto max-w-[120px] object-contain"
                  />
                </span>
              )}
              <span
                className={cx(
                  EYEBROW,
                  'inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-footer-ok ring-1 ring-ok/40 ring-inset max-md:px-3 max-md:py-1.5 max-md:text-[11px] max-md:tracking-normal max-md:normal-case',
                )}
              >
                <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
                {data.pill}
              </span>
            </div>
            <h1 id="gopos-h" className={cx(BZ_H1, 'max-md:text-[30px] max-md:leading-[1.05]')}>
              {block.heading || crumbs.at(-1)?.name}{' '}
              {/* Second line in the accent (K31 §13.1: „Sala, kuchnia i dowozy. Jeden system.”). */}
              {block.headingAccent && (
                <em className="block text-ok not-italic">{block.headingAccent}</em>
              )}
            </h1>
            {block.lead && (
              <p
                className={`${BZ_LEAD} max-w-[56ch] text-pretty text-white/85 max-md:text-[14.5px] max-md:leading-relaxed`}
              >
                {block.lead}
              </p>
            )}
            <div className="flex flex-wrap gap-3 max-md:grid max-md:grid-cols-2 max-md:gap-2">
              <AddActionButton
                slug={data.presentation.slug}
                label="Umów prezentację"
                note={data.presentation.note}
                className={BTN_PRIMARY}
              />
              <a href="#pakiet" className={BTN_ON_DARK}>
                Skonfiguruj pakiet
              </a>
            </div>
            {/* Phone (App-GoPOS): four small tiles two by two. */}
            <ul className="grid gap-x-6 gap-y-4 max-md:grid-cols-2 max-md:gap-2 min-[640px]:grid-cols-2">
              {data.proof.map((proof) => (
                <li
                  key={proof.t}
                  className="flex gap-3 max-md:min-w-0 max-md:flex-col max-md:gap-1.5 max-md:rounded-[16px] max-md:bg-white/5 max-md:p-3 max-md:ring-1 max-md:ring-white/10"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-ok/20 text-ok"
                  >
                    <svg viewBox="0 0 24 24" className="size-4">
                      <path
                        d="M5 12.5l4 4 10-10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <b className="font-extrabold max-md:text-sm max-md:leading-snug">{proof.t}</b>
                    <small className="text-[14px] text-white/75 max-md:text-xs">{proof.d}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <GoposStage devices={devices} ticket={data.ticket} flow={data.flow} />
        </div>
        <GoposFlow flow={data.flow} />
      </Container>
    </section>
  )
}

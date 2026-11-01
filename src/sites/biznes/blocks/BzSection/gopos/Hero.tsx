import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { SectionData } from '@/lib/biznes/pages/sections'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'

import { Breadcrumbs, type Crumb } from '../../../components/Breadcrumbs'
import { BTN_ON_DARK, BTN_PRIMARY, EYEBROW, withTrail } from '../ui'
import { AddActionButton } from '../AddActionButton'
import { GoposFlow, GoposStage, type StageDevice } from './Stage'

type Props = {
  block: BzSectionData
  data: SectionData<'gopos-hero'>
  index: CatalogIndex
  crumbs: readonly Crumb[]
}

/**
 * GoPOS hero (K32 §3, plansza Web-GoPOS): logo and partner pill, H1, lead, „Umów prezentację” /
 * „Skonfiguruj pakiet”, four proofs; on the right the stage of devices with the order ticket,
 * under it the 4-step flow. Clicking a step or a device lights the device up (Kuchnia → KDS).
 */
export function GoposHero({ block, data, index, crumbs }: Props) {
  const logo = index.brands.find((brand) => brand.slug === 'gopos')?.logo
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  const devices: StageDevice[] = data.stage.flatMap((device) => {
    const product = bySlug.get(device.slug)
    return product?.image
      ? [
          {
            slug: device.slug,
            label: device.label,
            step: device.step,
            name: product.name,
            image: product.image,
          },
        ]
      : []
  })
  return (
    <section
      aria-labelledby="gopos-h"
      data-surface="dark"
      className="relative isolate overflow-hidden bg-surface-dark pt-6 pb-12 text-white sm:pt-8 sm:pb-16"
    >
      <Container wide>
        <div className="mb-7">
          <Breadcrumbs items={withTrail(crumbs, data.trail)} onDark />
        </div>
        <div className="grid items-center gap-10 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
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
                  'inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-footer-ok ring-1 ring-ok/40 ring-inset',
                )}
              >
                <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
                {data.pill}
              </span>
            </div>
            <h1
              id="gopos-h"
              className="font-display text-[clamp(2.3rem,4.4vw,4rem)] leading-[0.98] font-extrabold tracking-[-0.025em] font-stretch-112% text-balance"
            >
              {block.heading || crumbs.at(-1)?.name}{' '}
              {block.headingAccent && <em className="text-ok not-italic">{block.headingAccent}</em>}
            </h1>
            {block.lead && (
              <p className="max-w-[56ch] text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-relaxed text-pretty text-white/85">
                {block.lead}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
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
            <ul className="grid gap-x-6 gap-y-4 min-[640px]:grid-cols-2">
              {data.proof.map((proof) => (
                <li key={proof.t} className="flex gap-3">
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
                    <b className="font-extrabold">{proof.t}</b>
                    <small className="text-[14px] text-white/75">{proof.d}</small>
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

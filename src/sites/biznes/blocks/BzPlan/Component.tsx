import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { BzPlanBlock as BzPlanBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { TONE_ICON } from '../../components/home/tones'
import { IndustryGrid } from './IndustryGrid'
import { PlanScenes } from './PlanScenes'
import { industryTiles, type IndustryTile } from './tiles'

type Props = { block: BzPlanBlockData; tenantId: number }

function Tile({ tile }: { tile: IndustryTile }) {
  return (
    <Link
      href={tile.href}
      className="flex w-full flex-col items-start gap-3 rounded-[22px] bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)] transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-26px_var(--glow),inset_0_0_0_1px_var(--border)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5"
    >
      <span
        aria-hidden="true"
        className={cx(
          'flex size-[52px] items-center justify-center rounded-2xl bg-linear-145 text-white',
          TONE_ICON[tile.tone],
        )}
      >
        <Icon name={tile.icon} className="size-6" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-display text-[17px] leading-tight font-extrabold text-ink">
          {tile.name}
        </span>
        {tile.note && <span className="text-[13.5px] text-ink-3">{tile.note}</span>}
      </span>
    </Link>
  )
}

/**
 * „Plan Twojej firmy” (spec. §4 pkt 6, ZMIANY-v20 §2.4), stage 1: tabs with the points of each
 * kind of company, six promises, the industries grid (data of this block, ADR-012 rozstrz. 11)
 * and the funding bar.
 */
export function BzPlanBlock({ block, tenantId }: Props) {
  const tiles = industryTiles(block.industries?.tiles, tenantId)
  const grid = block.industries
  const funding = block.funding
  const promises = block.promises ?? []

  return (
    <section id="plan" aria-labelledby="plan-h" className="py-16 sm:py-24">
      <Container wide>
        <SectionHead
          id="plan-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
        />

        <div className="mt-10">
          <PlanScenes
            scenes={block.scenes.map((scene) => ({
              tab: scene.tab,
              icon: scene.icon,
              title: scene.title,
              lead: scene.lead ?? null,
              moreHref: scene.moreHref ?? null,
              inquiryHref: scene.inquiryHref,
              points: (scene.points ?? []).map(({ name, note }) => ({ name, note: note ?? null })),
            }))}
            sceneNote={block.sceneNote ?? null}
            moreLabel={block.moreLabel ?? null}
            inquiryLabel={block.inquiryLabel ?? null}
          />
        </div>

        {promises.length > 0 && (
          <ul className="mt-6 grid gap-2.5 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-3">
            {promises.map((promise, i) => (
              <li
                key={promise.id ?? i}
                className="flex gap-3 rounded-[18px] bg-card px-5 py-4 shadow-[inset_0_0_0_1px_var(--border)]"
              >
                <Icon name="check" strokeWidth={2.4} className="mt-0.5 size-4 text-accent-text" />
                <span className="flex flex-col">
                  <span className="font-extrabold text-ink">{promise.title}</span>
                  {promise.text && <span className="text-sm text-ink-2">{promise.text}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}

        {(tiles.visible.length > 0 || tiles.hidden.length > 0) && (
          <div className="mt-6 rounded-[30px] bg-surface-2 p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                {grid?.heading && (
                  <h3 className="font-display text-[clamp(1.4rem,2.4vw,1.85rem)] leading-tight font-extrabold">
                    {grid.heading}
                  </h3>
                )}
                {grid?.lead && <p className="mt-1.5 text-[15px] text-ink-2">{grid.lead}</p>}
              </div>
              {grid?.button?.label && grid.button.href && (
                <Link
                  href={grid.button.href}
                  className="inline-flex min-h-12 items-center rounded-2xl bg-card px-5 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]"
                >
                  {grid.button.label}
                </Link>
              )}
            </div>
            <IndustryGrid
              visible={tiles.visible.map((tile) => ({ key: tile.key, node: <Tile tile={tile} /> }))}
              hidden={tiles.hidden.map((tile) => ({ key: tile.key, node: <Tile tile={tile} /> }))}
              moreLabel={grid?.moreLabel || 'Pokaż wszystkie branże'}
              moreNote={grid?.moreNote ?? null}
            />
          </div>
        )}

        {funding?.heading && (
          <div className="mt-6 rounded-[26px] bg-linear-100 from-tone-green via-tone-blue to-tone-violet p-[1.5px]">
            <div className="flex flex-wrap items-center gap-5 rounded-[25px] bg-card p-5 sm:p-6">
              <span
                aria-hidden="true"
                className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-145 from-tone-green to-tone-blue text-white"
              >
                <Icon name="wallet" className="size-7" />
              </span>
              <div className="min-w-0 flex-1 basis-[28rem]">
                {funding.label && (
                  <p className="text-xs font-extrabold tracking-[0.12em] text-ok-text uppercase">
                    {funding.label}
                  </p>
                )}
                <h3 className="mt-1 font-display text-[clamp(1.15rem,1.7vw,1.4rem)] leading-snug font-extrabold">
                  {funding.heading}
                </h3>
                {funding.text && <p className="mt-1 text-[15px] text-ink-2">{funding.text}</p>}
                {(funding.chips ?? []).length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {(funding.chips ?? []).map((chip, i) => (
                      <li
                        key={chip.id ?? i}
                        className="rounded-full bg-surface-2 px-3 py-1 text-[13px] font-bold text-ink-2"
                      >
                        {chip.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {funding.button?.label && funding.button.href && (
                <Link
                  href={funding.button.href}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-tone-green-tag px-6 font-extrabold text-white hover:underline sm:w-auto"
                >
                  {funding.button.label}
                  <Icon name="arrow" strokeWidth={2.4} className="size-[18px]" />
                </Link>
              )}
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}

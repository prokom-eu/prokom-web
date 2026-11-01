import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { BzPlanBlock as BzPlanBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { TONE_ICON } from '../../components/home/tones'
import { FloorPlan } from '../../components/plan/FloorPlan'
import { loadFloorPlan } from '../../components/plan/planData'
import { PlanStats } from '../../components/plan/PlanStats'
import { DEFAULT_PLAN_LABELS } from '../../components/plan/types'
import { IndustryGrid } from './IndustryGrid'
import { PlanSceneLink } from './PlanSceneLink'
import { industryTiles, WIZARD_HREF, type IndustryTile } from './tiles'

type Props = { block: BzPlanBlockData; tenantId: number }

const TILE_CLASS =
  'flex w-full flex-col items-start gap-3 rounded-[22px] bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)] transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-26px_var(--glow),inset_0_0_0_1px_var(--border)] motion-reduce:transition-none motion-reduce:hover:translate-y-0'

function Tile({ tile }: { tile: IndustryTile }) {
  const body = (
    <>
      <span
        aria-hidden="true"
        className={cx(
          'flex size-11 items-center justify-center rounded-[14px] bg-linear-145 text-white',
          TONE_ICON[tile.tone],
        )}
      >
        <Icon name={tile.icon} className="size-[22px]" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-display text-[16px] leading-tight font-extrabold text-balance text-ink">
          {tile.name}
        </span>
        {tile.note && <span className="text-[13px] leading-snug text-ink-3">{tile.note}</span>}
      </span>
      <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-extrabold text-accent-text">
        {tile.scene
          ? 'Zobacz plan'
          : tile.href === WIZARD_HREF
            ? 'Dobierz rozwiązanie'
            : 'Zobacz branżę'}
        <Icon name="arrow" strokeWidth={2.4} className="size-3.5" />
      </span>
    </>
  )
  // Board: „Zobacz plan” sets the scene and scrolls to the plan; a tile without a scene leads to
  // its industry's page, or to the configurator.
  return tile.scene ? (
    <PlanSceneLink scene={tile.scene} className={TILE_CLASS}>
      {body}
    </PlanSceneLink>
  ) : (
    <Link href={tile.href} className={TILE_CLASS}>
      {body}
    </Link>
  )
}

/** The heading's second sentence in the accent colour (board `#s4-real`: „… Od straganu …”). */
function accentTail(heading: string) {
  const at = heading.indexOf('. ')
  if (at < 0) return heading
  return (
    <>
      {heading.slice(0, at + 1)} <span className="text-accent-text">{heading.slice(at + 2)}</span>
    </>
  )
}

/**
 * „Dla kogo” and „Plan Twojej firmy” (board v150 `#s4-real`, `#s4-plan`; K36 §1): the
 * industries grid (data of this block, ADR-012 rozstrz. 11) with the funding bar as a section
 * of its own, then the plan 2.0 — the same component as `/plan-firmy` (K31d′, spec. §6.12).
 */
export async function BzPlanBlock({ block, tenantId }: Props) {
  const plan = await loadFloorPlan(tenantId)
  const tiles = industryTiles(
    block.industries?.tiles,
    tenantId,
    new Set(plan?.scenes.map((scene) => scene.slug)),
  )
  const grid = block.industries
  const funding = block.funding
  const hasTiles = tiles.visible.length > 0 || tiles.hidden.length > 0
  // The section needs its heading (`aria-labelledby`); `rail.ts` follows the same rule.
  const industriesHeading = grid?.heading ?? null

  return (
    <>
      {industriesHeading && (hasTiles || funding?.heading) && (
        <section id="dla-kogo" aria-labelledby="dla-kogo-h" className="bg-surface-2 py-16 sm:py-24">
          <Container wide>
            <SectionHead
              id="dla-kogo-h"
              eyebrow={grid?.eyebrow}
              heading={accentTail(industriesHeading)}
              lead={grid?.lead}
            />
            {hasTiles && (
              <div className="mt-10">
                <IndustryGrid
                  visible={tiles.visible.map((tile) => ({
                    key: tile.key,
                    node: <Tile tile={tile} />,
                  }))}
                  hidden={tiles.hidden.map((tile) => ({
                    key: tile.key,
                    node: <Tile tile={tile} />,
                  }))}
                  moreLabel={grid?.moreLabel || 'Pokaż wszystkie branże'}
                  moreNote={grid?.moreNote ?? null}
                />
              </div>
            )}
            {funding?.heading && (
              <div
                data-surface="dark"
                className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-4 rounded-[24px] bg-linear-100 from-tone-green-tag to-[color-mix(in_srgb,var(--tone-green-tag)_70%,var(--surface-dark))] p-5 text-white sm:px-6"
              >
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-white/15"
                >
                  <Icon name="wallet" className="size-[22px]" />
                </span>
                <div className="min-w-0 flex-1 basis-[26rem]">
                  {funding.label && (
                    <p className="text-[12px] font-extrabold tracking-[0.12em] text-white uppercase">
                      {funding.label}
                    </p>
                  )}
                  <h3 className="mt-0.5 font-display text-[clamp(1.05rem,1.5vw,1.25rem)] leading-snug font-extrabold text-balance text-white">
                    {funding.heading}
                  </h3>
                  {funding.text && <p className="mt-1 text-[14.5px] text-white">{funding.text}</p>}
                  {(funding.chips ?? []).length > 0 && (
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {(funding.chips ?? []).map((chip, i) => (
                        <li
                          key={chip.id ?? i}
                          className="rounded-full bg-white/15 px-2.5 py-1 text-[12.5px] font-bold text-white"
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
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 font-extrabold text-surface-dark hover:underline sm:w-auto"
                  >
                    {funding.button.label}
                    <Icon name="arrow" strokeWidth={2.4} className="size-[18px]" />
                  </Link>
                )}
              </div>
            )}
          </Container>
        </section>
      )}

      {plan && (
        <section
          id="plan"
          aria-labelledby="plan-h"
          tabIndex={-1}
          className="scroll-mt-20 py-16 outline-none sm:py-24"
        >
          <Container wide>
            <SectionHead
              id="plan-h"
              eyebrow={block.eyebrow}
              heading={block.heading}
              lead={block.lead}
            />
            <div className="mt-5">
              <PlanStats scenes={plan.scenes} />
            </div>
            <div className="mt-8">
              <FloorPlan
                data={plan}
                headingLevel="h3"
                labels={{
                  listNote: block.sceneNote || DEFAULT_PLAN_LABELS.listNote,
                  inquiryLabel: block.inquiryLabel || DEFAULT_PLAN_LABELS.inquiryLabel,
                  bundlesLabel: block.moreLabel || DEFAULT_PLAN_LABELS.bundlesLabel,
                }}
              />
            </div>
          </Container>
        </section>
      )}
    </>
  )
}

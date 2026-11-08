import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getHomeBundleSlugs } from '@/lib/catalog/data'
import { planHref } from '@/lib/catalog/floorPlan'
import type { BzPlanBlock as BzPlanBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { FloorPlan } from '../../components/plan/FloorPlanLazy'
import { homeBundlesByScene } from '../../components/plan/homeBundle'
import { loadFloorPlan } from '../../components/plan/planData'
import { PlanStats } from '../../components/plan/PlanStats'
import { DEFAULT_PLAN_LABELS } from '../../components/plan/types'

type Props = { block: BzPlanBlockData; tenantId: number }

/** Points of a scene listed before „Pokaż wszystkie” (plan 0611 §7.1 pkt 8). */
const HOME_POINTS = 6
/** Label of the bundle card while the block's own (`moreLabel`) is empty. */
const HOME_BUNDLE_LABEL = 'Gotowy zestaw dla tej branży'

type Funding = NonNullable<BzPlanBlockData['funding']>

/** „Dofinansowania”: the bar under the plan, on a phone too. */
function FundingBar({ funding }: { funding: Funding }) {
  return (
    <div
      data-surface="dark"
      className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-4 rounded-[24px] bg-linear-100 from-tone-green-tag to-[color-mix(in_srgb,var(--tone-green-tag)_70%,var(--surface-dark))] p-5 text-white max-md:mt-3 max-md:gap-y-3 sm:px-6"
    >
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-white/15 max-md:hidden"
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
  )
}

/**
 * „Plan Twojej firmy” with the industries (plan 0611 §7.1 pkt 8, D8): one section — the industry
 * tabs (the 12 scenes of „Plany firmy”), the plan of the picked one with its points, „Gotowy
 * zestaw dla tej branży” (`BiznesSettings.bundles.home`, „Gotowe” only), six points and „Pokaż
 * wszystkie”, „Dodaj cały plan do zapytania” and the funding bar. The plan is the component of
 * `/plan-firmy` (a lazy island, rendered on the server with the first scene). The industry tiles
 * of the block (`industries`) stay in the database but are no longer shown (D8).
 * Phone (board App-Start): the scenes as chips in a navy card, each opening `/plan-firmy` with
 * its scene — the full plan is a desktop layout (a 720 px drawing) — then the funding bar.
 */
export async function BzPlanBlock({ block, tenantId }: Props) {
  const [plan, homeSlugs] = await Promise.all([
    loadFloorPlan(tenantId),
    getHomeBundleSlugs(tenantId),
  ])
  const funding = block.funding?.heading ? block.funding : null
  if (!plan && !funding) return null

  return (
    <section
      id="plan"
      aria-labelledby="plan-h"
      tabIndex={-1}
      className="scroll-mt-20 py-16 outline-none max-md:py-6 md:py-24"
    >
      {/* R2: the plan rises in once (`data-reveal`) and its points pulse once (motion.css §4c). */}
      <Container wide data-reveal="">
        {/* `data-surface`: focus rings for navy (on a desktop nothing here takes focus). */}
        <div
          data-surface="dark"
          className="max-md:rounded-[28px] max-md:bg-surface-dark max-md:p-5 max-md:text-white"
        >
          <SectionHead
            id="plan-h"
            eyebrow={block.eyebrow}
            eyebrowClassName="text-accent-text max-md:mb-2 max-md:text-[11.5px] max-md:tracking-[0.14em] max-md:text-white/75"
            heading={block.heading}
            lead={block.lead}
            appOnPhone
            phoneEyebrow
          />
          {plan && (
            <ul className="mt-4 flex flex-wrap gap-2 md:hidden">
              {plan.scenes.map((scene) => (
                <li key={scene.slug}>
                  <Link
                    href={planHref(scene.slug)}
                    className="inline-flex min-h-11 items-center rounded-full bg-white/10 px-4 text-[14px] font-extrabold text-white shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_14%,transparent)]"
                  >
                    {scene.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {plan && (
          <>
            <div className="mt-5 max-md:hidden">
              <PlanStats scenes={plan.scenes} />
            </div>
            <div className="mt-8 max-md:hidden">
              <FloorPlan
                data={plan}
                headingLevel="h3"
                labels={{
                  listNote: block.sceneNote || DEFAULT_PLAN_LABELS.listNote,
                  inquiryLabel: block.inquiryLabel || DEFAULT_PLAN_LABELS.inquiryLabel,
                  bundlesLabel: block.moreLabel || HOME_BUNDLE_LABEL,
                }}
                home={{
                  bundles: homeBundlesByScene(homeSlugs, plan.bundles),
                  pointsLimit: HOME_POINTS,
                }}
              />
            </div>
          </>
        )}
        {funding && <FundingBar funding={funding} />}
      </Container>
    </section>
  )
}

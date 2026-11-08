import { getSoftwareHome, getSolutionsIndex } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import { processStages, stageEyebrow } from '@/lib/software/process'
import { softwareTextContext } from '@/sites/software/components/textContext'

import { BentoSection } from './BentoLazy'
import { PricingSection } from './PricingLazy'
import { ProcessSection } from './ProcessLazy'
import { bentoSlugs, priceLines, pricingCards } from './prices'
import { Promises } from './Promises'
import { ShowroomSection } from './ShowroomLazy'
import { Situations } from './SituationsLazy'
import { TechSection } from './TechLazy'

/**
 * The v24 start page sections as `swHomeSection` blocks (SWA2c): each reads its data from
 * `SoftwareSettings.home` of this tenant and its prices from the solutions index, and renders
 * nothing while its data is missing (a home saved before v24 — staging until the data is pasted).
 */

type Props = { tenantId: number }

export async function PromisesSection({ tenantId }: Props) {
  const home = await getSoftwareHome(tenantId)
  return home?.promises ? <Promises promises={home.promises} /> : null
}

export async function SituationsSection({ tenantId }: Props) {
  const [home, index] = await Promise.all([getSoftwareHome(tenantId), getSolutionsIndex(tenantId)])
  const situations = home?.situations
  if (!situations) return null
  const slugs = situations.items.map((item) => item.solution)
  return <Situations situations={situations} prices={priceLines(slugs, index)} />
}

export async function BentoBlockSection({ tenantId }: Props) {
  const [home, index] = await Promise.all([getSoftwareHome(tenantId), getSolutionsIndex(tenantId)])
  const bento = home?.bento
  if (!bento) return null
  return <BentoSection bento={bento} prices={priceLines(bentoSlugs(bento), index)} />
}

export async function ShowroomBlockSection({ tenantId }: Props) {
  const home = await getSoftwareHome(tenantId)
  return home?.showroom ? <ShowroomSection showroom={home.showroom} /> : null
}

export async function TechBlockSection({ tenantId }: Props) {
  const home = await getSoftwareHome(tenantId)
  return home?.tech ? <TechSection tech={home.tech} /> : null
}

export async function PricingBlockSection({ tenantId }: Props) {
  const [home, index] = await Promise.all([getSoftwareHome(tenantId), getSolutionsIndex(tenantId)])
  const pricing = home?.pricing
  if (!pricing) return null
  return <PricingSection pricing={pricing} cards={pricingCards(pricing, index)} />
}

/**
 * „Większość płacisz po odbiorze” (v24): the stages of `home.process` with their facts filled;
 * nothing while `processHead` is missing (a home saved before v24, until the data is pasted).
 */
export async function ProcessBlockSection({ tenantId }: Props) {
  const [home, context] = await Promise.all([
    getSoftwareHome(tenantId),
    softwareTextContext(tenantId),
  ])
  const head = home?.processHead
  if (!home || !head) return null
  const steps = processStages(home.process, (text) => fillText(text, context)).map((stage) => ({
    num: stage.num,
    name: stage.name,
    duration: stage.duration,
    eyebrow: stageEyebrow(head.stage, stage),
    heading: stage.heading,
    text: stage.text,
    pay: stage.pay,
    payNote: stage.payNote,
  }))
  if (steps.length === 0) return null
  return (
    <ProcessSection eyebrow={head.eyebrow} title={head.title} em={head.em ?? null} steps={steps} />
  )
}

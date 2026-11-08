import { getSoftwareHome, getSolutionsIndex } from '@/lib/software/data'

import { BentoSection } from './BentoLazy'
import { PricingSection } from './PricingLazy'
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

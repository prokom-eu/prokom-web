import type { SoftwareHome } from '@/lib/software/home'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'

import { BentoSection } from './BentoLazy'
import { pricingCards } from './HomeV24Blocks'
import { PricingSection } from './PricingLazy'
import { bentoSlugs, priceLines } from './prices'
import { Promises } from './Promises'
import { ShowroomSection } from './ShowroomLazy'
import { Situations } from './SituationsLazy'
import { TechSection } from './TechLazy'

type Props = { home: SoftwareHome; index: SolutionsIndex }

/**
 * The v24 sections after the hero (ZMIANY-v24 §4): promises, situations, bento, the showroom, the
 * tech section and the price list, each only when its data is in `home`. Prices are counted here, so the client parts
 * get plain strings. SWA2b shows them on `/_software`; SWA2c places them on the start page.
 */
export function HomeV24Sections({ home, index }: Props) {
  const { promises, situations, bento } = home
  return (
    <>
      {promises && <Promises promises={promises} />}
      {situations && (
        <Situations
          situations={situations}
          prices={priceLines(
            situations.items.map((item) => item.solution),
            index,
          )}
        />
      )}
      {bento && <BentoSection bento={bento} prices={priceLines(bentoSlugs(bento), index)} />}
      {home.showroom && <ShowroomSection showroom={home.showroom} />}
      {home.tech && <TechSection tech={home.tech} />}
      {home.pricing && (
        <PricingSection
          eyebrow={home.pricing.eyebrow}
          title={home.pricing.title}
          em={home.pricing.em}
          lead={home.pricing.lead}
          all={home.pricing.all}
          details={home.pricing.details}
          groups={home.pricing.groups.map((group) => group.label)}
          cards={pricingCards(home.pricing, index)}
        />
      )}
    </>
  )
}

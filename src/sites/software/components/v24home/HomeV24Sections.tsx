import type { SoftwareHome } from '@/lib/software/home'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'

import { BentoSection } from './Bento'
import { priceLines } from './prices'
import { Promises } from './Promises'
import { ShowroomSection } from './Showroom'
import { Situations } from './Situations'

type Props = { home: SoftwareHome; index: SolutionsIndex }

/**
 * The v24 sections after the hero (ZMIANY-v24 §4 pkt 2–5): promises, situations, bento and the
 * showroom, each only when its data is in `home`. Prices are counted here, so the client parts
 * get plain strings. SWA2b shows them on `/_software`; SWA2c places them on the start page.
 */
export function HomeV24Sections({ home, index }: Props) {
  const { promises, situations, bento } = home
  const bentoSlugs = bento
    ? [
        ...bento.sites.variants.map((v) => v.solution),
        bento.rebuild.solution,
        ...bento.systems.variants.map((v) => v.solution),
        ...bento.automations.variants.map((v) => v.solution),
      ]
    : []
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
      {bento && <BentoSection bento={bento} prices={priceLines(bentoSlugs, index)} />}
      {home.showroom && <ShowroomSection showroom={home.showroom} />}
    </>
  )
}

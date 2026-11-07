import type { SoftwareHome } from '@/lib/software/home'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'

import { BentoSection } from './BentoLazy'
import { bentoSlugs, priceLines } from './prices'
import { Promises } from './Promises'
import { ShowroomSection } from './ShowroomLazy'
import { Situations } from './SituationsLazy'

type Props = { home: SoftwareHome; index: SolutionsIndex }

/**
 * The v24 sections after the hero (ZMIANY-v24 §4 pkt 2–5): promises, situations, bento and the
 * showroom, each only when its data is in `home`. Prices are counted here, so the client parts
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
    </>
  )
}

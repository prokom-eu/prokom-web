import { getSoftwareHome, getSolutionsIndex } from '@/lib/software/data'
import type { SwHeroBlock as SwHeroBlockData } from '@/payload-types'

import { HeroV24 } from './HeroV24'

type Props = { block: SwHeroBlockData; tenantId: number; isFirst?: boolean }

/**
 * Hero of the Software start page — v24 (ZMIANY-v24 §4.1, SWA2a): everything from `home.hero`.
 * The block marks where the hero stands; its own v23 fields are not shown any more (decision D6,
 * 08.11). Without `home.hero` in the data (a home saved before v24) nothing renders — the data is
 * pasted before staging (`docs/STAN.md`).
 */
export async function SwHeroBlock({ tenantId, isFirst = true }: Props) {
  const [home, index] = await Promise.all([getSoftwareHome(tenantId), getSolutionsIndex(tenantId)])
  if (!home?.hero) return null
  return <HeroV24 hero={home.hero} index={index} isFirst={isFirst} />
}

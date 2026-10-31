import type { InstPlannerBlock as InstPlannerBlockData } from '@/payload-types'

import { FormPageHero } from '../FormPageHero'

/** Skeleton of the page (PR `inst/wsp-bloki-formularzy`); the session I11 brings the rest. */
export function InstPlannerBlock({ block }: { block: InstPlannerBlockData }) {
  return <FormPageHero hero={block.hero} />
}

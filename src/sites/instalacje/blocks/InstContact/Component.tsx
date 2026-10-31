import type { InstContactBlock as InstContactBlockData } from '@/payload-types'

import { FormPageHero } from '../FormPageHero'

/** Skeleton of the page (PR `inst/wsp-bloki-formularzy`); the session I11 brings the rest. */
export function InstContactBlock({ block }: { block: InstContactBlockData }) {
  return <FormPageHero hero={block.hero} />
}

import type { InstServiceDeskBlock as InstServiceDeskBlockData } from '@/payload-types'

import { FormPageHero } from '../FormPageHero'

/** Skeleton of the page (PR `inst/wsp-bloki-formularzy`); the session I11 brings the rest. */
export function InstServiceDeskBlock({ block }: { block: InstServiceDeskBlockData }) {
  return <FormPageHero hero={block.hero} />
}

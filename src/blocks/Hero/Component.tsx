import type { HeroBlock as HeroBlockData } from '@/payload-types'

import { BlockLink } from '../BlockLink'

// Plain semantic markup; the designed version arrives with the visual system (S6).
export function HeroBlock({ block, isFirst }: { block: HeroBlockData; isFirst: boolean }) {
  // The first hero carries the page's only h1 (see `RenderBlocks`).
  const Heading = isFirst ? 'h1' : 'h2'
  return (
    <section>
      <Heading>{block.heading}</Heading>
      {block.lead && <p>{block.lead}</p>}
      <BlockLink link={block.cta} />
    </section>
  )
}

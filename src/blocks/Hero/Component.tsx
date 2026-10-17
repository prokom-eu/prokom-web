import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import type { HeroBlock as HeroBlockData } from '@/payload-types'

import { BlockLink } from '../BlockLink'

export function HeroBlock({ block, isFirst }: { block: HeroBlockData; isFirst: boolean }) {
  // The first hero carries the page's only h1 (see `RenderBlocks`).
  return (
    <Section className="py-16 sm:py-24">
      <div className="max-w-3xl">
        <Heading level={isFirst ? 1 : 2} size="display">
          {block.heading}
        </Heading>
        {block.lead && <p className="mt-6 text-lg leading-relaxed text-ink-2">{block.lead}</p>}
        <BlockLink link={block.cta} />
      </div>
    </Section>
  )
}

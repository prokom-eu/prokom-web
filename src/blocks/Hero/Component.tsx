import { MediaImage } from '@/components/MediaImage'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { publicImage } from '@/lib/media/public'
import type { HeroBlock as HeroBlockData } from '@/payload-types'

import { BlockLink } from '../BlockLink'

type Props = { block: HeroBlockData; isFirst: boolean; tenantId: number }

export function HeroBlock({ block, isFirst, tenantId }: Props) {
  const image = publicImage(block.image, tenantId)
  // The first hero carries the page's only h1 (see `RenderBlocks`).
  return (
    <Section className="py-16 sm:py-24">
      <div className={image ? 'grid items-center gap-10 lg:grid-cols-2' : undefined}>
        <div className="max-w-3xl">
          <Heading level={isFirst ? 1 : 2} size="display">
            {block.heading}
          </Heading>
          {block.lead && <p className="mt-6 text-lg leading-relaxed text-ink-2">{block.lead}</p>}
          <BlockLink link={block.cta} />
        </div>
        {image && (
          <MediaImage
            image={image}
            sizes="(min-width: 1024px) 50vw, 100vw"
            // The first hero image is above the fold (LCP candidate on desktop).
            eager={isFirst}
            className="h-auto w-full rounded-2xl"
          />
        )}
      </div>
    </Section>
  )
}

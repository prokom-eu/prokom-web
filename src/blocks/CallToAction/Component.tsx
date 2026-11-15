import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import type { CallToActionBlock as CallToActionBlockData } from '@/payload-types'

import { BlockLink } from '../BlockLink'

export function CallToActionBlock({ block }: { block: CallToActionBlockData }) {
  return (
    <Section surface="dark">
      <div className="max-w-3xl">
        <Heading level={2}>{block.heading}</Heading>
        {block.text && <p className="mt-4 text-lg leading-relaxed">{block.text}</p>}
        <BlockLink link={block.link} />
      </div>
    </Section>
  )
}

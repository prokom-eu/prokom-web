import type { CallToActionBlock as CallToActionBlockData } from '@/payload-types'

import { BlockLink } from '../BlockLink'

export function CallToActionBlock({ block }: { block: CallToActionBlockData }) {
  return (
    <section>
      <h2>{block.heading}</h2>
      {block.text && <p>{block.text}</p>}
      <BlockLink link={block.link} />
    </section>
  )
}

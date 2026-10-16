import { RichText } from '@payloadcms/richtext-lexical/react'

import type { RichTextBlock as RichTextBlockData } from '@/payload-types'

export function RichTextBlock({ block }: { block: RichTextBlockData }) {
  return (
    <section>
      <RichText data={block.content} />
    </section>
  )
}

import { RichText } from '@payloadcms/richtext-lexical/react'

import { Section } from '@/components/ui/Section'
import type { RichTextBlock as RichTextBlockData } from '@/payload-types'

// Styles of the editor's output: `.rich-text` in `globals.css` (no typography plugin).
export function RichTextBlock({ block }: { block: RichTextBlockData }) {
  return (
    <Section>
      <RichText data={block.content} className="rich-text max-w-3xl" />
    </Section>
  )
}

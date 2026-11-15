import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { OutlineItem, RichTextData } from '@/lib/posts/content'

type Props = { content: RichTextData; outline: readonly OutlineItem[] }

const HEADINGS = new Set(['h2', 'h3', 'h4'])

type EditorState = Parameters<typeof RichText>[0]['data']

/**
 * The post's rich text. The h2 headings get the anchors of the table of contents: `outline`
 * holds the very heading objects of `content`, so each one is found by identity.
 */
export function PostContent({ content, outline }: Props) {
  const anchors = new Map<object, string>(outline.map(({ node, id }) => [node, id]))
  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const Tag = (HEADINGS.has(node.tag) ? node.tag : 'h2') as 'h2' | 'h3' | 'h4'
      const id = anchors.get(node)
      return (
        <Tag id={id} className={id ? 'scroll-mt-28' : undefined}>
          {nodesToJSX({ nodes: node.children })}
        </Tag>
      )
    },
  })
  return (
    <RichText
      data={content as unknown as EditorState}
      converters={converters}
      className="rich-text post-text"
    />
  )
}

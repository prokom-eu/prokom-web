import { normalizeText } from '../catalog/normalize'

/** Lexical JSON of a rich text field — only what these helpers read. */
export type RichTextData = { root: RichTextNode }

type RichTextNode = { type?: string; tag?: string; text?: string; children?: unknown }

export type OutlineItem = { id: string; title: string; node: object }

const WORDS_PER_MINUTE = 200

const childrenOf = (node: unknown): unknown[] => {
  const children = (node as RichTextNode | null)?.children
  return Array.isArray(children) ? children : []
}

/** Text of a node and all its children. */
export function plainText(node: unknown): string {
  const own = (node as RichTextNode | null)?.text
  return (typeof own === 'string' ? own : '') + childrenOf(node).map(plainText).join('')
}

const anchorOf = (title: string) =>
  normalizeText(title)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * Table of contents of a post (spec. §6.9 „spis treści”): its top-level h2 headings, each with
 * a unique anchor. `node` is the heading object itself, so the renderer can give exactly that
 * heading its `id` (same data object, no second slug pass that could drift).
 */
export function postOutline(content: RichTextData | null | undefined): OutlineItem[] {
  const used = new Set<string>()
  return childrenOf(content?.root)
    .filter(
      (node): node is RichTextNode =>
        (node as RichTextNode | null)?.type === 'heading' && (node as RichTextNode).tag === 'h2',
    )
    .map((node, index) => {
      const title = plainText(node).trim()
      const base = anchorOf(title) || `sekcja-${index + 1}`
      let id = base
      for (let suffix = 2; used.has(id); suffix += 1) id = `${base}-${suffix}`
      used.add(id)
      return { id, title, node }
    })
}

/** Reading time in whole minutes (at least 1) of the content plus texts shown above it. */
export function readingMinutes(
  content: RichTextData | null | undefined,
  extra: readonly (string | null | undefined)[] = [],
): number {
  // Blocks joined with a space: the last word of a paragraph must not merge with the next one.
  const blocks = childrenOf(content?.root).map(plainText)
  const text = [...blocks, ...extra].join(' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

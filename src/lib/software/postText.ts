import type { RichTextData } from '../posts/content'
import { fillText, type TextContext } from './facts'

type Node = { type?: string; text?: unknown; children?: unknown }

/** Blocks dropped whole when one of their values is missing on production. */
const BLOCKS = new Set(['paragraph', 'heading', 'listitem', 'quote', 'list'])

/**
 * A post's text with `{cena:<slug>}`, `{termin:<slug>}` and `[FAKT]` filled from the solutions
 * and facts of the tenant (decyzja 10: one price change in the panel changes every text, posts
 * included). A missing value: on production the paragraph, heading or list item holding it is
 * left out (like `fillText` drops a sentence), elsewhere the token stays visible. Returns new
 * objects; the stored content is never changed.
 */
export function fillPostContent(content: RichTextData, context: TextContext): RichTextData {
  const root = fillNode(content.root, context)
  return { root: (root ?? { ...content.root, children: [] }) as RichTextData['root'] }
}

/** `null` = the block is dropped (a value is missing on production). */
function fillNode(node: unknown, context: TextContext): unknown {
  if (!node || typeof node !== 'object') return node
  const source = node as Node
  if (typeof source.text === 'string') {
    const text = fillText(source.text, context)
    return text === null ? null : { ...source, text }
  }
  if (!Array.isArray(source.children)) return node
  const children: unknown[] = []
  for (const child of source.children) {
    const filled = fillNode(child, context)
    if (filled !== null) {
      children.push(filled)
      continue
    }
    // A text or inline node lost its value: the whole block goes, not half a sentence.
    if (!BLOCKS.has((child as Node | null)?.type ?? '')) return null
  }
  // A list whose every item went would render as an empty `<ul>`: it goes too.
  if (source.type === 'list' && children.length === 0) return null
  return { ...source, children }
}

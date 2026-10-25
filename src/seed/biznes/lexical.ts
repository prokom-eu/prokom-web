/**
 * Lexical JSON for seeded rich texts — only the nodes `restrictedRichTextEditor` allows
 * (paragraphs, h2–h4, lists, links to paths or https). Typed loosely: the collections' own
 * types describe the stored shape, the seed casts once at the end (`richText`).
 */

const textNode = (text: string, format = 0) => ({
  type: 'text',
  text,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const element = (type: string, children: object[], extra: object = {}) => ({
  type,
  children,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  ...extra,
})

/** Inline content: a plain string, or `{ bold }` / `{ link }` pieces. */
type Inline = string | { bold: string } | { text: string; href: string }

const inline = (piece: Inline) => {
  if (typeof piece === 'string') return textNode(piece)
  if ('bold' in piece) return textNode(piece.bold, 1)
  return element('link', [textNode(piece.text)], {
    version: 3,
    fields: { linkType: 'custom', url: piece.href, newTab: false },
  })
}

export const h2 = (text: string) => element('heading', [textNode(text)], { tag: 'h2' })

export const p = (...pieces: Inline[]) =>
  element('paragraph', pieces.map(inline), { textFormat: 0 })

export const ul = (...items: Inline[][]) =>
  element(
    'list',
    items.map((pieces, index) => element('listitem', pieces.map(inline), { value: index + 1 })),
    { listType: 'bullet', start: 1, tag: 'ul' },
  )

/** A rich text value from top-level nodes, cast to the field type of the caller. */
export function richText<T>(children: object[]): T {
  return { root: element('root', children) } as unknown as T
}

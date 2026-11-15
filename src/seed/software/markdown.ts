/**
 * Software guide posts written as Markdown files (`seed/prokomsoftware/wpisy/*.md`): easier to
 * write and review in a PR than Lexical JSON. A small subset only — exactly what the post editor
 * allows (`restrictedRichTextEditor`):
 * - a header between `---` lines, one `key: value` per line (`source:` may repeat);
 * - `## ` h2, `### ` h3, `- ` bullet and `1. ` numbered lists, `> ` quote, other lines are
 *   paragraphs (lines joined until an empty line);
 * - inline `**bold**` and `[text](/path or https://…)`.
 * Anything else stays literal text, so a typo shows up on the page instead of vanishing.
 */

export type MarkdownPost = {
  /** Header fields; `source` lines are collected in `sources`. */
  meta: Record<string, string>
  sources: string[]
  /** Top-level Lexical nodes of the content. */
  nodes: object[]
}

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

const INLINE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g

/** Inline nodes of a line: plain text, bold and links (paths or https, as the editor allows). */
export function inlineNodes(line: string): object[] {
  const nodes: object[] = []
  let last = 0
  for (const match of line.matchAll(INLINE)) {
    if (match.index > last) nodes.push(textNode(line.slice(last, match.index)))
    const [, bold, label, href] = match
    if (bold !== undefined) nodes.push(textNode(bold, 1))
    else
      nodes.push(
        element('link', [textNode(label ?? '')], {
          version: 3,
          fields: { linkType: 'custom', url: href, newTab: false },
        }),
      )
    last = match.index + match[0].length
  }
  if (last < line.length) nodes.push(textNode(line.slice(last)))
  return nodes
}

/** Every link address of the content (for the checks of the package). */
export function linksOf(nodes: readonly object[]): string[] {
  const found: string[] = []
  const walk = (node: unknown) => {
    const item = node as { type?: string; fields?: { url?: string }; children?: unknown[] }
    if (item?.type === 'link' && item.fields?.url) found.push(item.fields.url)
    for (const child of item?.children ?? []) walk(child)
  }
  nodes.forEach(walk)
  return found
}

type ListKind = 'bullet' | 'number'

/** Parses one post file; throws on a missing or broken header. */
export function parseMarkdownPost(source: string, file = 'post'): MarkdownPost {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  if (lines[0]?.trim() !== '---') throw new Error(`${file}: brak nagłówka „---”.`)
  const end = lines.indexOf('---', 1)
  if (end < 0) throw new Error(`${file}: nagłówek bez zamykającego „---”.`)

  const meta: Record<string, string> = {}
  const sources: string[] = []
  for (const line of lines.slice(1, end)) {
    if (!line.trim()) continue
    const colon = line.indexOf(':')
    if (colon < 1) throw new Error(`${file}: wiersz nagłówka bez „klucz: wartość”: ${line}`)
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim()
    if (key === 'source') sources.push(value)
    else if (key in meta) throw new Error(`${file}: pole „${key}” dwa razy.`)
    else meta[key] = value
  }

  const nodes: object[] = []
  let paragraph: string[] = []
  let list: { kind: ListKind; items: object[] } | null = null
  let quote: string[] = []

  const flush = () => {
    if (paragraph.length) {
      nodes.push(element('paragraph', inlineNodes(paragraph.join(' ')), { textFormat: 0 }))
      paragraph = []
    }
    if (list) {
      const { kind, items } = list
      nodes.push(
        element('list', items, {
          listType: kind,
          start: 1,
          tag: kind === 'bullet' ? 'ul' : 'ol',
        }),
      )
      list = null
    }
    if (quote.length) {
      nodes.push(element('quote', inlineNodes(quote.join(' '))))
      quote = []
    }
  }
  const listItem = (kind: ListKind, text: string) => {
    if (paragraph.length || quote.length || (list && list.kind !== kind)) flush()
    list ??= { kind, items: [] }
    list.items.push(element('listitem', inlineNodes(text), { value: list.items.length + 1 }))
  }

  for (const raw of lines.slice(end + 1)) {
    const line = raw.trim()
    const heading = /^(#{2,3}) (.+)$/.exec(line)
    const bullet = /^- (.+)$/.exec(line)
    const numbered = /^\d+\. (.+)$/.exec(line)
    const quoted = /^> ?(.*)$/.exec(line)
    if (!line) flush()
    else if (heading) {
      flush()
      const tag = heading[1] === '##' ? 'h2' : 'h3'
      nodes.push(element('heading', inlineNodes(heading[2] ?? ''), { tag }))
    } else if (bullet) listItem('bullet', bullet[1] ?? '')
    else if (numbered) listItem('number', numbered[1] ?? '')
    else if (quoted) {
      if (paragraph.length || list) flush()
      quote.push(quoted[1] ?? '')
    } else {
      if (list || quote.length) flush()
      paragraph.push(line)
    }
  }
  flush()
  return { meta, sources, nodes }
}

import { readingMinutes, type RichTextData } from '../posts/content'

type Cell = string | null | undefined

/** Fields of the `legalTable` block inside the text of `swLegal` (up to four columns). */
export type LegalTableFields = {
  blockType: 'legalTable'
  caption?: string | null
  head1?: Cell
  head2?: Cell
  head3?: Cell
  head4?: Cell
  rows?: { c1?: Cell; c2?: Cell; c3?: Cell; c4?: Cell; id?: string | null }[] | null
}

/** Fields of the `legalNote` block (a short note with the „!” mark). */
export type LegalNoteFields = { blockType: 'legalNote'; text?: string | null }

export type LegalTable = { heads: string[]; rows: string[][] }

const clean = (value: Cell) => (value ?? '').trim()

/**
 * A table of a legal page (ZMIANY-v24 §9.6: purposes and legal bases, retention, browser storage)
 * as an even grid: the filled headers are the columns; every row is cut to them, a missing cell is
 * an empty text, an empty row is left out (the panel keeps a row the editor only began).
 */
export function legalTable(fields: LegalTableFields): LegalTable {
  const heads = [fields.head1, fields.head2, fields.head3, fields.head4].map(clean).filter(Boolean)
  const rows = (fields.rows ?? [])
    .map((row) => [row.c1, row.c2, row.c3, row.c4].slice(0, heads.length).map(clean))
    .filter((cells) => cells.some(Boolean))
  return { heads, rows: heads.length ? rows : [] }
}

type Node = { type?: string; fields?: Record<string, unknown> }

/** Words of the blocks inside the text — their fields are not lexical children. */
function blockTexts(content: RichTextData | null | undefined): string[] {
  const nodes = (content?.root as { children?: unknown } | undefined)?.children
  if (!Array.isArray(nodes)) return []
  return nodes.flatMap((node: Node) => {
    if (node?.type !== 'block' || !node.fields) return []
    const fields = node.fields
    if (fields.blockType === 'legalNote') return [clean(fields.text as Cell)]
    if (fields.blockType === 'legalTable') {
      const table = legalTable(fields as LegalTableFields)
      return [...table.heads, ...table.rows.flat()]
    }
    return []
  })
}

/**
 * Reading time of a legal page (the hero badge „Czas czytania”): the text with its tables and
 * notes plus what stands above it (heading, lead).
 */
export function legalReadingMinutes(
  content: RichTextData | null | undefined,
  extra: readonly (string | null | undefined)[] = [],
): number {
  return readingMinutes(content, [...extra, ...blockTexts(content)])
}

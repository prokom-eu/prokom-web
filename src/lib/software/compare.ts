/**
 * „Freelancer, agencja czy PRO-KOM?” (spec. §6.6, stany/70) from `compare` of the package:
 * columns `[criterion, icon A, A, icon B, B, ours]`. Each rival keeps its icon per row
 * (`–`, `?`, `✓` → `no`, `maybe`, `yes`); a table of another shape gives `null` (no section).
 */

export type Mark = 'no' | 'maybe' | 'yes'

export type CompareView = {
  /** Column names: the two rivals and ours. */
  rivals: [string, string]
  ours: string
  rows: { criterion: string; rivals: [RivalCell, RivalCell]; ours: string }[]
}

export type RivalCell = { mark: Mark; text: string }

const MARKS: Record<string, Mark> = { '–': 'no', '-': 'no', '?': 'maybe', '✓': 'yes' }

/** The word a mark stands for; the icon says it (with a screen reader text), the cell does not. */
const MARK_WORDS: Partial<Record<Mark, string>> = { yes: 'tak', no: 'nie' }

/**
 * The cell text without the „tak”/„nie” its icon already says — „tak, zapisane w umowie” read
 * next to ✓ was „tak, tak” (audyt 01.11 P1 #8, SWV9 Z10). Only a whole word at the start or the
 * end, set off by a comma; a cell that is only the word becomes empty (the icon alone).
 */
export function withoutMarkWord(text: string, mark: Mark): string {
  const word = MARK_WORDS[mark]
  if (!word) return text
  const trimmed = text.trim()
  const lower = trimmed.toLowerCase().replace(/[.!]$/, '')
  if (lower === word) return ''
  if (lower.startsWith(`${word},`)) return trimmed.slice(word.length + 1).trimStart()
  if (lower.endsWith(`, ${word}`)) return trimmed.slice(0, trimmed.lastIndexOf(',')).trimEnd()
  return trimmed
}

function rivalCell(markKey: string | undefined, text: string): RivalCell {
  const mark = MARKS[markKey ?? ''] ?? 'maybe'
  return { mark, text: withoutMarkWord(text, mark) }
}

export function compareView(table: { columns: string[]; rows: string[][] }): CompareView | null {
  const [, , rivalA, , rivalB, ours] = table.columns
  if (table.columns.length !== 6 || !rivalA || !rivalB || !ours) return null
  const rows = table.rows.flatMap((row) => {
    const [criterion, markA, textA, markB, textB, ourText] = row
    if (!criterion || !textA || !textB || !ourText) return []
    return [
      {
        criterion,
        rivals: [rivalCell(markA, textA), rivalCell(markB, textB)] as [RivalCell, RivalCell],
        ours: withoutMarkWord(ourText, 'yes'),
      },
    ]
  })
  return rows.length > 0 ? { rivals: [rivalA, rivalB], ours, rows } : null
}

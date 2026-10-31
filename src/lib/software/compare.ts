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

export function compareView(table: { columns: string[]; rows: string[][] }): CompareView | null {
  const [, , rivalA, , rivalB, ours] = table.columns
  if (table.columns.length !== 6 || !rivalA || !rivalB || !ours) return null
  const rows = table.rows.flatMap((row) => {
    const [criterion, markA, textA, markB, textB, ourText] = row
    if (!criterion || !textA || !textB || !ourText) return []
    return [
      {
        criterion,
        rivals: [
          { mark: MARKS[markA ?? ''] ?? 'maybe', text: textA },
          { mark: MARKS[markB ?? ''] ?? 'maybe', text: textB },
        ] as [RivalCell, RivalCell],
        ours: ourText,
      },
    ]
  })
  return rows.length > 0 ? { rivals: [rivalA, rivalB], ours, rows } : null
}

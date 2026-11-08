/**
 * Biznes on a phone (D12, decyzja Krystiana 06.11.2026 — odwraca „telefon jak plansza” z 02.11):
 * a phone does not hide what a computer shows. Long sections get a shorter form instead; here only
 * the sections folded to one title row that unfolds (an accordion). A rule names the block type
 * and, optionally, the section kind (`variant`).
 */
type Rule = { type: string; variant?: string }

type BlockLike = { blockType: string; variant?: string | null }

/**
 * Sections folded to one row on a phone (boards App-*: a title row that unfolds). A section
 * without a heading has no title for the row: it stays shown in full.
 */
const FOLDS: Record<string, readonly Rule[]> = {
  // App-Opieka: „Z opieką i bez”, „Dla kogo”.
  'opieka-it': [
    { type: 'bzSection', variant: 'table' },
    { type: 'bzSection', variant: 'audience' },
  ],
}

export function foldedOnPhone(slug: string, block: BlockLike): boolean {
  return (FOLDS[slug] ?? []).some(
    (rule) =>
      rule.type === block.blockType &&
      (rule.variant === undefined || rule.variant === block.variant),
  )
}

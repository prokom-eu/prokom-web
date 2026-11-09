/**
 * Blocks a Biznes page shows twice (BIZ-3 §10.3, audit 0611 P1-3): a block left out when another
 * block on the same page says the same. Works on the page as stored, so the panel needs no change
 * and the block comes back on its own when the other one is removed.
 */
type Block = { blockType: string; variant?: string | null }

/** `gopos-areas` (module list) repeats `gopos-package` (configurator with module descriptions). */
const REPEATED_BY: Record<string, string> = { 'gopos-areas': 'gopos-package' }

export function withoutRepeatedBlocks<T extends Block>(blocks: readonly T[]): T[] {
  const variants = new Set(
    blocks.flatMap((block) =>
      block.blockType === 'bzSection' && block.variant ? [block.variant] : [],
    ),
  )
  return blocks.filter((block) => {
    if (block.blockType !== 'bzSection' || !block.variant) return true
    const by = REPEATED_BY[block.variant]
    return !(by && variants.has(by))
  })
}

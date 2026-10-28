/**
 * Merging a seeded page layout into a page that may have been edited in the panel (B7, SW5).
 * The sample page (no block of the line yet) is replaced; otherwise the page keeps its blocks,
 * order and duplicates and only blocks it lacks are inserted — right after the last block that
 * comes before them in the seed. `null` = nothing to change.
 */
export type MergeOptions<T> = {
  /** Block of the line's own set (a page without one is still the sample). */
  own: (block: T) => boolean
  /** What makes two blocks „the same” (default: the block type). */
  identity?: (block: T) => string
}

export function mergeLayout<T extends { blockType: string }>(
  existing: readonly T[] | null | undefined,
  seed: readonly T[],
  { own, identity = (block) => block.blockType }: MergeOptions<T>,
): T[] | null {
  const current = existing ?? []
  if (!current.some(own)) return [...seed]
  const seedOrder = seed.map(identity)
  const layout = [...current]
  let changed = false
  seed.forEach((block, position) => {
    const id = identity(block)
    if (layout.some((b) => identity(b) === id)) return
    const earlier = new Set(seedOrder.slice(0, position))
    let after = -1
    layout.forEach((b, i) => {
      if (earlier.has(identity(b))) after = i
    })
    layout.splice(after + 1, 0, block)
    changed = true
  })
  return changed ? layout : null
}

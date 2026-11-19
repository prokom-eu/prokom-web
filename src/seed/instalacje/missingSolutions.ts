import type { SolutionItem } from './map'

/**
 * Solutions of the package the panel does not have yet (by `legacyId`): the catalog import on a
 * live production creates only these (INST-K2 streaming, 77–79) and never changes a stored one —
 * the panel's edits of the offer stay.
 */
export function missingSolutions(
  items: readonly SolutionItem[],
  stored: ReadonlySet<number>,
): SolutionItem[] {
  return items.filter((item) => !stored.has(item.legacyId))
}

import type { SolutionItem } from './map'

/**
 * The offer's solutions from before the live start (1–76): one missing on production was deleted
 * in the panel on purpose, so the catalog import never brings it back (ADR-027 „Rozstrzygnięcia
 * 19.11”, like `RETIRED_GUIDE_SLUGS` of the Biznes posts).
 */
export const LIVE_SOLUTIONS_UNTIL = 76

/**
 * Solutions added to the package after the live start (INST-K2 streaming, 77–79) that the panel
 * does not have yet (by `legacyId`): the catalog import on a live production creates only these
 * and never changes a stored one — the panel's edits of the offer stay.
 */
export function missingSolutions(
  items: readonly SolutionItem[],
  stored: ReadonlySet<number>,
): SolutionItem[] {
  return items.filter((item) => item.legacyId > LIVE_SOLUTIONS_UNTIL && !stored.has(item.legacyId))
}

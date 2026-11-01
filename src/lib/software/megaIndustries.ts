type Link = readonly [string, string, ...unknown[]]

/** From this many active industries the mega menu shows its own „Dla branż” group. */
export const MIN_INDUSTRY_GROUP = 3

/**
 * Where the mega menu puts the industry links (audyt 01.11 P1 #11): a group of one chip looked
 * unfinished, so below `MIN_INDUSTRY_GROUP` each industry is a plain link in the offer card
 * („Dla branży: Budowlanka i ekipy”) and the group appears once there are enough.
 */
export function megaIndustries<L extends Link>(
  industries: readonly L[],
  cardLinks: readonly L[],
): { group: L[]; cardLinks: L[] } {
  if (industries.length >= MIN_INDUSTRY_GROUP)
    return { group: [...industries], cardLinks: [...cardLinks] }
  return {
    group: [],
    cardLinks: [
      ...cardLinks,
      ...industries.map(
        ([label, href, ...rest]) => [`Dla branży: ${label}`, href, ...rest] as unknown as L,
      ),
    ],
  }
}

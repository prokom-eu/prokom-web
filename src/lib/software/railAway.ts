/** Room kept between the rail's lower edge and the footer before the rail steps aside. */
export const RAIL_AWAY_GAP = 16

type RailAwayInput = {
  /** Lower edge of the visible rail (viewport px). */
  railBottom: number
  /** Upper edges of the band above the footer and of the footer (viewport px; shown ones only). */
  targetTops: readonly number[]
  /** The page has been scrolled: on an unscrolled short page the rail stays — it is the navigation. */
  scrolled: boolean
}

/**
 * Whether the fixed side rail steps aside (AUDYT po SWA7 #4): only once the band above the
 * footer or the footer itself reaches the rail, never just because the footer is somewhere on
 * the screen (short pages — 404, thanks, legal — would lose the rail and its search).
 */
export function railAway({ railBottom, targetTops, scrolled }: RailAwayInput): boolean {
  if (!scrolled || targetTops.length === 0) return false
  return Math.min(...targetTops) < railBottom + RAIL_AWAY_GAP
}

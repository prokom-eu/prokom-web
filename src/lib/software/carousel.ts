/**
 * Which card of a phone carousel the dots mark: the one whose start is nearest the scroller's
 * left edge (`starts`: each card's left minus the scroller's, in px), or the last one at the end
 * of the row — a short last card never reaches the edge (audyt 01.11 P1 #23–#24).
 */
export function activeSlide(starts: readonly number[], atEnd: boolean): number {
  if (starts.length === 0) return 0
  if (atEnd) return starts.length - 1
  let best = 0
  for (let i = 1; i < starts.length; i++) {
    if (Math.abs(starts[i] ?? 0) < Math.abs(starts[best] ?? 0)) best = i
  }
  return best
}

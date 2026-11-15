/** Share of the screen height a section's top must pass to count as the one being read. */
export const RAIL_LINE = 0.4

/**
 * The section of a start page the rail marks (SWV6 A2): the last one whose top edge has passed
 * 40% of the screen height, the first one before any has, and the last one once the page is
 * scrolled to the bottom (a short last section never reaches the line). `top` is the section's
 * `getBoundingClientRect().top`, sections in page order.
 */
export function activeSection(
  sections: { id: string; top: number }[],
  viewportHeight: number,
  atBottom: boolean,
): string | null {
  if (sections.length === 0) return null
  if (atBottom) return sections[sections.length - 1]!.id
  const line = viewportHeight * RAIL_LINE
  let current = sections[0]!.id
  for (const section of sections) {
    if (section.top <= line) current = section.id
  }
  return current
}

/**
 * Where the rail's progress line ends (AUDYT-0811 #8), as a position in the list: the index of the
 * section being read (same rule as `activeSection`) plus the share of it read so far — the way
 * from its top to the next section's top past the 40% line. 0 before any section, the last index
 * at the bottom of the page. `tops` as in `activeSection`, in page order.
 */
export function railProgress(tops: number[], viewportHeight: number, atBottom: boolean): number {
  if (tops.length === 0) return 0
  const last = tops.length - 1
  if (atBottom) return last
  const line = viewportHeight * RAIL_LINE
  let index = -1
  for (const [i, top] of tops.entries()) if (top <= line) index = i
  if (index < 0) return 0
  if (index === last) return last
  const span = tops[index + 1]! - tops[index]!
  const read = span > 0 ? (line - tops[index]!) / span : 0
  return index + Math.min(1, Math.max(0, read))
}

/**
 * The progress line drawn from the centre of the first rail entry to the centre of the last:
 * which share of it is filled for a `railProgress` position, given the entries' centres (px).
 */
export function railLineEnd(position: number, centers: number[]): number {
  if (centers.length < 2) return 0
  const first = centers[0]!
  const length = centers[centers.length - 1]! - first
  if (length <= 0) return 0
  const index = Math.min(centers.length - 1, Math.max(0, Math.floor(position)))
  const next = centers[Math.min(centers.length - 1, index + 1)]!
  const end = centers[index]! + (next - centers[index]!) * (position - index)
  return Math.min(1, Math.max(0, (end - first) / length))
}

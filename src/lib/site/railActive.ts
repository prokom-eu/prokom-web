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

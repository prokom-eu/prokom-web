/**
 * State of the section rail (`common.js → _onS`, v4.2): the active section is the last one whose
 * top has passed 35% of the window; the rail shows after 400 px of scrolling. `top` = offset of
 * the section from the top of the page.
 */
export function railState(
  sections: readonly { id: string; top: number }[],
  scrollY: number,
  viewportHeight: number,
): { active: string | null; visible: boolean } {
  const line = scrollY + viewportHeight * 0.35
  let active = sections[0]?.id ?? null
  for (const section of sections) if (section.top <= line) active = section.id
  return { active, visible: scrollY > 400 }
}

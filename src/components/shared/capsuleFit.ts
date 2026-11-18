/**
 * Steps the header capsule gives way by when its row is too short (`CapsuleShell`), in order: the
 * theme button as an icon, search as an icon, a tighter menu, the short action label, and last
 * the tightest spacing with a smaller mark.
 */
export const FIT_STEPS = ['theme', 'search', 'nav', 'cta', 'tight'] as const

/**
 * Free room of the capsule's row: its inner width minus the in-flow items and the gaps between
 * them. Negative = something sticks out. Absolutely placed parts (mega menus, the spy pill) are not
 * in the row, so `scrollWidth` would mislead.
 */
export function capsuleFree(capsule: HTMLElement): number {
  const style = getComputedStyle(capsule)
  const items = [...capsule.children].filter((el) => {
    const s = getComputedStyle(el)
    return s.display !== 'none' && s.position !== 'absolute' && s.position !== 'fixed'
  })
  const used = items.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0)
  const inner = capsule.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
  return inner - used - (parseFloat(style.columnGap) || 0) * Math.max(0, items.length - 1)
}

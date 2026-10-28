/**
 * Keyboard of the ARIA tabs on the Software start page (spec. §8.3): arrows move by one and
 * wrap around, Home and End jump to the ends. `null` = the key is not ours.
 */
export function tabKeyTarget(key: string, index: number, count: number): number | null {
  if (count < 1) return null
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (index + 1) % count
    case 'ArrowLeft':
    case 'ArrowUp':
      return (index - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return null
  }
}

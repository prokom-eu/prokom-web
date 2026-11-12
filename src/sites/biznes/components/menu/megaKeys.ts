/** Where the focus is when a key goes down: the „Oferta ▾” button, a department, a category. */
export type MegaZone = 'trigger' | 'tabs' | 'categories'

export type MegaAction =
  /** Open the panel and focus the department `focus`. */
  | { type: 'open'; focus: number }
  /** Focus (and show) the department `focus`. */
  | { type: 'tab'; focus: number }
  /** Focus the first category of the shown department. */
  | { type: 'categories' }
  /** Close the panel and give the focus back to the button. */
  | { type: 'close' }
  /** Not ours: the browser handles the key (Tab, Enter, letters). */
  | { type: 'none' }

const NONE: MegaAction = { type: 'none' }

/**
 * The keyboard of Oferta ▾ (plan 0611 §8.1 pkt 3, WAI-ARIA tabs, vertical): ↓ on the button opens
 * on the active department; ↑↓ wrap and Home/End jump among departments; → goes into the
 * categories and ← comes back; Esc closes. `index` is the active department, `count` how many.
 */
export function megaKey(
  key: string,
  { zone, index, count }: { zone: MegaZone; index: number; count: number },
): MegaAction {
  if (count === 0) return { type: 'none' }
  if (zone === 'trigger') return key === 'ArrowDown' ? { type: 'open', focus: index } : NONE
  if (key === 'Escape') return { type: 'close' }
  if (zone === 'categories') return key === 'ArrowLeft' ? { type: 'tab', focus: index } : NONE
  switch (key) {
    case 'ArrowDown':
      return { type: 'tab', focus: (index + 1) % count }
    case 'ArrowUp':
      return { type: 'tab', focus: (index - 1 + count) % count }
    case 'Home':
      return { type: 'tab', focus: 0 }
    case 'End':
      return { type: 'tab', focus: count - 1 }
    case 'ArrowRight':
      return { type: 'categories' }
    default:
      return NONE
  }
}

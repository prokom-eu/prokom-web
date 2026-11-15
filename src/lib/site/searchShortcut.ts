/** What a key press needs to tell; `typing`: the focus is in a field. */
export type ShortcutKey = {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  typing: boolean
}

/**
 * Keys that open the global search (K33 §2.5, board „Szukaj · Ctrl K”): Ctrl/Cmd+K anywhere —
 * it is never typed — and „/” outside fields, without modifiers.
 */
export function isSearchShortcut(event: ShortcutKey): boolean {
  if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
    return true
  }
  return event.key === '/' && !event.typing && !event.ctrlKey && !event.metaKey && !event.altKey
}

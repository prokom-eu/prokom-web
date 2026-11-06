'use client'

// Opens the shared menu sheet from anywhere (the tab bar's „Menu”, the capsule's Menu button)
// without a shared React tree — the same pattern as the search (`lib/site/searchOpen.ts`).
const listeners = new Set<() => void>()

/** Called by the menu sheet; returns the unsubscribe. */
export function onMenuRequest(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Opens the menu sheet. */
export function requestMenu(): void {
  for (const listener of listeners) listener()
}

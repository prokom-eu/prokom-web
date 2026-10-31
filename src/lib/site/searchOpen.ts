'use client'

// Opens the site search from anywhere on the page (the side rail's „Szukaj”, K33 §2.4) without
// a shared React tree: the search overlay listens, any button asks.
const listeners = new Set<(query?: string) => void>()

/** Called by the search overlay; returns the unsubscribe. */
export function onSearchRequest(listener: (query?: string) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Opens the search, with `query` already typed when given (popular phrases on the home page). */
export function requestSearch(query?: string): void {
  for (const listener of listeners) listener(query)
}

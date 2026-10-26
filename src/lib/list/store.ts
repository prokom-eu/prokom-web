'use client'

import { useSyncExternalStore } from 'react'

/**
 * A list kept in the browser (ADR-014 rozstrz. 9): one `localStorage` key, shared by all tabs
 * through the `storage` event, read with `useSyncExternalStore` (no state library). Without
 * storage (private mode, blocked site data) the list lives in memory for the page view.
 * Used by the Biznes inquiry list (`pk-cart`) and the Software project (`pk-project`); the
 * operations on the items stay with each list.
 */

export type Added = { id: string; name: string }

export function createListStore<T>(key: string, parse: (raw: string | null) => readonly T[]) {
  const empty: readonly T[] = []
  const listeners = new Set<() => void>()
  let snapshot: { raw: string | null; list: readonly T[] } = { raw: null, list: empty }
  let memory: string | null = null
  /** Set when storage failed (full, Safari private mode, blocked): `memory` is the list since. */
  let inMemory = false

  function readRaw(): string | null {
    if (inMemory) return memory
    try {
      return window.localStorage.getItem(key)
    } catch {
      return memory
    }
  }

  function get(): readonly T[] {
    const raw = readRaw()
    // Same text → same array: React re-renders only when the list really changed.
    if (raw !== snapshot.raw) snapshot = { raw, list: raw ? parse(raw) : empty }
    return snapshot.list
  }

  const getServerSnapshot = () => empty

  function notify() {
    for (const listener of listeners) listener()
  }

  function onStorage(event: StorageEvent) {
    if (event.key === key || event.key === null) notify()
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    if (listeners.size === 1) window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) window.removeEventListener('storage', onStorage)
    }
  }

  function write(list: readonly T[]) {
    const raw = JSON.stringify(list)
    memory = raw
    try {
      window.localStorage.setItem(key, raw)
    } catch {
      // No storage: `memory` keeps the list until the page is left.
      inMemory = true
    }
    notify()
  }

  // Events for the toast and the drawer (one of each per page, in the header).
  const addedListeners = new Set<(added: Added) => void>()
  const openListeners = new Set<() => void>()

  function on<L>(set: Set<L>, listener: L) {
    set.add(listener)
    return () => {
      set.delete(listener)
    }
  }

  return {
    get,
    write,
    subscribe,
    /** The list; empty on the server and in the first render (no hydration mismatch). */
    useList: (): readonly T[] => useSyncExternalStore(subscribe, get, getServerSnapshot),
    onAdded: (listener: (added: Added) => void) => on(addedListeners, listener),
    onOpen: (listener: () => void) => on(openListeners, listener),
    announce(id: string, name: string) {
      for (const listener of addedListeners) listener({ id, name })
    },
    open() {
      for (const listener of openListeners) listener()
    },
  }
}

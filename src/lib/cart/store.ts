'use client'

import { useSyncExternalStore } from 'react'

import * as list from './cart'
import { CART_KEY, type Cart, parseCart } from './cart'

/**
 * The inquiry list in the browser (spec. §8.1): `localStorage` `pk-cart`, shared by all tabs
 * through the `storage` event, read with `useSyncExternalStore` (no state library). Without
 * storage (private mode, blocked site data) the list lives in memory for the page view.
 */

const EMPTY: Cart = []
const listeners = new Set<() => void>()
let snapshot: { raw: string | null; cart: Cart } = { raw: null, cart: EMPTY }
let memory: string | null = null

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(CART_KEY)
  } catch {
    return memory
  }
}

function getSnapshot(): Cart {
  const raw = readRaw()
  // Same text → same array: React re-renders only when the list really changed.
  if (raw !== snapshot.raw) snapshot = { raw, cart: raw ? parseCart(raw) : EMPTY }
  return snapshot.cart
}

const getServerSnapshot = () => EMPTY

function notify() {
  for (const listener of listeners) listener()
}

function onStorage(event: StorageEvent) {
  if (event.key === CART_KEY || event.key === null) notify()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}

function write(cart: Cart) {
  const raw = JSON.stringify(cart)
  memory = raw
  try {
    window.localStorage.setItem(CART_KEY, raw)
  } catch {
    // No storage: `memory` keeps the list until the page is left.
  }
  notify()
}

/** The list; empty on the server and in the first render (no hydration mismatch). */
export function useCart(): Cart {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

// --- events for the toast and the drawer (one of each per page, in the header) ---

type Added = { id: string; name: string }
const addedListeners = new Set<(added: Added) => void>()
const openListeners = new Set<() => void>()

function on<T>(set: Set<T>, listener: T) {
  set.add(listener)
  return () => {
    set.delete(listener)
  }
}

export const onCartAdded = (listener: (added: Added) => void) => on(addedListeners, listener)
export const onCartOpen = (listener: () => void) => on(openListeners, listener)

export function openCartDrawer() {
  for (const listener of openListeners) listener()
}

function announce(id: string, name: string) {
  for (const listener of addedListeners) listener({ id, name })
}

/** Changes of the list; `name` is shown in the "Dodano do zapytania" toast. */
export const cartActions = {
  toggle(id: string, name: string) {
    const { cart, added } = list.toggle(getSnapshot(), id)
    write(cart)
    if (added) announce(id, name)
  },
  add(id: string, name: string) {
    const before = getSnapshot()
    const cart = list.addOnly(before, id)
    if (cart === before) return
    write(cart)
    announce(id, name)
  },
  changeQty: (id: string, delta: number) => write(list.changeQty(getSnapshot(), id, delta)),
  remove: (id: string) => write(list.remove(getSnapshot(), id)),
  setNote: (id: string, note: string) => write(list.setNote(getSnapshot(), id, note)),
  clear: () => write(EMPTY),
  prune(known: ReadonlySet<string>) {
    const before = getSnapshot()
    const cart = list.prune(before, known)
    if (cart !== before) write(cart)
  },
}

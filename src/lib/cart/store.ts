'use client'

import { createListStore } from '../list/store'
import * as list from './cart'
import { CART_KEY, type Cart, parseCart } from './cart'

/**
 * The inquiry list in the browser (spec. §8.1): `localStorage` `pk-cart` on the shared list
 * store (`lib/list/store.ts` — tabs, memory fallback, toast and drawer events). The item
 * operations (quantities, notes) stay in `./cart`.
 */

const store = createListStore(CART_KEY, parseCart)
const get: () => Cart = store.get

export const useCart: () => Cart = store.useList
export const onCartAdded = store.onAdded
export const onCartOpen = store.onOpen
export const openCartDrawer = store.open

/** Changes of the list; `name` is shown in the "Dodano do zapytania" toast. */
export const cartActions = {
  toggle(id: string, name: string) {
    const { cart, added } = list.toggle(get(), id)
    store.write(cart)
    if (added) store.announce(id, name)
  },
  add(id: string, name: string) {
    const before = get()
    const cart = list.addOnly(before, id)
    if (cart === before) return
    store.write(cart)
    store.announce(id, name)
  },
  /** „Dodaj wszystko”: one write and one toast with `name` (e.g. „3 pozycje ze stanowiska”). */
  addMany(ids: readonly string[], name: (added: number) => string) {
    const { cart, added } = list.addAll(get(), ids)
    if (added.length === 0) return
    store.write(cart)
    store.announce(added[0]!, name(added.length))
  },
  /**
   * „Zapytaj o ten zestaw”: items with quantity and note, one write and one toast. Returns what
   * happened, so the button can say it when no toast shows (only notes added, list full).
   */
  addItems(items: readonly list.NewCartItem[], name: (added: number) => string) {
    const result = list.addItems(get(), items)
    if (result.added.length || result.noted.length) store.write(result.cart)
    if (result.added.length) store.announce(result.added[0]!, name(result.added.length))
    return {
      added: result.added.length,
      noted: result.noted.length,
      skipped: result.skipped.length,
    }
  },
  changeQty: (id: string, delta: number) => store.write(list.changeQty(get(), id, delta)),
  remove: (id: string) => store.write(list.remove(get(), id)),
  setNote: (id: string, note: string) => store.write(list.setNote(get(), id, note)),
  clear: () => store.write([]),
  prune(known: ReadonlySet<string>) {
    const before = get()
    const cart = list.prune(before, known)
    if (cart !== before) store.write(cart)
  },
}

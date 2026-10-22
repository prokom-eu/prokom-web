import type { CatalogIndex, IndexProduct } from '../catalog/catalogIndex'

/**
 * The inquiry list of the Biznes site (spec. §8.1): a cart without prices, kept in the
 * browser under `pk-cart` as `[{ id: slug, q: quantity, uwaga?: note }]`. Pure functions:
 * the store (`./store`) persists them, the drawer and the inquiry page use them.
 */

export const CART_KEY = 'pk-cart'
/** Limits shared with the inquiry form (STAN, B8): a list a person can read on the phone. */
export const MAX_ITEMS = 50
export const MAX_QTY = 999
export const MAX_NOTE = 500

export type CartItem = { id: string; q: number; uwaga?: string }
export type Cart = readonly CartItem[]

const clampQty = (value: unknown) => {
  const q = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : 1
  return Math.min(MAX_QTY, Math.max(1, q))
}

/** The stored list, whatever the browser holds: broken entries and duplicates are dropped. */
export function parseCart(raw: string | null): CartItem[] {
  let data: unknown
  try {
    data = raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
  const seen = new Set<string>()
  const cart: CartItem[] = []
  for (const entry of data) {
    if (cart.length === MAX_ITEMS) break
    if (typeof entry !== 'object' || entry === null) continue
    const { id, q, uwaga } = entry as Record<string, unknown>
    if (typeof id !== 'string' || !id || seen.has(id)) continue
    seen.add(id)
    const note = typeof uwaga === 'string' ? uwaga.trim().slice(0, MAX_NOTE) : ''
    cart.push({ id, q: clampQty(q), ...(note && { uwaga: note }) })
  }
  return cart
}

const has = (cart: Cart, id: string) => cart.some((item) => item.id === id)

/** Add when missing (quantity 1), remove when present — the "+ Do zapytania" switch. */
export function toggle(cart: Cart, id: string): { cart: Cart; added: boolean } {
  if (has(cart, id)) return { cart: remove(cart, id), added: false }
  if (cart.length >= MAX_ITEMS) return { cart, added: false }
  return { cart: [...cart, { id, q: 1 }], added: true }
}

/** Add without switching off ("Dodaj wszystko"); the same list when already there or full. */
export function addOnly(cart: Cart, id: string): Cart {
  return has(cart, id) || cart.length >= MAX_ITEMS ? cart : [...cart, { id, q: 1 }]
}

/**
 * „Dodaj wszystko do zapytania” (spec. §6.2): adds the missing ones in order, up to the item
 * limit; listed ones keep their quantity and note. `added` = what was really added.
 */
export function addAll(cart: Cart, ids: readonly string[]): { cart: Cart; added: string[] } {
  let next = cart
  const added: string[] = []
  for (const id of ids) {
    const after = addOnly(next, id)
    if (after !== next) added.push(id)
    next = after
  }
  return { cart: next, added }
}

export function changeQty(cart: Cart, id: string, delta: number): Cart {
  return cart.map((item) => (item.id === id ? { ...item, q: clampQty(item.q + delta) } : item))
}

export function remove(cart: Cart, id: string): Cart {
  return cart.filter((item) => item.id !== id)
}

/** Note to a position ("kolor, model, termin"); an empty one is removed. */
export function setNote(cart: Cart, id: string, note: string): Cart {
  const text = note.trim().slice(0, MAX_NOTE)
  return cart.map((item) => {
    if (item.id !== id) return item
    const { uwaga: _old, ...rest } = item
    return text ? { ...rest, uwaga: text } : rest
  })
}

/** Without the slugs the catalog no longer has (spec. §8.1: checked once the index loads). */
export function prune(cart: Cart, known: ReadonlySet<string>): Cart {
  return cart.every((item) => known.has(item.id)) ? cart : cart.filter((item) => known.has(item.id))
}

/** The header counter: positions, not pieces (spec. §8.1). */
export const cartCount = (cart: Cart) => cart.length

/**
 * "Często dobierane" for the list: first the products the panel set as "Skompletuj
 * stanowisko" (`fits`) for the listed ones, then the most popular products of the same groups
 * from categories not on the list yet.
 */
// TODO(krystian): rule agreed for B4b; confirm with the boss or fill "Skompletuj stanowisko".
export function suggestFor(cart: Cart, index: CatalogIndex, limit = 2): IndexProduct[] {
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  const listed = cart.map((item) => bySlug.get(item.id)).filter((p) => p !== undefined)
  if (listed.length === 0) return []

  const taken = new Set(cart.map((item) => item.id))
  const out: IndexProduct[] = []
  const push = (product: IndexProduct | undefined) => {
    if (out.length < limit && product && !taken.has(product.slug)) {
      taken.add(product.slug)
      out.push(product)
    }
  }

  for (const product of listed) for (const slug of product.fits ?? []) push(bySlug.get(slug))

  const groups = new Set(listed.map((product) => product.group).filter((g) => g !== null))
  const categories = new Set(listed.flatMap((product) => product.categories))
  const sameGroup = index.products
    .filter(
      (p) => p.group !== null && groups.has(p.group) && !categories.has(p.categories[0] ?? ''),
    )
    .sort((a, b) => b.popularity - a.popularity)
  for (const product of sameGroup) push(product)
  return out
}

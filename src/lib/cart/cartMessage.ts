import { plural } from '../plural'
import type { Cart } from './cart'

/**
 * The inquiry list „Do zapytania” as text under the contact message (Biznes Kontakt, plan 0611
 * §8.2): one line per product with the quantity and the note. `names`: slug → name from the
 * catalog index; an unknown slug stays as it is. Empty list → `null` (nothing attached).
 */
export function cartMessage(cart: Cart, names: ReadonlyMap<string, string>): string | null {
  if (cart.length === 0) return null
  const lines = cart.map(
    (item) =>
      `- ${names.get(item.id) ?? item.id} × ${item.q}${item.uwaga ? ` (uwaga: ${item.uwaga})` : ''}`,
  )
  const count = `${cart.length} ${plural(cart.length, ['pozycja', 'pozycje', 'pozycji'])}`
  return [`Lista „Do zapytania” (${count}):`, ...lines].join('\n')
}

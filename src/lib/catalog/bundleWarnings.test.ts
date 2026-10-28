import { describe, expect, it } from 'vitest'

import { hiddenItemsWarning } from './bundleWarnings'

const items = [
  { role: 'terminal POS', product: 1, mandatory: true },
  { role: 'drukarka', product: { id: 2 }, mandatory: true },
  { role: 'router', product: 3, mandatory: false },
  { role: 'usunięty', product: null, mandatory: false },
]

describe('hiddenItemsWarning (K3c)', () => {
  it('says nothing while every card is published', () => {
    expect(hiddenItemsWarning(items.slice(0, 3), new Set([1, 2, 3]))).toBeNull()
  })

  it('names the items of hidden or deleted cards', () => {
    expect(hiddenItemsWarning(items, new Set([1, 2]))).toBe(
      'Na stronie nie pokazują się (karta ukryta lub usunięta): router, usunięty.',
    )
  })

  it('warns that the bundle is hidden without a required item', () => {
    expect(hiddenItemsWarning(items, new Set([3]))).toMatch(
      /terminal POS, drukarka, usunięty\. Bez obowiązkowego elementu cały zestaw jest ukryty/,
    )
  })
})

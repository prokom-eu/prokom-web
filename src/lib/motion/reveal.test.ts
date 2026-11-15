import { describe, expect, it } from 'vitest'

import { batchOrder, startsBelow } from './reveal'

// SWV7: sections rise in once; what is on screen at load never waits hidden.

describe('startsBelow', () => {
  it('holds back only what starts under the screen', () => {
    expect(startsBelow(1000, 900)).toBe(true)
    expect(startsBelow(500, 900)).toBe(false)
    expect(startsBelow(-200, 900)).toBe(false)
  })
})

describe('batchOrder', () => {
  it('numbers the cards of each list that came in together, from 0', () => {
    const a = { list: 'popular' }
    const b = { list: 'popular' }
    const c = { list: 'team' }
    const order = batchOrder([a, b, c], (item) => item.list)
    expect([order.get(a), order.get(b), order.get(c)]).toEqual([0, 1, 0])
  })
})

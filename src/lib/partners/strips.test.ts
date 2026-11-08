import { describe, expect, it } from 'vitest'

import { brandStrips } from './strips'

const brand = (id: number, slug: string | null) => ({ id, slug })

describe('brandStrips (ZAOPATRZENIE §9)', () => {
  const all = [
    brand(1, 'apple'),
    brand(2, 'gopos'),
    brand(3, 'posnet'),
    brand(4, 'lenovo'),
    brand(5, 'insert'),
    brand(6, 'elzab'),
    brand(7, null),
  ]
  const counts = new Map([
    ['apple', 11],
    ['lenovo', 44],
    ['posnet', 26],
  ])

  it('puts the panel home order first, then the rest by item count', () => {
    const [top, bottom] = brandStrips(all, [2, 5, 3, 6], counts)
    // Order: gopos, insert, posnet, elzab | lenovo (44), apple (11), null (0).
    expect(top.map((b) => b.id)).toEqual([2, 3, 4, 7])
    expect(bottom.map((b) => b.id)).toEqual([5, 6, 1])
  })

  it('splits alternately so both strips start with the first chosen brands', () => {
    const [top, bottom] = brandStrips(all, [2, 5], counts)
    expect(top[0]?.id).toBe(2)
    expect(bottom[0]?.id).toBe(5)
  })

  it('keeps every brand once, ignores unknown home ids and keeps the panel order on ties', () => {
    const [top, bottom] = brandStrips(all, [99, 2, 2], new Map())
    const ids = [...top, ...bottom].map((b) => b.id).sort()
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7])
    // No counts: after the chosen one, the panel order of the rest.
    expect(top.map((b) => b.id)).toEqual([2, 3, 5, 7])
  })
})

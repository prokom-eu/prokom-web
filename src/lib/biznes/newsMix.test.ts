import { describe, expect, it } from 'vitest'

import { homeNewsMix } from './newsMix'

const inst = (n: number) => ({ id: `i${n}`, line: 'instalacje' as const })
const soft = (n: number) => ({ id: `s${n}`, line: 'software' as const })

describe('homeNewsMix (Biznes home news, 15.11)', () => {
  it('one more Biznes post, the newest of Instalacje and of Software', () => {
    // Instalacje has the three newest posts — the list still shows Software.
    const mix = homeNewsMix(['b2', 'b3'], [inst(1), inst(2), inst(3), soft(1)])
    expect(mix.own).toEqual(['b2'])
    expect(mix.sister.map((post) => post.id)).toEqual(['i1', 's1'])
  })

  it('a line without posts is made up by Biznes, then by the other line', () => {
    expect(homeNewsMix(['b2', 'b3'], [inst(1), inst(2)])).toEqual({
      own: ['b2', 'b3'],
      sister: [inst(1)],
    })
    expect(homeNewsMix([], [inst(1), inst(2)])).toEqual({
      own: [],
      sister: [inst(1), inst(2)],
    })
  })

  it('nothing to show = empty lists', () => {
    expect(homeNewsMix([], [])).toEqual({ own: [], sister: [] })
  })
})

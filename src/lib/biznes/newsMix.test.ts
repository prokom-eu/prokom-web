import { describe, expect, it } from 'vitest'

import { homeNewsMix, isForBusiness } from './newsMix'

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

describe('isForBusiness (audyt 15.11: only posts „dla firm” on the B2B home)', () => {
  const post = (line: 'instalacje' | 'software', title: string, category?: string) => ({
    line,
    title,
    lead: null,
    ...(category ? { category } : {}),
  })

  it('drops the home posts of Instalacje', () => {
    expect(isForBusiness(post('instalacje', 'Ile kamer potrzebuje dom i gdzie je powiesić'))).toBe(
      false,
    )
    expect(
      isForBusiness(post('instalacje', 'Kamera Wi-Fi czy przewodowa? Co wybrać do domu')),
    ).toBe(false)
    expect(isForBusiness(post('instalacje', 'Alarm w domku letniskowym', 'alarmy'))).toBe(false)
    // No signal either way: left out (never a home post by mistake).
    expect(isForBusiness(post('instalacje', 'Monitoring zimą w górach', 'monitoring'))).toBe(false)
  })

  it('keeps the business posts of Instalacje and every Software post', () => {
    expect(isForBusiness(post('instalacje', 'Kamery w pensjonacie', 'noclegi'))).toBe(true)
    expect(isForBusiness(post('instalacje', 'Monitoring i alarm dla sklepu', 'monitoring'))).toBe(
      true,
    )
    expect(isForBusiness(post('software', 'Strona internetowa, która sprzedaje'))).toBe(true)
  })

  it('a business word does not save a home post', () => {
    expect(isForBusiness(post('instalacje', 'Biuro w domu: kamera do mieszkania'))).toBe(false)
  })
})

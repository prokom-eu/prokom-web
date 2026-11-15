import { describe, expect, it } from 'vitest'

import { teaser } from '@/lib/posts/sister'
import { GUIDE_POSTS } from '@/sites/instalacje/dane/wpisy'

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

describe('isForBusiness on the real Instalacje guide posts (as the home reads them)', () => {
  it('only the posts for businesses pass — a new guide post forces a decision here', () => {
    const passed = GUIDE_POSTS.filter((post) =>
      isForBusiness({
        line: 'instalacje',
        title: post.title,
        lead: teaser(post.lead),
        category: post.category,
      }),
    ).map((post) => post.slug)
    expect(passed.sort()).toEqual(['kamery-w-pensjonacie', 'wifi-w-pensjonacie'])
  })

  it('look-alike words and Polish forms (przegląd 15.11)', () => {
    const forBusiness = (title: string) => isForBusiness({ line: 'instalacje', title })
    // Business look-alikes are not business words.
    expect(forBusiness('Kamera z obudową IP67 i firmware 2.0')).toBe(false)
    expect(forBusiness('Obiektyw i lokalizacja kamery')).toBe(false)
    expect(forBusiness('Biurko z ładowarką')).toBe(false)
    // Home forms with Polish letters still mark a home post.
    expect(forBusiness('Kamera do domowej sieci w firmie')).toBe(false)
    expect(forBusiness('Domofon z kamerą przed domem w sklepie')).toBe(false)
    expect(forBusiness('Smart home w hotelu')).toBe(false)
    expect(forBusiness('Przydomowa stacja w sklepie')).toBe(false)
    // „Domofon” alone is not a home word.
    expect(forBusiness('Domofon w biurze')).toBe(true)
    expect(forBusiness('Monitoring dla firm z Podhala')).toBe(true)
  })
})

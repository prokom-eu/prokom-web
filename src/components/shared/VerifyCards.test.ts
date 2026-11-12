import { describe, expect, it } from 'vitest'

import { shownVerify } from './VerifyCards'

const ITEMS = [
  { title: 'Dane w rejestrze', href: 'https://aplikacja.ceidg.gov.pl/' },
  { title: 'Opinie klientów', text: 'Opinie w Google', href: null },
  { title: 'Autoryzowany serwis', href: '' },
]

describe('shownVerify (plan 0611 §8.2: an empty link hides the card)', () => {
  it('keeps every card by default (Software, Instalacje)', () => {
    expect(shownVerify(ITEMS, false)).toHaveLength(3)
  })

  it('with linkedOnly keeps only cards with an address', () => {
    expect(shownVerify(ITEMS, true).map((item) => item.title)).toEqual(['Dane w rejestrze'])
  })
})

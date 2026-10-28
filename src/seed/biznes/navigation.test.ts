import { describe, expect, it } from 'vitest'

import { menuData, upgradedMenu } from './navigation'

const legacy = [
  { id: 'a', type: 'offer' as const, label: 'Oferta', href: '/oferta' },
  { id: 'b', type: 'link' as const, label: 'Opieka IT', href: '/opieka-it' },
  { id: 'c', type: 'link' as const, label: 'GoPOS', href: '/gopos', partner: true },
  { id: 'd', type: 'link' as const, label: 'InsERT', href: '/insert', partner: true },
  { id: 'e', type: 'link' as const, label: 'O firmie', href: '/o-firmie' },
  { id: 'f', type: 'link' as const, label: 'Kontakt', href: '/kontakt' },
]

describe('upgradedMenu (K3c)', () => {
  it('adds „Gotowe zestawy” after „Oferta” to the menu of the first seed', () => {
    expect(upgradedMenu(legacy)?.map((item) => item.label)).toEqual([
      'Oferta',
      'Gotowe zestawy',
      'Opieka IT',
      'GoPOS',
      'InsERT',
      'O firmie',
      'Kontakt',
    ])
  })

  it('leaves a menu edited in the panel or already current', () => {
    expect(
      upgradedMenu([...legacy.slice(0, 5), { ...legacy[5]!, label: 'Kontakt i dojazd' }]),
    ).toBeNull()
    expect(upgradedMenu(menuData())).toBeNull()
    expect(upgradedMenu(null)).toBeNull()
  })
})

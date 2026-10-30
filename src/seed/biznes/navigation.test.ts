import { describe, expect, it } from 'vitest'

import { K4_COLUMN_LIMIT, menuData, upgradedColumnLimit, upgradedMenu } from './navigation'

const legacy = [
  { id: 'a', type: 'offer' as const, label: 'Oferta', href: '/oferta' },
  { id: 'b', type: 'link' as const, label: 'Opieka IT', href: '/opieka-it' },
  { id: 'c', type: 'link' as const, label: 'GoPOS', href: '/gopos', partner: true },
  { id: 'd', type: 'link' as const, label: 'InsERT', href: '/insert', partner: true },
  { id: 'e', type: 'link' as const, label: 'O firmie', href: '/o-firmie' },
  { id: 'f', type: 'link' as const, label: 'Kontakt', href: '/kontakt' },
]

describe('upgradedMenu (K4)', () => {
  const k3c = [
    legacy[0]!,
    { id: 'z', type: 'link' as const, label: 'Gotowe zestawy', href: '/zestawy' },
    ...legacy.slice(1),
  ]
  const v20 = legacy.map(({ partner: _partner, ...item }) => item)

  it('gives the menus of earlier seeds the K4 menu, without „Gotowe zestawy”', () => {
    for (const seeded of [k3c, v20]) {
      expect(upgradedMenu(seeded)?.map((item) => item.label)).toEqual([
        'Oferta',
        'Opieka IT',
        'GoPOS',
        'InsERT',
        'O firmie',
        'Kontakt',
      ])
    }
  })

  it('leaves a menu edited in the panel or already current', () => {
    expect(upgradedMenu([...k3c.slice(0, 6), { ...k3c[6]!, label: 'Kontakt i dojazd' }])).toBeNull()
    expect(upgradedMenu(menuData())).toBeNull()
    expect(upgradedMenu(legacy)).toBeNull()
    expect(upgradedMenu(null)).toBeNull()
  })
})

describe('upgradedColumnLimit (K4a-1b-2)', () => {
  it('raises the old seed limit to every category of a department', () => {
    expect(upgradedColumnLimit(6)).toBe(K4_COLUMN_LIMIT)
  })

  it('leaves a limit set in the panel or already current', () => {
    expect(upgradedColumnLimit(8)).toBeNull()
    expect(upgradedColumnLimit(K4_COLUMN_LIMIT)).toBeNull()
    expect(upgradedColumnLimit(null)).toBeNull()
  })
})

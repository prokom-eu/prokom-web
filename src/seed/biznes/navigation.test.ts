import { describe, expect, it } from 'vitest'

import {
  K4_COLUMN_LIMIT,
  menuData,
  upgradedColumnLimit,
  upgradedHighlights,
  upgradedMenu,
} from './navigation'

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

  const k4b = legacy

  it('gives the menus of earlier seeds the K4 menu, without „Gotowe zestawy”, with „Marki”', () => {
    for (const seeded of [k3c, v20, k4b]) {
      expect(upgradedMenu(seeded)?.map((item) => item.label)).toEqual([
        'Oferta',
        'Marki',
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

describe('upgradedHighlights (K4-FINAL §1)', () => {
  const old = [
    { id: '1', group: 4, label: 'GoPOS', href: '/gopos', badge: 'partner' },
    { id: '2', group: 5, label: 'Opieka IT', href: '/opieka-it', badge: 'abonament' },
    { id: '3', group: 5, label: 'Przegląd IT', href: '/opieka-it#przeglad', badge: '0 zł' },
  ]

  it('rewrites only the rows the earlier seed wrote', () => {
    expect(upgradedHighlights(old)).toEqual([
      old[0],
      { ...old[1], badge: null },
      { ...old[2], label: 'Bezpłatny przegląd IT', badge: null },
    ])
  })

  it('leaves the panel alone: nothing to change → null', () => {
    expect(upgradedHighlights([old[0]!])).toBeNull()
    expect(upgradedHighlights([{ ...old[2]!, badge: 'nowość' }])).toBeNull()
    expect(upgradedHighlights(null)).toBeNull()
  })
})

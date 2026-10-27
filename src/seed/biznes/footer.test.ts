import { describe, expect, it } from 'vitest'

import { footerData, footerImportant, upgradedImportant } from './footer'

const legacy = [
  { label: 'Opieka IT', href: '/opieka-it' },
  { label: 'GoPOS', href: '/gopos' },
  { label: 'InsERT', href: '/insert' },
  { label: 'Bezpłatny przegląd IT', href: '/opieka-it#przeglad' },
  { label: 'KSeF 2027', href: footerImportant()[3].href },
  { label: 'Dobierz zestaw w 60 s →', href: '/kreator' },
]

describe('footer K3.1', () => {
  it('lists „Najważniejsze” of K31-ZMIANY §11.4 without the IT review awaiting approval', () => {
    const labels = footerData([]).important?.map((link) => link.label)
    expect(labels).toEqual([
      'Opieka IT',
      'GoPOS',
      'InsERT i KSeF',
      'KSeF 2027',
      'Dobierz zestaw w 60 s',
    ])
    expect(footerImportant().some((link) => link.href.includes('przeglad'))).toBe(false)
  })

  it('upgrades a column still as the old seed wrote it, also with the early KSeF link', () => {
    expect(upgradedImportant(legacy)).toEqual(footerImportant())
    const early = legacy.map((l) => (l.label === 'KSeF 2027' ? { ...l, href: '/aktualnosci' } : l))
    expect(upgradedImportant(early)).toEqual(footerImportant())
  })

  it('keeps a column edited in the panel, an empty one and the current one', () => {
    expect(upgradedImportant([...legacy.slice(0, 5)])).toBeNull()
    expect(
      upgradedImportant(legacy.map((l, i) => (i === 0 ? { ...l, label: 'Opieka' } : l))),
    ).toBeNull()
    // A changed address alone also counts as an edit in the panel.
    expect(
      upgradedImportant(legacy.map((l, i) => (i === 1 ? { ...l, href: '/gopos-nowy' } : l))),
    ).toBeNull()
    expect(upgradedImportant(null)).toBeNull()
    expect(upgradedImportant(footerImportant())).toBeNull()
  })
})

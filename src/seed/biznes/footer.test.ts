import { describe, expect, it } from 'vitest'

import {
  footerData,
  footerServices,
  footerTopics,
  upgradedCompany,
  upgradedImportant,
} from './footer'

const ksef = footerTopics().find((link) => link.label === 'KSeF')!.href

const b3b = [
  { label: 'Opieka IT', href: '/opieka-it' },
  { label: 'GoPOS', href: '/gopos' },
  { label: 'InsERT', href: '/insert' },
  { label: 'Bezpłatny przegląd IT', href: '/opieka-it#przeglad' },
  { label: 'KSeF 2027', href: ksef },
  { label: 'Dobierz zestaw w 60 s →', href: '/kreator' },
]
const k31 = [
  { label: 'Opieka IT', href: '/opieka-it' },
  { label: 'GoPOS', href: '/gopos' },
  { label: 'InsERT i KSeF', href: '/insert' },
  { label: 'KSeF 2027', href: ksef },
  { label: 'Dobierz zestaw w 60 s', href: '/kreator' },
]
const company = [
  { label: 'Gastronomia', href: '/branze/gastronomia' },
  { label: 'Handel i sklepy', href: '/branze/handel' },
  { label: 'O firmie', href: '/o-firmie' },
  { label: 'Aktualności', href: '/aktualnosci' },
  { label: 'Instalacje · Software · Tech · Zakopane', href: 'https://pro-kom.eu' },
]

describe('footer K4 (K36 §1)', () => {
  it('lists the services and the topics of the board', () => {
    expect(footerData().important?.map((link) => link.label)).toEqual([
      'Przegląd kasy fiskalnej',
      'Serwis kas i drukarek fiskalnych',
      'Fiskalizacja kasy',
      'Serwis komputerów',
      'Opieka IT',
      'Kopie zapasowe',
      'Poczta firmowa i Microsoft 365',
    ])
    expect(footerData().company?.map((link) => link.label)).toEqual([
      'GoPOS',
      'InsERT i KSeF',
      'KSeF',
      'Automaty vendingowe',
      'O firmie',
      'Aktualności',
    ])
  })

  it('gives „Usługi” to a column still as B3b or K3.1 wrote it, also with the early KSeF link', () => {
    expect(upgradedImportant(b3b)).toEqual(footerServices())
    expect(upgradedImportant(k31)).toEqual(footerServices())
    const early = b3b.map((l) => (l.label === 'KSeF 2027' ? { ...l, href: '/aktualnosci' } : l))
    expect(upgradedImportant(early)).toEqual(footerServices())
  })

  it('gives „Systemy i tematy” to „Branże i firma” as the seed wrote it', () => {
    expect(upgradedCompany(company)).toEqual(footerTopics())
    expect(upgradedCompany(company.slice(2))).toEqual(footerTopics())
  })

  it('keeps columns edited in the panel, empty and current ones', () => {
    expect(upgradedImportant(k31.slice(0, 4))).toBeNull()
    expect(
      upgradedImportant(k31.map((l, i) => (i === 1 ? { ...l, href: '/gopos-nowy' } : l))),
    ).toBeNull()
    expect(upgradedImportant(null)).toBeNull()
    expect(upgradedImportant(footerServices())).toBeNull()
    expect(upgradedCompany([{ label: 'Cennik', href: '/cennik' }, ...company.slice(2)])).toBeNull()
    expect(upgradedCompany(footerTopics())).toBeNull()
    expect(upgradedCompany(null)).toBeNull()
  })
})

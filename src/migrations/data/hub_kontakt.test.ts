import { describe, expect, it } from 'vitest'

import { PROKOM_SHARED } from '../../seed/shared/prokom'
import {
  CONTACT_H1_2211,
  CONTACT_H1_OLD,
  contactWith2211,
  EMAIL_FACT,
  homeWithBothPhones,
} from './hub_kontakt'

describe('hub_kontakt (Krystian 22.11)', () => {
  it('adds both phones at Biznes and Instalacje once, keeping what the panel set', () => {
    const home = { contact: { title: 'Kontakt' }, faq: {} }
    expect(homeWithBothPhones(home)).toEqual({
      contact: { title: 'Kontakt', bothPhones: ['biznes', 'instalacje'] },
      faq: {},
    })
    expect(homeWithBothPhones({ contact: { bothPhones: [] } })).toBeNull()
    expect(homeWithBothPhones({})).toBeNull()
    expect(homeWithBothPhones(null)).toBeNull()
  })

  it('changes the old H1 and adds the e-mail fact, never over a panel edit', () => {
    expect(contactWith2211({ h1: CONTACT_H1_OLD, lead: 'x' })).toEqual({
      h1: CONTACT_H1_2211,
      lead: 'x',
      facts: [EMAIL_FACT],
    })
    const edited = { h1: 'Własny nagłówek', facts: [{ kind: 'text' }] }
    expect(contactWith2211(edited)).toBeNull()
    expect(contactWith2211({ h1: 'Własny', facts: [] })).toEqual({
      h1: 'Własny',
      facts: [EMAIL_FACT],
    })
    expect(contactWith2211(null)).toBeNull()
  })

  it('leaves the seed as it is (the seed already has the new texts)', () => {
    expect(contactWith2211(PROKOM_SHARED.contact)).toBeNull()
  })
})

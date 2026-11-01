import { describe, expect, it } from 'vitest'

import { salonLabel, salonsList, salonsNote } from './salons'

const rabka = { city: 'Rabka-Zdrój', street: 'ul. Orkana 16B' }
const zakopane = { city: 'Zakopane', street: 'ul. Przykładowa 1' }

describe('salons', () => {
  it('uses the singular for one salon', () => {
    expect(salonLabel(1)).toBe('Salon')
    expect(salonsNote([rabka])).toBe('Salon: Rabka-Zdrój, ul. Orkana 16B')
  })

  it('uses the plural for more salons', () => {
    expect(salonLabel(2)).toBe('Salony')
    expect(salonsNote([rabka, zakopane])).toBe(
      'Salony: Rabka-Zdrój, ul. Orkana 16B · Zakopane, ul. Przykładowa 1',
    )
  })

  it('shows nothing without locations', () => {
    expect(salonsNote([])).toBe('')
    expect(salonsList([])).toBe('')
  })
})

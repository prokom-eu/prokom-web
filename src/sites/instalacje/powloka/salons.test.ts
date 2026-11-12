import { describe, expect, it } from 'vitest'

import { otherSalons, salonLabel, salonsList, salonsNote } from './salons'

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

describe('otherSalons', () => {
  const salon = (key: string | null, city: string) => ({ key, city, street: 'ul. 1' })

  it('returns published salons outside the line card (the template shows `salonKeys`)', () => {
    const list = [salon('rabka', 'Rabka-Zdrój'), salon('zakopane', 'Zakopane')]
    expect(otherSalons(list, ['rabka']).map((s) => s.city)).toEqual(['Zakopane'])
  })

  it('without keys the card is the first salon, the rest are other salons', () => {
    const list = [salon('rabka', 'Rabka-Zdrój'), salon(null, 'Zakopane')]
    expect(otherSalons(list, null).map((s) => s.city)).toEqual(['Zakopane'])
  })

  it('is empty for one salon (Zakopane unpublished never reaches the shared data)', () => {
    expect(otherSalons([salon('rabka', 'Rabka-Zdrój')], ['rabka'])).toEqual([])
  })

  it('with keys, a salon without a key counts as another salon', () => {
    const list = [salon('rabka', 'Rabka-Zdrój'), salon(null, 'Zakopane')]
    expect(otherSalons(list, ['rabka']).map((s) => s.city)).toEqual(['Zakopane'])
  })

  it('when no key matches, every salon is another salon (the template shows no card)', () => {
    const list = [salon('rabka', 'Rabka-Zdrój'), salon('zakopane', 'Zakopane')]
    expect(otherSalons(list, ['nowy-targ']).map((s) => s.city)).toEqual(['Rabka-Zdrój', 'Zakopane'])
  })
})

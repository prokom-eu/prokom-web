import { describe, expect, it } from 'vitest'

import { INFOLINE_LABEL, techPoints } from './techPoints'

const branch = {
  name: 'Zakopane — serwis PRO-KOM Tech',
  street: 'ul. Stanisława Staszica 8',
  postalCode: '34-500',
  city: 'Zakopane',
  phone: '185412015',
  note: null,
}
const phones = [
  { label: 'Biuro (stacjonarny)', number: '18 267 65 11', techPoint: null },
  { label: 'Serwis PRO-KOM Tech, Rabka-Zdrój', number: '18 541 20 55', techPoint: 'Rabka-Zdrój' },
]

describe('techPoints (runda 1811 D5: phones of the Tech points on the hub)', () => {
  it('gives Rabka, Zakopane and the infoline, all from the data', () => {
    expect(techPoints({ extraPhones: phones, branch }, '883200151')).toEqual([
      { label: 'Rabka-Zdrój', phone: '18 541 20 55', tel: 'tel:+48185412055' },
      { label: 'Zakopane', phone: '18 541 20 15', tel: 'tel:+48185412015' },
      { label: INFOLINE_LABEL, phone: '883 200 151', tel: 'tel:+48883200151' },
    ])
  })

  it('names the general number „Infolinia” until the boss decides', () => {
    expect(INFOLINE_LABEL).toBe('Infolinia')
  })

  it('stays empty without a point number — the line keeps its one phone', () => {
    expect(techPoints({ extraPhones: [phones[0]!], branch: null }, '883 200 151')).toEqual([])
  })

  it('skips the branch without a phone and a number given twice', () => {
    const twice = [{ ...phones[1]!, number: '883 200 151' }]
    expect(
      techPoints({ extraPhones: twice, branch: { ...branch, phone: null } }, '883 200 151'),
    ).toEqual([{ label: 'Rabka-Zdrój', phone: '883 200 151', tel: 'tel:+48883200151' }])
  })
})

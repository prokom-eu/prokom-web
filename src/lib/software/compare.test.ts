import { describe, expect, it } from 'vitest'

import stronaGlowna from '../../../seed/prokomsoftware/strona-glowna.json'

import { compareView } from './compare'

describe('compareView', () => {
  it('reads the table of the package: two rivals with marks, ours', () => {
    const view = compareView(stronaGlowna.compare)
    expect(view?.rivals).toEqual(['freelancer', 'agencja z dużego miasta'])
    expect(view?.ours).toBe('PRO-KOM Software')
    expect(view?.rows).toHaveLength(6)
    expect(view?.rows[3]).toEqual({
      criterion: 'Firma, która nie zniknie',
      rivals: [
        { mark: 'maybe', text: 'jedna osoba, jeden telefon' },
        { mark: 'yes', text: 'tak' },
      ],
      ours: 'biuro w Rabce-Zdroju, od 2004 r.',
    })
  })

  it('gives nothing for a table of another shape', () => {
    expect(compareView({ columns: ['a', 'b'], rows: [['x', 'y']] })).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'

import stronaGlowna from '../../../seed/prokomsoftware/strona-glowna.json'

import { compareView, withoutMarkWord } from './compare'

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
        { mark: 'yes', text: '' },
      ],
      ours: 'biuro w Rabce-Zdroju, od 2004 r.',
    })
  })

  it('gives nothing for a table of another shape', () => {
    expect(compareView({ columns: ['a', 'b'], rows: [['x', 'y']] })).toBeNull()
  })
})

describe('withoutMarkWord (SWV8 P1 #8, SWV9 Z10)', () => {
  it('drops the „tak”/„nie” the icon already says, at the start or the end', () => {
    expect(withoutMarkWord('tak, zapisane w umowie', 'yes')).toBe('zapisane w umowie')
    expect(withoutMarkWord('na Podhalu i w Małopolsce, tak', 'yes')).toBe(
      'na Podhalu i w Małopolsce',
    )
    expect(withoutMarkWord('tak', 'yes')).toBe('')
    expect(withoutMarkWord('nie', 'no')).toBe('')
    expect(withoutMarkWord('Tak.', 'yes')).toBe('')
  })

  it('keeps words that only contain it and words of another mark', () => {
    expect(withoutMarkWord('zwykle tak', 'yes')).toBe('zwykle tak')
    expect(withoutMarkWord('takie same', 'yes')).toBe('takie same')
    expect(withoutMarkWord('nie, ale', 'yes')).toBe('nie, ale')
    expect(withoutMarkWord('czasem', 'maybe')).toBe('czasem')
  })

  it('applies to the table: no cell repeats its icon', () => {
    const view = compareView(stronaGlowna.compare)
    for (const row of view?.rows ?? []) {
      expect(row.ours).not.toMatch(/^tak\b|, tak$/)
      for (const cell of row.rivals) if (cell.mark === 'yes') expect(cell.text).not.toBe('tak')
    }
  })
})

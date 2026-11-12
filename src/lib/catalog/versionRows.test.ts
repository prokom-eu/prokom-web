import { describe, expect, it } from 'vitest'

import { versionRows } from './versionRows'

describe('version table rows (PRODUKCJA-BIZNES-1211 §1)', () => {
  const versions = ['TASKalfa 2320', 'TASKalfa 2020']

  it('turns a value per model into a row, a column per version', () => {
    expect(
      versionRows(versions, [
        {
          label: 'Prędkość druku',
          value: 'TASKalfa 2020: 20 str./min A4; TASKalfa 2320: 23 str./min A4',
        },
      ]),
    ).toEqual([{ label: 'Prędkość druku', values: ['23 str./min A4', '20 str./min A4'] }])
  })

  it('leaves out rows that do not differ, plain values and unknown models', () => {
    expect(
      versionRows(versions, [
        { label: 'Rozdzielczość', value: 'TASKalfa 2320: 600 dpi; TASKalfa 2020: 600 dpi' },
        { label: 'Format', value: 'A3' },
        { label: 'Prędkość', value: 'TASKalfa 3011i: 30 str./min; TASKalfa 2020: 20 str./min' },
      ]),
    ).toEqual([])
  })

  it('never puts a value in a look-alike column (VC-50 vs PVC-50) or one of two models', () => {
    expect(
      versionRows(
        ['VC-50', 'PVC-50'],
        [{ label: 'Zakres', value: 'VC-50: 50 kg; PVC-50: 60 / 150 / 300 kg' }],
      ),
    ).toEqual([{ label: 'Zakres', values: ['50 kg', '60 / 150 / 300 kg'] }])
    expect(
      versionRows(
        ['DT2x', 'DT4x', 'DT200'],
        [{ label: 'Szerokość', value: 'DT2x i DT200: 54 mm; DT4x: 108 mm' }],
      ),
    ).toEqual([])
    expect(versionRows(['S', 'SM', 'SC'], [{ label: 'X', value: 'S: 1; SM: 2' }])).toEqual([
      { label: 'X', values: ['1', '2', null] },
    ])
  })

  it('needs two versions', () => {
    expect(versionRows(['Jedna'], [{ label: 'X', value: 'Jedna: 1; Druga: 2' }])).toEqual([])
  })
})

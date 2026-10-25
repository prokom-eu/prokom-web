import { describe, expect, it } from 'vitest'

import icons from '../../../seed/prokombiznes/ikony.json'
import katalog from '../../../seed/prokombiznes/katalog.json'
import kreator from '../../../seed/prokombiznes/kreator.json'
import softwareIcons from '../../../seed/prokomsoftware/ikony.json'
import { ICON_NAMES, isHexColor, REGISTER_TYPES, WIZARD_BUSINESS_TYPES } from './options'

describe('catalog options match the seed package', () => {
  it('has every icon of both sets (one set for all lines, ADR-014 rozstrz. 8)', () => {
    const names = new Set([...Object.keys(icons.ikony), ...Object.keys(softwareIcons.icons)])
    expect([...ICON_NAMES].sort()).toEqual([...names].sort())
  })

  it('has every business type of the wizard', () => {
    expect(WIZARD_BUSINESS_TYPES.map((t) => t.value)).toEqual(kreator.rodzaje_firm.map((t) => t.id))
  })

  it('maps every industry of the seed to a wizard business type', () => {
    const values: string[] = WIZARD_BUSINESS_TYPES.map((t) => t.value)
    for (const industry of katalog.branze) expect(values).toContain(industry.kreator)
  })

  it('has one register type per seed type', () => {
    expect(REGISTER_TYPES).toHaveLength(Object.keys(katalog.typy_kas).length)
  })

  it('keeps gradient stops valid', () => {
    for (const group of katalog.grupy)
      for (const stop of group.gradient) expect(isHexColor(stop)).toBe(true)
  })
})

describe('isHexColor', () => {
  it.each(['#244FB0', '#4fa3f0'])('accepts %s', (value) => expect(isHexColor(value)).toBe(true))
  it.each(['244FB0', '#24F', 'red', '#244FB0;}', null])('rejects %j', (value) =>
    expect(isHexColor(value)).toBe(false),
  )
})

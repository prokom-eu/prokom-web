import { describe, expect, it } from 'vitest'

import { isBlockAllowed } from '../../blocks/registry'
import { biznesInsertLayout } from './insert'

describe('biznesInsertLayout (B9c)', () => {
  const layout = biznesInsertLayout()
  const types = layout.map((block) => block.blockType)

  it('uses only blocks of the Biznes line, starting with the hero (H1)', () => {
    expect(layout.every((block) => isBlockAllowed('biznes', block.blockType))).toBe(true)
    expect(types[0]).toBe('bzPageHero')
  })

  it('has each anchored block once (#dobor, #ksef, #faq, #kontakt)', () => {
    for (const type of ['bzProgramPicker', 'bzKsef', 'faq', 'bzContact']) {
      expect(types.filter((t) => t === type)).toHaveLength(1)
    }
  })

  it('starts the picker on Subiekt nexo, one tile per program (decyzja 24.10)', () => {
    const picker = layout.find((block) => block.blockType === 'bzProgramPicker')
    if (picker?.blockType !== 'bzProgramPicker') throw new Error('no picker')
    expect(picker.options.map((option) => option.program)).toEqual([
      'Subiekt 123',
      'Subiekt nexo',
      'Subiekt nexo PRO',
      'Subiekt GT',
    ])
    expect(picker.options[(picker.initial ?? 1) - 1]?.program).toBe('Subiekt nexo')
  })

  it('links only to its own anchors and the catalog', () => {
    const hrefs = [...JSON.stringify(layout).matchAll(/"href":"([^"]+)"/g)].map((m) => m[1])
    expect(new Set(hrefs)).toEqual(
      new Set(['/insert#dobor', '/insert#ksef', '/insert#kontakt', '/oferta']),
    )
  })

  it('has no prices, leasing or instalments (plan §4)', () => {
    expect(JSON.stringify(layout)).not.toMatch(/\bleasing|\braty\b|\d\s?zł/i)
  })
})

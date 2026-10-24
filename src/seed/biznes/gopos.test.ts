import { describe, expect, it } from 'vitest'

import seed from '../../../seed/prokombiznes/katalog.json'
import { isBlockAllowed } from '../../blocks/registry'
import { biznesGoposLayout, GOPOS_KITS } from './gopos'

describe('biznesGoposLayout (B9b)', () => {
  const layout = biznesGoposLayout()
  const types = layout.map((block) => block.blockType)

  it('uses only blocks of the Biznes line, starting with the hero (H1)', () => {
    expect(layout.every((block) => isBlockAllowed('biznes', block.blockType))).toBe(true)
    expect(types[0]).toBe('bzPageHero')
  })

  it('has each anchored block once (#zestawy, #jak-to-dziala, #faq, #kontakt)', () => {
    for (const type of ['bzKits', 'bzOrderFlow', 'faq', 'bzContact']) {
      expect(types.filter((t) => t === type)).toHaveLength(1)
    }
  })

  it('builds the kits of the board from products of the catalog package', () => {
    expect(GOPOS_KITS.map((kit) => kit.products.length)).toEqual([4, 7, 6])
    const known = new Set(seed.produkty.map((product) => product.slug))
    for (const kit of GOPOS_KITS) {
      for (const id of kit.products) expect(known, id).toContain(id)
    }
  })

  it('keeps the partner figures without a source out (plan §4)', () => {
    const text = JSON.stringify(layout)
    expect(text).not.toMatch(/6000\+|od 2016|14 dni|5 platform/)
    const hero = layout[0]
    expect(hero && 'photo' in hero ? hero.photo?.stats : null).toEqual([])
  })

  it('has no prices, leasing or instalments (plan §4)', () => {
    expect(JSON.stringify(layout)).not.toMatch(/\bleasing|\braty\b|\d\s?zł/i)
  })
})

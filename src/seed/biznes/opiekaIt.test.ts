import { describe, expect, it } from 'vitest'

import { isBlockAllowed } from '../../blocks/registry'
import { biznesOpiekaItLayout } from './opiekaIt'

describe('biznesOpiekaItLayout (B9a)', () => {
  const layout = biznesOpiekaItLayout()
  const types = layout.map((block) => block.blockType)

  it('uses only blocks of the Biznes line, starting with the hero (H1)', () => {
    expect(layout.every((block) => isBlockAllowed('biznes', block.blockType))).toBe(true)
    expect(types[0]).toBe('bzPageHero')
  })

  it('has the anchors linked from the top bar, footer and buttons once each', () => {
    // #przeglad (bzAudit), #faq (faq), #kontakt (bzContact) are fixed ids of their blocks.
    for (const type of ['bzAudit', 'faq', 'bzContact']) {
      expect(types.filter((t) => t === type)).toHaveLength(1)
    }
  })

  it('links only to its own anchors', () => {
    const hrefs = [...JSON.stringify(layout).matchAll(/"href":"([^"]+)"/g)].map((m) => m[1])
    expect(new Set(hrefs)).toEqual(
      new Set(['/opieka-it#przeglad', '/opieka-it#faq', '/opieka-it#kontakt']),
    )
  })

  it('asks the ten questions of the board', () => {
    const faq = layout.find((block) => block.blockType === 'faq')
    expect(faq && 'items' in faq ? faq.items : []).toHaveLength(10)
  })

  it('has no prices, leasing or instalments (plan §4)', () => {
    expect(JSON.stringify(layout)).not.toMatch(/\bleasing|\braty\b|\d\s?zł\/|cena:/i)
  })
})

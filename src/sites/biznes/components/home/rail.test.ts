import { describe, expect, it } from 'vitest'

import { railItems } from './rail'

describe('railItems', () => {
  it('lists the anchors of the sections on the page, in the page order', () => {
    const items = railItems(['bzHero', 'bzNeeds', 'partners', 'bzOffer', 'faq', 'bzContact'])
    expect(items.map((item) => item.id)).toEqual(['start', 'oferta', 'faq', 'kontakt'])
    expect(items[0]).toMatchObject({ label: 'Start' })
  })

  it('names a section once, even when its block is there twice', () => {
    expect(railItems(['bzHero', 'bzHero']).map((item) => item.id)).toEqual(['start'])
  })

  it('is empty for a page without home sections', () => {
    expect(railItems(['hero', 'richText'])).toEqual([])
  })
})

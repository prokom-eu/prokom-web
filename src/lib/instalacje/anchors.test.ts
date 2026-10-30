import { describe, expect, it } from 'vitest'

import seedAnteny from '../../../seed/prokominstalacje/strony-zrzut/Anteny.json'
import { anchorsError, sectionIdsOf, unknownAnchors } from './anchors'

describe('service page anchors', () => {
  it('accepts every anchor of the Anteny package', () => {
    const ids = seedAnteny.dane.anc.map(({ href }) => href.replace('#', ''))
    expect(unknownAnchors('ant', ids)).toEqual([])
  })

  it('lists anchors that point at no section', () => {
    expect(unknownAnchors('ant', ['faq', 'nie-ma'])).toEqual(['nie-ma'])
  })

  it('gives a service without its own page only the shared sections', () => {
    expect(sectionIdsOf('kam')).toEqual(['odbior', 'pakiety', 'cena', 'faq', 'powiazane'])
  })

  it('builds the panel message, also from the saved document on a partial update', () => {
    expect(anchorsError({ anchors: [{ anchorId: 'gory' }] }, { key: 'ant' })).toBeNull()
    expect(anchorsError({ anchors: [{ anchorId: 'zle' }] }, { key: 'ant' })).toMatch(
      /^Kotwice bez sekcji na stronie: zle\./,
    )
    expect(anchorsError({ key: 'ant' }, undefined)).toBeNull()
  })

  it('leaves the services without a page in code alone', () => {
    expect(anchorsError({ key: 'kam', anchors: [{ anchorId: 'nagrania' }] }, undefined)).toBeNull()
  })
})

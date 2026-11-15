import { describe, expect, it } from 'vitest'

import { spyKey } from './capsuleSpy'

const NAV = [
  { key: 'oferta', sections: ['oferta', 'zaopatrzenie', 'wybierane'] },
  { key: '/marki', sections: ['marki'] },
  { key: '/o-firmie', sections: ['fakty'] },
  { key: '/kontakt', sections: ['kontakt'] },
  { key: '/gopos' },
]

// Plan 0611 §8.1 pkt 2: the capsule's pill follows the home page section being read.
describe('spyKey — the menu entry of the section being read', () => {
  it('maps a section to the entry that lists it', () => {
    expect(spyKey(NAV, 'zaopatrzenie')).toBe('oferta')
    expect(spyKey(NAV, 'wybierane')).toBe('oferta')
    expect(spyKey(NAV, 'marki')).toBe('/marki')
    expect(spyKey(NAV, 'fakty')).toBe('/o-firmie')
    expect(spyKey(NAV, 'kontakt')).toBe('/kontakt')
  })

  it('a section no entry lists (hero, plan, FAQ) or none at all leaves the pill hidden', () => {
    expect(spyKey(NAV, 'start')).toBeNull()
    expect(spyKey(NAV, 'plan')).toBeNull()
    expect(spyKey(NAV, null)).toBeNull()
  })
})

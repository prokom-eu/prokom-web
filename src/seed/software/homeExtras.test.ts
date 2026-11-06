import { describe, expect, it } from 'vitest'

import { homeWithV24 } from './homeExtras'

describe('homeWithV24 (SWA2a/2b: v24 keys added once)', () => {
  const extras = { hero: { title: 'Zrobimy Ci' }, promises: [{ title: 'Widzisz' }] }

  it('adds the keys a stored home lacks', () => {
    expect(homeWithV24({ popular: { order: [] } }, extras)).toEqual({
      popular: { order: [] },
      ...extras,
    })
  })

  it('keeps a key already stored (edited in the panel)', () => {
    const stored = { hero: { title: 'Zrobimy dla Ciebie' } }
    expect(homeWithV24(stored, extras)).toEqual({
      hero: { title: 'Zrobimy dla Ciebie' },
      promises: extras.promises,
    })
  })

  it('returns null when nothing is missing or the home is empty', () => {
    expect(homeWithV24({ ...extras }, extras)).toBeNull()
    expect(homeWithV24(null, extras)).toBeNull()
  })

  it('copies the extras, so the seed constants are never shared', () => {
    const result = homeWithV24({}, extras) as { hero: object }
    expect(result.hero).not.toBe(extras.hero)
  })
})

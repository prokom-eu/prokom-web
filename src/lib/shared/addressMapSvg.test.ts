import { readFileSync, statSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { buildAddressMapSvg, roundPath } from '../../../scripts/address-map-svg.mjs'
import { ADDRESS_MAP_SRC } from '../../components/shared/AddressMap'

// D2-1b review: the address map is one static file every page shares (spec §9: < 60 KB),
// generated from the OSM drawing — never edited by hand, never out of date.
const FILE = `public${ADDRESS_MAP_SRC}`

describe('address map file', () => {
  it('is up to date with the OSM drawing (run `node scripts/address-map-svg.mjs`)', () => {
    expect(readFileSync(FILE, 'utf8')).toBe(buildAddressMapSvg())
  })

  it('stays under 60 KB, keeps the ODbL credit and the `map` group for <use>', () => {
    expect(statSync(FILE).size).toBeLessThan(60 * 1024)
    const svg = readFileSync(FILE, 'utf8')
    expect(svg).toContain('© OpenStreetMap contributors, ODbL')
    expect(svg).toContain('<g id="map">')
    // Colours only through the variant's variables (light / dark), never literal values.
    expect(svg).not.toMatch(/#[0-9a-f]{3,6}\b|rgba?\(/i)
  })
})

describe('roundPath', () => {
  it('rounds points, not steps: no drift along a long line', () => {
    // Ten steps of 0.4 end at 4, not at 0 (rounding each step would lose them all).
    expect(roundPath(`M0 0${'l.4 0'.repeat(10)}`)).toBe('M0 0l1 0 1 0 1 0 1 0')
  })

  it('drops zero-length steps, keeps closes and negative numbers', () => {
    expect(roundPath('M10.4 20.6l.05 .05-5 0z')).toBe('M10 21l-5 0z')
    expect(roundPath('M1 1l-2.6-3.4')).toBe('M1 1l-3-3')
  })
})

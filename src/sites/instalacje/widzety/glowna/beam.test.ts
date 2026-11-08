import { describe, expect, it } from 'vitest'

import { beamOrigin } from './beam'

describe('beamOrigin', () => {
  it('is the first point relative to the bounding box', () => {
    expect(beamOrigin('50,20 10,80 30,90 70,90 90,80')).toEqual({ x: 40, y: 0 })
  })

  it('handles a camera at the box corner and decimals', () => {
    expect(beamOrigin('10.5,5.2 40.5,25.2 60.5,15.2')).toEqual({ x: 0, y: 0 })
    expect(beamOrigin(' 12.3,40 2.3,10 ')).toEqual({ x: 10, y: 30 })
  })
})

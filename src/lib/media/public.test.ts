import { describe, expect, it } from 'vitest'

import { publicImage } from './public'

const image = {
  id: 7,
  tenant: 1,
  alt: 'Kasa fiskalna na ladzie sklepu',
  url: '/api/media/file/kasa.jpg',
  width: 1200,
  height: 800,
  requiresConsent: false,
  sizes: { small: { url: '/api/media/file/kasa-480x320.webp', width: 480, height: 320 } },
}

describe('publicImage', () => {
  it('returns what the site needs from an image of the tenant', () => {
    expect(publicImage(image, 1)).toEqual({
      alt: 'Kasa fiskalna na ladzie sklepu',
      width: 1200,
      height: 800,
      sources: [
        { url: '/api/media/file/kasa-480x320.webp', width: 480 },
        { url: '/api/media/file/kasa.jpg', width: 1200 },
      ],
    })
  })

  it('accepts a populated tenant', () => {
    expect(publicImage({ ...image, tenant: { id: 1 } }, 1)).not.toBeNull()
  })

  it('hides an image of another tenant', () => {
    expect(publicImage(image, 2)).toBeNull()
  })

  it('hides an image that needs consent', () => {
    expect(publicImage({ ...image, requiresConsent: true }, 1)).toBeNull()
  })

  it('hides an unpopulated relation, a missing alt or a missing file', () => {
    expect(publicImage(7, 1)).toBeNull()
    expect(publicImage(null, 1)).toBeNull()
    expect(publicImage({ ...image, alt: '  ' }, 1)).toBeNull()
    expect(publicImage({ ...image, url: null, sizes: {} }, 1)).toBeNull()
    expect(publicImage({ ...image, width: null }, 1)).toBeNull()
  })
})

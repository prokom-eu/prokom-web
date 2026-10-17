import { describe, expect, it } from 'vitest'

import { imageSources, pickSource } from './sizes'

const doc = {
  url: '/api/media/file/photo.jpg',
  width: 2000,
  height: 1000,
  sizes: {
    small: { url: '/api/media/file/photo-480x240.webp', width: 480, height: 240 },
    large: { url: '/api/media/file/photo-1600x800.webp', width: 1600, height: 800 },
    medium: { url: '/api/media/file/photo-960x480.webp', width: 960, height: 480 },
    // Not generated (image smaller than the size): Payload leaves nulls.
    huge: { url: null, width: null, height: null },
  },
}

describe('imageSources', () => {
  it('lists generated sizes and the original, smallest first', () => {
    expect(imageSources(doc).map((s) => s.width)).toEqual([480, 960, 1600, 2000])
  })

  it('returns only the original when there are no sizes', () => {
    expect(imageSources({ url: '/a.png', width: 300 })).toEqual([
      { url: '/a.png', width: 300 },
    ])
  })

  it('returns nothing without a usable original', () => {
    expect(imageSources({ url: null, width: null })).toEqual([])
  })
})

describe('pickSource', () => {
  const sources = imageSources(doc)

  it('picks the smallest source at least as wide as requested', () => {
    expect(pickSource(sources, 500)).toBe('/api/media/file/photo-960x480.webp')
    expect(pickSource(sources, 480)).toBe('/api/media/file/photo-480x240.webp')
  })

  it('falls back to the widest source for very wide screens', () => {
    expect(pickSource(sources, 3840)).toBe('/api/media/file/photo.jpg')
  })
})

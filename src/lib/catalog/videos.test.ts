import { describe, expect, it } from 'vitest'

import { isYoutubeId, validateYoutubeId } from './videos'

describe('YouTube id (ADR-016)', () => {
  it('accepts 11 URL-safe characters', () => {
    expect(isYoutubeId('UFXLZ4kSjD0')).toBe(true)
    expect(isYoutubeId('a-b_c-d_e-f')).toBe(true)
  })

  it('rejects addresses, other lengths and other characters', () => {
    expect(isYoutubeId('https://youtu.be/UFXLZ4kSjD0')).toBe(false)
    expect(isYoutubeId('UFXLZ4kSjD')).toBe(false)
    expect(isYoutubeId('UFXLZ4kSjD00')).toBe(false)
    expect(isYoutubeId('UFXLZ4kSj<0')).toBe(false)
  })

  it('explains the format in the panel', () => {
    expect(validateYoutubeId('UFXLZ4kSjD0')).toBe(true)
    expect(validateYoutubeId('')).toMatch(/Podaj/)
    expect(validateYoutubeId('youtu.be/x')).toMatch(/11 znaków/)
  })
})

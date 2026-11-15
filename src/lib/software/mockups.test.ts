import { describe, expect, it } from 'vitest'

import { isMockupKind, isVariantOf, MOCKUP_KINDS, MOCKUP_VARIANTS, mockupVariants } from './mockups'

describe('mock-up kinds and variants (ZMIANY-v24 §8)', () => {
  it('has the six kinds of the board', () => {
    expect(MOCKUP_KINDS).toEqual(['site', 'dash', 'flow', 'care', 'before', 'phone'])
  })

  it('gives a site the fourteen variants of the board, the same for a phone', () => {
    expect(mockupVariants('site')).toHaveLength(14)
    expect(mockupVariants('phone')).toEqual(mockupVariants('site'))
    expect(mockupVariants('dash')).toEqual(['zamowienia', 'crm', 'czas', 'excel', 'pulpit'])
    expect(mockupVariants('flow')).toEqual(['sms', 'faktury', 'raporty', 'ai'])
    expect(mockupVariants('before')).toEqual(['przebudowa'])
    expect(mockupVariants('care')).toEqual([])
  })

  it('tells a variant of the kind from a stranger', () => {
    expect(isVariantOf('site', 'pensjonat')).toBe(true)
    expect(isVariantOf('dash', 'pensjonat')).toBe(false)
    expect(isVariantOf('care', null)).toBe(true)
    expect(isVariantOf('care', 'sms')).toBe(false)
    expect(isVariantOf('site', null)).toBe(false)
  })

  it('lists every variant once for the select of the panel', () => {
    expect(new Set(MOCKUP_VARIANTS).size).toBe(MOCKUP_VARIANTS.length)
    expect(MOCKUP_VARIANTS).toContain('ai')
    expect(MOCKUP_VARIANTS).toContain('wizytowka')
  })

  it('checks a kind', () => {
    expect(isMockupKind('flow')).toBe(true)
    expect(isMockupKind('video')).toBe(false)
  })
})

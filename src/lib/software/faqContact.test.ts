import { describe, expect, it } from 'vitest'

import { faqContactPair } from './faqContact'

const b = (blockType: string) => ({ blockType })

describe('faqContactPair', () => {
  it('pairs a FAQ with the contact block right after it', () => {
    const blocks = [b('swHero'), b('faq'), b('swContact')]
    expect(faqContactPair(blocks, 1)).toBe('faq')
    expect(faqContactPair(blocks, 2)).toBe('contact')
  })

  it('leaves a FAQ or a contact block alone when they are not neighbours', () => {
    const blocks = [b('faq'), b('richText'), b('swContact')]
    expect(faqContactPair(blocks, 0)).toBeNull()
    expect(faqContactPair(blocks, 2)).toBeNull()
  })

  it('does not pair a contact block before its FAQ', () => {
    const blocks = [b('swContact'), b('faq')]
    expect(faqContactPair(blocks, 0)).toBeNull()
    expect(faqContactPair(blocks, 1)).toBeNull()
  })

  it('other blocks are never part of the pair', () => {
    expect(faqContactPair([b('faq'), b('swContact')], 5)).toBeNull()
    expect(faqContactPair([b('richText')], 0)).toBeNull()
  })
})

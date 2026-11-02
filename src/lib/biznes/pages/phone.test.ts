import { describe, expect, it } from 'vitest'

import { hiddenOnPhone } from './phone'

describe('hiddenOnPhone (boards App-*: sections a phone screen leaves out)', () => {
  it('home: FAQ and the numbers, nothing else', () => {
    expect(hiddenOnPhone('home', { blockType: 'faq' })).toBe(true)
    expect(hiddenOnPhone('home', { blockType: 'bzFacts' })).toBe(true)
    expect(hiddenOnPhone('home', { blockType: 'bzOffer' })).toBe(false)
  })

  it('KSeF: FAQ and the closing band, not the hero, quiz, steps or penalties', () => {
    expect(hiddenOnPhone('ksef', { blockType: 'faq' })).toBe(true)
    expect(hiddenOnPhone('ksef', { blockType: 'bzSection', variant: 'band' })).toBe(true)
    for (const variant of ['ksef-hero', 'ksef-quiz', 'ksef-steps', 'ksef-penalties', 'sources']) {
      expect(hiddenOnPhone('ksef', { blockType: 'bzSection', variant })).toBe(false)
    }
  })

  it('a rule with a kind hides only that kind of section', () => {
    expect(hiddenOnPhone('kontakt', { blockType: 'bzSection', variant: 'contact-form' })).toBe(true)
    expect(hiddenOnPhone('kontakt', { blockType: 'bzSection', variant: 'cards' })).toBe(false)
    expect(hiddenOnPhone('kontakt', { blockType: 'faq' })).toBe(false)
  })

  it('a page without rules shows everything', () => {
    expect(hiddenOnPhone('polityka-prywatnosci', { blockType: 'faq' })).toBe(false)
    expect(hiddenOnPhone('nie-ma', { blockType: 'bzSection', variant: 'band' })).toBe(false)
  })
})

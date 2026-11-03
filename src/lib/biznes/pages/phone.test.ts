import { describe, expect, it } from 'vitest'

import { foldedOnPhone, hiddenOnPhone, phoneFormHref } from './phone'

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

  it('links to the contact form go to the inquiry page on a phone', () => {
    expect(phoneFormHref('#formularz')).toBe('/zapytanie')
    expect(phoneFormHref('/kontakt#formularz')).toBe('/zapytanie')
    expect(phoneFormHref('/kontakt')).toBeNull()
    expect(phoneFormHref('#pakiet')).toBeNull()
    expect(phoneFormHref('/oferta#formularz')).toBeNull()
  })

  it('GoPOS, Opieka IT and vending hide only what their boards leave out', () => {
    expect(hiddenOnPhone('gopos', { blockType: 'bzSection', variant: 'stats' })).toBe(true)
    expect(hiddenOnPhone('gopos', { blockType: 'faq' })).toBe(false)
    expect(hiddenOnPhone('opieka-it', { blockType: 'bzSection', variant: 'band' })).toBe(true)
    expect(hiddenOnPhone('opieka-it', { blockType: 'bzSection', variant: 'seats' })).toBe(false)
    expect(
      hiddenOnPhone('automaty-vendingowe', { blockType: 'bzSection', variant: 'sources' }),
    ).toBe(true)
    expect(hiddenOnPhone('automaty-vendingowe', { blockType: 'bzSection', variant: 'band' })).toBe(
      false,
    )
  })

  it('Opieka IT folds the comparison and the audience, not the steps', () => {
    expect(foldedOnPhone('opieka-it', { blockType: 'bzSection', variant: 'table' })).toBe(true)
    expect(foldedOnPhone('opieka-it', { blockType: 'bzSection', variant: 'audience' })).toBe(true)
    expect(foldedOnPhone('opieka-it', { blockType: 'bzSection', variant: 'switch-steps' })).toBe(
      false,
    )
    expect(foldedOnPhone('ksef', { blockType: 'bzSection', variant: 'table' })).toBe(false)
  })

  it('a page without rules shows everything', () => {
    expect(hiddenOnPhone('polityka-prywatnosci', { blockType: 'faq' })).toBe(false)
    expect(hiddenOnPhone('nie-ma', { blockType: 'bzSection', variant: 'band' })).toBe(false)
  })
})

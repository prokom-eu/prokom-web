import { describe, expect, it } from 'vitest'

import { foldedOnPhone } from './phone'

describe('foldedOnPhone (D12: shorter form, nothing hidden)', () => {
  it('Opieka IT folds the comparison and the audience, not the steps', () => {
    expect(foldedOnPhone('opieka-it', { blockType: 'bzSection', variant: 'table' })).toBe(true)
    expect(foldedOnPhone('opieka-it', { blockType: 'bzSection', variant: 'audience' })).toBe(true)
    expect(foldedOnPhone('opieka-it', { blockType: 'bzSection', variant: 'switch-steps' })).toBe(
      false,
    )
    expect(foldedOnPhone('ksef', { blockType: 'bzSection', variant: 'table' })).toBe(false)
  })

  it('a page without rules shows every section in full', () => {
    expect(foldedOnPhone('kontakt', { blockType: 'bzSection', variant: 'contact-form' })).toBe(
      false,
    )
    expect(foldedOnPhone('home', { blockType: 'faq' })).toBe(false)
  })
})

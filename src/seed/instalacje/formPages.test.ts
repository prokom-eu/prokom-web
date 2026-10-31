import { describe, expect, it } from 'vitest'

import { FORM_PAGE_BLOCKS, needsFormBlock } from './formPages'

describe('form pages of the seed (I11)', () => {
  it('fills an empty page and the sample page, never one with a block of the line', () => {
    expect(needsFormBlock(null)).toBe(true)
    expect(needsFormBlock([])).toBe(true)
    expect(needsFormBlock([{ blockType: 'contact' }, { blockType: 'inquiryForm' }])).toBe(true)
    expect(needsFormBlock([{ blockType: 'instContact' }, { blockType: 'faq' }])).toBe(false)
  })

  it('gives each page its block with the hero h1', () => {
    expect(FORM_PAGE_BLOCKS.zaplanuj?.()).toMatchObject({ blockType: 'instPlanner' })
    const contact = FORM_PAGE_BLOCKS.kontakt?.()
    expect(contact).toMatchObject({ blockType: 'instContact', hero: { h1a: 'Kontakt:' } })
  })
})

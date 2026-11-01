import { describe, expect, it } from 'vitest'

import { FORM_PAGE_BLOCKS, needsFormBlock } from './formPages'

describe('form pages of the seed (I11)', () => {
  it('fills an empty page and the sample page only', () => {
    expect(needsFormBlock(null)).toBe(true)
    expect(needsFormBlock([])).toBe(true)
    expect(needsFormBlock([{ blockType: 'contact' }, { blockType: 'inquiryForm' }])).toBe(true)
    expect(needsFormBlock([{ blockType: 'instContact' }, { blockType: 'faq' }])).toBe(false)
    // A page an editor laid out with other blocks stays as it is.
    expect(needsFormBlock([{ blockType: 'hero' }, { blockType: 'inquiryForm' }])).toBe(false)
  })

  it('gives each page its block with the hero h1', () => {
    expect(FORM_PAGE_BLOCKS.zaplanuj?.()).toMatchObject({ blockType: 'instPlanner' })
    const contact = FORM_PAGE_BLOCKS.kontakt?.()
    expect(contact).toMatchObject({ blockType: 'instContact', hero: { h1a: 'Kontakt:' } })
    expect(FORM_PAGE_BLOCKS.serwis?.()).toMatchObject({
      blockType: 'instServiceDesk',
      hero: { h1a: 'Coś nie działa?', cta: { href: '#plany' } },
    })
    const architects = FORM_PAGE_BLOCKS['dla-architektow']?.()
    // The 4 hero numbers of the prototype (spec §4).
    expect(architects).toMatchObject({
      blockType: 'instArchitects',
      hero: {
        h1b: 'Zaplanujmy ją przed tynkami.',
        facts: [
          { value: 'od 2004' },
          { value: '10 instalacji' },
          { value: '17 punktów' },
          { value: '24 miesiące' },
        ],
      },
    })
  })
})

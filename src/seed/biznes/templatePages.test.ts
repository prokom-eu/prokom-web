import { describe, expect, it } from 'vitest'

import { BIZNES_CONTACT } from './contact'
import { TEMPLATE_PAGES, templateLayout } from './templatePages'

describe('templateLayout (/kontakt and /o-firmie on the shared templates, plan 0611 §8.2)', () => {
  const block = { blockType: 'bzContactPage' } as const

  it('a new page gets the template block alone', () => {
    expect(templateLayout(undefined, 'bzContactPage')).toEqual([block])
  })

  it('the old K4 layout (K4 sections only) is replaced by the template', () => {
    const k4 = [
      { blockType: 'bzSection', variant: 'contact-hero' },
      { blockType: 'bzSection', variant: 'contact-form' },
      { blockType: 'faq' },
      { blockType: 'bzLocation' },
    ]
    expect(templateLayout(k4 as never, 'bzContactPage')).toEqual([block])
  })

  it('a page already on the template, or edited in the panel, stays as it is', () => {
    expect(templateLayout([block] as never, 'bzContactPage')).toBeNull()
    const edited = [{ blockType: 'bzSection' }, { blockType: 'bzHero' }]
    expect(templateLayout(edited as never, 'bzContactPage')).toBeNull()
  })

  it('--zamien-strony: a page of the 31.10 import (contact card + FAQ) moves to the template', () => {
    const old = [{ blockType: 'bzContact' }, { blockType: 'faq' }]
    expect(templateLayout(old as never, 'bzContactPage')).toBeNull()
    expect(templateLayout(old as never, 'bzContactPage', true)).toEqual([block])
    // Already on the template: nothing to replace.
    expect(templateLayout([block] as never, 'bzContactPage', true)).toBeNull()
  })

  it('covers both pages with their own block, titles and descriptions', () => {
    expect(TEMPLATE_PAGES.map((page) => [page.slug, page.block])).toEqual([
      ['o-firmie', 'bzAboutPage'],
      ['kontakt', 'bzContactPage'],
    ])
    for (const page of TEMPLATE_PAGES) expect(page.description.length).toBeLessThanOrEqual(160)
  })

  it('/kontakt: confirmed contact data only, the 60-minute wording replaced (audit 14.11)', () => {
    const contact = TEMPLATE_PAGES.find((page) => page.slug === 'kontakt')!
    expect(contact.description).toContain(BIZNES_CONTACT.phone)
    expect(contact.description).toContain(BIZNES_CONTACT.email)
    expect(contact.description).not.toMatch(/60 minut/)
    expect(contact.description.length).toBeGreaterThanOrEqual(100)
    expect(contact.description.length).toBeLessThanOrEqual(155)
    expect(contact.replaces?.some((old) => old.includes('60 minut'))).toBe(true)
  })
})

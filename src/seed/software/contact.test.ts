import { describe, expect, it } from 'vitest'

import factsPackage from '../../../seed/prokomsoftware/fakty.json'
import { resolveText } from '../../lib/software/facts'
import { SW_CONTACT_PAGE, softwareContactLayout, softwareContactUpdate } from './contact'

describe('Software /kontakt of the seed (SW11a)', () => {
  it('is the contact page block and the 4 contact questions', () => {
    const layout = softwareContactLayout()
    expect(layout.map((block) => block.blockType)).toEqual(['swContactPage', 'faq'])
    const faq = layout[1]
    expect(faq && 'items' in faq ? faq.items : []).toHaveLength(4)
  })

  it('replaces the sample page, then leaves the page to the panel', () => {
    expect(softwareContactUpdate([{ blockType: 'contact', heading: 'Kontakt' }])).toEqual(
      softwareContactLayout(),
    )
    expect(softwareContactUpdate(null)).toEqual(softwareContactLayout())
    expect(softwareContactUpdate(softwareContactLayout())).toBeNull()
  })

  it('has 4 channels, 4 steps and the 5 other PRO-KOM lines, never Software itself', () => {
    expect(SW_CONTACT_PAGE.channels?.map((channel) => channel.kind)).toEqual([
      'phone',
      'email',
      'salon',
      'online',
    ])
    expect(SW_CONTACT_PAGE.steps).toHaveLength(4)
    expect(SW_CONTACT_PAGE.lines?.map((card) => card.line)).toEqual([
      'biznes',
      'instalacje',
      'tech',
      'zakopane',
      'prokom',
    ])
  })

  it('uses only facts the package knows; the Zakopane address stays empty (hidden)', () => {
    const facts = factsPackage.facts as Record<string, string | null>
    const texts = [
      ...(SW_CONTACT_PAGE.channels ?? []).map((channel) => channel.text ?? ''),
      ...(SW_CONTACT_PAGE.steps ?? []).map((step) => step.text ?? ''),
      ...(SW_CONTACT_PAGE.places ?? []).map((place) => place.text),
      SW_CONTACT_PAGE.submitNote ?? '',
    ]
    for (const text of texts) {
      for (const [, key] of text.matchAll(/\[([^\]]+)\]/g)) expect(facts).toHaveProperty(key!)
    }
    const known = Object.fromEntries(
      Object.entries(facts).filter((entry): entry is [string, string] => entry[1] !== null),
    )
    const context = { tenantId: 1, facts: known, prices: {}, terms: {}, strict: true }
    const zakopane = SW_CONTACT_PAGE.places?.[1]?.text ?? ''
    expect(resolveText(zakopane, context).missing).toEqual(['[ADRES SALONU W ZAKOPANEM]'])
  })
})

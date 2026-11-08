import { describe, expect, it } from 'vitest'

import { railItems } from '@/sites/biznes/components/home/rail'
import { isIconName } from '@/lib/shared/icons'
import { glownaSekcje } from '@/sites/instalacje/dane/glownaSekcje'
import { HOME_ORDER_V24, homeSectionAnchor } from '@/lib/software/homeSections'

import { BIZNES_SHARED } from './biznes'
import { COMPANY_LINES, SHARED_COMPANY } from './company'
import { INSTALACJE_SHARED } from './instalacje'
import { LINE_SHARED } from './run'
import { SOFTWARE_SHARED } from './software'
import type { SharedGroup } from './types'

const anchors = (shared: SharedGroup) =>
  (shared.rail?.sections ?? []).map((section) => section.anchorId)

/** The Biznes home page with every section rendered (all optional ones filled). */
const BIZNES_HOME = [
  { blockType: 'bzHero' },
  { blockType: 'bzOffer', systems: [{ title: 'GoPOS' }] },
  { blockType: 'partners' },
  { blockType: 'bzFeatured' },
  { blockType: 'bzPlan', industries: { heading: 'Dla firm', tiles: [{ name: 'Sklep' }] } },
  { blockType: 'bzSteps' },
  { blockType: 'bzReferences', reviews: [{ quote: 'Polecam.', author: 'E. S.' }] },
  { blockType: 'bzFacts' },
  { blockType: 'faq' },
  { blockType: 'bzContact' },
]

// L1-I / D3-B / D3-S: an unknown name falls back to a page icon in the rail.
describe('shared.rail — Instalacje and Biznes icons come from the shared set', () => {
  it('rail sections and the tab bar action', () => {
    const icons = [INSTALACJE_SHARED, BIZNES_SHARED, SOFTWARE_SHARED]
      .flatMap((shared) => [
        ...(shared.rail?.sections ?? []).map((section) => section.icon),
        shared.tabBar?.center?.icon,
      ])
      .filter(Boolean)
    expect(icons.filter((icon) => !isIconName(icon))).toEqual([])
  })
})

describe('shared.rail — every anchor exists on the line home page, in its order', () => {
  it('Biznes: the sections of the Biznes rail', () => {
    const home = railItems(BIZNES_HOME, { reviews: true, placeholders: false })
    expect(anchors(BIZNES_SHARED)).toEqual(home.map((item) => item.id))
  })

  it('Software: the sections of the v24 start page, in its order (promises have no entry)', () => {
    const home = HOME_ORDER_V24.map((section) =>
      section === 'hero'
        ? 'start'
        : section === 'contact'
          ? 'kontakt'
          : (homeSectionAnchor(section) ?? section),
    ).filter((anchor) => anchor !== 'obietnice')
    expect(anchors(SOFTWARE_SHARED)).toEqual(home)
  })

  it('Instalacje: the sections of the home rail', () => {
    expect(anchors(INSTALACJE_SHARED)).toEqual(glownaSekcje.rail.map(([id]) => id))
  })
})

/** Spec §2 and §10 pkt 2: phrases that must never be in shared texts. */
const FORBIDDEN: [string, RegExp][] = [
  ['WhatsApp', /whats\s?app/i],
  ['wa.me', /wa\.me/i],
  ['old Biznes e-mail', /biznes@pro-kom\.eu/i],
  ['old landline', /18\s?267\s?65\s?11/],
  ['sample domain', /example\.test/i],
  ['sample number', /000 000/],
  ['shop at pro-kom.eu', /i sklep/i],
]

describe('shared seed — content rules (spec §2, §10 pkt 2)', () => {
  const texts = JSON.stringify({ SHARED_COMPANY, LINE_SHARED })

  it.each(FORBIDDEN)('has no %s', (_name, pattern) => {
    expect(texts).not.toMatch(pattern)
  })

  it('names the lines as decided: Tech, never „Serwis”', () => {
    const names = COMPANY_LINES.map((line) => line.name)
    expect(names).toContain('Tech')
    expect(names.some((name) => /serwis/i.test(name))).toBe(false)
  })

  it('keeps Gaming and Zakopane unpublished until their start', () => {
    const unpublished = COMPANY_LINES.filter((line) => !line.published).map((line) => line.key)
    expect(unpublished).toEqual(['zakopane', 'gaming'])
  })

  it('points the Biznes contact facts to the line fields and keeps the K4-FINAL statuses', () => {
    // E-mail and the second number come from the line fields (`BIZNES_CONTACT`), not copied here.
    expect(BIZNES_SHARED.contact?.facts?.map((fact) => fact.kind)).toEqual([
      'email',
      'phone2',
      'text',
    ])
    expect(BIZNES_SHARED.about?.auth).toEqual([
      'Autoryzowany serwis Posnet',
      'Autoryzowany serwis Elzab',
      'Autoryzowany partner GoPOS',
      'Autoryzowany partner InsERT',
    ])
  })

  it('has a shared group for every line with a site', () => {
    expect(Object.keys(LINE_SHARED).sort()).toEqual(['biznes', 'instalacje', 'software'])
  })
})

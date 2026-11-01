import { describe, expect, it } from 'vitest'

import { biznesHomeLayout } from './home'
import { upgradeHomeV150 } from './homeV150'

type Block = { blockType: string; [key: string]: unknown }

const seed = biznesHomeLayout() as Block[]
const seedOf = (type: string) => seed.find((block) => block.blockType === type) as Block

/** A home page the seed made before v150 (the fields this upgrade changes), after the cleanup migration. */
function oldLayout(): Block[] {
  return [
    { blockType: 'bzHero', id: 'h', heading: 'Kasy, komputery i programy dla firm.' },
    {
      blockType: 'bzOffer',
      id: 'o',
      heading: 'Wszystko dla firmy, w pięciu działach.',
      catalogLabel: 'Cały katalog',
      // Added by the migration: empty.
      searchEyebrow: null,
      searchHeading: null,
      systems: [
        { id: 's1', title: 'GoPOS dla gastronomii', text: 'a' },
        { id: 's2', title: 'Subiekt i programy InsERT', text: 'b' },
        { id: 's3', title: 'Opieka IT w abonamencie', text: 'w stałej opłacie' },
      ],
    },
    {
      blockType: 'bzSteps',
      id: 'st',
      steps: [
        { id: 'k1', title: 'Rozmowa', label: 'mówi wprost, czego nie potrzebujesz' },
        { id: 'k2', title: 'Oferta', label: 'nie zaczynasz rozmowy od nowa' },
        { id: 'k3', title: 'Wdrożenie', label: 'partner InsERT, wdraża też Comarch ERP' },
        { id: 'k4', title: 'Opieka', label: 'autoryzowany serwis Posnet i Elzab' },
      ],
      guarantees: [
        { id: 'g1', text: 'Wycena bez zobowiązań' },
        { id: 'g2', text: 'Oferta na piśmie' },
        { id: 'g3', text: 'Kasa w cenie z fiskalizacją i szkoleniem' },
        { id: 'g4', text: 'Jeden opiekun od początku do końca' },
      ],
    },
    {
      blockType: 'bzFacts',
      id: 'f',
      stats: [
        { id: 'a', value: '100+', label: 'firm pod stałą opieką' },
        { id: 'b', value: '4', label: 'autoryzacje i partnerstwa' },
      ],
      contactLink: { label: 'Kontakt i dojazd', href: '/kontakt' },
    },
    {
      blockType: 'bzPlan',
      id: 'p',
      industries: { eyebrow: null, heading: 'Firmy każdej wielkości. Od straganu po urząd gminy.' },
    },
    { blockType: 'faq', id: 'q', heading: 'Zanim zadzwonisz' },
  ]
}

describe('upgradeHomeV150 (K4c PR 3b and the cleanup)', () => {
  it('keeps the blocks and their order', () => {
    expect(upgradeHomeV150(oldLayout(), seed)?.map((block) => block.blockType)).toEqual([
      'bzHero',
      'bzOffer',
      'bzSteps',
      'bzFacts',
      'bzPlan',
      'faq',
    ])
  })

  it('puts the v150 values of the seed in place of the old seed values', () => {
    const next = upgradeHomeV150(oldLayout(), seed) ?? []
    const by = (type: string) => next.find((block) => block.blockType === type) as Block
    expect(by('bzOffer')).toMatchObject({
      id: 'o',
      heading: seedOf('bzOffer').heading,
      catalogLabel: 'Cała oferta',
      systems: seedOf('bzOffer').systems,
    })
    expect(by('bzSteps').steps).toEqual(seedOf('bzSteps').steps)
    expect(by('bzSteps').guarantees).toEqual(seedOf('bzSteps').guarantees)
    expect(by('bzFacts').stats).toEqual(seedOf('bzFacts').stats)
    expect(by('bzFacts').contactLink).toEqual({
      label: 'Poznaj PRO-KOM i pozostałe linie firmy',
      href: '/o-firmie',
    })
    expect(by('faq').heading).toBe('Zanim zadzwonisz')
    expect(JSON.stringify(next)).not.toContain('firm pod stałą opieką')
  })

  it('fills the texts added by the cleanup migration while they are empty', () => {
    const next = upgradeHomeV150(oldLayout(), seed) ?? []
    const by = (type: string) => next.find((block) => block.blockType === type) as Block
    expect(by('bzOffer')).toMatchObject({
      searchEyebrow: 'Nie wiesz, w którym dziale szukać?',
      searchHeading: seedOf('bzOffer').searchHeading,
    })
    expect(by('bzPlan').industries).toEqual({
      eyebrow: 'Dla kogo pracujemy',
      heading: 'Firmy każdej wielkości. Od straganu po urząd gminy.',
    })
    expect(by('bzSteps')).toMatchObject({
      commitmentsEyebrow: 'Nasze zobowiązania',
      commitmentsHeading: seedOf('bzSteps').commitmentsHeading,
    })
  })

  it('keeps what was edited in the panel', () => {
    const layout = oldLayout().map((block) =>
      block.blockType === 'bzOffer'
        ? { ...block, heading: 'Nasza oferta', searchHeading: 'Szukasz czegoś?' }
        : block,
    )
    const offer = upgradeHomeV150(layout, seed)?.find((block) => block.blockType === 'bzOffer')
    expect(offer).toMatchObject({ heading: 'Nasza oferta', searchHeading: 'Szukasz czegoś?' })
  })

  it('changes nothing on the second run', () => {
    const once = upgradeHomeV150(oldLayout(), seed)
    expect(once).not.toBeNull()
    expect(upgradeHomeV150(once, seed)).toBeNull()
  })

  it('leaves a fresh v150 page as it is', () => {
    expect(upgradeHomeV150(seed, seed)).toBeNull()
  })
})

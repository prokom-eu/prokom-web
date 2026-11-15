import { describe, expect, it } from 'vitest'

import {
  GUARANTEES_1411,
  HOME_ORDER_1411,
  LINES_BLOCK_1411,
  STEPS_GETS_1411,
  SYSTEMS_HEAD,
  upgradeHome1411,
  upgradeHomeSections1411,
} from './home1411'
import { BIZNES_CONTACT } from './contact'

type Block = { blockType: string; variant?: unknown; [key: string]: unknown }

const offer: Block = {
  blockType: 'bzOffer',
  systems: [
    { id: 'a', title: 'GoPOS dla gastronomii', mode: 'image' },
    {
      id: 'b',
      title: 'Stała opieka IT',
      mode: 'statuses',
      statuses: [{ id: 's1', label: 'Kopia', value: 'sprawdzona', tone: 'ok' }],
    },
  ],
}
// The home page of the earlier seed (B3-1 + B3-2): the KSeF band after „Najczęściej wybierane”.
const before: Block[] = [
  { blockType: 'bzHero' },
  { blockType: 'bzNeeds' },
  offer,
  { blockType: 'bzProcurement' },
  { blockType: 'partners' },
  { blockType: 'bzFeatured' },
  { blockType: 'bzKsef', variant: 'band' },
  { blockType: 'bzPlan' },
  { blockType: 'bzSteps' },
  { blockType: 'bzReferences' },
  { blockType: 'bzFacts' },
  { blockType: 'bzNewsHome' },
  { blockType: 'faq' },
  { blockType: 'bzContact' },
]

describe('upgradeHome1411 (PRZEKAZANIE-RUNDA-1411 §1 — nowa kolejność)', () => {
  const next = upgradeHome1411(before)!

  it('puts the sections in the order of §1, without the KSeF band', () => {
    expect(next.map((block) => block.blockType)).toEqual([
      'bzHero',
      'bzNeeds',
      'bzOffer',
      'bzSystems',
      'bzFeatured',
      'bzPlan',
      'bzSteps',
      'bzReferences',
      'bzFacts',
      'partners',
      'bzProcurement',
      'bzNewsHome',
      'faq',
      'bzContact',
    ])
    expect(next.some((block) => block.blockType === 'bzKsef')).toBe(false)
  })

  it('makes „Systemy” of the offer’s cards, without the old row ids', () => {
    const systems = next.find((block) => block.blockType === 'bzSystems')!
    expect(systems).toMatchObject(SYSTEMS_HEAD)
    expect(systems.systems).toEqual([
      { title: 'GoPOS dla gastronomii', mode: 'image' },
      {
        title: 'Stała opieka IT',
        mode: 'statuses',
        statuses: [{ label: 'Kopia', value: 'sprawdzona', tone: 'ok' }],
      },
    ])
  })

  it('is idempotent: a second run changes nothing', () => {
    expect(upgradeHome1411(next)).toBeNull()
  })

  it('keeps the order the panel set after the move (no re-sorting on every import)', () => {
    const faqAt = next.findIndex((block) => block.blockType === 'faq')
    const moved = [next[faqAt]!, ...next.filter((_, i) => i !== faqAt)]
    expect(upgradeHome1411(moved)).toBeNull()
  })

  it('keeps a full KSeF card (not the band) and a page edited in the panel in its order', () => {
    const edited = [...next.slice(0, 2), { blockType: 'richText' }, ...next.slice(2)]
    expect(upgradeHome1411(edited)).toBeNull()
    const withCard = [...next, { blockType: 'bzKsef', variant: 'full' }]
    expect(upgradeHome1411(withCard)).toBeNull()
  })

  it('no layout: nothing; the order lists every block of the new home page once', () => {
    expect(upgradeHome1411([])).toBeNull()
    expect(upgradeHome1411(null)).toBeNull()
    expect(new Set(HOME_ORDER_1411).size).toBe(HOME_ORDER_1411.length)
  })
})

describe('upgradeHomeSections1411 (R4: Jak pracujemy, Inne linie)', () => {
  const steps: Block = {
    blockType: 'bzSteps',
    heading: 'Od pierwszej rozmowy do serwisu',
    steps: [
      { title: 'Rozmowa', gets: 'listę potrzeb, także tego, czego nie musisz kupować' },
      { title: 'Oferta', gets: 'mój własny tekst z panelu' },
      { title: 'Wdrożenie', gets: 'działające stanowiska od pierwszego dnia' },
      { title: 'Opieka', gets: `jeden numer do wszystkiego: ${BIZNES_CONTACT.phone}` },
    ],
    guarantees: [
      { text: '60 minut — oddzwaniamy w godzinach pracy' },
      { text: 'Wycena na mailu — pod Twoją firmę, w kilku wariantach' },
      { text: 'Kasa gotowa do pracy — fiskalizacja, programowanie, szkolenie' },
      { text: `Jeden numer — ${BIZNES_CONTACT.phone}, oferty i serwis` },
    ],
  }
  const layout: Block[] = [
    { blockType: 'bzHero' },
    steps,
    { blockType: 'faq' },
    { blockType: 'bzContact' },
  ]
  const next = upgradeHomeSections1411(layout)!

  it('takes the new texts where the old seed ones stand, keeps a panel edit', () => {
    const upgraded = next.find((block) => block.blockType === 'bzSteps') as Block & {
      steps: { gets: string }[]
      guarantees: { text: string }[]
    }
    expect(upgraded.heading).toBe('Od pierwszej rozmowy do serwisu na lata')
    expect(upgraded.steps.map((step) => step.gets)).toEqual([
      STEPS_GETS_1411[0],
      'mój własny tekst z panelu',
      STEPS_GETS_1411[2],
      STEPS_GETS_1411[3],
    ])
    expect(upgraded.guarantees.map((row) => row.text)).toEqual([...GUARANTEES_1411])
  })

  it('puts „Inne linie PRO-KOM” before the FAQ, once', () => {
    expect(next.map((block) => block.blockType)).toEqual([
      'bzHero',
      'bzSteps',
      'bzLines',
      'faq',
      'bzContact',
    ])
    expect(upgradeHomeSections1411(next)).toBeNull()
  })

  it('leaves edited commitments alone', () => {
    const edited = { ...steps, guarantees: [{ text: 'Coś od szefa' }] }
    const out = upgradeHomeSections1411([edited, { blockType: 'bzLines' }])!
    expect((out[0] as Block & { guarantees: unknown }).guarantees).toEqual([
      { text: 'Coś od szefa' },
    ])
  })
})

describe('Inne linie PRO-KOM: no line count (audyt 15.11 P2-1)', () => {
  it('the eyebrow names the lines without a number', () => {
    const eyebrow = LINES_BLOCK_1411.eyebrow
    expect(eyebrow).toBe('Jedna firma — linie PRO-KOM')
    expect(eyebrow).not.toMatch(/\d|jedna linia|dwie|trzy|cztery|pięć|sześć/i)
  })
})

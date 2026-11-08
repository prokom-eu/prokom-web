import { describe, expect, it } from 'vitest'

import { resolveText } from '../../lib/software/facts'
import { mergeSoftwareHome, softwareHomeInV21Order, softwareHomeLayout } from './home'
import { solutionsToImport } from './map'

const ids = (layout: readonly { blockType: string; section?: string | null }[] | null) =>
  layout?.map((block) => (block.blockType === 'swHomeSection' ? block.section : block.blockType))

const V23_ORDER = [
  'hero',
  'areas',
  'popular',
  'livePreviews',
  'wizard',
  'process',
  'howWeBuild',
  'whyNotWordpress',
  'technologies',
  'guarantees',
  'faq',
  'contact',
]
const V23_BUILT = [
  'areas',
  'popular',
  'livePreviews',
  'process',
  'wizard',
  'whyNotWordpress',
  'guarantees',
  'howWeBuild',
  'technologies',
] as const

describe('Software start page of the seed', () => {
  it('puts the sections in the v24 order (ZMIANY-v24 §4)', () => {
    expect(ids(softwareHomeLayout())).toEqual([
      'swHero',
      'promises',
      'situations',
      'bento',
      'showroom',
      'tech',
      'wizard',
      'pricing',
      'process',
      'faq',
      'swContact',
    ])
  })

  it('takes the 6 questions of the start page FAQ from the package', () => {
    const faq = softwareHomeLayout().find((block) => block.blockType === 'faq')
    expect(faq).toMatchObject({ eyebrow: 'Pytania', heading: 'Zanim napiszesz' })
    expect(faq && 'items' in faq ? faq.items : []).toHaveLength(6)
  })

  it('fills the prices and terms of the FAQ from the solutions (decyzja 10)', () => {
    const solutions = solutionsToImport()
    const context = {
      tenantId: 1,
      facts: {},
      prices: Object.fromEntries(solutions.map((s) => [s.slug, s.priceFrom])),
      terms: Object.fromEntries(solutions.map((s) => [s.slug, s.leadTime])),
      strict: true,
    }
    const faq = softwareHomeLayout().find((block) => block.blockType === 'faq')
    const items = faq && 'items' in faq ? (faq.items ?? []) : []
    const time = items.find((item) => item.question === 'Ile to trwa?')
    expect(resolveText(time?.answer ?? '', context)).toEqual({
      text: expect.stringMatching(
        /^Wizytówka i landing od 1 tygodnia, strona firmowa od 2 tygodni, system od 2 tygodni \(pierwszy moduł\), rozbudowana strona i sklep od 5 tygodni\./,
      ),
      missing: [],
    })
    for (const item of items) {
      const missing = resolveText(item.answer, context).missing.filter((t) => t.startsWith('{'))
      expect(missing, item.question).toEqual([])
    }
  })

  it('adds a section of a later session in its place', () => {
    const layout = softwareHomeLayout(undefined, ['promises', 'bento', 'wizard'])
    expect(ids(layout)).toEqual(['swHero', 'promises', 'bento', 'wizard', 'faq', 'swContact'])
  })

  it('replaces the sample page (no Software block yet)', () => {
    const seed = softwareHomeLayout()
    const sample = [{ blockType: 'hero' }, { blockType: 'partners' }]
    expect(mergeSoftwareHome(sample as Parameters<typeof mergeSoftwareHome>[0], seed)).toEqual(seed)
  })

  it('inserts only the missing section after its predecessor, keeping panel edits', () => {
    const edited = [
      { blockType: 'swHomeSection' as const, section: 'popular' as const },
      { blockType: 'swHero' as const, title: 'Mój tytuł' },
      { blockType: 'faq' as const },
    ]
    const merged = mergeSoftwareHome(
      edited as Parameters<typeof mergeSoftwareHome>[0],
      softwareHomeLayout(),
    )
    // A v23 section stays where it was (it renders nothing in v24); the v24 ones come in after
    // their predecessors.
    expect(ids(merged)).toEqual([
      'popular',
      'swHero',
      'promises',
      'situations',
      'bento',
      'showroom',
      'tech',
      'wizard',
      'pricing',
      'process',
      'faq',
      'swContact',
    ])
    expect(merged?.[1]).toMatchObject({ title: 'Mój tytuł' })
  })

  it('moves a v20 page to the v21 order once, keeping blocks of its own in their place', () => {
    const v23 = softwareHomeLayout(V23_ORDER, V23_BUILT)
    const v20 = softwareHomeLayout(
      [
        'hero',
        'areas',
        'popular',
        'livePreviews',
        'process',
        'wizard',
        'whyNotWordpress',
        'guarantees',
        'showcase',
        'faq',
        'contact',
      ],
      V23_BUILT,
    )
    const own = { blockType: 'richText' } as unknown as (typeof v20)[number]
    const page = [...v20.slice(0, 3), own, ...v20.slice(3)]
    const merged = mergeSoftwareHome(page, v23)!
    const result = softwareHomeInV21Order(merged, v23)
    expect(ids(result)).toEqual([
      'swHero',
      'areas',
      'popular',
      'richText',
      'livePreviews',
      'wizard',
      'process',
      'howWeBuild',
      'whyNotWordpress',
      'technologies',
      'guarantees',
      'faq',
      'swContact',
    ])
    expect(softwareHomeInV21Order(result!, v23)).toBeNull()
  })

  it('changes nothing when every block is there', () => {
    const seed = softwareHomeLayout()
    expect(mergeSoftwareHome(seed, seed)).toBeNull()
  })
})

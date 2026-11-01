import { describe, expect, it } from 'vitest'

import { resolveText } from '../../lib/software/facts'
import { mergeSoftwareHome, softwareHomeInV21Order, softwareHomeLayout } from './home'
import { solutionsToImport } from './map'

const ids = (layout: readonly { blockType: string; section?: string | null }[] | null) =>
  layout?.map((block) => (block.blockType === 'swHomeSection' ? block.section : block.blockType))

describe('Software start page of the seed', () => {
  it('puts the 13 sections in the v23 order of the package (homeOrder, spec. §4; no „Realizacje”)', () => {
    expect(ids(softwareHomeLayout())).toEqual([
      'swHero',
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
      'swContact',
    ])
  })

  it('takes the 6 questions of the start page FAQ from the package', () => {
    const faq = softwareHomeLayout().find((block) => block.blockType === 'faq')
    expect(faq).toMatchObject({ heading: 'Pytania, które słyszymy najczęściej' })
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
    const layout = softwareHomeLayout(undefined, ['areas', 'popular', 'whyNotWordpress', 'wizard'])
    expect(ids(layout)).toEqual([
      'swHero',
      'areas',
      'popular',
      'wizard',
      'whyNotWordpress',
      'faq',
      'swContact',
    ])
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
    expect(ids(merged)).toEqual([
      'popular',
      'swHero',
      'areas',
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
    expect(merged?.[1]).toMatchObject({ title: 'Mój tytuł' })
  })

  it('moves a v20 page to the v21 order once, keeping blocks of its own in their place', () => {
    const v20 = softwareHomeLayout([
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
    ])
    const own = { blockType: 'richText' } as unknown as (typeof v20)[number]
    const page = [...v20.slice(0, 3), own, ...v20.slice(3)]
    const merged = mergeSoftwareHome(page, softwareHomeLayout())!
    const result = softwareHomeInV21Order(merged, softwareHomeLayout())
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
    expect(softwareHomeInV21Order(result!, softwareHomeLayout())).toBeNull()
  })

  it('changes nothing when every block is there', () => {
    const seed = softwareHomeLayout()
    expect(mergeSoftwareHome(seed, seed)).toBeNull()
  })
})

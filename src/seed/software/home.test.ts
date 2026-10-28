import { describe, expect, it } from 'vitest'

import { mergeSoftwareHome, softwareHomeLayout } from './home'

const ids = (layout: readonly { blockType: string; section?: string | null }[] | null) =>
  layout?.map((block) => (block.blockType === 'swHomeSection' ? block.section : block.blockType))

describe('Software start page of the seed', () => {
  it('puts the built sections in the package order (homeOrder)', () => {
    expect(ids(softwareHomeLayout())).toEqual(['swHero', 'areas', 'popular', 'wizard'])
  })

  it('adds a section of a later session in its place', () => {
    const layout = softwareHomeLayout(undefined, ['areas', 'popular', 'livePreviews', 'wizard'])
    expect(ids(layout)).toEqual(['swHero', 'areas', 'popular', 'livePreviews', 'wizard'])
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
    expect(ids(merged)).toEqual(['popular', 'swHero', 'areas', 'wizard', 'faq'])
    expect(merged?.[1]).toMatchObject({ title: 'Mój tytuł' })
  })

  it('changes nothing when every block is there', () => {
    const seed = softwareHomeLayout()
    expect(mergeSoftwareHome(seed, seed)).toBeNull()
  })
})

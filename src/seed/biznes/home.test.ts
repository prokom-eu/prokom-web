import { describe, expect, it } from 'vitest'

import { BIZNES_BLOCK_SLUGS, GENERIC_BLOCK_SLUGS } from '../../blocks/registry'
import { biznesHomeLayout, mergeHomeLayout } from './home'

const block = (blockType: string, id?: string) => ({ blockType, ...(id ? { id } : {}) })

describe('mergeHomeLayout', () => {
  const seed = [block('bzHero'), block('bzNeeds'), block('partners')]

  it('replaces the sample page that has no Biznes block yet', () => {
    const sample = [block('hero', 'a'), block('partners', 'b')]
    expect(mergeHomeLayout(sample, seed)).toEqual(seed)
  })

  it('keeps blocks edited in the panel and inserts the new ones in the seed order', () => {
    const existing = [block('bzHero', 'h'), block('partners', 'p')]
    expect(mergeHomeLayout(existing, seed)).toEqual([
      block('bzHero', 'h'),
      block('bzNeeds'),
      block('partners', 'p'),
    ])
  })

  it('keeps the order from the panel and blocks the seed does not know', () => {
    const existing = [block('richText', 'r'), block('bzHero', 'h')]
    expect(mergeHomeLayout(existing, seed)?.map((b) => b.blockType)).toEqual([
      'richText',
      'bzHero',
      'bzNeeds',
      'partners',
    ])
  })

  it('keeps two blocks of one type', () => {
    const existing = [block('bzHero', 'h'), block('partners', 'a'), block('partners', 'b')]
    expect(mergeHomeLayout(existing, seed)).toEqual([
      block('bzHero', 'h'),
      block('bzNeeds'),
      block('partners', 'a'),
      block('partners', 'b'),
    ])
  })

  it('puts a missing first block of the seed at the start', () => {
    const existing = [block('bzNeeds', 'n')]
    expect(mergeHomeLayout(existing, seed)?.map((b) => b.blockType)).toEqual([
      'bzHero',
      'bzNeeds',
      'partners',
    ])
  })

  it('returns null when nothing is missing', () => {
    const existing = [block('bzHero', 'h'), block('bzNeeds', 'n'), block('partners', 'p')]
    expect(mergeHomeLayout(existing, seed)).toBeNull()
  })
})

describe('biznesHomeLayout', () => {
  it('uses only blocks allowed on the Biznes line, each once', () => {
    const types = biznesHomeLayout().map((b) => b.blockType)
    const allowed = new Set([...GENERIC_BLOCK_SLUGS, ...BIZNES_BLOCK_SLUGS])
    for (const type of types) expect(allowed.has(type)).toBe(true)
    expect(new Set(types).size).toBe(types.length)
  })

  it('starts with the Biznes hero (the only h1 of the page)', () => {
    expect(biznesHomeLayout()[0]?.blockType).toBe('bzHero')
  })
})

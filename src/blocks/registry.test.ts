import { describe, expect, it } from 'vitest'

import {
  ALLOWED_BLOCKS,
  allowedBlockSlugs,
  BLOCK_SLUGS,
  createBlocksFilter,
  isBlockAllowed,
  renderableBlocks,
} from './registry'

const restricted = {
  prokom: [],
  biznes: ['hero', 'faq'],
  instalacje: ['hero'],
  software: [...BLOCK_SLUGS],
} as const

describe('block registry', () => {
  it('starts with every generic block allowed on every line (ADR-010)', () => {
    for (const slugs of Object.values(ALLOWED_BLOCKS)) {
      expect([...slugs].sort()).toEqual([...BLOCK_SLUGS].sort())
    }
  })

  it('lists only the blocks allowed for a line', () => {
    expect(allowedBlockSlugs('biznes', restricted)).toEqual(['hero', 'faq'])
    expect(allowedBlockSlugs('prokom', restricted)).toEqual([])
  })

  it('allows nothing without a known line', () => {
    expect(allowedBlockSlugs(null, restricted)).toEqual([])
    expect(allowedBlockSlugs(undefined)).toEqual([])
  })

  it('checks a single block against the line', () => {
    expect(isBlockAllowed('biznes', 'faq', restricted)).toBe(true)
    expect(isBlockAllowed('instalacje', 'faq', restricted)).toBe(false)
    expect(isBlockAllowed('biznes', 'unknown', restricted)).toBe(false)
  })
})

describe('createBlocksFilter', () => {
  const lines: Record<number, 'biznes' | 'instalacje'> = { 1: 'biznes', 2: 'instalacje' }
  const filter = createBlocksFilter(restricted, async (id) => lines[id] ?? null)

  it("returns the blocks of the document's tenant line", async () => {
    expect(await filter({ data: { tenant: 1 } })).toEqual(['hero', 'faq'])
    expect(await filter({ data: { tenant: { id: 2 } } })).toEqual(['hero'])
  })

  it('allows nothing without a tenant or for an unknown tenant', async () => {
    expect(await filter({ data: {} })).toEqual([])
    expect(await filter({ data: { tenant: 99 } })).toEqual([])
  })
})

describe('renderableBlocks', () => {
  const layout = [
    { blockType: 'hero', id: 'a' },
    { blockType: 'faq', id: 'b' },
    { blockType: 'removed-block', id: 'c' },
  ]

  it('keeps only blocks allowed for the line, in order', () => {
    expect(renderableBlocks('biznes', layout, restricted).map((b) => b.id)).toEqual(['a', 'b'])
    expect(renderableBlocks('instalacje', layout, restricted).map((b) => b.id)).toEqual(['a'])
  })

  it('renders nothing for an empty layout or unknown line', () => {
    expect(renderableBlocks('biznes', null, restricted)).toEqual([])
    expect(renderableBlocks(null, layout, restricted)).toEqual([])
  })
})

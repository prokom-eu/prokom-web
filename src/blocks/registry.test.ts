import { describe, expect, it } from 'vitest'

import {
  ALLOWED_BLOCKS,
  allowedBlockSlugs,
  BIZNES_BLOCK_SLUGS,
  BLOCK_SLUGS,
  createBlocksFilter,
  GENERIC_BLOCK_SLUGS,
  INSTALACJE_BLOCK_SLUGS,
  isBlockAllowed,
  renderableBlocks,
  SOFTWARE_BLOCK_SLUGS,
} from './registry'

const restricted = {
  prokom: [],
  biznes: ['hero', 'faq'],
  instalacje: ['hero'],
  software: [...BLOCK_SLUGS],
} as const

describe('block registry', () => {
  it('allows every generic block on every line (ADR-010)', () => {
    for (const slugs of Object.values(ALLOWED_BLOCKS)) {
      expect(slugs).toEqual(expect.arrayContaining([...GENERIC_BLOCK_SLUGS]))
    }
  })

  it('allows the Biznes blocks on the Biznes line only', () => {
    expect(BIZNES_BLOCK_SLUGS.length).toBeGreaterThan(0)
    expect([...ALLOWED_BLOCKS.biznes].sort()).toEqual(
      [...GENERIC_BLOCK_SLUGS, ...BIZNES_BLOCK_SLUGS].sort(),
    )
    for (const line of ['prokom', 'instalacje', 'software'] as const) {
      for (const slug of BIZNES_BLOCK_SLUGS) expect(isBlockAllowed(line, slug)).toBe(false)
    }
  })

  it('allows the Instalacje blocks on the Instalacje line only', () => {
    expect([...ALLOWED_BLOCKS.instalacje].sort()).toEqual(
      [...GENERIC_BLOCK_SLUGS, ...INSTALACJE_BLOCK_SLUGS].sort(),
    )
    for (const line of ['prokom', 'biznes', 'software'] as const) {
      for (const slug of INSTALACJE_BLOCK_SLUGS) expect(isBlockAllowed(line, slug)).toBe(false)
    }
  })

  it('allows the Software blocks on the Software line only (ADR-014 rozstrz. 7)', () => {
    expect(SOFTWARE_BLOCK_SLUGS).toEqual(['swHero', 'swHomeSection'])
    expect([...ALLOWED_BLOCKS.software].sort()).toEqual(
      [...GENERIC_BLOCK_SLUGS, ...SOFTWARE_BLOCK_SLUGS].sort(),
    )
    for (const line of ['prokom', 'biznes', 'instalacje'] as const) {
      for (const slug of SOFTWARE_BLOCK_SLUGS) expect(isBlockAllowed(line, slug)).toBe(false)
    }
  })

  it('keeps at most 10 Software blocks (ADR-014 rozstrz. 7)', () => {
    expect(SOFTWARE_BLOCK_SLUGS.length).toBeLessThanOrEqual(10)
  })

  it('registers every line block in ALL_BLOCKS, the Software ones last', () => {
    expect([...BLOCK_SLUGS].sort()).toEqual(
      [
        ...GENERIC_BLOCK_SLUGS,
        ...BIZNES_BLOCK_SLUGS,
        ...INSTALACJE_BLOCK_SLUGS,
        ...SOFTWARE_BLOCK_SLUGS,
      ].sort(),
    )
    // New blocks at the end: the tables of the earlier ones keep their names.
    expect(BLOCK_SLUGS.slice(-SOFTWARE_BLOCK_SLUGS.length)).toEqual([...SOFTWARE_BLOCK_SLUGS])
  })

  it('has unique block slugs', () => {
    expect(new Set(BLOCK_SLUGS).size).toBe(BLOCK_SLUGS.length)
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

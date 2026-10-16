import { type BlocksField, type PayloadRequest, validations } from 'payload'
import { describe, expect, it } from 'vitest'

import { blocksFilterOptions, createBlocksFilter } from '../blocks/registry'
import { Pages } from './Pages'

const layoutField = Pages.fields.find(
  (field): field is BlocksField => 'name' in field && field.name === 'layout',
)

describe('Pages layout field', () => {
  it('is limited by the per-line block registry (ADR-010)', () => {
    expect(layoutField?.type).toBe('blocks')
    expect(layoutField?.filterOptions).toBe(blocksFilterOptions)
  })
})

describe('saving a block outside the line list', () => {
  // Payload's own blocks validator — the one that runs on save — with a restricted registry.
  const filterOptions = createBlocksFilter(
    { prokom: [], biznes: ['hero', 'faq'], instalacje: ['hero'], software: [] },
    async (tenantId) => (tenantId === 1 ? 'biznes' : 'instalacje'),
  ) as BlocksField['filterOptions']
  const req = { t: (key: string) => key, user: null } as unknown as PayloadRequest
  const validate = (tenant: number, blockType: string) =>
    validations.blocks([{ blockType }], {
      data: { tenant },
      filterOptions,
      req,
      siblingData: {},
    } as unknown as Parameters<typeof validations.blocks>[1])

  it('is rejected for a line without the block', async () => {
    expect(await validate(2, 'faq')).toBe('validation:invalidBlocks')
  })

  it('is accepted for a line with the block', async () => {
    expect(await validate(1, 'faq')).toBe(true)
  })
})

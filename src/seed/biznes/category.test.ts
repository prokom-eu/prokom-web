import { describe, expect, it } from 'vitest'

import {
  CASH_REGISTERS_CONTENT,
  INCLUDED_EYEBROW,
  renamedIncludedEyebrow,
  STAGE1_INCLUDED_EYEBROW,
} from './category'
import { missingFields } from './fill'

describe('renamedIncludedEyebrow (K3b′: no „w cenie”)', () => {
  it('replaces the untouched stage-1 name and keeps the rest of the section', () => {
    expect(
      renamedIncludedEyebrow({
        includedSection: { eyebrow: STAGE1_INCLUDED_EYEBROW, title: 'Tytuł z panelu' },
      }),
    ).toEqual({ includedSection: { eyebrow: INCLUDED_EYEBROW, title: 'Tytuł z panelu' } })
  })

  it('keeps a name edited in the panel and an empty section', () => {
    expect(renamedIncludedEyebrow({ includedSection: { eyebrow: 'Nasza nazwa' } })).toEqual({})
    expect(renamedIncludedEyebrow({})).toEqual({})
  })

  it('is not undone by the filling of missing fields of the same section', () => {
    const category = { includedSection: { eyebrow: STAGE1_INCLUDED_EYEBROW, title: null } }
    const renamed = renamedIncludedEyebrow(category)
    const filled = missingFields({ ...category, ...renamed }, CASH_REGISTERS_CONTENT)
    expect({ ...renamed, ...filled }.includedSection).toMatchObject({ eyebrow: INCLUDED_EYEBROW })
  })

  it('names the seeded section without „w cenie”', () => {
    expect(JSON.stringify(CASH_REGISTERS_CONTENT.includedSection)).not.toMatch(/w cenie/i)
  })
})

import { describe, expect, it } from 'vitest'

import type { Page } from '../../payload-types'
import { biznesGoposLayout } from './gopos'
import { isSeedLayout } from './page'

type Layout = NonNullable<Page['layout']>

/** What the database gives back: ids on every block and array row, defaults filled in. */
function stored(layout: Layout): Layout {
  return JSON.parse(
    JSON.stringify(layout, (_key, value) =>
      value && typeof value === 'object' && !Array.isArray(value)
        ? { id: 'x1', blockName: null, ...value }
        : value,
    ),
  ) as Layout
}

describe('isSeedLayout (K4h: replace only an untouched older seed)', () => {
  const seed = biznesGoposLayout()

  it('knows the seeded page, with ids and defaults the database adds', () => {
    expect(isSeedLayout(stored(seed), seed)).toBe(true)
  })

  it('leaves a page whose text was changed in the panel', () => {
    const edited = stored(seed)
    const hero = edited[0] as { heading?: string }
    hero.heading = 'Nasz własny nagłówek'
    expect(isSeedLayout(edited, seed)).toBe(false)
  })

  it('leaves a page with other blocks', () => {
    expect(isSeedLayout(stored(seed.slice(1)), seed)).toBe(false)
    expect(isSeedLayout(null, seed)).toBe(false)
  })
})

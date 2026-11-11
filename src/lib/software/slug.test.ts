import { describe, expect, it } from 'vitest'

import { slug } from './schema'
import { isSlug } from './slug'

describe('isSlug (the catalog without zod in the browser)', () => {
  it('takes what the zod slug takes and refuses the rest', () => {
    for (const value of [
      'strona-wizytowka',
      'crm',
      'a1-b2',
      '',
      'Strona',
      'a--b',
      '-a',
      'a b',
      'ą',
    ]) {
      expect(isSlug(value), value).toBe(slug.safeParse(value).success)
    }
    expect(isSlug(null)).toBe(false)
  })
})

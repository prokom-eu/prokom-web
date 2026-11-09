import { describe, expect, it } from 'vitest'

import { pagesToReplace } from './page'

describe('pagesToReplace (SEED_REPLACE_PAGES, runbook §2a)', () => {
  it('unset or empty: nothing is replaced', () => {
    expect(pagesToReplace(undefined).size).toBe(0)
    expect(pagesToReplace('').size).toBe(0)
    expect(pagesToReplace(' , ').size).toBe(0)
  })

  it('a comma list of slugs, spaces ignored', () => {
    expect([...pagesToReplace('gopos, insert,opieka-it ,o-firmie,kontakt')]).toEqual([
      'gopos',
      'insert',
      'opieka-it',
      'o-firmie',
      'kontakt',
    ])
  })
})

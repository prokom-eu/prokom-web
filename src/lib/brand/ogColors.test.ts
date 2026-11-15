import { describe, expect, it } from 'vitest'

import { resolve, rule } from '@/styles/parse-tokens'

import { OG_COLORS } from './ogColors'

const biznes = { ...rule(':root'), ...rule("[data-line='biznes']") }

describe('OG_COLORS', () => {
  it('equal the Biznes tokens of the light theme', () => {
    expect(OG_COLORS.navy).toBe(resolve('var(--surface-dark)', biznes).toLowerCase())
    expect(OG_COLORS.white).toBe(resolve('var(--c-white)', biznes).toLowerCase())
    expect(OG_COLORS.accentOnDark).toBe(resolve('var(--accent-on-dark)', biznes).toLowerCase())
  })
})

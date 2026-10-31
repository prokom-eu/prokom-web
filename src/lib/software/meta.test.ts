import { describe, expect, it } from 'vitest'

import { META_DESCRIPTION_MAX } from '../seo/description'
import { SOFTWARE_ROUTE_DESCRIPTIONS } from './meta'

describe('SOFTWARE_ROUTE_DESCRIPTIONS (spec. §9)', () => {
  it('fit in search results', () => {
    for (const [route, text] of Object.entries(SOFTWARE_ROUTE_DESCRIPTIONS)) {
      expect(text.length, route).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
    }
  })
})

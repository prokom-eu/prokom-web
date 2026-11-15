import { describe, expect, it } from 'vitest'

import type { Partner } from '../../payload-types'
import { shownPartner } from './shown'

const partner = (tenants: Partner['tenants']) => ({ id: 1, name: 'GoPOS', tenants }) as Partner

describe('shownPartner', () => {
  it('returns a partner shown on this site', () => {
    expect(shownPartner(partner([2, 5]), 5)?.name).toBe('GoPOS')
    expect(shownPartner(partner([{ id: 5 } as never]), 5)?.name).toBe('GoPOS')
  })

  it('hides a partner of other sites, an id only or nothing', () => {
    expect(shownPartner(partner([2]), 5)).toBeNull()
    expect(shownPartner(partner(null), 5)).toBeNull()
    expect(shownPartner(7, 5)).toBeNull()
    expect(shownPartner(null, 5)).toBeNull()
  })
})

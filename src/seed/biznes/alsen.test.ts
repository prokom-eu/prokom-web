import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { ALSEN, ALSEN_LOGO, alsenChanges } from './alsen'

describe('ALSEN record (runda 1811, D4)', () => {
  it('creates the network on Biznes and pro-kom.eu, authorised partner, without a page', () => {
    expect(alsenChanges(null, [2, 7])).toEqual({
      data: {
        ...ALSEN,
        brandPage: { hasPage: false },
        tenants: [2, 7],
      },
      uploadLogo: true,
    })
    expect(existsSync(ALSEN_LOGO.source)).toBe(true)
  })

  it('changes nothing on a second run', () => {
    const stored = {
      website: 'https://www.alsen.pl/',
      partnerStatus: 'authorized-partner' as const,
      filename: 'alsen-logo.png',
      tenants: [2, { id: 7 }],
      brandPage: { hasPage: false },
    }
    expect(alsenChanges(stored as never, [2, 7])).toBeNull()
  })

  it('keeps the panel’s site, file and other lines; the status and „no page” win', () => {
    const stored = {
      website: 'https://www.alsen.pl/partnerzy',
      partnerStatus: 'none' as const,
      filename: 'alsen.svg',
      tenants: [5],
      brandPage: { hasPage: true },
    }
    expect(alsenChanges(stored as never, [2, 7])).toEqual({
      data: {
        partnerStatus: 'authorized-partner',
        brandPage: { hasPage: false },
        tenants: [5, 2, 7],
      },
      uploadLogo: false,
    })
  })
})

import { describe, expect, it } from 'vitest'

import type { Partner } from '@/payload-types'

import { isPartnerNetwork, partnerNetworks, PARTNER_NETWORKS } from './networks'

const partner = (over: Partial<Partner>): Partner =>
  ({
    id: 1,
    name: 'ALSEN',
    slug: 'alsen',
    website: 'https://www.alsen.pl/',
    partnerStatus: 'authorized-partner',
    filename: 'alsen.png',
    url: '/api/partners/file/alsen.png',
    width: 1258,
    height: 319,
    sizes: {},
    ...over,
  }) as Partner

describe('partner networks (runda 1811, D4: ALSEN)', () => {
  it('knows ALSEN as a network, not a product brand', () => {
    expect(PARTNER_NETWORKS).toEqual(['alsen'])
    expect(isPartnerNetwork('alsen')).toBe(true)
    expect(isPartnerNetwork('ALSEN')).toBe(true)
    expect(isPartnerNetwork('posnet')).toBe(false)
    expect(isPartnerNetwork(null)).toBe(false)
  })

  it('shows a network only with the confirmed status and a logo', () => {
    const [alsen] = partnerNetworks([partner({})])
    expect(alsen).toMatchObject({
      slug: 'alsen',
      name: 'ALSEN',
      website: 'https://www.alsen.pl/',
      status: 'Autoryzowany partner',
    })
    expect(alsen?.logo).toMatchObject({ width: 1258, height: 319 })
    expect(partnerNetworks([partner({ partnerStatus: 'none' })])).toEqual([])
    expect(partnerNetworks([partner({ width: null, height: null })])).toEqual([])
    expect(partnerNetworks([partner({ slug: 'posnet', name: 'Posnet' })])).toEqual([])
  })

  it('links only to an https website', () => {
    expect(partnerNetworks([partner({ website: null })])[0]?.website).toBeNull()
    expect(partnerNetworks([partner({ website: 'http://alsen.pl' })])[0]?.website).toBeNull()
  })
})

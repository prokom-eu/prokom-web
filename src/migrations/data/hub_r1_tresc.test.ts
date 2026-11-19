import { describe, expect, it } from 'vitest'

import { brandsSchema } from '../../lib/prokom/brands'
import { homeSchema } from '../../lib/prokom/home'
import { hubBrands, hubHome, hubTrust } from '../../seed/prokom/map'
import { PROKOM_EXTRA_EMAILS, PROKOM_SHARED } from '../../seed/shared/prokom'
import {
  BRANDS_NOTE_1811,
  brandsWith1811,
  EXTRA_EMAILS_1811,
  homeWith1811,
  NETWORK_1811,
  PROCUREMENT_1811,
  railWith1811,
  TRUST_1811,
  trustWith1811,
} from './hub_r1_tresc'
import { trustWith1911 } from './hub_r1_poprawki'
import { emailsWithShop, trustWithAlsenFigure } from './hub_sklep_alsen'

describe('hub_r1_tresc (HUB-R1 data for production)', () => {
  // With the later data migrations of 19.11 (`hub_sklep_alsen`, `hub_r1_poprawki`) on top, as on production.
  it('is a copy of the package of this commit', () => {
    expect(NETWORK_1811).toEqual(hubBrands().network)
    expect(PROCUREMENT_1811).toEqual(hubHome().procurement)
    expect(BRANDS_NOTE_1811).toBe(hubBrands().note)
    const pkg = hubTrust()
    const afterFigure = (trustWithAlsenFigure(TRUST_1811) ?? TRUST_1811) as typeof TRUST_1811
    for (const row of trustWith1911(afterFigure) ?? afterFigure) expect(pkg).toContainEqual(row)
    expect(emailsWithShop(EXTRA_EMAILS_1811)).toEqual(PROKOM_EXTRA_EMAILS)
    expect(railWith1811(PROKOM_SHARED.rail?.sections)).toBeNull()
  })

  it('adds the network and the note to texts stored before the round — still valid', () => {
    const older = { ...hubBrands(), network: undefined }
    const next = brandsWith1811({
      ...older,
      note: 'Status autoryzowanego serwisu lub partnera dotyczy tylko czterech marek u góry.',
    })
    expect(next).toMatchObject({ network: NETWORK_1811, note: BRANDS_NOTE_1811 })
    expect(brandsSchema.safeParse(next).success).toBe(true)
  })

  it('keeps what the panel wrote: a network, a note, a procurement', () => {
    expect(brandsWith1811(hubBrands())).toBeNull()
    const own = { ...hubBrands(), note: 'Nota z panelu.' }
    expect(brandsWith1811({ ...own, network: null })).toMatchObject({ note: 'Nota z panelu.' })
    expect(homeWith1811(hubHome())).toBeNull()
    expect(homeWith1811(null)).toBeNull()
  })

  it('adds the procurement to a home stored before the round — still valid', () => {
    const older = { ...hubHome(), procurement: undefined }
    expect(homeSchema.safeParse(homeWith1811(older)).success).toBe(true)
  })

  it('adds only the missing facts, never changes an approval', () => {
    const stored = [{ value: 'ALSEN', label: 'x', approved: false, id: 'a' }]
    const next = trustWith1811(stored)!
    expect(next[0]).toEqual(stored[0])
    expect(next.map((row) => row.value)).toEqual(['ALSEN', 'ALSEN 350+', 'ALSEN Rabka'])
    expect(trustWith1811(next)).toBeNull()
  })

  it('puts „Zamówienia” after „Współpraca” in the rail, once', () => {
    const rail = [
      { anchorId: 'wspolpraca', label: 'W' },
      { anchorId: 'marki', label: 'M' },
    ]
    const next = railWith1811(rail)!
    expect(next.map((row) => row.anchorId)).toEqual(['wspolpraca', 'zamowienia', 'marki'])
    expect(railWith1811(next)).toBeNull()
    expect(railWith1811([])).toBeNull()
  })
})

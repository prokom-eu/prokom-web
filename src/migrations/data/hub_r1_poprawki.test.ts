import { describe, expect, it } from 'vitest'

import { hubTrust } from '../../seed/prokom/map'
import { INSTALACJE_SHARED } from '../../seed/shared/instalacje'
import { PROKOM_EXTRA_EMAILS } from '../../seed/shared/prokom'
import { EXTRA_EMAILS_1811, TRUST_1811 } from './hub_r1_tresc'
import { extraEmailsWith1911, instRailWith1911, trustWith1911 } from './hub_r1_poprawki'

describe('hub_r1_poprawki (19.11 follow-up for production)', () => {
  it('brings the data of the round to the package of this commit', () => {
    const pkg = hubTrust()
    const trust = trustWith1911(TRUST_1811)
    expect(trust).not.toBeNull()
    for (const row of trust ?? []) expect(pkg).toContainEqual(row)
    expect(extraEmailsWith1911(EXTRA_EMAILS_1811)).toEqual(PROKOM_EXTRA_EMAILS)
    const rail = INSTALACJE_SHARED.rail?.sections ?? []
    expect(instRailWith1911(rail)).toBeNull()
    // The package has „Sprzęt” right after „Usługi” — where the migration puts it.
    const at = rail.findIndex((row) => row.anchorId === 'uslugi')
    expect(rail[at + 1]?.anchorId).toBe('sprzet')
  })

  it('approves only the two ALSEN facts and changes nothing once approved', () => {
    const stored = [
      { value: 'Od 2004', label: 'a', approved: false, id: '1' },
      { value: 'ALSEN 350+', label: 'b', approved: false, id: '2' },
      { value: 'ALSEN Rabka', label: 'c', approved: null, id: '3' },
    ]
    const next = trustWith1911(stored)
    expect(next?.map((row) => row.approved)).toEqual([false, true, true])
    expect(next?.map((row) => row.id)).toEqual(['1', '2', '3'])
    expect(trustWith1911(next)).toBeNull()
    expect(trustWith1911(null)).toBeNull()
  })

  it('replaces the dead mailbox and keeps the label from the panel', () => {
    const stored = [
      { label: 'Biuro', email: 'biuro@pro-kom.eu', published: true, id: 'a' },
      { label: 'Sklep', email: 'sklep@pro-kom.pl', published: false, id: 'b' },
    ]
    expect(extraEmailsWith1911(stored)).toEqual([
      stored[0],
      { label: 'Sklep', email: 'sklep@pro-kom.eu', published: true, id: 'b' },
    ])
    expect(extraEmailsWith1911(extraEmailsWith1911(stored))).toBeNull()
    expect(extraEmailsWith1911([])).toEqual([
      { label: 'Zamówienia', email: 'sklep@pro-kom.eu', published: true },
    ])
  })

  it('puts „Sprzęt” after „Usługi” only while missing', () => {
    const rail = [{ anchorId: 'start' }, { anchorId: 'uslugi' }, { anchorId: 'faq' }]
    expect(instRailWith1911(rail)?.map((row) => row.anchorId)).toEqual([
      'start',
      'uslugi',
      'sprzet',
      'faq',
    ])
    expect(instRailWith1911(instRailWith1911(rail))).toBeNull()
    expect(instRailWith1911([])).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'

import { homeSchema } from '../../lib/prokom/home'
import { hubHome } from '../../seed/prokom/map'
import { PROKOM_SHARED } from '../../seed/shared/prokom'
import { homeWithNetwork, NETWORK_HOME_1911, railWithAlsen } from './hub_alsen_sekcja'

describe('hub_alsen_sekcja (ALSEN section for production)', () => {
  it('is a copy of the package of this commit', () => {
    expect(NETWORK_HOME_1911).toEqual(hubHome().network)
    expect(railWithAlsen(PROKOM_SHARED.rail?.sections)).toBeNull()
    const rail = PROKOM_SHARED.rail?.sections ?? []
    const at = rail.findIndex((row) => row.anchorId === 'alsen')
    expect(rail[at + 1]?.anchorId).toBe('wspolpraca')
  })

  it('adds the section to texts stored before it — still valid — and only once', () => {
    const older = { ...hubHome(), network: undefined }
    const next = homeWithNetwork(older)
    expect(homeSchema.safeParse(next).success).toBe(true)
    expect(homeWithNetwork(next)).toBeNull()
    expect(
      homeWithNetwork({ ...hubHome(), network: { ...NETWORK_HOME_1911, title: 'Z panelu' } }),
    ).toBeNull()
    expect(homeWithNetwork(null)).toBeNull()
  })

  it('puts „ALSEN” before „Współpraca” only while missing', () => {
    const rail = [{ anchorId: 'pomoc' }, { anchorId: 'wspolpraca' }]
    expect(railWithAlsen(rail)?.map((row) => row.anchorId)).toEqual([
      'pomoc',
      'alsen',
      'wspolpraca',
    ])
    expect(railWithAlsen(railWithAlsen(rail))).toBeNull()
  })
})

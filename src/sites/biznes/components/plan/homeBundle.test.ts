import { describe, expect, it } from 'vitest'

import { homeBundlesByScene, pickHomeBundle } from './homeBundle'

const card = (slug: string) => ({ slug, name: slug })

describe('pickHomeBundle (B3-1, D8)', () => {
  it('takes the first home bundle, in the panel order, that the scene lists', () => {
    const scene = [card('zestaw-biuro-6-12'), card('zestaw-biuro-3-5')]
    expect(pickHomeBundle(['zestaw-sklep-kasa-start', 'zestaw-biuro-3-5'], scene)?.slug).toBe(
      'zestaw-biuro-3-5',
    )
  })

  it('no card when the scene has none of the home bundles (or no ready bundle at all)', () => {
    expect(pickHomeBundle(['zestaw-biuro-3-5'], [card('zestaw-gabinet')])).toBeNull()
    expect(pickHomeBundle(['zestaw-biuro-3-5'], [])).toBeNull()
    expect(pickHomeBundle([], [card('zestaw-biuro-3-5')])).toBeNull()
  })
})

describe('homeBundlesByScene', () => {
  it('maps the scenes with a home bundle; the others get no entry', () => {
    const home = ['zestaw-sklep-kasa-start', 'zestaw-kawiarnia-lada', 'zestaw-biuro-3-5']
    expect(
      homeBundlesByScene(home, {
        sklep: [card('zestaw-sklep-spozywczy-kasa-waga'), card('zestaw-sklep-kasa-start')],
        // „Do sprawdzenia” bundles never reach this list (`loadFloorPlan` keeps „Gotowe”).
        gastro: [],
        warsztat: [card('zestaw-biuro-3-5'), card('zestaw-wifi-omada')],
        apteka: [],
      }),
    ).toEqual({ sklep: card('zestaw-sklep-kasa-start'), warsztat: card('zestaw-biuro-3-5') })
  })
})

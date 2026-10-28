import { describe, expect, it } from 'vitest'

import { OBJECT_KEYS, SERVICE_KEYS } from '../../lib/instalacje/options'
import { cleanPrototype, navigationData } from './dane'

describe('cleanPrototype', () => {
  it('drops UI state and drawings, keeps the content', () => {
    expect(
      cleanPrototype({
        n: 'Kopułkowa',
        cls: 'typb on',
        railCls: 'x',
        on: 'true',
        open: true,
        pick: 1,
        go: null,
        tch: false,
        cur: 'page',
        exp: 'false',
        hs: '--mh:#12B6D8',
        art: '[svg-path]',
        items: [{ n: 'a', cls: '' }, '[svg-path]', 'b'],
      }),
    ).toEqual({ n: 'Kopułkowa', items: [{ n: 'a' }, 'b'] })
  })

  it('maps links, photos and icons to their public form', () => {
    expect(
      cleanPrototype({
        href: 'Zaplanuj.dc.html#obiekt=dom',
        ic: 'ikona:cam',
        src: 'ev/home.webp',
        other: 'monitoring.html',
      }),
    ).toEqual({
      href: '/zaplanuj#obiekt=dom',
      ic: 'cam',
      src: '/instalacje/ev/home.webp',
      other: '/monitoring',
    })
  })
})

describe('navigationData', () => {
  const nav = navigationData()

  it('lists every service and object exactly once, in menu columns', () => {
    expect(nav.serviceColumns.map((c) => c.label)).toEqual([
      'Bezpieczeństwo',
      'Sieci i technika',
      'Komfort i obraz',
    ])
    expect(nav.serviceColumns.flatMap((c) => c.keys).sort()).toEqual(
      SERVICE_KEYS.map((k) => k.value).sort(),
    )
    expect(nav.objectColumns.flatMap((c) => c.keys).sort()).toEqual(
      OBJECT_KEYS.map((k) => k.value).sort(),
    )
  })

  it('builds the phone bottom bar: Start, Usługi, Zaplanuj (featured), Dla kogo, Więcej', () => {
    expect(nav.bottomBar.map((b) => b.label)).toEqual([
      'Start',
      'Usługi',
      'Zaplanuj',
      'Dla kogo',
      'Więcej',
    ])
    expect(nav.bottomBar[0]).toMatchObject({ href: '/', featured: false })
    expect(nav.bottomBar[1]).toMatchObject({ sheet: 'services' })
    expect(nav.bottomBar[2]).toMatchObject({ href: '/zaplanuj', featured: true })
    expect(nav.bottomBar[4]).toMatchObject({ sheet: 'more' })
    expect(nav.sheetTabs).toEqual({ services: 'Usługi', objects: 'Dla kogo', more: 'Więcej' })
  })

  it('links „Więcej” and the CTA to public addresses', () => {
    expect(nav.more.map((m) => m.href)).toEqual([
      '/realizacje',
      '/serwis',
      '/poradnik',
      '/o-firmie',
      '/kontakt',
      '/uslugi',
    ])
    expect(nav.cta).toEqual({ label: 'Zaplanuj instalację · 2 minuty', href: '/zaplanuj' })
  })
})

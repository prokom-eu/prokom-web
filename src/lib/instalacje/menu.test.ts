import { describe, expect, it } from 'vitest'

import { navigation } from '@/sites/instalacje/dane/nawigacja'

import { activeSection, buildMenu, type MenuDoc } from './menu'

const service = (key: string, slug: string | null = key): MenuDoc => ({
  key,
  slug,
  name: `Usługa ${key}`,
  icon: 'cam',
  color: '#12b6d8',
  menuCaption: `Podpis ${key}`,
})

const allServices = navigation.serviceColumns.flatMap((c) => c.keys).map((k) => service(k))
const allObjects = navigation.objectColumns.flatMap((c) => c.keys).map((k) => service(k))

describe('buildMenu', () => {
  it('orders the panel entries by the columns of the code layout', () => {
    const { menu, missing } = buildMenu(navigation, [...allServices].reverse(), allObjects, {
      areas: 10,
      solutions: 76,
    })
    expect(missing).toEqual([])
    expect(menu.services.map((c) => c.label)).toEqual([
      'Bezpieczeństwo',
      'Sieci i technika',
      'Komfort i obraz',
    ])
    expect(menu.services[0]?.items.map((i) => i.key)).toEqual(['kam', 'alarm', 'kd'])
    expect(menu.services[0]?.items[0]).toEqual({
      key: 'kam',
      label: 'Usługa kam',
      caption: 'Podpis kam',
      icon: 'cam',
      color: '#12b6d8',
      href: '/kam',
    })
    expect(menu.offer).toEqual({ areas: 10, solutions: 76 })
  })

  it('links objects under /dla-kogo/', () => {
    const { menu } = buildMenu(navigation, allServices, allObjects, { areas: 0, solutions: 0 })
    expect(menu.objects[0]?.items[0]?.href).toBe('/dla-kogo/dom')
  })

  it('leaves out keys the panel has not published (or without an address) and reports them', () => {
    const services = allServices.filter((s) => s.key !== 'ev')
    const objects = allObjects.map((o) => (o.key === 'bud' ? { ...o, slug: null } : o))
    const { menu, missing } = buildMenu(navigation, services, objects, { areas: 0, solutions: 0 })
    expect(menu.services.flatMap((c) => c.items).map((i) => i.key)).not.toContain('ev')
    expect(menu.objects.flatMap((c) => c.items).map((i) => i.key)).not.toContain('bud')
    expect(missing).toEqual(['service:ev', 'object:bud'])
  })

  it('drops a column left empty', () => {
    const services = allServices.filter((s) => !['smart', 'snd', 'scr'].includes(s.key))
    const { menu } = buildMenu(navigation, services, allObjects, { areas: 0, solutions: 0 })
    expect(menu.services.map((c) => c.label)).not.toContain('Komfort i obraz')
  })
})

describe('activeSection', () => {
  const { menu } = buildMenu(navigation, allServices, allObjects, { areas: 0, solutions: 0 })

  it('knows the start page, services and objects', () => {
    expect(activeSection('/', menu, navigation)).toEqual({ tab: 'home', header: null })
    expect(activeSection('/kam', menu, navigation)).toEqual({ tab: 'services', header: 'services' })
    expect(activeSection('/uslugi', menu, navigation)).toEqual({
      tab: 'services',
      header: 'services',
    })
    expect(activeSection('/dla-kogo/dom', menu, navigation)).toEqual({
      tab: 'objects',
      header: 'objects',
    })
  })

  it('puts the other pages under „Więcej” and marks their header link', () => {
    expect(activeSection('/realizacje', menu, navigation)).toEqual({
      tab: 'more',
      header: '/realizacje',
    })
    expect(activeSection('/poradnik/monitoring-a-rodo', menu, navigation)).toEqual({
      tab: 'more',
      header: '/poradnik',
    })
    expect(activeSection('/dla-architektow', menu, navigation)).toEqual({
      tab: 'more',
      header: '/dla-architektow',
    })
  })

  it('has no section for other addresses (planner, legal pages, 404)', () => {
    expect(activeSection('/zaplanuj', menu, navigation)).toEqual({ tab: null, header: null })
    expect(activeSection('/nie-ma-takiej', menu, navigation)).toEqual({ tab: null, header: null })
  })
})

import { describe, expect, it } from 'vitest'

import type { LineSearchEntry } from '@/lib/shared/search/lineProvider'

import { buildInstSearchProvider, INST_SEARCH_POPULAR } from './searchProvider'

const entry = (over: Partial<LineSearchEntry> & Pick<LineSearchEntry, 'id'>): LineSearchEntry => ({
  title: over.id,
  href: '/',
  group: 'Strony',
  ...over,
})

const ENTRIES: LineSearchEntry[] = [
  entry({
    id: 'usluga-kam',
    title: 'Monitoring i kamery',
    href: '/monitoring',
    icon: 'monitor',
    group: 'Usługi',
  }),
  entry({
    id: 'usluga-wifi',
    title: 'Sieci i Wi-Fi',
    href: '/sieci-wifi',
    icon: 'server',
    group: 'Usługi',
  }),
  entry({
    id: 'usluga-ev',
    title: 'Ładowarki',
    href: '/ladowarki-ev',
    icon: 'bolt',
    group: 'Usługi',
  }),
  entry({ id: 'r1', title: 'Kamera na parking', href: '/monitoring', group: 'Rozwiązania' }),
  entry({ id: 'r2', title: 'Rejestrator', href: '/monitoring', group: 'Rozwiązania' }),
  entry({ id: 'r3', title: 'Kamera PTZ', href: '/monitoring', group: 'Rozwiązania' }),
  entry({ id: 'r4', title: 'Wi-Fi w pokojach', href: '/sieci-wifi', group: 'Rozwiązania' }),
  entry({ id: 'p1', title: 'Kamery w pensjonacie', href: '/poradnik/kamery', group: 'Poradnik' }),
]

describe('buildInstSearchProvider', () => {
  it('shows the services as shortcuts with their icon and number of solutions', () => {
    const [group] = buildInstSearchProvider(ENTRIES).empty()
    expect(group?.title).toBe('Na skróty')
    expect(group?.results.map((result) => [result.title, result.hint, result.icon])).toEqual([
      ['Monitoring i kamery', '3 rozwiązania', 'monitor'],
      ['Sieci i Wi-Fi', '1 rozwiązanie', 'server'],
      // No solutions in the index: the service's own hint stays.
      ['Ładowarki', null, 'bolt'],
    ])
  })

  it('adds the panel links after the services', () => {
    const [group] = buildInstSearchProvider(ENTRIES, {
      shortcuts: [{ label: 'Serwis i przeglądy', href: '/serwis' }],
    }).empty()
    expect(group?.results.at(-1)).toMatchObject({ title: 'Serwis i przeglądy', href: '/serwis' })
  })

  it('has no shortcuts before the index arrives', () => {
    expect(buildInstSearchProvider([]).empty()).toEqual([])
  })

  it('takes the popular phrases from the panel, or the line defaults when the panel has none', () => {
    expect(buildInstSearchProvider(ENTRIES, { popular: ['domofon'] }).popular).toEqual(['domofon'])
    expect(buildInstSearchProvider(ENTRIES, { popular: [] }).popular).toEqual(INST_SEARCH_POPULAR)
  })

  it('searches like the shared line provider', () => {
    const groups = buildInstSearchProvider(ENTRIES).query('kamera')
    expect(groups.flatMap((group) => group.results.map((result) => result.id))).toContain('r1')
  })
})

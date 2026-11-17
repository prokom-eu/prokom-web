import { describe, expect, it } from 'vitest'

import type { HubSearchEntry } from './searchQuery'
import { buildHubSearchProvider, HUB_SEARCH_POPULAR } from './searchProvider'

const entry = (over: Partial<HubSearchEntry> & Pick<HubSearchEntry, 'id' | 'kind' | 'line'>) =>
  ({
    title: over.id,
    href: `/${over.id}`,
    group: 'Usługi',
    ...over,
  }) as HubSearchEntry

const index: HubSearchEntry[] = [
  entry({
    id: 'line-biznes',
    kind: 'line',
    line: 'biznes',
    title: 'PRO-KOM Biznes',
    group: 'Linie',
    href: 'https://prokombiznes.pl',
  }),
  entry({
    id: 'line-software',
    kind: 'line',
    line: 'software',
    title: 'PRO-KOM Software',
    group: 'Linie',
    href: 'https://prokomsoftware.pl',
  }),
  entry({ id: 'service-kasy', kind: 'service', line: 'biznes' }),
  entry({ id: 'service-it', kind: 'service', line: 'biznes' }),
  entry({ id: 'service-www', kind: 'service', line: 'software' }),
  entry({ id: 'page-kontakt', kind: 'page', line: 'prokom', group: 'Strony pro-kom.eu' }),
]

describe('buildHubSearchProvider — the window of pro-kom.eu like Biznes (17.11)', () => {
  it('shows the lines under „Na skróty” with their icon and number of services', () => {
    const [group] = buildHubSearchProvider(index).empty()
    expect(group?.title).toBe('Na skróty')
    expect(group?.results.map((r) => [r.title, r.hint, r.icon])).toEqual([
      ['PRO-KOM Biznes', '2 usługi', 'pc'],
      ['PRO-KOM Software', '1 usługa', 'site'],
    ])
  })

  it('adds the panel links after the lines, none before the index arrives', () => {
    const links = [{ label: 'Kontakt', href: '/kontakt' }]
    const full = buildHubSearchProvider(index, { shortcuts: links }).empty()
    expect(full[0]?.results.at(-1)).toMatchObject({ title: 'Kontakt', href: '/kontakt' })
    expect(buildHubSearchProvider([], { shortcuts: links }).empty()).toEqual([])
  })

  it('falls back to its own popular phrases, the panel list wins', () => {
    expect(buildHubSearchProvider(index).popular).toEqual(HUB_SEARCH_POPULAR)
    expect(buildHubSearchProvider(index, { popular: ['kasa'] }).popular).toEqual(['kasa'])
  })

  it('still searches the whole index', () => {
    const groups = buildHubSearchProvider(index).query('software')
    expect(groups.flatMap((g) => g.results.map((r) => r.id))).toContain('line-software')
  })
})

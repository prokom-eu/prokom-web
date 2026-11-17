import { plural } from '@/lib/plural'
import type { IconName } from '@/lib/shared/icons'
import { buildLineProvider, type LineSearchSettings } from '@/lib/shared/search/lineProvider'
import type { SearchGroup, SearchProvider, SearchResult } from '@/lib/shared/search/provider'

import type { HubSearchEntry } from './searchQuery'

/**
 * „Najczęściej szukane” of pro-kom.eu when the panel has none (`shared.rail.searchPopular`):
 * phrases that find a line, a service or a help case in the hub's index. The panel's list wins.
 */
export const HUB_SEARCH_POPULAR: readonly string[] = [
  'kasa fiskalna',
  'KSeF',
  'monitoring',
  'naprawa telefonu',
  'strona internetowa',
  'komputer do gier',
  'opieka IT',
  'Wi-Fi',
]

/** The picture of each line in „Na skróty” (the hub's line icons, illustration only). */
const LINE_ICONS: Record<string, IconName> = {
  biznes: 'pc',
  instalacje: 'camera',
  software: 'site',
  tech: 'wrench',
  gaming: 'gamepad',
}

const servicesLabel = (count: number) => `${count} ${plural(count, ['usługa', 'usługi', 'usług'])}`

/**
 * The search window's provider of pro-kom.eu (Krystian 16.11: „premium jak na Biznesie”): the
 * shared line provider (typos, synonyms, groups) with the empty state of Biznes and Instalacje —
 * „Na skróty” lists the five lines (their icon and number of services in the index), then the
 * panel's links; the popular phrases fall back to `HUB_SEARCH_POPULAR`.
 */
export function buildHubSearchProvider(
  entries: readonly HubSearchEntry[],
  settings: LineSearchSettings = {},
): SearchProvider {
  const base = buildLineProvider(entries, { ...settings, shortcuts: [] })
  const services = new Map<string, number>()
  for (const entry of entries) {
    if (entry.kind === 'service') services.set(entry.line, (services.get(entry.line) ?? 0) + 1)
  }
  const lines = entries
    .filter((entry) => entry.kind === 'line')
    .map((entry): SearchResult => {
      const count = services.get(entry.line) ?? 0
      return {
        id: `shortcut-${entry.id}`,
        title: entry.title,
        hint: count > 0 ? servicesLabel(count) : (entry.hint ?? null),
        href: entry.href,
        icon: LINE_ICONS[entry.line] ?? 'arrow',
      }
    })
  // The panel's links only next to the lines: before the index arrives the window shows none.
  const links: SearchResult[] = lines.length
    ? (settings.shortcuts ?? []).map((link) => ({
        id: `shortcut-${link.href}`,
        title: link.label,
        href: link.href,
        icon: 'arrow',
      }))
    : []
  const shortcuts: SearchGroup[] = lines.length
    ? [{ key: 'shortcuts', title: 'Na skróty', results: [...lines, ...links] }]
    : []

  return {
    ...base,
    popular: settings.popular?.length ? settings.popular : HUB_SEARCH_POPULAR,
    empty: () => shortcuts,
  }
}

import { plural } from '@/lib/plural'
import {
  buildLineProvider,
  type LineSearchEntry,
  type LineSearchSettings,
} from '@/lib/shared/search/lineProvider'
import type { SearchGroup, SearchProvider, SearchResult } from '@/lib/shared/search/provider'

/**
 * „Najczęściej szukane” of Instalacje when the panel has none (`shared.rail.searchPopular`):
 * phrases of the offer that find a service, a solution or a guide post. The panel's list wins.
 */
export const INST_SEARCH_POPULAR: readonly string[] = [
  'kamery',
  'alarm',
  'Wi-Fi w pensjonacie',
  'wideodomofon',
  'kontrola dostępu',
  'smart home',
  'ładowarka EV',
  'przegląd',
]

const solutionsLabel = (count: number) =>
  `${count} ${plural(count, ['rozwiązanie', 'rozwiązania', 'rozwiązań'])}`

/**
 * The search window's provider of prokominstalacje.pl: the shared line provider (typos, synonyms,
 * groups) with the empty state of Biznes — „Na skróty” lists the services (their icon and the
 * number of solutions in the index), then the panel's links; the popular phrases fall back to
 * `INST_SEARCH_POPULAR`.
 */
export function buildInstSearchProvider(
  entries: readonly LineSearchEntry[],
  settings: LineSearchSettings = {},
): SearchProvider {
  const base = buildLineProvider(entries, { ...settings, shortcuts: [] })
  const solutions = new Map<string, number>()
  for (const entry of entries) {
    if (entry.group === 'Rozwiązania')
      solutions.set(entry.href, (solutions.get(entry.href) ?? 0) + 1)
  }
  const services = entries
    .filter((entry) => entry.group === 'Usługi')
    .map((entry): SearchResult => {
      const count = solutions.get(entry.href) ?? 0
      return {
        id: `shortcut-${entry.id}`,
        title: entry.title,
        hint: count > 0 ? solutionsLabel(count) : (entry.hint ?? null),
        href: entry.href,
        icon: entry.icon ?? 'grid',
      }
    })
  // The panel's links only next to the services: before the index arrives the window shows none.
  const links: SearchResult[] = services.length
    ? (settings.shortcuts ?? []).map((link) => ({
        id: `shortcut-${link.href}`,
        title: link.label,
        href: link.href,
        icon: 'arrow',
      }))
    : []
  const shortcuts: SearchGroup[] = services.length
    ? [{ key: 'shortcuts', title: 'Na skróty', results: [...services, ...links] }]
    : []

  return {
    ...base,
    popular: settings.popular?.length ? settings.popular : INST_SEARCH_POPULAR,
    empty: () => shortcuts,
  }
}

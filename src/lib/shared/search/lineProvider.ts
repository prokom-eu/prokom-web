import { prepareItems, searchItems } from './engine'
import { normalizeText } from './normalize'
import type { SearchGroup, SearchProvider, SearchResult } from './provider'

/** One element of a line's search index (spec §5.1): a solution, a service, a page, a question… */
export type LineSearchEntry = SearchResult & {
  /** Title of its group in the results („Rozwiązania”, „Usługi”, „Strony”, „Pytania”). */
  group: string
  /** More words that should find it (description, area, answers). */
  text?: string | null
  /** 0–100: orders equal hits. */
  popularity?: number
}

export type LineSearchSettings = {
  /** Groups of words from the panel (`shared.rail.synonyms`): „kamera, monitoring, CCTV”. */
  synonyms?: readonly string[] | null
  /** „Najczęściej szukane” (`shared.rail.searchPopular`). */
  popular?: readonly string[] | null
  /** „Na skróty” (`shared.rail.searchShortcuts`). */
  shortcuts?: readonly { label: string; href: string }[] | null
}

/** Results per group in the window — the rest is a click on the group's page away. */
export const GROUP_LIMIT = 6

/**
 * Synonym groups as the engine wants them: every word of a group expands to the others
 * („kamera, monitoring” → kamera → [monitoring], monitoring → [kamera]).
 */
export function synonymMap(groups: readonly string[]): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  for (const group of groups) {
    const words = group
      .split(',')
      .map((word) => normalizeText(word))
      .filter(Boolean)
    for (const word of words) {
      map[word] = [...new Set([...(map[word] ?? []), ...words.filter((other) => other !== word)])]
    }
  }
  return map
}

/**
 * A provider for `SearchDialog` over a line's index: the shared engine (typos, synonyms, no Polish
 * letters), results grouped in index order, at most `GROUP_LIMIT` per group.
 */
export function buildLineProvider(
  entries: readonly LineSearchEntry[],
  settings: LineSearchSettings = {},
): SearchProvider {
  const prepared = prepareItems(
    entries.map((entry) => ({
      item: entry,
      name: entry.title,
      hay: normalizeText([entry.title, entry.hint, entry.text].filter(Boolean).join(' ')),
      popularity: entry.popularity,
    })),
    { synonyms: synonymMap(settings.synonyms ?? []), stopWords: [] },
  )
  const shortcuts: SearchGroup[] = settings.shortcuts?.length
    ? [
        {
          key: 'shortcuts',
          title: 'Na skróty',
          results: settings.shortcuts.map((link) => ({
            id: `shortcut-${link.href}`,
            title: link.label,
            href: link.href,
            icon: 'arrow',
          })),
        },
      ]
    : []

  return {
    popular: settings.popular ?? [],
    empty: () => shortcuts,
    query(q) {
      const found = searchItems(prepared, q) ?? []
      const groups = new Map<string, SearchResult[]>()
      for (const entry of found) {
        const list = groups.get(entry.group) ?? []
        if (list.length < GROUP_LIMIT) list.push(entry)
        groups.set(entry.group, list)
      }
      return [...groups].map(([title, results]) => ({ key: normalizeText(title), title, results }))
    },
  }
}

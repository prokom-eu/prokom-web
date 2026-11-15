import { prepareItems, searchItems } from '@/lib/shared/search/engine'
import { type LineSearchEntry, synonymMap } from '@/lib/shared/search/lineProvider'
import { normalizeText } from '@/lib/shared/search/normalize'

import type { HubLine } from './lines'

/*
 * Querying the hub's search index — what the browser needs (the hero's suggestions) and `/szukaj`
 * on the server. Kept apart from building the index (`searchIndex.ts`), so the client bundle does
 * not carry the builder and its dependencies.
 */

export type HubSearchKind = 'line' | 'service' | 'tool' | 'help' | 'page'

export type HubSearchEntry = LineSearchEntry & {
  kind: HubSearchKind
  /** The line of the entry; `prokom` for the hub's own pages. */
  line: HubLine | 'prokom'
}

/** Group titles of the window and of `/szukaj` (board Szukaj, Naglowek). */
export const HUB_GROUPS: Record<HubSearchKind, string> = {
  service: 'Usługi',
  tool: 'Załatw online',
  help: 'Pomoc',
  page: 'Strony pro-kom.eu',
  line: 'Linie',
}

export type HubSearchFilter = 'wszystko' | HubLine | 'strony'

const PAGE_LIMITS: Partial<Record<HubSearchKind, number>> = {
  service: 12,
  tool: 6,
  help: 6,
  page: 6,
  line: 5,
}
const GROUP_ORDER: readonly HubSearchKind[] = ['service', 'tool', 'help', 'page', 'line']

export type HubSearchPage = {
  query: string
  /** Hits of the chosen filter. */
  total: number
  /** Hits per filter, for the tabs (counted on all hits). */
  counts: Record<string, number>
  /** „Najlepsze dopasowanie”: the first service, else the first tool, else the first hit. */
  best: HubSearchEntry | null
  groups: { kind: HubSearchKind; title: string; results: HubSearchEntry[] }[]
}

/** Results of `/szukaj?q=&linia=` on the server — the same engine and synonyms as the window. */
export function searchHub(
  index: readonly HubSearchEntry[],
  query: string,
  filter: HubSearchFilter,
  synonyms: readonly string[] = [],
): HubSearchPage {
  const prepared = prepareItems(
    index.map((item) => ({
      item,
      name: item.title,
      hay: normalizeText([item.title, item.hint, item.text].filter(Boolean).join(' ')),
      popularity: item.popularity,
    })),
    { synonyms: synonymMap(synonyms), stopWords: [] },
  )
  const found = searchItems(prepared, query) ?? []
  const counts: Record<string, number> = { wszystko: found.length, strony: 0 }
  for (const hit of found) {
    const key = hit.kind === 'page' ? 'strony' : hit.line
    counts[key] = (counts[key] ?? 0) + 1
  }
  const chosen = found.filter((hit) =>
    filter === 'wszystko' ? true : filter === 'strony' ? hit.kind === 'page' : hit.line === filter,
  )
  const best =
    chosen.find((hit) => hit.kind === 'service') ??
    chosen.find((hit) => hit.kind === 'tool') ??
    chosen[0] ??
    null
  const rest = chosen.filter((hit) => hit !== best)
  const groups = GROUP_ORDER.map((kind) => ({
    kind,
    title: HUB_GROUPS[kind],
    results: rest.filter((hit) => hit.kind === kind).slice(0, PAGE_LIMITS[kind]),
  })).filter((group) => group.results.length > 0)
  return { query: query.trim(), total: chosen.length, counts, best, groups }
}

/** Hits of the hero's live suggestions; `loose` when they match some words of the phrase only. */
export type HubSuggestions = { results: HubSearchEntry[]; loose: boolean }

/**
 * Live suggestions of the hero's search (Krystian 15.11): the hits of `/szukaj` (the same engine and
 * synonyms), best first. A phrase with few hits as a whole („kamery do pensjonatu”) is topped up
 * from its words of three letters or more, ranked by how many of them each entry matches.
 */
export function suggestHub(
  index: readonly HubSearchEntry[],
  query: string,
  synonyms: readonly string[] = [],
  limit = 6,
): HubSuggestions {
  const flat = (page: HubSearchPage) =>
    [page.best, ...page.groups.flatMap((group) => group.results)].filter(
      (hit): hit is HubSearchEntry => hit !== null,
    )
  const whole = flat(searchHub(index, query, 'wszystko', synonyms))
  if (whole.length >= limit) return { results: whole.slice(0, limit), loose: false }
  const words = [...new Set(normalizeText(query).split(/\s+/))].filter((word) => word.length >= 3)
  if (words.length < 2) return { results: whole, loose: false }
  const score = new Map<HubSearchEntry, { hits: number; first: number }>()
  let order = 0
  for (const word of words) {
    for (const hit of flat(searchHub(index, word, 'wszystko', synonyms))) {
      const seen = score.get(hit)
      if (seen) seen.hits += 1
      else score.set(hit, { hits: 1, first: order++ })
    }
  }
  const results = [...score.entries()]
    .sort(([, a], [, b]) => b.hits - a.hits || a.first - b.first)
    .map(([hit]) => hit)
  // The whole phrase first; its few hits topped up with the closest ones by words.
  const merged = [...whole, ...results.filter((hit) => !whole.includes(hit))]
  return { results: merged.slice(0, limit), loose: whole.length === 0 && merged.length > 0 }
}

/*
 * Search index of pro-kom.eu (spec §5.6, ADR-H002 §4): the lines, their services (`HubServices`,
 * with `keywords`), the tools of „Załatw online”, the help situations and the hub pages. One index
 * for the search window (`buildLineProvider`) and the results page `/szukaj` (`searchHub`). Every
 * link goes to a page that exists — a page of v1.1 that is off falls back to the line's site.
 */
import type { SearchResult } from '@/lib/shared/search/provider'
import { contactWithPhrase } from '@/lib/shared/search/provider'
import { prepareItems, searchItems } from '@/lib/shared/search/engine'
import { type LineSearchEntry, synonymMap } from '@/lib/shared/search/lineProvider'
import { normalizeText } from '@/lib/shared/search/normalize'
import type { SharedLine } from '@/lib/shared/project'

import type { HubHelpView, HubServiceView, HubToolView } from './data'
import { iconForService } from './icons'
import { type HubLine, isHubLine } from './lines'
import { type HubPageFlags, isHubLinkLive } from './pages'

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

const CONTACT_PATH = '/kontakt'

/** Pages of the hub with their search words (board Szukaj, `pages`); off pages are left out. */
export const HUB_SEARCH_PAGES: readonly {
  title: string
  hint: string
  href: string
  words: string
}[] = [
  {
    title: 'Dla firm',
    hint: 'Plan dla Twojej branży: kasa, IT, obiekt, strona.',
    href: '/dla-firm',
    words: 'firma firmy biznes branza plan restauracja hotel sklep biuro',
  },
  {
    title: 'Dla domu',
    hint: 'Instalacje, naprawy i komputer do gier dla domu.',
    href: '/dla-domu',
    words: 'dom domu mieszkanie rodzina smart home',
  },
  {
    title: 'Inwestycje i większe dostawy',
    hint: 'Sprzęt IT, RTV i AGD dla firm, instytucji, hoteli, inwestorów i deweloperów.',
    href: '/inwestycje-i-dostawy',
    words:
      'dostawy dostawa hurt hurtowo wieksze zamowienie inwestor inwestycja deweloper hotel pensjonat apartamenty szkola urzad przetarg rtv agd telewizory lodowki komputery laptopy',
  },
  {
    title: 'Współpraca',
    hint: 'Architekci, deweloperzy, wykonawcy, instytucje i dostawcy.',
    href: '/wspolpraca',
    words: 'architekt deweloper wykonawca instytucja szkola urzad przetarg dostawca wspolpraca',
  },
  {
    title: 'Załatw online',
    hint: 'Zgłoszenia, statusy, wyceny i konfiguratory.',
    href: '/zalatw-online',
    words: 'online narzedzia zgloszenie status wycena konfigurator formularz',
  },
  {
    title: 'Co zrobić, gdy…',
    hint: 'Pierwsze kroki, zanim zadzwonisz.',
    href: '/pomoc',
    words: 'pomoc awaria nie dziala problem zepsulo',
  },
  {
    title: 'Cała oferta',
    hint: 'Wszystkie usługi linii PRO-KOM w jednym miejscu.',
    href: '/linie',
    words: 'oferta uslugi linie wszystko katalog',
  },
  {
    title: 'O firmie',
    hint: 'Kim jesteśmy, od kiedy i jak pracujemy.',
    href: '/o-firmie',
    words: 'o firmie historia od 2004 dane nip kim jestesmy',
  },
  {
    title: 'Kontakt',
    hint: 'Numery linii, adres salonu i formularz.',
    href: '/kontakt',
    words: 'kontakt telefon adres mail email godziny dojazd salon',
  },
  {
    title: 'Gdzie działamy',
    hint: 'Dojazd na Podhalu i w Małopolsce, zdalnie w całej Polsce.',
    href: '/gdzie-dzialamy',
    words: 'zasieg dojazd zakopane nowy targ limanowa podhale malopolska',
  },
  {
    title: 'Marki i autoryzacje',
    hint: 'Posnet, Elzab, GoPOS, InsERT i marki, z którymi pracujemy.',
    href: '/partnerzy',
    words: 'marki autoryzacje partner posnet elzab gopos insert',
  },
  {
    title: 'Aktualności',
    hint: 'Wpisy ze wszystkich linii.',
    href: '/aktualnosci',
    words: 'aktualnosci nowosci blog wpisy',
  },
]

type IndexInput = {
  lines: readonly SharedLine[]
  services: readonly HubServiceView[]
  tools: readonly HubToolView[]
  help: readonly HubHelpView[]
  flags: HubPageFlags
}

/**
 * Popularity orders equal hits (the engine adds at most 0.5): services first (board Szukaj gives
 * them +0.5), then lines, tools, help, pages.
 */
const POPULARITY: Record<HubSearchKind, number> = {
  service: 100,
  line: 80,
  tool: 60,
  help: 40,
  page: 20,
}

export function buildHubSearchIndex({
  lines,
  services,
  tools,
  help,
  flags,
}: IndexInput): HubSearchEntry[] {
  const hubLines = lines.filter((line) => isHubLine(line.key))
  const lineUrl = new Map(hubLines.map((line) => [line.key, line.url]))
  const lineName = new Map(hubLines.map((line) => [line.key, line.name]))
  const live = (href: string | null | undefined) =>
    href && isHubLinkLive(href, flags) ? href : null
  // A line without a site (or an unpublished one) leads to contact with the phrase.
  const lineHref = (line: HubLine, title: string) =>
    lineUrl.get(line) ?? contactWithPhrase(CONTACT_PATH, title)
  const tag = (line: HubLine) => `PRO-KOM ${lineName.get(line) ?? line}`

  const entry = (
    kind: HubSearchKind,
    line: HubLine | 'prokom',
    result: SearchResult & { text?: string | null },
  ): HubSearchEntry => ({
    ...result,
    kind,
    line,
    group: HUB_GROUPS[kind],
    popularity: POPULARITY[kind],
  })

  const published = new Set(hubLines.map((line) => line.key))
  return [
    ...hubLines.map((line) =>
      entry('line', line.key as HubLine, {
        id: `line-${line.key}`,
        title: `PRO-KOM ${line.name}`,
        hint: line.description ?? line.domain ?? undefined,
        href: line.url ?? contactWithPhrase(CONTACT_PATH, line.name),
        icon: 'arrow',
        text: [line.domain, line.descriptionLong].filter(Boolean).join(' '),
      }),
    ),
    ...services
      .filter((service) => published.has(service.line))
      .map((service) =>
        entry('service', service.line, {
          id: `service-${service.key}`,
          title: service.title,
          hint: `${tag(service.line)} · ${service.short}`,
          href: live(service.url) ?? lineHref(service.line, service.title),
          icon: iconForService(service.title),
          text: [service.long, service.includes.join(' '), service.keywords].join(' '),
        }),
      ),
    ...tools
      .filter((tool) => published.has(tool.line))
      .map((tool) =>
        entry('tool', tool.line, {
          id: `tool-${tool.key}`,
          title: tool.title,
          hint: `${tag(tool.line)} · ${tool.desc}`,
          href: live(tool.url) ?? contactWithPhrase(CONTACT_PATH, tool.title),
          icon: iconForService(tool.title),
          text: [tool.inputs.join(' '), tool.result].join(' '),
        }),
      ),
    ...help
      .filter((situation) => published.has(situation.line))
      .map((situation) =>
        entry('help', situation.line, {
          id: `help-${situation.slug}`,
          title: situation.title,
          hint: `${tag(situation.line)} · ${situation.group}`,
          href: live(`/pomoc/${situation.slug}`) ?? lineHref(situation.line, situation.title),
          icon: 'help',
          text: [situation.steps.join(' '), situation.prep.join(' ')].join(' '),
        }),
      ),
    ...HUB_SEARCH_PAGES.filter((page) => isHubLinkLive(page.href, flags)).map((page) =>
      entry('page', 'prokom', {
        id: `page-${page.href}`,
        title: page.title,
        hint: page.hint,
        href: page.href,
        icon: 'doc',
        text: page.words,
      }),
    ),
  ]
}

/** Filter of `/szukaj`: all, one line, or the hub's pages. */
export type HubSearchFilter = 'wszystko' | HubLine | 'strony'

export function parseFilter(value: unknown): HubSearchFilter {
  return value === 'strony' || isHubLine(value) ? value : 'wszystko'
}

/** How many entries each group of `/szukaj` shows (board Szukaj). */
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

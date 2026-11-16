import { plural } from '../plural'
import {
  buildLineProvider,
  type LineSearchEntry,
  type LineSearchSettings,
} from '../shared/search/lineProvider'
import type { SearchProvider, SearchResult } from '../shared/search/provider'
import { cardPrice } from './cardPrice'
import {
  catalogHref,
  DEFAULT_CATALOG_STATE,
  OFFER_GROUPS,
  offerGroup,
  type OfferGroup,
} from './catalog'
import type { SearchExtras } from './searchExtras'
import type { SolutionsIndex } from './solutionsIndex'

/** A page of the site in the search window („Strony”): label, path, an optional second line. */
export type SearchPage = { label: string; href: string; hint?: string | null }

/** Prefixes of result ids: the preview finds the solution or the post behind a result by them. */
export const OFFER_ID = 'oferta:'
export const POST_ID = 'poradnik:'

/** The icon of each offer group — in the results and in „Na skróty”. */
export const OFFER_GROUP_ICONS: Record<OfferGroup, string> = {
  strony: 'site',
  przebudowa: 'refresh',
  systemy: 'panel',
  automatyzacje: 'bolt',
}

type IndexedSolution = SolutionsIndex['solutions'][number]

/** „od 999 zł netto” as one line (the card sets the amount apart; a result row does not). */
export function priceLine(solution: IndexedSolution, display: SolutionsIndex['priceDisplay']) {
  const { head } = cardPrice(solution, display)
  return [head.before, head.amount, head.after].filter(Boolean).join(' ')
}

const groupLabel = (group: OfferGroup) =>
  OFFER_GROUPS.find(({ value }) => value === group)?.label ?? ''

/**
 * The index of the Software search window (ZMIANY-v24 §3.3, „premium jak w Biznesie” 16.11):
 * „Oferta” (a click opens the offer window in the catalog, `?rozwiazanie=`; the row shows the
 * „od” price and the offer group), „Dla branż”, „Poradnik” (the posts), „Miejscowości” and the
 * pages of the site — legal ones too — under „Strony”. Solutions come from
 * `/api/solutions-index`, the rest from `/api/software-search` (both fetched when the window is
 * first needed); before that, only the pages.
 */
export function softwareSearchEntries(
  index: Pick<SolutionsIndex, 'solutions' | 'priceDisplay'> | null,
  pages: readonly SearchPage[],
  extras: SearchExtras | null = null,
): LineSearchEntry[] {
  const display = index?.priceDisplay
  const offer = (index?.solutions ?? []).map((solution): LineSearchEntry => {
    const group = offerGroup(solution)
    return {
      id: `${OFFER_ID}${solution.slug}`,
      group: 'Oferta',
      title: solution.name,
      hint: [display && priceLine(solution, display), groupLabel(group)]
        .filter(Boolean)
        .join(' · '),
      href: `/rozwiazania?rozwiazanie=${solution.slug}`,
      icon: OFFER_GROUP_ICONS[group],
      text: [solution.lead, solution.forWhom, ...solution.features].filter(Boolean).join(' '),
    }
  })
  const industries = (extras?.industries ?? []).map((industry): LineSearchEntry => ({
    id: `branza:${industry.slug}`,
    group: 'Dla branż',
    title: industry.name,
    hint: 'Rozwiązania dla branży',
    href: industry.href,
    icon: 'store',
  }))
  const posts = (extras?.posts ?? []).map((post): LineSearchEntry => ({
    id: `${POST_ID}${post.slug}`,
    group: 'Poradnik',
    title: post.title,
    hint: [post.categoryLabel, `${post.minutes} min czytania`].filter(Boolean).join(' · '),
    href: post.href,
    icon: 'news',
    text: post.lead,
  }))
  const cities = (extras?.cities ?? []).map((city): LineSearchEntry => ({
    id: `miasto:${city.slug}`,
    group: 'Miejscowości',
    title: city.name,
    hint: null,
    href: city.href,
    icon: 'pin',
  }))
  const sitePages = pages.map((page): LineSearchEntry => ({
    id: `strona:${page.href}`,
    group: 'Strony',
    title: page.label,
    hint: page.hint ?? null,
    href: page.href,
    icon: 'doc',
  }))
  return [...offer, ...industries, ...posts, ...cities, ...sitePages]
}

/**
 * Search settings of the window: synonyms and popular phrases of `SoftwareSettings.search` (the
 * panel's word groups as the shared engine wants them) and the shortcuts of `shared.rail` —
 * `softwareSearchProvider` passes none and draws its own „Na skróty” (`softwareShortcuts`).
 */
export function searchSettings(
  index: Pick<SolutionsIndex, 'search'> | null,
  shortcuts: readonly { label: string; href: string }[],
): LineSearchSettings {
  const synonyms = Object.entries(index?.search.synonyms ?? {}).map(([phrase, words]) =>
    [phrase, ...words].join(', '),
  )
  return { synonyms, popular: index?.search.popular ?? [], shortcuts }
}

/** Icons of the panel's shortcuts by their address; any other gets the arrow. */
const SHORTCUT_ICONS: Readonly<Record<string, string>> = {
  '/dobierz': 'target',
  '/cennik': 'cash',
  '/audyt': 'search',
  '/kontakt': 'chat',
}

/**
 * „Na skróty” of the empty window, as Biznes shows its categories: the offer groups with their
 * icon and the number of solutions, „Aktualności” with the number of posts, then the panel's
 * shortcuts (`shared.rail.searchShortcuts`) with icons — one row per address.
 */
export function softwareShortcuts(
  index: Pick<SolutionsIndex, 'solutions'> | null,
  extras: SearchExtras | null,
  shortcuts: readonly { label: string; href: string }[],
): SearchResult[] {
  const counts = new Map<OfferGroup, number>()
  for (const solution of index?.solutions ?? []) {
    const group = offerGroup(solution)
    counts.set(group, (counts.get(group) ?? 0) + 1)
  }
  const groups = OFFER_GROUPS.flatMap(({ value, label }): SearchResult[] => {
    const count = counts.get(value) ?? 0
    if (count === 0) return []
    return [
      {
        id: `grupa:${value}`,
        title: label,
        hint: `${count} ${plural(count, ['rozwiązanie', 'rozwiązania', 'rozwiązań'])}`,
        href: catalogHref({ ...DEFAULT_CATALOG_STATE, category: value }),
        icon: OFFER_GROUP_ICONS[value],
      },
    ]
  })
  const postCount = extras?.posts.length ?? 0
  const news: SearchResult[] =
    postCount > 0
      ? [
          {
            id: 'aktualnosci',
            title: 'Aktualności i poradnik',
            hint: `${postCount} ${plural(postCount, ['wpis', 'wpisy', 'wpisów'])}`,
            href: '/aktualnosci',
            icon: 'news',
          },
        ]
      : []
  const taken = new Set([...groups, ...news].map((result) => result.href))
  const panel = shortcuts
    .filter((link) => !taken.has(link.href))
    .map((link): SearchResult => ({
      id: `shortcut-${link.href}`,
      title: link.label,
      href: link.href,
      icon: SHORTCUT_ICONS[link.href.split(/[?#]/)[0]] ?? 'arrow',
    }))
  return [...groups, ...news, ...panel]
}

/** The provider of the window: the shared engine over the entries, „Na skróty” of Software. */
export function softwareSearchProvider(
  index: SolutionsIndex | null,
  extras: SearchExtras | null,
  pages: readonly SearchPage[],
  shortcuts: readonly { label: string; href: string }[],
): SearchProvider {
  const base = buildLineProvider(
    softwareSearchEntries(index, pages, extras),
    searchSettings(index, []),
  )
  const empty = softwareShortcuts(index, extras, shortcuts)
  return {
    ...base,
    empty: () => (empty.length ? [{ key: 'shortcuts', title: 'Na skróty', results: empty }] : []),
  }
}

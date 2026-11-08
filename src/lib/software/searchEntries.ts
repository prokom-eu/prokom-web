import type { LineSearchEntry, LineSearchSettings } from '../shared/search/lineProvider'
import type { SolutionsIndex } from './solutionsIndex'

/** A page of the site in the search window („Strony”): label, path, an optional second line. */
export type SearchPage = { label: string; href: string; hint?: string | null }

/**
 * The index of the Software search window (ZMIANY-v24 §3.3): the published solutions under
 * „Oferta” (a click opens the offer window in the catalog, `?rozwiazanie=`) and the pages of the
 * site — legal ones too — under „Strony”. Solutions come from `/api/solutions-index` (fetched
 * when the window is first needed); before that, only the pages.
 */
export function softwareSearchEntries(
  index: Pick<SolutionsIndex, 'solutions'> | null,
  pages: readonly SearchPage[],
): LineSearchEntry[] {
  const offer = (index?.solutions ?? []).map((solution): LineSearchEntry => ({
    id: `oferta:${solution.slug}`,
    group: 'Oferta',
    title: solution.name,
    hint: solution.lead ?? null,
    href: `/rozwiazania?rozwiazanie=${solution.slug}`,
    icon: 'site',
    text: solution.features.join(' '),
  }))
  const sitePages = pages.map((page): LineSearchEntry => ({
    id: `strona:${page.href}`,
    group: 'Strony',
    title: page.label,
    hint: page.hint ?? null,
    href: page.href,
    icon: 'doc',
  }))
  return [...offer, ...sitePages]
}

/**
 * Search settings of the window: synonyms and popular phrases of `SoftwareSettings.search` (the
 * panel's word groups as the shared engine wants them) and the shortcuts of `shared.rail`.
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

import type { SoftwareHome } from './home'
import { CATEGORY_AREA } from './options'
import type { IndexSolution } from './solutionsIndex'

/**
 * „12 rzeczy” on the start page (spec. §4 pkt 4, v22): the solutions in the order of
 * `SoftwareSettings.home.popular` — name, lead, price and term are the catalog ones (no separate
 * card fields), a click opens the offer window. Tabs filter by the area key of the category
 * (`www` = strony).
 */

export type PopularTab = { key: string; label: string; count: number }

const ALL = 'all'

/** The cards in order; a slug unpublished in the tenant (or removed) is skipped, never a draft. */
export function popularCards(
  order: SoftwareHome['popular']['order'],
  solutions: readonly IndexSolution[],
): IndexSolution[] {
  const bySlug = new Map(solutions.map((solution) => [solution.slug, solution]))
  return order.flatMap((slug) => {
    const solution = bySlug.get(slug)
    return solution ? [solution] : []
  })
}

export function visibleCards(cards: readonly IndexSolution[], tab: string): IndexSolution[] {
  return tab === ALL ? [...cards] : cards.filter((card) => CATEGORY_AREA[card.category] === tab)
}

/** Tabs with their counts; a tab without cards is dropped (it would show an empty list). */
export function popularTabs(
  tabs: SoftwareHome['popular']['tabs'],
  cards: readonly IndexSolution[],
): PopularTab[] {
  return tabs
    .map(([key, label]) => ({ key, label, count: visibleCards(cards, key).length }))
    .filter((tab) => tab.count > 0)
}

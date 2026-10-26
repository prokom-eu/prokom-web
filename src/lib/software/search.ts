import { prepareItems, searchItems, type PreparedItems } from '../search'
import type { IndexSolution, SolutionsIndex } from './solutionsIndex'

/** Software solutions prepared for the shared search engine (`lib/search.ts`). */
export type PreparedSolutionSearch = PreparedItems<IndexSolution>

/**
 * A solution is found by its name first (weight 3), then by the rest of its card; there is no
 * popularity or group (the catalog keeps the index order on equal hits).
 */
export function prepareSolutionSearch(index: SolutionsIndex): PreparedSolutionSearch {
  return prepareItems(
    index.solutions.map((solution) => ({ item: solution, name: solution.name, hay: solution.hay })),
    index.search,
  )
}

/** Solutions matching every token of the query, best first; `null` for an empty query. */
export function searchSolutions(
  prepared: PreparedSolutionSearch,
  query: string,
): IndexSolution[] | null {
  return searchItems(prepared, query)
}

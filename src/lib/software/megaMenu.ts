import { formatPrice, keepTogether } from './price'
import type { PriceDisplay } from './priceDisplay'
import type { IndexSolution } from './solutionsIndex'

export type MegaItem = {
  label: string
  /** „od 999 zł” for a solution; `null` for a plain link. */
  note: string | null
  href: string
}

export type MegaColumn = { title: string; items: MegaItem[] }

const SOLUTION_PATH = /^\/rozwiazania\/([a-z0-9-]+)$/

/** The short „od” price of a solution, as on the board's mega menu („od 999 zł”). */
function shortPrice(
  solution: Pick<IndexSolution, 'priceFrom' | 'priceMonthly'>,
  display: PriceDisplay,
) {
  if (solution.priceFrom === null) return display.fallback
  if (solution.priceFrom === 0) return '0 zł'
  const pattern = solution.priceMonthly ? display.monthTemplate : display.short
  return keepTogether(pattern.replace('{cena}', formatPrice(solution.priceFrom)))
}

/**
 * Columns of „Oferta ▾” (ZMIANY-v24 §3.2): the panel's links (`navigation.mega.columns`), where a
 * link to `/rozwiazania/<slug>` becomes the published solution — its name, its „od” price from
 * `Solutions` and a link that opens its offer window in the catalog (`?rozwiazanie=`). A solution
 * that is not published is left out (no link to a 404); other links stay as they are.
 */
export function megaColumns(
  columns: readonly { title: string; links: readonly (readonly [string, string])[] }[],
  solutions: readonly IndexSolution[],
  display: PriceDisplay,
): MegaColumn[] {
  const bySlug = new Map(solutions.map((solution) => [solution.slug, solution]))
  return columns
    .map((column) => ({
      title: column.title,
      items: column.links.flatMap(([label, href]): MegaItem[] => {
        const slug = SOLUTION_PATH.exec(href)?.[1]
        if (!slug) return [{ label, note: null, href }]
        const solution = bySlug.get(slug)
        if (!solution) return []
        return [
          {
            label: solution.name,
            note: shortPrice(solution, display),
            href: `/rozwiazania?rozwiazanie=${slug}`,
          },
        ]
      }),
    }))
    .filter((column) => column.items.length > 0)
}

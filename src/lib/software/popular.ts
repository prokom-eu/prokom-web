import type { SoftwareHome } from './home'
import { CATEGORY_AREA, SOLUTION_CATEGORIES, type SolutionCategory } from './options'
import type { IndexSolution } from './solutionsIndex'

/**
 * „12 rzeczy” on the start page (spec. §4 pkt 4): the cards in the order of
 * `SoftwareSettings.home.popular`, a solution card with the fields of its „12 rzeczy” card
 * (`Solutions.featured`) over the catalog ones, and the generic cards (11–12) that lead to a
 * category of the catalog. Tabs filter by the area key of the category (`www` = strony).
 */

export type PopularCard = {
  solution: IndexSolution
  /** Generic card: not one solution, its link goes to the catalog filtered by `href`. */
  generic: boolean
  /** Link of a generic card; a solution card links to its own page. */
  href: string | null
  variants: string[]
}

export type PopularTab = { key: string; label: string; count: number }

const ALL = 'all'

const isCategory = (value: string): value is SolutionCategory =>
  SOLUTION_CATEGORIES.some((category) => category.value === value)

type GenericEntry = Exclude<SoftwareHome['popular']['order'][number], string>

function genericSolution(entry: GenericEntry, category: SolutionCategory): IndexSolution {
  return {
    // Its id in „Twój projekt”; never a slug of `Solutions` (those have no `kategoria-` prefix).
    slug: `kategoria-${category}`,
    name: entry.genericCard,
    category,
    tag: entry.tag,
    lead: entry.lead,
    features: entry.features,
    situations: [],
    industryGroups: [],
    hasLivePreview: false,
    priceMonthly: false,
    priceFrom: null,
    leadTime: null,
    levels: [],
    hay: '',
  }
}

export function popularCards(
  order: SoftwareHome['popular']['order'],
  solutions: readonly IndexSolution[],
): PopularCard[] {
  const bySlug = new Map(solutions.map((solution) => [solution.slug, solution]))
  const cards: PopularCard[] = []
  for (const entry of order) {
    if (typeof entry === 'string') {
      // Unpublished in the tenant (or removed): the card is skipped, never a draft.
      const solution = bySlug.get(entry)
      if (!solution) continue
      const { featured, ...rest } = solution
      cards.push({
        solution: { ...rest, ...featured },
        generic: false,
        href: null,
        variants: [],
      })
    } else if (isCategory(entry.area)) {
      cards.push({
        solution: genericSolution(entry, entry.area),
        generic: true,
        href: entry.href,
        variants: entry.variants,
      })
    }
  }
  return cards
}

const tabOf = (card: PopularCard) => CATEGORY_AREA[card.solution.category]

export function visibleCards(cards: readonly PopularCard[], tab: string): PopularCard[] {
  return tab === ALL ? [...cards] : cards.filter((card) => tabOf(card) === tab)
}

/** Tabs with their counts; a tab without cards is dropped (it would show an empty list). */
export function popularTabs(
  tabs: SoftwareHome['popular']['tabs'],
  cards: readonly PopularCard[],
): PopularTab[] {
  return tabs
    .map(([key, label]) => ({ key, label, count: visibleCards(cards, key).length }))
    .filter((tab) => tab.count > 0)
}

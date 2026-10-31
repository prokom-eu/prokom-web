import type { RailItem } from '@/components/SectionRail'

/**
 * Board v150 (K36 §1, `g4rail` „Na tej stronie”, 12 entries): the sections with an anchor, by
 * the block that renders them — `bzOffer` has the departments and the systems, `bzPlan` „Dla
 * kogo” and the plan, `bzReferences` the reviews.
 */
const RAIL: Record<string, RailItem[]> = {
  bzHero: [{ id: 'start', label: 'Start', icon: 'rocket' }],
  bzOffer: [
    { id: 'oferta', label: 'Działy oferty', icon: 'store' },
    { id: 'systemy', label: 'Systemy i opieka IT', icon: 'server' },
  ],
  // On Biznes the shared Partners block is the brands section (`BrandsHome`).
  partners: [{ id: 'marki', label: 'Marki', icon: 'star' }],
  bzFeatured: [{ id: 'wybierane', label: 'Najczęściej wybierane', icon: 'grid' }],
  bzPlan: [
    { id: 'dla-kogo', label: 'Dla kogo', icon: 'users' },
    { id: 'plan', label: 'Plan Twojej firmy', icon: 'map' },
  ],
  bzSteps: [{ id: 'jak-pracujemy', label: 'Jak pracujemy', icon: 'compass' }],
  bzReferences: [{ id: 'opinie', label: 'Opinie', icon: 'chat' }],
  bzFacts: [{ id: 'fakty', label: 'O firmie', icon: 'doc' }],
  faq: [{ id: 'faq', label: 'Pytania', icon: 'q' }],
  bzContact: [{ id: 'kontakt', label: 'Kontakt', icon: 'phone' }],
}

type Options = {
  /** `SiteSettings.biznes.showReviews` — without it the reviews section is not rendered. */
  reviews: boolean
}

/** Rail entries for the blocks of a Biznes page, in their order, each section once. */
export function railItems(blockTypes: readonly string[], { reviews }: Options): RailItem[] {
  const seen = new Set<string>()
  return blockTypes.flatMap((type) =>
    (RAIL[type] ?? []).filter((item) => {
      if (seen.has(item.id) || (item.id === 'opinie' && !reviews)) return false
      seen.add(item.id)
      return true
    }),
  )
}

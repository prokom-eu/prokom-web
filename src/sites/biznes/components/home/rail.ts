import type { RailItem } from '@/components/SectionRail'

/** Board `Main` (`RAILI`): the sections with an anchor, by the block that renders them. */
const RAIL: Record<string, RailItem> = {
  bzHero: { id: 'start', label: 'Start', icon: 'rocket' },
  bzOffer: { id: 'oferta', label: 'Oferta', icon: 'store' },
  bzPlan: { id: 'plan', label: 'Plan Twojej firmy', icon: 'map' },
  bzSteps: { id: 'jak-pracujemy', label: 'Jak pracujemy', icon: 'compass' },
  bzOnePartner: { id: 'jeden', label: 'Jedna firma czy pięć', icon: 'users' },
  bzReferences: { id: 'referencje', label: 'Realizacje', icon: 'star' },
  bzFacts: { id: 'fakty', label: 'Fakty', icon: 'doc' },
  faq: { id: 'faq', label: 'Pytania', icon: 'q' },
  bzContact: { id: 'kontakt', label: 'Kontakt', icon: 'phone' },
}

/** Rail entries for the blocks of a Biznes page, in their order, each section once. */
export function railItems(blockTypes: readonly string[]): RailItem[] {
  const seen = new Set<string>()
  return blockTypes.flatMap((type) => {
    const item = RAIL[type]
    if (!item || seen.has(item.id)) return []
    seen.add(item.id)
    return [item]
  })
}

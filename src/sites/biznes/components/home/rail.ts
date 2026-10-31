import type { RailItem } from '@/components/SectionRail'

import { reviewSlots } from '../../blocks/BzReferences/reviews'

/** A block of the page as stored; its fields decide whether a section renders. */
type RailBlock = { blockType: string }

type Options = {
  /** `SiteSettings.biznes.showReviews` — without it the reviews section is not rendered. */
  reviews: boolean
  /** Placeholder reviews fill the section (never in a production build, ADR-017 D-K4-6). */
  placeholders: boolean
}

type Entry = RailItem & {
  /** Whether the block renders this section; always when left out. */
  shown?: (block: RailBlock, options: Options) => boolean
}

const filled = (value: unknown) => Array.isArray(value) && value.length > 0
const field = (value: unknown, key: string): unknown =>
  value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined

/**
 * Board v150 (K36 §1, `g4rail` „Na tej stronie”, 12 entries): the sections with an anchor, by
 * the block that renders them — `bzOffer` has the departments and the systems, `bzPlan` „Dla
 * kogo” and the plan, `bzReferences` the reviews. A section the block leaves out (empty data)
 * gets no entry.
 */
const RAIL: Record<string, Entry[]> = {
  bzHero: [{ id: 'start', label: 'Start', icon: 'rocket' }],
  bzOffer: [
    { id: 'oferta', label: 'Działy oferty', icon: 'store' },
    {
      id: 'systemy',
      label: 'Systemy i opieka IT',
      icon: 'server',
      shown: (block) => filled(field(block, 'systems')),
    },
  ],
  // On Biznes the shared Partners block is the brands section (`BrandsHome`).
  partners: [{ id: 'marki', label: 'Marki', icon: 'star' }],
  bzFeatured: [{ id: 'wybierane', label: 'Najczęściej wybierane', icon: 'grid' }],
  bzPlan: [
    {
      id: 'dla-kogo',
      label: 'Dla kogo',
      icon: 'users',
      shown: (block) =>
        filled(field(field(block, 'industries'), 'tiles')) ||
        Boolean(field(field(block, 'funding'), 'heading')),
    },
    { id: 'plan', label: 'Plan Twojej firmy', icon: 'map' },
  ],
  bzSteps: [{ id: 'jak-pracujemy', label: 'Jak pracujemy', icon: 'compass' }],
  bzReferences: [
    {
      id: 'opinie',
      label: 'Opinie',
      icon: 'chat',
      // The same rule as the section (`BzReferences`).
      shown: (block, { reviews, placeholders }) =>
        reviews &&
        reviewSlots(
          (filled(field(block, 'reviews')) ? field(block, 'reviews') : []) as Parameters<
            typeof reviewSlots
          >[0],
          placeholders,
        ).length > 0,
    },
  ],
  bzFacts: [{ id: 'fakty', label: 'O firmie', icon: 'doc' }],
  faq: [{ id: 'faq', label: 'Pytania', icon: 'q' }],
  bzContact: [{ id: 'kontakt', label: 'Kontakt', icon: 'phone' }],
}

/** Rail entries for the blocks of a Biznes page, in their order, each section once. */
export function railItems<T extends RailBlock>(blocks: readonly T[], options: Options): RailItem[] {
  const seen = new Set<string>()
  return blocks.flatMap((block) =>
    (RAIL[block.blockType] ?? []).flatMap(({ shown, ...item }) => {
      if (seen.has(item.id) || (shown && !shown(block, options))) return []
      seen.add(item.id)
      return [item]
    }),
  )
}

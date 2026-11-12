import type { Payload } from 'payload'

import file from '../../../seed/prokombiznes/k4/strona-glowna-k4.json'
import { HOME_SLUG } from '../../lib/pages/slug'
import { FAQ_LEAD_BIZ2, FAQ_LEAD_OLD } from './homeFacts'
import { PLAN_BIZ2, PLAN_LABELS, PLAN_LEAD } from './homePlan'
import type { PageBlock } from './page'

// BIZ-2 B3-1 (plan 0611 §7.1) — what the seed changes in a home page it created earlier:
// - the order of the sections, but only while the page holds exactly the blocks of the earlier
//   seed (one of each): a page with a block added or removed in the panel keeps its order;
// - the texts of the plan with the industries (D8) and the FAQ lead without „60 minut”, each only
//   while it still holds the old seed value (edits in the panel win).

type Block = { blockType: string }
type Fields = Record<string, unknown>

/**
 * Plan 0611 §7.1 for the blocks that exist today: hero, „Szybki start”, the offer, „Zaopatrzenie
 * firm”, brands, „Najczęściej wybierane”, [KSeF — B3-2], the plan with the industries, „Jak
 * pracujemy”, reviews (a slot behind `showReviews`), „O firmie”, [news — B3-2], FAQ, contact.
 */
export const HOME_ORDER_BIZ2 = [
  'bzHero',
  'bzNeeds',
  'bzOffer',
  'bzProcurement',
  'partners',
  'bzFeatured',
  'bzPlan',
  'bzSteps',
  'bzReferences',
  'bzFacts',
  'faq',
  'bzContact',
] as const

/** The earlier seed (K4c v150 + B2-3 „Zaopatrzenie firm”) had the same blocks, one of each. */
const KNOWN = new Set<string>(HOME_ORDER_BIZ2)

function seedSet(layout: readonly Block[]): boolean {
  const types = layout.map((block) => block.blockType)
  return types.length === KNOWN.size && new Set(types).size === types.length
    ? types.every((type) => KNOWN.has(type))
    : false
}

/** The layout in the order of §7.1, or `null` (already in order, or edited in the panel). */
export function reorderHomeBiz2<T extends Block>(layout: readonly T[]): T[] | null {
  if (!seedSet(layout)) return null
  const rank = (block: T) => HOME_ORDER_BIZ2.indexOf(block.blockType as never)
  const next = [...layout].sort((a, b) => rank(a) - rank(b))
  return next.every((block, i) => block === layout[i]) ? null : next
}

/** Old seed value → new one, by block type and field. */
const TEXTS: Record<string, Record<string, { old: string; next: string }>> = {
  bzPlan: {
    eyebrow: { old: 'Plan Twojej firmy', next: PLAN_BIZ2.eyebrow },
    heading: { old: 'Zobacz, co ustawimy w Twoim lokalu.', next: PLAN_BIZ2.heading },
    lead: { old: PLAN_LEAD, next: PLAN_BIZ2.lead },
    moreLabel: { old: PLAN_LABELS.moreLabel, next: PLAN_BIZ2.moreLabel },
  },
  faq: {
    lead: { old: FAQ_LEAD_OLD, next: FAQ_LEAD_BIZ2 },
  },
}

/** The layout with the B3-1 texts, or `null` when nothing changes. */
export function upgradeHomeTextsBiz2<T extends Block>(layout: readonly T[]): T[] | null {
  let changed = false
  const next = layout.map((block) => {
    const rules = TEXTS[block.blockType]
    if (!rules) return block
    let out = block as unknown as Fields
    for (const [field, { old, next: value }] of Object.entries(rules)) {
      if (out[field] === old) out = { ...out, [field]: value }
    }
    if (out !== (block as unknown)) changed = true
    return out as unknown as T
  })
  return changed ? next : null
}

/** The home layout after B3-1 (order, then texts), or `null` when nothing changes. */
export function upgradeHomeBiz2<T extends Block>(
  layout: readonly T[] | null | undefined,
): T[] | null {
  if (!layout || layout.length === 0) return null
  const ordered = reorderHomeBiz2(layout)
  const texts = upgradeHomeTextsBiz2(ordered ?? layout)
  return texts ?? ordered
}

/** `strona-glowna-k4.json → zestawy_na_glownej`: the bundles of the home plan, in order. */
export const HOME_BUNDLES: readonly string[] = (file as { zestawy_na_glownej: string[] })
  .zestawy_na_glownej

/**
 * `BiznesSettings.bundles.home` from the package — only while the panel has none (the panel's
 * choice wins), `null` = nothing to write. Bundles without a record are left out.
 */
export function homeBundlesUpdate(
  stored: readonly unknown[] | null | undefined,
  bundleId: (slug: string) => number | undefined,
): number[] | null {
  if ((stored ?? []).length > 0) return null
  const ids = HOME_BUNDLES.flatMap((slug) => bundleId(slug) ?? [])
  return ids.length > 0 ? ids : null
}

type Report = (name: string, changed: boolean) => void
const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** B3-1 on the stored home page: order of §7.1 and the texts (after „Zaopatrzenie firm”). */
export async function seedBiznesHomeBiz2(
  payload: Payload,
  tenantId: number,
  report: Report,
): Promise<void> {
  const {
    docs: [home],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: HOME_SLUG } }] },
    limit: 1,
    ...local,
  })
  if (!home) return
  const layout = upgradeHomeBiz2<PageBlock>(home.layout)
  report('pages home (B3-1)', layout !== null)
  if (!layout) return
  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout, _status: home._status ?? 'published' },
    ...local,
  })
}

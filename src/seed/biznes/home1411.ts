import type { Payload } from 'payload'

import { HOME_SLUG } from '../../lib/pages/slug'
import type { PageBlock } from './page'

// Runda 1411 R3 (PRZEKAZANIE-RUNDA-1411 §1 „Strona główna — nowa kolejność”) on a home page the
// seed created earlier: the new block „Systemy, które u Ciebie wdrożymy” made of the flagship
// cards of „Oferta”, the KSeF band gone (the /ksef page stays), the sections in the new order.
// Written only when something differs, so a second run changes nothing.

type Block = { blockType: string; variant?: unknown; [key: string]: unknown }
type Report = (name: string, changed: boolean) => void

/**
 * The order of §1 (rows 1–13). `bzReferences` stays hidden behind its setting and keeps its old
 * place after „Jak pracujemy”; `bzLines` comes with R4.
 */
export const HOME_ORDER_1411 = [
  'bzHero',
  'bzNeeds',
  'bzOffer',
  'bzSystems',
  'bzFeatured',
  'bzPlan',
  'bzSteps',
  'bzReferences',
  'bzFacts',
  'partners',
  'bzProcurement',
  'bzNewsHome',
  'bzLines',
  'faq',
  'bzContact',
] as const

/**
 * Texts of the new section head (board `Systemy.dc.html`). The cards come from „Oferta” as they
 * are — TODO(krystian): [SZEF] the IT care status bars („Kopia danych z nocy”, „Aktualizacje na
 * 4 komputerach”, „Przegląd kasy fiskalnej za 43 dni”) are the board's example (§7 pkt 2).
 */
export const SYSTEMS_HEAD = {
  eyebrow: 'Wdrażamy od początku do końca',
  heading: 'Systemy, które u Ciebie wdrożymy',
  note: 'Dwa autoryzowane partnerstwa i nasza usługa opieki IT.',
} as const

const isBand = (block: Block) => block.blockType === 'bzKsef' && block.variant === 'band'
const known = new Set<string>(HOME_ORDER_1411)

/** Copy of the flagship cards without the ids of the old array rows (Payload gives new ones). */
function systemsOf(offer: Block | undefined): unknown[] {
  const systems = Array.isArray(offer?.systems) ? (offer.systems as Record<string, unknown>[]) : []
  return systems.map(({ id: _id, statuses, ...rest }) => ({
    ...rest,
    ...(Array.isArray(statuses) && {
      statuses: (statuses as Record<string, unknown>[]).map(({ id: _row, ...row }) => row),
    }),
  }))
}

/**
 * The home layout of runda 1411, or `null` when it is already there: `bzSystems` added after
 * „Oferta” (with the offer's cards), the KSeF band removed, and — when every block is one the
 * order knows — the blocks sorted by `HOME_ORDER_1411` (a block added in the panel keeps the page
 * as it is apart from those two changes).
 */
export function upgradeHome1411<T extends Block>(
  layout: readonly T[] | null | undefined,
): T[] | null {
  if (!layout || layout.length === 0) return null
  let next: T[] = layout.filter((block) => !isBand(block))
  let changed = next.length !== layout.length
  if (!next.some((block) => block.blockType === 'bzSystems')) {
    const offerAt = next.findIndex((block) => block.blockType === 'bzOffer')
    const systems = systemsOf(next[offerAt])
    if (offerAt >= 0 && systems.length > 0) {
      const block = { blockType: 'bzSystems', ...SYSTEMS_HEAD, systems } as unknown as T
      next = [...next.slice(0, offerAt + 1), block, ...next.slice(offerAt + 1)]
      changed = true
    }
  }
  // The new order once, with the move itself (the band out or „Systemy” in): a page the panel
  // has rearranged since keeps its order on the next import.
  if (changed && next.every((block) => known.has(block.blockType))) {
    const rank = (block: T) => HOME_ORDER_1411.indexOf(block.blockType as never)
    const sorted = [...next].sort((a, b) => rank(a) - rank(b))
    if (sorted.some((block, i) => block !== next[i])) {
      next = sorted
      changed = true
    }
  }
  return changed ? next : null
}

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** Runda 1411 R3 on the stored home page (after B3-1 and B3-2). */
export async function seedBiznesHome1411(
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
  const layout = upgradeHome1411<PageBlock & Block>(home.layout as (PageBlock & Block)[])
  report('pages home (runda 1411)', layout !== null)
  if (!layout) return
  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout: layout as PageBlock[], _status: home._status ?? 'published' },
    ...local,
  })
}

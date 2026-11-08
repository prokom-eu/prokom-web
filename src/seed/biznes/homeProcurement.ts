import type { Payload } from 'payload'

import file from '../../../seed/prokombiznes/k4/strona-glowna-k4.json'
import { HOME_SLUG } from '../../lib/pages/slug'
import { hasSameValues } from '../compare'
import type { PageBlock } from './page'
import { resolveProcurementImages } from './procurementPages'

type Report = (name: string, changed: boolean) => void
type Block = { blockType: string; data?: unknown }

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

const SLUG = 'bzProcurement'

/** `strona-glowna-k4.json → zaopatrzenie`: head texts for the fields, the rest for `data`. */
export const homeProcurementPackage = (
  file as unknown as {
    zaopatrzenie: { eyebrow: string; heading: string; lead: string } & Record<string, unknown>
  }
).zaopatrzenie

/**
 * The home layout with „Zaopatrzenie firm” (ZAOPATRZENIE §8), or `null` when nothing changes.
 * A missing section goes right after the offer (`bzOffer`), else before the brands, else at the
 * end; a stored one keeps its place and its head texts (panel edits) and gets the package data
 * (the package wins, like on the procurement pages).
 */
export function upgradeHomeProcurement<T extends Block>(
  layout: readonly T[],
  block: T,
): T[] | null {
  const index = layout.findIndex((item) => item.blockType === SLUG)
  if (index >= 0) {
    const stored = layout[index]!
    // jsonb reorders keys: compare values both ways (a key dropped from the package counts).
    if (hasSameValues(stored.data, block.data) && hasSameValues(block.data, stored.data)) {
      return null
    }
    return layout.map((item, i) => (i === index ? { ...item, data: block.data } : item))
  }
  const offer = layout.findIndex((item) => item.blockType === 'bzOffer')
  const brands = layout.findIndex((item) => item.blockType === 'partners')
  const at = offer >= 0 ? offer + 1 : brands >= 0 ? brands : layout.length
  return [...layout.slice(0, at), block, ...layout.slice(at)]
}

/** Home page section „Zaopatrzenie firm”; images by their package names (`zaop-*` Media). */
export async function seedBiznesHomeProcurement(
  payload: Payload,
  tenantId: number,
  mediaId: (name: string) => number | undefined,
  report: Report,
  note: (what: string, item: string) => void,
): Promise<void> {
  const { eyebrow, heading, lead, ...rest } = homeProcurementPackage
  const { data, missing } = resolveProcurementImages(rest, mediaId)
  missing.forEach((name) => note('Zaopatrzenie (główna): brak zdjęcia', name))
  const {
    docs: [home],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: HOME_SLUG } }] },
    limit: 1,
    ...local,
  })
  if (!home) return
  const block = { blockType: SLUG, eyebrow, heading, lead, data } as PageBlock
  const layout = upgradeHomeProcurement<PageBlock>(home.layout ?? [], block)
  report('pages home (Zaopatrzenie)', layout !== null)
  if (!layout) return
  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout, _status: home._status ?? 'published' },
    ...local,
  })
}

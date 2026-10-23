import type { IconName } from '@/lib/catalog/options'
import { tenantIdOf } from '@/lib/tenant/id'

import type { Tone } from '../../components/home/tones'

/** A tile without an industry page leads to the wizard (spec. §4 pkt 6: „Każda inna firma”). */
export const WIZARD_HREF = '/kreator'

type TileInput = {
  id?: string | null
  name: string
  note?: string | null
  icon: IconName
  tone: Tone
  visibleFirst?: boolean | null
  industry?: unknown
}

export type IndustryTile = {
  key: string
  name: string
  note: string | null
  icon: IconName
  tone: Tone
  href: string
}

/**
 * `/branze/<slug>` only for an active industry of this tenant (the relation is checked again
 * here); an inactive one („Wkrótce”) has no page of its own (`Industries`), so the wizard.
 */
function hrefOf(industry: unknown, tenantId: number): string {
  if (!industry || typeof industry !== 'object') return WIZARD_HREF
  const { slug, tenant, active } = industry as {
    slug?: unknown
    tenant?: unknown
    active?: unknown
  }
  return typeof slug === 'string' && active === true && tenantIdOf(tenant) === tenantId
    ? `/branze/${encodeURIComponent(slug)}`
    : WIZARD_HREF
}

/**
 * Tiles of the industries grid (ADR-012 rozstrz. 11): the ones marked „widoczny od razu” and the
 * rest shown after „Pokaż wszystkie branże”, both in the panel's order.
 */
export function industryTiles(
  tiles: readonly TileInput[] | null | undefined,
  tenantId: number,
): { visible: IndustryTile[]; hidden: IndustryTile[] } {
  const visible: IndustryTile[] = []
  const hidden: IndustryTile[] = []
  ;(tiles ?? []).forEach((tile, i) => {
    const out: IndustryTile = {
      key: tile.id ?? `${tile.name}-${i}`,
      name: tile.name,
      note: tile.note ?? null,
      icon: tile.icon,
      tone: tile.tone,
      href: hrefOf(tile.industry, tenantId),
    }
    ;(tile.visibleFirst ? visible : hidden).push(out)
  })
  return { visible, hidden }
}

import { PLAN_LABELS, PLAN_LEAD, TILE_SCENES } from './homePlan'

// K31d′ — what the seed changes in a home page it created earlier: the plan block's texts of
// stage 1 (tabs without a drawing) become the plan 2.0 texts, but only while they still hold the
// old seed value (edits in the panel win), and industry tiles without a scene get the scene of
// `TILE_SCENES`. The old scenes of the block are gone with their tables (migration `k31d_plan`).

type Block = { blockType: string }
type Fields = Record<string, unknown>

const OLD_TEXTS: Record<string, { old: string; next: string }> = {
  lead: {
    old: 'Wybierz rodzaj firmy i zobacz, co zwykle ustawiamy — a my dobierzemy, skonfigurujemy i będziemy serwisować całość.',
    next: PLAN_LEAD,
  },
  sceneNote: { old: 'z jednej ręki', next: PLAN_LABELS.sceneNote },
  moreLabel: { old: 'Więcej o branży', next: PLAN_LABELS.moreLabel },
  inquiryLabel: { old: 'Przygotuj zapytanie:', next: PLAN_LABELS.inquiryLabel },
}

function upgradePlan(block: Fields): Fields {
  let next = block
  for (const [field, { old, next: value }] of Object.entries(OLD_TEXTS)) {
    if (next[field] === old) next = { ...next, [field]: value }
  }
  const industries = next.industries as Fields | null | undefined
  const tiles = industries?.tiles
  if (Array.isArray(tiles)) {
    const filled = tiles.map((tile: Fields) => {
      const scene = TILE_SCENES[String(tile.name)]
      const empty = typeof tile.planScene !== 'string' || tile.planScene.trim() === ''
      return scene && empty ? { ...tile, planScene: scene } : tile
    })
    if (filled.some((tile, i) => tile !== tiles[i])) {
      next = { ...next, industries: { ...industries, tiles: filled } }
    }
  }
  return next
}

/** The home layout with the plan 2.0 texts and tile scenes, or `null` when nothing changes. */
export function upgradeHomePlan<T extends Block>(
  layout: readonly T[] | null | undefined,
): T[] | null {
  if (!layout || layout.length === 0) return null
  let changed = false
  const next = layout.map((block) => {
    if (block.blockType !== 'bzPlan') return block
    const upgraded = upgradePlan(block as unknown as Fields)
    if (upgraded !== (block as unknown)) changed = true
    return upgraded as unknown as T
  })
  return changed ? next : null
}

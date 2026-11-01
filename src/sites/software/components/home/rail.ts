import type { RailItem } from '@/components/SectionRail'
import {
  BUILT_HOME_SECTIONS,
  homeSectionAnchor,
  type HomeSectionValue,
} from '@/lib/software/homeSections'

/**
 * Section rail of the Software start page (spec. §3.3; board `Main` v22, `RAILI` — 11 entries:
 * with „Jak robimy”, „Z czego budujemy” and „Zasady”, without „Proces” and „Kontakt”, decyzja 9):
 * only sections whose components exist, by the block that renders them — `faq` is the shared FAQ
 * block. A section that renders nothing (texts missing in the panel) is dropped by `SectionRail`
 * itself, when its anchor is not found.
 */
export const RAIL_LABELS: Record<string, Omit<RailItem, 'id'>> = {
  start: { label: 'Start', icon: 'home' },
  oferta: { label: 'Oferta', icon: 'grid' },
  popularne: { label: 'Najczęściej zamawiane', icon: 'star' },
  podglady: { label: 'Podglądy na żywo', icon: 'monitor' },
  dobierz: { label: 'Dobierz rozwiązanie', icon: 'flash' },
  'jak-robimy': { label: 'Jak robimy', icon: 'site' },
  'bez-wordpressa': { label: 'Dlaczego nie WordPress', icon: 'shield' },
  technologie: { label: 'Z czego budujemy', icon: 'server' },
  zasady: { label: 'Zasady', icon: 'doc' },
  faq: { label: 'Pytania', icon: 'q' },
}

type RailBlock = { blockType: string; section?: string | null }

/** Anchor of a block of the Software start page, or `null`. */
function anchorOf(block: RailBlock, built: readonly HomeSectionValue[]): string | null {
  if (block.blockType === 'swHero') return 'start'
  if (block.blockType === 'faq') return 'faq'
  if (block.blockType !== 'swHomeSection' || !block.section) return null
  const section = block.section as HomeSectionValue
  return built.includes(section) ? homeSectionAnchor(section) : null
}

/** Rail entries for the blocks of the Software start page, in their order, each section once. */
export function softwareRailItems(
  blocks: readonly RailBlock[],
  built: readonly HomeSectionValue[] = BUILT_HOME_SECTIONS,
): RailItem[] {
  const seen = new Set<string>()
  return blocks.flatMap((block) => {
    const id = anchorOf(block, built)
    const item = id ? RAIL_LABELS[id] : undefined
    if (!id || !item || seen.has(id)) return []
    seen.add(id)
    return [{ id, ...item }]
  })
}

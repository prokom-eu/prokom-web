import type { RailItem } from '@/components/SectionRail'
import {
  BUILT_HOME_SECTIONS,
  homeSectionAnchor,
  type HomeSectionValue,
} from '@/lib/software/homeSections'

/**
 * Section rail of the Software start page (v24, board `AU-pc`: Start, Od czego zaczynasz, Oferta,
 * Podglądy na żywo, Jak robimy, Kreator 60 s, Cennik, Jak pracujemy, Pytania, Kontakt):
 * only sections whose components exist, by the block that renders them — `faq` is the shared FAQ
 * block. A section that renders nothing (texts missing in the panel) is dropped by `SectionRail`
 * itself, when its anchor is not found.
 */
export const RAIL_LABELS: Record<string, Omit<RailItem, 'id'>> = {
  start: { label: 'Start', icon: 'home' },
  // v24 (board `AU-pc`, rail): promises have no entry.
  sytuacje: { label: 'Od czego zaczynasz', icon: 'compass' },
  oferta: { label: 'Oferta', icon: 'grid' },
  podglady: { label: 'Podglądy na żywo', icon: 'monitor' },
  technologia: { label: 'Jak robimy', icon: 'site' },
  dobierz: { label: 'Kreator 60 s', icon: 'flash' },
  cennik: { label: 'Cennik', icon: 'wallet' },
  proces: { label: 'Jak pracujemy', icon: 'doc' },
  faq: { label: 'Pytania', icon: 'q' },
  kontakt: { label: 'Kontakt', icon: 'chat' },
}

type RailBlock = { blockType: string; section?: string | null }

/** Anchor of a block of the Software start page, or `null`. */
function anchorOf(block: RailBlock, built: readonly HomeSectionValue[]): string | null {
  if (block.blockType === 'swHero') return 'start'
  if (block.blockType === 'faq') return 'faq'
  if (block.blockType === 'swContact') return 'kontakt'
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

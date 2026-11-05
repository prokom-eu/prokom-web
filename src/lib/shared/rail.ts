import { isIconName, type IconName } from './icons'
import { plural } from '../plural'

/** A section of the line's home page in the rail (`shared.rail.sections`, spec §5.1). */
export type RailSection = { anchorId: string; label: string; icon: string }

/** A section of the current subpage, read from `[data-rail-section]` (spec §5.1 pkt 4). */
export type PageSection = { id: string; label: string; icon: string | null }

/** „Na tej stronie” shows from this many marked sections of a subpage. */
export const PAGE_GROUP_MIN = 3
/** At most this many before the list scrolls in a thin bar. */
export const PAGE_GROUP_MAX = 10

/**
 * Link of a home page section: on the home page the anchor itself (smooth scroll), elsewhere the
 * home page opened at that section (`/#id`, spec §5.1).
 */
export function railHref(anchorId: string, onHome: boolean): string {
  return onHome ? `#${anchorId}` : `/#${anchorId}`
}

/**
 * Sections the rail shows on the home page: only those whose anchor is on the page (a block may
 * render nothing — the rail never links to a missing section). `null` before the page is read
 * (server): every section counts.
 */
export function presentSections<T extends { anchorId: string }>(
  sections: readonly T[],
  presentIds: ReadonlySet<string> | null,
): T[] {
  return presentIds ? sections.filter((section) => presentIds.has(section.anchorId)) : [...sections]
}

/** Whether a subpage gets its own „Na tej stronie” group. */
export function hasPageGroup(sections: readonly PageSection[]): boolean {
  return sections.length >= PAGE_GROUP_MIN
}

/** An icon name from the panel, or a plain document icon when the panel has a typo. */
export function railIcon(name: string | null | undefined): IconName {
  return name && isIconName(name) ? name : 'doc'
}

/** „10 sekcji”, „3 sekcje”, „1 sekcja” — the folded home page row. */
export function sectionsCount(count: number): string {
  return `${count} ${plural(count, ['sekcja', 'sekcje', 'sekcji'])}`
}

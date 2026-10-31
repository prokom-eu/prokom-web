import type { ServiceKey } from '../../sites/instalacje/dane/types'

/** Sections every service page ends with (shared sections, KOMPONENTY §2). */
export const SHARED_SECTION_IDS = ['odbior', 'pakiety', 'cena', 'faq', 'powiazane'] as const

/**
 * Section ids of the service pages built so far (prototype ids, ADR-I003 §1). A service without
 * an entry has only the shared sections; I7–I9 add theirs with their pages.
 */
export const SERVICE_SECTION_IDS: Partial<Record<ServiceKey, readonly string[]>> = {
  ant: ['co-robimy', 'gory', 'multipleksy', 'filtr-5g', 'satelita', 'pensjonat-tv'],
  alarm: [
    'jak-dziala',
    'wersje',
    'przewod',
    'wideodomofon',
    'domofony',
    'dom-letniskowy',
    'agencja',
  ],
  kd: ['metody', 'apartamenty', 'firma', 'identyfikatory', 'zamki', 'awarie'],
  wifi: [
    'dlaczego',
    'podzial',
    'portal',
    'okablowanie',
    'narzedzia',
    'sprzet',
    'standardy',
    'zapas',
  ],
  kam: ['co-dostajesz', 'system', 'typy', 'ile-widac', 'nagrania', 'rodo', 'sprzet-kamery'],
}

/** Ids a service page can jump to: its own sections and the shared ones. */
export function sectionIdsOf(key: string): readonly string[] {
  return [...(SERVICE_SECTION_IDS[key as ServiceKey] ?? []), ...SHARED_SECTION_IDS]
}

/** Anchors of the anchor bar that point at no section of the page (ADR-I002 §2). */
export function unknownAnchors(key: string, anchorIds: readonly string[]): string[] {
  const known = new Set(sectionIdsOf(key))
  return anchorIds.filter((id) => !known.has(id))
}

type AnchorRow = { anchorId?: string | null }
type ServiceData = { key?: string | null; anchors?: AnchorRow[] | null }

/**
 * `beforeValidate` of `InstServices`: an anchor must point at a section of the service page,
 * otherwise the bar's link jumps nowhere. Checked only for services whose page exists in code
 * (`SERVICE_SECTION_IDS`) — the others keep their package anchors until their session.
 * Message in Polish for the panel.
 */
export function anchorsError(
  data: ServiceData | undefined,
  original: ServiceData | undefined,
): string | null {
  const key = data?.key ?? original?.key
  const anchors = data?.anchors ?? original?.anchors
  if (!key || !anchors || !(key in SERVICE_SECTION_IDS)) return null
  const ids = anchors.flatMap(({ anchorId }) => (anchorId ? [anchorId.trim()] : []))
  const unknown = unknownAnchors(key, ids)
  if (unknown.length === 0) return null
  return `Kotwice bez sekcji na stronie: ${unknown.join(', ')}. Dozwolone: ${sectionIdsOf(key).join(', ')}.`
}

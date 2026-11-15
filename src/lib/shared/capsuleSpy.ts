/** A capsule menu entry for the scroll-spy: its key and the home page sections it stands for. */
export type SpyEntry = { key: string; sections?: readonly string[] }

/**
 * The menu entry whose pill marks the home page section being read (plan 0611 §8.1 pkt 2): the
 * entry that lists the section, none for a section no entry lists (hero, plan, FAQ) — the pill
 * then hides rather than staying on the last entry it passed.
 */
export function spyKey(entries: readonly SpyEntry[], sectionId: string | null): string | null {
  if (!sectionId) return null
  return entries.find((entry) => entry.sections?.includes(sectionId))?.key ?? null
}

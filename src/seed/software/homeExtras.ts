import type { SoftwareHomeSections } from '../../lib/software/home'

/**
 * Headings of the start page sections the board `Main` keeps in its HTML, not in
 * `strona-glowna.json` (SW5, ADR-014 doprecyzowania SW5). The package file stays 1:1;
 * `softwareSettingsData()` adds these to its copy of `home`.
 */
export const HOME_SECTION_TEXTS: SoftwareHomeSections = {
  compare: {
    eyebrow: 'Dlaczego my',
    title: 'Freelancer, agencja czy PRO-KOM?',
    tabs: ['vs freelancer', 'vs agencja z miasta'],
  },
}

/**
 * `home` with the section headings the seed knows and the stored one lacks — a home saved
 * before SW5 has no `sections`, one saved in SW5 none for the SW6 sections. Sections already
 * stored stay as they are (edited in the panel); `null` when nothing is missing or the field is
 * empty (then the seed's „only while empty” rule fills it whole).
 */
export function homeWithSections(
  stored: unknown,
  sections: SoftwareHomeSections,
): Record<string, unknown> | null {
  if (!isRecord(stored)) return null
  const current = isRecord(stored.sections) ? stored.sections : {}
  const missing = Object.entries(sections).filter(
    ([name, value]) => value != null && current[name] == null,
  )
  if (missing.length === 0) return null
  return {
    ...stored,
    sections: { ...current, ...structuredClone(Object.fromEntries(missing)) },
  }
}

/**
 * `home` with the v24 keys (hero, promises, situations, bento, showroom) the stored one lacks;
 * keys already stored (edited in the panel) stay. `null` when nothing is missing.
 */
export function homeWithV24(
  stored: unknown,
  extras: Record<string, unknown>,
): Record<string, unknown> | null {
  if (!isRecord(stored)) return null
  const missing = Object.entries(extras).filter(([name]) => stored[name] == null)
  if (missing.length === 0) return null
  return { ...stored, ...structuredClone(Object.fromEntries(missing)) }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

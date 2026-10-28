import type { SoftwareHomeSections } from '../../lib/software/home'

/**
 * Headings of the start page sections the board `Main` keeps in its HTML, not in
 * `strona-glowna.json` (SW5, ADR-014 doprecyzowania SW5). The package file stays 1:1;
 * `softwareSettingsData()` adds these to its copy of `home`.
 */
export const HOME_SECTION_TEXTS: SoftwareHomeSections = {
  areas: {
    eyebrow: 'Oferta · 8 obszarów',
    title: 'Wszystko dla firmy, w ośmiu obszarach.',
    lead: 'Kliknij obszar i zobacz, co w nim robimy, co zyskujesz i od ilu to kosztuje.',
    priceCaption: 'Cena',
    wizardButton: 'Dobierz w 60 s',
  },
  popular: {
    eyebrow: 'Najczęściej zamawiane',
    title: '12 rzeczy, po które firmy przychodzą najczęściej.',
    lead: 'Każda z ceną „od”, terminem i tym, co dokładnie dostajesz. Kliknij kartę, żeby ją rozwinąć. Nie ma Twojej? W pełnej ofercie jest ich więcej.',
    count: ['{n} pozycja', '{n} pozycje', '{n} pozycji'],
    hint: 'kliknij kartę, żeby rozwinąć',
    after: {
      title: 'A gdy już masz stronę lub system',
      items: [
        {
          title: 'Opieka i rozwój',
          text: 'od [OPIEKA OD] zł / mies.',
          href: '/cennik',
          icon: 'shield',
        },
        {
          title: 'Przejęcie po kimś, kto zniknął',
          text: 'odzyskamy dostępy i dane',
          href: '/kontakt',
          icon: 'key',
        },
        {
          title: 'Darmowy audyt strony',
          text: 'wynik na piśmie',
          href: '/audyt',
          icon: 'search',
        },
      ],
      button: ['Pełna oferta →', '/rozwiazania'],
    },
  },
}

/**
 * `home` with the section headings added, for a home saved before SW5 (no `sections` yet) —
 * `null` when there is nothing to add: headings edited in the panel stay, and an empty field is
 * filled whole by the seed's „only while empty” rule.
 */
export function homeWithSections(
  stored: unknown,
  sections: SoftwareHomeSections,
): Record<string, unknown> | null {
  if (typeof stored !== 'object' || stored === null || Array.isArray(stored)) return null
  if ('sections' in stored && stored.sections != null) return null
  return { ...stored, sections: structuredClone(sections) }
}

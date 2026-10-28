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
  livePreviews: {
    eyebrow: 'Podglądy na żywo · zanim zapłacisz',
    title: 'Zobacz, jak to będzie wyglądać. Zanim zapłacisz.',
    lead: 'To nie są obrazki. Laptop pokazuje Twoje biuro, telefon pokazuje Twojego pracownika albo klienta, a oba ekrany żyją razem. Wybierz rodzaj rozwiązania.',
    hint: ['Przełącza się samo. Kliknij, żeby wybrać.', 'Twój wybór. Klikaj po ekranach.'],
    open: 'Otwórz pełny podgląd',
    add: ['Chcę takie u siebie', '✓ W Twoim projekcie'],
  },
  process: {
    eyebrow: 'Jak pracujemy i jak powstaje cena',
    title: 'Od rozmowy do działającego systemu. Płacisz po każdym etapie.',
    lead: 'Pięć etapów, zero niespodzianek. Kliknij etap: zobaczysz, co się dzieje, co dostajesz do ręki i kiedy płacisz.',
    stage: 'Etap {num} · {t}',
    get: 'Co dostajesz',
    you: 'Ty robisz',
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

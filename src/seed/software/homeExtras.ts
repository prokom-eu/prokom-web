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
    lead: 'Każda z ceną „od”, terminem i tym, co dokładnie dostajesz. Otwórz kartę, a zobaczysz, co jest w cenie, przykład z życia i termin. Nie ma Twojej? W pełnej ofercie jest ich więcej.',
    count: ['{n} pozycja', '{n} pozycje', '{n} pozycji'],
    hint: 'kliknij kartę, żeby zobaczyć szczegóły',
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
    title: 'Od rozmowy do działającego systemu. Większość płacisz po odbiorze.',
    lead: 'Pięć etapów, zero niespodzianek. Kliknij etap: zobaczysz, co się dzieje, co dostajesz do ręki i kiedy płacisz.',
    stage: 'Etap {num} · {t}',
    get: 'Co dostajesz',
    you: 'Ty robisz',
  },
  guarantees: {
    eyebrow: 'Na piśmie, nie na słowo',
    title: 'Zasady, których się trzymamy.',
    sayNo: {
      eyebrow: 'Uczciwa rada przed wyceną',
      title: 'Czasem powiemy: tego nie buduj.',
      text: 'Jeśli gotowy program za kilkadziesiąt złotych miesięcznie rozwiąże Twój problem, powiemy Ci to wprost i pomożemy go wybrać. Budujemy tylko wtedy, gdy to się opłaca Tobie.',
      link: ['Zapytaj, co się opłaca', '/#kontakt'],
    },
  },
  showcase: { eyebrow: 'Realizacje' },
  howWeBuild: {
    eyebrow: 'Jak robimy strony i systemy',
    title: 'Nie składamy z gotowych klocków. Piszemy pod Twoją firmę.',
    lead: 'Większość stron w Polsce powstaje z gotowego szablonu i kilkunastu wtyczek. Działa, dopóki ktoś to pilnuje. My piszemy stronę od podstaw, dlatego dostajesz trzy rzeczy, które da się zmierzyć.',
    gainLabel: 'Zyskujesz',
    cards: [
      {
        badge: '< 2,5 s',
        name: 'Szybka',
        text: 'Klient widzi stronę w mniej niż 2,5 sekundy, także na telefonie i na słabym zasięgu. Tyle wynosi próg, który mierzy Google.',
        gain: 'Klient nie czeka i nie ucieka do konkurencji, zanim zobaczy ofertę.',
      },
      {
        badge: '0 wtyczek',
        name: 'Bezpieczna',
        text: 'Nie ma obcych wtyczek, które trzeba co tydzień łatać. Kopie, aktualizacje i pilnowanie robimy my, Ty prowadzisz firmę.',
        gain: 'Spokój. Żadnych telefonów „strona nie działa” w środku sezonu.',
      },
      {
        name: 'Widoczna w Google i AI',
        text: 'Szybka, wygodna na telefonie i dobrze opisana. Tak stronę czytają Google i asystenci AI, np. ChatGPT. W cenie, nie w osobnym pakiecie.',
        gain: 'Klientów z Google, a nie tylko z polecenia.',
      },
    ],
    source: 'Źródło progu szybkości: Google Search Central, „Core Web Vitals” i „Page experience”.',
    result: 'Wynik szybkości każdej oddanej strony zapisujemy w protokole odbioru. Nasz: [WYNIK].',
  },
  technologies: {
    eyebrow: 'Z czego budujemy i co z tego masz',
    title: 'Twój system, warstwa po warstwie.',
    lead: 'Nazw nie musisz znać. Kliknij warstwę i zobacz, co z niej masz.',
    tabsLabel: 'Warstwy systemu',
    gainLabel: 'Co zyskujesz',
    whyLabel: 'Dlaczego tak:',
  },
}

/**
 * The rebuild button of „Dlaczego nie WordPress” — the package writes its price as text; the
 * page takes it from `Solutions` (spec. §4 pkt 8, ADR-014 v20 10). `{cena:…}` brings „zł”.
 */
export const REBUILD_BUTTON = {
  package: 'Przebudowa od 1 499 zł →',
  token: 'Przebudowa od {cena:przebudowa-starej-strony} →',
} as const

/**
 * `home` with the package's rebuild button label swapped for the price token; any other label
 * (edited in the panel) stays. `null` when there is nothing to swap.
 */
export function homeWithPriceTokens(stored: unknown): Record<string, unknown> | null {
  if (!isRecord(stored) || !isRecord(stored.whyNotWordpress)) return null
  const why = stored.whyNotWordpress
  const cta = isRecord(why.cta) ? why.cta : null
  if (!cta || !Array.isArray(cta.buttons)) return null
  let swapped = false
  const buttons = cta.buttons.map((button: unknown) => {
    if (!Array.isArray(button) || button[0] !== REBUILD_BUTTON.package) return button
    swapped = true
    return [REBUILD_BUTTON.token, ...button.slice(1)]
  })
  if (!swapped) return null
  return { ...stored, whyNotWordpress: { ...why, cta: { ...cta, buttons } } }
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

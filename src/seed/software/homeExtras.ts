import type { SoftwareHomeSections } from '../../lib/software/home'

/**
 * Headings of the start page sections the board `Main` keeps in its HTML, not in
 * `strona-glowna.json` (SW5, ADR-014 doprecyzowania SW5). The package file stays 1:1;
 * `softwareSettingsData()` adds these to its copy of `home`.
 */
export const HOME_SECTION_TEXTS: SoftwareHomeSections = {
  areas: {
    eyebrow: 'Oferta · 8 obszarów',
    title: 'Co możemy dla Ciebie zrobić',
    lead: 'Kliknij obszar: zobaczysz, co dokładnie robimy, co z tego masz i ile kosztuje.',
    priceCaption: 'Cena',
    wizardButton: 'Dobierz w 60 s',
  },
  popular: {
    eyebrow: 'Najczęściej zamawiane',
    title: 'Najczęściej zamawiane — z ceną i terminem',
    lead: 'Każda z ceną „od”, terminem i listą tego, co jest w cenie. Wszystkie 29 rozwiązań znajdziesz w pełnej ofercie.',
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
          text: 'raport w 2 dni robocze',
          href: '/audyt',
          icon: 'search',
        },
      ],
      button: ['Pełna oferta →', '/rozwiazania'],
    },
  },
  livePreviews: {
    eyebrow: 'Podglądy na żywo · kliknij i sprawdź',
    title: 'Tak może wyglądać Twoja strona albo system.',
    lead: 'Wybierz rodzaj rozwiązania. Laptop to Twoje biuro, telefon to Twój pracownik albo klient. Oba ekrany działają razem.',
    hint: ['Przełącza się samo. Kliknij, żeby wybrać.', 'Twój wybór. Klikaj po ekranach.'],
    open: 'Otwórz pełny podgląd',
    add: ['Chcę takie u siebie', '✓ W Twoim projekcie'],
  },
  process: {
    eyebrow: 'Jak pracujemy i jak powstaje cena',
    title: 'Od rozmowy do działającego systemu — większość płacisz po odbiorze',
    lead: 'Pięć etapów. Przy każdym wiesz, co dostajesz do ręki i kiedy płacisz.',
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
  howWeBuild: {
    eyebrow: 'Jak robimy strony i systemy',
    title: 'Piszemy stronę pod Twoją firmę, nie składamy jej z szablonu',
    lead: 'Wiele firmowych stron powstaje z gotowego szablonu i kilkunastu wtyczek. Działa, dopóki ktoś to pilnuje. My piszemy stronę od podstaw, dlatego dostajesz trzy rzeczy, które da się zmierzyć.',
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
    result: 'Wynik szybkości każdej oddanej strony zapisujemy w protokole odbioru.',
  },
  technologies: {
    eyebrow: 'Z czego budujemy i co z tego masz',
    title: 'Z czego budujemy — i co z tego masz',
    lead: 'Nazw nie musisz znać. Kliknij warstwę i zobacz, co z niej masz.',
    tabsLabel: 'Warstwy systemu',
    gainLabel: 'Co zyskujesz',
    whyLabel: 'Dlaczego tak:',
  },
  compare: {
    eyebrow: 'Dlaczego my',
    title: 'Freelancer, agencja czy PRO-KOM?',
    tabs: ['vs freelancer', 'vs agencja z miasta'],
  },
  heroPanel: {
    title: 'Twoja Firma · panel',
    live: 'na żywo',
    items: [
      {
        icon: 'mail',
        title: 'Nowe zapytanie ze strony',
        sub: 'Remont łazienki · Kowalscy',
        time: 'teraz',
      },
      {
        icon: 'pin',
        title: 'Ekipa Marka na miejscu',
        sub: 'Poddasze · zdjęcia w zleceniu',
        time: '8:05',
      },
      {
        icon: 'check',
        title: 'Faktura wysłana sama',
        sub: 'Zlecenie #128 · 5 990 zł',
        time: '9:12',
      },
    ],
    footer: { label: 'Podgląd do klikania', value: 'w 5–7 dni' },
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

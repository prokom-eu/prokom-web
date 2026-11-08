import type { PostCategory } from '@/lib/posts/list'

/*
 * Texts of the guide `/poradnik` and of its posts `/poradnik/<slug>` (`zrodlo/pages/Poradnik.*`,
 * `PoradnikRodo.*`). The posts are `Posts` of the tenant (title, lead, content, SEO in the panel);
 * the short answers on the service pages and the widgets of the camera post (summary, who does
 * what, the self-check) live here. Without the prototype's internal note („W prototypie pełny
 * tekst ma pierwszy poradnik…”) and without source lists (spec §2).
 */

/** The category chips of `/poradnik` (the prototype's `CATS`) → `POST_CATEGORIES` values. */
export const GUIDE_CATEGORIES: { key: PostCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Wszystkie' },
  { key: 'monitoring', label: 'Monitoring' },
  { key: 'noclegi', label: 'Obiekty noclegowe' },
  { key: 'energia', label: 'Energia' },
  { key: 'dzwiek-obraz', label: 'Dźwięk i obraz' },
]

export type GuideAnswer = {
  category: PostCategory
  title: string
  text: string
  href: string
}

/** Short answers on the service pages (the prototype's `A`): cards that lead to a section. */
export const GUIDE_ANSWERS: GuideAnswer[] = [
  {
    category: 'monitoring',
    title: 'Ile dni nagrań potrzebujesz i jaki dysk dobrać',
    text: 'Kalkulator i wzór: liczba kamer, strumień, pojemność dysku.',
    href: '/monitoring#nagrania',
  },
  {
    category: 'monitoring',
    title: 'Twarz czy sylwetka? Jak dobrać kamerę do odległości',
    text: 'Progi DORI z normy PN-EN 62676-4 i kalkulator pikseli na metr.',
    href: '/monitoring#ile-widac',
  },
  {
    category: 'energia',
    title: 'Ładowarka dla gości pensjonatu: moc i formalności',
    text: 'Jaką moc wybrać do pensjonatu i w czym pomagamy przed uruchomieniem ładowarki.',
    href: '/ladowarki-ev#formalnosci',
  },
  {
    category: 'noclegi',
    title: 'Zamek z kodem i system rezerwacji: co z czym działa',
    text: 'Smoobu, Beds24, Hotres i zamki, które obsługują.',
    href: '/kontrola-dostepu#apartamenty',
  },
  {
    category: 'dzwiek-obraz',
    title: 'DVB-T2 i anteny w górach',
    text: 'Od kiedy Małopolska nadaje w DVB-T2 i co zrobić, gdy stok zasłania nadajnik.',
    href: '/anteny#multipleksy',
  },
  {
    category: 'noclegi',
    title: 'Przegląd przed sezonem: co sprawdzamy',
    text: 'Kamery, dyski, Wi-Fi, zamki, ładowarka i ekrany przed feriami i wakacjami.',
    href: '/serwis#plany',
  },
]

/** „minuta / minuty / minut” for the reading time. */
export function minutesWord(n: number): string {
  if (n === 1) return 'minuta'
  const last = n % 10
  const lastTwo = n % 100
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? 'minuty' : 'minut'
}

export const poradnik = {
  categoriesLabel: 'Kategoria poradnika',
  featured: {
    tag: 'Polecany',
    minutes: (n: number) => `${n} ${minutesWord(n)} czytania`,
    read: 'Czytaj poradnik →',
  },
  answerMeta: 'Krótka odpowiedź na stronie usługi →',
  postMeta: 'Czytaj poradnik →',
  empty: 'W tej kategorii dopiero przygotowujemy poradniki.',
  updated: 'aktualizacja',
  author: 'PRO-KOM Instalacje',
  toc: 'Spis treści',
  summary: 'W skrócie',
  aside: {
    plan: 'Zaplanuj instalację',
    readAlso: 'Czytaj też',
  },
}

export type GuideExtras = {
  /** Short labels of the table of contents, in the order of the post's h2 headings. */
  toc: string[]
  summary: string[]
  /** „Co robi instalator, a co właściciel” after the content. */
  roles?: {
    heading: string
    we: { title: string; items: string[] }
    you: { title: string; items: string[] }
  }
  /** „Sprawdź swój monitoring”: the checklist with its result. */
  quiz?: {
    heading: string
    items: string[]
    initial: number[]
    done: string
    partial: (n: number, all: number) => string
  }
  /** The art of the „Polecany” card: an icon and an optional sign. */
  featured: { icon: 'cam' | 'book'; sign: string | null }
  aside: { icon: 'cam'; title: string; text: string; link: { label: string; href: string } }
  readAlso: { label: string; href: string }[]
  /** The band before the footer. */
  band: { eyebrow: string; heading: string; text: string }
}

/** Widgets of a post by its slug (`PoradnikRodo.js`). */
export const GUIDE_EXTRAS: Record<string, GuideExtras> = {
  'monitoring-a-rodo': {
    toc: [
      'Czy można',
      'Gdzie tak, gdzie nie',
      'Jak długo nagrania',
      'Tabliczka',
      'Kamera a sąsiad',
      'Bez dźwięku',
      'Pracownicy',
      'Kto co robi',
      'Sprawdź się',
    ],
    summary: [
      'Kamery w pensjonacie pilnują wejścia, parkingu i narciarni. Za monitoring odpowiada właściciel obiektu.',
      'Parking, wejście, narciarnia: tak. Pokoje, łazienki, sauna, posesje sąsiadów: nie.',
      'Nagrania nadpisują się same po kilku dniach. Czas ustawiamy przy montażu.',
      'Sama naklejka z kamerą nie wystarczy. Potrzebna tabliczka i pełna informacja.',
    ],
    roles: {
      heading: 'Co robi instalator, a co właściciel',
      we: {
        title: 'My, przy montażu',
        items: [
          'Kadry kamer i maski prywatności',
          'Czas nadpisywania nagrań',
          'Hasła i konta tylko dla upoważnionych',
          'Miejsca na tabliczki',
        ],
      },
      you: {
        title: 'Ty, jako właściciel',
        items: [
          'Cel monitoringu',
          'Informacja dla gości i pracowników',
          'Zasady monitoringu dla pracowników',
          'Udostępnianie nagrań na wniosek',
        ],
      },
    },
    quiz: {
      heading: 'Sprawdź swój monitoring',
      items: [
        'Kamery nie obejmują pokoi, łazienek ani sauny',
        'Posesja sąsiada i droga są zamaskowane',
        'Mikrofony w kamerach są wyłączone',
        'Nagrania nadpisują się automatycznie po ustalonym czasie',
        'Przy wejściu w strefę wisi tabliczka o monitoringu',
        'Pełna informacja jest w recepcji lub na stronie',
        'Hasła do rejestratora są zmienione z fabrycznych',
      ],
      initial: [0, 2],
      done: 'Wygląda dobrze. Warto co sezon sprawdzić, czy nic się nie przestawiło.',
      partial: (n, all) =>
        `${n} z ${all}. Brakujące punkty techniczne ustawimy przy przeglądzie. Przy pozostałych podpowiemy, co przygotować.`,
    },
    featured: { icon: 'cam', sign: null },
    aside: {
      icon: 'cam',
      title: 'Ustawimy monitoring według tego poradnika',
      text: 'Strefy, maski, czas nagrań i miejsca na tabliczki. Wycena po wizji lokalnej.',
      link: { label: 'Kadr i maski prywatności', href: '/monitoring#rodo' },
    },
    readAlso: [
      { label: 'Ile dni nagrań i jaki dysk', href: '/monitoring#nagrania' },
      { label: 'Wi-Fi dla gości', href: '/sieci-wifi#portal' },
      { label: 'Przegląd przed sezonem', href: '/serwis#plany' },
    ],
    band: {
      eyebrow: 'Kamery w pensjonacie',
      heading: 'Chcesz, żebyśmy sprawdzili Twój monitoring?',
      text: 'Przegląd kadrów, masek, czasu nagrań i haseł. Bez wymiany sprzętu, jeśli nie trzeba.',
    },
  },
}

import type { GuideCategory } from './wpisy'

/*
 * Texts of the guide `/poradnik` and of its posts `/poradnik/<slug>` (`zrodlo/pages/Poradnik.*`).
 * The posts themselves are written in `wpisy/` (runda v6 §3; title, lead, content and SEO go to
 * the panel's `Posts`); the chips, the short answers on the service pages and the shared labels
 * live here. Without source lists (spec §2).
 */

/** Runda v6 §3.3: the category chips of `/poradnik`, without „Przepisy”. */
export const GUIDE_CATEGORIES: { key: GuideCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Wszystkie' },
  { key: 'monitoring', label: 'Monitoring' },
  { key: 'alarmy', label: 'Alarmy' },
  { key: 'sieci', label: 'Sieci' },
  { key: 'smart-home', label: 'Smart home' },
  { key: 'ladowarki', label: 'Ładowarki' },
  { key: 'anteny', label: 'Anteny' },
  { key: 'noclegi', label: 'Dla obiektów noclegowych' },
]

export type GuideAnswer = {
  category: GuideCategory
  title: string
  /** 3–5 sentences: the answer itself, then where to read more. */
  text: string
  href: string
}

/**
 * Short answers on the service pages: cards that lead to a section. Runda v6 §3.1: only the ones
 * without law, each a concrete answer of 3–5 sentences.
 */
export const GUIDE_ANSWERS: GuideAnswer[] = [
  {
    category: 'monitoring',
    title: 'Ile dni nagrań zmieści dysk w rejestratorze',
    text: 'To zależy od liczby kamer, rozdzielczości i tego, czy kamery nagrywają cały czas, czy tylko ruch. Rejestrator sam nadpisuje najstarsze nagrania, więc nie trzeba niczego kasować. Policz to w kalkulatorze na stronie Monitoringu.',
    href: '/monitoring#nagrania',
  },
  {
    category: 'monitoring',
    title: 'Z jakiej odległości kamera pokaże twarz',
    text: 'Im dalej stoi człowiek, tym mniej pikseli obrazu przypada na metr. Z bliska rozpoznasz twarz, z daleka zobaczysz tylko sylwetkę. Dlatego kamerę przy furtce dobieramy inaczej niż kamerę parkingu. Sprawdź to w kalkulatorze.',
    href: '/monitoring#ile-widac',
  },
  {
    category: 'ladowarki',
    title: 'Ładowarka dla gości pensjonatu: jaka moc',
    text: 'Moc ładowarki dobieramy do przyłącza budynku i do tego, jak długo goście stoją na parkingu. Przy noclegu wystarcza zwykle ładowanie przez noc. Pomagamy też w formalnościach przed uruchomieniem.',
    href: '/ladowarki-ev#formalnosci',
  },
  {
    category: 'noclegi',
    title: 'Zamek z kodem i system rezerwacji: co z czym działa',
    text: 'Zamek z kodem może dostać kod prosto z systemu rezerwacji, więc gość wchodzi sam, bez przekazywania kluczy. Zanim dobierzemy zamek, sprawdzamy, z jakim systemem pracujesz, np. Smoobu, Beds24 albo Hotres. Lista zamków i integracji jest na stronie Kontroli dostępu.',
    href: '/kontrola-dostepu#apartamenty',
  },
  {
    category: 'anteny',
    title: 'DVB-T2 i anteny w górach',
    text: 'W górach stok potrafi zasłonić nadajnik, a halny szarpie masztem. Dlatego antenę ustawiamy miernikiem sygnału. Na stronie Anten sprawdzisz, które multipleksy odbierzesz.',
    href: '/anteny#multipleksy',
  },
  {
    category: 'noclegi',
    title: 'Przegląd przed sezonem: co sprawdzamy',
    text: 'Przed feriami i wakacjami czyścimy kamery, sprawdzamy dyski, akumulatory, Wi-Fi, zamki, ładowarkę i ekrany. Dzięki temu usterki wychodzą, zanim przyjadą goście. Zakres przeglądu i plany serwisowe znajdziesz na stronie Serwisu.',
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
  howWeDo: 'Jak to robimy w PRO-KOM',
  faq: 'Najczęstsze pytania',
  /** „Z Poradnika” on the service pages (runda v6 §3.3). */
  fromGuide: { eyebrow: 'Z Poradnika', heading: 'Poradniki do tej usługi', all: 'Cały poradnik' },
}

/**
 * Fixed texts of the Software news pages: the list from the board `AU-aktualnosci`
 * (TRESCI-v24 `p_aktualnosci`), the post from the v23 board `Wpis` (spec. §6.8).
 */
export const SOFTWARE_NEWS_TEXTS = {
  title: 'Aktualności',
  eyebrow: 'Poradniki · nowości · konkrety',
  heading: 'Aktualności',
  headingEm: 'bez lania wody.',
  lead: 'Piszemy o tym, o co pytają nas klienci: ile coś kosztuje, co się opłaca i jak nie przepłacić. Krótko, z liczbami i źródłami.',
  description:
    'Poradniki PRO-KOM Software dla właścicieli firm: ile kosztuje strona, system albo automatyzacja, co się opłaca i jak nie przepłacić. Z liczbami i źródłami.',
  all: 'Wszystkie',
  /** „6 wpisów” next to the chips. */
  count: ['wpis', 'wpisy', 'wpisów'],
  featured: 'wyróżniony',
  read: 'Czytaj wpis →',
  /** The CTA closing the list (board: instead of the band above the footer). */
  listCta: {
    eyebrow: 'Zamiast czytać — sprawdź',
    title: 'Darmowy audyt',
    em: 'Twojej strony.',
    text: 'Szybkość, telefon, Google i formularze. Raport z liczbami w 2 dni robocze, bez zobowiązań.',
    link: { label: 'Zamów darmowy audyt →', href: '/audyt' },
  },
  empty: 'Pierwsze wpisy są w drodze. Zajrzyj wkrótce albo zapytaj nas od razu.',
  minutes: 'min czytania',
  updated: 'aktualizacja:',
  outline: 'W tym tekście',
  summary: 'Krótko',
  sources: 'Źródła',
  checkedOn: 'stan na',
  /** `PostView.verified` is the earliest check of the sources — what the post may claim. */
  lastChecked: 'Najstarsze sprawdzenie danych:',
  author: 'Autor',
  aboutLink: 'O firmie →',
  readMoreEyebrow: 'Czytaj dalej',
  readMore: 'Powiązane poradniki.',
  solutionsEyebrow: 'Z tego wpisu',
  solutions: 'Rozwiązania, o których piszemy.',
  /** CTA in the middle of a post when the post has none of its own (spec. §6.8). */
  audit: {
    title: 'Ile kosztuje Cię dziś Twoja strona?',
    text: 'Sprawdzimy za darmo: szybkość, bezpieczeństwo, Google i AI. Raport na piśmie.',
    link: { label: 'Zamów darmowy audyt →', href: '/audyt' },
  },
  contact: {
    heading: 'Masz pytanie o swoją stronę albo system?',
    text: 'Napisz, co masz i czego potrzebujesz. Odpowiemy konkretnie, bez sprzedawania na siłę.',
    link: { label: 'Napisz do nas', href: '/kontakt' },
  },
} as const

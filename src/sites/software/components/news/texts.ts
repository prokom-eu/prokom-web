/** Fixed texts of the Software news pages, from the boards `Aktualnosci` and `Wpis` (spec. §6.8). */
export const SOFTWARE_NEWS_TEXTS = {
  title: 'Aktualności',
  eyebrow: 'Aktualności i poradnik',
  heading: 'Konkretnie o stronach i systemach.',
  lead: 'Poradniki dla właścicieli firm, nowości i nasze realizacje. Bez żargonu, z liczbami i źródłami.',
  description:
    'Poradniki dla właścicieli firm o stronach, systemach i aplikacjach, nowości i realizacje PRO-KOM Software. Bez żargonu, z liczbami i źródłami.',
  all: 'Wszystko',
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

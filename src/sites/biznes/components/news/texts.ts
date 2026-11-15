/**
 * Fixed texts of the Biznes news pages, 1:1 from the boards `Aktualnosci` and `Wpis`. No legal
 * facts here: those live in the panel (posts with sources, the KSeF panel in the settings).
 */
export const NEWS_TEXTS = {
  title: 'Aktualności',
  /** `<title>` within 30–60 characters with the suffix (audit 0611 P1-8). */
  seoTitle: 'Aktualności — KSeF, kasy, przepisy dla firm',
  heading: 'Przepisy, terminy i programy po ludzku',
  lead: 'Piszemy o tym, co zmienia się dla małych firm z Podhala: KSeF, kasy, terminale, dofinansowania, bezpieczeństwo. Każdy wpis ze źródłem i datą sprawdzenia.',
  description:
    'Przepisy, terminy i programy dla małych firm z Podhala: KSeF, kasy, terminale, dofinansowania. Każdy wpis ze źródłem i datą sprawdzenia.',
  all: 'Wszystkie',
  empty: 'Nie ma jeszcze wpisów w tej kategorii.',
  emptyAll: 'Nie ma jeszcze wpisów.',
  contactHeading: 'Masz pytanie do któregoś wpisu?',
  contactLead: 'Napisz, czego dotyczy, a odpowiemy na konkretnym przykładzie Twojej firmy.',
  readAlso: 'Czytaj też',
  outline: 'Spis treści',
  summary: 'W skrócie:',
  sources: 'Źródła',
  related: 'Powiązane produkty',
  disclaimer: 'Przepisy mogą się zmienić. Przed decyzją sprawdź aktualne źródło.',
  /** Redesign 15.11: the featured row, the category sections and the card footer. */
  featured: 'Najnowsze',
  featuredLabel: 'Najnowszy wpis',
  read: 'Czytaj wpis',
  minutes: (n: number) => `${n} min czytania`,
  posts: ['wpis', 'wpisy', 'wpisów'] as [string, string, string],
  categories: ['kategoria', 'kategorie', 'kategorii'] as [string, string, string],
  lastPost: 'ostatni',
  onlyCategory: 'Tylko ten temat',
  showSteps: (n: number) => `Pokaż kroki (${n})`,
} as const

/**
 * One line under each category heading of the list (redesign 15.11). What the posts are about,
 * no legal facts — those live in the posts with their sources.
 */
export const CATEGORY_INTROS: Partial<Record<string, string>> = {
  ksef: 'Terminy, uprawnienia, certyfikaty i awarie — co zrobić, żeby faktury szły przez KSeF bez nerwów.',
  kasy: 'Kasa online od zakupu do zamknięcia firmy: fiskalizacja, przeglądy, raporty i ulga.',
  terminale:
    'Płatności kartą w sklepie, lokalu i pensjonacie — połączenie z kasą i przygotowanie na sezon.',
  dofinansowania: 'Ulgi i zwroty dla firm — jak z nich skorzystać i czego pilnować.',
  programy: 'Programy do sprzedaży i faktur — co ustawić i na co uważać.',
  'it-w-firmie': 'Komputery, kopie zapasowe i ochrona danych w małej firmie, bez żargonu.',
}

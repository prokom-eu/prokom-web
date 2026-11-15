/*
 * Texts of the full offer `/uslugi` (`zrodlo/pages/Oferta.body.html` + `Oferta.js`), rewritten
 * „po ludzku” in INST-6 (runda v6 §2). Areas and solutions come from the panel
 * (`InstServices.offer`, `InstSolutions`); the hero and the band before the footer from the page's
 * block (`instOffer`).
 */

/** „rozwiązanie / rozwiązania / rozwiązań” (the prototype's `offerN`). */
export function solutionsWord(n: number): string {
  if (n === 1) return 'rozwiązanie'
  const last = n % 10
  const lastTwo = n % 100
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? 'rozwiązania' : 'rozwiązań'
}

export const oferta = {
  // Runda v6 §2.2: a short eyebrow — the counts without „Pełna oferta” (the crumb says it).
  eyebrow: (areas: number, total: number) =>
    `${total} ${solutionsWord(total)} w ${areas} obszarach`,
  search: {
    placeholder: 'Szukaj: np. kamera, Wi-Fi dla gości, kościół, menu board',
    // RUNDA-V5 §8: examples that change every 3 s while the field is empty and not focused.
    hint: 'Szukaj, np. ',
    hints: ['kamera do domku', 'Wi-Fi dla gości', 'nagłośnienie kościoła', 'zamek z kodem'],
    label: 'Szukaj w ofercie',
    clear: 'Wyczyść',
  },
  filters: {
    open: 'Filtry',
    title: 'Rodzaj obiektu',
    show: (n: number) => `Pokaż ${n} ${solutionsWord(n)}`,
  },
  objects: { label: 'Rodzaj obiektu', all: 'Wszystkie' },
  count: (shown: number, total: number) => ({
    before: 'Pokazujemy ',
    shown: String(shown),
    after: ` z ${total} ${solutionsWord(total)}`,
  }),
  reset: 'pokaż wszystko',
  nav: { label: 'Obszary oferty', title: 'Obszary', plan: 'Zaplanuj instalację' },
  area: {
    page: 'Strona usługi →',
    brands: 'Sprzęt dobieramy pod obiekt. Pracujemy m.in. z:',
    more: (n: number) => `Pokaż wszystkie (${n})`,
    less: 'Zwiń',
  },
  // RUNDA-V5 §8: the phrase goes on to the planner's description (`/zaplanuj?opis=`).
  empty: {
    heading: 'Nie znaleźliśmy tego w ofercie',
    text: 'Opisz, czego szukasz, a dobierzemy rozwiązanie.',
    button: 'Opisz, czego szukasz',
  },
  always: {
    eyebrow: 'Jak pracujemy',
    heading: 'Co dostajesz przy każdej instalacji',
    lead: 'Przy jednej kamerze i przy całym pensjonacie zakres jest ten sam, od wizji lokalnej po serwis. Wycenę i zakres prac dostajesz na piśmie przed montażem.',
    items: [
      'Wizja lokalna i doradztwo',
      'Projekt i wycena na piśmie, zwykle w wariantach do wyboru',
      'Czysty montaż w ustalonym terminie',
      'Konfiguracja aplikacji i kont użytkowników',
      'Sprawdzenie działania przy Tobie',
      'Pokazujemy, jak obsługiwać system i aplikację',
      'Serwis, przeglądy i pomoc zdalna',
    ],
  },
} as const

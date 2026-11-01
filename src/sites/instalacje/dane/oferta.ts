/*
 * Texts of the full offer `/uslugi` (`zrodlo/pages/Oferta.body.html` + `Oferta.js`), 1:1 with the
 * prototype. Areas and solutions come from the panel (`InstServices.offer`, `InstSolutions`); the
 * hero and the band before the footer from the page's block (`instOffer`).
 */

/** „rozwiązanie / rozwiązania / rozwiązań” (the prototype's `offerN`). */
export function solutionsWord(n: number): string {
  if (n === 1) return 'rozwiązanie'
  const last = n % 10
  const lastTwo = n % 100
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? 'rozwiązania' : 'rozwiązań'
}

export const oferta = {
  eyebrow: (areas: number, total: number) =>
    `Pełna oferta · ${areas} obszarów · ${total} ${solutionsWord(total)}`,
  search: {
    placeholder: 'Szukaj: np. kamera, Wi-Fi dla gości, kościół, menu board',
    label: 'Szukaj w ofercie',
    clear: 'Wyczyść',
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
  empty: {
    before: 'Nic nie pasuje do tego wyszukiwania. Spróbuj innego słowa albo ',
    link: 'opisz, czego potrzebujesz',
    after: ', a odpowiemy, czy to robimy.',
  },
  always: {
    eyebrow: 'W każdej instalacji',
    heading: 'Nie sprzedajemy pudełek. Oddajemy działający system.',
    lead: 'Niezależnie od tego, czy to jedna kamera, czy cały pensjonat, zakres jest ten sam: od wizji lokalnej po serwis. Wszystko na piśmie przed montażem.',
    items: [
      'Wizja lokalna i doradztwo',
      'Projekt i wycena na piśmie, zwykle w wariantach do wyboru',
      'Montaż czysto i w ustalonym terminie',
      'Konfiguracja aplikacji i kont użytkowników',
      'Sprawdzenie działania przy Tobie',
      'Pokazujemy obsługę i aplikację',
      'Serwis, przeglądy i pomoc zdalna',
    ],
  },
} as const

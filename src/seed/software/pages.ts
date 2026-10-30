import type { SoftwareNotFound, SoftwareThanks } from '../../lib/software/pages'

/**
 * Start texts of `/dziekujemy` from the board `Dziekujemy` (the package has no JSON for it,
 * ADR-014 doprecyzowania SW2a 9). Numbers are facts: `[CZAS ODPOWIEDZI]`, `[GODZINY]`.
 * The lead leaves out the board's „Potwierdzenie … wysłaliśmy na podany adres e-mail”: e-mail
 * is optional in the forms, so the sentence would not always be true.
 */
export const SOFTWARE_THANKS: SoftwareThanks = {
  title: 'Dziękujemy, mamy to.',
  lead: 'Twoja wiadomość trafiła prosto do zespołu PRO-KOM Software.',
  numberLabel: 'Numer zgłoszenia',
  stepsTitle: 'Co dalej',
  steps: [
    '**W ciągu [CZAS ODPOWIEDZI]** oddzwonimy albo odpiszemy, jak wolisz. Dopytamy o szczegóły.',
    '**Krótka rozmowa, 30 minut**: u Ciebie, w salonie w Rabce albo online. Pokażesz, jak dziś pracujesz.',
    '**Szkic do klikania i wycena na piśmie**, ważna 30 dni. Decydujesz Ty, bez zobowiązań.',
  ],
  urgent: 'Pilna sprawa? Zadzwoń:',
  hours: '[GODZINY]',
  more: {
    eyebrow: 'Zanim się odezwiemy',
    title: 'Zobacz, jak to wygląda u innych.',
    cards: [
      {
        title: 'Podglądy do klikania',
        text: 'Przykładowe strony i panele, które możesz przeklikać na telefonie, zanim cokolwiek zamówisz.',
        cta: 'Otwórz podglądy →',
        href: '/#podglady',
      },
      {
        title: 'Aktualności i poradnik',
        text: 'Ile kosztuje strona, kiedy warto mieć system, jak przygotować się do KSeF. Bez żargonu.',
        cta: 'Czytaj poradnik →',
        href: '/aktualnosci',
      },
      {
        title: 'Wróć na stronę główną',
        text: 'Dorzuć do zgłoszenia kolejne rozwiązania przyciskiem „+ Dodaj do wyceny”, wycenimy całość naraz.',
        cta: 'Strona główna →',
        href: '/',
      },
    ],
  },
}

/**
 * Start texts of the Software 404 from the board `NieZnaleziono`. Prices in the tile notes are
 * panel text (the field description reminds to keep them in line with the price list).
 */
export const SOFTWARE_NOT_FOUND: SoftwareNotFound = {
  title: 'Tej strony tu nie ma. Reszta jest.',
  lead: 'Adres mógł się zmienić albo w linku wkradła się literówka. Wpisz, czego szukasz, albo wybierz jedno z miejsc poniżej.',
  search: { label: 'Czego szukasz?', button: 'Szukaj', popularLabel: 'Często szukane:' },
  wizard: {
    title: 'Nie wiesz, czego szukać?',
    text: 'Kreator dobierze rozwiązanie w 60 sekund: 5 krótkich kroków i cena od razu.',
    cta: 'Uruchom kreator →',
    href: '/dobierz',
  },
  places: {
    eyebrow: 'Popularne miejsca',
    title: 'Dokąd chcesz pójść?',
    tiles: [
      {
        title: 'Strony internetowe',
        note: 'od 999 zł netto',
        href: '/rozwiazania?kategoria=strony',
      },
      {
        title: 'Systemy i panele',
        note: 'od 2 990 zł netto',
        href: '/rozwiazania?kategoria=systemy',
      },
      { title: 'Cennik', note: 'ceny „od”, na piśmie', href: '/cennik' },
      { title: 'Podglądy do klikania', note: 'zobacz, zanim zamówisz', href: '/#podglady' },
      { title: 'Darmowy audyt strony', note: 'wynik w 2 dni robocze', href: '/audyt' },
      { title: 'Kontakt', note: 'odpowiedź w 1 dzień roboczy', href: '/kontakt' },
    ],
  },
  brokenLink: {
    text: 'Kliknąłeś zepsuty link na naszej stronie? Daj znać, poprawimy.',
    cta: 'Zgłoś błędny link',
    href: '/kontakt',
  },
}

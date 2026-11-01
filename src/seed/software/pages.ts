import type { SoftwareNotFound, SoftwareThanks } from '../../lib/software/pages'

/**
 * Start texts of `/dziekujemy` from the board `Dziekujemy` (the package has no JSON for it,
 * ADR-014 doprecyzowania SW2a 9). Numbers are facts: `[CZAS ODPOWIEDZI]`, `[DNI]`, `[GODZINY]`.
 * The lead leaves out the board's „Potwierdzenie … wysłaliśmy na podany adres e-mail”: e-mail
 * is optional in the forms, so the sentence would not always be true. No KSeF (ZMIANY-v21 §10.4).
 */
export const SOFTWARE_THANKS: SoftwareThanks = {
  title: 'Dziękujemy,',
  titleAccent: 'mamy to.',
  lead: 'Twoja wiadomość trafiła prosto do PRO-KOM Software. Przeczyta ją osoba, która potem buduje Twoją stronę albo system.',
  numberLabel: 'Zgłoszenie',
  stepsTitle: 'Co dalej',
  steps: [
    '**W ciągu [CZAS ODPOWIEDZI]** oddzwonimy albo odpiszemy, jak wolisz. Dopytamy o szczegóły.',
    '**Krótka rozmowa, 30 minut**: u Ciebie, w salonie w Rabce albo online. Pokażesz, jak dziś pracujesz.',
    '**Podgląd do klikania i wycena w [DNI] dni**, ważna 30 dni. Decydujesz Ty, bez zobowiązań.',
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
        icon: 'monitor',
      },
      {
        title: 'Aktualności i poradnik',
        text: 'Ile kosztuje strona, kiedy Excel przestaje wystarczać, WordPress czy strona od podstaw. Bez żargonu.',
        cta: 'Czytaj poradnik →',
        href: '/aktualnosci',
        icon: 'doc',
      },
      {
        title: 'Wróć na stronę główną',
        text: 'Dorzuć do zgłoszenia kolejne rozwiązania przyciskiem „+ Dodaj do wyceny”, wycenimy całość naraz.',
        cta: 'Strona główna →',
        href: '/',
        icon: 'home',
      },
    ],
  },
}

/**
 * Start texts of the Software 404 from the board `NieZnaleziono`. Tile prices come from
 * `Solutions` (`{cena:<slug>}`): the cheapest website and system of the package.
 */
export const SOFTWARE_NOT_FOUND: SoftwareNotFound = {
  title: 'Tej strony tu nie ma.',
  titleAccent: 'Reszta jest.',
  lead: 'Adres mógł się zmienić albo w linku wkradła się literówka. Wpisz, czego szukasz, albo wybierz jedno z miejsc poniżej.',
  search: {
    label: 'np. zlecenia, pensjonat, sklep',
    button: 'Szukaj',
    popularLabel: 'Często szukane:',
  },
  wizard: {
    title: 'Nie wiesz, czego szukać?',
    text: 'Kreator dobierze rozwiązanie w 60 sekund: 4 krótkie kroki i cena od razu.',
    cta: 'Uruchom kreator →',
    href: '/dobierz',
    icon: 'flash',
  },
  places: {
    eyebrow: 'Popularne miejsca',
    title: 'Dokąd chcesz pójść?',
    tiles: [
      {
        title: 'Strony internetowe',
        note: 'od {cena:strona-wizytowka} netto',
        href: '/rozwiazania?kategoria=strony',
        icon: 'site',
      },
      {
        title: 'Systemy i panele',
        note: 'od {cena:z-excela-do-systemu} netto',
        href: '/rozwiazania?kategoria=systemy',
        icon: 'panel',
      },
      { title: 'Cennik', note: 'ceny „od” i terminy', href: '/cennik', icon: 'cash' },
      {
        title: 'Podglądy do klikania',
        note: 'zobacz, zanim zamówisz',
        href: '/#podglady',
        icon: 'monitor',
      },
      {
        title: 'Darmowy audyt strony',
        note: 'wynik w ciągu [CZAS]',
        href: '/audyt',
        icon: 'search',
      },
      {
        title: 'Kontakt',
        note: 'odpowiedź w ciągu [CZAS ODPOWIEDZI]',
        href: '/kontakt',
        icon: 'chat',
      },
    ],
  },
  brokenLink: {
    text: 'Link na naszej stronie prowadzi donikąd? Daj znać, poprawimy go.',
    cta: 'Zgłoś błędny link',
    href: '/kontakt',
  },
}

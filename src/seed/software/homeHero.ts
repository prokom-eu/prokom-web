import type { SoftwareHeroV24 } from '../../lib/software/home'

/**
 * Hero v24 of the Software start page (ZMIANY-v24 §4.1, board `AU-pc`, data `IND` of
 * `v24/wzorzec/aurora.js`). Prices and terms are not here: each slide points to its solution.
 * The seed adds it to a stored home that has none (`run.ts`); on staging it is pasted in the panel
 * (`pnpm -s software:home-json`, STAN „przed stagingiem v24”).
 */
export const HOME_HERO: SoftwareHeroV24 = {
  pill: 'Dla każdej firmy, z każdej branży',
  pillBadge: 'od 2004',
  title: 'Zrobimy Ci',
  lead: 'Strony, przebudowy, systemy i automatyzacje. Najpierw klikasz podgląd swojego projektu, potem decydujesz.',
  query: 'Czego potrzebuje Twoja firma?',
  queryHint: 'wybierz',
  offer: 'Zobacz ofertę →',
  slides: [
    {
      word: 'stronę wizytówkę.',
      name: 'Strona wizytówka',
      text: 'telefon, mapa i formularz na jednym ekranie',
      solution: 'strona-wizytowka',
      mockup: { kind: 'site', variant: 'wizytowka' },
      icon: 'M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
    },
    {
      word: 'stronę firmową.',
      name: 'Strona firmowa',
      text: 'oferta, realizacje i opinie, panel po polsku',
      solution: 'strona-firmowa-z-panelem',
      mockup: { kind: 'site', variant: 'firmowa' },
      icon: 'M3 4h18v12H3zM8 20h8M12 16v4M7 8h6M7 11h4',
    },
    {
      word: 'rozbudowaną stronę.',
      name: 'Rozbudowana strona',
      text: 'dziesiątki podstron, blog i języki',
      solution: 'rozbudowana-strona-firmowa',
      mockup: { kind: 'site', variant: 'rozbudowana' },
      icon: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
    },
    {
      word: 'stronę hotelu.',
      name: 'Hotel i pensjonat',
      text: 'pokoje i zapytania bez prowizji portalu',
      solution: 'strona-dla-hotelu-lub-pensjonatu',
      mockup: { kind: 'site', variant: 'pensjonat' },
      icon: 'M2 20l7-11 4 6 3-4 6 9zM17 5a2 2 0 1 0 0 .1',
    },
    {
      word: 'stronę restauracji.',
      name: 'Restauracja',
      text: 'menu zmieniasz sam, rezerwacja stolika',
      solution: 'strona-dla-restauracji-lub-baru',
      mockup: { kind: 'site', variant: 'restauracja' },
      icon: 'M7 3v8a2 2 0 0 0 4 0V3M9 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9',
    },
    {
      word: 'system dla firmy.',
      name: 'System dla firmy',
      text: 'zamówienia, klienci i zadania w jednym panelu',
      solution: 'system-zlecen-i-grafik-ekip',
      mockup: { kind: 'dash', variant: 'zamowienia' },
      icon: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
    },
    {
      word: 'automatyzacje i AI.',
      name: 'Automatyzacje i AI',
      text: 'SMS-y, faktury i odpowiedzi idą same',
      solution: 'asystent-ai-do-zapytan',
      mockup: { kind: 'flow', variant: 'ai' },
      icon: 'M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2zM19 16l1 2.5 2.5 1-2.5 1L19 23l-1-2.5-2.5-1 2.5-1z',
    },
  ],
  trust: [
    { v: '5–7 dni', l: 'podgląd do klikania' },
    { v: '< 2,5 s', l: 'strona na telefonie' },
    { v: '100%', l: 'kod i dane Twoje' },
  ],
  industries: [
    'Biura rachunkowe',
    'Firmy transportowe',
    'Kancelarie',
    'Hotele i pensjonaty',
    'Restauracje',
    'Hurtownie',
    'Producenci',
    'Drukarnie',
    'Gabinety i kliniki',
    'Szkoły i kursy',
    'Serwisy',
    'Biura nieruchomości',
    'Agencje',
    'Firmy budowlane',
    'Warsztaty',
    'Stowarzyszenia',
  ],
}

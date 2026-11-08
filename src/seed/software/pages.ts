import type { SoftwareNotFound, SoftwareThanks } from '../../lib/software/pages'

/**
 * Start texts of `/dziekujemy` from the board `AU-dziekujemy` (TRESCI-v24). The response time is
 * the fact `[CZAS ODPOWIEDZI]`; the phone button takes the line's number from the settings.
 */
export const SOFTWARE_THANKS: SoftwareThanks = {
  numberLabel: 'Zgłoszenie przyjęte · nr',
  title: 'Dziękujemy.',
  titleAccent: 'Odezwiemy się w ciągu [CZAS ODPOWIEDZI].',
  // TRESCI-v24 promises a copy by e-mail; it goes only when the visitor gave an address
  // (`lib/inquiry/emails.ts`), so the sentence says so.
  lead: 'Jeśli podałeś e-mail, wysłaliśmy na niego kopię zgłoszenia. Pilna sprawa? Zadzwoń i podaj numer zgłoszenia.',
  steps: [
    {
      title: 'Odpowiadamy',
      text: 'Oddzwonimy albo odpiszemy — jak wolisz. Dopytamy o to, czego brakuje.',
    },
    {
      title: 'Rozmowa 30 min',
      text: 'Telefon, wideo albo kawa w Rabce. Bezpłatnie, bez zobowiązań.',
    },
    { title: 'Podgląd i wycena', text: 'Szkic do klikania, zakres, cena i termin na piśmie.' },
  ],
  actions: [
    { label: 'Zobacz podglądy →', href: '/#podglady' },
    { label: 'Poczytaj w Aktualnościach', href: '/aktualnosci' },
  ],
}

/**
 * Start texts of the Software 404 from the board `AU-404` (TRESCI-v24). The offer tile says
 * „rozwiązania z ceną i terminem” instead of the board's count (it would go stale); the contact
 * tile shows the line's phone (`[TELEFON]`). Prices, if a tile names one, only as `{cena:<slug>}`.
 */
export const SOFTWARE_NOT_FOUND: SoftwareNotFound = {
  eyebrow: 'Błąd 404',
  title: 'Tej strony',
  titleAccent: 'tu nie ma.',
  lead: 'Adres mógł się zmienić albo wkradła się literówka. Wszystko inne działa — wyszukaj albo wybierz, dokąd chcesz przejść.',
  search: 'Czego szukasz? Np. „strona wizytówka”',
  tiles: [
    { title: 'Oferta', note: 'rozwiązania z ceną i terminem', href: '/rozwiazania', icon: 'grid' },
    { title: 'Kreator 60 s', note: 'cena i termin od razu', href: '/dobierz', icon: 'flash' },
    { title: 'Darmowy audyt', note: 'raport w ciągu [CZAS]', href: '/audyt', icon: 'search' },
    { title: 'Podglądy', note: 'kliknij przykładowe strony', href: '/#podglady', icon: 'monitor' },
    { title: 'Aktualności', note: 'poradniki i nowości', href: '/aktualnosci', icon: 'doc' },
    { title: 'Kontakt', note: '[TELEFON]', href: '/kontakt', icon: 'phone' },
  ],
  home: 'Strona główna →',
  call: 'Zadzwoń:',
}

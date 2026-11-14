import type { SharedGroup } from './types'

/**
 * Shared fields of pro-kom.eu (spec §5, boards Naglowek and Stopka). Pages of v1.1 (Dla domu,
 * Załatw online, Pomoc, Współpraca, Partnerzy, Gdzie działamy, Aktualności, Mapa strony) are in the
 * columns, but the frame shows a link only when `HubSettings.pages` turns the page on — no dead
 * links (spec §2.2). The „Cała oferta” column is built from the lines of `CompanyData`.
 */
export const PROKOM_SHARED: SharedGroup = {
  phoneLabel: 'Firma:',
  hours: 'pn–pt 9:00–17:00',
  // TODO(krystian): dokładny adres „Status naprawy” na prokomserwis.pl.
  brandBarSlot: { label: 'Status naprawy', href: 'https://prokomserwis.pl' },
  headerCta: { label: 'Dobierz w 10 s', href: '/#dobierz', counter: 'none' },
  tabBar: {
    second: { label: 'Oferta', href: '/linie' },
    center: { label: 'Dobierz', href: '/#dobierz', icon: 'spark' },
    fourth: { label: 'Załatw', href: '/zalatw-online', icon: 'bolt' },
  },
  rail: {
    sections: [
      { anchorId: 'start', label: 'Start', icon: 'home' },
      { anchorId: 'linie', label: 'Linie', icon: 'grid' },
      { anchorId: 'dobierz', label: 'Dobierz', icon: 'spark' },
      { anchorId: 'narzedzia', label: 'Załatw online', icon: 'bolt' },
      { anchorId: 'pomoc', label: 'Co zrobić, gdy…', icon: 'help' },
      { anchorId: 'wspolpraca', label: 'Współpraca', icon: 'building' },
      { anchorId: 'marki', label: 'Marki', icon: 'shield' },
      { anchorId: 'zasieg', label: 'Zasięg', icon: 'map' },
      { anchorId: 'aktualnosci', label: 'Aktualności', icon: 'news' },
      { anchorId: 'pytania', label: 'Pytania', icon: 'q' },
      { anchorId: 'kontakt', label: 'Kontakt', icon: 'phone' },
    ],
    searchPopular: [
      'kasa fiskalna',
      'kamery',
      'wi-fi',
      'strona internetowa',
      'pęknięty ekran',
      'komputer do gier',
      'e-faktury',
    ],
    searchShortcuts: [
      { label: 'Cała oferta', href: '/linie' },
      { label: 'Inwestycje i dostawy', href: '/inwestycje-i-dostawy' },
      { label: 'Dla firm', href: '/dla-firm' },
      { label: 'Kontakt', href: '/kontakt' },
    ],
    synonyms: [
      'kamera, kamery, monitoring, CCTV, nagrywanie',
      'kasa, kasy, kasa fiskalna, drukarka fiskalna, paragon',
      'wifi, wi-fi, internet, sieć, router',
      'strona, strona internetowa, www, witryna',
      'ekran, wyświetlacz, szybka',
      'komputer do gier, gaming, pc do gier',
      'e-faktury, ksef, faktury',
    ],
  },
  footerColumns: [
    {
      heading: 'Zacznij od siebie',
      links: [
        { label: 'Dla firm', href: '/dla-firm' },
        { label: 'Dla domu', href: '/dla-domu' },
        { label: 'Inwestycje i dostawy', href: '/inwestycje-i-dostawy' },
        { label: 'Współpraca', href: '/wspolpraca' },
        { label: 'Załatw online', href: '/zalatw-online' },
        { label: 'Pomoc', href: '/pomoc' },
      ],
    },
    {
      heading: 'Firma',
      links: [
        { label: 'O firmie', href: '/o-firmie' },
        { label: 'Partnerzy', href: '/partnerzy' },
        { label: 'Gdzie działamy', href: '/gdzie-dzialamy' },
        { label: 'Kontakt', href: '/kontakt' },
        { label: 'Aktualności', href: '/aktualnosci' },
        { label: 'Mapa strony', href: '/mapa-strony' },
      ],
    },
  ],
}

/** Contact fields of the hub's `SiteSettings` (ADR-H002 §1, table „Firma (hub)”). */
export const PROKOM_SITE = {
  phone: '883 200 151',
  email: 'biuro@pro-kom.eu',
  footer: {
    // Board Stopka, brand block.
    text: 'Strona główna firmy PRO-KOM z Rabki-Zdroju. Jedna firma, pięć linii — każda z własnym zespołem i numerem.',
  },
} as const

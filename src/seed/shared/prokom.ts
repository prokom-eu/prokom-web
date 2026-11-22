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
  // Decyzja 15.11: bez „Status naprawy” (prokomserwis.pl nie ma strony statusu).
  brandBarSlot: { label: 'Serwis telefonów i laptopów', href: 'https://prokomserwis.pl' },
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
      { anchorId: 'alsen', label: 'ALSEN', icon: 'star' },
      { anchorId: 'wspolpraca', label: 'Współpraca', icon: 'building' },
      { anchorId: 'zamowienia', label: 'Zamówienia', icon: 'doc' },
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
      // Not „monitoring”: it is also IT care (Biznes „Opieka IT” — monitoring sprzętu).
      'kamera, kamery, CCTV, nagrywanie',
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
  // `/kontakt` (spec §6.8, H5/H6): H1 of spec §4, topics for `?temat=` — the home page chips use
  // `home.contact.general` and the line names of `CompanyData.lines`: a renamed line must be renamed
  // here too (e2e `hub-glowna` checks it). Form texts. Contact data from the panel, never here.
  contact: {
    // Krystian 22.11: two company numbers as tiles of their own (`heroLayout="calls"`), so the
    // H1 no longer says „one number”; the bar is the hub's e-mail (with „Kopiuj”) · hours.
    h1: 'Zadzwoń albo napisz. Pokierujemy, gdzie trzeba.',
    lead: 'Dzwonisz albo piszesz raz — sprawę przekazujemy do linii, która się nią zajmuje.',
    writeCta: 'Napisz do nas',
    placeKind: 'salon',
    facts: [{ kind: 'email', label: 'E-mail', icon: 'mail' }],
    topics: [
      'Nie wiem / ogólne',
      'Biznes',
      'Instalacje',
      'Software',
      'Tech',
      'Gaming',
      'Dla firm',
      'Dla domu',
      'Inwestycje i dostawy',
      'Współpraca',
    ],
    formTitle: 'Napisz, czego potrzebujesz. Przekażemy to właściwej linii.',
    placeholder: 'Napisz w dwóch zdaniach, czego potrzebujesz.',
    sendLabel: 'Wyślij wiadomość',
    nextSteps: [
      { title: 'Czytamy wiadomość', text: 'Sprawdzamy, która linia się nią zajmie.' },
      { title: 'Odzywa się właściwy zespół', text: 'Telefonem albo e-mailem.' },
      { title: 'Plan albo wycena na piśmie', text: 'Zanim cokolwiek zaczniemy.' },
    ],
    salonKeys: ['rabka'],
  },
  // `/o-firmie` (spec §4, board OFirmie): only the H1 for now — the lead names „pięć linii”, which
  // waits for Krystian's decision (audit H8); other texts come from the shared template.
  about: {
    h1: 'Firma z Rabki, która robi technikę **od początku do końca.**',
  },
}

/** Contact fields of the hub's `SiteSettings` (ADR-H002 §1, table „Firma (hub)”). */
export const PROKOM_SITE = {
  phone: '883 200 151',
  // Second company number on the whole hub (Krystian 15.11): brand bar, footer, sheet, contact.
  phone2: '889 003 889',
  email: 'biuro@pro-kom.eu',
  footer: {
    // Board Stopka, brand block.
    text: 'Strona główna firmy PRO-KOM z Rabki-Zdroju. Jedna firma, pięć linii — każda z własnym zespołem i numerem.',
  },
} as const

/**
 * Landlines and the Zakopane point of the hub (`HubSettings`, decision of Krystian 15.11): the
 * same data as the old pro-kom.eu and the Google business profiles, shown modestly on `/kontakt`
 * and `/o-firmie`. Zakopane is only the Tech service (phones, laptops, computers) — not a company
 * salon, so it is not in `CompanyData.locations` (the other lines show Rabka only).
 */
export const PROKOM_EXTRA_PHONES = [
  { label: 'Biuro (stacjonarny)', number: '18 267 65 11', techPoint: null },
  // Runda 1811 D5: the Tech point of Rabka — shown next to Tech on the hub with Zakopane.
  {
    label: 'Serwis PRO-KOM Tech, Rabka-Zdrój',
    number: '18 541 20 55',
    techPoint: 'Rabka-Zdrój',
  },
] as const

/**
 * Old addresses of the company the boss keeps (runda 1811 D15), on `/kontakt` next to the hub's
 * main address. „Zamówienia”, not „sklep” (no shop on pro-kom.eu, decision 01.11).
 * The shop mailbox in use has always been `sklep@pro-kom.eu` (Krystian 19.11.2026; nobody reads
 * `sklep@pro-kom.pl` and that domain has no MX).
 */
export const PROKOM_EXTRA_EMAILS = [
  { label: 'Biuro (ogólny)', email: 'biuro@pro-kom.eu', published: true },
  { label: 'Zamówienia', email: 'sklep@pro-kom.eu', published: true },
] as const

export const PROKOM_BRANCH = {
  published: true,
  name: 'Zakopane — serwis PRO-KOM Tech',
  street: 'ul. Stanisława Staszica 8',
  postalCode: '34-500',
  city: 'Zakopane',
  phone: '18 541 20 15',
  note: 'Tylko serwis: naprawy telefonów, laptopów i komputerów.',
} as const

/**
 * Menus of the Instalacje site: column order, phone bottom bar, „Więcej”, header CTA.
 * Generated once from `seed/prokominstalacje/wspolne.json` (`src/seed/instalacje/write-dane.ts`);
 * edit here from now on. Names, icons and colours of services and objects: the panel, by key.
 * I3: texts of the top bar, mega menu promos, CTA band and footer copied 1:1 from
 * `docs/design/prokominstalacje/zrodlo/{header,footer}.html` and `common.js` (v4.2), with the
 * „Dla architektów” items of ADR-I005 §4. Top bar „Biznes”, not the prototype's „PRO-KOM Biznes”:
 * another tenant's name on this domain is what the isolation tests look for (`BRAND_LINKS` wording).
 */
import type { Navigation } from './types'

export const navigation: Navigation = {
  serviceColumns: [
    { label: 'Bezpieczeństwo', keys: ['kam', 'alarm', 'kd'] },
    { label: 'Sieci i technika', keys: ['wifi', 'tel', 'ant', 'ev'] },
    { label: 'Komfort i obraz', keys: ['smart', 'snd', 'scr'] },
  ],
  objectColumns: [
    { label: 'Dom i noclegi', keys: ['dom', 'apt', 'pens', 'hotel'] },
    { label: 'Firmy', keys: ['rest', 'sklep', 'firma'] },
    { label: 'Instytucje', keys: ['kosc', 'szk', 'gmina'] },
    { label: 'Budownictwo', keys: ['dev', 'bud'] },
  ],
  bottomBar: [
    { label: 'Start', icon: 'home', featured: false, href: '/' },
    { label: 'Usługi', icon: 'grid', featured: false, sheet: 'services' },
    { label: 'Zaplanuj', icon: 'send', featured: true, href: '/zaplanuj' },
    { label: 'Dla kogo', icon: 'users', featured: false, sheet: 'objects' },
    { label: 'Więcej', icon: 'more', featured: false, sheet: 'more' },
  ],
  sheetTabs: { services: 'Usługi', objects: 'Dla kogo', more: 'Więcej' },
  more: [
    {
      label: 'Dla architektów',
      href: '/dla-architektow',
      icon: 'ruler',
      caption: 'Współpraca, wytyczne do projektu, nowości',
    },
    {
      label: 'Realizacje',
      href: '/realizacje',
      icon: 'star',
      caption: 'Przykłady naszych montaży',
    },
    {
      label: 'Serwis i przeglądy',
      href: '/serwis',
      icon: 'wrench',
      caption: 'Zgłoś awarię, przegląd, przejęcie instalacji',
    },
    {
      label: 'Poradnik',
      href: '/poradnik',
      icon: 'book',
      caption: 'Kamery, Wi-Fi, alarmy i więcej',
    },
    {
      label: 'O firmie',
      href: '/o-firmie',
      icon: 'info',
      caption: 'PRO-KOM od 2004 r., Rabka-Zdrój',
    },
    {
      label: 'Kontakt i dojazd',
      href: '/kontakt',
      icon: 'pin',
      caption: 'Telefon, e-mail, salony',
    },
    {
      label: 'Pełna oferta',
      href: '/uslugi',
      icon: 'layers',
      caption: 'Wszystkie rozwiązania w jednym miejscu',
    },
  ],
  cta: { label: 'Zaplanuj instalację', href: '/zaplanuj' },
  topBar: {
    links: [
      { label: 'Biznes', href: 'https://prokombiznes.pl' },
      { label: 'Software', href: 'https://prokomsoftware.pl' },
      { label: 'Tech · naprawy sprzętu', href: 'https://prokomserwis.pl' },
    ],
    fault: { label: 'Zgłoś awarię', href: '/serwis#zglos' },
  },
  header: [
    { label: 'Dla architektów', href: '/dla-architektow', accent: true },
    { label: 'Realizacje', href: '/realizacje' },
    { label: 'Serwis', href: '/serwis' },
    { label: 'Poradnik', href: '/poradnik' },
    { label: 'O firmie', href: '/o-firmie' },
    { label: 'Kontakt', href: '/kontakt' },
  ],
  megaServices: {
    eyebrow: 'Pełna oferta',
    text: '76 rozwiązań z filtrem po rodzaju obiektu. Projekt, montaż i serwis robi u nas ta sama ekipa.',
    button: { label: 'Zobacz pełną ofertę →', href: '/uslugi' },
    link: { label: 'Nie wiesz, od czego zacząć? Zaplanuj →', href: '/zaplanuj' },
  },
  megaObjects: {
    eyebrow: 'Twój obiekt',
    title: 'Co warto zamontować w Twoim obiekcie',
    text: 'Przekrój budynku, typowe kłopoty i zestawy dla 12 rodzajów obiektów.',
    button: { label: 'Zaplanuj instalację →', href: '/zaplanuj' },
    link: { label: 'Architekt lub projektant? Współpraca →', href: '/dla-architektow' },
  },
  ctaBand: {
    eyebrow: 'Wycena na piśmie',
    title: 'Zaplanuj instalację — oddzwonimy w 1 dzień roboczy',
    text: 'Opisz obiekt w formularzu albo zadzwoń. Przyjedziemy na wizję lokalną, a wycenę dostaniesz na piśmie przed montażem.',
    button: { label: 'Zaplanuj instalację · 2 minuty', href: '/zaplanuj' },
  },
  footer: {
    about:
      'Projektujemy, montujemy i serwisujemy monitoring, alarmy, sieci Wi-Fi, smart home Ampio, nagłośnienie i ekrany. Pracujemy na Podhalu i w Małopolsce od 2004 roku. PRO-KOM Tadeusz Wójciak.',
    chips: [
      { label: 'Projekt · montaż · serwis' },
      { label: 'Podhale i Małopolska' },
      { label: 'Wycena na piśmie', strong: true },
    ],
    plan: {
      label: 'Bez zobowiązań',
      title: 'Zaplanuj instalację',
      caption: '4 kroki · 2 minuty →',
      href: '/zaplanuj',
    },
    company: [
      { label: 'Dla architektów', href: '/dla-architektow' },
      { label: 'O firmie', href: '/o-firmie' },
      { label: 'Realizacje', href: '/realizacje' },
      { label: 'Poradnik', href: '/poradnik' },
      { label: 'Serwis i przeglądy', href: '/serwis' },
      { label: 'Kontakt i dojazd', href: '/kontakt' },
    ],
    sites: [
      { label: 'PRO-KOM · pro-kom.eu', href: 'https://pro-kom.eu' },
      { label: 'Biznes · kasy, komputery, IT', href: 'https://prokombiznes.pl' },
      { label: 'Software · strony i systemy', href: 'https://prokomsoftware.pl' },
      { label: 'Tech · naprawy sprzętu', href: 'https://prokomserwis.pl' },
    ],
  },
}

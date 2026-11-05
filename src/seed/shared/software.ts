import { CONTACT_FAQ_TODO, type SharedGroup, VERIFY_CEIDG, VERIFY_GOOGLE } from './types'

/**
 * Shared fields of prokomsoftware.pl (spec §4.2, §6.3): texts of the boards Chrome, Footer,
 * Kontakt and OFirmie; footer links as in today's navigation (`seed/prokomsoftware/nawigacja.json`).
 * Rail = the sections of the v23 rail without „Realizacje” (MAPA-DZIS §10.1).
 */
export const SOFTWARE_SHARED: SharedGroup = {
  phoneLabel: 'Software:',
  responsePromise: 'Odpowiedź w 1 dzień roboczy',
  brandBarSlot: { label: 'Darmowy audyt', href: '/audyt' },
  headerCta: { label: 'Bezpłatna wycena', href: '/kontakt', counter: 'none' },
  tabBar: {
    second: { label: 'Oferta', href: '/rozwiazania' },
    center: { label: 'Kreator', href: '/dobierz', icon: 'wand' },
  },
  rail: {
    sections: [
      { anchorId: 'start', label: 'Start', icon: 'home' },
      { anchorId: 'oferta', label: 'Oferta', icon: 'grid' },
      { anchorId: 'popularne', label: 'Najczęściej zamawiane', icon: 'star' },
      { anchorId: 'podglady', label: 'Podglądy na żywo', icon: 'monitor' },
      { anchorId: 'dobierz', label: 'Dobierz rozwiązanie', icon: 'flash' },
      { anchorId: 'jak-robimy', label: 'Jak robimy', icon: 'site' },
      { anchorId: 'bez-wordpressa', label: 'Dlaczego nie WordPress', icon: 'shield' },
      { anchorId: 'technologie', label: 'Z czego budujemy', icon: 'server' },
      { anchorId: 'zasady', label: 'Zasady', icon: 'doc' },
      { anchorId: 'faq', label: 'Pytania', icon: 'q' },
      { anchorId: 'kontakt', label: 'Kontakt', icon: 'chat' },
    ],
    searchShortcuts: [
      { label: 'Dobierz rozwiązanie', href: '/dobierz' },
      { label: 'Cennik', href: '/cennik' },
      { label: 'Darmowy audyt', href: '/audyt' },
      { label: 'Kontakt', href: '/kontakt' },
    ],
  },
  footerPromises: [
    'Kod, domena i dane należą do Ciebie',
    'Serwer w Polsce, kopia co noc',
    'Cena i termin na piśmie',
  ],
  footerColumns: [
    {
      heading: 'Oferta',
      links: [
        { label: 'Strony internetowe', href: '/rozwiazania?kategoria=strony' },
        { label: 'Systemy i panele', href: '/rozwiazania?kategoria=systemy' },
        { label: 'Aplikacje mobilne', href: '/rozwiazania?kategoria=aplikacje' },
        { label: 'Automatyzacje i AI', href: '/rozwiazania?kategoria=automatyzacje' },
        { label: 'Opieka i utrzymanie', href: '/rozwiazania?kategoria=opieka' },
        { label: 'Cennik', href: '/cennik' },
      ],
    },
    {
      heading: 'Firma',
      links: [
        { label: 'O firmie', href: '/o-firmie' },
        { label: 'Jedna firma do wszystkiego', href: '/jedna-firma' },
        { label: 'Aktualności', href: '/aktualnosci' },
        { label: 'Darmowy audyt', href: '/audyt' },
      ],
    },
  ],
  legalNote: 'Statystyki bez ciasteczek śledzących',
  contact: {
    h1: 'Opowiedz, jak pracujecie. Odpowiemy z konkretem.',
    lead: 'Po krótkiej rozmowie dostajesz szkic, zakres, cenę i termin. Wszystko na piśmie, bez zobowiązań.',
    writeCta: 'Opisz projekt',
    placeKind: 'spotkanie',
    facts: [
      { kind: 'email', label: 'E-mail', icon: 'mail' },
      { kind: 'text', label: 'Online', value: 'Spotkanie w całej Polsce', icon: 'video' },
      { kind: 'text', label: 'Odpowiedź', value: 'W 1 dzień roboczy', icon: 'clock' },
    ],
    routes: [
      {
        title: 'Potrzebuję strony albo systemu',
        text: 'Kilka kliknięć i znasz cenę „od” oraz termin.',
        cta: 'Kreator · 60 s',
        href: '/dobierz',
      },
      {
        title: 'Mam stronę, chcę ją sprawdzić',
        text: 'Szybkość, telefon, Google i AI. Wynik na piśmie.',
        cta: 'Darmowy audyt',
        href: '/audyt',
      },
      {
        title: 'Program po kimś przestał działać',
        text: 'Przejmujemy kod, serwer i domenę. Najpierw diagnoza.',
        cta: 'Przejęcie i opieka',
        href: '/rozwiazania?kategoria=opieka',
      },
    ],
    topics: ['Strona', 'System lub panel', 'Aplikacja', 'Opieka', 'Audyt'],
    formTitle: 'Najpierw zobaczysz, potem zapłacisz.',
    placeholder: 'np. Mamy grafik ekip w Excelu, chcemy aplikację na telefon.',
    sendLabel: 'Wyślij',
    nextSteps: [
      {
        title: 'Odpowiedź w 1 dzień roboczy',
        text: 'Telefonem albo e-mailem — tak, jak wybierzesz.',
      },
      { title: 'Rozmowa 30 minut', text: 'W Rabce, u Ciebie albo online.' },
      { title: 'Podgląd i wycena · 5–7 dni', text: 'Klikalny podgląd, cena i termin na piśmie.' },
      { title: 'Decyzja', text: 'Strony: 30% zaliczki, reszta po odbiorze.' },
    ],
    mapTitle: 'Spotkamy się w Rabce, u Ciebie albo online.',
    mapLead: 'Pracujemy na Podhalu i w Małopolsce, a zdalnie w całej Polsce.',
    salonKeys: ['rabka'],
    faq: CONTACT_FAQ_TODO,
  },
  about: {
    h1: 'Strony i systemy z Rabki. Firma, która jest tu od 2004 roku.',
    lead: 'Piszemy strony, panele i aplikacje dla firm. Za nami stoi cała PRO-KOM: salon, serwis i lata pracy na Podhalu.',
    authTitle: 'Na czym budujemy',
    auth: ['Next.js', 'Django', 'Serwer w Polsce'],
    stats: [
      { value: '29', label: 'gotowych rozwiązań z ceną „od”' },
      { value: '1 dzień', label: 'roboczy na odpowiedź' },
    ],
    rules: [
      {
        title: 'Zobaczysz, zanim zapłacisz',
        text: 'Klikalny podgląd, zakres, cena i termin na piśmie — zanim wydasz złotówkę.',
      },
      { title: 'Cena i termin na piśmie', text: 'Za stały zakres, bez dopłat w trakcie.' },
      { title: 'Kod i dane są Twoje', text: 'Kod, domena i dane należą do Ciebie.' },
      { title: 'Serwer w Polsce', text: 'Kopia co noc, aktualizacje w opiece.' },
      {
        title: 'Bez wtyczek do łatania',
        text: 'Piszemy pod firmę, nie składamy z gotowych klocków.',
      },
      { title: 'Odpowiedź w 1 dzień roboczy', text: 'Telefonem albo e-mailem.' },
    ],
    steps: [
      { title: 'Rozmowa', text: 'Odpowiedź w 1 dzień roboczy.' },
      { title: 'Podgląd i wycena', text: '5–7 dni, wszystko na piśmie.' },
      { title: 'Budowa etapami', text: 'Każdy etap widzisz na żywo.' },
      { title: 'Wdrożenie i opieka', text: 'Serwer w Polsce, kopie co noc.' },
    ],
    verify: [
      VERIFY_CEIDG,
      {
        title: 'Podglądy na żywo',
        text: 'Klikalne przykłady stron i systemów.',
        href: '/#podglady',
      },
      {
        title: 'Systemy własne PRO-KOM',
        text: 'np. prokomserwis.pl — działa produkcyjnie.',
        href: 'https://prokomserwis.pl',
      },
      VERIFY_GOOGLE,
    ],
    visitText: 'Spotkamy się w Rabce, u Ciebie w firmie albo online — jak Ci wygodniej.',
  },
}

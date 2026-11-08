import { type SharedGroup, VERIFY_CEIDG, VERIFY_GOOGLE } from './types'

/**
 * Shared fields of prokomsoftware.pl (spec §4.2, §6.3): texts of the boards Chrome, Footer,
 * Kontakt and OFirmie; footer links as in today's navigation (`seed/prokomsoftware/nawigacja.json`).
 * Rail = the sections of the v23 rail without „Realizacje” (MAPA-DZIS §10.1).
 */
export const SOFTWARE_SHARED: SharedGroup = {
  phoneLabel: 'Software:',
  responsePromise: 'Odpowiedź w 1 dzień roboczy',
  brandBarSlot: { label: 'Darmowy audyt', href: '/audyt' },
  headerCta: { label: 'Bezpłatna wycena', href: '/kontakt', counter: 'project' },
  tabBar: {
    second: { label: 'Oferta', href: '/rozwiazania' },
    center: { label: 'Kreator', href: '/dobierz', icon: 'bolt' },
  },
  rail: {
    // v24 (board `AU-pc`, SWA2c): the sections of the start page, in its order.
    sections: [
      { anchorId: 'start', label: 'Start', icon: 'home' },
      { anchorId: 'sytuacje', label: 'Od czego zaczynasz', icon: 'compass' },
      { anchorId: 'oferta', label: 'Oferta', icon: 'grid' },
      { anchorId: 'podglady', label: 'Podglądy na żywo', icon: 'monitor' },
      { anchorId: 'technologia', label: 'Jak robimy', icon: 'site' },
      { anchorId: 'dobierz', label: 'Kreator 60 s', icon: 'bolt' },
      { anchorId: 'cennik', label: 'Cennik', icon: 'wallet' },
      { anchorId: 'proces', label: 'Jak pracujemy', icon: 'doc' },
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
        { label: 'Jedna firma do wszystkiego', href: '/o-firmie#linie' },
        { label: 'Aktualności', href: '/aktualnosci' },
        { label: 'Darmowy audyt', href: '/audyt' },
        { label: 'Kreator 60 s', href: '/dobierz' },
      ],
    },
  ],
  legalNote: 'Statystyki bez ciasteczek śledzących',
  contact: {
    // v24 (TRESCI-v24 „Kontakt”, ZMIANY-v24 §9.3).
    h1: 'Porozmawiajmy o **Twoim projekcie.**',
    lead: 'Nie potrzebujesz specyfikacji ani znajomości technologii. Opowiedz po swojemu — odezwie się osoba, która potem pisze Twój projekt.',
    writeCta: 'Opisz projekt ↓',
    placeKind: 'salon',
    // At most 3 (panel); „30 min za darmo” is in „Co dalej” (step 2).
    facts: [
      { kind: 'phone2', label: 'Albo drugi numer', icon: 'phone' },
      { kind: 'text', label: 'Na odpowiedź', value: '1 dzień roboczy', icon: 'clock' },
      { kind: 'email', label: 'E-mail', icon: 'mail' },
    ],
    routes: [
      {
        title: 'Nowa strona albo system',
        text: 'Nie wiesz, od czego zacząć? Kreator w 60 sekund pokaże zakres, orientacyjną cenę i termin.',
        cta: 'Kreator · 60 s',
        href: '/dobierz',
      },
      {
        title: 'Stara strona do przebudowy',
        text: 'Sprawdzimy szybkość, SEO i telefon. Raport z liczbami w 2 dni robocze, za darmo.',
        cta: 'Darmowy audyt',
        href: '/audyt',
      },
      {
        title: 'Zmiany i opieka',
        text: 'Masz stronę lub system i chcesz coś dodać, poprawić albo oddać pod stałą opiekę.',
        cta: 'Opisz zmianę',
        href: '/kontakt#formularz',
      },
    ],
    topics: ['Strona', 'System lub panel', 'Aplikacja', 'Opieka', 'Audyt'],
    formTitle: 'Opisz, co chcesz usprawnić',
    placeholder:
      'Opisz krótko, po swojemu — np. mamy grafik ekip w Excelu, chcemy aplikację na telefon.',
    sendLabel: 'Wyślij zgłoszenie →',
    nextSteps: [
      {
        title: '1 dzień roboczy · Odpowiadamy',
        text: 'Oddzwaniamy albo odpisujemy, jak wolisz. Dopytamy o to, czego brakuje w opisie.',
      },
      {
        title: '30 minut · Krótka rozmowa',
        text: 'U Ciebie w firmie, w Rabce-Zdroju albo online.',
      },
      {
        title: '5–7 dni · Podgląd i wycena na piśmie',
        text: 'Szkic do klikania, zakres, cena i termin. Wycena ważna 30 dni.',
      },
      {
        title: 'Ty decydujesz · Bez zobowiązań',
        text: 'Płacisz dopiero po podpisaniu umowy: 30% zaliczki, reszta po odbiorze albo po etapach.',
      },
    ],
    mapTitle: 'Kod nie zna granic. Kawa jest w Rabce.',
    mapLead:
      'Projekty prowadzimy zdalnie w całej Polsce — rozmowy, podglądy i odbiór przez przeglądarkę. Na Podhalu i w Małopolsce chętnie przyjedziemy do Ciebie.',
    salonKeys: ['rabka'],
    faq: [
      {
        question: 'Czy muszę mieć specyfikację?',
        answer: 'Nie. Wystarczy kilka zdań po swojemu. Resztę ustalimy w 30-minutowej rozmowie.',
      },
      {
        question: 'Czy przyjeżdżacie do klienta?',
        answer: 'Tak, na Podhalu i w Małopolsce. Z resztą Polski rozmawiamy online.',
      },
      {
        question: 'Co przygotować przed rozmową?',
        answer:
          'Jeśli masz: adres obecnej strony, przykładowe strony, które Ci się podobają, i listę rzeczy, które dziś Cię męczą.',
      },
      {
        question: 'Czy mogę przyjść bez umawiania?',
        answer:
          'Tak, w godzinach pracy salonu przy ul. Orkana 16B. Na dłuższą rozmowę lepiej umówić termin.',
      },
    ],
  },
  about: {
    // v24 (TRESCI-v24 „O firmie”, ZMIANY-v24 §9.2).
    h1: 'Nie agencja z open space’u. **Firma z Rabki, od 2004 r.**',
    lead: 'PRO-KOM Software to linia firmy PRO-KOM Tadeusz Wójciak. Piszemy strony, systemy i automatyzacje od podstaw — z umową, fakturą VAT i adresem, pod który możesz przyjść.',
    authTitle: 'Na czym budujemy',
    auth: ['Next.js', 'Django', 'Serwer w Polsce'],
    // „100+” confirmed by Krystian 05.11 (ZMIANY-v24 §9.2) — no flag.
    stats: [
      { value: '100+', label: 'firm z Podhala i Małopolski, które z nami pracują' },
      { value: '0', label: 'gotowych szablonów — każdy projekt piszemy pod firmę' },
    ],
    rules: [
      {
        title: 'Klikasz w podgląd, zanim zapłacisz.',
        text: 'Szkic strony albo systemu działa w przeglądarce, na Twoim telefonie. Decyzję podejmujesz, widząc efekt — nie slajd.',
      },
      {
        title: 'Kod i dostępy są Twoje',
        text: 'Domena, hosting i repozytorium na Twoją firmę. Projekt przejmie każdy programista.',
      },
      {
        title: 'Stała cena i termin',
        text: 'Zakres, cena i etapy na piśmie. Bez dopłat „za godziny”.',
      },
      {
        title: 'Jedna osoba od początku do końca',
        text: 'Rozmawiasz z tym, kto pisze kod. Nikt nie przekazuje Twojego projektu dalej.',
      },
      {
        title: 'Opieka po starcie',
        text: 'Kopie, aktualizacje i czas reakcji zapisane w umowie opieki.',
      },
      {
        title: 'Mówimy wprost, gdy coś się nie opłaca.',
        text: 'Jeśli wystarczy prostsze rozwiązanie — usłyszysz to przed wyceną.',
      },
    ],
    steps: [
      {
        title: 'Rozmowa',
        text: '30 minut, bezpłatnie: telefon, wideo albo w Rabce. Mówisz po swojemu, co Cię męczy.',
      },
      { title: 'Podgląd i wycena', text: 'Szkic do klikania, zakres, cena i termin na piśmie.' },
      { title: 'Budowa', text: 'Postęp widzisz na wersji testowej. Uwagi zgłaszasz na bieżąco.' },
      {
        title: 'Start i opieka',
        text: 'Wdrożenie, szkolenie z panelu i opieka zapisana w umowie.',
      },
    ],
    verify: [
      VERIFY_CEIDG,
      {
        title: 'Podglądy na żywo',
        text: 'Kliknij przykładowe strony i systemy na stronie głównej.',
        href: '/#podglady',
      },
      {
        title: 'Darmowy audyt',
        text: 'Sprawdzimy Twoją stronę i pokażemy wyniki z liczbami.',
        href: '/audyt',
      },
      VERIFY_GOOGLE,
    ],
    visitText:
      'Pokażemy podglądy na dużym ekranie i porozmawiamy przy kawie. Na dłuższą rozmowę lepiej umówić godzinę.',
  },
}

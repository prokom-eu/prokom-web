import { CONTACT_FAQ_TODO, type SharedGroup, VERIFY_CEIDG, VERIFY_GOOGLE } from './types'

/**
 * Shared fields of prokombiznes.pl (spec §4.2, §6.3): texts of the boards Chrome, Footer,
 * Kontakt and OFirmie with the Biznes decisions of 01.11 (kontakt@prokombiznes.pl, 889 003 889
 * and 883 200 151, no landline) and the K4-FINAL §1 statuses. Rail = the sections of today's
 * Biznes rail (`sites/biznes/components/home/rail.ts`, MAPA-DZIS §10.1).
 */
/** Topics of the Kontakt form; the first four are the matters of „Z czym dzwonisz?” (§8.2). */
const BIZNES_TOPICS = [
  'Kasa, POS albo terminal',
  'Awaria albo serwis',
  'KSeF, programy i opieka IT',
  'Większa dostawa sprzętu',
] as const

export const BIZNES_SHARED: SharedGroup = {
  phoneLabel: 'Biznes:',
  responsePromise: 'Oddzwaniamy w godzinach pracy',
  brandBarSlot: { label: 'Konfigurator', href: '/konfigurator' },
  headerCta: { label: 'Zapytanie', href: '/zapytanie', counter: 'inquiry' },
  tabBar: {
    second: { label: 'Oferta', href: '/oferta' },
    center: { label: 'Zapytanie', href: '/zapytanie', icon: 'doc' },
  },
  rail: {
    sections: [
      // The order of plan 0611 §7.1 (B3-1; KSeF and „Aktualności” B3-2).
      { anchorId: 'start', label: 'Start', icon: 'rocket' },
      { anchorId: 'oferta', label: 'Oferta', icon: 'store' },
      { anchorId: 'zaopatrzenie', label: 'Zaopatrzenie firm', icon: 'box' },
      { anchorId: 'marki', label: 'Marki', icon: 'star' },
      { anchorId: 'wybierane', label: 'Najczęściej wybierane', icon: 'grid' },
      { anchorId: 'ksef', label: 'KSeF', icon: 'doc' },
      { anchorId: 'plan', label: 'Plan Twojej firmy', icon: 'map' },
      { anchorId: 'jak-pracujemy', label: 'Jak pracujemy', icon: 'compass' },
      { anchorId: 'opinie', label: 'Opinie', icon: 'chat' },
      { anchorId: 'fakty', label: 'O firmie', icon: 'shield' },
      { anchorId: 'aktualnosci', label: 'Aktualności', icon: 'mega' },
      { anchorId: 'faq', label: 'Pytania', icon: 'q' },
      { anchorId: 'kontakt', label: 'Kontakt', icon: 'phone' },
    ],
  },
  footerPromises: [
    'Autoryzowany serwis Posnet i Elzab',
    'Autoryzowany partner GoPOS i InsERT',
    'Wycena na piśmie',
  ],
  footerColumns: [
    {
      heading: 'Oferta',
      links: [
        { label: 'Cała oferta', href: '/oferta' },
        { label: 'Gotowe zestawy', href: '/zestawy' },
        { label: 'Plan Twojej firmy', href: '/plan-firmy' },
        { label: 'Wszystkie marki', href: '/marki' },
        { label: 'Konfigurator', href: '/konfigurator' },
        // Plan 0611 §6.4 #7: the procurement pages (hidden in the footer until published).
        { label: 'AGD i RTV dla firm', href: '/agd-rtv-dla-firm' },
        { label: 'Dostawy IT dla firm', href: '/dostawy-it-dla-firm' },
      ],
    },
    {
      heading: 'Usługi',
      links: [
        { label: 'Opieka IT', href: '/opieka-it' },
        { label: 'GoPOS', href: '/gopos' },
        { label: 'InsERT', href: '/insert' },
        { label: 'Bezpłatny przegląd IT', href: '/produkt/przeglad-it' },
        { label: 'KSeF', href: '/ksef' },
      ],
    },
    {
      heading: 'Firma',
      links: [
        { label: 'O firmie', href: '/o-firmie' },
        { label: 'Aktualności', href: '/aktualnosci' },
        { label: 'Kontakt i dojazd', href: '/kontakt' },
      ],
    },
  ],
  legalNote:
    'Oferta skierowana do przedsiębiorców i instytucji · Logotypy należą do ich właścicieli',
  contact: {
    // Plan 0611 §8.2: H1, the facts bar and „Z czym dzwonisz?” — 4 matters, each picks its
    // topic in the form (`?temat=`, the topics below) and scrolls to it.
    h1: 'Powiedz, czego potrzebuje firma. Resztę ustalimy na miejscu.',
    lead: 'Kasy, programy, komputery i opieka IT — jeden numer do wszystkiego. Wycenę przygotujemy na piśmie.',
    writeCta: 'Napisz do nas',
    placeKind: 'salon',
    facts: [
      { kind: 'email', label: 'E-mail', icon: 'mail' },
      { kind: 'phone2', label: 'Drugi numer', icon: 'phone' },
      // D18: „Oddzwonimy w 60 minut” (odstępstwo Biznesu od szablonów).
      { kind: 'text', label: 'Odpowiedź', value: 'Oddzwonimy w 60 minut', icon: 'clock' },
    ],
    routes: [
      {
        title: 'Kasa, POS albo terminal',
        text: 'Dobór pod branżę, fiskalizacja i wdrożenie w lokalu.',
        cta: 'Zaznacz w formularzu',
        href: `/kontakt?temat=${encodeURIComponent(BIZNES_TOPICS[0])}#formularz`,
      },
      {
        title: 'Awaria albo serwis',
        text: 'Kasa, terminal, komputer albo sieć. Powiedz, co się dzieje — ustalimy, co dalej.',
        cta: 'Zaznacz w formularzu',
        href: `/kontakt?temat=${encodeURIComponent(BIZNES_TOPICS[1])}#formularz`,
      },
      {
        title: 'KSeF, programy i opieka IT',
        text: 'Programy sprzedażowe, KSeF i stała opieka nad komputerami i siecią.',
        cta: 'Zaznacz w formularzu',
        href: `/kontakt?temat=${encodeURIComponent(BIZNES_TOPICS[2])}#formularz`,
      },
      {
        title: 'Większa dostawa sprzętu',
        text: 'Komputery, drukarki i sieć dla kilku stanowisk — wycena na piśmie.',
        cta: 'Zaznacz w formularzu',
        href: `/kontakt?temat=${encodeURIComponent(BIZNES_TOPICS[3])}#formularz`,
      },
    ],
    topics: [...BIZNES_TOPICS, 'Inna sprawa'],
    formTitle: 'Napisz, czego potrzebujesz.',
    placeholder: 'np. Otwieramy kawiarnię w grudniu, potrzebujemy kasy i terminala.',
    sendLabel: 'Wyślij zapytanie',
    nextSteps: [
      { title: 'Oddzwaniamy w godzinach pracy', text: 'Dopytamy o branżę i to, co już masz.' },
      { title: 'Dobieramy sprzęt i program', text: 'Tylko to, czego naprawdę potrzebujesz.' },
      { title: 'Wycena na piśmie', text: 'Bez zobowiązań, z terminem realizacji.' },
      { title: 'Wdrożenie i serwis', text: 'Na miejscu w Rabce albo u Ciebie.' },
    ],
    mapTitle: 'Dojeżdżamy na całe Podhale i Małopolskę.',
    mapLead: 'Salon jest w Rabce-Zdroju. Do firm przyjeżdżamy z kasą, sprzętem i programem.',
    salonKeys: ['rabka'],
    faq: CONTACT_FAQ_TODO,
  },
  about: {
    h1: 'Lokalna firma IT, która zostaje z klientem na lata.',
    lead: 'Kasy fiskalne, programy, komputery i opieka IT dla firm z Podhala i Małopolski. Jeden numer do wszystkiego, ten sam adres od lat.',
    authTitle: 'Autoryzacje i partnerstwa',
    auth: [
      'Autoryzowany serwis Posnet',
      'Autoryzowany serwis Elzab',
      'Autoryzowany partner GoPOS',
      'Autoryzowany partner InsERT',
    ],
    stats: [
      {
        value: '100+',
        label: 'klientów firmowych pod stałą opieką',
        flag: 'do potwierdzenia przez szefa',
      },
      { value: '2', label: 'autoryzowane serwisy kas: Posnet i Elzab' },
    ],
    rules: [
      {
        title: 'Wycena na piśmie, zanim zdecydujesz',
        text: 'Zakres, termin i warunki dostajesz czarno na białym. Bez niespodzianek po fakcie.',
      },
      {
        title: 'Tylko to, czego potrzebujesz',
        text: 'Dobieramy sprzęt i program pod firmę, nie odwrotnie.',
      },
      { title: 'Jeden numer', text: 'Kasa, komputer, program i sieć — jedna rozmowa.' },
      { title: 'Serwis na miejscu', text: 'Salon i serwis w Rabce-Zdroju.' },
      { title: 'Jawne dane firmy', text: 'NIP, adres i autoryzacje sprawdzisz sam.' },
      {
        title: 'Mówimy wprost, gdy coś się nie opłaca',
        text: 'Wolimy stracić sprzedaż niż klienta.',
      },
    ],
    steps: [
      { title: 'Rozmowa', text: 'Dopytamy o branżę i to, co już masz.' },
      { title: 'Dobór', text: 'Sprzęt i program pod Twoją firmę.' },
      { title: 'Wycena na piśmie', text: 'Bez zobowiązań, z terminem.' },
      { title: 'Wdrożenie i serwis', text: 'Na miejscu, a potem stała opieka.' },
    ],
    verify: [
      VERIFY_CEIDG,
      { title: 'Lista serwisów Posnet', text: '[Krystian: link do listy u producenta]' },
      { title: 'Partnerzy InsERT', text: '[Krystian: link do wyszukiwarki partnerów]' },
      VERIFY_GOOGLE,
    ],
    visitText:
      'Salon czynny pn–pt 9:00–17:00. Przyjdź z kasą, laptopem albo pytaniem — doradzimy na miejscu.',
  },
}

import { type SharedGroup, VERIFY_CEIDG, VERIFY_GOOGLE } from './types'

/**
 * Shared fields of prokominstalacje.pl (spec §4.2, §6.3): texts of the boards Chrome, Footer,
 * Kontakt and OFirmie. „24 h” only as the answer to a request; 24 months of warranty on the
 * installation. Rail = the sections of today's home rail (`dane/glownaSekcje.ts`, MAPA-DZIS §10.1).
 * One salon (Rabka) — the Zakopane salon of the board is not shown (decision 01.11).
 */
export const INSTALACJE_SHARED: SharedGroup = {
  phoneLabel: 'Instalacje:',
  responsePromise: 'Odpowiedź do 24 h w dni robocze',
  brandBarSlot: { label: 'Zgłoś awarię', href: '/serwis#zglos' },
  headerCta: { label: 'Zaplanuj instalację', href: '/zaplanuj', counter: 'none' },
  tabBar: {
    second: { label: 'Usługi', href: '/uslugi' },
    center: { label: 'Zaplanuj', href: '/zaplanuj', icon: 'cal' },
  },
  rail: {
    sections: [
      { anchorId: 'start', label: 'Start', icon: 'home' },
      { anchorId: 'dla-kogo', label: 'Dla kogo', icon: 'users' },
      { anchorId: 'uslugi', label: 'Usługi', icon: 'grid' },
      { anchorId: 'architekci', label: 'Architekci', icon: 'compass' },
      { anchorId: 'realizacje', label: 'Realizacje', icon: 'star' },
      { anchorId: 'gory', label: 'Góry i zima', icon: 'mountain' },
      { anchorId: 'proces', label: 'Jak pracujemy', icon: 'check' },
      { anchorId: 'serwis', label: 'Serwis', icon: 'wrench' },
      { anchorId: 'faq', label: 'Pytania', icon: 'q' },
      { anchorId: 'zaplanuj', label: 'Zaplanuj', icon: 'cal' },
    ],
    searchShortcuts: [
      { label: 'Zaplanuj instalację', href: '/zaplanuj' },
      { label: 'Serwis i przeglądy', href: '/serwis' },
      { label: 'Dla architektów', href: '/dla-architektow' },
      { label: 'Kontakt', href: '/kontakt' },
    ],
  },
  footerPromises: [
    'Projekt · montaż · serwis',
    '24 miesiące gwarancji na montaż',
    'Wycena na piśmie',
  ],
  footerColumns: [
    {
      heading: 'Usługi',
      links: [
        { label: 'Monitoring i kamery', href: '/monitoring' },
        { label: 'Alarmy i wideodomofony', href: '/alarmy' },
        { label: 'Sieci i Wi-Fi', href: '/sieci-wifi' },
        { label: 'Smart home Ampio', href: '/smart-home' },
        { label: 'Ładowarki samochodów', href: '/ladowarki-ev' },
        { label: 'Pełna oferta', href: '/uslugi' },
      ],
    },
    {
      heading: 'Dla kogo',
      links: [
        { label: 'Dom i domek letniskowy', href: '/dla-kogo/dom' },
        { label: 'Pensjonat', href: '/dla-kogo/pensjonaty' },
        { label: 'Hotel', href: '/dla-kogo/hotele' },
        { label: 'Firma, biuro i hala', href: '/dla-kogo/firmy' },
        { label: 'Gmina i urząd', href: '/dla-kogo/gminy' },
        { label: 'Deweloper', href: '/dla-kogo/deweloperzy' },
      ],
    },
    {
      heading: 'Firma',
      links: [
        { label: 'Dla architektów', href: '/dla-architektow' },
        { label: 'Realizacje', href: '/realizacje' },
        { label: 'Poradnik', href: '/poradnik' },
        { label: 'Serwis i przeglądy', href: '/serwis' },
        { label: 'O firmie', href: '/o-firmie' },
      ],
    },
  ],
  legalNote: 'Logotypy należą do ich właścicieli',
  contact: {
    // INST-6 PR4 (runda v6 §2): the H1 says the page and the region, the lead has 2 sentences.
    h1: 'Kontakt z PRO-KOM Instalacje w Rabce-Zdroju',
    lead: 'Zadzwoń, napisz albo przyjdź do salonu w Rabce-Zdroju, jeśli planujesz monitoring, alarm, Wi-Fi albo smart home. Na zgłoszenie odpowiadamy do 24 h w dni robocze, a termin wizji lokalnej ustalamy w rozmowie.',
    writeCta: 'Opisz obiekt',
    placeKind: 'salon',
    facts: [
      { kind: 'email', label: 'E-mail', icon: 'mail' },
      { kind: 'text', label: 'Zaplanuj', value: '4 kroki online', icon: 'pen' },
      { kind: 'text', label: 'Odpowiedź', value: 'Do 24 h w dni robocze', icon: 'clock' },
    ],
    routes: [
      {
        title: 'Planuję instalację',
        text: 'Monitoring, alarm, Wi-Fi albo smart home: odpowiesz na 4 pytania, a my przygotujemy wycenę.',
        cta: 'Zaplanuj instalację',
        href: '/zaplanuj',
      },
      {
        title: 'Awaria albo przegląd',
        text: 'Naprawiamy też instalacje po innej firmie. Opisz problem, a oddzwonimy.',
        cta: 'Zgłoś awarię',
        href: '/serwis#zglos',
      },
      {
        title: 'Jestem architektem lub deweloperem',
        text: 'Dostaniesz liczby do projektu, wymianę plików i jednego stałego opiekuna.',
        cta: 'Dla architektów',
        href: '/dla-architektow',
      },
    ],
    topics: ['Monitoring', 'Alarm', 'Sieć i Wi-Fi', 'Smart home', 'Inne'],
    formTitle: 'Opisz obiekt, a oddzwonimy z propozycją',
    placeholder: 'np. Pensjonat, 12 pokoi — kamery na parkingu i Wi-Fi w pokojach.',
    sendLabel: 'Zamów oddzwonienie',
    nextSteps: [
      { title: 'Odpowiedź do 24 h', text: 'W dni robocze — telefonem albo e-mailem.' },
      { title: 'Wizja lokalna', text: 'Termin ustalamy w rozmowie.' },
      { title: 'Projekt i wycena na piśmie', text: 'Sprzęt dobieramy do Twojego obiektu.' },
      { title: 'Montaż i odbiór', text: '24 miesiące gwarancji na montaż.' },
    ],
    mapTitle: 'Strefy dojazdu na Podhalu i w Małopolsce',
    mapLead:
      'Wpisz miejscowość, a pokażemy strefę dojazdu. Przy większych inwestycjach jedziemy dalej.',
    salonKeys: ['rabka'],
    // Answers only from what the site already promises (spec §2, `dane/`); the template's
    // questions about parking and walk-ins wait for the boss. TODO(krystian): parking at the salon.
    faq: [
      {
        question: 'Czy przyjeżdżacie na miejsce?',
        answer:
          'Tak. Przed wyceną oglądamy obiekt na wizji lokalnej — termin ustalamy w rozmowie. Dojeżdżamy z Rabki-Zdroju na całe Podhale, przy większych inwestycjach dalej w Małopolsce.',
      },
      {
        question: 'Jak szybko odpowiadacie?',
        answer: 'Na zgłoszenie odpowiadamy do 24 h w dni robocze — telefonem albo e-mailem.',
      },
      {
        question: 'Co przygotować przed rozmową?',
        answer:
          'Wystarczy krótki opis: rodzaj obiektu, co chcesz zabezpieczyć albo podłączyć i gdzie jest obiekt. Resztę ustalimy na wizji lokalnej.',
      },
      {
        question: 'Czy serwisujecie instalacje po innej firmie?',
        answer:
          'Tak. Robimy przeglądy i naprawy także instalacji, których nie montowaliśmy. Opisz problem w formularzu albo zgłoś awarię — oddzwonimy.',
      },
    ],
  },
  about: {
    h1: 'PRO-KOM — instalacje w Rabce-Zdroju i na Podhalu',
    lead: 'Projektujemy, montujemy i serwisujemy monitoring, alarmy, sieci, smart home i nagłośnienie w domach, pensjonatach i firmach. Działamy od 2004 roku, a salon mamy w Rabce-Zdroju.',
    authTitle: 'Autoryzacje',
    // Ampio confirmed by the boss 01.11 (`dane/smartHome.ts`); Satel still open — the marker
    // keeps it off the page until confirmed.
    auth: ['Ampio', 'Elzab EcoPower', '[SZEF: Satel]'],
    stats: [
      // Runda v6 §1.8: the shared template already shows „2004 · na Podhalu” first — another fact here.
      { value: '10', label: 'rodzajów instalacji u jednego wykonawcy' },
      { value: '24', label: 'miesiące gwarancji na montaż' },
    ],
    rules: [
      {
        title: 'Sprzęt dobrany do obiektu',
        text: 'Najpierw wizja lokalna, potem dobór sprzętu. Dobieramy go tak, żeby działał latami po odbiorze.',
      },
      { title: 'Wycena na piśmie', text: 'Zakres i termin, zanim zaczniemy.' },
      { title: '24 miesiące gwarancji', text: 'Na montaż. Sprzęt według gwarancji producenta.' },
      { title: 'Odpowiedź do 24 h', text: 'Na zgłoszenie w dni robocze.' },
      {
        title: 'Bezpieczne od pierwszego dnia',
        text: 'Zmieniamy hasła fabryczne w każdym urządzeniu.',
      },
      {
        title: 'Zostajemy po montażu',
        text: 'Przeglądy, serwis i przejęcie instalacji po innej firmie.',
      },
    ],
    steps: [
      { title: 'Rozmowa', text: 'Odpowiedź do 24 h w dni robocze.' },
      { title: 'Wizja lokalna', text: 'Termin ustalamy w rozmowie.' },
      { title: 'Projekt i wycena', text: 'Na piśmie, pod Twój obiekt.' },
      { title: 'Montaż i odbiór', text: '24 miesiące gwarancji na montaż.' },
    ],
    verify: [
      VERIFY_CEIDG,
      VERIFY_GOOGLE,
      {
        title: 'Autoryzacja Ampio',
        text: 'Smart home Ampio montujemy z autoryzacją producenta.',
        href: '/smart-home',
      },
      {
        title: 'Realizacje',
        text: 'Wybrane obiekty — tylko za zgodą klienta.',
        href: '/realizacje',
      },
    ],
    visitText:
      'Salon czynny pn–pt 9:00–17:00. Na miejscu zobaczysz w działaniu kamery, wideodomofony i smart home.',
  },
}

import { CONTACT_FAQ_TODO, type SharedGroup, VERIFY_CEIDG, VERIFY_GOOGLE } from './types'

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
      { anchorId: 'uslugi', label: 'Usługi', icon: 'net' },
      { anchorId: 'architekci', label: 'Architekci', icon: 'ruler' },
      { anchorId: 'realizacje', label: 'Realizacje', icon: 'eye' },
      { anchorId: 'gory', label: 'Góry i zima', icon: 'snow' },
      { anchorId: 'proces', label: 'Jak pracujemy', icon: 'check' },
      { anchorId: 'serwis', label: 'Serwis', icon: 'wrench' },
      { anchorId: 'faq', label: 'Pytania', icon: 'chat' },
      { anchorId: 'zaplanuj', label: 'Zaplanuj', icon: 'plane' },
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
    h1: 'Powiedz, co planujesz. Resztę ustalimy na miejscu.',
    lead: 'Monitoring, alarmy, sieci i smart home na Podhalu. Odpowiadamy do 24 h w dni robocze, termin wizji lokalnej ustalamy w rozmowie.',
    writeCta: 'Opisz obiekt',
    placeKind: 'salon',
    facts: [
      { label: 'E-mail', value: 'kontakt@prokominstalacje.pl', icon: 'mail' },
      { label: 'Zaplanuj', value: '4 kroki online', icon: 'pen' },
      { label: 'Odpowiedź', value: 'Do 24 h w dni robocze', icon: 'clock' },
    ],
    routes: [
      {
        title: 'Planuję instalację',
        text: 'Monitoring, alarm, Wi-Fi, smart home. Odpowiesz na 4 pytania, my przygotujemy wycenę.',
        cta: 'Zaplanuj instalację',
        href: '/zaplanuj',
      },
      {
        title: 'Awaria albo przegląd',
        text: 'Także instalacje po innej firmie. Opisz problem, oddzwonimy.',
        cta: 'Serwis i przeglądy',
        href: '/serwis',
      },
      {
        title: 'Jestem architektem lub deweloperem',
        text: 'Liczby do projektu, wymiana plików, stały opiekun.',
        cta: 'Dla architektów',
        href: '/dla-architektow',
      },
    ],
    topics: ['Monitoring', 'Alarm', 'Sieć i Wi-Fi', 'Smart home', 'Inne'],
    formTitle: 'Opisz obiekt. Wrócimy z planem.',
    placeholder: 'np. Pensjonat, 12 pokoi — kamery na parkingu i Wi-Fi w pokojach.',
    sendLabel: 'Zamów oddzwonienie',
    nextSteps: [
      { title: 'Odpowiedź do 24 h', text: 'W dni robocze — telefonem albo e-mailem.' },
      { title: 'Wizja lokalna', text: 'Termin ustalamy w rozmowie.' },
      { title: 'Projekt i wycena na piśmie', text: 'Dobieramy pod obiekt, nie pod markę.' },
      { title: 'Montaż i odbiór', text: '24 miesiące gwarancji na montaż.' },
    ],
    mapTitle: 'Podhale i Małopolska — sprawdź swoją miejscowość.',
    mapLead:
      'Wpisz miejscowość, a pokażemy strefę dojazdu. Przy większych inwestycjach jedziemy dalej.',
    salonKeys: ['rabka'],
    faq: CONTACT_FAQ_TODO,
  },
  about: {
    h1: 'Firma z Podhala, która zostaje po montażu.',
    lead: 'Projektujemy, montujemy i serwisujemy monitoring, alarmy, sieci, smart home i nagłośnienie. Salon w Rabce-Zdroju, od 2004 r.',
    authTitle: 'Autoryzacje',
    auth: ['[SZEF: Satel]', '[SZEF: Ampio]', 'Elzab EcoPower'],
    stats: [
      { value: '24', label: 'miesiące gwarancji na montaż' },
      { value: '12', label: 'rodzajów obiektów — od domu po gminę' },
    ],
    rules: [
      {
        title: 'Pod obiekt, nie pod markę',
        text: 'Najpierw wizja lokalna, potem dobór sprzętu. Tak, żeby działało latami, a nie tylko w dniu odbioru.',
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
      { title: 'Autoryzacje producentów', text: '[SZEF: potwierdzenia Satel / Ampio]' },
      {
        title: 'Realizacje',
        text: 'Wybrane obiekty — tylko za zgodą klienta.',
        href: '/realizacje',
      },
    ],
    visitText:
      'Salon czynny pn–pt 9:00–17:00. Zobaczysz kamery, wideodomofony i smart home na żywo.',
  },
}

import type { ObjectKey, ServiceKey } from './types'

/**
 * Fixed texts of the home sections below the hero (ADR-I002 §1, KOMPONENTY §3). I6: transcribed
 * from `zrodlo/pages/Main.js` (`SVX`, `brands`, `gory`, `objs`, `steps`, `faq`, `KO`, `RL`, `srv`)
 * and `Main.body.html` (`#dla-kogo` … `#zaplanuj`), v4.2. Names, icons, colours and addresses of
 * services and objects come from the panel by key; the prototype's `[SZEF: …]` placeholders are
 * left out (TODO below). Edited by hand from now on.
 */

/** „Dla kogo” card: the panel gives name, icon and address; these are the home-only texts. */
export type ForWhoCard = {
  key: ObjectKey
  description: string
  set: string[]
  /** Colour pair `oh1`–`oh5` of the prototype and the wide card. */
  hue: 1 | 2 | 3 | 4 | 5
  big?: boolean
}

/** Service card of `#uslugi` (`SVX`), in the order of the prototype's grid. */
export type ServiceCard = {
  key: ServiceKey
  description: string
  /** Parts of the installation (`parts`), cut to 6 on big cards and 4 on the others. */
  parts: string[]
  highlights: string[]
  /** Big card: 3 highlights and 6 parts (`kam`, `smart`, `snd`, `scr`). */
  big?: boolean
  /** Two columns wide (`w2`). */
  wide?: boolean
}

export const SERVICE_CARDS: ServiceCard[] = [
  {
    key: 'kam',
    description:
      'Kamery, które widzą w nocy i w śniegu. Nagrania zostają na rejestratorze w Twoim budynku, a podgląd masz w telefonie.',
    parts: ['kamery', 'rejestrator NVR', 'dyski 24/7', 'switch PoE', 'UPS', 'aplikacja'],
    highlights: [
      'Cztery wersje instalacji: od domu po duży obiekt',
      'Kolor w nocy i wykrywanie ludzi oraz aut',
      'Maski prywatności i czas nagrań dopasowane do obiektu',
    ],
    big: true,
    wide: true,
  },
  {
    key: 'smart',
    description:
      'Polski system Ampio: światło, ogrzewanie, rolety, brama, alarm i kamery w jednej aplikacji. Gdy padnie internet, dom dalej działa.',
    parts: ['moduły Ampio', 'panele M-DOT', 'aplikacja UNI', 'sceny', 'integracje'],
    highlights: [
      'Nowy dom i remont, projekt przed tynkami',
      'Ogrzewanie strefowe, pompa ciepła, fotowoltaika',
      'Apple, Google i Alexa przez Matter',
    ],
    big: true,
    wide: true,
  },
  {
    key: 'alarm',
    description:
      'Czujki, syrena i powiadomienie w telefonie, gdy coś się dzieje. Wideodomofon przy furtce odbierasz nawet z drugiego końca Polski.',
    parts: ['centrala', 'czujki', 'syrena', 'moduł GSM'],
    highlights: ['Przewodowe lub bezprzewodowe, z aplikacją', 'Wideodomofon odbierany w telefonie'],
  },
  {
    key: 'kd',
    description:
      'Karty, kody i zamki do apartamentów. Gość albo pracownik wchodzi sam, a Ty wiesz, kto i kiedy.',
    parts: ['zamki z kodem', 'czytniki kart', 'harmonogramy'],
    highlights: ['Kody czasowe dla gości apartamentów', 'Historia wejść: kto i kiedy'],
  },
  {
    key: 'wifi',
    description:
      'Wi-Fi w każdym pokoju i osobna sieć dla gości, kamer i kasy. Kładziemy też kable i światłowody, montujemy szafy na sprzęt sieciowy.',
    parts: ['punkty Wi-Fi', 'router', 'switch', 'szafa rack'],
    highlights: ['Osobne sieci: goście, kamery, kasa', 'Pomiar zasięgu przed i po montażu'],
  },
  {
    key: 'snd',
    description:
      'Stałe nagłośnienie APART i innych marek: muzyka w tle i komunikaty. Mowę słychać wyraźnie także w ostatniej ławce.',
    parts: ['głośniki', 'wzmacniacz strefowy', 'mikrofony', 'panel ścienny', 'komunikaty'],
    highlights: ['Restauracje, hotele, kościoły, sale obrad', 'Każda strefa z osobną głośnością'],
    big: true,
  },
  {
    key: 'scr',
    description:
      'Ekrany w witrynie, menu nad ladą, ekran w recepcji i ściany wideo. Treść zmieniasz z komputera na wszystkich ekranach naraz.',
    parts: [
      'ekrany profesjonalne',
      'odtwarzacz w ekranie',
      'uchwyty',
      'zarządzanie treścią',
      'szablony',
    ],
    highlights: [
      // Runda v6 D3: no claim about our own salon without the boss's confirmation.
      'Cenę zmieniasz w jednym miejscu, ekrany odświeżają się same',
      'Harmonogram: rano śniadania, wieczorem kolacje',
    ],
    big: true,
    wide: true,
  },
  {
    key: 'tel',
    description:
      'Dla deweloperów i wykonawców: okablowanie, światłowód do lokali, telewizja i domofony. Każde gniazdo mierzymy i opisujemy przed odbiorem.',
    parts: ['okablowanie', 'światłowód', 'RTV/SAT', 'pomiary'],
    highlights: ['Od przedmiaru do odbioru z protokołami', 'Pomiar i opis każdego gniazda'],
  },
  {
    key: 'ant',
    description:
      'Anteny satelitarne i naziemne (DVB-T2), instalacje zbiorcze i telewizja w pokojach. Antenę ustawiamy miernikiem sygnału.',
    parts: ['antena', 'konwerter', 'multiswitch', 'gniazda'],
    highlights: ['Ustawiane miernikiem sygnału', 'Ta sama telewizja w każdym pokoju'],
  },
  {
    key: 'ev',
    description:
      'Ładowarki Elzab EcoPower: CC Home do garażu, CC Wall dla firm i obiektów, CC City na parking. Moc dobieramy do przyłącza budynku.',
    parts: ['CC Home', 'CC Wall', 'CC City', 'RFID'],
    highlights: ['Od 3,7 do 2×22 kW, polski producent', 'Montaż i pomoc w formalnościach'],
  },
]

export const FOR_WHO_CARDS: ForWhoCard[] = [
  {
    key: 'dom',
    description: 'Kamery przy furtce, alarm z czujkami mrozu i zalania, smart home i wideodomofon.',
    set: ['Kamery', 'Alarm', 'Smart home'],
    hue: 1,
    big: true,
  },
  {
    key: 'pens',
    description:
      'Monitoring bez pokoi gości, Wi-Fi w każdym pokoju, telewizja i przegląd przed sezonem.',
    set: ['Wi-Fi gości', 'Kamery z maskami', 'TV w pokojach'],
    hue: 2,
    big: true,
  },
  {
    key: 'apt',
    description:
      'Przyjazd z kodem bez przekazywania kluczy, czujka zalania i Wi-Fi bez haseł na kartce.',
    set: ['Zamek z kodem', 'Czujki', 'Wi-Fi'],
    hue: 3,
  },
  {
    key: 'hotel',
    description: 'Karty do pokoi, sieć na setki urządzeń, nagłośnienie sal i ekrany w recepcji.',
    set: ['Karty', 'Sieć', 'Nagłośnienie'],
    hue: 4,
  },
  {
    key: 'rest',
    description:
      'Muzyka na sali i tarasie, mikrofony na przemówienia, menu board i kamery przy kasie.',
    set: ['Nagłośnienie', 'Menu board', 'Kamery'],
    hue: 5,
  },
  {
    key: 'sklep',
    description: 'Kamery sali i kas, alarm, ekran w witrynie i muzyka z komunikatami.',
    set: ['Kamery', 'Alarm', 'Witryna'],
    hue: 1,
  },
  {
    key: 'firma',
    description: 'Sieć firmowa, karty dla pracowników, kamery placu i rampy, brama na karty.',
    set: ['Sieć', 'Karty', 'Kamery placu'],
    hue: 2,
  },
  {
    key: 'kosc',
    description:
      'Mowa zrozumiała w ostatniej ławce, transmisja mszy i ochrona zabytkowego wnętrza.',
    set: ['Nagłośnienie', 'Transmisja', 'Monitoring'],
    hue: 3,
  },
  {
    key: 'szk',
    description:
      'Bezpieczne wejścia, dzwonki i komunikaty, sieć dla uczniów i monitory interaktywne.',
    set: ['Wejścia', 'Dzwonki', 'Sieć'],
    hue: 4,
  },
  {
    key: 'gmina',
    description: 'Sala obrad z transmisją i nagrywaniem sesji, monitoring budynków i przestrzeni.',
    set: ['Sala obrad', 'Transmisja', 'Monitoring'],
    hue: 5,
  },
  {
    key: 'dev',
    description:
      'Teletechnika budynku: światłowód do lokali, RTV/SAT, domofony, dokumentacja do odbioru.',
    set: ['Światłowód', 'Domofony', 'Odbiory'],
    hue: 4,
    big: true,
  },
  {
    key: 'bud',
    description:
      'Kamery na placu bez przyłącza prądu i kabla (zasilanie z akumulatora lub panelu słonecznego), ochrona maszyn i podgląd postępu prac.',
    set: ['Kamery LTE', 'Alarm', 'Timelapse'],
    hue: 1,
    big: true,
  },
]

/** Object choices of the quick plan form (`KO`) and where the full planner takes them. */
export const PLAN_OBJECTS = [
  { key: 'dom', label: 'Dom', icon: 'home', planner: 'dom' },
  { key: 'pens', label: 'Pensjonat lub apartamenty', icon: 'bed', planner: 'pens' },
  { key: 'hotel', label: 'Hotel', icon: 'hotel', planner: 'hotel' },
  { key: 'rest', label: 'Restauracja', icon: 'food', planner: 'rest' },
  { key: 'sklep', label: 'Sklep', icon: 'shop', planner: 'sklep' },
  { key: 'biuro', label: 'Biuro lub firma', icon: 'office', planner: 'firma' },
  { key: 'hala', label: 'Hala lub magazyn', icon: 'factory', planner: 'firma' },
  { key: 'gmina', label: 'Gmina, szkoła, kościół', icon: 'town', planner: 'gmina' },
  { key: 'dew', label: 'Deweloper, wspólnota', icon: 'apt', planner: 'dew' },
] as const
export type PlanObject = (typeof PLAN_OBJECTS)[number]['key']

/** A brand of the band „Marki, z którymi pracujemy” (round v5: logo instead of the name). */
export type TrustBrand = {
  name: string
  kind: string
  logo: string
  width: number
  height: number
  scale?: number
}

export const glownaSekcje = {
  trust: {
    eyebrow: 'Marki, z którymi pracujemy',
    /**
     * Round v5 (RUNDA-V5 §2): logo files in `public/instalacje/marki/<logo>.webp` (2×, height
     * 120 px or less); `scale` evens out the optical size — RCF and Samsung are massive shapes.
     */
    brands: [
      { name: 'Dahua', kind: 'kamery', logo: 'dahua', width: 402, height: 120 },
      {
        name: 'Hikvision',
        kind: 'kamery',
        logo: 'hikvision',
        width: 520,
        height: 66,
      },
      { name: 'BCS', kind: 'kamery', logo: 'bcs', width: 370, height: 120 },
      { name: 'Satel', kind: 'alarmy', logo: 'satel', width: 446, height: 120 },
      { name: 'Ubiquiti', kind: 'sieci Wi-Fi', logo: 'ubiquiti', width: 364, height: 120 },
      { name: 'Ampio', kind: 'smart home', logo: 'ampio', width: 520, height: 110 },
      {
        name: 'Elzab EcoPower',
        kind: 'ładowarki',
        logo: 'elzab-ecopower',
        width: 342,
        height: 120,
      },
      { name: 'Samsung', kind: 'ekrany', logo: 'samsung', width: 361, height: 120, scale: 0.84 },
      { name: 'APART', kind: 'nagłośnienie', logo: 'apart', width: 457, height: 120 },
      { name: 'RCF', kind: 'nagłośnienie', logo: 'rcf', width: 120, height: 120 },
      { name: 'MikroTik', kind: 'sieci', logo: 'mikrotik', width: 493, height: 120 },
    ] as const satisfies readonly TrustBrand[],
  },
  forWho: {
    eyebrow: 'Dla kogo',
    heading: 'Instalacje dla domów, pensjonatów, firm i instytucji',
    lead: 'Każdy obiekt ma inne potrzeby. Wybierz swój, a pokażemy przekrój budynku, typowe problemy i zestawy, od których zaczynamy.',
    more: 'Zobacz rozwiązania',
    showAll: 'Pokaż wszystkie 12 obiektów',
    collapse: 'Zwiń listę',
    missing: 'Nie ma tu Twojego obiektu? Pracujemy też dla innych firm i instytucji.',
    missingLink: 'Opisz, co masz →',
  },
  services: {
    eyebrow: 'Usługi',
    heading: 'Co projektujemy, montujemy i serwisujemy',
    lead: 'Wszystkie instalacje planujemy razem, więc kable idą wspólnymi trasami, a do serwisu dzwonisz pod jeden numer. Nie wiesz, od czego zacząć? Wybierz swój obiekt wyżej albo opisz go w kreatorze.',
    areas: 'obszarów',
    since: 'od 2004',
    sinceNote: 'na Podhalu',
    describe: 'Opisz swój obiekt, a doradzimy zestaw',
    details: 'Szczegóły',
    all: {
      eyebrow: 'Pełna oferta',
      title: 'Wszystkie 76 rozwiązań na jednej stronie',
      note: 'Filtr po rodzaju obiektu i wyszukiwarka.',
      button: 'Zobacz pełną ofertę',
    },
  },
  realizations: {
    eyebrow: 'Realizacje',
    // The prototype's heading: the featured realizations are sound and multimedia.
    heading: 'Nasze realizacje: nagłośnienie i multimedia',
    all: 'Wszystkie realizacje →',
  },
  mountains: {
    eyebrow: 'Góry i zima',
    heading: 'Jak przygotowujemy instalację na mróz, burze i słabe łącze',
    lead: 'Na Podhalu kamery zbierają śnieg, burze uszkadzają sprzęt, a wiele domów stoi pustych przez pół roku. Każdą instalację planujemy pod te warunki.',
    cards: [
      {
        scene: 'snow',
        title: 'Mróz i śnieg',
        text: 'Dobieramy kamery i obudowy do górskiej zimy i montujemy je tak, żeby jak najmniej zbierały śnieg. Obraz ustawiamy pod odblask od śniegu i wieczorne światło.',
        // Source: RMF24, 7.02.2023 (the prototype's fact list, `prototyp/firmy.html`).
        // TODO(krystian): RUNDA-V5 §5 wants a number-fact on every card — only this one has a
        // checked source; add the others with their sources (`docs/tresci/`) or keep one.
        fact: { value: '−28,5°C', label: 'Kotlina Orawsko-Nowotarska, 7.02.2023' },
      },
      {
        scene: 'storm',
        title: 'Burze i przepięcia',
        text: 'Ochrona przepięciowa zmniejsza ryzyko uszkodzeń po burzy, a zasilacz UPS podtrzymuje kamery i alarm przy krótkich zanikach prądu.',
      },
      {
        scene: 'off',
        title: 'Słabe łącze',
        text: 'Nagrania zapisują się w obiekcie, a Ampio steruje domem lokalnie. Gdy internet zniknie, instalacja działa dalej, a podgląd z telefonu wraca razem z łączem.',
      },
      {
        scene: 'home',
        title: 'Domy na wynajem i letnie',
        text: 'Podgląd z daleka, nagrzanie domu przed przyjazdem, ochrona przed zamarzaniem i zalaniem. Dla domów, w których nikogo nie ma przez kilka miesięcy.',
      },
      {
        scene: 'cal',
        title: 'Przegląd przed sezonem',
        text: 'Przed zimą i przed latem: czyszczenie kamer, test dysków, akumulatorów, Wi-Fi i ładowarki. Robimy to, zanim przyjadą goście.',
      },
      {
        scene: 'pin',
        title: 'Salon blisko Ciebie',
        text: 'Salon w Rabce-Zdroju jest blisko obiektów na Podhalu. Wiele usterek naprawiamy zdalnie, a gdy trzeba przyjechać, dojazd jest krótki.',
      },
    ],
  },
  process: {
    eyebrow: 'Jak pracujemy',
    // Runda v6 §1.6: no list of steps in the heading.
    heading: 'Jak wygląda współpraca: od telefonu do serwisu',
    lead: 'Cenę i zakres prac dostajesz na piśmie przed montażem. Po montażu zostajemy z Tobą w serwisie.',
    getLabel: 'Co dostajesz',
    steps: [
      {
        icon: 'phone',
        title: 'Rozmowa',
        text: 'Telefon albo formularz. Mówisz, co chcesz zabezpieczyć lub usprawnić, i umawiamy wizję lokalną.',
        get: 'termin wizji lokalnej',
      },
      {
        icon: 'ruler',
        title: 'Wizja lokalna',
        text: 'Przyjeżdżamy, mierzymy, sprawdzamy kable, zasięg i rozdzielnicę.',
        get: 'pomiary i lista uwag',
      },
      {
        icon: 'doc',
        title: 'Projekt i wycena',
        text: 'Plan rozmieszczenia urządzeń i wycena na piśmie, zwykle w wariantach do wyboru.',
        get: 'plan urządzeń i wycena w wariantach',
      },
      {
        icon: 'tool',
        title: 'Montaż',
        text: 'W ustalonym terminie, czysto, z zabezpieczeniem mebli i podłóg.',
        get: 'montaż w terminie z wyceny',
      },
      {
        icon: 'check',
        title: 'Odbiór',
        text: 'Sprawdzamy działanie razem z Tobą i pokazujemy, jak korzystać z aplikacji.',
        get: 'pokazujemy działanie i aplikację',
      },
      {
        icon: 'wrench',
        title: 'Serwis',
        text: 'Przegląd przed sezonem, zdalna pomoc i naprawy pod jednym numerem.',
        // `{n}` = warranty months from `InstalacjeSettings` (spec §2: 24).
        get: 'jeden numer, {n} mies. gwarancji na montaż',
      },
    ],
    trust: 'Wycena na piśmie przed montażem · bez niespodzianek w połowie roboty',
    cta: 'Zaplanuj instalację',
  },
  service: {
    eyebrow: 'Serwis',
    heading: 'Przeglądy, pomoc zdalna i naprawy po montażu',
    lead: 'Do serwisu dzwonisz pod jeden numer, a wiele usterek naprawiamy zdalnie. Przejmujemy też instalacje po firmach, które zniknęły z rynku.',
    primary: 'Serwis i umowy →',
    secondary: 'Przejmijcie mój serwis',
    tiles: [
      { icon: 'cal', title: 'Przegląd przed sezonem', text: 'Kamery, dyski, akumulatory, Wi-Fi.' },
      { icon: 'chat', title: 'Pomoc zdalna', text: 'Wiele usterek naprawiamy bez dojazdu.' },
      { icon: 'wrench', title: 'Naprawy i rozbudowa', text: 'Jeden numer do całej instalacji.' },
      {
        icon: 'key',
        title: 'Przejęcie serwisu',
        text: 'Instalacje po firmach, które zniknęły.',
      },
    ],
  },
  faq: {
    eyebrow: 'Pytania',
    heading: 'Najczęstsze pytania o instalacje',
    guide: 'Poradnik: porady i odpowiedzi →',
    aside: {
      title: 'Nie ma Twojego pytania?',
      text: 'Zadzwoń albo napisz. Opisz obiekt i to, co już w nim jest, a powiemy, od czego zacząć.',
      button: 'Napisz do nas',
    },
    items: [
      {
        question: 'Ile kosztuje monitoring albo cała instalacja?',
        answer:
          'Zależy od obiektu: liczby urządzeń, długości kabli, wysokości montażu i tego, czy trzeba kuć ściany. Po wizji lokalnej dostajesz wycenę na piśmie, zwykle w wariantach do wyboru.',
      },
      {
        question: 'Czy wizja lokalna jest płatna?',
        // TODO(krystian): the boss's rules of the site visit and travel go first (prototype
        // `[SZEF: zasady wizji lokalnej i dojazdu]`).
        answer:
          'Zanim przyjedziemy, opisz obiekt przez telefon albo w formularzu. Często już wtedy powiemy, jakiego zakresu się spodziewać.',
      },
      {
        question: 'Czy kamery działają bez internetu?',
        answer:
          'Tak. Kamery nagrywają na rejestrator w obiekcie. Internet jest potrzebny tylko do podglądu z telefonu i powiadomień.',
      },
      {
        question: 'Jak ustawiacie kamery w pensjonacie albo firmie?',
        answer:
          'Tak, żeby obejmowały tylko to, co trzeba: ustawiamy strefy i maski prywatności, czas przechowywania nagrań i miejsca na tabliczki o monitoringu. Podpowiemy też, co napisać na tabliczce.',
      },
      {
        question: 'Mam instalację od innej firmy. Przejmiecie serwis?',
        answer:
          'Tak. Sprawdzamy, co jest zamontowane, i pomagamy odzyskać dostęp do urządzeń (za zgodą właściciela, także procedurą producenta). Potem proponujemy naprawę albo rozbudowę zamiast wymiany wszystkiego.',
      },
      {
        question: 'Czy smart home da się zrobić w domu, który już stoi?',
        answer:
          'Tak, w zakresie zależnym od instalacji elektrycznej. Moduły Ampio montujemy w rozdzielnicy, a tam, gdzie nie ma przewodów, łączymy urządzenia bezprzewodowe w standardach, które Ampio obsługuje, np. Z-Wave. Najwięcej możliwości daje instalacja zaplanowana razem z elektryką na etapie budowy.',
      },
      {
        question: 'Czy mogę zlecić kilka instalacji naraz?',
        answer:
          'Tak, i to najczęściej się opłaca. Kamery, Wi-Fi, alarm czy nagłośnienie projektujemy razem: wspólne trasy kabli, jedna szafa techniczna, jedna wizja lokalna i jedna umowa serwisowa. Wycenę dostajesz dla całości, z podziałem na instalacje.',
      },
      {
        question: 'Na jakim terenie działacie?',
        // TODO(krystian): the boss's travel zone and rules (prototype `[SZEF: strefa i zasady
        // dojazdu]`).
        answer:
          'Podhale i okolice: Rabka-Zdrój, Nowy Targ, Zakopane, Jordanów, Mszana Dolna. Dalej w Małopolsce (np. Limanowa, Nowy Sącz) dojazd ustalamy indywidualnie, zwykle przy większych inwestycjach.',
      },
    ],
  },
  plan: {
    eyebrow: 'Krótki formularz',
    heading: 'Zaplanuj instalację — oddzwonimy w 1 dzień roboczy',
    lead: 'Zaznacz, czego potrzebujesz, i zostaw numer. Oddzwonimy, umówimy wizję lokalną, a wycenę dostaniesz na piśmie.',
    step1: 'Co planujesz?',
    step1Note: 'możesz kilka',
    step2: 'Jaki obiekt?',
    step3: 'Gdzie i pod jakim numerem?',
    town: 'Miejscowość',
    townPlaceholder: 'np. Nowy Targ',
    zone: 'strefa',
    name: 'Imię',
    namePlaceholder: 'np. Anna',
    phone: 'Telefon',
    phonePlaceholder: 'np. 600 000 000',
    send: 'Zamów oddzwonienie',
    sending: 'Wysyłamy…',
    towns: ['Rabka-Zdrój', 'Nowy Targ', 'Zakopane', 'Jordanów', 'Mszana Dolna', 'Limanowa'],
    errors: {
      services: 'Zaznacz przynajmniej jedną instalację.',
      name: 'Podaj imię, żebyśmy wiedzieli, o kogo zapytać.',
      phone: 'Podaj numer telefonu, żebyśmy mogli oddzwonić.',
      consent: 'Zaznacz zgodę na kontakt.',
      failed: 'Nie udało się wysłać. Zadzwoń do nas albo spróbuj za chwilę.',
      limit: 'Wysłano już kilka zgłoszeń. Spróbuj za kilka minut albo zadzwoń.',
    },
    done: {
      title: 'Dziękujemy, oddzwonimy.',
      // „24 h” only as the answer to a request, on working days (spec §2).
      text: 'Odpowiemy do 24 h w dni robocze: zadzwonimy, żeby dopytać o szczegóły i umówić wizję lokalną.',
      number: 'Numer zgłoszenia',
      more: 'Dodaj zdjęcia i szczegóły →',
      again: 'Nowe zgłoszenie',
    },
    ticket: {
      eyebrow: 'Twoje zgłoszenie',
      none: 'Zaznacz instalacje po lewej',
      object: 'Obiekt',
      town: 'Miejscowość',
      zone: 'Strefa dojazdu',
      phone: 'Telefon',
    },
    alt: {
      title: 'Chcesz opisać więcej?',
      text: 'Pełny kreator: pytania o szczegóły i zdjęcia obiektu.',
      link: 'Otwórz kreator →',
    },
    steps: ['Oddzwaniamy', 'Wizja lokalna', 'Wycena na piśmie'],
    contact: {
      phone: 'Telefon',
      /** Without opening hours in the company data. */
      hours: 'pn–pt 9:00–17:00',
      mail: 'E-mail',
      mailNote: 'Zapytania i dokumenty',
      salon: 'Salon',
      route: 'Wyznacz trasę →',
    },
    /** Category of the inquiry in the panel (ADR-I002 §4: the source as a Polish label). */
    category: 'Instalacje — strona główna',
  },
  rail: [
    ['start', 'Start', 'home'],
    ['dla-kogo', 'Dla kogo', 'users'],
    ['uslugi', 'Usługi', 'net'],
    ['architekci', 'Architekci', 'ruler'],
    ['realizacje', 'Realizacje', 'eye'],
    ['gory', 'Góry i zima', 'snow'],
    ['proces', 'Jak pracujemy', 'check'],
    ['serwis', 'Serwis', 'wrench'],
    ['faq', 'Pytania', 'chat'],
    ['zaplanuj', 'Zaplanuj', 'plane'],
  ] as const,
}

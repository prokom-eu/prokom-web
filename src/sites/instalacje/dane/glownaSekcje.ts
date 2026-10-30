import type { HeroObject } from './glowna'
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
  /** „Pokaż na żywo”: the hero object it switches to. */
  live?: HeroObject
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
      'Kamery, które widzą w nocy i w śniegu, z nagraniami u Ciebie, nie w obcej chmurze. Projektujemy cały system, nie tylko miejsca na kamery.',
    parts: ['kamery', 'rejestrator NVR', 'dyski 24/7', 'switch PoE', 'UPS', 'aplikacja'],
    highlights: [
      'Cztery wersje instalacji: od domu po duży obiekt',
      'Kolor w nocy i wykrywanie ludzi oraz aut',
      'Maski prywatności i czas nagrań ustawione pod RODO',
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
      'Czujki, syreny i powiadomienia na telefon. Wideodomofon przy furtce, który odbierasz z drugiego końca Polski.',
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
      'Wi-Fi bez martwych stref, osobna sieć dla gości i dla kamer. Okablowanie, szafy rack i światłowody.',
    parts: ['punkty Wi-Fi', 'router', 'switch', 'szafa rack'],
    highlights: ['Osobne sieci: goście, kamery, kasa', 'Pomiar zasięgu przed i po montażu'],
  },
  {
    key: 'snd',
    description:
      'Stałe nagłośnienie APART i innych marek: muzyka w tle, komunikaty, strefy z osobną głośnością i mowa zrozumiała w ostatniej ławce.',
    parts: ['głośniki', 'wzmacniacz strefowy', 'mikrofony', 'panel ścienny', 'komunikaty'],
    highlights: ['Restauracje, hotele, kościoły, sale obrad', 'Każda strefa z osobną głośnością'],
    big: true,
  },
  {
    key: 'scr',
    description:
      'Ekrany w witrynie, menu board, recepcja i ściany wideo. Treść zmieniasz z komputera na wszystkich ekranach naraz.',
    parts: [
      'ekrany profesjonalne',
      'odtwarzacz w ekranie',
      'uchwyty',
      'zarządzanie treścią',
      'szablony',
    ],
    highlights: [
      'Wdrażamy to w naszych salonach w Rabce i Zakopanem',
      'Harmonogram: rano śniadania, wieczorem kolacje',
    ],
    big: true,
    wide: true,
  },
  {
    key: 'tel',
    description:
      'Dla deweloperów i wykonawców: okablowanie, światłowód do lokali, RTV/SAT i domofony. Z pomiarami.',
    parts: ['okablowanie', 'światłowód', 'RTV/SAT', 'pomiary'],
    highlights: ['Od przedmiaru do odbioru z protokołami', 'Pomiar i opis każdego gniazda'],
  },
  {
    key: 'ant',
    description:
      'Anteny satelitarne i DVB-T2, instalacje zbiorcze i telewizja w pokojach. Ustawiane miernikiem.',
    parts: ['antena', 'konwerter', 'multiswitch', 'gniazda'],
    highlights: ['Ustawiane miernikiem sygnału', 'Ta sama telewizja w każdym pokoju'],
  },
  {
    key: 'ev',
    description:
      'Ładowarki Elzab EcoPower: CC Home do garażu, CC Wall dla firm i obiektów, CC City na parking. Moc dobrana do przyłącza.',
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
    live: 'dom',
  },
  {
    key: 'pens',
    description:
      'Monitoring bez pokoi gości, Wi-Fi w każdym pokoju, telewizja i przegląd przed sezonem.',
    set: ['Wi-Fi gości', 'Kamery RODO', 'TV w pokojach'],
    hue: 2,
    big: true,
    live: 'pens',
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
    live: 'hotel',
  },
  {
    key: 'rest',
    description:
      'Muzyka na sali i tarasie, mikrofony na przemówienia, menu board i kamery przy kasie.',
    set: ['Nagłośnienie', 'Menu board', 'Kamery'],
    hue: 5,
    live: 'rest',
  },
  {
    key: 'sklep',
    description: 'Kamery sali i kas, alarm, ekran w witrynie i muzyka z komunikatami.',
    set: ['Kamery', 'Alarm', 'Witryna'],
    hue: 1,
    live: 'sklep',
  },
  {
    key: 'firma',
    description: 'Sieć firmowa, karty dla pracowników, kamery placu i rampy, brama na karty.',
    set: ['Sieć', 'Karty', 'Kamery placu'],
    hue: 2,
    live: 'firma',
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
  { key: 'gmina', label: 'Gmina, szkoła, kościół', icon: 'school', planner: 'gmina' },
  { key: 'dew', label: 'Deweloper, wspólnota', icon: 'crane', planner: 'dew' },
] as const
export type PlanObject = (typeof PLAN_OBJECTS)[number]['key']

export const glownaSekcje = {
  trust: {
    eyebrow: 'Marki, z którymi pracujemy',
    brands: [
      ['Dahua', 'kamery'],
      ['Hikvision', 'kamery'],
      ['BCS', 'kamery'],
      ['Satel', 'alarmy'],
      ['Ubiquiti', 'sieci Wi-Fi'],
      ['Ampio', 'smart home'],
      ['Elzab EcoPower', 'ładowarki'],
      ['Samsung', 'ekrany'],
      ['APART', 'nagłośnienie'],
      ['RCF', 'nagłośnienie'],
      ['MikroTik', 'sieci'],
    ] as const,
  },
  forWho: {
    eyebrow: 'Dla kogo pracujemy',
    heading: 'Od domu letniskowego',
    accent: 'po halę i szkołę.',
    lead: 'Każdy obiekt ma inne potrzeby i inne przepisy. Wybierz swój, a pokażemy przekrój budynku, typowe problemy i zestawy, od których zaczynamy.',
    live: 'Pokaż na żywo',
    more: 'Zobacz rozwiązania',
    showAll: 'Pokaż wszystkie 12 obiektów',
    collapse: 'Zwiń listę',
    missing: 'Nie ma tu Twojego obiektu? Pracujemy też dla innych firm i instytucji.',
    missingLink: 'Opisz, co masz →',
  },
  services: {
    eyebrow: 'Dziesięć obszarów, jeden wykonawca',
    heading: 'Jedna firma',
    accent: 'od kamery po zamek w drzwiach.',
    lead: 'Zamiast pięciu firm, które się nie znają: jeden projekt, jedna ekipa i jeden numer do serwisu. Nie wiesz, od czego zacząć? Wybierz swój obiekt wyżej albo opisz go w kreatorze.',
    areas: 'obszarów',
    since: 'od 2004',
    sinceNote: 'na Podhalu',
    describe: 'Opisz swój obiekt, a doradzimy zestaw',
    details: 'Szczegóły',
    all: {
      eyebrow: 'Pełna oferta',
      title: 'Wszystkie rozwiązania w jednym miejscu.',
      note: 'Filtr po rodzaju obiektu i wyszukiwarka.',
      button: 'Zobacz pełną ofertę',
    },
  },
  realizations: {
    eyebrow: 'Realizacje',
    heading: 'Wybrane realizacje.',
    all: 'Wszystkie realizacje →',
  },
  mountains: {
    eyebrow: 'Robimy to w górach, nie w biurowcu',
    heading: 'Na Podhalu instalacja ma trudniej. Projektujemy to od początku.',
    lead: 'Mróz, śnieg na kamerach, burze, słabe łącze i domy, w których nikogo nie ma przez pół roku. Znamy to z każdego montażu.',
    showAll: 'Pokaż wszystkie 6 wyzwań',
    collapse: 'Zwiń',
    cards: [
      {
        icon: 'snow',
        title: 'Mróz i śnieg',
        text: 'Dobieramy kamery i obudowy do górskiej zimy i montujemy je tak, żeby jak najmniej zbierały śnieg. Obraz ustawiamy pod odblask od śniegu i wieczorne światło.',
      },
      {
        icon: 'storm',
        title: 'Burze i przepięcia',
        text: 'Ochrona przepięciowa zmniejsza ryzyko uszkodzeń po burzy, a zasilacz UPS podtrzymuje kamery i alarm przy krótkich zanikach prądu.',
      },
      {
        icon: 'off',
        title: 'Słabe łącze',
        text: 'Nagrania zapisują się w obiekcie, a Ampio steruje domem lokalnie. Gdy internet zniknie, instalacja działa dalej, a podgląd z telefonu wraca razem z łączem.',
      },
      {
        icon: 'home',
        title: 'Domy na wynajem i letnie',
        text: 'Podgląd z daleka, nagrzanie domu przed przyjazdem, ochrona przed zamarzaniem i zalaniem. Dla domów, w których nikogo nie ma przez kilka miesięcy.',
      },
      {
        icon: 'cal',
        title: 'Przegląd przed sezonem',
        text: 'Przed zimą i przed latem: czyszczenie kamer, test dysków, akumulatorów, Wi-Fi i ładowarki. Zanim przyjadą goście, a nie po pierwszej awarii.',
      },
      {
        icon: 'pin',
        title: 'Dwa salony blisko Ciebie',
        text: 'Rabka-Zdrój i Zakopane. Dużo usterek naprawiamy zdalnie, a gdy trzeba przyjechać, nie jedziemy z Krakowa.',
      },
    ],
  },
  process: {
    eyebrow: 'Jak pracujemy',
    heading: 'Rozmowa, wizja lokalna, projekt, montaż, odbiór, serwis.',
    lead: 'Bez niespodzianek w połowie roboty. Cena i zakres są na piśmie przed montażem, a po montażu zostajemy w serwisie.',
    steps: [
      {
        title: 'Rozmowa',
        text: 'Telefon albo formularz. Mówisz, co chcesz zabezpieczyć lub usprawnić, wysyłasz zdjęcia.',
      },
      {
        title: 'Wizja lokalna',
        text: 'Przyjeżdżamy, mierzymy, sprawdzamy kable, zasięg i rozdzielnicę.',
      },
      {
        title: 'Projekt i wycena',
        text: 'Plan rozmieszczenia urządzeń i wycena na piśmie, zwykle w wariantach do wyboru.',
      },
      { title: 'Montaż', text: 'W ustalonym terminie, czysto, z zabezpieczeniem mebli i podłóg.' },
      {
        title: 'Odbiór',
        text: 'Sprawdzamy działanie razem z Tobą i pokazujemy, jak korzystać z aplikacji.',
      },
      {
        title: 'Serwis',
        text: 'Przegląd przed sezonem, zdalna pomoc i naprawy pod jednym numerem.',
      },
    ],
  },
  service: {
    eyebrow: 'Serwis i przeglądy',
    heading: 'Montaż to początek. Zostajemy z Tobą.',
    lead: 'Przeglądy przed sezonem, pomoc zdalna i naprawy pod jednym numerem. Przejmujemy też instalacje po firmach, które zniknęły z rynku.',
    primary: 'Serwis i umowy →',
    secondary: 'Przejmijcie mój serwis',
    tiles: [
      { icon: 'cal', title: 'Przegląd przed sezonem', text: 'Kamery, dyski, akumulatory, Wi-Fi.' },
      { icon: 'chat', title: 'Pomoc zdalna', text: 'Wiele usterek naprawiamy bez dojazdu.' },
      { icon: 'wrench', title: 'Naprawy i rozbudowa', text: 'Jeden numer do całej instalacji.' },
      {
        icon: 'layers',
        title: 'Przejęcie serwisu',
        text: 'Instalacje po firmach, które zniknęły.',
      },
    ],
  },
  faq: {
    eyebrow: 'Najczęstsze pytania',
    heading: 'Zanim zadzwonisz.',
    guide: 'Poradnik: przepisy i porady →',
    aside: {
      title: 'Nie ma Twojego pytania?',
      text: 'Zadzwoń albo napisz na WhatsApp. Wyślij zdjęcie obiektu albo starej instalacji, a powiemy, od czego zacząć.',
      button: 'Napisz na WhatsApp',
      /** Without a WhatsApp number in the panel. */
      buttonNoWhatsapp: 'Napisz do nas',
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
          'Zanim przyjedziemy, możesz wysłać zdjęcia obiektu. Często już na ich podstawie powiemy, jakiego zakresu się spodziewać.',
      },
      {
        question: 'Czy kamery działają bez internetu?',
        answer:
          'Tak. Kamery nagrywają na rejestrator w obiekcie. Internet jest potrzebny tylko do podglądu z telefonu i powiadomień.',
      },
      {
        question: 'Czy monitoring w pensjonacie albo firmie jest zgodny z RODO?',
        answer:
          'Pomagamy od strony technicznej: ustawiamy strefy i maski prywatności, czas przechowywania nagrań i miejsca na tabliczki informacyjne. Obowiązki administratora danych, np. regulamin monitoringu, zostają po Twojej stronie. Podpowiemy, co przygotować.',
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
    eyebrow: 'Zaplanuj instalację · 2 minuty',
    heading: 'Powiedz, co planujesz.',
    accent: 'Resztę ustalimy na miejscu.',
    lead: 'Zaznacz, czego potrzebujesz, zostaw numer, a oddzwonimy i umówimy wizję lokalną. Bez zobowiązań, wycena na piśmie.',
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
      title: 'Dziękujemy! Oddzwonimy.',
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
      mail: 'WhatsApp i e-mail',
      mailOnly: 'E-mail',
      mailNote: 'Wyślij zdjęcia obiektu',
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
    // „Architekci” (`ruler`) comes with its section in I16c (ADR-I005 §5).
    ['realizacje', 'Realizacje', 'eye'],
    ['gory', 'Góry i zima', 'snow'],
    ['proces', 'Jak pracujemy', 'check'],
    ['serwis', 'Serwis', 'wrench'],
    ['faq', 'Pytania', 'chat'],
    ['zaplanuj', 'Zaplanuj', 'plane'],
  ] as const,
}

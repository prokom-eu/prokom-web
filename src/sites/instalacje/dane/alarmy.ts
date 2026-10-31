import type { Feature, SectionHead } from './anteny'

/**
 * Fixed texts of the Alarmy page (ADR-I002 §1): the sections that are not in `InstServices` and
 * the widgets. Transcribed from `zrodlo/pages/Alarmy.js` + `Alarmy.body.html` (v4.2) the way
 * `cleanPrototype` cleans a snapshot: without UI keys and without the source list (`src`, the
 * system footnotes) — spec §2: no source lists on the site. Edited by hand from now on.
 */

export type AlarmMode = 'off' | 'night' | 'full'
export type AlarmTest = 'in' | 'water' | 'smoke'
export type AlarmMessageKey =
  | 'inInfo'
  | 'inDoor'
  | 'inMotion'
  | 'inAlarm'
  | 'inCamera'
  | 'water'
  | 'waterValve'
  | 'smoke'
  | 'smokeSiren'

export const ALARM_ELEMENT_KEYS = [
  'cen',
  'kl',
  'pir',
  'mag',
  'gb',
  'out',
  'sir',
  'fl',
  'sm',
  'cam',
  'lte',
  'ag',
] as const
export type AlarmElementKey = (typeof ALARM_ELEMENT_KEYS)[number]

export const alarmy = {
  /** House cross-section in the hero (`al`). */
  house: {
    label: 'Interaktywny przekrój domu z czujkami alarmu',
    modesLabel: 'Tryb alarmu',
    modes: [
      { mode: 'off', label: 'Rozbrojony', icon: 'lock' },
      { mode: 'night', label: 'Noc · parter', icon: 'moon' },
      { mode: 'full', label: 'Pełne uzbrojenie', icon: 'shield' },
    ] as { mode: AlarmMode; label: string; icon: string }[],
    tests: [
      { test: 'in', label: 'Wejście przez taras', icon: 'door' },
      { test: 'water', label: 'Zalanie', icon: 'drop' },
      { test: 'smoke', label: 'Dym', icon: 'fire' },
    ] as { test: AlarmTest; label: string; icon: string }[],
    app: 'Aplikacja',
    status: {
      alarm: { title: 'Alarm', sub: 'sprawdź powiadomienia' },
      off: { title: 'Rozbrojony', sub: 'czujki dymu, zalania i temperatury czuwają' },
      night: { title: 'Uzbrojony na noc', sub: 'parter i garaż · piętro wolne' },
      full: { title: 'Uzbrojony', sub: 'cały dom i garaż' },
    },
    messages: {
      inInfo: { title: 'Drzwi tarasowe otwarte', sub: 'Dom rozbrojony · tylko informacja' },
      inDoor: { title: 'Drzwi tarasowe otwarte', sub: '02:14:05 · strefa Parter' },
      inMotion: { title: 'Ruch w kuchni', sub: 'czas na wpisanie kodu: 30 s' },
      inAlarm: {
        title: 'ALARM · Parter',
        sub: 'syrena włączona · SMS i powiadomienie wysłane',
      },
      inCamera: { title: 'Podgląd z kamery tarasu', sub: 'otwórz nagranie z chwili alarmu' },
      water: {
        title: 'Zalanie · Kuchnia',
        sub: 'czujka zalania działa zawsze, także po rozbrojeniu',
      },
      waterValve: { title: 'Zawór wody zamknięty', sub: 'jeśli jest elektrozawór i automatyka' },
      smoke: { title: 'Dym · Kuchnia', sub: 'czujka pożarowa · sygnał całą dobę' },
      smokeSiren: { title: 'Syrena i powiadomienie', sub: 'do Ciebie i osób z listy' },
    } satisfies Record<AlarmMessageKey, { title: string; sub: string }>,
    note: {
      legend:
        'R ruch · O otwarcie · D dym · W zalanie · T temperatura. Niebieskie są uzbrojone, zielone czuwają całą dobę. ',
      night: 'Tryb nocny: śpisz na piętrze, a parter i garaż są pilnowane.',
      off: 'Po rozbrojeniu otwarcie drzwi to tylko informacja w aplikacji.',
      full: 'Wychodzisz z domu: wszystko jest uzbrojone.',
    },
  },

  flow: {
    head: {
      eyebrow: 'Jak to działa',
      heading: 'Od otwartego okna do powiadomienia w kilka sekund.',
      lead: 'Czujki pilnują drzwi, okien i pomieszczeń. Centrala decyduje, co zrobić. Ty dostajesz powiadomienie, a jeśli chcesz, sygnał trafia też do agencji ochrony.',
    } satisfies SectionHead,
    items: [
      {
        icon: 'eye',
        title: 'Czujki',
        text: 'Ruchu, otwarcia drzwi i okien, rozbicia szyby, dymu, zalania, temperatury.',
      },
      {
        icon: 'cpu',
        title: 'Centrala',
        text: 'Sprawdza strefy i czas na wpisanie kodu. Ma akumulator na wypadek braku prądu.',
      },
      {
        icon: 'bell',
        title: 'Syrena i telefon',
        text: 'Syrena odstrasza, a powiadomienie i SMS trafiają do Ciebie i wskazanych osób.',
      },
      {
        icon: 'shield',
        title: 'Reakcja',
        text: 'Sprawdzasz kamerę w aplikacji. Opcjonalnie sygnał odbiera agencja ochrony.',
      },
    ] satisfies Feature[],
  },

  versions: {
    head: {
      eyebrow: 'Wersje alarmu',
      heading: 'Inny alarm do mieszkania, inny do pustego domu w górach.',
      lead: 'Wybierz obiekt. Pokażemy, z jakich elementów zwykle składamy system i co każdy z nich robi. Przykładowe urządzenia z bezprzewodowej linii Satel ABAX 2 i Ajax.',
    } satisfies SectionHead,
    tabsLabel: 'Wersja alarmu',
    note: 'Zasięgi radiowe podaje się dla otwartej przestrzeni, w budynku są krótsze. Konkretne urządzenia dobieramy po wizji lokalnej.',
    elements: {
      cen: {
        icon: 'cpu',
        name: 'Centrala z akumulatorem',
        text: 'Mózg systemu. Przy braku prądu pracuje na akumulatorze, przy braku internetu wysyła powiadomienia przez sieć komórkową.',
        model: 'np. Satel z kontrolerem ABAX 2, Ajax Hub 2',
      },
      kl: {
        icon: 'grid',
        name: 'Klawiatura i piloty',
        text: 'Uzbrajanie przy wejściu, pilot dla domowników, a do tego aplikacja w telefonie.',
        model: 'manipulator, breloki',
      },
      pir: {
        icon: 'eye',
        name: 'Czujki ruchu odporne na zwierzęta',
        text: 'Ignorują psa lub kota do ok. 20 kg, zależnie od modelu.',
        model: 'np. Satel APD-200 Pet: pole 14 × 16 m',
      },
      mag: {
        icon: 'door',
        name: 'Czujki otwarcia drzwi i okien',
        text: 'Alarm, zanim ktoś wejdzie do środka.',
        model: 'czujki magnetyczne',
      },
      gb: {
        icon: 'x',
        name: 'Czujki zbicia szyby',
        text: 'Przy dużych przeszkleniach, witrynach i drzwiach tarasowych.',
        model: 'np. Satel AGD-200: do 6 m',
      },
      out: {
        icon: 'sun2',
        name: 'Czujki zewnętrzne',
        text: 'Alarm, gdy ktoś jest jeszcze na podwórku, a nie dopiero w domu.',
        model: 'np. Satel AOD-210: praca od −40°C',
      },
      sir: {
        icon: 'bell',
        name: 'Sygnalizator z lampą',
        text: 'Głośny sygnał i błyskające światło odstraszają i pokazują, gdzie jest alarm.',
        model: 'np. Satel ASP-200 R: do 105 dB',
      },
      fl: {
        icon: 'drop',
        name: 'Czujki zalania i temperatury',
        text: 'Woda pod pralką albo spadek temperatury w kotłowni od razu w telefonie.',
        model: 'np. Satel AFD-200: bateria do 5 lat',
      },
      sm: {
        icon: 'fire',
        name: 'Czujki dymu',
        text: 'Powiadomienie w telefonie, nawet gdy w domu nikogo nie ma.',
        model: 'np. Satel ASD-250, zgodna z EN 14604',
      },
      cam: {
        icon: 'camera2',
        name: 'Czujka ze zdjęciem',
        text: 'Przy alarmie przesyła serię zdjęć, więc od razu widzisz, czy to włamanie.',
        model: 'np. Ajax MotionCam: bateria do 4 lat',
      },
      lte: {
        icon: 'ant',
        name: 'Łączność LTE i Ethernet',
        text: 'Dwie drogi powiadomień. Gdy jedna zawiedzie, działa druga.',
        model: 'moduł GSM/LTE, dwie karty SIM',
      },
      ag: {
        icon: 'shield',
        name: 'Agencja ochrony (opcja)',
        text: 'Sygnał trafia do całodobowego centrum, które wysyła patrol.',
        model: 'umowa z agencją z koncesją',
      },
    } satisfies Record<
      AlarmElementKey,
      { icon: string; name: string; text: string; model: string }
    >,
    items: [
      {
        name: 'Mieszkanie',
        icon: 'office',
        sub: 'bezprzewodowo, bez kucia',
        keys: ['cen', 'kl', 'pir', 'mag', 'sir', 'fl', 'sm', 'lte'],
      },
      {
        name: 'Dom',
        icon: 'home',
        sub: 'strefy i tryb nocny',
        keys: ['cen', 'kl', 'pir', 'mag', 'gb', 'out', 'sir', 'lte', 'ag'],
      },
      {
        name: 'Dom letniskowy',
        icon: 'snow',
        sub: 'pilnuje także pod nieobecność',
        keys: ['cen', 'kl', 'pir', 'mag', 'sir', 'fl', 'sm', 'cam', 'lte'],
      },
      {
        name: 'Firma i sklep',
        icon: 'shop',
        sub: 'strefy, kody, agencja',
        keys: ['cen', 'kl', 'pir', 'mag', 'gb', 'out', 'sir', 'cam', 'lte', 'ag'],
      },
    ] as { name: string; icon: string; sub: string; keys: AlarmElementKey[] }[],
  },

  compare: {
    head: {
      eyebrow: 'Przewodowy czy bezprzewodowy',
      heading: 'Dobieramy system do budynku, a nie odwrotnie.',
    },
    columns: ['Przewodowy', 'Bezprzewodowy'],
    rows: [
      {
        key: 'Kiedy najlepiej',
        wired: 'Nowy dom, remont, firma. Kable prowadzimy razem z elektryką.',
        wireless: 'Dom wykończony, apartament, lokal na wynajem. Bez kucia ścian.',
      },
      {
        key: 'Niezawodność',
        wired: 'Brak baterii w czujkach, odporność na zakłócenia radiowe.',
        wireless: 'Nowoczesne systemy mają szyfrowaną łączność i nadzór czujek.',
      },
      {
        key: 'Obsługa',
        wired: 'Klawiatura, aplikacja, piloty.',
        wireless: 'Aplikacja, piloty, klawiatura bezprzewodowa.',
      },
      {
        key: 'Serwis',
        wired: 'Praktycznie bez wymiany baterii.',
        wireless: 'Baterie w czujkach co kilka lat, aplikacja przypomina.',
      },
      {
        key: 'Rozbudowa',
        wired: 'Najtańsza na etapie budowy, potem trudniejsza.',
        wireless: 'Łatwo dodać czujkę w dowolnym miejscu.',
      },
      {
        key: 'Łączność',
        wired: 'LAN, GSM/LTE, zależnie od modułów.',
        wireless: 'Ethernet, Wi-Fi, karta SIM, zależnie od modelu.',
      },
    ],
    systems: [
      {
        name: 'Satel PERFECTA i INTEGRA',
        text: 'Polskie centrale. PERFECTA do mieszkań, domów i lokali, z aplikacją i czujkami bezprzewodowymi MICRA. INTEGRA łączy alarm z automatyką domu.',
      },
      {
        name: 'Ajax',
        text: 'System bezprzewodowy: zasięg radiowy do 2000 m w otwartej przestrzeni, do 100 urządzeń na centralę, łączność Ethernet i SIM.',
      },
      {
        name: 'Hikvision AX PRO',
        text: 'Bezprzewodowy alarm z klasą Grade 2, łącznością LAN, Wi-Fi i 4G oraz weryfikacją wideo w aplikacji Hik-Connect.',
      },
    ],
    grade: {
      title: 'Firma, sklep, pensjonat:',
      text: 'centralę i czujki dobieramy w klasie zabezpieczeń (Grade według normy EN 50131), której wymaga Twój ubezpieczyciel. Warto sprawdzić to w polisie przed wyceną.',
    },
  },

  doorPhone: {
    eyebrow: 'Wideodomofony z aplikacją',
    heading: 'Kurier przy furtce, a Ty na stoku. Otwierasz z telefonu.',
    lead: 'Wideodomofon dzwoni do panelu w domu i do aplikacji w telefonie. Widzisz, kto stoi przy furtce, rozmawiasz i otwierasz furtkę albo bramę. Dla pensjonatu: gość zgłasza się przy wejściu, nawet gdy recepcja jest zamknięta.',
    list: [
      {
        title: 'Aplikacja w telefonie',
        text: 'Aplikacja producenta, np. Hik-Connect albo DMSS: rozmowa, otwieranie, historia połączeń.',
      },
      {
        title: 'Wymiana starego domofonu',
        text: 'Systemy dwuprzewodowe działają na istniejącym kablu. Często bez kucia.',
      },
      {
        title: 'Kilka wejść i lokali',
        text: 'Furtka, brama, drzwi do budynku, kilka mieszkań lub apartamentów.',
      },
      {
        title: 'Razem z alarmem i kamerami',
        text: 'Jedna aplikacja albo integracja z Ampio w smart home.',
      },
    ],
    screen: 'Wideodomofon · Furtka',
    parcel: 'PACZKA',
    states: [
      { label: 'Furtka · dzwoni', message: 'Ktoś dzwoni do furtki', icon: 'bell' },
      {
        label: 'Furtka · rozmowa',
        message: 'Rozmowa: „Paczka dla Pana, zostawić przy drzwiach?”',
        icon: 'phone',
      },
      { label: 'Furtka · otwarta', message: 'Furtka otwarta na 5 sekund', icon: 'lock' },
      {
        label: 'Furtka · zamknięta',
        message: 'Furtka zamknięta · zdjęcie zapisane w historii',
        icon: 'check',
      },
    ],
    buttons: { talk: 'Rozmawiaj', gate: 'Furtka', drive: 'Brama' },
    caption: 'Przykładowy ekran · ilustracja',
  },

  intercoms: {
    head: {
      eyebrow: 'Domofony i wideodomofony',
      heading: 'Od furtki przy domu po wejście do bloku.',
      lead: 'Dobieramy system do tego, co już masz w ścianie. Stary domofon na dwóch żyłach często da się wymienić na wideodomofon bez kucia, a w nowym domu kładziemy przewód sieciowy.',
    } satisfies SectionHead,
    cases: [
      {
        icon: 'home',
        title: 'Dom i furtka',
        items: [
          'Panel z kamerą przy furtce',
          'Monitor w domu albo tylko aplikacja',
          'Rozmowa i otwieranie z telefonu',
          'Elektrozaczep lub zwora w furtce',
        ],
      },
      {
        icon: 'gate',
        title: 'Dom z bramą',
        items: [
          'Osobno „furtka” i „brama”',
          'Sterowanie napędem bramy',
          'Kody PIN i breloki dla domowników',
          'Drugi monitor na piętrze',
        ],
      },
      {
        icon: 'users',
        title: 'Blok i wspólnota',
        items: [
          'Panel z numerami lokali lub listą',
          'Breloki dla mieszkańców',
          'Zgubiony brelok blokujemy w systemie',
          'Monitory albo aplikacja w mieszkaniach',
        ],
      },
      {
        icon: 'bed',
        title: 'Pensjonat i apartamenty',
        items: [
          'Połączenie do recepcji',
          'Po godzinach przekierowanie na telefon',
          'Breloki dla obsługi',
          'Historia otwarć: kto i kiedy',
        ],
      },
    ],
    question: {
      kicker: 'Jaki system?',
      title: 'Masz w ścianie przewody od starego domofonu?',
      answers: [
        {
          label: 'Tak, dwie żyły',
          result: 'System 2-przewodowy',
          text: 'Zasilanie, dźwięk i obraz idą istniejącą parą przewodów. Producent podaje zasięg zależny od przekroju kabla, np. Dahua 2-Wire Hybrid do 200 m. Stan starego przewodu sprawdzamy na miejscu.',
        },
        {
          label: 'Nie, nowy dom',
          result: 'Wideodomofon IP z zasilaniem PoE',
          text: 'Jeden przewód sieciowy do panelu daje zasilanie i obraz. Najwięcej możliwości: aplikacja, kilka monitorów, połączenie z kamerami.',
        },
        {
          label: 'Nie wiem',
          result: 'Sprawdzimy na wizji lokalnej',
          text: 'Wystarczy zdjęcie starego unifonu albo monitora i panelu przy furtce. Po nim zwykle wiemy, czy przewody się nadadzą.',
        },
      ],
      note: 'Rozpoznawania twarzy w panelach nie proponujemy domyślnie: to dane biometryczne i wymagają szczególnych podstaw z RODO.',
    },
  },

  holiday: {
    eyebrow: 'Dom letniskowy i apartament na wynajem',
    heading: 'Nikogo nie ma od miesiąca. Alarm i tak pilnuje.',
    lead: 'Przesuń suwak i zobacz zimę w pustym domu. Oprócz czujek ruchu dokładamy czujki, które działają całą dobę: zalanie, temperatura, dym. Satel AFD-200 wykrywa wodę i mierzy temperaturę, a bateria wystarcza według producenta do 5 lat.',
    day: 'Dzień',
    sinceLeaving: 'od wyjazdu',
    sliderLabel: 'Dzień od wyjazdu',
    stats: {
      inside: 'W domu',
      outside: 'Na zewnątrz',
      water: 'Woda',
      leak: 'wyciek',
      dry: 'sucho',
    },
    app: 'Aplikacja alarmu',
    house: 'Dom w Bukowinie',
    caption: 'Przykładowy przebieg · ilustracja',
    when: { today: 'dzisiaj', yesterday: 'wczoraj', daysAgo: 'dni temu' },
    empty: { title: 'Wyjazd', sub: 'Uzbrój alarm z aplikacji' },
    /** The winter in the empty house: day, event, the day it shows from (default = day). */
    events: [
      {
        day: 1,
        icon: 'check',
        title: 'Wyjazd: alarm uzbrojony',
        sub: 'Tryb pusty dom · wszystkie czujki aktywne',
        tone: 'ok',
      },
      {
        day: 21,
        icon: 'users',
        title: 'Sprzątanie: rozbrojono kodem',
        sub: 'Użytkownik „ekipa sprzątająca”, 10:02–11:15',
        tone: 'ok',
      },
      {
        day: 34,
        icon: 'thermo',
        title: 'Za zimno w kotłowni: 4°C',
        sub: 'Mróz −18°C. Sprawdź ogrzewanie, zanim zamarzną rury.',
        tone: 'warn',
      },
      {
        day: 35,
        icon: 'drop',
        title: 'Zalanie: łazienka',
        sub: 'Czujka wykryła wodę. Powiadomienie dostajesz Ty i opiekun domu.',
        tone: 'bad',
      },
      {
        day: 35,
        shownFrom: 36,
        icon: 'check',
        title: 'Woda zakręcona',
        sub: 'Opiekun domu dojechał godzinę po alarmie. Czujka znów sucha.',
        tone: 'ok',
      },
      {
        day: 52,
        icon: 'battery',
        title: 'Słaba bateria: czujka w garażu',
        sub: 'Wymiana przy najbliższym przeglądzie',
        tone: 'ok',
      },
    ] as {
      day: number
      shownFrom?: number
      icon: string
      title: string
      sub: string
      tone: 'ok' | 'warn' | 'bad'
    }[],
  },

  agency: {
    eyebrow: 'Powiadomienia czy agencja ochrony',
    heading: 'Kto reaguje, gdy alarm zawyje?',
    lead: 'Najprościej: Ty, przez aplikację i SMS. Jeśli nie możesz odbierać powiadomień, sygnał może trafić do całodobowego centrum agencji ochrony, która wyśle patrol.',
    items: [
      {
        icon: 'phone',
        title: 'Powiadomienia do Ciebie',
        text: 'Aplikacja, SMS, połączenie głosowe. Bez abonamentu agencji.',
      },
      {
        icon: 'users',
        title: 'Lista osób',
        text: 'Sąsiad, rodzina, opiekun domu. Każdy dostaje powiadomienie.',
      },
      {
        icon: 'shield',
        title: 'Agencja ochrony',
        text: 'Całodobowy odbiór sygnałów i patrol interwencyjny, umowa z agencją.',
      },
    ] satisfies Feature[],
    // TODO(krystian): agencja partnerska — prototyp: „Agencja partnerska: [SZEF].” (spec §12);
    // zdanie wraca do notki, gdy szef poda nazwę.
    licence:
      'Montaż i serwis alarmów w domach, firmach i pensjonatach nie wymagają koncesji (poza obszarami i obiektami podlegającymi obowiązkowej ochronie). Całodobowe dozorowanie sygnałów to już ochrona fizyczna i prowadzi ją agencja z koncesją MSWiA.',
  },
}

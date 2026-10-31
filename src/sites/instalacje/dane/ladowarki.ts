import type { SectionHead } from './anteny'

/**
 * Fixed texts of the Ładowarki EV page (ADR-I002 §1): the sections that are not in
 * `InstServices`, the models and the widgets. Transcribed from `zrodlo/pages/Ladowarki.js` +
 * `Ladowarki.body.html` (v4.2) the way `cleanPrototype` cleans a snapshot: without UI keys and
 * without the source list. Spec §2.5 (the boss, 27.10): the full Elzab EcoPower range with the
 * comparison and the version configurator, without prices; colours with the availability note;
 * we do not write that the chargers have a display. Edited by hand from now on.
 */

export type ChargerKey = 'home' | 'wall' | 'city'
export type PathKey = 'dom' | 'obiekt' | 'parking'

type IconText = { icon: string; title: string; text: string }

export const CHARGER_KEYS: readonly ChargerKey[] = ['home', 'wall', 'city']

export const ladowarki = {
  models: {
    home: {
      name: 'CC Home',
      kind: 'Dom i garaż',
      who: 'Dom, garaż, wiata',
      image: { src: '/instalacje/ev/home.webp', width: 384, height: 528 },
      alt: 'Ładowarka Elzab EcoPower CC Home, okrągła, naścienna, z przewodem',
      text: 'Okrągła ładowarka do garażu. Podłączasz auto i ładujesz, bez kart i aplikacji.',
      power: '3,7–11 kW',
      powerSub: '1 punkt ładowania',
      specs: [
        ['Moc', '3,7 / 7,4 / 11 kW'],
        ['Obudowa', 'IP44, IK08'],
        ['Wyjście', 'gniazdo lub przewód 5 m'],
      ],
      features: [
        '1 faza 3,7 lub 7,4 kW albo 3 fazy 11 kW',
        'Montaż na ścianie w garażu lub pod wiatą',
        'Tryb domowy: bez autoryzacji, status na diodzie LED',
        'Średnica 361 mm, masa 5 kg',
      ],
      variants: ['3,7 kW', '7,4 kW', '11 kW'],
      imageClass: 'evi evi-h',
    },
    wall: {
      name: 'CC Wall',
      kind: 'Firma i obiekt',
      who: 'Pensjonat, hotel, firma, flota',
      image: { src: '/instalacje/ev/wall.webp', width: 280, height: 466 },
      alt: 'Ładowarka Elzab EcoPower CC Wall, biała obudowa z czarnym frontem',
      text: 'Ładowarka ścienna na jedno albo dwa auta. Dostęp na kartę RFID lub w aplikacji, na ścianę albo na podstawę.',
      power: 'do 2×22 kW',
      powerSub: '1 lub 2 punkty ładowania',
      specs: [
        ['Moc', 'od 1×11 do 2×22 kW'],
        ['Obudowa', 'IP54, IK10'],
        ['Dostęp', 'RFID, aplikacja'],
      ],
      features: [
        'Od 1×11 do 2×22 kW, gniazdo lub wtyk Typ 2',
        'Na ścianę albo na dedykowaną podstawę',
        'Karty RFID, aplikacja, OCPP, dzielenie mocy',
        'Osobne zabezpieczenia każdego punktu',
      ],
      variants: ['1×11 kW', '2×22 kW', '6 kolorów'],
      imageClass: 'evi evi-w',
    },
    city: {
      name: 'CC City',
      kind: 'Parking',
      who: 'Parking hotelu, firmy, sklepu',
      image: { src: '/instalacje/ev/city.webp', width: 102, height: 414 },
      alt: 'Wolnostojąca stacja ładowania Elzab EcoPower CC City',
      text: 'Wolnostojąca stacja na parking. Dwa auta naraz, licznik MID i połączenie z systemem rozliczeń.',
      power: 'do 2×22 kW',
      powerSub: '1 lub 2 punkty ładowania',
      specs: [
        ['Moc', 'od 1×11 do 2×22 kW'],
        ['Licznik', 'MID'],
        ['Łączność', 'GSM, OCPP'],
      ],
      features: [
        'Od 1×11 do 2×22 kW, gniazdo lub przewód Typ 2',
        'Stal ocynkowana, malowana proszkowo, IP54, IK10',
        'RFID, aplikacja albo plug & charge',
        'Licznik MID, łączność GSM, OCPP 1.5/1.6',
      ],
      variants: ['1 punkt', '2 punkty', 'MID'],
      imageClass: 'evi evi-c',
    },
  } satisfies Record<
    ChargerKey,
    {
      name: string
      kind: string
      who: string
      image: { src: string; width: number; height: number }
      alt: string
      text: string
      power: string
      powerSub: string
      specs: readonly (readonly [string, string])[]
      features: readonly string[]
      variants: readonly string[]
      imageClass: string
    }
  >,

  /** Showcase in the hero (`sh`). */
  showcase: {
    label: 'Ładowarki Elzab EcoPower',
    tabsLabel: 'Model ładowarki',
    brand: 'Elzab',
    pick: 'Dobierz wersję',
  },

  offer: {
    head: {
      eyebrow: 'Oferta Elzab EcoPower',
      heading: 'Trzy ładowarki. Od garażu po parking hotelu.',
      lead: 'Montujemy całą rodzinę ładowarek Elzab EcoPower. Elzab to polski producent z Zabrza. Model dobieramy do tego, kto będzie ładował, ile aut naraz i czy ładowanie ma być rozliczane.',
    } satisfies SectionHead,
    pick: 'Dobierz wersję',
    extrasHeading: 'W ofercie także',
    extras: [
      {
        icon: 'build',
        title: 'Podstawa do CC Wall',
        text: 'Ładowarka ścienna staje na parkingu bez ściany.',
      },
      { icon: 'plug', title: 'Przewód 7,5 m', text: 'Do CC Wall, w wersji 1- lub 3-fazowej.' },
      { icon: 'card', title: 'Karty RFID', text: 'Dla gości, pracowników i floty.' },
      {
        icon: 'cloud',
        title: 'Rozliczanie ładowania',
        text: 'OCPP i aplikacja, gdy ładowanie ma być płatne.',
      },
    ] satisfies IconText[],
  },

  /** Version configurator (`cf`). */
  config: {
    head: {
      eyebrow: 'Dobór wersji',
      heading: 'Złóż swoją ładowarkę.',
      lead: 'Wybierz model i opcje. Pokażemy, czego taka wersja wymaga od instalacji. Dokładny model potwierdzimy po zdjęciu rozdzielnicy.',
    } satisfies SectionHead,
    model: 'Model',
    colour: 'Kolor obudowy',
    colourNote: 'Dostępność koloru potwierdzamy przy zamówieniu.',
    yours: 'Twoja konfiguracja',
    ask: 'Zapytaj o tę wersję',
    /** Housing colours of CC Wall: name and the swatch (a token of tokens.css). */
    colours: [
      ['Czarny', '--il-evsw-black'],
      ['Biały', '--il-evsw-white'],
      ['Szary', '--il-evsw-grey'],
      ['Niebieski', '--il-evsw-blue'],
      ['Zielony', '--il-evsw-green'],
      ['Brązowy', '--il-evsw-brown'],
    ],
  },

  comparison: {
    head: { eyebrow: 'Porównanie', heading: 'CC Home, CC Wall i CC City obok siebie.' },
    feature: 'Cecha',
    swipe: 'Przesuń tabelę w bok, żeby zobaczyć CC City →',
    note: 'Przed zamówieniem potwierdzamy aktualne parametry i dostępność wybranej wersji.',
    rows: [
      [
        'Dla kogo',
        'dom, garaż, wiata',
        'firma, pensjonat, hotel, flota',
        'parking hotelu, firmy, sklepu',
      ],
      [
        'Moc',
        '3,7 / 7,4 kW (1 faza) lub 11 kW (3 fazy)',
        'od 1×11 do 2×22 kW',
        'od 1×11 do 2×22 kW',
      ],
      ['Punkty ładowania', '1', '1 lub 2', '1 lub 2'],
      [
        'Wyjście',
        'gniazdo Typ 2 lub przewód 5 m',
        'gniazdo lub wtyk Typ 2, opcja przewód 7,5 m',
        'gniazdo lub przewód Typ 2',
      ],
      [
        'Montaż',
        'naścienny, wewnątrz lub pod wiatą',
        'ściana lub dedykowana podstawa',
        'wolnostojąca, na fundamencie',
      ],
      ['Szczelność i odporność', 'IP44, IK08', 'IP54, IK10', 'IP54, IK10'],
      [
        'Dostęp',
        'tryb domowy, bez autoryzacji',
        'karta RFID, aplikacja',
        'karta RFID, aplikacja, plug & charge',
      ],
      ['Łączność i OCPP', '—', 'OCPP, praca offline lub online', 'GSM, OCPP 1.5/1.6, Modbus RS485'],
      ['Dzielenie mocy', '—', 'tak (DLM)', 'tak'],
      ['Licznik MID', '—', 'zależnie od wersji', 'tak'],
      ['Wymiary i masa', 'Ø361 mm, 5 kg', '688×452×238 mm, 39 kg', '1360×262×217 mm, 60 kg'],
      [
        'Obudowa',
        'poliwęglan i metal',
        'kilka kolorów do wyboru',
        'stal ocynkowana, malowana proszkowo',
      ],
      ['Temperatura pracy', '−25 do +40°C', '−25 do +40°C', '−25 do +40°C'],
    ] as const satisfies readonly (readonly [string, string, string, string])[],
  },

  /** Charging time calculator (`ev`). */
  calc: {
    eyebrow: 'Kalkulator',
    heading: 'Ile potrwa ładowanie Twojego auta?',
    lead: 'Ustaw baterię, zakres ładowania i moc. Zobaczysz, czy mocniejsza ładowarka ma u Ciebie sens.',
    tips: [
      'Do ładowania nocą w domu zwykle wystarcza 7,4 albo 11 kW.',
      'Mocniejsza ładowarka nie przyspieszy auta, które przyjmuje mniej.',
      '22 kW ma sens przy dwóch autach, flocie albo krótkich postojach gości.',
    ],
    label: 'Kalkulator czasu ładowania samochodu elektrycznego',
    pathsLabel: 'Gdzie ładujesz',
    paths: [
      { key: 'dom', name: 'Dom', icon: 'home', device: 'Elzab CC Home' },
      { key: 'obiekt', name: 'Obiekt z gośćmi', icon: 'bed', device: 'Elzab CC Wall' },
      { key: 'parking', name: 'Parking obiektu', icon: 'car', device: 'Elzab CC City' },
    ] satisfies { key: PathKey; name: string; icon: string; device: string }[],
    battery: 'Bateria auta',
    batteryLabel: 'Pojemność baterii w kWh',
    range: 'Ładujesz od – do',
    power: 'Moc ładowarki',
    car: 'Ile przyjmuje auto (AC)',
    homeMax: 'CC Home: maks. 11 kW',
    time: 'Czas ładowania',
    energy: 'Energia',
    effective: 'Moc w praktyce',
    supply: 'Zasilanie',
    notes: {
      base: 'Czas liczymy jako energia ÷ moc. W praktyce bywa trochę dłużej: auto zwalnia ładowanie pod koniec, a część energii idzie na straty. Auto pobiera tyle, ile pozwala jego ładowarka pokładowa.',
      home: 'Elzab CC Home ładuje z mocą do 11 kW (3 fazy). Do 22 kW potrzebna jest ładowarka CC Wall. ',
      /** `{kw}` = what the car takes. */
      car: 'Twoje auto przyjmie najwyżej {kw} kW prądu przemiennego, więc mocniejsza ładowarka nie przyspieszy ładowania. Przyda się za to przy kolejnym aucie albo dwóch autach naraz. ',
    },
  },

  rules: {
    head: {
      eyebrow: 'Formalności',
      heading: 'Przyłącze, UDT, wspólnota. Pomagamy przejść przez wszystko.',
    },
    items: [
      {
        icon: 'bolt',
        title: 'Moc przyłącza',
        text: 'Sprawdzamy rozdzielnicę i moc umowną. 11 kW wymaga trzech faz. Gdy mocy jest mało, ustawiamy niższą moc albo dzielenie mocy między stacje.',
        note: 'Wycenę zaczynamy od zdjęcia rozdzielnicy i licznika.',
      },
      {
        icon: 'shield',
        title: 'Badanie UDT',
        text: 'Ustawa o elektromobilności (art. 16) przewiduje badanie UDT przed oddaniem stacji do eksploatacji, także po naprawie lub modernizacji. Czy dotyczy Twojej ładowarki, zależy m.in. od tego, kto z niej korzysta. Sprawdzamy to przy projekcie i pomagamy w zgłoszeniu.',
        note: '',
      },
      {
        icon: 'users',
        title: 'Ładowarka w bloku i we wspólnocie',
        text: 'W budynku z więcej niż trzema lokalami mieszkalnymi potrzebna jest zgoda zarządcy. Zarządca w 30 dni od wniosku zleca ekspertyzę (nie trzeba jej, gdy budynek ma instalację pod ładowarki), a wniosek rozpatruje w 30 dni od jej otrzymania. We wspólnocie mieszkaniowej zgoda na punkt ładowania o mocy mniejszej niż 11 kW jest czynnością zwykłego zarządu.',
        note: '',
      },
      {
        icon: 'globe',
        title: 'Stacja ogólnodostępna',
        text: 'Stację dostępną dla wszystkich kierowców realizujemy na zapytanie, z partnerem, który zostaje operatorem stacji, rejestruje ją w Ewidencji Infrastruktury Paliw Alternatywnych (EIPA) i rozlicza ładowanie.',
        note: '',
      },
    ],
  },
} as const

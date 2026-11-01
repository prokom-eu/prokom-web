import type { Feature, SectionHead } from './anteny'

/**
 * Fixed texts of the Monitoring page (ADR-I002 §1): the sections that are not in `InstServices`
 * and the widgets. Transcribed from `zrodlo/pages/Monitoring.js` + `Monitoring.body.html` (v4.2)
 * the way `cleanPrototype` cleans a snapshot: without UI keys and without the source list
 * (`src`, the brand footnotes) — spec §2: no source lists on the site. No KSC note (spec §2.9).
 * Edited by hand from now on.
 */

export type CamMode = 'day' | 'ir' | 'col'

/** A version of the installation in the „Wersje instalacji” diagram (`SYV`). */
export type SystemVersion = {
  name: string
  icon: string
  sub: string
  /** Lit camera icons in the diagram (of 8). */
  cams: number
  camLabel: string
  nvrLabel: string
  disks: number
  upsLabel: string
  stats: { label: string; value: string }[]
  /** What the element is in this version; an element without an entry is not in the set
   *  (cameras, recorder and disks always are). */
  spec: Partial<Record<SystemElementKey, string>>
}

export const SYSTEM_ELEMENT_KEYS = [
  'cam',
  'srg',
  'sw',
  'nvr',
  'hdd',
  'ups',
  'rack',
  'rtr',
  'app',
  'lnk',
  'lpr',
  'ptz',
] as const
export type SystemElementKey = (typeof SYSTEM_ELEMENT_KEYS)[number]

export type SystemElement = { name: string; icon: string; place: string; text: string; tip: string }

export const monitoring = {
  /** Recorder preview in the hero (`nv`). */
  nvr: {
    label: 'Przykładowy podgląd z rejestratora: cztery kamery w pensjonacie',
    title: 'REJESTRATOR · PENSJONAT',
    day: 'DZIEŃ · −4°C',
    night: 'NOC · −9°C',
    modesLabel: 'Pora i tryb obrazu',
    modes: [
      { mode: 'day', label: 'Dzień', icon: 'sun' },
      { mode: 'ir', label: 'Noc · IR', icon: 'moon' },
      { mode: 'col', label: 'Noc · kolor', icon: 'light' },
    ] as { mode: CamMode; label: string; icon: string }[],
    all: 'Wszystkie kamery',
    cameras: [
      { name: 'KAM 1 · Parking', label: 'Kamera 1, parking. Kliknij, aby powiększyć.' },
      { name: 'KAM 2 · Wejście', label: 'Kamera 2, wejście główne. Kliknij, aby powiększyć.' },
      { name: 'KAM 3 · Narciarnia', label: 'Kamera 3, narciarnia. Kliknij, aby powiększyć.' },
      { name: 'KAM 4 · Podjazd', label: 'Kamera 4, podjazd i ogród. Kliknij, aby powiększyć.' },
    ],
    scene: {
      car: 'Auto 94%',
      motion: 'Ruch',
      person1: 'Człowiek 97%',
      person2: 'Człowiek 98%',
      deter: 'Odstraszanie: światło + syrena + komunikat',
      skiRoom: 'Narciarnia · wejście dla gości',
      plate: 'Auto · KR 1234',
      privacy: 'Strefa prywatności',
      neighbour: 'posesja sąsiada',
    },
    timeline: {
      last: 'Ostatnie 24 h:',
      person: 'C · człowiek',
      car: 'A · auto',
      falseAlarm: '! · fałszywy alarm',
      hours: ['00:00', '06:00', '12:00', '18:00', '24:00'],
      titles: {
        p: 'Człowiek',
        c: 'Auto',
        f: 'Fałszywy alarm: ruch drzewa, śnieg, zwierzę',
      },
    },
    toggles: {
      ai: 'Wykrywanie ludzi i aut',
      mask: 'Maska prywatności',
      deter: 'Odstraszanie nocą',
    },
    notes: {
      noAi: 'Bez analizy obrazu każdy ruch to alarm: drzewo na wietrze, padający śnieg, kot. Na osi czasu przybywa czerwonych zdarzeń, a Ty przestajesz czytać powiadomienia.',
      col: 'Kolor w nocy: jasny obiektyw i ciepłe doświetlenie (Hikvision ColorVu, Dahua Full-color). Widać kolor kurtki i auta, co pomaga przy zgłoszeniu.',
      ir: 'Podczerwień: obraz czarno-biały, niewidoczny dla gości. Kamera hybrydowa może włączyć białe światło dopiero wtedy, gdy wykryje człowieka.',
      day: 'Wykrywanie ludzi i aut: powiadomienie przychodzi tylko wtedy, gdy na parkingu albo przy wejściu pojawi się człowiek lub samochód.',
      mask: ' Posesja sąsiada na kamerze 4 jest zamaskowana i nie trafia do nagrań.',
    },
  },

  whatYouGet: {
    head: {
      eyebrow: 'Monitoring od PRO-KOM',
      heading: 'Twarz przy furtce, tablica przy bramie. Bez podglądania sąsiada.',
      lead: 'Każdą kamerę dobieramy do jej miejsca: furtki, podjazdu, parkingu, wejścia. Ustawiamy wykrywanie, strefy i czas nagrań, a potem uczymy Cię obsługi aplikacji.',
    } satisfies SectionHead,
    items: [
      {
        icon: 'home',
        title: 'Nagrania zostają u Ciebie',
        text: 'Rejestrator stoi w Twoim obiekcie. Nie płacisz abonamentu za chmurę, a nagrania nie wyjeżdżają na cudze serwery.',
      },
      {
        icon: 'phone',
        title: 'Podgląd w telefonie',
        text: 'Aplikacja producenta (np. Hik-Connect, DMSS albo aplikacja BCS): obraz na żywo, powiadomienia, przewijanie nagrań. Konfigurujemy ją razem z Tobą.',
      },
      {
        icon: 'eye',
        title: 'Wykrywanie ludzi i aut',
        text: 'Analiza obrazu (Hikvision AcuSense, Dahua WizSense) odróżnia człowieka i samochód od liści, śniegu i zwierząt. Mniej fałszywych powiadomień.',
      },
      {
        icon: 'moon',
        title: 'Kolor także w nocy',
        text: 'Kamery z jasnym obiektywem F1.0 i ciepłym doświetleniem pokazują kolory po zmroku. Albo dyskretna podczerwień, gdy światło przeszkadza gościom.',
      },
      {
        icon: 'bell',
        title: 'Odstraszanie',
        text: 'Kamera z białym światłem, syreną i własnym komunikatem głosowym reaguje, zanim ktoś wejdzie do narciarni czy garażu.',
      },
      {
        icon: 'snow',
        title: 'Na górską zimę',
        text: 'Dobieramy kamery do mrozu: przykładowo Dahua IPC-HDBW3441R-AS-P pracuje od −40 do +60°C, ma szczelność IP67 i odporność na uderzenia IK10.',
      },
    ] satisfies Feature[],
  },

  system: {
    head: {
      eyebrow: 'Wersje instalacji',
      heading: 'Kamery, rejestrator, dyski, zasilanie i aplikacja.',
      accent: 'Zobacz cały system.',
      lead: 'Kamera to tylko początek. Żeby nagrania nie ginęły przy burzy, mrozie czy zaniku prądu, potrzebny jest rejestrator, dyski do pracy 24/7, zasilanie, sieć i porządna aplikacja. Wybierz wersję i kliknij element schematu.',
    } satisfies SectionHead,
    tabsLabel: 'Wersja instalacji',
    diagramLabel: 'Schemat systemu monitoringu:',
    zones: { building: 'Budynek · pomieszczenie techniczne', site: 'Teren i elewacja' },
    labels: {
      secondBuilding: 'Drugi budynek',
      secondBuildingSub: 'lub brama, parking',
      cameras: 'kamery IP',
      ptz: 'Kamera PTZ',
      ptzSub: 'obrót i zoom',
      lpr: 'Odczyt tablic',
      lprSub: 'wjazd, brama, szlaban',
      switch: 'Switch PoE',
      rack: 'Szafa rack',
      nvr: 'NVR',
      ups: 'UPS',
      router: 'Router',
      routerSub: 'osobna sieć',
      vlan: 'VLAN kamer',
      app: 'Aplikacja',
      appSub: 'podgląd i alerty',
    },
    swipe: 'Przesuń schemat palcem →',
    foot: 'Czas zapisu orientacyjnie: kamery 4 MP, kompresja H.265, zapis ciągły 2–4 Mb/s na kamerę, 95% pojemności dysku. Noc, śnieg i drzewa na wietrze zwiększają strumień. Dokładnie liczymy w projekcie.',
    inThisVersion: 'W tej wersji',
    dotsLabel: 'Elementy zestawu',
    prev: 'Poprzedni element',
    next: 'Następny element',
    of: 'z',
    setTitle: 'W zestawie',
    setHint: 'elementów · kliknij, żeby zobaczyć opis na schemacie',
    cta: {
      title: 'Policz zestaw dla swojego obiektu',
      text: 'Kreator w 2 minuty, wycena po wizji lokalnej →',
    },
    elements: {
      cam: {
        name: 'Kamery IP',
        icon: 'cam',
        place: 'Teren i elewacja',
        text: 'Widzą w nocy i odróżniają ludzi oraz auta od liści, śniegu i zwierząt. Każdą ustawiamy pod konkretne miejsce.',
        tip: 'Dobieramy modele z zakresem pracy co najmniej do −30°C i obudową IP67, a zakres sprawdzamy w karcie każdego modelu. Na Podhalu to ma znaczenie.',
      },
      srg: {
        name: 'Ochrona przepięciowa',
        icon: 'bolt',
        place: 'Na trasie kabla',
        text: 'Ogranicznik przy kamerze i przy wejściu kabla do budynku, oba uziemione. Chroni rejestrator i switch przed skokiem napięcia.',
        tip: 'W górach burze zdarzają się częściej niż na nizinach. Ograniczniki zmniejszają ryzyko uszkodzenia, ale przy bezpośrednim uderzeniu pioruna żaden sprzęt nie daje pełnej gwarancji.',
      },
      sw: {
        name: 'Switch PoE',
        icon: 'net',
        place: 'Rozdzielnia sieci',
        text: 'Zasila i łączy kamery, gdy jest ich dużo albo są daleko od rejestratora. Jeden kabel daje kamerze prąd i przesyła obraz.',
        tip: 'Zwykły switch pracuje od ok. −10°C. W nieogrzewanej skrzynce stosujemy switch przemysłowy, który znosi −40°C.',
      },
      nvr: {
        name: 'Rejestrator NVR',
        icon: 'cpu',
        place: 'Serce systemu',
        text: 'Nagrywa wszystkie kamery naraz i trzyma nagrania w budynku, a nie w obcej chmurze. Analizuje obraz i wysyła powiadomienia.',
        tip: 'Dobieramy go po przepustowości, a nie tylko po liczbie kanałów. Suma strumieni ze wszystkich kamer musi się w niej zmieścić z zapasem.',
      },
      hdd: {
        name: 'Dyski do monitoringu',
        icon: 'layers',
        place: 'W rejestratorze',
        text: 'Dyski zaprojektowane do zapisu przez całą dobę, 7 dni w tygodniu, np. WD Purple albo Seagate SkyHawk. Zwykły dysk komputerowy szybciej się zużywa.',
        tip: 'Pojemność liczymy z liczby kamer, rozdzielczości i czasu przechowywania nagrań, który wynika z celu monitoringu. Sprawdzamy też, jaki maksymalny dysk obsługuje rejestrator.',
      },
      ups: {
        name: 'Zasilacz awaryjny UPS',
        icon: 'battery',
        place: 'Pod rejestratorem',
        text: 'Gdy zabraknie prądu, rejestrator, switch i router pracują dalej, a nagrywanie się nie urywa.',
        tip: 'Mały UPS to zwykle około godziny pracy. Kilka godzin wymaga UPS-a z dodatkową baterią. Akumulatory słabną z wiekiem i w zimnie, dlatego sprawdzamy je przy przeglądzie.',
      },
      rack: {
        name: 'Szafa rack',
        icon: 'build',
        place: 'Porządek w technice',
        text: 'Rejestrator, router, UPS i opisane kable w jednym zamykanym miejscu. Serwisant od razu wie, co jest czym.',
        tip: 'Szafę montujemy w ogrzewanym pomieszczeniu. Gdy stoi w niej kilka urządzeń PoE, dokładamy wentylację.',
      },
      rtr: {
        name: 'Router i osobna sieć',
        icon: 'wifi',
        place: 'Bezpieczeństwo',
        text: 'Kamery mają własną sieć (VLAN), oddzieloną od Wi-Fi gości, kas i komputerów. Goście korzystają z internetu, ale nie zobaczą kamer.',
        tip: 'Zmieniamy hasła fabryczne, aktualizujemy oprogramowanie i nie wystawiamy rejestratora wprost do internetu. Podatności w kamerach to realny problem.',
      },
      app: {
        name: 'Aplikacja i powiadomienia',
        icon: 'phone',
        place: 'W Twoim telefonie',
        text: 'Podgląd na żywo, nagrania i powiadomienia o człowieku lub samochodzie w aplikacji producenta, np. Hik-Connect, DMSS albo aplikacji BCS.',
        tip: 'Każdy domownik albo pracownik dostaje własne konto z uprawnieniami, które ustawimy przy odbiorze. Pokazujemy, jak szybko znaleźć i zapisać nagranie.',
      },
      lnk: {
        name: 'Światłowód lub most radiowy',
        icon: 'fiber',
        place: 'Między budynkami',
        text: 'Drugi budynek, parking albo brama dalej niż 100 metrów. Bez kopania rowu przez całą działkę.',
        tip: 'Na dłuższe odcinki kładziemy światłowód. Tam, gdzie nie da się kopać, stawiamy most radiowy, który potrzebuje widoczności między punktami.',
      },
      lpr: {
        name: 'Odczyt tablic rejestracyjnych',
        icon: 'car',
        place: 'Wjazd i brama',
        text: 'Kamera przy wjeździe zapisuje numery aut. Znane auta mogą otwierać bramę albo szlaban.',
        tip: 'Skuteczność zależy od kąta, odległości, światła i prędkości auta. Kamerę ustawiamy na miejscu i testujemy na prawdziwych autach.',
      },
      ptz: {
        name: 'Kamera obrotowa PTZ',
        icon: 'eye',
        place: 'Duży plac',
        text: 'Obraca się i przybliża obraz, żeby z jednego miejsca obejrzeć cały plac albo parking.',
        tip: 'Kamera PTZ pobiera więcej prądu niż zwykła, dlatego przy jej montażu liczymy budżet mocy switcha.',
      },
    } satisfies Record<SystemElementKey, SystemElement>,
    versions: [
      {
        name: 'Dom',
        icon: 'home',
        sub: '2–4 kamery',
        cams: 4,
        camLabel: '4 × 4 MP',
        nvrLabel: '4 kanały',
        disks: 1,
        upsLabel: 'ok. 1 h',
        stats: [
          { label: 'Kamery', value: '4' },
          { label: 'Rejestrator', value: '4 kanały' },
          { label: 'Dyski', value: '1 × 4 TB' },
          { label: 'Zapis ciągły', value: 'ok. 3–6 tyg.' },
          { label: 'Bez prądu', value: 'ok. 1 h' },
        ],
        spec: {
          cam: '4 kamery 4 MP z wykrywaniem ludzi i aut',
          srg: 'Przy kamerach na maszcie albo daleko od domu',
          nvr: '4 kanały, zasilanie PoE wbudowane w rejestrator',
          hdd: '1 dysk 4 TB do pracy 24/7',
          ups: 'Mały UPS, około godziny pracy',
          rtr: 'Twój router, skonfigurowany dostęp z telefonu',
          app: 'Konta dla domowników, powiadomienia o ruchu przy furtce',
        },
      },
      {
        name: 'Firma',
        icon: 'shop',
        sub: '6–8 kamer',
        cams: 8,
        camLabel: '8 × 4 MP',
        nvrLabel: '8 kanałów',
        disks: 2,
        upsLabel: 'ok. 1 h',
        stats: [
          { label: 'Kamery', value: '8' },
          { label: 'Rejestrator', value: '8 kanałów' },
          { label: 'Dyski', value: '2 × 4 TB' },
          { label: 'Zapis ciągły', value: 'ok. 3–6 tyg.' },
          { label: 'Bez prądu', value: 'ok. 1 h' },
        ],
        spec: {
          cam: '8 kamer 4 MP, w tym szeroki kąt na salę i kamera nad kasą',
          srg: 'Przy kamerach zewnętrznych',
          nvr: '8 kanałów, wbudowane PoE, miejsce na 2 dyski',
          hdd: '2 dyski po 4 TB',
          ups: 'UPS 900–1500 VA, około godziny pracy',
          rack: 'Szafka wisząca 9–12U z panelem krosowym',
          rtr: 'Router firmowy z osobną siecią dla kamer',
          app: 'Konto właściciela i kierownika, podgląd na monitorze w sklepie',
        },
      },
      {
        name: 'Obiekt noclegowy',
        icon: 'bed',
        sub: '10–16 kamer',
        cams: 8,
        camLabel: '12 × 4 MP',
        nvrLabel: '16 kanałów',
        disks: 2,
        upsLabel: '2–4 h',
        stats: [
          { label: 'Kamery', value: '12' },
          { label: 'Rejestrator', value: '16 kanałów' },
          { label: 'Dyski', value: '2 × 8 TB' },
          { label: 'Zapis ciągły', value: 'ok. 4–8 tyg.' },
          { label: 'Bez prądu', value: 'cel 2–4 h' },
        ],
        spec: {
          cam: '12 kamer 4 MP: wejścia, parking, teren, bez pokoi gości',
          srg: 'Na wejściach kabli do budynków, z uziemieniem',
          sw: 'Dodatkowy switch PoE w drugim budynku',
          nvr: '16 kanałów, wbudowane PoE',
          hdd: '2 dyski po 8 TB',
          ups: 'UPS z dodatkową baterią, cel 2–4 godziny',
          rack: 'Szafa 12U z wentylacją w ogrzewanym pomieszczeniu',
          rtr: 'Osobno kamery, osobno Wi-Fi gości',
          app: 'Właściciel i obsługa, powiadomienia z parkingu w nocy',
          lnk: 'Światłowód albo most radiowy do drugiego budynku',
          lpr: 'Na wjeździe, opcjonalnie otwiera bramę',
        },
      },
      {
        name: 'Duży obiekt',
        icon: 'factory',
        sub: '20–32 kamery',
        cams: 8,
        camLabel: '24 kamery',
        nvrLabel: '32 kanały',
        disks: 4,
        upsLabel: 'wg projektu',
        stats: [
          { label: 'Kamery', value: '24' },
          { label: 'Rejestrator', value: '32 kanały' },
          { label: 'Dyski', value: '4 × 8 TB' },
          { label: 'Zapis ciągły', value: 'ok. 3–7 tyg.' },
          { label: 'Bez prądu', value: 'wg projektu' },
        ],
        spec: {
          cam: '24 kamery: 20 × 4 MP i 4 × 8 MP (4K) na wjazdy i place',
          srg: 'Na każdej trasie zewnętrznej, z uziemieniem',
          sw: 'Switche zarządzalne, na zewnątrz przemysłowe do −40°C',
          nvr: '32 kanały, 4 dyski',
          hdd: '4 dyski po 8 TB',
          ups: 'UPS w szafie i osobne UPS-y przy switchach',
          rack: 'Szafa rack 19 cali, 12U lub większa',
          rtr: 'Firewall, VPN i osobne sieci',
          app: 'Stanowisko podglądu przy portierni, eksport nagrań',
          lnk: 'Światłowód między budynkami, mosty radiowe do bramy',
          lpr: 'Na bramie wjazdowej',
          ptz: '1–2 kamery obrotowe na plac',
        },
      },
    ] satisfies SystemVersion[],
  },

  types: {
    head: {
      eyebrow: 'Jaką kamerę wybrać',
      heading: 'Pięć rodzajów kamer. Każda do innego miejsca.',
    },
    tabsLabel: 'Rodzaje kamer',
    fits: 'Gdzie pasuje',
    careful: 'Na co uważać',
    items: [
      {
        name: 'Kopułkowa',
        text: 'Mała, dyskretna, montowana pod okapem lub na suficie. Trudno ją przestawić albo zasłonić.',
        fits: 'Wejścia, recepcja, korytarze, sala sklepu, okap nad drzwiami.',
        careful:
          'Kopułka zbiera krople i szron, jeśli nie jest pod daszkiem. Montujemy ją pod okapem.',
      },
      {
        name: 'Tubowa',
        text: 'Klasyczna kamera zewnętrzna z daszkiem. Łatwo ją wycelować daleko, np. na wjazd.',
        fits: 'Parking, podjazd, brama, plac, ściana szczytowa.',
        careful: 'Widoczna z daleka. Tam, gdzie liczy się wygląd elewacji, lepsza bywa kopułka.',
      },
      {
        name: 'Obrotowa PTZ',
        text: 'Obraca się i przybliża. Może sama śledzić człowieka albo auto na dużym terenie.',
        fits: 'Duże parkingi, place, hale, tereny gminne i osiedlowe.',
        careful: 'Patrzy tam, gdzie jest obrócona. Zwykle łączymy ją ze stałymi kamerami.',
      },
      {
        name: 'Z odstraszaniem',
        text: 'Ma białe światło, syrenę i głośnik. Odtwarza komunikat albo pozwala odezwać się z telefonu.',
        fits: 'Narciarnia, garaż, zaplecze, tereny bez ruchu nocą.',
        careful:
          'Syrenę ustawiamy z harmonogramem, żeby nie budziła gości przy każdym wyjściu po narty.',
      },
      {
        name: 'Panoramiczna',
        text: 'Kilka obiektywów w jednej obudowie daje szeroki obraz bez martwych pól.',
        fits: 'Duże parkingi, place, hale, wejścia z kilku stron.',
        careful:
          'Szeroki kadr to mniej szczegółów w oddali. Do tablic rejestracyjnych lepsza osobna kamera.',
      },
    ],
  },

  dori: {
    head: {
      eyebrow: 'Kalkulator: ile widać',
      heading: 'Twarz czy tylko sylwetka? To zależy od odległości.',
      lead: 'Norma PN-EN 62676-4 mówi, ile pikseli na metr potrzeba, żeby człowieka wykryć, obserwować, rozpoznać albo zidentyfikować. Sprawdź, jak zmienia się to z odległością.',
    } satisfies SectionHead,
    resolution: 'Rozdzielczość kamery',
    lens: 'Obiektyw (kąt widzenia)',
    distance: 'Odległość do osoby:',
    distanceLabel: 'Odległość w metrach',
    note: 'Kąty widzenia są przykładowe. Dokładny kąt dla danej rozdzielczości i obiektywu podaje karta konkretnego modelu.',
    result: 'Wynik',
    unit: 'pikseli na metr',
    /** Text for each level: below detection, then detection … identification. */
    levelTexts: [
      'Za mało, żeby pewnie wykryć człowieka. Potrzebna kamera bliżej albo węższy obiektyw.',
      'Widać, że ktoś jest. Nie rozpoznasz, kto to.',
      'Widać sylwetkę, ubiór i to, co robi.',
      'Rozpoznasz znajomą osobę po twarzy i sylwetce.',
      'Twarz wyraźna na tyle, żeby wskazać konkretną osobę.',
    ],
    width: 'Szerokość kadru w tej odległości:',
    thresholds: 'Progi DORI: wykrycie 25, obserwacja 62, rozpoznanie 125, identyfikacja 250 px/m.',
  },

  recording: {
    head: {
      eyebrow: 'Kalkulator: ile dni nagrań',
      heading: 'Ile dni nagrań zmieści dysk przy Twoich kamerach.',
      lead: 'Nagrania zostają na rejestratorze w Twoim obiekcie. Policz, na ile dni wystarczy dysk przy nagrywaniu ciągłym.',
    } satisfies SectionHead,
    cameras: 'Liczba kamer',
    fewer: 'Mniej kamer',
    more: 'Więcej kamer',
    bitrate: 'Strumień jednej kamery (H.265)',
    disk: 'Dysk w rejestratorze',
    formula:
      'Wzór: 95% pojemności dysku (TB) ÷ zapis na dobę. Zapis na dobę = liczba kamer × strumień (Mb/s) × 86 400 s ÷ 8, czyli MB przeliczone na TB. Strumień zależy od sceny, ustawień i pory dnia, więc wynik jest szacunkiem. Nagrywanie tylko przy ruchu wydłuża ten czas.',
    result: 'Wystarczy na około',
    perDay: 'TB na dobę.',
    tails: {
      over: 'To więcej niż potrzeba: czas przechowywania i tak ustawiamy krócej, zgodnie z celem monitoringu.',
      lessDay:
        'To mniej niż doba. Przy takiej liczbie kamer potrzebny jest większy dysk albo nagrywanie przy ruchu.',
      few: 'To mało. Przy takiej liczbie kamer warto większy dysk albo nagrywanie przy ruchu.',
      ok: 'Czas przechowywania ustawiamy w rejestratorze, a starsze nagrania nadpisują się same.',
    },
    law: 'Monitoring pracowników: nagrania najwyżej 3 miesiące od nagrania, chyba że są dowodem w postępowaniu (Kodeks pracy, art. 22²). EROD zaleca, by nagrania co do zasady usuwać automatycznie po kilku dniach. Dłuższy czas, zwłaszcza ponad 72 godziny, administrator musi uzasadnić celem monitoringu.',
  },

  rodo: {
    head: {
      eyebrow: 'Monitoring i RODO',
      heading: 'Gdzie kamera może patrzeć, a gdzie nie.',
      lead: 'Technikę ustawiamy tak, żeby pomagała Ci spełnić przepisy: strefy, maski, czas nagrań, tabliczki. Dokumenty, np. regulamin monitoringu, przygotowuje właściciel. Podpowiemy, co w nich ująć.',
    } satisfies SectionHead,
    yes: {
      title: 'Tak, z rozsądkiem',
      items: [
        'Parking i podjazd',
        'Wejście do budynku i recepcja',
        'Narciarnia, wózkownia, garaż',
        'Kasa, zaplecze, magazyn',
        'Teren wokół obiektu, bez posesji sąsiadów',
      ],
    },
    no: {
      title: 'Nie',
      items: [
        'Pokoje gości i apartamenty',
        'Łazienki, toalety, szatnie',
        'Sauna, strefa SPA, przebieralnie',
        'Stołówka, palarnia i pokój związków zawodowych (Kodeks pracy dopuszcza tylko wąskie wyjątki)',
        'Okna, ogrody i działki sąsiadów',
      ],
    },
    /** Example sign (`.sign`): a picture of a sign, its fields stay as in the prototype. */
    sign: {
      label: 'Przykład tabliczki informującej o monitoringu',
      title: 'Obiekt monitorowany',
      rows: [
        { key: 'Administrator:', value: 'nazwa obiektu, adres, kontakt' },
        { key: 'Cel:', value: 'bezpieczeństwo osób i ochrona mienia' },
        { key: 'Czas przechowywania:', value: 'liczba dni, np. 3' },
        { key: 'Twoje prawa:', value: 'm.in. dostęp do nagrań, usunięcie, sprzeciw' },
        { key: 'Pełna informacja:', value: 'recepcja lub adres strony' },
      ],
      foot: 'Przykład układu tabliczki według wytycznych EROD 3/2019. Treść ustala administrator.',
    },
    we: [
      {
        icon: 'layers',
        title: 'Strefy i maski',
        text: 'Zaczerniamy w obrazie to, czego kamera nie powinna nagrywać.',
      },
      {
        icon: 'clock',
        title: 'Czas nagrań',
        text: 'Ustawiamy nadpisywanie po tylu dniach, ile wynika z celu.',
      },
      {
        icon: 'lock',
        title: 'Hasła i konta',
        text: 'Zmieniamy hasła fabryczne, konta tylko dla upoważnionych.',
      },
      {
        icon: 'doc',
        title: 'Tabliczki',
        text: 'Pokazujemy, gdzie powiesić oznaczenia i co na nich wpisać.',
      },
    ] satisfies Feature[],
    neighbour:
      'Kamera przy domu, która obejmuje choćby część drogi albo działki sąsiada, nie jest już „czysto domowym” użyciem i podlega RODO (wyrok TSUE C-212/13, Ryneš). Ustawimy kadr i maski tak, żeby patrzyła na Twoją posesję.',
    employees: {
      title: 'Masz pracowników?',
      text: 'Kodeks pracy (art. 22²) wymaga, by cel i zasięg monitoringu ustalić w regulaminie pracy albo obwieszczeniu, poinformować pracowników najpóźniej 2 tygodnie przed uruchomieniem kamer i oznaczyć monitorowany teren najpóźniej dzień wcześniej. Więcej w',
      link: 'poradniku o monitoringu i RODO',
      href: '/poradnik/monitoring-a-rodo',
    },
  },

  brands: {
    head: {
      eyebrow: 'Sprzęt',
      heading: 'Dahua, Hikvision, BCS.',
      accent: 'Dobieramy pod obiekt, nie pod markę.',
      lead: 'To popularne marki monitoringu, a każda ma setki modeli. Nie sprzedajemy jednej linii. Kamerę, rejestrator i dysk dobieramy do miejsca: mrozu, światła nocą, odległości i tego, co ma być widać. Gdy budujemy też sieć, sprawdzamy, czy kamery tego samego producenta co sieć nie uproszczą obsługi.',
    } satisfies SectionHead,
    items: [
      {
        name: 'Hikvision',
        kicker: 'detekcja i noc w kolorze',
        features: [
          'AcuSense: alarm tylko od ludzi i aut, mniej fałszywych powiadomień',
          'ColorVu: kolorowy obraz w nocy dzięki jasnemu obiektywowi i światłu białemu',
          'Aplikacja Hik-Connect: podgląd, nagrania i powiadomienia',
        ],
      },
      {
        name: 'Dahua',
        kicker: 'odstraszanie i mróz',
        features: [
          'WizSense: wykrywanie ludzi i pojazdów, ochrona linii i strefy',
          'TiOC: odstrasza światłem i komunikatem głosowym, rozmowa przez kamerę',
          'Wybrane modele pracują od −40 °C. Aplikacja DMSS',
        ],
      },
      {
        name: 'BCS',
        kicker: 'polska marka',
        features: [
          'Marka polskiej firmy BCS Sp. z o.o., która jest też importerem',
          'BCS Point łączy kamery IP z analogowymi HD, więc rozbudujesz starą instalację',
          'Kilka linii produktów i własne aplikacje do podglądu',
        ],
      },
    ],
    how: 'Jak dobieramy',
    howItems: [
      {
        icon: 'snow',
        title: 'Mróz i wiatr',
        text: 'Zakres pracy różni się między modelami. Na Podhalu sprawdzamy go w karcie każdej kamery.',
      },
      {
        icon: 'moon',
        title: 'Noc',
        text: 'Kolor ze światłem białym tam, gdzie liczą się szczegóły, podczerwień tam, gdzie światło przeszkadza.',
      },
      {
        icon: 'eye',
        title: 'Odległość i szczegóły',
        text: 'Obiektyw i rozdzielczość liczymy z tego, czy ma być widać sylwetkę, twarz czy tablicę.',
      },
      {
        icon: 'cpu',
        title: 'Rejestrator i dysk',
        text: 'NVR z zasilaniem PoE dla kamer i dyski do zapisu przez całą dobę, np. WD Purple albo Seagate SkyHawk.',
      },
    ] satisfies Feature[],
  },
}

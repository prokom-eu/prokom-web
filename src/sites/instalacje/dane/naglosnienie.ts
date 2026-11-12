import type { SectionHead } from './anteny'

/**
 * Fixed texts of the Nagłośnienie page (ADR-I002 §1): the sections that are not in
 * `InstServices` and the widgets. Transcribed from `zrodlo/pages/Naglosnienie.js` +
 * `Naglosnienie.body.html` (v4.2) the way `cleanPrototype` cleans a snapshot: without UI keys and
 * without the source list (`src`) — spec §2: no source lists on the site. Spec §2.8: APART is
 * „a brand founded in Belgium, today in the Biamp group”. Without the prototype's client
 * references (Empik and the parishes — no client consent, decision of I6) and without the
 * `[SZEF…]` notes (TODO below). Edited by hand from now on.
 */

export type VenueKey = 'rest' | 'hotel' | 'kos' | 'szk' | 'obr' | 'hala'
export type ApartKey =
  'cm' | 'cmar' | 'mask' | 'sph' | 'col' | 'rock' | 'sub' | 'amp' | 'zone' | 'mic' | 'src' | 'dsp'

type IconText = { icon: string; title: string; text: string }

export const naglosnienie = {
  /** Zone mixer in the hero (`mx`): a plan of the venue and a console with four channels. */
  mixer: {
    label: 'Interaktywny mikser stref nagłośnienia',
    venuesLabel: 'Rodzaj obiektu',
    /** Venues of the mixer: name, icon and the four zones of the plan. */
    venues: {
      rest: { name: 'Restauracja', icon: 'food', zones: ['Sala', 'Taras', 'Bar', 'Toalety'] },
      hotel: {
        name: 'Hotel',
        icon: 'hotel',
        zones: ['Lobby', 'Restauracja', 'SPA', 'Sala konferencyjna'],
      },
      kos: {
        name: 'Kościół',
        icon: 'church',
        zones: ['Prezbiterium', 'Nawa', 'Chór', 'Przedsionek'],
      },
      szk: {
        name: 'Szkoła',
        icon: 'school',
        zones: ['Korytarze', 'Sala gimnastyczna', 'Stołówka', 'Boisko'],
      },
      obr: {
        name: 'Sala obrad',
        icon: 'users',
        zones: ['Stół prezydialny', 'Sala', 'Galeria', 'Hol'],
      },
      hala: { name: 'Hala', icon: 'factory', zones: ['Trybuny', 'Płyta', 'Hol', 'Szatnie'] },
    } satisfies Record<VenueKey, { name: string; icon: string; zones: readonly string[] }>,
    sources: [
      { name: 'Muzyka w tle', icon: 'music' },
      { name: 'Mikrofon', icon: 'mic' },
      { name: 'Telewizor, AUX', icon: 'tv' },
    ],
    source: 'Źródło',
    ticks: ['0', '−10', '−20', '−30', '∞'],
    volumeLabel: 'Głośność strefy',
    mute: 'Wycisz',
    muted: 'Wyciszona',
    mutedDb: 'MUTE',
    mutedZone: 'wycisz.',
    announce: 'Komunikat',
    announceSub: 'priorytet dla wszystkich stref',
    priorityNote:
      'Komunikat ma pierwszeństwo: muzyka ścisza się we wszystkich strefach, a po komunikacie wraca do poprzednich ustawień.',
    /** Note without an announcement; `{a}` / `{b}` = the first and the last zone (lower case). */
    note: 'Przesuń suwak albo wycisz strefę i zobacz, jak zmienia się zasięg głośników na planie. Muzykę w strefie {a} możesz podgłośnić, a w {b} wyciszyć z panelu na ścianie (z telefonu w systemach z aplikacją).',
  },

  objects: {
    head: {
      eyebrow: 'Gdzie nagłaśniamy',
      heading: 'Nagłośnienie restauracji, hotelu, kościoła i szkoły',
      lead: 'W restauracji muzyka ma być tłem dla rozmowy. W kościele najważniejsze jest, żeby każde słowo było zrozumiałe w ostatniej ławce. Dobieramy sprzęt do akustyki wnętrza.',
    } satisfies SectionHead,
    brands:
      'Marki, z którymi pracujemy: APART (grupa Biamp), JBL, Mackie, RCF, Electro-Voice, LDM, EAW, Alto, Audio-Technica.',
    items: [
      {
        icon: 'food',
        title: 'Restauracje i karczmy',
        text: 'Muzyka w tle na sali, osobno na tarasie i w toaletach. Głośność, której nie trzeba poprawiać co godzinę.',
        tags: ['strefy', 'taras', 'panel ścienny'],
      },
      {
        icon: 'hotel',
        title: 'Hotele i pensjonaty',
        text: 'Lobby, restauracja, SPA, sala konferencyjna. Komunikaty do wybranych stref.',
        tags: ['strefy', 'komunikaty', 'sala konf.'],
      },
      {
        icon: 'church',
        title: 'Kościoły',
        text: 'Zrozumiałość mowy w całej nawie, mikrofony bezprzewodowe, prosta obsługa dla zakrystianina.',
        tags: ['zrozumiałość mowy', 'mikrofony'],
      },
      {
        icon: 'school',
        title: 'Szkoły',
        text: 'Dzwonki, komunikaty, apel na sali gimnastycznej i boisku.',
        tags: ['dzwonki', 'komunikaty', 'apel'],
      },
      {
        icon: 'factory',
        title: 'Hale i obiekty sportowe',
        text: 'Komunikaty na trybunach i płycie, muzyka na wydarzenia.',
        tags: ['komunikaty', 'wydarzenia'],
      },
      {
        icon: 'users',
        title: 'Sale obrad i rady gmin',
        text: 'Mikrofony dyskusyjne dobrane tak, żeby ograniczyć sprzężenia, z nagrywaniem obrad i sygnałem do transmisji internetowej.',
        tags: ['mikrofony', 'nagrywanie', 'transmisje'],
      },
      {
        icon: 'shop',
        title: 'Sklepy i salony',
        // The client agreed to the publication (boss 01.11.2026).
        text: 'Muzyka i komunikaty marketingowe, sterowanie z zaplecza. Między innymi salony Empik w Zakopanem i Krakowie.',
        tags: ['muzyka', 'reklamy audio'],
      },
      {
        icon: 'car',
        title: 'Nagłośnienie na pojazdach',
        text: 'Nagłośnienie zewnętrzne na samochodzie reklamowym albo na wydarzenia plenerowe.',
        tags: ['pojazd', 'plener'],
      },
    ],
  },

  apart: {
    head: {
      eyebrow: 'Sprzęt APART',
      heading: 'Jakie głośniki APART montujemy i gdzie się sprawdzają',
      lead: 'APART to marka nagłośnienia montowanego na stałe, założona w Belgii, od 2019 w amerykańskiej grupie Biamp. Głośniki, wzmacniacze, strefy, mikrofony i źródła muzyki są od jednego producenta. Kliknij rodzinę, żeby zobaczyć, gdzie ją montujemy.',
    } satisfies SectionHead,
    where: 'Gdzie montujemy',
    models: 'Przykładowe modele',
    families: {
      cm: {
        name: 'Głośniki sufitowe',
        series: 'CM · CMX · CMS',
        group: 'Do sufitu',
        text: 'Najczęstszy wybór do restauracji, sklepów, hoteli i szkół. Równy dźwięk w całym pomieszczeniu, a z sufitu widać tylko maskownicę. Są wersje okrągłe, kwadratowe do sufitów podwieszanych, bezramkowe i sufitowy subwoofer CMSUB8.',
        specs: [
          ['Pasmo', 'od 50–60 Hz do 20 kHz'],
          ['Szczelność', 'do IP54'],
          ['Podłączenie', 'linia 100 V lub 16 Ω'],
        ],
        where: ['Restauracja', 'Sklep', 'Hotel', 'Szkoła'],
        models: ['CM6T', 'CMX20T', 'CMSQ108', 'CM20DTS (bezramkowy)'],
      },
      cmar: {
        name: 'Do łazienek i SPA',
        series: 'CMAR',
        group: 'Wilgoć',
        text: 'Sufitowe głośniki w wersji Marine do miejsc z parą i wilgocią: łazienki, SPA, baseny i zadaszone tarasy. Wyglądają jak zwykłe sufitowe, więc nie psują wnętrza.',
        specs: [
          ['CMAR8-W', 'IP65'],
          ['Wersje', 'z transformatorem 100 V (T) i bez'],
          ['Rozmiary', 'CMAR5, CMAR6, CMAR8'],
        ],
        where: ['SPA', 'Basen', 'Łazienka', 'Taras'],
        models: ['CMAR5T-W', 'CMAR6T-W', 'CMAR8-W'],
      },
      mask: {
        name: 'Głośniki naścienne',
        series: 'MASK · OVO · SDQ',
        group: 'Na ścianę',
        text: 'Na ścianę albo pod zadaszenie tarasu. MASK ma obudowę odporną na pogodę, OVO pasuje do sal i restauracji, a aktywny SDQ z pilotem przewodowym wystarcza do małej sali bez szafy z elektroniką.',
        specs: [
          ['Szczelność MASK', 'IP64'],
          ['MASK6CT', 'do 60 W w linii 100 V'],
          ['Sterowanie SDQ', 'pilot ACPL lub ACPR'],
        ],
        where: ['Taras', 'Sala', 'Bar', 'Klasa'],
        models: ['MASK6CT', 'OVO5', 'SDQ5PIR'],
      },
      sph: {
        name: 'Głośniki wiszące',
        series: 'SPH',
        group: 'Wysokie stropy',
        text: 'Kula na linkach dla wysokich stropów i otwartych przestrzeni: hale, sklepy z wysokim sufitem, lobby. Gra dookoła, w 360 stopniach.',
        specs: [
          ['Promieniowanie', '360°'],
          ['Szczelność SPH20', 'IP63'],
          ['Linia', '100 V'],
        ],
        where: ['Lobby', 'Hala', 'Sklep'],
        models: ['SPH16', 'SPH20'],
      },
      col: {
        name: 'Kolumny głośnikowe',
        series: 'COLS · COLW',
        group: 'Kościoły i hale',
        text: 'Wąskie kolumny do wnętrz z pogłosem: kościoły, hale sportowe, aule i sale konferencyjne. Według producenta poprawiają zrozumiałość mowy i ograniczają sprzężenia.',
        specs: [
          ['Szczelność', 'IP66'],
          ['COLS41', '180° poziomo, 110° pionowo'],
          ['Linia', '100 V'],
        ],
        where: ['Kościół', 'Aula', 'Hala', 'Dziedziniec'],
        models: ['COLS41', 'COLS81', 'COLW41'],
      },
      rock: {
        name: 'Ogród i teren',
        series: 'ROCK · MASK · COLW',
        group: 'Na zewnątrz',
        text: 'Głośnik w kształcie kamienia znika wśród roślin. Na tarasy pod zadaszeniem MASK, na dziedzińce kolumny COLW.',
        specs: [
          ['ROCK608', '60 W, IP64'],
          ['COLW', 'IP66'],
          ['MASK', 'IP64'],
        ],
        where: ['Ogród', 'Taras', 'Basen', 'Dziedziniec'],
        models: ['ROCK608', 'MASK6CT', 'COLW41'],
      },
      sub: {
        name: 'Subwoofer',
        series: 'SUBA',
        group: 'Pełny bas',
        text: 'Dokłada bas tam, gdzie muzyka ma mieć pełniejsze brzmienie: restauracje, showroomy, sale konferencyjne. Sam się włącza, gdy gra muzyka.',
        specs: [
          ['SUBA165', '70 W'],
          ['Pasmo', '30–180 Hz'],
          ['Tryb', 'samoczynne wł./wył.'],
        ],
        where: ['Restauracja', 'Showroom', 'Sala'],
        models: ['SUBA165'],
      },
      amp: {
        name: 'Wzmacniacze',
        series: 'REVAMP · CONCEPT · MA',
        group: 'Szafa techniczna',
        text: 'Do pracy przez cały dzień, część modeli chłodzona bez wentylatora. Wzmacniacze miksujące MA mają wbudowany mikser, priorytet mikrofonu, gong i wejście zasilania awaryjnego 24 V.',
        specs: [
          ['REVAMP2120T', '2 × 120 W, także 100 V'],
          ['MA247MR', '5+1 stref, 240 W'],
          ['CONCEPT1', 'praca 24/7'],
        ],
        where: ['Zaplecze', 'Szafa rack'],
        models: ['REVAMP2120T', 'REVAMP4100', 'CONCEPT1', 'MA247MR'],
      },
      zone: {
        name: 'Strefy i panele ścienne',
        series: 'ZONE4 · PM1122',
        group: 'Sterowanie',
        text: 'Mikser strefowy daje każdej strefie własne źródło i głośność. Panel na ścianie łączymy skrętką, a obsługa ma tylko pokrętło i wybór muzyki.',
        specs: [
          ['ZONE4', '4 strefy stereo'],
          ['Panele ZONE4R', 'do 8 na skrętce CAT5'],
          ['Panel PM1122RL', 'do 300 m na skrętce'],
        ],
        where: ['Restauracja', 'Hotel', 'Sklep'],
        models: ['ZONE4 + ZONE4R', 'PM1122 + PM1122RL'],
      },
      mic: {
        name: 'Mikrofony do komunikatów',
        series: 'MICPAT',
        group: 'Komunikaty',
        text: 'Mikrofon stołowy z przyciskiem do komunikatów: przy kasie, w recepcji, w sekretariacie szkoły. Wersje wielostrefowe wybierają, gdzie trafi komunikat, a cyfrowa stacja DIMIC12 obsługuje więcej stref.',
        specs: [
          ['MICPAT-D', 'dynamiczny, z przyciskiem'],
          ['MICPAT-4', 'do 4 stacji z priorytetem'],
          ['DIMIC12', 'cyfrowa, z wyborem stref'],
        ],
        where: ['Kasa', 'Recepcja', 'Szkoła'],
        models: ['MICPAT-D', 'MICPAT-2', 'MICPAT-4', 'DIMIC12'],
      },
      src: {
        name: 'Źródła muzyki',
        series: 'PCR · PR',
        group: 'Muzyka w tle',
        text: 'Muzyka grająca cały dzień bez komputera i telefonu: radio, płyty, pendrive, Bluetooth. Tuner z czterema radiami pozwala puścić inną stację w każdej strefie.',
        specs: [
          ['PCR3000RMKIII', 'DAB+/FM, CD, USB, SD, Bluetooth'],
          ['PR4000R', '4 tunery FM RDS'],
          ['Montaż', 'w szafie rack'],
        ],
        where: ['Restauracja', 'Sklep', 'Hotel'],
        models: ['PCR3000RMKIII', 'PR4000R', 'PC1000RMKII'],
      },
      dsp: {
        name: 'Matryce audio',
        series: 'AUDIOCONTROL · AUDIOSYSTEM',
        group: 'Duże obiekty',
        text: 'Dla obiektów z wieloma źródłami i strefami: hotel z salami, centrum handlowe, szkoła. Matryca kieruje dowolne źródło do dowolnej strefy. To jedyne modele APART produkowane w Belgii.',
        specs: [
          ['AUDIOSYSTEM8.8', 'matryca 8 × 8'],
          ['AUDIOCONTROL12.8', 'matryca z DSP'],
          ['Produkcja', 'Belgia'],
        ],
        where: ['Hotel', 'Galeria', 'Szkoła'],
        models: ['AUDIOCONTROL12.8', 'AUDIOSYSTEM8.8'],
      },
    } satisfies Record<
      ApartKey,
      {
        name: string
        series: string
        group: string
        text: string
        specs: readonly (readonly [string, string])[]
        where: readonly string[]
        models: readonly string[]
      }
    >,
    note: 'Modele się zmieniają, dlatego konkretny dobieramy w projekcie. Tam, gdzie APART nie ma produktu (mikrofony bezprzewodowe, systemy konferencyjne, mocne kolumny do hal, sterowanie z aplikacji), pracujemy na innych markach z naszej listy.',
    why: [
      {
        icon: 'layers',
        title: 'Cały system od jednego producenta',
        text: 'Głośniki, wzmacniacze, strefy, mikrofony i źródła muzyki są do siebie dopasowane.',
      },
      {
        icon: 'spk',
        title: '100 V i niska impedancja',
        text: 'Te same modele głośników w wersji na linię 100 V i w wersji niskoimpedancyjnej: wiele głośników na długim kablu albo pełniejsze brzmienie w barze.',
      },
      {
        icon: 'clock',
        title: 'Do pracy przez cały dzień',
        text: 'Wzmacniacze do pracy ciągłej, część modeli bez wentylatora, a we wzmacniaczach miksujących wejście zasilania awaryjnego.',
      },
      {
        icon: 'shield',
        title: 'Gwarancja producenta',
        // TODO(krystian): the prototype promises Biamp's 5-year warranty — confirm with the
        // distributor that it covers APART and our purchase channel (spec §12), then add the period.
        text: 'Na sprzęt obowiązuje gwarancja producenta, a na montaż dajemy 24 miesiące.',
      },
    ] satisfies IconText[],
  },

  /** Signal chain of a zone system (`chn`). */
  chain: {
    head: {
      eyebrow: 'System strefowy',
      heading: 'Jak muzyka i komunikaty trafiają do każdej strefy',
      lead: 'Źródła trafiają do miksera strefowego, potem do wzmacniacza i do głośników. Komunikat ma pierwszeństwo: muzyka sama się ścisza, gdy ktoś mówi do mikrofonu.',
    } satisfies SectionHead,
    tabsLabel: 'Rodzaj linii',
    tabs: ['Linia 100 V', 'Niska impedancja'],
    announce: 'Nadaj komunikat',
    announceEnd: 'Koniec komunikatu',
    columns: ['1 · Źródła', '2 · Mikser strefowy', '3 · Wzmacniacz', '4 · Strefy'],
    /** Sources: name, icon, whether it speaks during an announcement. */
    sources: [
      { name: 'Muzyka i radio', icon: 'music', speaks: false },
      { name: 'Mikrofon przy kasie', icon: 'mic', speaks: true },
      { name: 'Gong', icon: 'bell', speaks: true },
      { name: 'Wejście alarmowe', icon: 'siren', speaks: false },
    ],
    priority: 'PRIORYTET: MIKROFON',
    panel: 'Panel ścienny w każdej strefie',
    backup: 'Zasilanie awaryjne 24 V dla komunikatów',
    announcing: 'komunikat',
    music: 'muzyka',
    levels: [60, 45, 50, 30],
    lines: [
      {
        mixer: 'Wzmacniacz miksujący, np. MA247MR',
        mixerSub: 'Do 6 poziomów priorytetu i VOX',
        amp: 'np. REVAMP2120T w linii 100 V',
        ampSub: 'Wiele głośników na jednej linii, długie kable',
        zones: [
          ['Sala', 6],
          ['Bar', 3],
          ['Taras', 4],
          ['Toalety', 2],
        ],
        note: 'W linii 100 V każdy głośnik ma transformator z odczepami mocy, np. 1,5 / 3 / 6 W. Na jedną linię wpinamy wiele głośników i każdemu dobieramy głośność. Dobre do sklepów, hoteli, kościołów i szkół.',
      },
      {
        mixer: 'Mikser strefowy, np. ZONE4',
        mixerSub: '4 strefy stereo, panele ZONE4R',
        amp: 'np. REVAMP4100, 4 × 110 W',
        ampSub: 'Kilka głośników blisko wzmacniacza, pełniejsze brzmienie',
        zones: [
          ['Sala', 4],
          ['Bar', 2],
          ['Taras', 2],
          ['Sala konferencyjna', 2],
        ],
        note: 'W niskiej impedancji na kanał wzmacniacza przypada kilka głośników, np. do czterech 16-omowych na kanał 4 Ω. Dobre do baru, sali konferencyjnej i tam, gdzie liczy się brzmienie muzyki.',
      },
    ] satisfies {
      mixer: string
      mixerSub: string
      amp: string
      ampSub: string
      zones: readonly (readonly [string, number])[]
      note: string
    }[],
  },

  /** Church: speech intelligibility (`ko`). */
  church: {
    eyebrow: 'Kościoły',
    heading: 'Dlaczego w kościele słowa się zlewają i jak to naprawić',
    lead: 'W pogłosowym wnętrzu podgłośnienie zwiększa też pogłos i słowa zlewają się ze sobą. Pomaga dobór i ustawienie głośników, na przykład kolumn, które kierują dźwięk na ławki zamiast na sklepienie. Przesuń suwaki i zobacz, co się dzieje ze zrozumiałością.',
    points: [
      {
        title: 'Kolumny zamiast zwykłych głośników',
        text: 'Kierują dźwięk na ławki, a mniej na sklepienie, więc pogłos mniej przeszkadza.',
      },
      {
        title: 'Mikrofony przy ołtarzu i ambonie',
        text: 'Dobrane tak, żeby nie było sprzężeń i dudnienia.',
      },
      {
        title: 'Pętla indukcyjna',
        text: 'Przesyła mowę prosto do aparatu słuchowego, z pominięciem pogłosu wnętrza.',
      },
      {
        title: 'Nagłośnienie przed kościołem',
        text: 'Na odpusty i uroczystości, gdy wierni stoją na zewnątrz.',
      },
    ],
    hears: 'Co słyszy ostatnia ławka',
    phrase: '„Pan z wami. I z duchem twoim.”',
    volume: 'Głośność',
    reverb: 'Pogłos wnętrza',
    reverbLevels: ['krótki', 'umiarkowany', 'średni', 'długi', 'bardzo długi'],
    columns: 'Kolumny kierunkowe na ławki',
    verdicts: [
      'Słowa się zlewają. Głośniej nie pomoże.',
      'Da się zrozumieć, ale trzeba się wsłuchać.',
      'Dobrze słychać każde słowo.',
      'Bardzo wyraźnie, także w ostatniej ławce.',
    ],
    note: 'Ilustracja zasady, nie pomiar. Zrozumiałość mowy mierzy się wskaźnikiem STI (norma IEC 60268-16): 0,45–0,6 to zrozumiałość dostateczna, 0,6–0,75 dobra.',
  },

  /** Calculator: how many speakers (`ig`). */
  calc: {
    eyebrow: 'Kalkulator',
    heading: 'Ile głośników potrzebuje Twoja sala',
    area: 'Powierzchnia',
    areaLabel: 'Powierzchnia w metrach kwadratowych',
    height: 'Wysokość sufitu',
    heightLabel: 'Wysokość sufitu',
    mode: 'Co ma być słychać',
    modes: ['Muzyka w tle', 'Mowa i komunikaty'],
    result: 'Orientacyjnie',
    notes: {
      music: 'Muzyka w tle: głośniki co około dwie wysokości sufitu. ',
      speech:
        'Mowa i komunikaty: głośniki co około jedną wysokość sufitu, bo zrozumiałość wymaga gęstszego rozmieszczenia. ',
      high: 'Przy suficie wyższym niż ok. 4,5 m głośniki sufitowe są za daleko od słuchaczy, dlatego liczymy głośniki wiszące zawieszone na ok. 4 m albo kolumny, jak w kościołach i halach. ',
      dots: 'Na planie pokazujemy najwyżej 60 kropek. ',
      estimate:
        'To szacunek z reguł branżowych. Dokładnie liczymy po oględzinach, bo dużo zależy od pogłosu i wyposażenia sali.',
    },
  },

  council: {
    head: {
      eyebrow: 'Sale obrad',
      heading: 'Nagłośnienie sali obrad z nagrywaniem i transmisją sesji',
      lead: 'Nagłośnienie to jeden z elementów systemu do sesji rady, obok nagrywania, transmisji i głosowania.',
    } satisfies SectionHead,
    items: [
      {
        icon: 'spk',
        title: 'Nagłośnienie sali',
        text: 'Mikrofony dla radnych i prowadzącego, głośniki dobrane do akustyki sali.',
        source: 'Mikrofony konferencyjne m.in. Audio-Technica',
      },
      {
        icon: 'play',
        title: 'Nagrywanie i transmisja',
        text: 'Obrady rady gminy są transmitowane i utrwalane, a nagrania trafiają do BIP i na stronę gminy.',
      },
      {
        icon: 'check',
        title: 'Imienny wykaz głosowań',
        text: 'Głosowania jawne odbywają się za pomocą urządzeń, które utrwalają imienny wykaz głosów radnych.',
        // TODO(krystian): the voting system partner (the prototype: „system głosowania z
        // partnerem [SZEF]”, spec §12).
      },
      {
        icon: 'users',
        title: 'Pętla indukcyjna',
        text: 'Urządzenia wspierające słyszenie w sali: pętla indukcyjna, system FM albo inne rozwiązanie techniczne.',
      },
    ],
  },

  dso: {
    eyebrow: 'Ostrzeganie przy pożarze',
    heading: 'Czym nagłośnienie różni się od systemu ostrzegawczego DSO',
    lead: 'DSO ostrzega ludzi w razie pożaru. Czy Twój budynek go potrzebuje, decyduje projekt i rzeczoznawca do spraw zabezpieczeń przeciwpożarowych.',
    // TODO(krystian): the DSO company we recommend (the prototype: „[SZEF: firma DSO do
    // polecania]”, spec §12).
    partner:
      'Nie jesteśmy wykonawcą DSO. Wykonuje go wyspecjalizowana firma z uprawnieniami, którą możemy wskazać. Nasze nagłośnienie muzyki łączymy z DSO tak, żeby w razie alarmu się wyciszało.',
  },
} as const

/**
 * Fixed texts of the Anteny page (ADR-I002 §1): the sections that are not in `InstServices`
 * and the widgets. Transcribed from `zrodlo/pages/Anteny.js` + `Anteny.body.html` (v4.2) the way
 * `cleanPrototype` cleans a snapshot: without UI keys, without the source list (`src`, the
 * footnote of „Halny”) — spec §2: no source lists on the site. Edited by hand from now on.
 */

export type Feature = { icon: string; title: string; text: string }
export type SectionHead = { eyebrow: string; heading: string; accent?: string; lead: string }

export type QuizResult = { title: string; text: string; tone: 'ok' | 'bad' | null }

export const anteny = {
  /** Aiming simulator in the hero (`an`). */
  aim: {
    label: 'Symulator ustawiania anteny z miernikiem sygnału',
    modesLabel: 'Rodzaj anteny',
    modes: { sat: 'Satelitarna', dvb: 'Naziemna DVB-T2' },
    target: { sat: 'Cel: Hot Bird 13°E', dvb: 'Cel: nadajnik DVB-T2' },
    satellite: 'Hot Bird 13°E',
    transmitter: 'nadajnik (przykład)',
    meter: 'Miernik',
    lock: 'LOCK',
    search: 'SZUKAM',
    level: 'Poziom',
    quality: 'Jakość',
    azimuth: 'Azymut',
    elevation: 'Elewacja',
    azimuthLeft: 'Azymut: obróć w lewo',
    azimuthRight: 'Azymut: obróć w prawo',
    elevationDown: 'Elewacja: niżej o stopień',
    elevationUp: 'Elewacja: wyżej o stopień',
    mast: 'Wyższy maszt',
    auto: 'Ustaw jak instalator',
    notes: {
      satLock:
        'Złapane: Hot Bird 13°E, z którego nadaje m.in. CANAL+. Na Podhalu czasza patrzy na azymut ok. 189°, lekko na zachód od południa, i ok. 33° nad horyzont. Te kąty wyliczyliśmy dla Podhala, a na miejscu dokręcamy antenę według miernika.',
      satNear:
        'Prawie. Antena satelitarna jest bardzo kierunkowa: kilka stopni obok i jakość spada, a obraz zaczyna się rwać.',
      satNone:
        'Brak sygnału. Kręć azymutem i elewacją albo kliknij „Ustaw jak instalator”. W praktyce robimy to miernikiem, nie na oko.',
      dvbBlocked:
        'Antena patrzy w dobrą stronę, ale stok zasłania nadajnik. Wyższy maszt albo inne miejsce na dachu zwykle rozwiązują problem. Włącz „Wyższy maszt”.',
      dvbLock:
        'Odbiór stabilny. Antena kierunkowa ponad linią stoku, wycelowana w nadajnik. Kierunek zależy od miejscowości, dlatego zawsze ustawiamy go miernikiem.',
      dvbWeak:
        'Słaby odbiór. Antena naziemna jest mniej kierunkowa niż satelitarna, ale w górach liczy się kierunek i wysokość montażu.',
    },
  },

  whatWeDo: {
    head: {
      eyebrow: 'Instalacje antenowe',
      heading: 'Od jednej anteny na domu po instalację dla całego bloku.',
      lead: 'Antenę satelitarną trzeba wycelować z dokładnością do pojedynczych stopni. Dlatego ustawiamy ją miernikiem, a nie „na oko”, i używamy przewodów, wtyków i anten dobrej klasy.',
    },
    items: [
      {
        icon: 'home',
        title: 'Dom jednorodzinny',
        text: 'Antena satelitarna i naziemna DVB-T2, rozprowadzenie do kilku telewizorów, pomiar sygnału przy każdym gnieździe.',
      },
      {
        icon: 'build',
        title: 'Instalacje zbiorcze w blokach',
        text: 'Jedna antena dla wszystkich mieszkańców zamiast lasu talerzy na balkonach. Multiswitche i rozprowadzenie do lokali.',
      },
      {
        icon: 'wrench',
        title: 'Modernizacja starych instalacji',
        text: 'Wymiana wzmacniaczy, przewodów i gniazd w istniejących instalacjach zbiorczych, z pomiarami po modernizacji.',
      },
      {
        icon: 'hotel',
        title: 'Telewizja hotelowa',
        text: 'Telewizja w każdym pokoju pensjonatu i hotelu, z jednego punktu odbioru. Razem z siecią i ekranami w recepcji.',
      },
      {
        icon: 'sliders',
        title: 'Pomiary miernikiem',
        text: 'Ustawiamy anteny profesjonalnym miernikiem poziomu i jakości sygnału. Wynik pokazujemy przy odbiorze.',
      },
      {
        icon: 'shield',
        title: 'Opieka po montażu',
        text: 'Konserwacja w gwarancji i opieka po gwarancji: przestawiona przez wiatr antena, zalane złącze, nowy telewizor.',
      },
    ] satisfies Feature[],
  },

  mountains: {
    head: {
      eyebrow: 'Anteny w górach',
      heading: 'Stok zasłania nadajnik, halny szarpie masztem.',
      lead: 'Na Podhalu antena ma trudniej niż na nizinach. Dobieramy jej typ, wysokość i mocowanie do miejsca, a nie do katalogu.',
    },
    items: [
      {
        icon: 'mountain',
        title: 'Zasłonięty nadajnik',
        text: 'Stok albo las między domem a nadajnikiem. Pomaga wyższy maszt, inne miejsce montażu albo antena kierunkowa.',
      },
      {
        icon: 'storm',
        title: 'Halny i wichury',
        text: 'Mocowania i maszty dobieramy z zapasem. W Zakopanem halny dawał porywy 33 m/s (grudzień 2013).',
      },
      {
        icon: 'snow',
        title: 'Śnieg i lód',
        text: 'Mokry śnieg na czaszy osłabia sygnał. Dobieramy miejsce montażu tak, żeby antenę dało się bezpiecznie odśnieżyć.',
      },
      {
        icon: 'bolt',
        title: 'Burze',
        text: 'Uziemienie i ochrona przepięciowa instalacji antenowej, żeby piorun nie trafił przez przewód do telewizora.',
      },
    ] satisfies Feature[],
  },

  multiplexes: {
    head: {
      eyebrow: 'Telewizja naziemna, stan na październik 2026',
      heading: 'Pięć multipleksów w DVB-T2.',
      accent: 'Jeden jeszcze czeka.',
      lead: 'MUX-8 nadaje jeszcze w starym DVB-T i w paśmie VHF. Termin zmiany jego standardu nie był ogłoszony (stan na październik 2026).',
    } satisfies SectionHead,
    items: [
      { name: 'MUX-1', standard: 'DVB-T2', text: 'Kanały ogólnodostępne', old: false },
      { name: 'MUX-2', standard: 'DVB-T2', text: 'M.in. Polsat i TVN', old: false },
      { name: 'MUX-3', standard: 'DVB-T2', text: 'Główne kanały TVP, od grudnia 2023', old: false },
      { name: 'MUX-4', standard: 'DVB-T2', text: 'Pakiet płatny', old: false },
      { name: 'MUX-6', standard: 'DVB-T2', text: 'Od startu w DVB-T2/HEVC', old: false },
      {
        name: 'MUX-8',
        standard: 'DVB-T · VHF',
        text: 'Czeka na zmianę standardu. Część osób potrzebuje anteny VHF.',
        old: true,
      },
    ],
  },

  /** „Czy mój telewizor jest gotowy?” (`am.q1`, `am.q2`, results). */
  quiz: {
    eyebrow: 'Czy mój telewizor jest gotowy?',
    title: 'Sprawdź w 30 sekund.',
    text: 'Przepisy wymagają od odbiorników DVB-T2 dekodowania HEVC (H.265). Telewizory sprzedawane od 1.12.2019 powinny to mieć. Od 2023 r. TVP1 i Polsat nadają z anteny w DVB-T2/HEVC, więc ich odbiór to najprostszy test.',
    q1: {
      label: 'Kiedy kupiony telewizor?',
      options: ['Od grudnia 2019', 'Wcześniej', 'Nie wiem'],
    },
    q2: {
      label: 'Czy z anteny odbierasz TVP1 i Polsat?',
      options: ['Tak, obraz i dźwięk', 'Nie odbieram', 'Nie sprawdzałem'],
    },
    results: {
      start: {
        title: 'Odpowiedz na dwa pytania',
        text: 'Najprostszy test: wyszukaj kanały w telewizorze. Jeśli z anteny odbierasz TVP1 i Polsat z obrazem i dźwiękiem, telewizor jest gotowy.',
        tone: null,
      },
      receives: {
        title: 'Telewizor jest gotowy na DVB-T2/HEVC',
        text: 'TVP1 i Polsat nadają z anteny w DVB-T2/HEVC, więc skoro je odbierasz, sprzęt jest zgodny. Jeśli innych kanałów brakuje, problem leży raczej w antenie, kablu albo ustawieniu. To sprawdzimy miernikiem.',
        tone: 'ok',
      },
      noSignal: {
        title: 'Sprawdź model albo zadzwoń',
        text: 'Brak obrazu może oznaczać telewizor bez HEVC (wtedy wystarczy niedrogi dekoder zewnętrzny) albo słaby sygnał z anteny. Sprawdzimy jedno i drugie, zwłaszcza pod kątem MUX-8 w VHF.',
        tone: 'bad',
      },
      newTv: {
        title: 'Telewizor powinien być gotowy',
        text: 'Telewizory sprzedawane od 1.12.2019 muszą dekodować HEVC. Potwierdzisz to, wyszukując kanały: TVP1 i Polsat z obrazem i dźwiękiem oznaczają, że wszystko gra.',
        tone: 'ok',
      },
      olderTv: {
        title: 'Sprawdź model albo zadzwoń',
        text: 'Wiele telewizorów z lat 2017–2019 też obsługuje HEVC. Sprawdź model w instrukcji albo wyszukaj kanały: jeśli z anteny odbierasz TVP1 i Polsat, telewizor jest gotowy.',
        tone: null,
      },
      unknown: {
        title: 'Sprawdź jednym testem',
        text: 'Najprostszy test: wyszukaj kanały w telewizorze. Jeśli z anteny odbierasz TVP1 i Polsat z obrazem i dźwiękiem, telewizor jest gotowy.',
        tone: null,
      },
    } satisfies Record<string, QuizResult>,
  },

  filter: {
    head: {
      eyebrow: 'Telewizja a 5G i LTE',
      heading: 'Obraz się zacina, gdy obok stoi maszt telefonii?',
      lead: 'Telewizja zajmuje dziś pasmo 470–694 MHz. Tuż nad nią pracują sieci LTE i 5G na 700 i 800 MHz. Silny sygnał komórkowy potrafi przesterować wzmacniacz antenowy.',
    },
    on: {
      label: 'Filtr LTE/5G włączony',
      text: 'Pasmo komórkowe jest tłumione, wzmacniacz pracuje tylko na sygnale telewizyjnym.',
    },
    off: {
      label: 'Bez filtra',
      text: 'Sygnał LTE/5G wchodzi do wzmacniacza razem z telewizją i może go przesterować.',
    },
    axis: ['470 MHz', '694 MHz', '862 MHz'],
    tv: { title: 'Telewizja naziemna', text: 'kanały 21–48 · DVB-T2' },
    lte: { title: 'LTE i 5G', text: '700 / 800 MHz' },
    note: 'Filtr przepuszcza 470–694 MHz i tłumi 694–862 MHz. Czy jest potrzebny, pokazuje pomiar jakości sygnału (MER), bo w wielu instalacjach wcale nie trzeba go zakładać.',
  },

  satellite: {
    head: {
      eyebrow: 'Telewizja satelitarna',
      heading: 'Ile telewizorów,',
      accent: 'taki konwerter i taka instalacja.',
      lead: 'Polsat Box i CANAL+ nadają z satelitów Hot Bird 13°E. Od liczby odbiorników zależy, czy wystarczy konwerter, czy potrzebny jest multiswitch albo instalacja jednoprzewodowa.',
    } satisfies SectionHead,
    items: [
      {
        kicker: '1–4 telewizory',
        title: 'Konwerter Quad',
        hue: 'var(--inst-hue-blue)',
        text: 'Cztery niezależne wyjścia, każde do osobnego tunera. Bez dodatkowych urządzeń.',
        forWhom: 'Dom, mały pensjonat',
        cable:
          'M48 40 C80 40 90 70 32 70 M48 40 C90 40 110 70 58 70 M48 40 C100 40 130 70 84 70 M48 40 C110 40 150 70 110 70',
        tvs: [22, 48, 74, 100],
      },
      {
        kicker: 'Wiele pokoi',
        title: 'Quattro + multiswitch',
        hue: 'var(--inst-hue-violet)',
        text: 'Konwerter Quattro podaje wszystkie pasma do multiswitcha, a ten rozdziela sygnał do każdego gniazda. Można dodać naziemną.',
        forWhom: 'Pensjonat, budynek wielorodzinny',
        cable:
          'M48 40 H110 V56 M110 56 L60 70 M110 56 L90 70 M110 56 L120 70 M110 56 L150 70 M110 56 L180 70',
        tvs: [50, 80, 110, 140, 170],
      },
      {
        kicker: 'Jeden kabel',
        title: 'Unicable II / dCSS',
        hue: 'var(--inst-hue-cyan)',
        text: 'Do 32 tunerów na jednym przewodzie (norma EN 50607). Dobre przy remoncie, gdy nie ma jak dołożyć kabli. Odbiornik musi obsługiwać ten standard.',
        forWhom: 'Remont, istniejące okablowanie',
        cable: 'M48 40 C100 40 100 76 190 76',
        tvs: [70, 110, 150],
      },
    ],
  },

  guesthouse: {
    eyebrow: 'Telewizja w pensjonacie i hotelu',
    heading: 'Te same kanały w każdym pokoju, z jednej szafki.',
    items: [
      {
        icon: 'dish',
        title: 'Satelita i naziemna razem',
        text: 'Wspólna antena na dachu, multiswitch i gniazda w pokojach. Jeden przewód do każdego telewizora.',
      },
      {
        icon: 'tv',
        title: 'Własny kanał z recepcji',
        text: 'Modulator zamienia sygnał HDMI, np. z komputera z informacjami o obiekcie, na kanał widoczny na każdym telewizorze.',
      },
      {
        icon: 'layers',
        title: 'Kanały satelitarne bez dekodera w pokoju',
        text: 'Transmodulator przerabia wybrane kanały SAT na DVB-T lub DVB-C w wewnętrznej sieci obiektu. Dotyczy to kanałów niekodowanych albo płatnych w ramach umowy hotelowej z operatorem (np. Polsat Box, CANAL+). Bez takiej umowy płatnych kanałów nie wolno rozprowadzać po pokojach.',
      },
    ] satisfies Feature[],
    fees: {
      eyebrow: 'Zanim powiesisz telewizory w pokojach',
      heading: 'Dwie opłaty, o których warto wiedzieć.',
      items: [
        {
          icon: 'doc',
          title: 'Abonament RTV za każdy telewizor',
          text: 'Firma płaci za każdy odbiornik osobno. W 2026 r. to 30,50 zł miesięcznie za telewizor. Sądy uznają, że telewizor gotowy do odbioru w pokoju hotelowym podlega opłacie.',
        },
        {
          icon: 'music',
          title: 'Licencje organizacji zbiorowego zarządzania',
          text: 'TSUE (C-306/05) uznał telewizję w pokojach hotelowych za publiczne udostępnianie utworów. Licencje rozlicza się z kilkoma organizacjami, m.in. ZAiKS i STOART. Przykład: STOART za audio w pokojach od 1,10 do 5,00 zł netto za pokój miesięcznie (tabela od 1.04.2026). Dla telewizorów STOART ma osobną tabelę.',
        },
      ] satisfies Feature[],
      // TODO(krystian): spec §2 — przy przepisach tylko „To nie jest porada prawna.”; zdanie z wzorca
      // zostawione do decyzji (dopisać / zastąpić).
      note: 'To obowiązki obiektu, nie instalatora. Informujemy o nich przy projekcie, ale nie zastępujemy porady prawnej.',
    },
  },
} as const

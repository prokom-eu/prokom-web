import type { SectionHead } from './anteny'

/**
 * Fixed texts of the Ekrany page (ADR-I002 §1): the sections that are not in `InstServices` and
 * the widgets. Transcribed from `zrodlo/pages/Multimedia.js` + `Multimedia.body.html` (v4.2) the
 * way `cleanPrototype` cleans a snapshot: without UI keys and without the source list (`src`) —
 * spec §2: no source lists on the site. The digital signage demo with sample phone prices is an
 * illustration of a screen, not an offer: it stays, captioned „Demo”. With the prototype's client
 * references (the clients agreed, boss 01.11.2026), without the `[SZEF…]` notes (TODO below).
 * Edited by hand from now on.
 */

export type ScreenKey = 'rec' | 'menu' | 'win' | 'conf'

/** A slide: weather tiles (icon, value, label), menu rows (name, price) or bars (label, %). */
export type Slide =
  | {
      kind: 'rec'
      title: string
      items: readonly (readonly [string, string, string])[]
      foot: string
    }
  | {
      kind: 'menu'
      title: string
      sub: string
      items: readonly (readonly [string, string])[]
      foot: string
    }
  | { kind: 'win'; title: string; sub: string; foot: string }
  | {
      kind: 'conf'
      title: string
      sub: string
      items: readonly (readonly [string, number])[]
      foot: string
    }

type Screen = {
  name: string
  icon: string
  portrait: boolean
  /** Schedule: from hour, to hour, what plays. */
  schedule: readonly (readonly [number, number, string])[]
  note: string
  slides: readonly Slide[]
}

type IconText = { icon: string; title: string; text: string }

export const ekrany = {
  /** Preview of the screens in the hero (`tv`). */
  screens: {
    label: 'Podgląd treści na ekranach w obiekcie',
    tabsLabel: 'Gdzie stoi ekran',
    landscape: 'Ekran poziomy',
    portrait: 'Ekran pionowy',
    schedule: 'Harmonogram treści:',
    items: {
      rec: {
        name: 'Recepcja',
        icon: 'bed',
        portrait: false,
        schedule: [
          [6, 10, 'Śniadanie i pogoda'],
          [10, 17, 'Atrakcje'],
          [17, 23, 'Kolacja i Wi-Fi'],
        ],
        note: 'Ekran w recepcji odpowiada na pytania gości, zanim je zadadzą: pogoda, dojazdy, godziny posiłków, Wi-Fi.',
        slides: [
          {
            kind: 'rec',
            title: 'Dzień dobry! Pogoda dziś',
            items: [
              ['sun', '−4°', 'rano'],
              ['snow', 'śnieg', 'na stokach'],
              ['cloud', '+1°', 'po południu'],
            ],
            foot: 'Przykładowe dane · pogoda i warunki z wybranych serwisów',
          },
          {
            kind: 'rec',
            title: 'Dziś w okolicy',
            items: [
              ['mountain', 'Szlaki', 'komunikaty TPN'],
              ['car', 'Bus 8:15', 'do Zakopanego'],
              ['food', 'Kolacja', '18:00–21:00'],
            ],
            foot: 'Treści ustawiasz w harmonogramie',
          },
          {
            kind: 'rec',
            title: 'Wi-Fi dla gości',
            items: [
              ['wifi', 'Goście', 'nazwa sieci'],
              ['key', '7H2K', 'kod na pobyt'],
              ['phone', 'Recepcja', 'wew. 100'],
            ],
            foot: 'Kod zmienia się co pobyt',
          },
        ],
      },
      menu: {
        name: 'Menu board',
        icon: 'food',
        portrait: true,
        schedule: [
          [7, 11, 'Śniadania'],
          [11, 17, 'Obiady'],
          [17, 22, 'Kolacje'],
        ],
        note: 'Menu zmienia się samo o ustalonych godzinach. Nową pozycję albo cenę wpisujesz w telefonie i za chwilę jest na ekranie.',
        slides: [
          {
            kind: 'menu',
            title: 'Śniadania',
            sub: '7:00–11:00',
            items: [
              ['Jajecznica na maśle', '24 zł'],
              ['Oscypek z żurawiną', '18 zł'],
              ['Moskol z masłem', '14 zł'],
              ['Kawa z ekspresu', '12 zł'],
            ],
            foot: 'Przykładowe menu i ceny',
          },
          {
            kind: 'menu',
            title: 'Obiady',
            sub: '11:00–17:00',
            items: [
              ['Kwaśnica na żeberku', '26 zł'],
              ['Pstrąg z grilla', '42 zł'],
              ['Placki po zbójnicku', '38 zł'],
              ['Kompot domowy', '10 zł'],
            ],
            foot: 'Przykładowe menu i ceny',
          },
          {
            kind: 'menu',
            title: 'Kolacje',
            sub: '17:00–22:00',
            items: [
              ['Deska serów', '36 zł'],
              ['Pierogi z bryndzą', '29 zł'],
              ['Grzane wino', '19 zł'],
              ['Szarlotka', '16 zł'],
            ],
            foot: 'Przykładowe menu i ceny',
          },
        ],
      },
      win: {
        name: 'Witryna',
        icon: 'shop',
        portrait: true,
        schedule: [
          [8, 18, 'Oferta dnia'],
          [18, 24, 'Wieczór'],
        ],
        note: 'Ekran w witrynie zmienia ofertę w ciągu dnia. Na zewnątrz i w Zakopanem najpierw sprawdzamy, co pozwalają lokalne przepisy.',
        slides: [
          {
            kind: 'win',
            title: 'Narty, kaski, gogle',
            sub: 'Wypożyczalnia czynna 8:00–18:00',
            foot: 'Wejdź do środka →',
          },
          {
            kind: 'win',
            title: 'Serwis nart od ręki',
            sub: 'Ostrzenie i smarowanie',
            foot: 'Zapytaj w środku →',
          },
          {
            kind: 'win',
            title: 'Wieczorem do 20:00',
            sub: 'Zwrot sprzętu bez kolejki',
            foot: 'Zapraszamy →',
          },
        ],
      },
      conf: {
        name: 'Sala konferencyjna',
        icon: 'users',
        portrait: false,
        schedule: [
          [8, 16, 'Prezentacje'],
          [16, 22, 'Ekran powitalny'],
        ],
        note: 'W sali konferencyjnej laptop łączy się z ekranem bez szukania kabli, a między spotkaniami ekran wita gości i pokazuje plan dnia.',
        slides: [
          {
            kind: 'conf',
            title: 'Prezentacja z laptopa',
            sub: 'połączenie bezprzewodowe',
            items: [
              ['I', 40],
              ['II', 65],
              ['III', 52],
              ['IV', 85],
            ],
            foot: 'Przykładowy wykres',
          },
          {
            kind: 'conf',
            title: 'Plan szkolenia',
            sub: 'Sala A',
            items: [
              ['9:00', 30],
              ['11:00', 55],
              ['13:00', 45],
              ['15:00', 70],
            ],
            foot: 'Harmonogram z kalendarza obiektu',
          },
          {
            kind: 'conf',
            title: 'Witamy uczestników',
            sub: 'Przerwa kawowa 10:30',
            items: [
              ['', 20],
              ['', 35],
              ['', 50],
              ['', 65],
            ],
            foot: 'Ekran powitalny',
          },
        ],
      },
    } satisfies Record<ScreenKey, Screen>,
  },

  where: {
    head: {
      eyebrow: 'Gdzie montujemy ekrany',
      heading: 'Ekran, który pracuje, a nie tylko świeci.',
      lead: 'Dobieramy ekran do miejsca, montujemy go, podłączamy odtwarzacz i ustawiamy harmonogram treści. Treść zmieniasz z telefonu albo zlecasz nam.',
    } satisfies SectionHead,
    items: [
      {
        icon: 'bed',
        title: 'Recepcja i lobby',
        text: 'Pogoda, dojazdy, atrakcje, posiłki i Wi-Fi. Mniej pytań przy ladzie.',
      },
      {
        icon: 'food',
        title: 'Menu board',
        text: 'Menu, które zmienia się o godzinie. Zdjęcia dań, ceny i promocje.',
      },
      {
        icon: 'shop',
        title: 'Witryna i totem',
        text: 'Oferta dnia widoczna z ulicy. Pionowe ekrany przy wejściu.',
      },
      {
        icon: 'users',
        title: 'Sale konferencyjne',
        text: 'Ekran lub projektor, prezentacja bezprzewodowa, nagłośnienie i mikrofony.',
      },
      {
        icon: 'grid',
        title: 'Ściany wideo',
        text: 'Kilka ekranów jako jeden obraz w holu, salonie albo na wydarzeniach.',
      },
      {
        icon: 'school',
        title: 'Projektory w salach i szkołach',
        text: 'Sprzęt projekcyjny w salach szkoleniowych, konferencyjnych i klasach. Robiliśmy to m.in. w Blachotrapezie i w szkole w Rabce-Zdroju.',
      },
    ] satisfies IconText[],
    tvBefore:
      'Realizacje: sale Blachotrapezu (konferencyjna, szkoleniowa i marketingowa), Szkoła Podstawowa im. Adama Mickiewicza w Rabce-Zdroju, Caffe Europa w Nowym Sączu. Telewizję w pokojach gości robimy w ramach ',
    tvLink: { label: 'instalacji antenowych', href: '/anteny' },
    tvAfter: '. ',
    realizationsLink: { label: 'Zobacz realizacje →', href: '/realizacje' },
  },

  /** Demo: one price change, two screens of the salon (`sy`; the prototype: two salons). */
  sync: {
    eyebrow: 'Wdrażamy to u siebie',
    heading: 'Jedna zmiana ceny. Dwa ekrany. Kilka sekund.',
    // TODO(krystian): confirm the state of the rollout in our salons (the prototype:
    // „[SZEF: potwierdź stan wdrożenia w salonach]”).
    lead: 'Taki system wdrażamy w naszym salonie w Rabce-Zdroju: ceny telefonów zmieniamy w jednym miejscu, a ekrany w witrynie i przy ladzie odświeżają się same. Kliknij w demo i sprawdź, jak to działa.',
    lowerPhone: 'Obniż cenę smartfona o 100 zł',
    promo: 'Promocja na słuchawki',
    reset: 'Przywróć ceny',
    log: 'Demo z przykładowymi cenami. Kliknij przycisk powyżej.',
    sent: 'Zmiana wysłana o',
    updated: 'oba ekrany zaktualizowane',
    phoneChange: 'smartfon 128 GB:',
    promoOn: 'promocja na słuchawki',
    promoOff: 'koniec promocji',
    resetDone: 'ceny wyjściowe',
    pricesOfDay: 'Ceny dnia',
    salon: 'Demo · PRO-KOM · salon',
    synced: 'zsynchronizowano',
    salons: ['Rabka-Zdrój · witryna', 'Rabka-Zdrój · lada'],
    products: ['Smartfon 128 GB', 'Smartfon 256 GB', 'Tablet 11 cali', 'Słuchawki bezprzewodowe'],
    prices: [1899, 2599, 1499, 349],
  },

  /** Brightness for the place (`js`). */
  brightness: {
    head: {
      eyebrow: 'Dobierz ekran do miejsca',
      heading: 'W witrynie zwykły ekran po prostu zniknie.',
      lead: 'Jasność ekranu mierzy się w nitach. W środku sklepu wystarcza kilkaset, w witrynie w słońcu potrzeba kilku tysięcy. Wybierz miejsce, a pokażemy, jaka klasa ekranu ma sens.',
    } satisfies SectionHead,
    placesLabel: 'Miejsce ekranu',
    screen: { title: 'PROMOCJA', text: '−20% na akcesoria' },
    showRegular: 'Pokaż zwykły ekran 350 nitów',
    showPicked: 'Pokaż dobrany ekran',
    needed: 'Potrzebna jasność',
    classLabel: 'Przykładowa klasa ekranu',
    marks: [350, 700, 2000, 3500],
    places: [
      {
        name: 'Biuro, sala',
        icon: 'office',
        nits: 350,
        range: '350–500 nitów',
        cls: 'Ekran do wnętrz 16/7, np. seria QBC (350 nitów)',
        text: 'W biurze czy sali wystarczy podstawowy ekran profesjonalny. Gdy ma pracować cały dzień w sklepie, wybieramy serię do pracy ciągłej.',
      },
      {
        name: 'Środek sklepu',
        icon: 'shop',
        nits: 500,
        range: 'ok. 500 nitów',
        cls: 'Ekran 24/7, np. seria QMC (500 nitów)',
        text: 'Ekran działa przez cały dzień otwarcia i jeszcze dłużej, a jasność 500 nitów spokojnie wystarcza w oświetlonym wnętrzu.',
      },
      {
        name: 'Jasne wnętrze',
        icon: 'sun',
        nits: 700,
        range: 'ok. 700 nitów',
        cls: 'Ekran o podwyższonej jasności, np. seria QHC (700 nitów)',
        text: 'Duże przeszklenia, lobby hotelu, galeria. Powłoka antyrefleksyjna ogranicza odbicia.',
      },
      {
        name: 'Witryna w cieniu',
        icon: 'eye',
        nits: 2000,
        range: '1500–2500 nitów',
        cls: 'Ekran witrynowy, np. OMDX 32" (2000 nitów)',
        text: 'Ekran za szybą od strony północnej albo pod zadaszeniem. Montujemy go w odstępie od szyby, żeby się nie przegrzewał.',
      },
      {
        name: 'Witryna w słońcu',
        icon: 'sun2',
        nits: 3000,
        range: '2500–4000 nitów',
        cls: 'Ekran witrynowy, np. OMB 55" (3000 nitów)',
        text: 'Słońce na szybie to najtrudniejsze miejsce. Nagrzana szyba potrafi przyciemnić obraz, więc liczy się jasność, chłodzenie i odstęp od szyby.',
      },
      {
        name: 'Na zewnątrz',
        icon: 'snow',
        nits: 3500,
        range: 'od 2500 nitów',
        cls: 'Ekran zewnętrzny, np. OHDX 55" (3500 nitów, IP56, od −30°C)',
        text: 'Deszcz, mróz i słońce odbite od śniegu. Tylko ekran przeznaczony na zewnątrz, a w Zakopanem najpierw sprawdzamy zasady uchwały krajobrazowej.',
      },
    ],
    note: 'Zakres jest orientacyjny. Miejsce sprawdzamy w najjaśniejszej porze dnia.',
  },

  tvOrScreen: {
    head: {
      eyebrow: 'Telewizor czy ekran profesjonalny',
      heading: 'Telewizor w witrynie to oszczędność tylko na starcie.',
      lead: 'Telewizor jest tańszy, ale nie jest robiony do pracy w firmie. Warunki gwarancji producentów telewizorów wyłączają albo ograniczają użytek inny niż domowy.',
    } satisfies SectionHead,
    columns: ['Telewizor domowy', 'Ekran profesjonalny'],
    rows: [
      [
        'Gwarancja przy użytku w firmie',
        'Wyłączona albo ograniczona w warunkach Samsung i LG',
        'Zaprojektowany do firm, Samsung LFD: 36 miesięcy',
      ],
      ['Godziny pracy', 'Producent nie podaje', '16/7 albo 24/7, zależnie od serii'],
      ['Jasność', 'Do wnętrz', 'Od 350 do kilku tysięcy nitów'],
      ['Praca w pionie', 'Zwykle nieprzewidziana', 'Pion i poziom, np. QBC, QMC, QHC'],
      ['Odtwarzanie treści', 'Aplikacje telewizora', 'Wbudowany odtwarzacz, bez komputera'],
      [
        'Zdalne zarządzanie',
        'Zwykle brak',
        'Włączanie, harmonogram, monitoring, blokada USB i pilota',
      ],
    ],
  },

  content: {
    eyebrow: 'Treści i zarządzanie',
    heading: 'Zmieniasz menu z telefonu. Albo robimy to za Ciebie.',
    lead: 'Samsung kończy sprzedaż MagicINFO w wersji lokalnej z końcem 2026 roku, a jego następcą jest VXT. Istniejące instalacje MagicINFO mają wsparcie do końca 2029 roku, ale MagicINFO Cloud przestaje działać już 28.02.2027. Nowe wdrożenia robimy na VXT, a licencję dobieramy do liczby ekranów i tego, kto zmienia treści.',
    items: [
      {
        icon: 'phone',
        title: 'Zmiany z telefonu lub komputera',
        text: 'Wgrywasz zdjęcie, zmieniasz cenę albo tekst i publikujesz na wybranych ekranach.',
      },
      {
        icon: 'clock',
        title: 'Harmonogramy',
        text: 'Śniadanie, obiad, kolacja. Treść zmienia się sama, także w weekendy i święta.',
      },
      {
        icon: 'wrench',
        title: 'Treści na zlecenie',
        // TODO(krystian): scope and price of the content service (the prototype: „Zakres i cena:
        // [SZEF].”).
        text: 'Możemy przygotowywać i aktualizować treści za Ciebie.',
      },
    ] satisfies IconText[],
  },

  led: {
    eyebrow: 'Ekrany LED',
    heading: 'Z jakiej odległości oglądasz?',
    lead: 'W ekranach LED liczy się rozstaw pikseli. Im mniejszy, tym bliżej można stać, ale tym drożej.',
    pitch: 'Rozstaw pikseli',
    closest: 'Najbliżej',
    comfort: 'Komfortowo',
    from: 'od',
    note: 'Reguła minimum: 1 mm rozstawu to ok. 1 m odległości. Komfortowo ok. 2,4 m na każdy 1 mm.',
    more: {
      eyebrow: 'Ściany wideo i monitory interaktywne',
      heading: 'Kiedy jeden ekran to za mało.',
      items: [
        {
          icon: 'grid',
          title: 'Ściany wideo',
          text: 'Kilka ekranów z wąską ramką jako jeden obraz. Np. Samsung VM55B-U ma 3,5 mm przerwy między obrazami sąsiednich ekranów i fabryczną kalibrację kolorów.',
        },
        {
          icon: 'finger',
          title: 'Monitory interaktywne Avtek',
          text: 'Polska marka firmy VIDIS. Np. TouchScreen 6 Connect 86: 4K, 20 punktów dotyku, według producenta 5 lat gwarancji.',
        },
        {
          icon: 'users',
          title: 'Samsung Flip i monitory edukacyjne',
          text: 'Interaktywny flipchart do sal spotkań i monitory z Google Play i Classroom do szkół.',
        },
        {
          icon: 'tv',
          title: 'Projektory i ekrany',
          text: 'Sale konferencyjne, szkoły i kościoły. Projektor, ekran projekcyjny i nagłośnienie w jednym projekcie.',
        },
      ] satisfies IconText[],
    },
  },

  outdoor: {
    eyebrow: 'Ekrany zewnętrzne i w witrynie',
    heading: 'Na zewnątrz w górach potrzebny jest inny ekran.',
    lead: 'Słońce odbite od śniegu, mróz i wilgoć. Na zewnątrz montujemy ekrany do tego przeznaczone, a w Zakopanem najpierw sprawdzamy zgodność z uchwałą krajobrazową.',
    items: [
      {
        icon: 'sun',
        title: 'Jasność',
        text: 'Ekrany zewnętrzne mają wielokrotnie wyższą jasność, np. Samsung OHDX 55": 3500 nitów.',
      },
      {
        icon: 'snow',
        title: 'Mróz',
        text: 'Ten sam model pracuje od −30 do +50°C, w trybie 24/7.',
      },
      { icon: 'drop', title: 'Woda i pył', text: 'Obudowa IP56 i odporność na uderzenia IK10.' },
      {
        icon: 'doc',
        title: 'Przepisy lokalne',
        text: 'Uchwała krajobrazowa w Zakopanem i przepisy innych gmin. Sprawdzamy przed montażem.',
      },
    ] satisfies IconText[],
    law: 'Zakopane: uchwała krajobrazowa (Dz. Urz. Woj. Małopolskiego z 3.06.2026, poz. 3134) obowiązuje od 4 lipca 2026 r. Istniejące reklamy i szyldy trzeba co do zasady dostosować w ciągu 12 miesięcy. Według materiałów miasta uchwała ogranicza m.in. nośniki o zmiennej, migającej treści, więc ekran w witrynie lub na elewacji może być mocno ograniczony. Ofertę na taki montaż w Zakopanem przygotowujemy dopiero po sprawdzeniu pełnego tekstu uchwały.',
  },
} as const

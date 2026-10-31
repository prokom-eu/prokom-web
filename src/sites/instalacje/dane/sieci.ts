import type { Feature, SectionHead } from './anteny'

/**
 * Fixed texts of the Sieci i Wi-Fi page (ADR-I002 §1): the sections that are not in
 * `InstServices` and the widgets. Transcribed from `zrodlo/pages/Sieci.js` + `Sieci.body.html`
 * (v4.2) the way `cleanPrototype` cleans a snapshot: without UI keys and without the source list
 * (`src`) — spec §2: no source lists on the site. The prototype's `wl` and `br` widgets are not in
 * its markup (removed NET2/NET3 blocks) and are left out. Edited by hand from now on.
 */

export type NetMode = 'przed' | 'po'
export type VlanKey = 'g' | 'k' | 'b' | 's'

export const sieci = {
  /** Wi-Fi coverage map in the hero (`wf`). */
  coverage: {
    label: 'Mapa zasięgu Wi-Fi w pensjonacie przed i po modernizacji',
    modesLabel: 'Wariant sieci',
    modes: [
      { mode: 'przed', label: 'Przed: router operatora', icon: 'wifi' },
      { mode: 'po', label: 'Po: 3 punkty dostępowe', icon: 'check' },
    ] as { mode: NetMode; label: string; icon: string }[],
    tagAfter: 'Zasięg w całym budynku',
    tagBefore: 'zasięgu',
    quality: ['Brak zasięgu', 'Słaby', 'Dobry', 'Świetny'],
    split: 'Podział sieci:',
    noteAfter:
      'Trzy punkty dostępowe podłączone kablem dają równy zasięg w pokojach, jadalni i kuchni. Gość przechodzi z pokoju na taras bez zrywania połączenia.',
    noteBefore:
      'Jeden router w recepcji: w pokojach od strony kuchni i na piętrze zasięg słabnie albo znika. Wzmacniacz z gniazdka zwykle tylko przenosi problem dalej.',
  },

  /** The four networks (`VL`): colour token, icon, what belongs there. */
  vlans: {
    g: {
      name: 'Goście',
      hue: 'var(--inst-plan-accent)',
      icon: 'users',
      text: 'Telefony i laptopy gości. Odizolowane od siebie i od reszty.',
      extra: 'portal z voucherem',
    },
    k: {
      name: 'Kamery',
      hue: 'var(--inst-promo-warm)',
      icon: 'cam',
      text: 'Kamery i rejestrator. Bez dostępu z sieci gości.',
      extra: 'zasilanie PoE',
    },
    b: {
      name: 'Recepcja i kasa',
      hue: 'var(--inst-scene-beam-ok)',
      icon: 'office',
      text: 'Komputer recepcji, kasa fiskalna, terminal płatniczy.',
      extra: 'priorytet ruchu',
    },
    s: {
      name: 'Smart i TV',
      hue: 'var(--inst-hue-violet)',
      icon: 'home',
      text: 'Telewizory, ekran w recepcji, sterowanie Ampio, ładowarka.',
      extra: 'urządzenia IoT',
    },
  } satisfies Record<
    VlanKey,
    { name: string; hue: string; icon: string; text: string; extra: string }
  >,

  why: {
    head: {
      eyebrow: 'Dlaczego Wi-Fi nie działa',
      heading: 'Mocniejszy router zwykle nie pomaga. Pomaga plan.',
      lead: 'W pensjonatach i domach na Podhalu widzimy ciągle te same przyczyny. Zwykle da się je naprawić bez zmiany operatora.',
    } satisfies SectionHead,
    items: [
      {
        icon: 'wifi',
        title: 'Jeden router na cały budynek',
        text: 'Router od operatora stoi w szafce przy wejściu, a pokoje są dwa piętra wyżej.',
      },
      {
        icon: 'build',
        title: 'Ściany i stropy',
        text: 'Beton, cegła, kamień i stropy osłabiają sygnał. Zwykle każde piętro potrzebuje swojego punktu.',
      },
      {
        icon: 'layers',
        title: 'Mesh bez kabla',
        text: 'Każdy skok radiowy obniża prędkość. Ubiquiti zaleca najwyżej dwa skoki bezprzewodowe.',
      },
      {
        icon: 'lock',
        title: 'Jedna sieć dla wszystkiego',
        text: 'Goście, kamery i kasa w tej samej sieci to ryzyko i spowolnienie w sezonie.',
      },
    ] satisfies Feature[],
  },

  split: {
    head: {
      eyebrow: 'Osobne sieci w jednym budynku',
      heading: 'Gość nie zobaczy Twoich kamer ani kasy.',
      lead: 'Jeden kabel, jedno łącze, ale kilka oddzielnych sieci. Kliknij sieć, żeby zobaczyć, co do niej należy.',
    } satisfies SectionHead,
    nodes: [
      { icon: 'globe', title: 'Internet', text: 'światłowód, radio lub LTE' },
      { icon: 'shield', title: 'Router z zaporą', text: 'rozdziela sieci i pilnuje ruchu' },
      { icon: 'net', title: 'Switch PoE', text: 'zasila punkty dostępowe i kamery' },
    ],
  },

  portal: {
    eyebrow: 'Wi-Fi dla gości',
    heading: 'Strona logowania z Twoim logo. Hasło na pobyt, nie na zawsze.',
    lead: 'Portal gościa pokazuje ekran powitalny obiektu. Możesz dać voucher z limitem czasu, prędkości albo transferu, hasło z recepcji albo logowanie jednym kliknięciem. Urządzenia gości są od siebie odizolowane.',
    list: [
      {
        title: 'Vouchery na pobyt',
        text: 'Kod z limitem czasu, prędkości albo transferu, drukowany lub wysyłany gościom.',
      },
      {
        title: 'Twoje logo i regulamin',
        text: 'Ekran powitalny z nazwą obiektu i linkiem do oferty.',
      },
      {
        title: 'Izolacja gości',
        text: 'Urządzenia gości nie widzą siebie nawzajem ani Twoich sieci.',
      },
      {
        title: 'Płynne przechodzenie',
        text: 'Szybki roaming między punktami dostępowymi w budynku.',
      },
    ],
    uke: 'Udostępnianie gościom internetu przez Wi-Fi jako dodatek do noclegu nie jest działalnością telekomunikacyjną (Prawo komunikacji elektronicznej, art. 1 ust. 2). Zwykle nie trzeba niczego rejestrować w UKE.',
    rodo: 'Jeśli logowanie zbiera e-mail albo telefon gościa, potrzebna jest klauzula informacyjna RODO, a do marketingu osobna zgoda. Pomożemy to ustawić. Najprościej: voucher bez danych osobowych.',
    /** Example screen of the guest portal (a picture of a phone). */
    screen: {
      title: 'Wi-Fi · Pensjonat',
      time: '15:04',
      logo: 'LOGO',
      // The prototype: „Witamy w [nazwa obiektu]” — an example screen, no placeholder on the page.
      welcome: 'Witamy w pensjonacie',
      sub: 'Wi-Fi dla gości',
      codeLabel: 'Kod z recepcji lub z wiadomości',
      codes: ['7H2K', 'Q4M9', 'B8T3'],
      until: 'Ważny do',
      untilValue: 'nd, 11:00',
      speed: 'Prędkość',
      speedValue: 'do 50 Mb/s',
      connect: 'Połącz z internetem',
      terms: 'Akceptuję regulamin sieci',
      caption: 'Przykładowy ekran · ilustracja',
    },
  },

  cabling: {
    head: {
      eyebrow: 'Kable, szafy, światłowody',
      heading: 'Dobre Wi-Fi zaczyna się od kabla.',
      lead: 'Punkty dostępowe podłączamy przewodem, a budynki łączymy światłowodem albo mostem radiowym. W górach, gdzie stok zasłania sygnał, to często jedyna droga.',
    } satisfies SectionHead,
    items: [
      {
        icon: 'net',
        title: 'Okablowanie Cat6 i Cat6A',
        text: 'Gniazda w pokojach, przy telewizorach i w miejscach na punkty dostępowe.',
      },
      {
        icon: 'cpu',
        title: 'Szafa rack',
        text: 'Porządek w technice: router, switch PoE, rejestrator, UPS i opisane przewody.',
      },
      {
        icon: 'fiber',
        title: 'Światłowód między budynkami',
        text: 'Światłowody jedno- i wielomodowe: układanie, spawanie i pomiary. Pensjonat, domki i hala w jednej sieci.',
      },
      {
        icon: 'mountain',
        title: 'Mosty radiowe',
        text: 'Połączenie punkt–punkt tam, gdzie kabla nie da się przekopać.',
      },
      {
        icon: 'battery',
        title: 'Zasilanie awaryjne',
        text: 'UPS dla routera i kamer, żeby krótki zanik prądu nie wyłączał sieci.',
      },
      {
        icon: 'globe',
        title: 'Łącze zapasowe LTE',
        text: 'Gdy główne łącze padnie, router przełącza się na sieć komórkową.',
      },
    ] satisfies Feature[],
    uke: 'Według UKE w 2024 roku ok. 16% gospodarstw domowych w Polsce nie miało dostępu do internetu 100 Mb/s. Na Podhalu też trafiamy na takie adresy. Wtedy budujemy łącze radiowe albo zapasowe LTE.',
    // TODO(krystian): prototyp — „Realizacja: okablowanie stanowisk biurowych w Blachotrapezie
    // w Rabce-Zdroju. [SZEF: zgoda klienta na podanie nazwy]”; realizacje tylko za zgodą (I6).
  },

  lab: {
    head: {
      eyebrow: 'Sprawdź sam',
      heading: 'Cztery decyzje, które przesądzają o sieci.',
      lead: 'Mury, kabel, połączenie budynków i zapasowe łącze. Pobaw się suwakami, a zobaczysz, dlaczego zawsze zaczynamy od wizji lokalnej.',
    } satisfies SectionHead,
    walls: {
      kicker: 'Mury a Wi-Fi',
      title: 'Ile sygnału zabiera ściana?',
      bands: ['2,4 GHz', '5 GHz'],
      sender: 'Nadajnik',
      note: 'Wartości dla typowej ściany. Gruby mur tłumi więcej.',
      texts: {
        brick:
          'Tyle tłumi typowa ściana. Gruby mur kamienny albo ceglany zabiera wyraźnie więcej. Przez dwie takie ściany sygnał już słabnie.',
        blocks:
          'Za taką przegrodą sygnał praktycznie znika. Potrzebny jest osobny punkt Wi-Fi po drugiej stronie, podłączony kablem.',
        weak: 'Przez jedną taką ścianę jeszcze działa, przez dwie już słabo. W pensjonacie to argument za punktem w pokoju, a nie w korytarzu.',
        light: 'Lekka przegroda, sygnał przejdzie bez większych strat.',
      },
    },
    cable: {
      kicker: 'Kabel',
      title: 'Cat6 czy Cat6A?',
      length: 'Długość trasy:',
      lengthLabel: 'Długość trasy w metrach',
      speed: 'Potrzebna prędkość',
      ok: 'Cat6 wystarczy',
      needA: 'Wybierz Cat6A',
      note: 'Cat6: 10 Gb/s do ok. 55 m, Cat6A: 10 Gb/s na pełnych 100 m. Cat7 nie jest uznawana przez normę TIA, dlatego jej nie proponujemy.',
    },
    link: {
      kicker: 'Kilka budynków',
      title: 'Światłowód czy most radiowy?',
      distance: 'Odległość między budynkami',
      distances: ['do 100 m', '100–500 m', 'ponad 500 m'],
      dig: 'Czy można kopać?',
      see: 'Czy budynki się widzą?',
      yesNo: ['Tak', 'Nie'],
    },
    failover: {
      kicker: 'Łącze zapasowe',
      title: 'Co się dzieje, gdy padnie internet?',
      operator: 'Operator',
      lte: 'LTE/5G',
      router: 'Router',
      terminal: 'Terminal',
      works: 'działa',
      worksLte: 'działa przez LTE',
      cut: 'Odetnij łącze operatora',
      restore: 'Przywróć łącze operatora',
      textDown:
        'Router sam przełączył się na zapasowe LTE/5G. Terminal płatniczy i kamery dalej mają internet. Na Podhalu zasięg komórkowy sprawdzamy na miejscu, a tam, gdzie go brakuje, rozważamy łącze satelitarne.',
      textUp:
        'Główne łącze działa. Router pilnuje go cały czas i w razie awarii przełączy ruch na łącze zapasowe.',
    },
  },

  hardware: {
    head: {
      eyebrow: 'Z czego składa się dobra sieć',
      heading: 'Cztery elementy zamiast routera od operatora.',
      accent: 'Jedna aplikacja do wszystkich.',
      lead: 'Sieć w obiekcie to system: brama z zaporą, przełącznik, który zasila urządzenia po kablu, punkty Wi-Fi i panel, z którego wszystko widać. Markę sprzętu dobieramy po wizji lokalnej.',
    } satisfies SectionHead,
    careful: 'Na co uważać:',
    roles: [
      {
        icon: 'shield',
        title: 'Brama z zaporą',
        text: 'Łączy obiekt z internetem i pilnuje, kto i dokąd może się połączyć. Tu powstają osobne sieci dla gości, kas i kamer, VPN i łącze zapasowe.',
        tip: 'domowy router nie rozdzieli sieci i nie przełączy się sam na drugie łącze.',
      },
      {
        icon: 'net',
        title: 'Przełącznik PoE',
        text: 'Do niego schodzą kable z całego budynku. Jednym kablem daje urządzeniom internet i prąd, więc punkty Wi-Fi i kamery nie potrzebują gniazdek.',
        tip: 'budżet mocy PoE musi wystarczyć na wszystkie punkty i kamery, z zapasem.',
      },
      {
        icon: 'wifi',
        title: 'Punkty dostępowe',
        text: 'Sufitowe na korytarze i sale, ścienne w miejscu gniazdka w pokojach, zewnętrzne na taras i parking. Telefon sam przełącza się między nimi.',
        tip: 'na kabel, nie mesh. Każdy skok radiowy obniża prędkość.',
      },
      {
        icon: 'sliders',
        title: 'Panel i aplikacja',
        text: 'Cała sieć w jednym miejscu: kto jest podłączony, który punkt ma problem, aktualizacje. Jeśli masz u nas opiekę, widzimy awarię zdalnie, często zanim zadzwonisz.',
        tip: 'konto administratora ma być na Ciebie, a nie na instalatora.',
      },
    ],
    brands: {
      eyebrow: 'Na czym budujemy',
      title: 'Sprzęt dobieramy do budynku, nie odwrotnie.',
      text: 'Najczęściej pracujemy na systemach Ubiquiti UniFi albo TP-Link Omada, a przy mostach radiowych także MikroTik. Markę dobieramy po wizji lokalnej: do liczby pokoi, kamer, budynków i tego, kto będzie siecią zarządzał.',
    },
    always: {
      eyebrow: 'Niezależnie od marki',
      title: 'To dostajesz w każdej sieci.',
      items: [
        'Osobna sieć gości z portalem logowania',
        'Zasilanie punktów i kamer jednym kablem (PoE)',
        'Aktualizacje i nadzór zdalny z panelu',
      ],
    },
  },

  standards: {
    head: {
      eyebrow: 'Wi-Fi 6, 6E i 7',
      heading: 'Co naprawdę zmieniają nowe standardy.',
      lead: 'Nowszy standard nie zawsze znaczy „szybciej u każdego”. Pełną korzyść mają nowe telefony i laptopy, a starsze urządzenia dalej działają.',
    } satisfies SectionHead,
    items: [
      {
        gen: 'Wi-Fi 6',
        title: 'Więcej urządzeń naraz',
        hue: 'var(--inst-hue-blue)',
        list: [
          'OFDMA: kanał dzielony między wiele urządzeń',
          'MU-MIMO: kilka urządzeń obsługiwanych jednocześnie',
          'TWT: dłużej działa bateria w telefonach i czujnikach',
        ],
        note: 'Dziś rozsądne minimum w domu i firmie.',
      },
      {
        gen: 'Wi-Fi 6E',
        title: 'Nowe pasmo 6 GHz',
        hue: 'var(--inst-hue-violet)',
        list: [
          'Dodatkowe pasmo z wolnymi kanałami',
          'Mniej zakłóceń od sąsiadów',
          'Punkty dostępowe tylko wewnątrz budynków (moc LPI)',
        ],
        note: 'Dobre tam, gdzie w okolicy jest dużo sieci.',
      },
      {
        gen: 'Wi-Fi 7',
        title: 'Szybciej i stabilniej',
        hue: 'var(--inst-plan-send-to)',
        list: [
          'Kanały do 320 MHz; w Polsce pasmo 6 GHz (480 MHz) mieści jeden taki kanał',
          'MLO: kilka pasm używanych naraz',
          '4K-QAM: ok. 20% więcej niż 1024-QAM',
        ],
        note: 'Warto rozważyć przy nowej instalacji.',
      },
    ],
    band: {
      title: 'Pasmo 6 GHz w Polsce:',
      text: '5945–6425 MHz udostępnione rozporządzeniem z 11.11.2023 (Dz.U. 2023 poz. 2567). Punkty o mocy LPI pracują tylko wewnątrz budynków, dlatego na zewnątrz i w mostach radiowych dalej używamy 5 GHz lub 60 GHz.',
    },
  },

  nis2: {
    eyebrow: 'Dla firm średnich i dużych oraz instytucji',
    heading: 'NIS2 jest już w polskim prawie.',
    text: 'Nowelizacja ustawy o krajowym systemie cyberbezpieczeństwa (Dz.U. 2026 poz. 252) obowiązuje od 3.04.2026. Obejmuje co do zasady średnie i duże firmy z wybranych sektorów, a także wiele podmiotów publicznych.',
    items: [
      'Osobne sieci dla urządzeń i gości',
      'Aktualizacje i kopie konfiguracji',
      'Dokumentacja sieci i dostępów',
    ],
    note: 'Nie robimy audytów prawnych. Przygotowujemy sieć i dokumentację techniczną, które ułatwiają spełnienie wymagań.',
  },
}

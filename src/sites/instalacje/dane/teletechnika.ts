import type { Feature, SectionHead } from './anteny'
import { stanNa } from './stanFaktow'

/**
 * Fixed texts of the Teletechnika page (ADR-I002 §1): the sections that are not in
 * `InstServices`, the building widget and the quote form. Transcribed from
 * `zrodlo/pages/Teletechnika.js` + `Teletechnika.body.html` (v4.2) the way `cleanPrototype`
 * cleans a snapshot: without UI keys and without the source list (`src`) — spec §2. The form has
 * no file upload in v1 (ADR-I002 §4): the bill of quantities goes by e-mail after the inquiry.
 * Edited by hand from now on.
 */

export type TeleLayer = 'fib' | 'lan' | 'rtv' | 'dom'
export type QuoteScope = 'lan' | 'fib' | 'rtv' | 'dom' | 'cam' | 'kd'

export const teletechnika = {
  /** Building cross-section in the hero (`tt`). */
  building: {
    label: 'Przekrój budynku wielorodzinnego z instalacjami teletechnicznymi',
    layersLabel: 'Instalacje w przekroju',
    hint: 'Kliknij numer na rysunku',
    numbersLabel: 'Elementy instalacji na rysunku',
    stage: 'Etap:',
    layers: [
      { key: 'fib', label: 'Światłowód', hue: 'var(--inst-promo-warm)' },
      { key: 'lan', label: 'Sieć LAN', hue: 'var(--inst-plan-send-to)' },
      { key: 'rtv', label: 'RTV/SAT', hue: 'var(--inst-hue-violet)' },
      { key: 'dom', label: 'Domofon', hue: 'var(--inst-scene-beam-ok)' },
    ] as { key: TeleLayer; label: string; hue: string }[],
    steps: [
      {
        title: 'Przedmiar',
        text: 'Czytamy projekt i przedmiar. Zaznaczamy braki i kolizje z innymi branżami, zanim zrobi się z nich problem na budowie.',
      },
      {
        title: 'Oferta',
        text: 'Trasy rozrysowane na projekcie, wycena i harmonogram dopasowany do etapów budowy.',
      },
      {
        title: 'Trasy',
        text: 'Stan surowy: peszle, korytka, pion, puszki i skrzynki. Kable wejdą później, po tynkach.',
      },
      {
        title: 'Montaż',
        text: 'Światłowód, skrętka, RTV/SAT i domofon. Szafy, gniazda, osprzęt w każdym lokalu.',
      },
      {
        title: 'Pomiary',
        text: 'Każde gniazdo i włókno zmierzone i opisane. Protokół dla każdego lokalu.',
      },
      {
        title: 'Odbiór',
        text: 'Dokumentacja powykonawcza, protokoły pomiarów i odbiór z inspektorem.',
      },
    ],
    elements: [
      {
        title: 'Studnia i przyłącze operatora',
        text: 'Operator wprowadza swój kabel kanalizacją do budynku. My przygotowujemy przepust i trasę do pomieszczenia teletechnicznego.',
      },
      {
        title: 'Punkt styku',
        text: 'Granica między siecią operatora a instalacją budynku. Tu podłącza się każdy operator, który chce świadczyć usługi lokatorom.',
      },
      {
        title: 'Szafa główna',
        text: 'Przełącznice światłowodowe i panele krosowe. Każde włókno i każdy port opisane tak, jak w dokumentacji.',
      },
      {
        title: 'Pion teletechniczny',
        text: 'Szacht przez wszystkie kondygnacje. Zostawiamy w nim zapas miejsca na instalacje, które dojdą za kilka lat.',
      },
      {
        title: 'Skrzynka piętrowa',
        text: 'Rozdział włókien i przewodów na lokale danego piętra. Serwis bez wchodzenia do mieszkań.',
      },
      {
        title: 'Skrzynka mieszkaniowa',
        text: 'Tu kończy się instalacja budynku, a zaczyna sieć w mieszkaniu. Miejsce na router operatora.',
      },
      {
        title: 'Gniazda w pokojach',
        text: 'Skrętka do pokoi, gniazdo RTV przy telewizorze, unifon przy drzwiach. Wszystko opisane.',
      },
      {
        title: 'Antena, SAT i multiswitch',
        text: 'Wspólna antena naziemna i satelitarna na dachu. Multiswitch rozdziela sygnał do gniazd w lokalach.',
      },
      {
        title: 'Panel domofonu',
        text: 'Panel przy wejściu, unifon lub monitor w każdym lokalu. Można dodać otwieranie z aplikacji.',
      },
    ],
  },

  scope: {
    head: {
      eyebrow: 'Zakres prac',
      heading: 'Wszystko, co w budynku przewodzi sygnał.',
      lead: 'Wchodzimy na budowę w stanie surowym, prowadzimy trasy, montujemy, mierzymy i oddajemy dokumentację. Jeden podwykonawca od całej teletechniki budynku.',
    } satisfies SectionHead,
    items: [
      {
        icon: 'net',
        title: 'Okablowanie strukturalne',
        text: 'Skrętka w mieszkaniach i lokalach, gniazda, szafy, panele krosowe, opis i pomiary.',
      },
      {
        icon: 'fiber',
        title: 'Światłowód do lokali',
        text: 'Instalacja światłowodowa od punktu styku do skrzynek mieszkaniowych, gotowa dla operatorów.',
      },
      {
        icon: 'tv',
        title: 'RTV/SAT zbiorcza',
        text: 'Antena naziemna i satelitarna, multiswitche, rozprowadzenie do gniazd w lokalach.',
      },
      {
        icon: 'phone',
        title: 'Domofony i wideodomofony',
        text: 'Panele przy wejściach i bramie, unifony lub monitory w lokalach, otwieranie z aplikacji.',
      },
      {
        icon: 'cam',
        title: 'Monitoring części wspólnych',
        text: 'Garaż podziemny, wejścia, śmietnik, plac zabaw. Zakres dokumentacji (np. pod RODO wspólnoty) ustalamy w ofercie.',
      },
      {
        icon: 'lock',
        title: 'Kontrola dostępu',
        text: 'Breloki do klatek, garażu i komórek lokatorskich, szlaban na wjeździe.',
      },
    ] satisfies Feature[],
  },

  /*
   * RUNDA-V5 §10 — more content between the scope and the law. Only general, checkable facts,
   * no new numbers without a source. Sentences that name a standard carry a TODO for the check
   * at the editing stage.
   */

  /** „Na każdym etapie budowy” (`#etapy`): the axis of the home process (`ProcessAxis`). */
  stages: {
    head: {
      eyebrow: 'Na każdym etapie budowy',
      heading: 'Od projektu do przekazania wspólnocie.',
      lead: 'Wchodzimy wtedy, kiedy trzeba, a nie wtedy, kiedy jest za późno. Przy każdym etapie wiemy, co robimy i co sprawdzamy.',
    } satisfies SectionHead,
    getLabel: 'Sprawdzamy',
    steps: [
      {
        icon: 'doc',
        title: 'Projekt i uzgodnienia',
        text: 'Czytamy projekt teletechniki, trasy i miejsca na szafy.',
        get: 'punkt styku dla operatorów i miejsce na szafy',
      },
      {
        icon: 'build',
        title: 'Stan surowy',
        text: 'Piony, przepusty i rury z zapasem i pilotem.',
        get: 'drożność rur, zanim wejdą tynkarze',
      },
      {
        icon: 'net',
        title: 'Przed tynkami',
        text: 'Okablowanie lokali i skrzynki mieszkaniowe.',
        get: 'opis każdego przewodu na obu końcach',
      },
      {
        icon: 'tool',
        title: 'Montaż osprzętu',
        text: 'Gniazda, panele, szafy, multiswitche i domofony po wykończeniu.',
        get: 'zgodność gniazd z rzutami',
      },
      {
        icon: 'sliders',
        title: 'Pomiary',
        text: 'Mierzymy każdy tor, miedziany i światłowodowy.',
        get: 'wynik każdego toru w raporcie',
      },
      {
        icon: 'file',
        title: 'Dokumentacja',
        text: 'Dokumentacja powykonawcza zgodna z tym, co jest w ścianach.',
        get: 'schematy pionów i opisy paneli',
      },
      {
        icon: 'users',
        title: 'Przekazanie',
        text: 'Pokazujemy szafy, punkty styku i dokumenty wspólnocie lub zarządcy.',
        get: 'komplet dokumentów u odbierającego',
      },
    ],
  },

  /** „Co dostajesz przy odbiorze” + „W jakich standardach pracujemy” (`#przy-odbiorze`). */
  handover: {
    head: {
      eyebrow: 'Przy odbiorze',
      heading: 'Co dostajesz, kiedy oddajemy budynek.',
      lead: 'Dokumenty, z którymi wspólnota albo zarządca poradzi sobie bez nas — i z nami, gdy trzeba coś zmienić.',
    } satisfies SectionHead,
    items: [
      'Raport z pomiarów każdego toru, miedzianego i światłowodowego',
      'Opis gniazd i paneli zgodny z dokumentacją',
      'Schematy pionów',
      'Dokumentację powykonawczą w PDF i na papierze',
      'Listę sprzętu z numerami seryjnymi tam, gdzie to ma znaczenie',
    ],
  },
  standards: {
    title: 'W jakich standardach pracujemy',
    items: [
      // TODO(krystian): check the exact wording of the standards at editing (RUNDA-V5 §10.3).
      'Okablowanie strukturalne projektujemy i wykonujemy według norm z rodziny PN-EN 50173 (projektowanie) i PN-EN 50174 (instalacja).',
      'Każdy tor mierzymy miernikiem, a wyniki trafiają do raportu.',
      // TODO(krystian): confirm the fibre type in the flats with the boss (RUNDA-V5 §10.3).
      'W lokalach stosujemy światłowód jednomodowy z włóknem odpornym na zginanie.',
    ],
  },

  /** „Błędy, które zatrzymują odbiór” (`#bledy`): four cards, each with how we avoid it. */
  mistakes: {
    head: {
      eyebrow: 'Błędy, które zatrzymują odbiór',
      heading: 'Cztery rzeczy, przez które odbiór się przesuwa.',
      lead: 'Widzimy je na budowach najczęściej. Każdej da się uniknąć, jeśli pomyśli się o niej wcześniej.',
    } satisfies SectionHead,
    avoidLabel: 'Jak tego unikamy',
    items: [
      {
        icon: 'x',
        title: 'Rury bez zapasu i pilota',
        text: 'Przewodu nie da się przeciągnąć, a ściana jest już otynkowana.',
        avoid: 'Rury z zapasem średnicy i pilotem, drożność sprawdzona przed tynkami.',
      },
      {
        icon: 'bolt',
        title: 'Zasilanie i teletechnika w jednej rurze',
        text: 'Zakłócenia sygnału i problem przy odbiorze.',
        avoid: 'Osobne trasy i rury, uzgodnione z elektrykiem na etapie projektu.',
      },
      {
        icon: 'doc',
        title: 'Brak opisów na panelach i gniazdach',
        text: 'Nikt nie wie, który kabel idzie do którego mieszkania.',
        avoid: 'Opis na obu końcach każdego przewodu, zgodny z dokumentacją.',
      },
      {
        icon: 'layers',
        title: 'Za mała skrzynka mieszkaniowa',
        text: 'Router, terminal operatora i zasilacz się nie mieszczą, drzwiczki się nie zamykają.',
        avoid: 'Skrzynka dobrana do sprzętu operatora, z zapasem na przyszłość.',
      },
    ],
  },

  /** „Także w częściach wspólnych” (`#czesci-wspolne`), with links to the service pages. */
  common: {
    head: {
      eyebrow: 'Także w częściach wspólnych',
      heading: 'Domofony, dostęp, monitoring i telewizja dla całego budynku.',
      lead: 'Robimy je w tym samym zakresie co okablowanie lokali, więc trasy i szafy planujemy raz.',
    } satisfies SectionHead,
    items: [
      {
        icon: 'phone',
        title: 'Domofony i wideodomofony',
        text: 'Panele przy wejściach i bramie, monitory w lokalach.',
        href: '/alarmy',
      },
      {
        icon: 'lock',
        title: 'Dostęp do klatek i garażu',
        text: 'Breloki, czytniki i szlaban na wjeździe.',
        href: '/kontrola-dostepu',
      },
      {
        icon: 'cam',
        title: 'Monitoring garażu i wejść',
        text: 'Kamery w częściach wspólnych, nagrania w budynku.',
        href: '/monitoring',
      },
      {
        icon: 'tv',
        title: 'RTV/SAT zbiorcza',
        text: 'Jedna antena i multiswitch zamiast anten na balkonach.',
        href: '/anteny',
      },
    ],
  },

  /** „Jak liczymy ofertę” (`#jak-liczymy`): four steps; the bill of quantities by e-mail. */
  pricing: {
    head: {
      eyebrow: 'Jak liczymy ofertę',
      heading: 'Wycena pozycja po pozycji, z terminem wejścia ekipy.',
      lead: 'Od przedmiaru do terminu na budowie w czterech krokach.',
    } satisfies SectionHead,
    steps: [
      {
        icon: 'file',
        title: 'Przedmiar albo projekt',
        text: 'Przesyłasz go mailem po pierwszym kontakcie — bez wysyłania plików na stronie.',
      },
      {
        icon: 'chat',
        title: 'Pytania o budowę',
        text: 'Pytamy o etap budowy, harmonogram i to, czego w przedmiarze brakuje.',
      },
      {
        icon: 'doc',
        title: 'Wycena pozycja po pozycji',
        text: 'Każda pozycja przedmiaru osobno, bez jednej kwoty za całość.',
      },
      {
        icon: 'cal',
        title: 'Termin wejścia ekipy',
        text: 'Ustalamy, kiedy wchodzimy na budowę i ile to potrwa.',
      },
    ],
  },

  /** The realization of this page (RUNDA-V5 §10.7): matched by name to a published one. */
  realization: {
    eyebrow: 'Realizacja',
    heading: 'Przyłącza IT stanowisk biurowych w Blachotrapezie.',
    name: 'Blachotrapez',
    place: 'Rabka-Zdrój · stanowiska biurowe',
    photoHint: 'stanowiska biurowe przyłącza IT okablowanie',
    text: 'Przyłącza IT i okablowanie stanowisk, a w salach konferencyjnej i szkoleniowej także nagłośnienie i projekcja.',
    all: { label: 'Wszystkie realizacje →', href: '/realizacje' },
  },

  forWhom: {
    head: { eyebrow: 'Dla kogo', heading: 'Pracujemy z tymi, którzy budują.' },
    items: [
      {
        icon: 'crane',
        title: 'Deweloperzy',
        text: 'Teletechnika budynków wielorodzinnych i osiedli domów, od projektu do odbioru.',
      },
      {
        icon: 'build',
        title: 'Generalni wykonawcy',
        text: 'Podwykonawstwo branży teletechnicznej zgodnie z harmonogramem budowy.',
      },
      {
        icon: 'users',
        title: 'Wspólnoty i zarządcy',
        text: 'Modernizacja domofonów, RTV/SAT, monitoringu i dostępu w istniejących budynkach.',
      },
      {
        icon: 'hotel',
        title: 'Hotele i obiekty publiczne',
        text: 'Okablowanie, sieci, TV hotelowa, nagłośnienie i ekrany w jednym zakresie.',
      },
    ] satisfies Feature[],
    note: 'Na Podhalu wciąż dużo się buduje: w 2024 roku w powiatach nowotarskim i tatrzańskim oddano łącznie ok. 1170 mieszkań, także w domach jednorodzinnych (dane GUS). Okablowanie najlepiej zaplanować, zanim wejdą tynkarze.',
  },

  law: {
    eyebrow: `Co się zmieniło w 2026 · ${stanNa()}`,
    heading: 'Nowy budynek musi być gotowy na światłowód.',
    lead: 'Pilnujemy, żeby to, co zaprojektowano, dało się odebrać. A gdy przepisy się zmieniają, mówimy o tym już w ofercie.',
    items: [
      {
        title: 'Od 12.02.2026: światłowód w nowym budynku',
        text: 'Rozporządzenie UE 2024/1309 (Gigabit Infrastructure Act, art. 10): nowe budynki i budynki po gruntownej przebudowie, dla których wniosek o pozwolenie złożono po 12.02.2026, mają mieć wewnętrzną infrastrukturę i okablowanie światłowodowe, a budynki wielorodzinne także punkt dostępu dla operatorów. Wyjątki i szczegóły sprawdzamy w projekcie.',
      },
      {
        title: 'Ustawa o wspieraniu rozwoju sieci telekomunikacyjnych',
        text: 'Art. 30 ust. 6: budynek powinien być wyposażony, zgodnie z warunkami technicznymi, w instalację telekomunikacyjną. Przy przebudowie instalacji w budynkach wielorodzinnych, zamieszkania zbiorowego i użyteczności publicznej obowiązek dotyczy także ich (art. 30 ust. 7–9).',
      },
      {
        title: 'Warunki techniczne: okres przejściowy',
        text: `Rozporządzenie o warunkach technicznych z 2002 r. utraciło moc 20.09.2026, nowego nie ogłoszono (${stanNa()}). Do 20.03.2028 projekt można sporządzić według dotychczasowych warunków (dla teletechniki rozdział 8a), jeśli inwestor złoży oświadczenie (art. 102a–102c Prawa budowlanego). Stan prawny sprawdzamy przy każdym projekcie.`,
      },
    ],
  },

  /** Quote form (`rfq`): a contact inquiry „Teletechnika — przedmiar” (ADR-I002 §4). */
  quote: {
    head: {
      eyebrow: 'Zapytanie ofertowe',
      heading: 'Wyślij przedmiar. Odpowiemy wyceną.',
      lead: 'Przedmiar, projekt albo choćby rzuty z opisem. Im więcej szczegółów, tym dokładniejsza oferta.',
    } satisfies SectionHead,
    category: 'Teletechnika — przedmiar',
    typeTitle: 'Rodzaj inwestycji',
    types: [
      'Budynek wielorodzinny',
      'Osiedle domów',
      'Hotel lub pensjonat',
      'Obiekt komercyjny',
      'Modernizacja',
    ],
    scopeTitle: 'Zakres',
    scopes: [
      { key: 'lan', label: 'Okablowanie LAN' },
      { key: 'fib', label: 'Światłowód' },
      { key: 'rtv', label: 'RTV/SAT' },
      { key: 'dom', label: 'Domofony' },
      { key: 'cam', label: 'Monitoring' },
      { key: 'kd', label: 'Kontrola dostępu' },
    ] as { key: QuoteScope; label: string }[],
    fields: {
      units: { label: 'Liczba lokali', placeholder: 'np. 24' },
      place: { label: 'Lokalizacja', placeholder: 'np. Nowy Targ' },
      stage: { label: 'Etap budowy', placeholder: 'np. stan surowy otwarty' },
      term: { label: 'Planowany termin', placeholder: 'np. II kwartał 2027' },
      name: {
        label: 'Imię i nazwisko lub firma',
        placeholder: 'np. Anna Nowak lub nazwa firmy',
      },
      phone: { label: 'Telefon', placeholder: 'np. 600 000 000' },
      email: { label: 'E-mail', placeholder: 'np. biuro@firma.pl' },
    },
    // Prototype: a file field (PDF, DWG, XLS, ZIP) — no upload in v1 (ADR-I002 §4, I0).
    files: {
      title: 'Przedmiar, projekt lub rzuty',
      text: 'Przedmiar prześlij mailem po zgłoszeniu — w odpowiedzi podamy adres. PDF, DWG, XLS, ZIP.',
    },
    contactTitle: 'Dane do kontaktu',
    summary: {
      eyebrow: 'Twoje zapytanie',
      type: 'Inwestycja',
      scope: 'Zakres',
      units: 'Lokale',
      empty: '—',
    },
    send: 'Wyślij zapytanie',
    sending: 'Wysyłamy…',
    errors: {
      prefix: 'Uzupełnij:',
      name: 'imię i nazwisko lub firmę',
      phone: 'numer telefonu',
      consent: 'zgodę na kontakt',
      phoneFormat: 'Sprawdź numer telefonu, np. 600 100 200.',
      emailFormat: 'Sprawdź adres e-mail.',
      placeLong: 'Skróć lokalizację (najwyżej 100 znaków).',
      termLong: 'Skróć planowany termin (najwyżej 100 znaków).',
      stageLong: 'Skróć etap budowy.',
      failed: 'Nie udało się wysłać. Spróbuj ponownie albo zadzwoń.',
      limit: 'Za dużo zgłoszeń z tego adresu. Spróbuj za chwilę albo zadzwoń.',
    },
    thanks: {
      title: 'Dziękujemy. Zapytanie przyjęte.',
      text: 'Odezwiemy się w sprawie wyceny. Przedmiar albo projekt prześlij w odpowiedzi na naszą wiadomość.',
      number: 'Numer zgłoszenia:',
    },
    // TODO(krystian): prototyp — „Kontakt dla firm budowlanych: [SZEF: osoba, telefon, e-mail]”;
    // dopiszemy, gdy szef poda osobę (spec §12).
  },

  /** Button of the CTA band on this page (the prototype's `ctaBtn`). */
  bandButton: { label: 'Wyślij przedmiar →', href: '#zapytanie' },
}

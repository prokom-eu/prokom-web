import type { SoftwareHomeV24 } from '../../lib/software/home'

/**
 * Sections of the v24 start page after the hero (ZMIANY-v24 §4 pkt 2–5, boards `AU-pc`, data `PN`,
 * `SV`, `DV`, `AV`, `IND` of `v24/wzorzec/aurora.js`, texts `TRESCI-v24.md`). Prices and terms are
 * not here: each item points to its solution. The seed adds the ones a stored home lacks.
 */
export const HOME_V24: Required<SoftwareHomeV24> = {
  promises: [
    {
      title: 'Widzisz, zanim zapłacisz',
      text: 'Po 5–7 dniach klikasz podgląd swojej strony albo systemu. Dopiero wtedy decydujesz.',
      icon: [
        'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z',
        'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
      ],
    },
    {
      title: 'Stała cena na piśmie',
      text: 'Zakres, cena i termin w umowie przed startem. Większość płacisz po odbiorze.',
      icon: [
        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
        'M14 2v6h6M9 15l2 2 4-4',
      ],
    },
    {
      title: 'Wszystko jest Twoje',
      text: 'Domena, kod, panel i dane należą do Twojej firmy. Bez abonamentowej pułapki.',
      icon: [
        'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z',
        'M7 11V7a5 5 0 0 1 10 0v4',
      ],
    },
  ],
  situations: {
    eyebrow: 'Od czego zaczynasz',
    title: 'Z czym do nas przychodzisz?',
    lead: 'Wybierz swoją sytuację. Pokażemy rozwiązanie, cenę i czas.',
    offer: 'Zobacz ofertę',
    items: [
      {
        short: 'Nie mam strony',
        question: 'Klienci pytają o stronę, a Ty jej nie masz',
        answer:
          'Wizytówka albo strona firmowa w 1–2 tygodnie: telefon, oferta, mapa i formularz. Podgląd do klikania dostajesz po 5–7 dniach.',
        solution: 'strona-wizytowka',
        mockup: { kind: 'site', variant: 'wizytowka' },
        phone: true,
      },
      {
        short: 'Mam starą stronę',
        question: 'Strona jest, ale wygląda jak z 2012 roku i nic nie daje',
        answer:
          'Przebudujemy ją na szybką i wygodną na telefonie. Stare adresy przekierujemy, więc nie stracisz pozycji w Google.',
        solution: 'przebudowa-starej-strony',
        mockup: { kind: 'before', variant: 'przebudowa' },
      },
      {
        short: 'Toniemy w Excelach',
        question: 'Zamówienia w mailach, klienci w Excelu, dane w siedmiu arkuszach',
        answer:
          'Jeden panel na zamówienia, zadania i klientów. Pierwszy moduł działa po 2–3 tygodniach, reszta dochodzi etapami.',
        solution: 'system-zlecen-i-grafik-ekip',
        mockup: { kind: 'dash', variant: 'zamowienia' },
      },
      {
        short: 'Za dużo przepisywania',
        question: 'Ciągle coś przepisujesz, wysyłasz i przypominasz ręcznie',
        answer:
          'SMS-y, faktury i raporty wysyłają się same. Asystent AI szykuje odpowiedzi, a Ty tylko zatwierdzasz.',
        solution: 'powiadomienia-sms-i-e-mail',
        mockup: { kind: 'flow', variant: 'sms' },
      },
    ],
  },
  bento: {
    eyebrow: 'Oferta',
    title: 'Cztery rzeczy.',
    em: 'Zrobione najlepiej.',
    lead: 'Każda z ceną „od” i terminem. Klikaj warianty, a podgląd zmienia się na żywo.',
    details: 'Szczegóły',
    dragHint: '⇆ Przeciągnij: stara i nowa strona.',
    sites: {
      title: 'Strony internetowe',
      variants: [
        {
          label: 'Wizytówka',
          solution: 'strona-wizytowka',
          variant: 'wizytowka',
          text: 'Jedna strona: kim jesteś, co robisz, telefon i mapa. Klient dzwoni jednym kliknięciem.',
        },
        {
          label: 'Firmowa',
          solution: 'strona-firmowa-z-panelem',
          variant: 'firmowa',
          text: 'Oferta, realizacje i opinie. Treści zmieniasz sam w panelu po polsku.',
        },
        {
          label: 'Rozbudowana',
          solution: 'rozbudowana-strona-firmowa',
          variant: 'rozbudowana',
          text: 'Szeroka oferta, blog, kilka języków i kilka osób w panelu.',
        },
        {
          label: 'Landing page',
          solution: 'landing-page',
          variant: 'landing',
          text: 'Jedna usługa albo kampania. Formularz na każdym ekranie.',
        },
        {
          label: 'Pensjonat',
          solution: 'strona-dla-hotelu-lub-pensjonatu',
          variant: 'pensjonat',
          text: 'Pokoje, zapytanie o termin i trzy języki, bez prowizji portalu.',
        },
        {
          label: 'Restauracja',
          solution: 'strona-dla-restauracji-lub-baru',
          variant: 'restauracja',
          text: 'Menu zmieniasz sam, gość rezerwuje stolik przez formularz.',
        },
      ],
    },
    rebuild: { title: 'Przebudowa strony', solution: 'przebudowa-starej-strony' },
    systems: {
      title: 'Systemy dla firm',
      variants: [
        { label: 'Zamówienia', solution: 'system-zlecen-i-grafik-ekip', variant: 'zamowienia' },
        { label: 'CRM', solution: 'crm-dla-malej-i-sredniej-firmy', variant: 'crm' },
        { label: 'Czas pracy', solution: 'czas-pracy-i-rozliczenia', variant: 'czas' },
        { label: 'Z Excela', solution: 'z-excela-do-systemu', variant: 'excel' },
      ],
    },
    automations: {
      eyebrow: 'Pracuje, gdy Ty śpisz',
      title: 'Automatyzacje i AI',
      text: 'SMS-y, faktury i raporty idą same. Asystent AI szykuje odpowiedzi, a Ty tylko zatwierdzasz.',
      link: 'Szczegóły',
      variants: [
        { label: 'SMS i e-mail', solution: 'powiadomienia-sms-i-e-mail', variant: 'sms' },
        { label: 'Faktury', solution: 'faktury-bez-przepisywania', variant: 'faktury' },
        { label: 'Raporty', solution: 'raporty-dla-szefa', variant: 'raporty' },
        { label: 'Asystent AI', solution: 'asystent-ai-do-zapytan', variant: 'ai' },
      ],
    },
  },
  showroom: {
    eyebrow: 'Kliknij swoją branżę',
    title: 'Tak może wyglądać Twoja strona albo system',
    lead: 'Wybierz, czym zajmuje się firma. Pokażemy stronę, wersję na telefon i system dopasowany do Twojej branży.',
    modes: ['Strona', 'Na telefonie', 'System'],
    sitePrefix: 'Strona dla branży:',
    systemPrefix: 'System:',
    systemFeatures: [
      'Dostęp z telefonu i komputera',
      'Uprawnienia dla pracowników',
      'Kopia danych co noc',
    ],
    cta: 'Policz dla tej branży →',
    industries: [
      {
        key: 'nocleg',
        name: 'Pensjonat, hotel, apartamenty',
        icon: 'M3 18V8M3 14h18v4M21 18v-4a3 3 0 0 0-3-3h-7v3M7.5 11a1.5 1.5 0 1 0 0-.01',
        site: 'pensjonat',
        system: 'crm',
        systemName: 'Rezerwacje i goście w jednym panelu',
        features: [
          'Zapytanie o termin bez prowizji portalu',
          'Pokoje z galerią i cenami',
          'Wersje PL, EN i DE',
          'Okolica, dojazd i atrakcje',
        ],
      },
      {
        key: 'gastro',
        name: 'Restauracja, bar, kawiarnia',
        icon: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9',
        site: 'restauracja',
        system: 'zamowienia',
        systemName: 'Zamówienia i rezerwacje stolików',
        features: [
          'Menu, które zmieniasz w minutę',
          'Rezerwacja stolika online',
          'Menu po angielsku dla turystów',
          'Godziny, mapa i parking',
        ],
      },
      {
        key: 'bud',
        name: 'Budowlanka i remonty',
        icon: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5',
        site: 'budowlanka',
        system: 'czas',
        systemName: 'Zlecenia i czas pracy ekip',
        features: [
          'Realizacje z opisem i zdjęciami',
          'Formularz bezpłatnej wyceny',
          'Opinie klientów',
          'Obszar działania na mapie',
        ],
      },
      {
        key: 'turyst',
        name: 'Turystyka i atrakcje',
        icon: 'M3 19l6-9 4 6 3-4 5 7z',
        site: 'turystyka',
        system: 'crm',
        systemName: 'Rezerwacje terminów i grupy',
        features: [
          'Wolne terminy i rezerwacja',
          'Strona w 3 językach',
          'Mapa, dojazd i parking',
          'Opinie z Google',
        ],
      },
      {
        key: 'uroda',
        name: 'Uroda i zdrowie',
        icon: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
        site: 'uroda',
        system: 'crm',
        systemName: 'Kalendarz wizyt i klienci',
        features: [
          'Rezerwacja wizyt 24/7',
          'Przypomnienia SMS',
          'Cennik zabiegów',
          'Galeria efektów',
        ],
      },
      {
        key: 'moto',
        name: 'Warsztat i motoryzacja',
        icon: 'M5 16h14M6 16l1.5-5h9L18 16M5 16v3M19 16v3M8 13.5h.01M16 13.5h.01',
        site: 'warsztat',
        system: 'zamowienia',
        systemName: 'Zlecenia napraw i statusy',
        features: [
          'Umawianie wizyt online',
          'Status naprawy w SMS',
          'Cennik usług',
          'Historia serwisowa klienta',
        ],
      },
      {
        key: 'handel',
        name: 'Sklep i handel',
        icon: 'M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0',
        site: 'sklep',
        system: 'excel',
        systemName: 'Stany i ceny w jednej bazie',
        features: [
          'Asortyment i promocje',
          'Godziny i dojazd do sklepów',
          'Rezerwacja odbioru',
          'Nowości co tydzień',
        ],
      },
      {
        key: 'biuro',
        name: 'Biuro i usługi dla firm',
        icon: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
        site: 'biuro',
        system: 'crm',
        systemName: 'Klienci, sprawy i terminy',
        features: [
          'Konsultacja online',
          'Czytelna oferta i cennik',
          'Poradnik dla klientów',
          'Bezpieczny formularz dokumentów',
        ],
      },
      {
        key: 'prod',
        name: 'Produkcja i rzemiosło',
        icon: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z',
        site: 'produkcja',
        system: 'excel',
        systemName: 'Zamówienia i produkcja',
        features: [
          'Katalog produktów',
          'Zapytanie ofertowe B2B',
          'Wersja po angielsku',
          'Realizacje i certyfikaty',
        ],
      },
      {
        key: 'inna',
        name: 'Inna firma',
        icon: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
        site: 'firmowa',
        system: 'zamowienia',
        systemName: 'Zamówienia, klienci i zadania',
        features: [
          'Oferta, realizacje i opinie',
          'Formularz zapytania',
          'Panel po polsku',
          'Gotowa pod Google i AI',
        ],
      },
    ],
  },
  tech: {
    eyebrow: 'Jak budujemy',
    title: 'Nie składamy stron z szablonu.',
    em: 'Piszemy je pod Twoją firmę.',
    lead: 'Większość stron powstaje z gotowego motywu i kilkunastu wtyczek. My piszemy od podstaw. Dlatego dostajesz rzeczy, które da się zmierzyć i wpisać do protokołu odbioru.',
    tabs: [
      {
        label: 'Szybka',
        title: 'Klient nie czeka i nie ucieka',
        text: 'Strona czeka gotowa na serwerze, nic nie składa się w locie z wtyczek. Google lepiej ocenia szybkie strony, a klient dzwoni, zamiast wracać do wyników.',
        them: ['WordPress z wtyczkami', 'motyw i wtyczki ładują się po kolei'],
        us: ['Strona od PRO-KOM', 'treść w mniej niż 2,5 s, zmierzona przy odbiorze'],
        visual: { kind: 'speed', value: '< 2,5 s', caption: 'treść na ekranie telefonu' },
      },
      {
        label: 'Bezpieczna',
        title: 'Spokój zamiast łatania wtyczek',
        text: 'Nie ma obcych wtyczek, które trzeba co tydzień łatać. Kopie, aktualizacje i monitoring robimy my. Ty prowadzisz firmę.',
        stat: {
          v: '7 966',
          t: 'nowych luk w WordPressie i wtyczkach w 2024 r. (ok. 22 dziennie, 96% we wtyczkach). Źródło: Patchstack, „State of WordPress Security in 2025”.',
        },
        them: ['WordPress z wtyczkami', 'każda wtyczka to inny autor i inna luka'],
        us: ['Strona od PRO-KOM', 'jeden kod, bez PHP i bez wtyczek'],
        visual: {
          kind: 'security',
          pills: ['✓ kopia 03:00', '✓ aktualizacje', '✓ monitoring 24/7'],
        },
      },
      {
        label: 'Widoczna w Google i AI',
        title: 'Widoczna w Google i w odpowiedziach AI',
        text: 'Szybkość, wygoda na telefonie i dobre opisy. Dane o firmie, godziny i adres zapisujemy tak, żeby czytał je Google i asystenci AI, np. ChatGPT. Miejsca w wynikach uczciwie nie gwarantuje nikt.',
        them: ['WordPress z wtyczkami', 'zależy od wtyczek i ich ustawień'],
        us: ['Strona od PRO-KOM', 'dane strukturalne i SEO w cenie każdej strony'],
        visual: {
          kind: 'search',
          query: 'twoja usługa + miasto',
          ours: ['twojafirma.pl', 'Twoja Firma · Twoje miasto', '★★★★★ · otwarte do 17:00 · tel.'],
          other: ['konkurencja.pl', 'Firma XYZ'],
          ai: ['Asystent AI', '„Polecam Twoja Firma — odpowiada w 24 h, ceny na stronie.”'],
        },
      },
      {
        label: 'Na czym budujemy',
        title: 'Sprawdzone narzędzia, dane w Polsce',
        text: 'Nazw nie musisz znać. Ważne, co z nich masz: szybka strona, panel po polsku, dane na serwerze w Polsce i kopia co noc. Projekt może przejąć każdy programista, nie tylko my.',
        them: ['Gotowe kreatory stron', 'dane u dostawcy, abonament na zawsze'],
        us: ['Strona od PRO-KOM', 'domena, kod i dane zapisane na Twoją firmę'],
        visual: {
          kind: 'stack',
          rows: [
            ['Strona', 'Next.js · TypeScript'],
            ['Panel', 'Payload CMS po polsku'],
            ['System', 'Python · Django'],
            ['Dane', 'PostgreSQL'],
            ['Serwer', 'Docker · VPS w Polsce'],
          ],
        },
      },
    ],
  },
  pricing: {
    eyebrow: 'Cennik',
    title: 'Cena i termin.',
    em: 'Od razu.',
    lead: 'Kliknij kartę: zobaczysz, co dostajesz, jak to przebiega i kiedy płacisz.',
    all: 'Wszystko',
    details: 'Szczegóły →',
    groups: [
      {
        label: 'Strony',
        solutions: [
          'strona-wizytowka',
          'strona-firmowa-z-panelem',
          'rozbudowana-strona-firmowa',
          'landing-page',
          'strona-dla-hotelu-lub-pensjonatu',
          'strona-dla-restauracji-lub-baru',
        ],
      },
      {
        label: 'Przebudowa i opieka',
        solutions: [
          'przebudowa-starej-strony',
          'opieka-nad-strona-i-systemem',
          'przejecie-po-innym-wykonawcy',
        ],
      },
      {
        label: 'Systemy',
        solutions: [
          'system-zlecen-i-grafik-ekip',
          'crm-dla-malej-i-sredniej-firmy',
          'z-excela-do-systemu',
          'czas-pracy-i-rozliczenia',
        ],
      },
      {
        label: 'Automatyzacje',
        solutions: [
          'powiadomienia-sms-i-e-mail',
          'faktury-bez-przepisywania',
          'asystent-ai-do-zapytan',
        ],
      },
    ],
  },
  processHead: {
    eyebrow: 'Jak pracujemy',
    title: 'Większość płacisz po odbiorze',
    stage: 'Etap {num} · {t}',
  },
}

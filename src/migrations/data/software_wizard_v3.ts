/**
 * Frozen value of `SoftwareSettings.wizard` v3 for the migration `swa3_kreator_v3` (SWA3,
 * decision 08.11) — a copy of `src/seed/software/wizard.ts` (`pnpm -s software:wizard-json`,
 * 08.11.2026). Never import the seed here: the migration must give the same result after the
 * seed changes. `priceDisplay` is the fallback only: a stored one stays.
 */
export const WIZARD_V3_FROZEN = {
  types: [
    {
      id: 'wizytowka',
      group: 'site',
      solution: 'strona-wizytowka',
      label: 'Strona wizytówka',
      desc: 'Kim jesteś, telefon, mapa, formularz.',
    },
    {
      id: 'firmowa',
      group: 'site',
      solution: 'strona-firmowa-z-panelem',
      label: 'Strona firmowa',
      desc: 'Oferta, realizacje, opinie, panel.',
    },
    {
      id: 'rozbudowana',
      group: 'site',
      solution: 'rozbudowana-strona-firmowa',
      label: 'Rozbudowana strona',
      desc: 'Wiele podstron, blog, języki.',
    },
    {
      id: 'landing',
      group: 'site',
      solution: 'landing-page',
      label: 'Landing page',
      desc: 'Jedna usługa albo kampania.',
    },
    {
      id: 'przebudowa',
      group: 'redo',
      solution: 'przebudowa-starej-strony',
      label: 'Przebudowa starej strony',
      desc: 'Masz stronę, ale nic nie daje.',
    },
    {
      id: 'system',
      group: 'sys',
      solution: 'z-excela-do-systemu',
      label: 'System dla firmy',
      desc: 'Zamówienia, klienci, zadania, godziny.',
    },
    {
      id: 'automatyzacje',
      group: 'auto',
      solution: 'asystent-ai-do-zapytan',
      label: 'Automatyzacje i AI',
      desc: 'SMS-y, faktury, odpowiedzi same.',
    },
    {
      id: 'nie-wiem',
      group: 'idk',
      solution: null,
      label: 'Nie wiem jeszcze',
      desc: 'Opiszesz po swojemu, doradzimy.',
      noPrice: {
        tile: '0 zł',
        price: '0 zł za rozmowę',
        sub: '30 minut, bez zobowiązań',
        term: 'rozmowa 30 min',
      },
    },
  ],
  groups: {
    site: ['type', 'ind', 'have', 'feat', 'res'],
    redo: ['type', 'ind', 'redo', 'fix', 'res'],
    sys: ['type', 'ind', 'today', 'sysf', 'res'],
    auto: ['type', 'ind', 'auto', 'res'],
    idk: ['type', 'ind', 'desc', 'res'],
  },
  steps: {
    type: {
      label: 'Rodzaj',
      title: 'Czego potrzebujesz?',
      lead: 'Wybierz jedno. Nie wiesz? Zaznacz ostatni kafelek.',
    },
    ind: {
      label: 'Branża',
      title: 'Jaka to firma?',
      lead: 'Dopasujemy podgląd, możliwości i podpowiedzi do branży.',
    },
    have: {
      label: 'Co już masz',
      title: 'Co już masz?',
      lead: 'Zaznacz wszystko, co pasuje. Brakujące rzeczy pomożemy przygotować.',
    },
    feat: {
      label: 'Co ma umieć',
      title: 'Co strona ma umieć?',
      lead: 'Najczęstsze możliwości dla tego rodzaju strony i Twojej branży. Szczegóły ustalimy w rozmowie.',
    },
    redo: {
      label: 'Twoja strona',
      title: 'Twoja obecna strona',
      lead: 'Podaj adres, sprawdzimy ją przed rozmową. Zaznacz, co masz.',
    },
    fix: {
      label: 'Co poprawić',
      title: 'Co jest dziś nie tak?',
      lead: 'Zaznacz problemy. Każdy rozwiążemy przy przebudowie.',
    },
    today: {
      label: 'Jak pracujecie',
      title: 'Jak dziś pracujecie?',
      lead: 'Od tego zależy, od czego zaczniemy.',
    },
    sysf: {
      label: 'Co ma robić',
      title: 'Co system ma robić?',
      lead: 'Zaznacz najważniejsze. Zaczniemy od tego, co najbardziej boli.',
    },
    auto: {
      label: 'Co ułatwić',
      title: 'Co ma się dziać samo?',
      lead: 'Zaznacz, co dziś robicie ręcznie.',
    },
    desc: {
      label: 'Opisz',
      title: 'Opisz po swojemu',
      lead: 'Bez nazw technologii. Napisz, co Cię męczy albo co chcesz osiągnąć.',
    },
    res: {
      label: 'Wynik',
      title: 'Gotowe. Wyślij, a odpiszemy z wyceną',
      lead: 'Dokładna cena i termin na piśmie w 1 dzień roboczy. Możesz dopisać, o co Ci chodzi.',
    },
  },
  options: {
    have: [
      {
        id: 'domena',
        label: 'Domena',
      },
      {
        id: 'logo',
        label: 'Logo',
      },
      {
        id: 'zdjecia',
        label: 'Zdjęcia',
      },
      {
        id: 'teksty',
        label: 'Teksty',
      },
      {
        id: 'stara-strona',
        label: 'Stara strona',
      },
      {
        id: 'zero',
        label: 'Zaczynamy od zera',
      },
    ],
    featByType: {
      wizytowka: [
        {
          id: 'telefon',
          label: 'Telefon i formularz',
        },
        {
          id: 'mapa',
          label: 'Mapa i godziny',
        },
        {
          id: 'opinie',
          label: 'Opinie z Google',
        },
        {
          id: 'galeria',
          label: 'Galeria zdjęć',
        },
      ],
      firmowa: [
        {
          id: 'oferta',
          label: 'Oferta na podstronach',
        },
        {
          id: 'realizacje',
          label: 'Realizacje i opinie',
        },
        {
          id: 'wycena',
          label: 'Formularz wyceny',
        },
        {
          id: 'blog',
          label: 'Blog lub aktualności',
        },
        {
          id: 'jezyki',
          label: 'Wersje językowe',
        },
      ],
      rozbudowana: [
        {
          id: 'poradnik',
          label: 'Blog i poradnik',
        },
        {
          id: 'jezyki',
          label: 'Wersje językowe',
        },
        {
          id: 'role',
          label: 'Role w panelu',
        },
        {
          id: 'wyszukiwarka',
          label: 'Wyszukiwarka',
        },
        {
          id: 'strefa',
          label: 'Strefa dla klientów',
        },
      ],
      landing: [
        {
          id: 'google',
          label: 'Kampania w Google',
        },
        {
          id: 'facebook',
          label: 'Kampania na Facebooku',
        },
        {
          id: 'kalkulator',
          label: 'Kalkulator lub formularz',
        },
        {
          id: 'pytania',
          label: 'Opinie i pytania',
        },
      ],
    },
    redo: [
      {
        id: 'domena',
        label: 'Mam dostęp do domeny',
      },
      {
        id: 'tresci',
        label: 'Mam treści do przeniesienia',
      },
      {
        id: 'logo',
        label: 'Mam logo i zdjęcia',
      },
      {
        id: 'dostepy',
        label: 'Nie wiem, kto ma dostępy',
      },
    ],
    fix: [
      {
        id: 'wolna',
        label: 'Wolno się ładuje',
      },
      {
        id: 'telefon',
        label: 'Źle wygląda na telefonie',
      },
      {
        id: 'google',
        label: 'Nikt nie dzwoni z Google',
      },
      {
        id: 'tresci',
        label: 'Trudno zmienić treści',
      },
      {
        id: 'wyglad',
        label: 'Przestarzały wygląd',
      },
      {
        id: 'bezpieczenstwo',
        label: 'Boję się o bezpieczeństwo',
      },
    ],
    today: [
      {
        id: 'excel',
        label: 'Excel i arkusze',
      },
      {
        id: 'papier',
        label: 'Papier i zeszyt',
      },
      {
        id: 'program',
        label: 'Gotowy program, który nie wystarcza',
      },
      {
        id: 'maile',
        label: 'Maile i telefony',
      },
      {
        id: 'start',
        label: 'Dopiero zaczynamy',
      },
    ],
    sysf: [
      {
        id: 'zamowienia',
        label: 'Zamówienia i zlecenia',
      },
      {
        id: 'klienci',
        label: 'Klienci i oferty',
      },
      {
        id: 'kalendarz',
        label: 'Kalendarz i rezerwacje',
      },
      {
        id: 'czas',
        label: 'Czas pracy',
      },
      {
        id: 'magazyn',
        label: 'Magazyn i stany',
      },
      {
        id: 'faktury',
        label: 'Faktury do programu',
      },
      {
        id: 'raporty',
        label: 'Raporty dla szefa',
      },
      {
        id: 'aplikacja',
        label: 'Aplikacja dla pracowników',
      },
    ],
    sizes: [
      {
        id: '1-3',
        label: '1–3 osoby',
      },
      {
        id: '4-10',
        label: '4–10 osób',
      },
      {
        id: '11-30',
        label: '11–30 osób',
      },
      {
        id: '30-plus',
        label: 'ponad 30 osób',
      },
    ],
    auto: [
      {
        id: 'sms',
        label: 'SMS-y i e-maile do klientów',
      },
      {
        id: 'faktury',
        label: 'Faktury bez przepisywania',
      },
      {
        id: 'raporty',
        label: 'Raporty dla szefa',
      },
      {
        id: 'ai',
        label: 'Odpowiedzi AI na zapytania',
      },
      {
        id: 'platnosci',
        label: 'Przypomnienia o płatnościach',
      },
    ],
    prog: [
      {
        id: 'faktury',
        label: 'Subiekt lub inny program do faktur',
      },
      {
        id: 'excel',
        label: 'Excel',
      },
      {
        id: 'poczta',
        label: 'Gmail lub Outlook',
      },
      {
        id: 'system',
        label: 'Własny system',
      },
      {
        id: 'nie-wiem',
        label: 'Nie wiem',
      },
    ],
    desc: [
      {
        id: 'brak-strony',
        label: 'Nie mamy strony',
      },
      {
        id: 'excel',
        label: 'Wszystko jest w Excelu',
      },
      {
        id: 'strona',
        label: 'Strona nic nie daje',
      },
      {
        id: 'informatyk',
        label: 'Informatyk zniknął',
      },
      {
        id: 'przepisywanie',
        label: 'Za dużo przepisywania',
      },
      {
        id: 'start',
        label: 'Nie wiem, od czego zacząć',
      },
    ],
  },
  exclusive: {
    have: 'zero',
  },
  industries: [
    {
      key: 'nocleg',
      name: 'Pensjonat, hotel, apartamenty',
      icon: 'M3 18V8M3 14h18v4M21 18v-4a3 3 0 0 0-3-3h-7v3M7.5 11a1.5 1.5 0 1 0 0-.01',
      site: 'pensjonat',
      system: 'crm',
      features: [
        {
          id: 'nocleg-1',
          label: 'Zapytanie o termin bez prowizji portalu',
        },
        {
          id: 'nocleg-2',
          label: 'Pokoje z galerią i cenami',
        },
      ],
    },
    {
      key: 'gastro',
      name: 'Restauracja, bar, kawiarnia',
      icon: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9',
      site: 'restauracja',
      system: 'zamowienia',
      features: [
        {
          id: 'gastro-1',
          label: 'Menu, które zmieniasz w minutę',
        },
        {
          id: 'gastro-2',
          label: 'Rezerwacja stolika online',
        },
      ],
    },
    {
      key: 'bud',
      name: 'Budowlanka i remonty',
      icon: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5',
      site: 'budowlanka',
      system: 'czas',
      features: [
        {
          id: 'bud-1',
          label: 'Realizacje z opisem i zdjęciami',
        },
        {
          id: 'bud-2',
          label: 'Formularz bezpłatnej wyceny',
        },
      ],
    },
    {
      key: 'turyst',
      name: 'Turystyka i atrakcje',
      icon: 'M3 19l6-9 4 6 3-4 5 7z',
      site: 'turystyka',
      system: 'crm',
      features: [
        {
          id: 'turyst-1',
          label: 'Wolne terminy i rezerwacja',
        },
        {
          id: 'turyst-2',
          label: 'Strona w 3 językach',
        },
      ],
    },
    {
      key: 'uroda',
      name: 'Uroda i zdrowie',
      icon: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
      site: 'uroda',
      system: 'crm',
      features: [
        {
          id: 'uroda-1',
          label: 'Rezerwacja wizyt 24/7',
        },
        {
          id: 'uroda-2',
          label: 'Przypomnienia SMS',
        },
      ],
    },
    {
      key: 'moto',
      name: 'Warsztat i motoryzacja',
      icon: 'M5 16h14M6 16l1.5-5h9L18 16M5 16v3M19 16v3M8 13.5h.01M16 13.5h.01',
      site: 'warsztat',
      system: 'zamowienia',
      features: [
        {
          id: 'moto-1',
          label: 'Umawianie wizyt online',
        },
        {
          id: 'moto-2',
          label: 'Status naprawy w SMS',
        },
      ],
    },
    {
      key: 'handel',
      name: 'Sklep i handel',
      icon: 'M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0',
      site: 'sklep',
      system: 'excel',
      features: [
        {
          id: 'handel-1',
          label: 'Asortyment i promocje',
        },
        {
          id: 'handel-2',
          label: 'Godziny i dojazd do sklepów',
        },
      ],
    },
    {
      key: 'biuro',
      name: 'Biuro i usługi dla firm',
      icon: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
      site: 'biuro',
      system: 'crm',
      features: [
        {
          id: 'biuro-1',
          label: 'Konsultacja online',
        },
        {
          id: 'biuro-2',
          label: 'Czytelna oferta i cennik',
        },
      ],
    },
    {
      key: 'prod',
      name: 'Produkcja i rzemiosło',
      icon: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z',
      site: 'produkcja',
      system: 'excel',
      features: [
        {
          id: 'prod-1',
          label: 'Katalog produktów',
        },
        {
          id: 'prod-2',
          label: 'Zapytanie ofertowe B2B',
        },
      ],
    },
    {
      key: 'inna',
      name: 'Inna firma',
      icon: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
      site: 'firmowa',
      system: 'zamowienia',
      features: [],
    },
  ],
  tips: [
    {
      when: {
        groups: ['site'],
        has: {
          have: ['zero'],
        },
      },
      text: 'Zaczynamy od zera? Pomożemy z domeną, logo i tekstami. Ustalimy to na krótkiej rozmowie.',
    },
    {
      when: {
        groups: ['site'],
        picked: ['have'],
        lacks: {
          have: ['teksty'],
        },
      },
      text: 'Nie masz tekstów? Napiszemy je po 20-minutowej rozmowie o Twojej firmie.',
    },
    {
      when: {
        types: ['wizytowka', 'firmowa'],
        industries: ['nocleg'],
      },
      text: 'Dla obiektu noclegowego kluczowe jest zapytanie o termin bez prowizji portalu. Dodamy je.',
    },
    {
      when: {
        types: ['landing'],
      },
      text: 'Landing najlepiej działa z kampanią reklamową. Pomożemy ją ustawić i policzyć zgłoszenia.',
    },
    {
      when: {
        groups: ['site'],
      },
      text: 'W cenie każdej strony: wersja na telefon, podstawowe SEO, panel po polsku, SSL i szybkość poniżej 2,5 s.',
    },
    {
      when: {
        groups: ['redo'],
        has: {
          fix: ['google'],
        },
      },
      text: 'Zaczniemy od darmowego audytu: sprawdzimy, dlaczego Google nie przyprowadza klientów.',
    },
    {
      when: {
        groups: ['redo'],
        has: {
          redo: ['dostepy'],
        },
      },
      text: 'Spokojnie, to częste. Odzyskamy dostęp do domeny i serwera, zanim cokolwiek zmienimy.',
    },
    {
      when: {
        groups: ['redo'],
      },
      text: 'Stare adresy przekierujemy na nowe, więc nie stracisz pozycji w Google.',
    },
    {
      when: {
        groups: ['sys'],
        has: {
          today: ['program'],
        },
      },
      text: 'Najpierw sprawdzimy, czy Twój program da się rozbudować. Czasem to taniej niż nowy system.',
    },
    {
      when: {
        groups: ['sys'],
        sizes: ['1-3'],
      },
      text: 'Na start wystarczy jeden moduł. Kolejne dołożymy, gdy firma urośnie.',
    },
    {
      when: {
        groups: ['sys'],
      },
      text: 'Zaczynamy od modułu, który najbardziej boli. Działa po 2–3 tygodniach, płacisz po odbiorze.',
    },
    {
      when: {
        groups: ['auto'],
        has: {
          auto: ['ai'],
        },
      },
      text: 'Asystent AI tylko szykuje odpowiedzi. Nic nie wychodzi bez Twojego kliknięcia.',
    },
    {
      when: {
        groups: ['auto'],
      },
      text: 'Najpierw testujemy na Twoich danych. Każda wiadomość i faktura ma historię.',
    },
    {
      when: {
        groups: ['idk'],
      },
      text: 'Nie musisz znać nazw. Opisz, co Cię męczy. Powiemy uczciwie, co się opłaca. Czasem: nic nie budować.',
    },
    {
      text: 'Po 5–7 dniach klikasz podgląd. Dopiero wtedy decydujesz, czy ruszamy.',
    },
  ],
  preview: [
    {
      when: {
        groups: ['redo'],
      },
      kind: 'before',
      variant: 'przebudowa',
    },
    {
      when: {
        groups: ['sys'],
      },
      kind: 'dash',
      variant: 'zamowienia',
      fromIndustry: 'system',
    },
    {
      when: {
        groups: ['auto'],
        has: {
          auto: ['ai'],
        },
      },
      kind: 'flow',
      variant: 'ai',
    },
    {
      when: {
        groups: ['auto'],
        has: {
          auto: ['faktury'],
        },
      },
      kind: 'flow',
      variant: 'faktury',
    },
    {
      when: {
        groups: ['auto'],
        has: {
          auto: ['raporty'],
        },
      },
      kind: 'flow',
      variant: 'raporty',
    },
    {
      when: {
        groups: ['auto'],
      },
      kind: 'flow',
      variant: 'sms',
    },
    {
      when: {
        types: ['landing'],
      },
      kind: 'site',
      variant: 'landing',
    },
    {
      when: {
        anyIndustry: true,
      },
      kind: 'site',
      variant: 'firmowa',
      fromIndustry: 'site',
    },
    {
      when: {
        types: ['wizytowka'],
      },
      kind: 'site',
      variant: 'wizytowka',
    },
    {
      when: {
        types: ['rozbudowana'],
      },
      kind: 'site',
      variant: 'rozbudowana',
    },
    {
      kind: 'site',
      variant: 'firmowa',
    },
  ],
  inPrice: {
    title: 'W cenie każdej strony',
    items: [
      'wersja na telefon',
      'podstawowe SEO',
      'panel po polsku',
      'certyfikat SSL',
      'szybkość poniżej 2,5 s',
    ],
  },
  summary: {
    type: 'Rodzaj',
    industry: 'Branża',
    have: 'Masz już',
    feat: 'Ma umieć',
    redo: 'Twoja strona',
    fix: 'Do poprawy',
    today: 'Dziś',
    sysf: 'System ma',
    size: 'Użytkownicy',
    auto: 'Automaty',
    prog: 'Programy',
    desc: 'Temat',
    url: 'Adres strony',
  },
  ui: {
    eyebrow: 'Kreator · 60 sekund',
    title: 'Policz swój projekt.',
    em: 'Bez dzwonienia.',
    lead: 'Pytamy tylko o to, co ważne dla Twojego wyboru. Cena i podpowiedź zmieniają się na żywo. Resztę napiszesz po swojemu.',
    back: '← Wstecz',
    skip: 'Pomiń',
    next: 'Dalej →',
    showResult: 'Pokaż wynik →',
    restart: 'Zacznij od nowa',
    live: 'Twój projekt na żywo',
    stepOf: 'krok {n} z {m}',
    tipLabel: 'Podpowiedź',
    fullOffer: 'Zobacz pełną ofertę →',
    sizeQ: 'Ile osób będzie z niego korzystać?',
    progQ: 'Z jakich programów korzystacie?',
    descPick: 'Albo kliknij, co pasuje:',
    descPlaceholder: 'Np. zamówienia przychodzą mailem i ciągle coś ginie…',
    urlLabel: 'Adres obecnej strony',
    urlPlaceholder: 'np. twojafirma.pl',
  },
  page: {
    title: 'Zobacz cenę i termin,',
    em: 'zanim zadzwonisz.',
    lead: 'Kilka kliknięć dopasowanych do tego, co wybierzesz. Bez rejestracji i bez dodatków na siłę. Kontakt zostawiasz tylko wtedy, gdy chcesz wycenę na piśmie.',
    stepsTitle: 'Cztery kroki do startu',
    steps: [
      {
        title: 'Odpowiadamy',
        text: 'W 1 dzień roboczy dzwonimy albo odpisujemy, jak wolisz.',
      },
      {
        title: 'Krótka rozmowa',
        text: '30 minut u Ciebie w firmie, w Rabce-Zdroju albo online.',
      },
      {
        title: 'Podgląd i wycena',
        text: 'Po 5–7 dniach klikasz podgląd. Wycena na piśmie, ważna 30 dni.',
      },
      {
        title: 'Ty decydujesz',
        text: '30% po podpisaniu umowy, reszta po odbiorze albo po etapach.',
      },
    ],
  },
  send: {
    noteLabel: 'Coś jeszcze? Napisz po swojemu',
    notePlaceholder: 'Twoje słowa: co jest najważniejsze, termin, pytania…',
    name: {
      label: 'Imię i nazwa firmy',
      placeholder: 'Imię i nazwa firmy',
    },
    contact: {
      label: 'E-mail albo telefon',
      placeholder: 'E-mail albo telefon',
      error: 'Wpisz telefon albo adres e-mail.',
    },
    errors: {
      consent: 'Zaznacz zgodę, bez niej nie możemy odpowiedzieć.',
    },
    button: 'Wyślij do wyceny →',
    messageTemplate: 'Kreator: {rodzaj}',
  },
  priceDisplay: {
    template: 'od {cena} zł netto',
    short: 'od {cena} zł',
    monthTemplate: 'od {cena} zł / mies.',
    levelMonthTemplate: '{cena} zł / mies.',
    fallback: 'Zapytaj o wycenę',
    termFallback: 'po krótkiej rozmowie',
    priceSub: 'netto · stała cena za zakres',
    moreHint:
      'Dodatki wycenimy w 5–7 dni. Cena „od” to podstawa, dopłatę za dodatki zobaczysz w wycenie.',
    moreSelectedNote:
      'Dodatki wycenimy w 5–7 dni. Cena „od” to podstawa, dopłatę za dodatki zobaczysz w wycenie.',
    noPrice: {
      price: 'Zapytaj o wycenę',
      term: 'po krótkiej rozmowie',
      priceSub: 'cena w 5–7 dni',
      termSub: 'cenę i termin dostaniesz w 5–7 dni',
      mobileBar: 'Zapytaj o wycenę',
    },
    scopeIntro: 'Tyle kosztuje podstawa.',
  },
}

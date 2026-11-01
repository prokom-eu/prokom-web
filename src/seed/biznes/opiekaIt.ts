import type { PageBlock } from './page'

export const OPIEKA_IT_SLUG = 'opieka-it'

/**
 * `/opieka-it` of the Biznes line (spec. §6.4, plansza Dzial) — texts of the board 1:1.
 * Links go to the anchors of this page as paths (`/opieka-it#kontakt` — the link fields take
 * paths, not bare `#…`); `#przeglad` is linked from the top bar and the footer too.
 */
export function biznesOpiekaItLayout(): PageBlock[] {
  return [
    {
      blockType: 'bzPageHero',
      pill: 'Opieka IT · abonament dla firm i instytucji',
      heading: 'Informatyk, który zna Twoją firmę. Na telefon, w abonamencie.',
      lead: 'Komputery, serwer, sieć, kopie, poczta, kasy i POS — pod jedną opieką, z czasem reakcji zapisanym w umowie. Pomoc zdalna i serwisant z Rabki. Od jednego stanowiska po kilka lokalizacji z serwerem.',
      primary: { label: 'Umów bezpłatny przegląd IT', href: '/opieka-it#przeglad' },
      secondary: { label: 'Pytania przed umową', href: '/opieka-it#faq' },
      chips: [
        { text: 'Czas reakcji w umowie' },
        { text: 'Jeden opiekun' },
        { text: 'Stała miesięczna opłata' },
        { text: 'Kasy, POS i serwer w tym samym zgłoszeniu' },
      ],
      variant: 'card',
      card: {
        eyebrow: 'Jak to działa',
        title: 'Jedna stała opłata miesięczna. Zakres i czas reakcji w umowie.',
        steps: [
          {
            title: 'Bezpłatny przegląd IT',
            text: 'u Ciebie w firmie: sprzęt, sieć, kopie, bezpieczeństwo, licencje. Raport jest Twój.',
          },
          {
            title: 'Umowa dopasowana do firmy',
            text: 'od jednego stanowiska po kilka lokalizacji z serwerem. Czas reakcji zapisany, godziny robocze, bez „godzin na fakturze”.',
          },
          {
            title: 'Przejęcie bez przestoju',
            text: 'porządkujemy dostępy, uruchamiamy monitoring i kopie, przenosimy dokumentację.',
          },
          {
            title: 'Opieka',
            text: 'zgłoszenia telefonem lub mailem; monitoring i raport z opieki; kasy i POS w tym samym zgłoszeniu.',
          },
        ],
        button: { label: 'Umów bezpłatny przegląd IT', href: '/opieka-it#kontakt' },
      },
    },
    {
      blockType: 'bzMonitoring',
      eyebrow: 'Opieka informatyczna dla firm',
      heading: 'Widzimy problemy, zanim Ty je zauważysz.',
      text: 'Stała opieka IT dla firm bez własnego informatyka. Pilnujemy komputerów, serwera, kopii i zabezpieczeń — a gdy coś się dzieje, reagujemy zdalnie albo przyjeżdżamy z Rabki.',
      points: [
        { text: 'Monitoring komputerów, serwera i kopii', icon: 'monitor' },
        { text: 'Pomoc zdalna od ręki, dojazd z Rabki', icon: 'remote' },
        { text: 'Przypomnienia o przeglądach kas i licencjach', icon: 'bell' },
        { text: 'Stała opłata, zakres i czas reakcji w umowie', icon: 'wallet' },
      ],
      primary: { label: 'Umów bezpłatny przegląd IT', href: '/opieka-it#kontakt' },
      secondary: { label: 'Pytania przed umową', href: '/opieka-it#faq' },
      panel: {
        title: 'Panel opieki PRO-KOM',
        subtitle: 'Przykładowa firma · 12 stanowisk · serwer · 2 kasy',
        status: 'Wszystko działa',
        kpis: [
          { label: 'Ostatnia kopia', value: 'dziś 02:00' },
          { label: 'Ochrona ESET', value: '12 / 12' },
          { label: 'Zgłoszenia w miesiącu', value: '3 / 3' },
        ],
        rows: [
          {
            title: 'Serwer Dell PowerEdge',
            detail: 'dysk 62% · temperatura w normie',
            icon: 'server',
            state: 'ok',
            stateLabel: 'Działa',
          },
          {
            title: 'Aktualizacje Windows',
            detail: 'zainstalowane w nocy na 4 komputerach',
            icon: 'monitor',
            state: 'ok',
            stateLabel: 'Gotowe',
          },
          {
            title: 'Przegląd kasy Posnet',
            detail: 'za 43 dni · przypomnimy i umówimy',
            icon: 'cal',
            state: 'planned',
            stateLabel: 'Zaplanowane',
          },
          {
            title: 'Licencja Microsoft 365',
            detail: 'kończy się za 14 dni · już zamówiona',
            icon: 'doc',
            state: 'wip',
            stateLabel: 'W toku',
          },
          {
            title: 'UPS w serwerowni',
            detail: 'bateria sprawna · test zaliczony',
            icon: 'bolt',
            state: 'ok',
            stateLabel: 'Działa',
          },
        ],
        logLabel: 'Podgląd',
        log: [
          { time: '08:02', text: 'Kopia zapasowa serwera wykonana i sprawdzona' },
          { time: '08:14', text: 'Zainstalowano aktualizacje na 4 komputerach' },
          { time: '09:31', text: 'ESET zablokował podejrzany załącznik w poczcie' },
        ],
        note: 'Panel poglądowy — tak widzimy stan Twojej firmy, a Ty dostajesz z tego raport.',
      },
    },
    {
      blockType: 'bzDowntimeCalc',
      eyebrow: 'Ile kosztuje przestój',
      heading: 'Opieka IT kosztuje mniej niż jedna awaria w sezonie.',
      kicker: 'Policz sam',
      title: 'Ile kosztuje Cię godzina, gdy coś stanie?',
      text: 'Kasa, terminal albo internet przestają działać w najgorszym momencie. Wpisz swoje liczby — zobacz, ile kosztuje jedna awaria.',
      revenueLabel: 'Dzienny utarg',
      hoursLabel: 'Ile godzin dziennie pracujesz?',
      outageLabel: 'Ile trwa awaria bez szybkiej pomocy?',
      resultKicker: 'Tyle może kosztować jedna awaria',
      cta: { label: 'Umów bezpłatny przegląd — zanim coś stanie', href: '/opieka-it#kontakt' },
      note: 'Wyliczenie orientacyjne: Twój dzienny utarg ÷ godziny otwarcia × czas przestoju. Liczby zostają w Twojej przeglądarce.',
    },
    {
      blockType: 'bzCards',
      eyebrow: 'Co dostajesz',
      heading: 'Nie „informatyk od awarii”. Opieka, która zapobiega awariom.',
      surface: 'muted',
      columns: '4',
      tone: 'accent',
      // TODO(krystian): [SZEF] obietnice: „Monitoring 24/7” przy pomocy pn–pt 9–17,
      // „Autoryzowany serwis Posnet i Elzab”, „Backup 3-2-1 na Synology”.
      cards: [
        {
          title: 'Pomoc zdalna i telefon',
          icon: 'check',
          text: 'Bezpieczne połączenie zdalne, problem rozwiązany w trakcie rozmowy. Pn–pt 9–17; dyżur w sezonie do ustalenia w umowie.',
        },
        {
          title: 'Monitoring 24/7',
          icon: 'check',
          text: 'Dyski, kopie, antywirus, aktualizacje, serwer, UPS. Widzimy awarię, zanim zobaczysz ją Ty.',
        },
        {
          title: 'Kopie, które się odtwarzają',
          icon: 'check',
          text: 'Backup 3-2-1 na Synology i poza firmą. Test odtworzenia w kalendarzu, nie „kiedyś”.',
        },
        {
          title: 'Aktualizacje i ESET',
          icon: 'check',
          text: 'Windows, Microsoft 365, programy branżowe i antywirus z jednej konsoli — bez pytania „a kiedy to się zrobi”.',
        },
        {
          title: 'Kasy, POS i terminale',
          icon: 'check',
          text: 'To samo zgłoszenie, ten sam serwisant. Autoryzowany serwis Posnet i Elzab w tej samej firmie.',
        },
        {
          title: 'Poczta i Microsoft 365',
          icon: 'check',
          text: 'Konta, MFA, nowy pracownik rano ma działającą pocztę i dostęp; odchodzący traci go tego samego dnia.',
        },
        {
          title: 'Sieć i Wi-Fi Ubiquiti',
          icon: 'check',
          text: 'Goście osobno od kas, VPN do biura, monitoring sieci z Rabki. Jeden panel, zero abonamentów.',
        },
        {
          title: 'Dokumentacja i raport',
          icon: 'check',
          text: 'Paszport IT firmy (sprzęt, licencje, hasła, umowy) i raport miesięczny: incydenty, kopie, luki, plan na kolejny miesiąc.',
        },
      ],
    },
    {
      blockType: 'bzAudit',
      // TODO(krystian): [SZEF] zakres przeglądu i wzór raportu (spec. §6.4 pkt 5).
      badgeValue: '0 zł',
      badgeLabel: 'Bezpłatny przegląd IT',
      heading: 'Sprawdzimy Twoją firmę,',
      headingAccent: 'zanim coś stanie.',
      lead: 'Jak przegląd auta przed sezonem — tylko dla komputerów, kasy, sieci i danych. **Przyjeżdżamy albo łączymy się zdalnie, sprawdzamy całość i zostawiamy raport na piśmie.** Ty decydujesz, co dalej.',
      needs: [
        {
          // TODO(krystian): [SZEF] treść i data KSeF do korekty przed publikacją (ZMIANY-v20 §5:
          // „KSeF od 1 stycznia 2027” jest nieścisły) — jak kafel na stronie głównej.
          title: 'KSeF od 1 stycznia 2027',
          icon: 'doc',
          text: 'Sprawdzimy program, uprawnienia i certyfikat, zanim zacznie się pośpiech.',
          countdownTo: '2027-01-01T00:00:00.000Z',
        },
        {
          title: 'Kopia, której nikt nie odtworzył',
          icon: 'server',
          text: 'to tylko nadzieja. Sprawdzamy, czy dane naprawdę da się odzyskać.',
        },
        {
          title: 'Terminy, które łatwo przegapić',
          icon: 'cal',
          text: 'Przegląd kasy, licencje, podpis — zbieramy je w jednym kalendarzu.',
        },
      ],
      steps: [
        { title: 'Umawiasz termin', text: 'telefonicznie albo przez formularz' },
        {
          title: 'Przegląd u Ciebie lub zdalnie',
          text: 'sprawdzamy całość, nie tylko jeden komputer',
        },
        { title: 'Raport na piśmie', text: 'i rozmowa: co pilne, co może poczekać' },
      ],
      cta: { label: 'Umów bezpłatny przegląd', href: '/opieka-it#kontakt' },
      showPhone: true,
      guarantees: [
        { text: '0 zł' },
        { text: 'Bez zobowiązań' },
        { text: 'Raport zostaje u Ciebie' },
        { text: 'Mówimy też, czego nie musisz kupować' },
      ],
      report: {
        tag: 'Przykładowy raport',
        title: 'Raport z przeglądu IT',
        subtitle: 'Przykładowa firma · 8 stanowisk · serwer · 2 kasy',
        rows: [
          {
            title: 'Komputery i dyski',
            detail: 'sprawne · 1 dysk do wymiany wkrótce',
            icon: 'monitor',
            state: 'watch',
            stateLabel: 'do obserwacji',
          },
          {
            title: 'Kopie danych',
            detail: 'kopia jest — nikt nie sprawdził odtworzenia',
            icon: 'server',
            state: 'urgent',
            stateLabel: 'pilne',
          },
          {
            title: 'Antywirus i aktualizacje',
            detail: '2 komputery bez aktualizacji',
            icon: 'shield',
            state: 'urgent',
            stateLabel: 'pilne',
          },
          {
            title: 'Sieć i Wi-Fi',
            detail: 'goście w tej samej sieci co kasa',
            icon: 'compass',
            state: 'fix',
            stateLabel: 'do poprawy',
          },
          {
            title: 'Kasa i terminal',
            detail: 'przegląd kasy za 2 miesiące',
            icon: 'wallet',
            state: 'term',
            stateLabel: 'termin',
          },
          {
            title: 'KSeF i programy',
            detail: 'program gotowy · brak uprawnień księgowej',
            icon: 'doc',
            state: 'fix',
            stateLabel: 'do poprawy',
          },
          {
            title: 'Licencje i terminy',
            detail: 'Microsoft 365, podpis — w porządku',
            icon: 'cal',
            state: 'ok',
            stateLabel: 'OK',
          },
          {
            title: 'Hasła i dostępy',
            detail: 'konta byłych pracowników aktywne',
            icon: 'users',
            state: 'urgent',
            stateLabel: 'pilne',
          },
        ],
        planTitle: 'Plan działań: najpierw kopie, aktualizacje i dostępy',
        planNote: 'Wycena poprawek na życzenie — bez zobowiązań.',
        signature: 'Twój opiekun',
        stamp: 'Sprawdzone',
        floatValue: '0 zł',
        floatText: 'bez zobowiązań',
      },
    },
    {
      blockType: 'faq',
      eyebrow: 'Pytania przed umową',
      heading: '10 pytań, które warto zadać każdemu informatykowi. Nam też.',
      lead: 'Odpowiadamy tak, jak chcielibyśmy, żeby odpowiedziano nam.',
      items: [
        {
          question: 'Co dokładnie jest w abonamencie, a za co dopłacę?',
          answer:
            'Zakres zapisujemy w umowie: pomoc zdalna i telefoniczna, monitoring, aktualizacje, ochrona ESET, kopie zapasowe, wizyty na miejscu i dokumentacja. Osobno płacisz za sprzęt, części, licencje i wdrożenia (np. nowy serwer, KSeF) — zawsze z wyceną przed rozpoczęciem.',
        },
        {
          question: 'Jaki jest gwarantowany czas reakcji? Reakcja to naprawa?',
          answer:
            'Reakcja to kontakt technika i rozpoczęcie pracy w czasie zapisanym w umowie (godziny robocze), dopasowanym do firmy. Naprawa zależy od usterki; w umowie opisujemy, co robimy, gdy nie da się naprawić od ręki — np. sprzęt zastępczy.',
        },
        {
          // TODO(krystian): numer telefonu wpisany w treść — po zmianie w Ustawieniach poprawić też tu.
          question: 'Jak zgłaszam problem i czy widzę, co się z nim dzieje?',
          answer:
            'Telefon 889 003 889 albo e-mail. Każde zgłoszenie ma osobę, która je prowadzi, a historia trafia do dokumentacji Twojej firmy — z niej powstaje raport z opieki.',
        },
        {
          question: 'Mam już informatyka. Jak wygląda przejęcie?',
          answer:
            'Prosimy o dostępy i dokumentację, przez okres przejściowy pracujemy równolegle, porządkujemy hasła i uprawnienia, uruchamiamy monitoring. Nic nie wyłączamy, dopóki nie działa nowe.',
        },
        {
          question: 'Jak zabezpieczacie moje dane podczas pomocy zdalnej?',
          answer:
            'Połączenie szyfrowane, za każdym razem za Twoją zgodą, z logiem sesji. Podpisujemy umowę powierzenia danych (RODO). Hasła trzymamy w menedżerze, nie w mailu.',
        },
        {
          question: 'Jak często robicie kopie i czy sprawdzacie, że działają?',
          answer:
            'Automatycznie, według harmonogramu ustalonego z Tobą — w firmie i poza nią. Regularnie odtwarzamy dane testowo i pokazujemy, że wracają.',
        },
        {
          question: 'Czy obsługujecie moje programy branżowe i kasy?',
          answer:
            'Tak: InsERT, Insoft PC-Market, GoPOS, NFHotel, Microsoft 365, ESET, programy Posnet i Elzab. Kasy i terminale obsługuje ten sam serwis — nie odsyłamy do „producenta”.',
        },
        {
          question: 'Okres wypowiedzenia i co się dzieje z dokumentacją po umowie?',
          answer:
            'Okres umowy i wypowiedzenia ustalamy indywidualnie i zapisujemy w umowie. Dokumentacja, hasła i kopie są Twoje — przekazujemy komplet w dniu zakończenia.',
        },
        {
          question: 'Czy macie zastępstwo, gdy opiekun jest na urlopie?',
          answer:
            'Tak. Dokumentacja Twojej firmy jest wspólna dla zespołu, więc zastępstwo zna sytuację. Numer telefonu się nie zmienia.',
        },
        {
          question: 'Czy pomożecie przy KSeF i dofinansowaniach?',
          answer:
            'Tak. KSeF wdrażamy jako osobną usługę. Przy dofinansowaniach dla szkół i instytucji (Cyfrowy Uczeń, PUP, budżety gmin) przygotowujemy specyfikację, kosztorys i dokumenty do rozliczenia.',
        },
      ],
    },
    {
      blockType: 'bzCards',
      eyebrow: 'Z tego samego działu',
      heading: 'Doradztwo, serwery, szkolenia',
      surface: 'muted',
      columns: '3',
      tone: 'accent',
      cards: [
        {
          title: 'Doradztwo IT i dobór sprzętu',
          text: 'Zanim kupisz: serwer czy NAS, Microsoft 365 czy licencje, ile stanowisk, jaka sieć. Dostajesz specyfikację, którą możesz dać komukolwiek do wyceny — i tak ją wygramy jakością obsługi.',
          link: { label: 'Umów rozmowę', href: '/opieka-it#kontakt' },
        },
        {
          title: 'Serwery i wirtualizacja',
          text: 'Windows Server, domena i uprawnienia, pulpit zdalny, serwer plików, wirtualizacja, serwerownia z UPS. Projekt, montaż, migracja danych ze starego serwera i szkolenie zespołu.',
          link: { label: 'Serwer dla firmy', href: '/opieka-it#kontakt' },
        },
        {
          title: 'Szkolenia zespołu',
          text: 'Kasy i POS, programy sprzedażowe, Microsoft 365, serwer i pulpit zdalny, bezpieczeństwo i phishing. Na Waszych danych, w Waszej firmie. Także dla nowych pracowników.',
          link: { label: 'Zapytaj o szkolenie', href: '/opieka-it#kontakt' },
        },
      ],
    },
    {
      blockType: 'bzContact',
      heading: 'Zacznijmy od bezpłatnego przeglądu IT.',
      lead: 'Przegląd u Ciebie w firmie, raport i rekomendacja. Bez zobowiązań — raport jest Twój, nawet jeśli wybierzesz kogoś innego.',
      formHeading: 'Formularz zapytania',
      formNote: 'Pola z gwiazdką są wymagane. Resztę dopiszemy razem przez telefon.',
      // TODO(krystian): [SZEF] obietnica „60 min” — ta sama co w Ustawieniach strony (spec. §13).
      promises: [
        // Short as in the v20 form panel (30 characters); the board's long ones are the old form.
        { text: 'Odpowiedź w 60 min' },
        { text: 'Wycena na piśmie' },
        { text: 'Bez spamu i newslettera' },
      ],
      successText:
        'Oddzwonimy w ciągu 60 minut w godzinach pracy. Poza godzinami pracy odezwiemy się następnego dnia roboczego rano.',
    },
  ]
}

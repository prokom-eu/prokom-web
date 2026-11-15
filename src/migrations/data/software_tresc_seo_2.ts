/**
 * Frozen Software texts of SEO etap 2 for the migration `software_tresc_seo_2` — a copy of the
 * seed as of 14.11.2026 (`seed/prokomsoftware/miejscowosci.json` → `cityData`, PR #573;
 * `src/seed/software/solutionPageTexts.ts`, PR #576). Never import the seed here: the migration
 * must give the same result after the seed changes. Solutions in the city cards are slugs, the
 * migration finds their ids in the tenant.
 */

export const CITIES_SEO_2 = {
  'nowy-targ': {
    name: 'Nowy Targ',
    slug: 'nowy-targ',
    locative: 'z Nowego Targu',
    active: true,
    hero: {
      eyebrow: 'Nowy Targ · systemy, strony, sklepy',
      title: 'Strony i systemy dla firm',
      titleAccent: 'z Nowego Targu.',
      lead: 'Nowy Targ mamy po drodze z Rabki, zakopianką. Spotykamy się u Ciebie w firmie albo w naszym salonie w Rabce, jak Ci wygodniej.',
      ctas: [
        {
          link: {
            label: 'Dobierz rozwiązanie · 60 s',
            href: '/dobierz',
          },
        },
        {
          link: {
            label: 'Napisz albo zadzwoń',
            href: '/kontakt',
          },
        },
      ],
    },
    who: {
      title: 'Stolica Podhala, **czyli handel i usługi**',
      lead: 'W Nowym Targu działają hurtownie, sklepy, firmy budowlane i transportowe. Zamówień i zleceń jest dużo, a często wszystko siedzi w Excelu i w mailach.',
      items: [
        {
          name: 'Hurtownie i handel',
          text: 'Stany, zamówienia od stałych klientów i dostawy w jednym panelu zamiast kilku arkuszy.',
          cta: 'Magazyn i zamówienia →',
          solution: 'magazyn-i-zamowienia',
        },
        {
          name: 'Budowlanka i wykończenia',
          text: 'Zlecenia, ekipy i terminy na jednym grafiku. Szef widzi, kto gdzie jest, bez dzwonienia.',
          cta: 'System zleceń i grafik →',
          solution: 'system-zlecen-i-grafik-ekip',
        },
        {
          name: 'Firmy obsługujące klientów B2B',
          text: 'Klienci, oferty i przypomnienia, do kogo zadzwonić. Żadne zapytanie nie ginie w skrzynce.',
          cta: 'CRM dla firmy →',
          solution: 'crm-dla-malej-i-sredniej-firmy',
        },
        {
          name: 'Sklepy z towarem z Podhala',
          text: 'Sklep internetowy z odbiorem na miejscu i dostawą. Zamówienia widzisz od razu w panelu.',
          cta: 'Sklep internetowy →',
          solution: 'sklep-internetowy',
        },
      ],
    },
    local: {
      title: 'Blisko, **więc bez wideokonferencji**',
      items: [
        {
          title: 'Spotkanie u Ciebie',
          text: 'Przyjeżdżamy do firmy, oglądamy, jak dziś pracujecie, i dopiero wtedy proponujemy rozwiązanie.',
        },
        {
          title: 'Najpierw jeden moduł',
          text: 'Zaczynamy od tego, co zabiera najwięcej czasu, na przykład od zamówień. Reszta dochodzi etapami.',
        },
        {
          title: 'Dane z Excela przenosimy',
          text: 'Arkusze, które dziś macie, zamieniamy w bazę. Nikt nie przepisuje ich ręcznie.',
        },
      ],
    },
    faq: [
      {
        question: 'Czy przyjedziecie do nas do Nowego Targu?',
        answer: 'Tak. To blisko, więc pierwsze spotkanie i wdrożenie robimy u Ciebie w firmie.',
      },
      {
        question: 'Mamy wszystko w Excelu. Od czego zacząć?',
        answer:
          'Od jednego procesu, który zabiera najwięcej czasu. Przenosimy jego dane do systemu, a kolejne moduły dokładamy później.',
      },
      {
        question: 'Czy system połączy się z programem do faktur?',
        answer: 'Najczęściej tak. Sprawdzamy, jaki program masz, i wyceniamy połączenie osobno.',
      },
      {
        question: 'Ile kosztuje system dla firmy w Nowym Targu?',
        answer:
          'System zleceń zaczyna się od {cena:system-zlecen-i-grafik-ekip} netto za pierwszy moduł. Ceny innych systemów stoją w cenniku, a dokładną wycenę dostajesz po rozmowie.',
      },
    ],
    nearby: [
      'Rabka-Zdrój',
      'Nowy Targ',
      'Szaflary',
      'Ludźmierz',
      'Waksmund',
      'Krauszów',
      'Czarny Dunajec',
    ],
    cta: {
      title: 'Pokaż, **jak dziś pracujecie**',
      text: 'Przyjedziemy albo wpadnij do salonu w Rabce. Wyjdziesz z pomysłem, ceną i terminem.',
      buttons: [
        {
          link: {
            label: 'Umów spotkanie',
            href: '/kontakt',
          },
        },
        {
          link: {
            label: 'Dobierz rozwiązanie',
            href: '/dobierz',
          },
        },
      ],
    },
    seo: {
      title: 'Strony i systemy Nowy Targ | PRO-KOM Software',
      description:
        'Systemy zamówień, CRM, sklepy i strony dla firm z Nowego Targu. Spotkanie w Twojej firmie, wdrożenie etapami, cena „od” przy każdym rozwiązaniu.',
    },
  },
  'mszana-dolna': {
    name: 'Mszana Dolna',
    slug: 'mszana-dolna',
    locative: 'z Mszany Dolnej',
    active: true,
    hero: {
      eyebrow: 'Mszana Dolna · strony, systemy, opieka',
      title: 'Strony i systemy dla firm',
      titleAccent: 'z Mszany Dolnej.',
      lead: 'Mszana i Rabka to sąsiedzi przez Gorce. Wpadniesz do naszego salonu przy Orkana 16B albo przyjedziemy do Ciebie, kiedy pokazanie czegoś na miejscu będzie prostsze.',
      ctas: [
        {
          link: {
            label: 'Dobierz rozwiązanie · 60 s',
            href: '/dobierz',
          },
        },
        {
          link: {
            label: 'Napisz albo zadzwoń',
            href: '/kontakt',
          },
        },
      ],
    },
    who: {
      title: 'Małe firmy, **duże potrzeby**',
      lead: 'Między Gorcami a Beskidem Wyspowym działa wiele jedno- i kilkuosobowych firm: usługi, budowlanka, agroturystyka. Potrzebują prostych narzędzi, które same działają.',
      items: [
        {
          name: 'Usługi i rzemiosło',
          text: 'Jedna strona z telefonem, cennikiem i mapą. Klient z Google od razu dzwoni albo pisze.',
          cta: 'Strona wizytówka →',
          solution: 'strona-wizytowka',
        },
        {
          name: 'Firmy remontowe i budowlane',
          text: 'Zlecenia, zdjęcia z budowy i podpis klienta w telefonie ekipy, także bez zasięgu.',
          cta: 'Aplikacja dla ekip →',
          solution: 'aplikacja-dla-ekip-w-terenie',
        },
        {
          name: 'Agroturystyka w Gorcach',
          text: 'Pokoje, okolica i zapytanie o termin. Gość pisze do Ciebie, a nie przez portal.',
          cta: 'Strona dla pensjonatu →',
          solution: 'strona-dla-hotelu-lub-pensjonatu',
        },
        {
          name: 'Firmy, które mają już starą stronę',
          text: 'Nowa, szybka strona na telefon, a stare adresy zostają, więc pozycja w Google nie znika.',
          cta: 'Przebudowa strony →',
          solution: 'przebudowa-starej-strony',
        },
      ],
    },
    local: {
      title: 'Po sąsiedzku, **więc szybko**',
      items: [
        {
          title: 'Rabka pod ręką',
          text: 'Do salonu w Rabce masz krótką drogę. Przyjedź z laptopem, a my pokażemy, jak to będzie wyglądać.',
        },
        {
          title: 'Na start bez przepłacania',
          text: 'Dla małej firmy często wystarcza wizytówka. Rozbudowujemy, gdy jest po co.',
        },
        {
          title: 'Opieka po starcie',
          text: 'Kopie, aktualizacje i poprawki robimy my, a Ty prowadzisz firmę.',
        },
      ],
    },
    faq: [
      {
        question: 'Mam jednoosobową firmę. Czy to dla mnie?',
        answer:
          'Tak. Strona wizytówka jest właśnie dla małych firm: telefon, oferta i mapa, gotowa {termin:strona-wizytowka}.',
      },
      {
        question: 'Czy przyjedziecie do Mszany?',
        answer: 'Tak, do Mszany przyjeżdżamy na spotkanie. Możesz też wpaść do salonu w Rabce.',
      },
      {
        question: 'Czy strona będzie widoczna w Google w okolicy?',
        answer:
          'Ustawiamy wszystko, co od nas zależy: dane firmy, opisy, adresy i wizytówkę Google spójne ze stroną. Pozycji nie obiecuje nikt uczciwy.',
      },
      {
        question: 'Ile kosztuje wizytówka?',
        answer:
          'Wizytówka zaczyna się od {cena:strona-wizytowka} netto. Dokładną cenę dostajesz po krótkiej rozmowie.',
      },
    ],
    nearby: [
      'Rabka-Zdrój',
      'Mszana Dolna',
      'Mszana Górna',
      'Niedźwiedź',
      'Kasinka Mała',
      'Lubomierz',
      'Olszówka',
    ],
    cta: {
      title: 'Wpadnij do **salonu w Rabce**',
      text: 'Krótka droga przez Gorce i wychodzisz z pomysłem, ceną i terminem. Bez zobowiązań.',
      buttons: [
        {
          link: {
            label: 'Umów spotkanie',
            href: '/kontakt',
          },
        },
        {
          link: {
            label: 'Dobierz rozwiązanie',
            href: '/dobierz',
          },
        },
      ],
    },
    seo: {
      title: 'Strony internetowe Mszana Dolna | PRO-KOM Software',
      description:
        'Strony wizytówki, przebudowa starych stron i aplikacje dla ekip z Mszany Dolnej i okolic Gorców. Salon w Rabce, ceny „od” w cenniku.',
    },
  },
  limanowa: {
    name: 'Limanowa',
    slug: 'limanowa',
    locative: 'z Limanowej',
    active: true,
    hero: {
      eyebrow: 'Limanowa · systemy, czas pracy, strony',
      title: 'Strony i systemy dla firm',
      titleAccent: 'z Limanowej.',
      lead: 'Do Limanowej dojeżdżamy z Rabki przez Mszanę Dolną. Pierwszą rozmowę robimy przez telefon albo wideo, a wdrożenie systemu u Ciebie na miejscu.',
      ctas: [
        {
          link: {
            label: 'Dobierz rozwiązanie · 60 s',
            href: '/dobierz',
          },
        },
        {
          link: {
            label: 'Napisz albo zadzwoń',
            href: '/kontakt',
          },
        },
      ],
    },
    who: {
      title: 'Firmy, które **zatrudniają ludzi**',
      lead: 'Produkcja, transport i usługi w Limanowej to często kilkanaście albo kilkadziesiąt osób. Godziny, urlopy i rozliczenia zjadają biuru całe dnie.',
      items: [
        {
          name: 'Zakłady i warsztaty',
          text: 'Pracownicy odbijają godziny w telefonie, urlopy są w kalendarzu, a lista do wypłaty jest gotowa sama.',
          cta: 'Czas pracy i rozliczenia →',
          solution: 'czas-pracy-i-rozliczenia',
        },
        {
          name: 'Biura, które żyją w Excelu',
          text: 'Siedem arkuszy zamieniamy w jedną bazę z uprawnieniami. Koniec z wersją „FINAL_v7”.',
          cta: 'Z Excela do systemu →',
          solution: 'z-excela-do-systemu',
        },
        {
          name: 'Serwis i obsługa zgłoszeń',
          text: 'Zgłoszenia od klientów, przydział technika i historia napraw w jednym miejscu.',
          cta: 'System serwisu →',
          solution: 'system-serwisu-i-zgloszen',
        },
        {
          name: 'Firmy bez dobrej strony',
          text: 'Oferta, realizacje i formularz, który trafia prosto do Ciebie. Treści zmieniasz sam.',
          cta: 'Strona firmowa →',
          solution: 'strona-firmowa-z-panelem',
        },
      ],
    },
    local: {
      title: 'Systemy dla firm, **wdrażane na miejscu**',
      items: [
        {
          title: 'Wdrożenie u Ciebie',
          text: 'Przyjeżdżamy na start systemu i uczymy zespół, a potem odpowiadamy na pytania zdalnie.',
        },
        {
          title: 'Uprawnienia dla każdego',
          text: 'Pracownik widzi swoje godziny, kierownik swój dział, a szef całość.',
        },
        {
          title: 'Twoje dane u Ciebie',
          text: 'Kod, panel i dane należą do firmy. Serwer w Polsce, a kopie robimy w ramach opieki.',
        },
      ],
    },
    faq: [
      {
        question: 'Czy przyjedziecie do Limanowej?',
        answer:
          'Tak, na wdrożenie i szkolenie przyjeżdżamy. Wcześniejsze rozmowy i późniejsze poprawki robimy przez telefon i zdalnie.',
      },
      {
        question: 'Czy pracownicy poradzą sobie z systemem?',
        answer:
          'System projektujemy pod Wasz sposób pracy, a nie odwrotnie. Na start robimy krótkie szkolenie na miejscu.',
      },
      {
        question: 'Czy czas pracy połączy się z programem kadrowym?',
        answer:
          'Najczęściej tak, przez eksport albo połączenie. Sprawdzamy Twój program i wyceniamy to osobno.',
      },
      {
        question: 'Ile kosztuje system czasu pracy?',
        answer:
          'Czas pracy i rozliczenia zaczyna się od {cena:czas-pracy-i-rozliczenia} netto. Dokładną cenę dostajesz po rozmowie, zależnie od liczby osób i modułów.',
      },
    ],
    nearby: ['Rabka-Zdrój', 'Limanowa', 'Mordarka', 'Męcina', 'Tymbark', 'Słopnice', 'Dobra'],
    cta: {
      title: 'Policz, **ile czasu oddasz biuru**',
      text: 'Opisz, jak dziś liczycie godziny i urlopy. Odpowiemy z pomysłem, ceną i terminem.',
      buttons: [
        {
          link: {
            label: 'Napisz do nas',
            href: '/kontakt',
          },
        },
        {
          link: {
            label: 'Dobierz rozwiązanie',
            href: '/dobierz',
          },
        },
      ],
    },
    seo: {
      title: 'Limanowa — systemy i strony dla firm | PRO-KOM Software',
      description:
        'Czas pracy i rozliczenia, systemy zamiast Excela i strony dla firm z Limanowej. Wdrożenie i szkolenie na miejscu, cena „od” przy każdym rozwiązaniu.',
    },
  },
  'nowy-sacz': {
    name: 'Nowy Sącz',
    slug: 'nowy-sacz',
    locative: 'z Nowego Sącza',
    active: true,
    hero: {
      eyebrow: 'Nowy Sącz · CRM, portale B2B, sklepy',
      title: 'Strony i systemy dla firm',
      titleAccent: 'z Nowego Sącza.',
      lead: 'Nowy Sącz to dla nas ponad godzina drogi, więc większość pracy idzie zdalnie: rozmowy wideo, podgląd projektu do klikania i odbiór na miejscu.',
      ctas: [
        {
          link: {
            label: 'Dobierz rozwiązanie · 60 s',
            href: '/dobierz',
          },
        },
        {
          link: {
            label: 'Napisz albo zadzwoń',
            href: '/kontakt',
          },
        },
      ],
    },
    who: {
      title: 'Większe miasto, **większe systemy**',
      lead: 'W Nowym Sączu firmy częściej mają kilka programów naraz, stałych klientów biznesowych i sklepy w sieci. Problemem jest to, że te programy się nie dogadują.',
      items: [
        {
          name: 'Hurt i producenci z klientami B2B',
          text: 'Klient loguje się, widzi swoje ceny, składa zamówienia i pobiera faktury, bez dzwonienia do biura.',
          cta: 'Panel klienta i portal B2B →',
          solution: 'panel-klienta-i-portal-b2b',
        },
        {
          name: 'Firmy z kilkoma programami',
          text: 'Sklep, księgowość i magazyn wymieniają dane same. Nikt nie przepisuje zamówień ręcznie.',
          cta: 'Połączenie programów →',
          solution: 'polaczenie-programow',
        },
        {
          name: 'Sprzedaż i obsługa klientów',
          text: 'Klienci, oferty i przypomnienia w jednym miejscu. Widać, skąd przychodzą nowi.',
          cta: 'CRM dla firmy →',
          solution: 'crm-dla-malej-i-sredniej-firmy',
        },
        {
          name: 'Właściciele, którzy chcą liczb',
          text: 'Sprzedaż, zlecenia i koszty na jednym ekranie, a w poniedziałek raport przychodzi sam.',
          cta: 'Pulpit firmy →',
          solution: 'pulpit-firmy',
        },
      ],
    },
    local: {
      title: 'Zdalnie, **ale nie na odległość**',
      items: [
        {
          title: 'Podgląd do klikania',
          text: 'W trakcie pracy dostajesz działający podgląd i klikasz go, zanim odbierzesz całość.',
        },
        {
          title: 'Jedna osoba od projektu',
          text: 'Rozmawiasz z tym, kto pisze Twój system. Bez pośredników i bez infolinii.',
        },
        {
          title: 'Odbiór i start na miejscu',
          text: 'Na uruchomienie większego systemu przyjeżdżamy do Nowego Sącza.',
        },
      ],
    },
    faq: [
      {
        question: 'Czy współpraca zdalna działa przy dużym systemie?',
        answer:
          'Tak. Spotykamy się na wideo, a postęp widzisz w podglądzie. Na start i odbiór przyjeżdżamy.',
      },
      {
        question: 'Mamy już program do magazynu i księgowości. Czy coś połączycie?',
        answer:
          'Sprawdzamy, co te programy udostępniają, i proponujemy połączenie. Wycenę połączenia dostajesz osobno.',
      },
      {
        question: 'Czy portal B2B zadziała z naszymi cenami dla klientów?',
        answer:
          'Tak, każdy klient widzi swoje ceny i warunki. Dane bierzemy z Waszego programu albo z panelu.',
      },
      {
        question: 'Dlaczego firma z Rabki, a nie z Sącza?',
        answer:
          'Bo dostajesz stałą cenę za zakres, kod i dane na własność i jedną osobę od początku do końca. Przy systemie robionym zdalnie odległość nie ma znaczenia.',
      },
    ],
    nearby: [
      'Rabka-Zdrój',
      'Nowy Sącz',
      'Stary Sącz',
      'Chełmiec',
      'Grybów',
      'Kamionka Wielka',
      'Łącko',
    ],
    cta: {
      title: 'Opisz, **które programy się nie dogadują**',
      text: 'Odpowiemy z pomysłem na połączenie, ceną i terminem. Pierwsza rozmowa przez wideo, bez zobowiązań.',
      buttons: [
        {
          link: {
            label: 'Napisz do nas',
            href: '/kontakt',
          },
        },
        {
          link: {
            label: 'Dobierz rozwiązanie',
            href: '/dobierz',
          },
        },
      ],
    },
    seo: {
      title: 'Systemy dla firm i CRM Nowy Sącz | PRO-KOM Software',
      description:
        'CRM, portale B2B, połączenia programów i pulpity dla firm z Nowego Sącza. Praca zdalna z podglądem do klikania i startem na miejscu.',
    },
  },
} as const

export const SOLUTION_PAGES_SEO_2 = {
  'strona-wizytowka': {
    eyebrow: 'Strona · usługi, rzemiosło, mała firma',
    title: 'Strona wizytówka.',
    titleAccent: 'Klient dzwoni od razu.',
    lead: 'Jedna strona z ofertą, mapą i dużym przyciskiem „Zadzwoń”. Dla małych firm z Rabki-Zdroju, Podhala i całej Polski, które chcą być w Google.',
    compare: [
      {
        label: 'Dziś',
        title: 'Klient szuka Cię w Google i trafia na konkurencję',
        text: 'Masz tylko numer na samochodzie albo stary profil, którego nikt nie aktualizuje. Kto nie zna Cię z polecenia, dzwoni do innych.',
      },
      {
        label: 'Z wizytówką',
        title: 'Usługi, mapa i telefon na jednym ekranie',
        text: 'Klient z telefonu widzi, co robisz i gdzie, i dzwoni jednym kliknięciem. Formularz przychodzi prosto na Twoją skrzynkę.',
      },
      {
        label: 'Efekt (sprawdzamy po starcie)',
        title: 'Telefony od ludzi, którzy Cię nie znali',
        text: 'Ile telefonów i formularzy przychodzi ze strony, sprawdzimy razem po pierwszych tygodniach, na Twoich zapytaniach.',
      },
    ],
    deliverablesTitle: 'W cenie **wizytówki**',
    faqEyebrow: 'Pytania o stronę wizytówkę',
    faq: [
      {
        q: 'Czy jedna strona wystarczy?',
        a: 'Dla firmy usługowej na start zwykle tak. Gdy przybędzie oferty albo realizacji, rozbudujemy ją do strony firmowej bez zaczynania od zera.',
      },
      {
        q: 'Jak szybko będzie gotowa?',
        a: 'Wizytówka jest gotowa {termin}, zależnie od tego, jak szybko dostaniemy od Ciebie teksty i zdjęcia.',
      },
      {
        q: 'Czy pomożecie z wizytówką w Google?',
        a: 'Tak. Profil Firmy w Google możemy ustawić razem ze stroną, żeby adres, godziny i telefon zgadzały się w obu miejscach. To wyceniamy osobno.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'Za wizytówkę płacisz w dwóch częściach, zaliczka przy zamówieniu to [ZALICZKA]. [ZASADY PŁATNOŚCI]',
      },
      {
        q: 'Pracujecie tylko w Rabce?',
        a: 'Biuro mamy w Rabce-Zdroju, ale wizytówki robimy dla firm z całego Podhala i Małopolski, a zdalnie z całej Polski.',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twojej wizytówce',
      title: 'Powiedz, **czym się zajmujesz**, a pokażemy, jak to będzie wyglądać',
      lead: 'Krótka rozmowa, potem podgląd strony i stała cena. Bez zobowiązań.',
      quoteCaption: 'Opisz firmę w dwóch zdaniach, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'strona-firmowa-z-panelem': {
    eyebrow: 'Strona · firmy z ofertą i realizacjami',
    title: 'Strona firmowa z panelem.',
    titleAccent: 'Treści zmieniasz sam.',
    lead: 'Oferta, realizacje, opinie i formularz prosto do Ciebie, a treści zmieniasz sam w panelu. Strony firmowe z Rabki-Zdroju dla firm z Podhala i Polski.',
    compare: [
      {
        label: 'Dziś',
        title: 'Strona sprzed lat, której nikt nie umie zmienić',
        text: 'Każda poprawka to telefon do kogoś, kto już dawno nie odbiera. Realizacje z ostatnich dwóch lat są tylko na Twoim telefonie.',
      },
      {
        label: 'Ze stroną firmową',
        title: 'Pokazujesz to, co robisz najlepiej, i zmieniasz to sam',
        text: 'Realizacje ze zdjęciami i opisem, opinie klientów i formularz. Panel jest po polsku i prosty jak poczta.',
      },
      {
        label: 'Efekt (sprawdzamy po starcie)',
        title: 'Klient przychodzi przekonany, a nie z pytaniem „czy Pan to robi?”',
        text: 'Zapytania z formularza są konkretniejsze, bo klient widział realizacje. Porównamy je razem z tymi sprzed zmiany.',
      },
    ],
    deliverablesTitle: 'W cenie **strony firmowej**',
    faqEyebrow: 'Pytania o stronę firmową',
    faq: [
      {
        q: 'Czy naprawdę sam zmienię treści?',
        a: 'Tak. Panel jest po polsku, a przy odbiorze pokazujemy, jak z niego korzystać, na Twojej stronie. Dodanie realizacji ze zdjęciami to kilka minut.',
      },
      {
        q: 'Ile podstron dostanę w cenie?',
        a: 'Tyle, ile podaje punkt „W cenie” obok: oferta, realizacje, opinie i kontakt. Więcej podstron, blog albo kolejny język wyceniamy osobno.',
      },
      {
        q: 'Czy strona będzie widoczna w Google i w AI?',
        a: 'Dostaje opisy, dane firmy i strukturę, które czytają wyszukiwarki i asystenci AI. Pozycji nie obiecujemy, ale robimy wszystko, co od nas zależy.',
      },
      {
        q: 'Mam już starą stronę. Co z nią?',
        a: 'Domena zostaje Twoja. Przeniesienie starych treści i przekierowania starych adresów wyceniamy osobno, tak jak przy przebudowie strony.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'Przy stronie firmowej zaliczka wynosi [ZALICZKA], resztę płacisz po odbiorze. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o stronie firmowej',
      title: 'Pokaż nam **swoje realizacje**, a zaprojektujemy stronę wokół nich',
      lead: 'Po rozmowie dostajesz podgląd do klikania i cenę w 5–7 dni. Bez zobowiązań.',
      quoteCaption: 'Opisz firmę i ofertę, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'strona-dla-hotelu-lub-pensjonatu': {
    eyebrow: 'Strona · pensjonaty, apartamenty, hotele',
    title: 'Strona dla pensjonatu i hotelu.',
    titleAccent: 'Gość pisze do Ciebie.',
    lead: 'Pokoje, galeria i zapytanie o termin w trzech językach. Gość z Google pisze do Ciebie, bez prowizji portalu. Dla obiektów na Podhalu i w Małopolsce.',
    compare: [
      {
        label: 'Dziś',
        title: 'Portal bierze prowizję od gości, którzy i tak by przyjechali',
        text: 'Stali goście rezerwują przez portal, bo nie mają gdzie indziej. Na Twoją starą stronę nie da się wygodnie wejść z telefonu.',
      },
      {
        label: 'Z własną stroną',
        title: 'Pokoje i zapytanie o termin, po polsku, angielsku i niemiecku',
        text: 'Gość ogląda pokoje i okolicę, a zapytanie przychodzi do Ciebie. Ceny i zdjęcia zmieniasz sam przed każdym sezonem.',
      },
      {
        label: 'Efekt (sprawdzamy po starcie)',
        title: 'Część rezerwacji bez prowizji',
        text: 'Ile zapytań przychodzi ze strony, a ile z portali, policzymy razem po pierwszym sezonie. Portale zostają tam, gdzie się opłacają.',
      },
    ],
    deliverablesTitle: 'W cenie **strony obiektu**',
    faqEyebrow: 'Pytania o stronę dla pensjonatu',
    faq: [
      {
        q: 'Czy muszę zrezygnować z portali rezerwacyjnych?',
        a: 'Nie. Własna strona przejmuje gości, którzy szukają Cię po nazwie albo wracają. Portale możesz zostawić dla nowych gości.',
      },
      {
        q: 'Jakie języki dostanę?',
        a: 'Taki zestaw jest w cenie: polski, angielski i niemiecki, każdy z własnymi opisami dla Google. Inne języki dokładamy osobno.',
      },
      {
        q: 'Czy goście zarezerwują i zapłacą online?',
        a: 'W tej cenie gość wysyła zapytanie o termin. Kalendarz z rezerwacją i zaliczką online to osobne rozwiązanie, które dokładamy, gdy jest potrzebne.',
      },
      {
        q: 'Kiedy najlepiej zacząć?',
        a: 'Na dwa, trzy miesiące przed sezonem. Wtedy strona zdąży trafić do Google, zanim goście zaczną szukać noclegu.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'Zaliczka za stronę obiektu to [ZALICZKA], resztę płacisz po odbiorze gotowej strony. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoim obiekcie',
      title: 'Opisz **swoje pokoje**, a pokażemy stronę, przez którą goście piszą do Ciebie',
      lead: 'Rozmowa o obiekcie, podgląd strony i cena w 5–7 dni. Bez zobowiązań.',
      quoteCaption: 'Napisz, ile masz pokoi, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'strona-dla-restauracji-lub-baru': {
    eyebrow: 'Strona · restauracje, bary, karczmy',
    title: 'Strona dla restauracji i baru.',
    titleAccent: 'Menu zmieniasz sam.',
    lead: 'Menu w panelu zamiast PDF-a, godziny w sezonie, dojazd i rezerwacja stolika. Strony dla lokali z Rabki-Zdroju, Podhala i całej Małopolski.',
    compare: [
      {
        label: 'Dziś',
        title: 'Menu w PDF-ie sprzed roku i telefon, który dzwoni w środku obiadu',
        text: 'Goście pytają o godziny i o to, czy jest miejsce. Zmiana menu to zdjęcie tablicy wrzucone gdzieś, gdzie nikt go nie znajdzie.',
      },
      {
        label: 'Ze stroną restauracji',
        title: 'Menu, godziny i rezerwacja w jednym miejscu',
        text: 'Menu dnia zmieniasz w panelu w kilka minut. Gość klika „dojazd” albo wysyła rezerwację stolika, a zgłoszenie przychodzi do Ciebie.',
      },
      {
        label: 'Efekt (sprawdzamy po starcie)',
        title: 'Mniej telefonów z tymi samymi pytaniami',
        text: 'Ile rezerwacji przychodzi z formularza, widać w Twojej skrzynce. Po pierwszym sezonie sprawdzimy razem, co jeszcze poprawić.',
      },
    ],
    deliverablesTitle: 'W cenie **strony lokalu**',
    faqEyebrow: 'Pytania o stronę dla restauracji',
    faq: [
      {
        q: 'Czy menu dnia zmienię sam z telefonu?',
        a: 'Tak. Panel działa w telefonie, a zmiana menu to dopisanie pozycji i ceny. Bez PDF-ów i bez czekania na kogoś.',
      },
      {
        q: 'Jak działa rezerwacja stolika?',
        a: 'Gość wybiera dzień, godzinę i liczbę osób w formularzu, a Ty dostajesz zgłoszenie i potwierdzasz je telefonicznie albo mailem.',
      },
      {
        q: 'Godziny zmieniają się w sezonie. Co wtedy?',
        a: 'Godziny zmieniasz w panelu tak samo jak menu, więc przed sezonem i po nim gość widzi aktualne.',
      },
      {
        q: 'Czy menu może być po angielsku?',
        a: 'Tak, menu w drugim języku dokładamy osobno. Przydaje się tam, gdzie przyjeżdża dużo turystów z zagranicy.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'Przy stronie lokalu zaliczka to [ZALICZKA], a resztę płacisz, gdy odbierzesz stronę. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoim lokalu',
      title: 'Pokaż nam **swoje menu**, a zrobimy stronę, którą łatwo zmieniać',
      lead: 'Pokażemy podgląd strony z Twoim menu i podamy cenę. Bez zobowiązań.',
      quoteCaption: 'Napisz, jaki masz lokal, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'sklep-internetowy': {
    eyebrow: 'Sklep · producenci, sklepy lokalne',
    title: 'Sklep internetowy.',
    titleAccent: 'Zamówienia od razu w panelu.',
    lead: 'Produkty, płatności online i BLIK, dostawa albo odbiór w sklepie, a zamówienie od razu w panelu. Sklepy dla firm z Podhala, Małopolski i całej Polski.',
    compare: [
      {
        label: 'Dziś',
        title: 'Zamówienia przez telefon, wiadomości i przelewy do sprawdzania',
        text: 'Klient pisze na komunikatorze, Ty sprawdzasz konto i ręcznie liczysz, co jeszcze jest na półce. Wieczorem odpisujesz na pytania o cenę.',
      },
      {
        label: 'Ze sklepem',
        title: 'Klient sam wybiera, płaci i decyduje o odbiorze',
        text: 'Płatność online i BLIK, odbiór w sklepie albo dostawa. Zamówienie trafia do panelu opłacone i gotowe do spakowania.',
      },
      {
        label: 'Efekt (sprawdzamy po starcie)',
        title: 'Sprzedajesz także wtedy, gdy sklep jest zamknięty',
        text: 'Ile zamówień przychodzi wieczorem i w weekendy, zobaczysz w panelu. Połączenie z magazynem i fakturami dokładamy osobno, gdy przyjdzie pora.',
      },
    ],
    deliverablesTitle: 'W cenie **sklepu**',
    faqEyebrow: 'Pytania o sklep internetowy',
    faq: [
      {
        q: 'Jakie płatności dostanie klient?',
        a: 'Płatności online i BLIK przez operatora płatności, którego wybierzemy razem. Pieniądze trafiają na Twoje konto, a operator pobiera swoją opłatę.',
      },
      {
        q: 'Czy połączycie sklep z moim magazynem albo fakturami?',
        a: 'Tak, to częsty następny krok. Sprawdzamy, jaki program masz, i wyceniamy połączenie osobno.',
      },
      {
        q: 'Ile produktów mogę mieć?',
        a: 'Tyle, ile potrzebujesz. Produkty dodajesz w panelu, a przeniesienie ich z Twojego arkusza wyceniamy osobno.',
      },
      {
        q: 'Dlaczego nie gotowa platforma z abonamentem?',
        a: 'Bo sklep, kod i dane należą do Ciebie, bez naszej prowizji od sprzedaży (operator płatności pobiera swoją opłatę). Gdy gotowa platforma wystarczy, powiemy to wprost.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'Przy sklepie zaliczka wynosi [ZALICZKA], a resztę płacisz po odbiorze sklepu. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoim sklepie',
      title: 'Powiedz, **co sprzedajesz**, a zaplanujemy sklep pod Twoje zamówienia',
      lead: 'Rozmowa, plan sklepu i cena w 5–7 dni. Bez zobowiązań.',
      quoteCaption: 'Opisz, co i jak dziś sprzedajesz, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'przebudowa-starej-strony': {
    eyebrow: 'Strona · firmy ze starą, wolną stroną',
    title: 'Przebudowa starej strony.',
    titleAccent: 'Bez utraty pozycji w Google.',
    lead: 'Nowa, szybka strona na telefon, a stare adresy przekierowane tam, gdzie trzeba. Przebudowujemy strony firm z Podhala, Małopolski i całej Polski.',
    compare: [
      {
        label: 'Dziś',
        title: 'Strona ładuje się długo i źle wygląda na telefonie',
        text: 'Boisz się ją zmienić, bo jest w Google od lat. A klienci z telefonu wychodzą, zanim zobaczą ofertę.',
      },
      {
        label: 'Po przebudowie',
        title: 'Nowa strona, te same adresy w Google',
        text: 'Ustawiamy przekierowania ze starych adresów na nowe. Nic, co dziś przyprowadza klientów, nie trafia w pustkę.',
      },
      {
        label: 'Efekt (sprawdzamy po starcie)',
        title: 'Szybciej na telefonie, bez zgubionych adresów',
        text: 'Szybkość strony mierzymy razem przed przebudową i po niej. Stare adresy sprawdzamy po starcie jeden po drugim.',
      },
    ],
    deliverablesTitle: 'W cenie **przebudowy**',
    faqEyebrow: 'Pytania o przebudowę strony',
    faq: [
      {
        q: 'Czy stracę pozycję w Google?',
        a: 'Robimy wszystko, co od nas zależy: stare adresy przekierowujemy na nowe, a opisy dla Google ustawiamy od nowa. Starą stronę wyłączamy dopiero po odbiorze.',
      },
      {
        q: 'Co z moją domeną i pocztą?',
        a: 'Domena i poczta zostają tam, gdzie są, chyba że chcesz je przenieść. Zmieniamy tylko to, co trzeba dla strony.',
      },
      {
        q: 'Czy przeniesiecie wszystkie treści?',
        a: 'Nowa strona w cenie ma tyle podstron, ile podaje punkt „W cenie”. Przeniesienie większej liczby treści i zdjęć wyceniamy osobno.',
      },
      {
        q: 'Ile to potrwa?',
        a: 'Przebudowa trwa {termin}. Przez cały czas działa stara strona, więc klienci nie trafiają na przerwę.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'Przy przebudowie zaliczka to [ZALICZKA], a resztę płacisz, gdy nowa strona zastąpi starą. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o przebudowie',
      title: 'Podeślij **adres starej strony**, a powiemy, co da się poprawić',
      lead: 'Spojrzymy na stronę bez opłat, potem dostajesz plan przebudowy i stałą cenę.',
      quoteCaption: 'Wklej adres strony, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'system-zlecen-i-grafik-ekip': {
    eyebrow: 'System · firmy z ekipami i zleceniami',
    title: 'System zleceń i grafik ekip.',
    titleAccent: 'Bez dzwonienia wieczorem.',
    lead: 'Kalendarz ekip, zlecenia z adresem i zdjęcia przy zleceniu, a klient sprawdza status pod linkiem. Dla firm z Podhala, Małopolski i całej Polski.',
    compare: [
      {
        label: 'Dziś',
        title: 'Grafik na tablicy, zlecenia w zeszycie, zdjęcia w telefonach',
        text: 'Rano dzwonisz do każdej ekipy, wieczorem przepisujesz protokoły. Klient pyta, kiedy przyjedziecie, i nikt nie wie na pewno.',
      },
      {
        label: 'Z systemem',
        title: 'Jeden kalendarz dla biura i ekip',
        text: 'Zlecenie ma adres, opis i termin. Ekipa dodaje zdjęcia z telefonu, a klient widzi status pod swoim linkiem.',
      },
      {
        label: 'Efekt (sprawdzamy po starcie)',
        title: 'Mniej telefonów i żadnych zgubionych zleceń',
        text: 'Ile czasu w tygodniu odzyskacie, policzymy razem na Waszych zleceniach po pierwszym miesiącu pracy.',
      },
    ],
    deliverablesTitle: 'W cenie **pierwszego modułu**',
    faqEyebrow: 'Pytania o system zleceń',
    faq: [
      {
        q: 'Od czego zaczynamy?',
        a: 'Od kalendarza ekip ze zleceniami, czyli od pierwszego modułu. Kolejne, na przykład czas pracy albo faktury, dochodzą etapami.',
      },
      {
        q: 'Czy ekipy poradzą sobie z telefonem?',
        a: 'Ekran dla ekipy ma kilka przycisków: zlecenie, zdjęcie, gotowe. Projektujemy go pod Wasz sposób pracy.',
      },
      {
        q: 'Mamy dane w Excelu. Przeniesiecie je?',
        a: 'Tak, import z Excela wyceniamy osobno. Zwykle przenosimy klientów i otwarte zlecenia, żeby zacząć bez przepisywania.',
      },
      {
        q: 'Ile osób może pracować w systemie?',
        a: 'Tyle, ile podaje punkt „W cenie” obok. Więcej osób i osobne role dla biura i ekip dokładamy, gdy firma rośnie.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'System zleceń budujemy etapami, zaliczka na start to [ZALICZKA]. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o grafiku ekip',
      title: 'Opisz **jeden dzień w firmie**, a pokażemy, jak to poukładać',
      lead: 'Rozmowa, podgląd i plan etapów z ceną w 5–7 dni. Bez zobowiązań.',
      quoteCaption: 'Napisz, ile masz ekip, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'crm-dla-malej-i-sredniej-firmy': {
    eyebrow: 'System · usługi, handel, firmy B2B',
    title: 'CRM dla małej i średniej firmy.',
    titleAccent: 'Żaden klient nie ginie.',
    lead: 'Klienci, zapytania, oferty i przypomnienia, do kogo zadzwonić, a cała historia klienta w jednym miejscu. CRM dla firm z Podhala, Małopolski i Polski.',
    compare: [
      {
        label: 'Dziś',
        title: 'Zapytania w mailach, oferty w folderach, przypomnienia w głowie',
        text: 'Oferta wysłana trzy tygodnie temu czeka na telefon, o którym nikt nie pamięta. Gdy handlowiec idzie na urlop, klienci idą razem z nim.',
      },
      {
        label: 'Z CRM',
        title: 'Każde zapytanie ma właściciela i następny krok',
        text: 'Zapytanie z formularza trafia do CRM, oferta jest przy kliencie, a system przypomina, kiedy zadzwonić.',
      },
      {
        label: 'Efekt (sprawdzamy po starcie)',
        title: 'Więcej odpowiedzi na wysłane oferty',
        text: 'Ile ofert kończy się zamówieniem i skąd przychodzą klienci, porównamy razem po pierwszym kwartale.',
      },
    ],
    deliverablesTitle: 'W cenie **CRM**',
    faqEyebrow: 'Pytania o CRM',
    faq: [
      {
        q: 'Dlaczego nie gotowy CRM z abonamentem?',
        a: 'Gotowe CRM-y są dobre, gdy pasują. Robimy CRM, gdy firma ma własny sposób pracy i nie chce płacić za setki funkcji, z których korzysta pięć. Wtedy kod i dane są Twoje.',
      },
      {
        q: 'Przeniesiecie naszych klientów z Excela?',
        a: 'Tak, import danych wyceniamy osobno. Przenosimy klientów, kontakty i otwarte oferty.',
      },
      {
        q: 'Czy CRM połączy się z formularzem na stronie?',
        a: 'Tak, zapytania z formularza trafiają prosto do CRM. Połączenia z innymi programami, na przykład z fakturami, wyceniamy osobno.',
      },
      {
        q: 'Ile osób może z niego korzystać?',
        a: 'Tylu użytkowników, ile podaje punkt „W cenie”, z komputera i z telefonu. Więcej osób i ról dokładamy później.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'CRM wdrażamy etapami, a na początek płacisz zaliczkę [ZALICZKA]. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoich klientach',
      title: 'Opisz, **jak dziś prowadzicie klientów**, a zaproponujemy prosty CRM',
      lead: 'Rozmowa o Waszej sprzedaży, podgląd CRM i cena w 5–7 dni. Bez zobowiązań.',
      quoteCaption: 'Napisz, jak wysyłacie oferty, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
} as const

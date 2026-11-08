import type { GuidePostData } from './types'

/**
 * Runda v6 D1: the former „Monitoring w pensjonacie a RODO” as a practical post about placing
 * cameras — no acts, rulings or regulators. The old address `/poradnik/monitoring-a-rodo` redirects
 * here permanently.
 */
export const kameryWPensjonacie: GuidePostData = {
  slug: 'kamery-w-pensjonacie',
  title: 'Kamery w pensjonacie: gdzie je powiesić i jak ustawić',
  category: 'noclegi',
  publishedAt: '2026-10-01T00:00:00.000Z',
  lead: 'Kamery w pensjonacie wiesza się tam, gdzie goście przychodzą i zostawiają rzeczy: na parkingu, przy wejściu, w narciarni i na zapleczu. Pokoje, łazienki i sauna zostają bez kamer, a kadr i maski ustawiamy tak, żeby nikt nie czuł się podglądany.',
  sections: [
    {
      heading: 'Gdzie powiesić kamery w pensjonacie',
      blocks: [
        'Zacznij od miejsc, w których najczęściej coś się dzieje: wjazd i parking, wejście do budynku, recepcja albo hol, narciarnia i suszarnia butów, wózkownia, zaplecze i magazyn. W typowym pensjonacie na Podhalu to 4 kamery: parking, wejście, narciarnia i zaplecze.',
        'Każda kamera powinna mieć jedno zadanie. Kamera przy wejściu ma pokazać twarz osoby, która wchodzi. Kamera parkingu ma pokazać auta i ruch na placu. Kamera w narciarni ma pokazać, kto bierze narty z którego stojaka.',
        [
          'Wjazd i parking: auta gości, ruch w nocy, dostawy.',
          'Wejście i recepcja: kto wchodzi i o której.',
          'Narciarnia i suszarnia: sprzęt gości, który kosztuje najwięcej.',
          'Zaplecze i magazyn: towar i dostawy.',
        ],
      ],
    },
    {
      heading: 'Gdzie kamer w pensjonacie nie montujemy',
      blocks: [
        'Kamer nie wieszamy w pokojach gości, łazienkach, saunie, strefie SPA ani w szatniach personelu. Goście płacą za spokój i prywatność, a kamera w takim miejscu odbiera jedno i drugie.',
        'Uważamy też na korytarze przy pokojach. Jeśli kamera ma pilnować drzwi ewakuacyjnych albo schodów, ustawiamy kadr tak, żeby nie zaglądała do pokoju przy otwartych drzwiach.',
      ],
    },
    {
      heading: 'Jak ustawić kadr, żeby kamera nie patrzyła za daleko',
      blocks: [
        'Kamera widzi więcej, niż potrzeba. Dlatego po montażu ustawiamy kadr na Twój teren, a resztę zasłaniamy w obrazie maską prywatności: czarnym polem, którego rejestrator nie nagrywa. Tak zasłaniamy okna sąsiadów, drogę i posesje obok.',
        'Maskę ustawia się w aplikacji rejestratora albo kamery. Sprawdzamy ją w dzień i w nocy, bo w trybie nocnym kamera potrafi widzieć szerzej przez odbite światło.',
        'Więcej o kadrze i maskach znajdziesz na stronie [Monitoring](/monitoring#rodo).',
      ],
    },
    {
      heading: 'Ile dni trzymać nagrania z kamer',
      blocks: [
        'Tyle, ile potrzebujesz, żeby zauważyć problem i sprawdzić nagranie. W pensjonacie zwykle wystarczy kilka dni do dwóch tygodni. Rejestrator sam nadpisuje najstarsze nagrania, więc nie trzeba niczego kasować ręcznie.',
        'Dłuższe przechowywanie nie daje lepszej ochrony, a wymaga większego dysku. Ile dni zmieści dysk przy Twoich kamerach, policzysz w [kalkulatorze nagrań](/monitoring#nagrania).',
      ],
    },
    {
      heading: 'Jak poinformować gości o monitoringu',
      blocks: [
        'Przy wejściu na parking i do budynku wieszamy tabliczkę z piktogramem kamery i krótką informacją: kto prowadzi monitoring i gdzie gość znajdzie więcej szczegółów, np. w recepcji albo na stronie pensjonatu. Gość od razu wie, że teren jest pilnowany, a złodziej widzi, że ktoś tu patrzy.',
        'Podpowiemy, gdzie powiesić tabliczki, żeby były widoczne przed wejściem w kadr kamery.',
      ],
    },
    {
      heading: 'Czy kamera w pensjonacie powinna nagrywać dźwięk',
      blocks: [
        'Nie. Rozmowy gości przy recepcji czy w jadalni to ich prywatna sprawa, a obraz w zupełności wystarcza, żeby sprawdzić, co się stało. Przy montażu wyłączamy mikrofony w kamerach, które je mają.',
      ],
    },
    {
      heading: 'Kto ma dostęp do nagrań',
      blocks: [
        'Tylko osoby, które naprawdę go potrzebują: właściciel i ewentualnie jedna zaufana osoba z obsługi. Każda ma własne konto w aplikacji, więc wiesz, kto oglądał nagrania. Hasła fabryczne zmieniamy w każdym urządzeniu przy montażu.',
        'Podgląd w telefonie wystarczy, żeby z domu zobaczyć parking albo wejście. Nagrania zostają na rejestratorze w pensjonacie, bez abonamentu za chmurę.',
      ],
    },
    {
      heading: 'Jakie kamery wybrać do pensjonatu',
      blocks: [
        'Do pensjonatu wystarczą kamery zewnętrzne kopułkowe albo tubowe, które widzą w nocy i nagrywają na rejestrator w budynku. Kamery łączymy kablem sieciowym, który jednocześnie je zasila, więc przy każdej kamerze nie trzeba gniazdka.',
        'Przy wejściu i w recepcji liczy się twarz, więc kamera wisi niżej i bliżej drzwi. Na parkingu liczy się szeroki kadr i dobre widzenie w nocy. W narciarni wystarczy kamera wewnętrzna, byle widziała drzwi i stojaki.',
        [
          'Wejście: kamera nisko i blisko drzwi, skierowana na twarz wchodzącego.',
          'Parking: kamera szerokokątna pod okapem, z widzeniem w nocy.',
          'Narciarnia: kamera wewnętrzna nad drzwiami.',
          'Rejestrator: w szafie technicznej albo w zamykanym pomieszczeniu.',
        ],
        'Jakie kamery montujemy i gdzie się sprawdzają, opisujemy na stronie [Monitoring](/monitoring#typy).',
      ],
    },
    {
      heading: 'Co zrobić, gdy coś zginie albo dojdzie do szkody',
      blocks: [
        'Najpierw sprawdź na nagraniu godzinę zdarzenia, zanim rejestrator nadpisze ten fragment. W aplikacji wystarczy wybrać kamerę i przewinąć oś czasu do właściwej chwili.',
        'Potrzebny fragment zapisz na pendrive albo w telefonie. Jeśli sprawą zajmie się policja, przekażesz go na prośbę. Pokażemy przy odbiorze, jak to zrobić w kilku krokach.',
        'Jeśli nagrania z danej nocy brakuje, sprawdź dysk i zasilanie rejestratora. To najczęstsze usterki, które wychodzą przy przeglądzie.',
      ],
    },
    {
      heading: 'Kamery w pensjonacie zimą: śnieg, mróz i noc',
      blocks: [
        'Na Podhalu kamera musi poradzić sobie z mrozem, śniegiem na obudowie i odblaskiem od śniegu w nocy. Dobieramy kamery z zakresem pracy do niskich temperatur, montujemy je pod okapem albo z daszkiem i ustawiamy obraz pod oświetlenie parkingu.',
        'Przed sezonem warto przetrzeć obiektywy, sprawdzić dysk w rejestratorze i zasilacz awaryjny. Robimy to w ramach [przeglądu przed sezonem](/serwis#plany).',
      ],
    },
  ],
  seo: {
    title: 'Gdzie powiesić kamery w pensjonacie',
    description:
      'Gdzie powiesić kamery w pensjonacie, jak ustawić kadr i maski, ile dni trzymać nagrania i jak poinformować gości. Praktyczny poradnik z Podhala.',
  },
  extras: {
    toc: [
      'Gdzie powiesić kamery',
      'Gdzie bez kamer',
      'Kadr i maski',
      'Ile dni nagrań',
      'Tabliczka dla gości',
      'Bez dźwięku',
      'Dostęp do nagrań',
      'Jakie kamery',
      'Gdy coś zginie',
      'Zima i noc',
    ],
    summary: [
      'Kamery: parking, wejście, recepcja, narciarnia, zaplecze. Zwykle 4 w pensjonacie.',
      'Bez kamer: pokoje, łazienki, sauna, SPA i szatnie personelu.',
      'Maska prywatności zasłania w obrazie drogę i posesje sąsiadów.',
      'Nagrania nadpisują się same po kilku dniach, mikrofony są wyłączone.',
    ],
    checklist: {
      heading: 'Sprawdź swój monitoring w pensjonacie',
      items: [
        'Kamery nie obejmują pokoi, łazienek ani sauny',
        'Droga i posesje sąsiadów są zasłonięte maską',
        'Mikrofony w kamerach są wyłączone',
        'Nagrania nadpisują się same po ustalonej liczbie dni',
        'Przy wejściu wisi tabliczka o monitoringu',
        'Każda osoba z dostępem ma własne konto',
        'Hasła do rejestratora są zmienione z fabrycznych',
      ],
      initial: [0, 2],
      done: 'Wygląda dobrze. Warto co sezon sprawdzić, czy nic się nie przestawiło.',
      partial:
        '{n} z {all}. Brakujące punkty ustawimy przy przeglądzie, zwykle bez wymiany sprzętu.',
    },
    howWeDo: [
      'Na wizji lokalnej obchodzimy pensjonat z Tobą i ustalamy, co każda kamera ma pokazać.',
      'Po montażu ustawiamy kadry i maski w dzień i w nocy, wyłączamy mikrofony.',
      'Ustawiamy czas nadpisywania nagrań i osobne konta dla osób z dostępem.',
      'Pokazujemy aplikację i podpowiadamy, gdzie powiesić tabliczki.',
    ],
    faq: [
      {
        question: 'Ile kamer potrzebuje pensjonat?',
        answer:
          'Zwykle 4: parking, wejście, narciarnia i zaplecze. Przy dużym parkingu albo kilku wejściach dokładamy kolejne. Liczbę ustalamy na wizji lokalnej.',
      },
      {
        question: 'Czy mogę mieć kamerę w jadalni?',
        answer:
          'Można, jeśli kamera pilnuje kasy albo wejścia. Kadr ustawiamy wtedy na ladę i drzwi, bez stolików gości.',
      },
      {
        question: 'Czy kamery działają bez internetu?',
        answer:
          'Tak. Nagrywają na rejestrator w pensjonacie. Internet jest potrzebny tylko do podglądu w telefonie i powiadomień.',
      },
      {
        question: 'Czy ustawicie monitoring, który zamontowała inna firma?',
        answer:
          'Tak. Sprawdzamy kadry, maski, czas nagrań i hasła. Często wystarczy zmiana ustawień, bez wymiany sprzętu.',
      },
      {
        question: 'Czy w narciarni wystarczy jedna kamera?',
        answer:
          'W małej narciarni tak, jeśli widzi drzwi i stojaki. W dłuższej sali dokładamy drugą, żeby objąć cały rząd stojaków.',
      },
    ],
    plan: {
      opis: 'monitoring w pensjonacie: parking, wejście, narciarnia',
      label: 'Zaplanuj kamery w pensjonacie',
    },
    art: {
      icon: 'cam',
      alt: 'Ilustracja: kamera nad wejściem do pensjonatu',
    },
    aside: {
      title: 'Ustawimy monitoring według tego poradnika',
      text: 'Kadry, maski, czas nagrań i konta. Wycena po wizji lokalnej.',
      link: { label: 'Monitoring: kadr i maski', href: '/monitoring#rodo' },
    },
    readAlso: [
      { label: 'Ile dni nagrań zmieści dysk', href: '/monitoring#nagrania' },
      { label: 'Wi-Fi dla gości', href: '/sieci-wifi' },
      { label: 'Przegląd przed sezonem', href: '/serwis#plany' },
    ],
    band: {
      eyebrow: 'Kamery w pensjonacie',
      heading: 'Sprawdzimy, jak ustawiony jest Twój monitoring',
      text: 'Kadry, maski, czas nagrań i hasła. Bez wymiany sprzętu, jeśli nie trzeba.',
    },
  },
}

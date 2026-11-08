import type { GuidePostData } from './types'

/**
 * Runda v6 §3.1 no. 1 (INST-6 PR5): how many cameras a house needs and where to hang them. Facts
 * from the Monitoring page (`dane/monitoring.ts`, the „Dom” version and package, DORI thresholds,
 * the recording calculator) and the house object page (`seed/prokominstalacje/obiekty/dom.json`).
 */
export const ileKamerDoDomu: GuidePostData = {
  slug: 'ile-kamer-do-domu',
  title: 'Ile kamer potrzebuje dom i gdzie je powiesić',
  category: 'monitoring',
  publishedAt: '2026-11-08T16:00:00.000Z',
  lead: 'Typowy dom jednorodzinny potrzebuje 4 kamer: przy furtce, na podjeździe, przy wejściu i od strony ogrodu. Mały domek letniskowy zwykle obejdzie się 2 albo 3 kamerami, a duża działka z garażem obok lub drugim budynkiem potrzebuje kolejnych.',
  sections: [
    {
      heading: 'Ile kamer potrzebuje dom jednorodzinny',
      blocks: [
        'W domach na Podhalu najczęściej montujemy 4 kamery. Taki zestaw obejmuje drogę, którą ktoś może wejść na posesję, i miejsca, w których zostawiasz to, co cenne: auto, rower, narzędzia.',
        'Liczbę kamer ustala się od pytania, co każda z nich ma pokazać. Jedna kamera, która ma widzieć całą działkę, zwykle nie pokaże dobrze niczego. Dwie kamery, z których każda pilnuje jednego miejsca, dadzą obraz, który przyda się po zdarzeniu.',
        [
          '2–3 kamery: mały domek, jedno wejście, krótki podjazd.',
          '4 kamery: typowy dom z furtką, podjazdem, wejściem i ogrodem.',
          'Więcej: garaż obok domu, drugi budynek, długa działka albo kilka wejść.',
        ],
        'Zanim policzysz kamery, przejdź się wokół domu i zapisz, którędy da się wejść na posesję i gdzie stoi to, czego nie chcesz stracić. Z takiej listy zwykle od razu widać, ile kamer potrzeba.',
      ],
    },
    {
      heading: 'Gdzie powiesić kamerę przy furtce i drzwiach wejściowych',
      blocks: [
        'Kamera przy furtce i przy drzwiach ma pokazać twarz osoby, która wchodzi. Dlatego wieszamy ją blisko przejścia, tak żeby człowiek szedł w jej stronę. Kamera powieszona daleko i wysoko pokaże czubek głowy i kurtkę.',
        'Przy wejściu sprawdza się mała kamera kopułkowa pod okapem. Trudno ją przestawić albo zasłonić, a okap chroni ją przed deszczem i śniegiem.',
        'To, czy rozpoznasz twarz, zależy od liczby pikseli na metr. Do wykrycia człowieka wystarczy 25 pikseli na metr, do rozpoznania znajomej osoby potrzeba 125, a do wskazania konkretnej osoby 250. Sprawdzisz to w [kalkulatorze odległości](/monitoring#ile-widac).',
      ],
    },
    {
      heading: 'Kamera na podjazd i garaż: co ma pokazać',
      blocks: [
        'Kamera podjazdu ma pokazać auto, które wjeżdża, i człowieka, który podchodzi do garażu. Tu zwykle montujemy kamerę tubową z daszkiem, bo łatwo ją wycelować daleko, wzdłuż wjazdu.',
        'Ustawiamy wykrywanie ludzi i aut. Powiadomienie przychodzi wtedy, gdy na podjeździe pojawi się człowiek albo samochód. Analiza obrazu odróżnia ich od kota, liści i padającego śniegu, więc fałszywych powiadomień jest mniej.',
        'Przy garażu albo szopie z rowerami sprawdza się kamera z odstraszaniem. Ma białe światło, syrenę i głośnik, więc reaguje, zanim ktoś otworzy drzwi.',
      ],
    },
    {
      heading: 'Kamera na ogród i tył domu bez widoku na sąsiada',
      blocks: [
        'Od strony ogrodu najczęściej są taras, drzwi balkonowe i okna, przez które łatwo wejść, gdy nikogo nie ma. Jedna kamera na ścianie domu zwykle obejmuje taras i większą część ogrodu.',
        'Kamera widzi więcej, niż trzeba, więc kadr ustawiamy na Twoją posesję. Drogę i działkę sąsiada zasłaniamy maską prywatności, czyli czarnym polem, którego rejestrator nie nagrywa. Mikrofon w kamerze zostaje wyłączony.',
        'Jak ustawić kadr i maski, pokazujemy na stronie [Monitoring](/monitoring#rodo).',
      ],
    },
    {
      heading: 'Na jakiej wysokości powiesić kamerę przed domem',
      blocks: [
        'Kamera powinna wisieć na tyle wysoko, żeby nikt nie sięgnął jej ręką, i na tyle nisko, żeby widziała twarz z przodu. Im wyżej ją powiesisz, tym bardziej patrzy z góry i tym mniej widać twarz pod czapką.',
        'Dlatego kamerę przy wejściu wieszamy niżej, pod okapem nad drzwiami. Kamerę, która ma objąć cały podjazd albo plac, wieszamy wyżej.',
        'Kamera na ścianie szczytowej albo na maszcie czasem wymaga podnośnika. Mówimy o tym na wizji lokalnej, bo to wpływa na wycenę.',
        'Przed montażem sprawdzamy też, czy w kadr nie świeci latarnia albo lampa nad drzwiami. Silne światło prosto w obiektyw w nocy zamienia twarz w ciemną plamę.',
      ],
    },
    {
      heading: 'Jak kamery przed domem radzą sobie zimą na Podhalu',
      blocks: [
        'Zimą najczęstszy problem to setki powiadomień. Śnieg, szron i płatki w świetle podczerwieni kamera bierze za ruch, a po tygodniu przestajesz czytać alerty.',
        'Pomaga wykrywanie ludzi i aut zamiast każdego ruchu, montaż pod okapem i daszek na kamerze. Dobieramy modele z zakresem pracy co najmniej do −30°C i sprawdzamy ten zakres w karcie każdej kamery.',
      ],
    },
    {
      heading: 'Ile dni nagrań zmieści rejestrator w domu',
      blocks: [
        'Przy 4 kamerach 4 MP i jednym dysku 4 TB nagrywanie ciągłe mieści orientacyjnie od 3 do 6 tygodni. Noc, śnieg i drzewa na wietrze zwiększają ilość danych, więc wynik jest szacunkiem.',
        'Czas przechowywania ustawiamy w rejestratorze, a starsze nagrania nadpisują się same. Ile dni zmieści dysk przy Twoich kamerach, policzysz w [kalkulatorze nagrań](/monitoring#nagrania).',
        'Mały zasilacz awaryjny UPS podtrzymuje rejestrator przez około godzinę. Gdy zabraknie prądu, nagrywanie się nie urywa.',
      ],
    },
    {
      heading: 'Kamery w domu letniskowym, w którym nikt nie mieszka',
      blocks: [
        'W pustym domu kamera pokaże, kto stoi przy furtce, ale nie powie o pękniętej rurze ani o mrozie w kotłowni. Dlatego w domku letniskowym zaczynamy od czujek zalania, temperatury i zaniku prądu, a kamery dokładamy potem.',
        'Kamera przy furtce wysyła zdjęcie, gdy rozpozna człowieka. Kamera podjazdu pokaże, czy sąsiad odśnieżył wjazd. Router z łączem zapasowym LTE i zasilanie awaryjne sprawiają, że dom nie przestaje wysyłać powiadomień po burzy.',
        'Jak łączymy kamery, alarm i ogrzewanie w domu, który część roku stoi pusty, opisujemy na stronie [Dom i domek letniskowy](/dla-kogo/dom).',
      ],
    },
  ],
  seo: {
    title: 'Ile kamer do domu i gdzie je powiesić',
    description:
      'Ile kamer do domu wystarczy i gdzie je powiesić: furtka, podjazd, wejście i ogród. Wysokość montażu, kamery zimą, czas nagrań i maska na posesję sąsiada.',
  },
  extras: {
    toc: [
      'Ile kamer w domu',
      'Furtka i wejście',
      'Podjazd i garaż',
      'Ogród i tył domu',
      'Wysokość montażu',
      'Kamery zimą',
      'Ile dni nagrań',
      'Dom letniskowy',
    ],
    summary: [
      'Typowy dom: 4 kamery, przy furtce, na podjeździe, przy wejściu i od ogrodu.',
      'Każda kamera ma jedno zadanie: twarz przy wejściu, auto na podjeździe.',
      'Maska prywatności zasłania drogę i działkę sąsiada, mikrofon jest wyłączony.',
      'Przy 4 kamerach dysk 4 TB mieści orientacyjnie 3–6 tygodni nagrań.',
    ],
    checklist: {
      heading: 'Sprawdź plan kamer w swoim domu',
      items: [
        'Kamera przy furtce albo wejściu widzi twarz z przodu',
        'Podjazd i garaż są w kadrze jednej kamery',
        'Taras i drzwi od ogrodu są pod kamerą',
        'Droga i działka sąsiada są zasłonięte maską',
        'Kamery zewnętrzne wiszą pod okapem albo mają daszek',
        'Powiadomienia przychodzą tylko o ludziach i autach',
        'Rejestrator ma zasilacz awaryjny',
      ],
      initial: [0, 1],
      done: 'Plan wygląda dobrze. Przed zimą sprawdź, czy kamery nie zbierają śniegu.',
      partial:
        '{n} z {all}. Brakujące punkty omówimy na wizji lokalnej i ujmiemy w wycenie na piśmie.',
    },
    howWeDo: [
      'Na wizji lokalnej obchodzimy dom z Tobą i ustalamy, co każda kamera ma pokazać.',
      'Wycenę dostajesz na piśmie, zwykle w wariantach, np. 3 albo 4 kamery.',
      'Po montażu ustawiamy kadry, maski i wykrywanie ludzi i aut, a potem uczymy Cię obsługi aplikacji.',
      'Na montaż dajemy 24 miesiące gwarancji, a przed zimą robimy przegląd kamer i dysku.',
    ],
    faq: [
      {
        question: 'Czy jedna kamera wystarczy na cały dom?',
        answer:
          'Zwykle nie. Kamera, która obejmuje całą działkę, pokazuje wszystko z daleka i nie widać na niej twarzy. Lepiej mieć dwie kamery z jednym zadaniem każda.',
      },
      {
        question: 'Czy kamery w domu działają bez internetu?',
        answer:
          'Tak. Nagrywają na rejestrator w domu. Internet jest potrzebny do podglądu w telefonie i powiadomień.',
      },
      {
        question: 'Czy mogę zacząć od 2 kamer i dołożyć kolejne później?',
        answer:
          'Tak. Wystarczy rejestrator z zapasem kanałów, np. 4 kanały przy 2 kamerach, i przygotowane trasy kabli. Kolejne kamery podłączamy wtedy bez przebudowy.',
      },
      {
        question: 'Jak daleko od domu może wisieć kamera?',
        answer:
          'Do około 90 metrów wystarcza kabel sieciowy. Dalej stawiamy dodatkowy switch, kładziemy światłowód albo łączymy kamerę radiowo, bez kopania rowu przez całą działkę.',
      },
      {
        question: 'Czy kamera może patrzeć na ulicę przed domem?',
        answer:
          'Ustawiamy kadr na Twoją posesję, a drogę zasłaniamy maską prywatności. Furtkę i wjazd widać wtedy dobrze, a przechodnie na chodniku nie trafiają do nagrań.',
      },
    ],
    plan: {
      opis: 'kamery do domu: furtka, podjazd, wejście, ogród',
      label: 'Zaplanuj kamery do domu',
    },
    art: {
      icon: 'cam',
      alt: 'Ilustracja: kamera pod okapem domu skierowana na furtkę',
    },
    aside: {
      title: 'Dobierzemy kamery do Twojego domu',
      text: 'Ustalimy liczbę i miejsca kamer na wizji lokalnej. Wycena na piśmie.',
      link: { label: 'Monitoring: zestaw dla domu', href: '/monitoring#system' },
    },
    readAlso: [
      { label: 'Monitoring domu i firmy', href: '/monitoring' },
      { label: 'Dom i domek letniskowy', href: '/dla-kogo/dom' },
      { label: 'Alarm do domu', href: '/alarmy' },
    ],
    band: {
      eyebrow: 'Kamery do domu',
      heading: 'Ustalimy, ile kamer potrzebuje Twój dom',
      text: 'Przyjedziemy, obejdziemy posesję i zaproponujemy miejsca kamer. Wycenę dostajesz na piśmie.',
    },
  },
}

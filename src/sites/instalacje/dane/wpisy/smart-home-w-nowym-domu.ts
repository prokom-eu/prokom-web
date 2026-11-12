import type { GuidePostData } from './types'

/**
 * Runda v6 §3.1 no. 5: smart home before plastering — what to plan on a building site. Facts from
 * the Smart home page (`dane/smartHome.ts` → `stages`, `why`, `panels`; `strony-zrzut/SmartHome.json`)
 * and the architects page (`dane/architekci.ts` → stages, checklist, FAQ).
 */
export const smartHomeWNowymDomu: GuidePostData = {
  slug: 'smart-home-w-nowym-domu',
  title: 'Smart home przed tynkami: co zaplanować w budowie',
  category: 'smart-home',
  publishedAt: '2026-11-08T12:00:00.000Z',
  lead: 'Smart home w nowym domu planuje się, zanim elektryk położy pierwszy przewód: wtedy jest najtaniej i najwięcej da się zrobić. Przed tynkami trzeba przewidzieć przewód magistrali do paneli, głębokie puszki, osobne przewody do rolet i bramy, czujniki temperatury i większą rozdzielnicę.',
  sections: [
    {
      heading: 'Kiedy zaplanować smart home w nowym domu',
      blocks: [
        'Najlepiej na etapie projektu, przed rozpoczęciem instalacji elektrycznej. Wtedy przewody do paneli, czujników i rolet kładzie się razem z resztą, a rozdzielnica od razu ma miejsce na moduły.',
        'Na pierwszej rozmowie ustalamy, co ma się dziać w domu. Na przykład scena Wyjście jednym przyciskiem gasi światła, przymyka rolety, obniża ogrzewanie do 17° i uzbraja alarm. Z takich scen wynika, gdzie potrzebne są przewody, panele i czujniki.',
        'Po tynkach też się da, ale każdy brakujący przewód oznacza kucie albo urządzenia bezprzewodowe. Jak wygląda cała droga od rozmowy do serwisu, pokazujemy w etapach na stronie [Smart home](/smart-home#etapy).',
        [
          'Projekt: rozmowa o potrzebach, dobór modułów, rozmieszczenie paneli i czujników.',
          'Stan surowy: okablowanie razem z elektrykiem.',
          'Wykończenie: rozdzielnica, panele, programowanie scen i szkolenie.',
        ],
      ],
    },
    {
      heading: 'Jakie przewody położyć pod smart home przed tynkami',
      blocks: [
        'W systemie Ampio moduły, panele i czujniki łączy jedna skrętka magistrali. Przewód jest pewniejszy niż radio i nie potrzebuje baterii.',
        [
          'Skrętka magistrali do każdego panelu w ścianie.',
          'Przewód do urządzeń, które chcesz połączyć: rekuperator, klimatyzacja, falownik fotowoltaiki.',
          'Dwużyłowy przewód do każdego czujnika temperatury, do najbliższego panelu albo modułu.',
          'Osobny przewód do każdej rolety, markizy i napędu bramy.',
          'Zapasowy kabel magistrali na późniejszą rozbudowę.',
        ],
        'Każdy napęd prowadzimy osobno, żeby dało się nim sterować z systemu pojedynczo i w scenach.',
      ],
    },
    {
      heading: 'Jakie puszki pod panele smart home',
      blocks: [
        'Pod szklany panel montuje się głęboką puszkę, bo korpus panelu chowa się w ścianie na 22 mm. Typ puszki podajemy w projekcie, żeby elektryk osadził właściwe przed tynkami.',
        'Panele stoją zwykle przy drzwiach i w strefach, w których dziś byłby rząd włączników. Jeden panel ma od 2 do 18 pól dotykowych, a kolor szkła, ikony i podpisy wybierasz razem z nami. Przykłady układów znajdziesz w części o [szklanych panelach](/smart-home#panele).',
      ],
    },
    {
      heading: 'Jaka rozdzielnica pod smart home',
      blocks: [
        'Większa niż w zwykłym domu. Moduły Ampio montuje się na szynie DIN w rozdzielnicy, a ich liczba wynika z liczby obwodów światła, rolet i stref grzewczych.',
        'W rozdzielnicy przewidujemy dwa zasilacze z redundancją: z osobnymi zabezpieczeniami, jeden buforowy, połączone modułem redundancji. Obok trzeba zostawić miejsce na serwer Ampio i router, bo serwer łączy się z siecią domową.',
      ],
    },
    {
      heading: 'Ogrzewanie, rolety i brama w smart home: co przygotować',
      blocks: [
        'Ogrzewanie w smart home działa w strefach, od 1 do 32, każda z harmonogramem na dzień i noc. W każdej strefie grzewczej potrzebny jest czujnik temperatury, montowany na wysokości 120–150 cm, i przewody do siłowników.',
        'Pompa ciepła i klimatyzator łączą się z Ampio przez Modbus albo bramkę HVAC. Model urządzenia sprawdzamy w projekcie, zanim kupisz sprzęt.',
        [
          'Rolety i markizy: przewód do każdego napędu, harmonogram według słońca.',
          'Brama i furtka: przewód do napędu, otwieranie z telefonu i przy podjeździe.',
          'Rekuperacja: sterowanie biegami według wilgotności.',
        ],
      ],
    },
    {
      heading: 'Smart home a Wi-Fi i sieć w nowym domu',
      blocks: [
        'Aplikacja Ampio UNI łączy się z domem przez sieć domową, więc razem ze smart home warto zaplanować porządną sieć. Kabel sieciowy kat. 6 prowadzimy do telewizora, biurka i każdego punktu Wi-Fi w suficie.',
        'Na etapie projektu budowlanego przewidujemy też miejsce na szafę rack z wentylacją i osobnym obwodem, rurę osłonową pod światłowód od granicy działki oraz kabel albo pustą rurę do garażu i bramy.',
        'Sceny i czujniki Ampio działają lokalnie w budynku także bez internetu. Internet jest potrzebny do sterowania z telefonu spoza domu.',
      ],
    },
    {
      heading: 'Kto robi smart home na budowie: elektryk czy instalator',
      blocks: [
        'Obaj, w uzgodnieniu. Instalacje niskoprądowe uzgadniamy z projektantem elektrycznym i wykonawcą, a zasilanie, moc i zabezpieczenia zostają w jego branży. Okablowanie przed tynkami kładziemy razem z elektrykiem.',
        'Przed zakryciem przewodów robimy pomiary i zdjęcia tras. Dzięki temu wiesz, gdzie biegnie każdy kabel, także za 10 lat.',
        'Jeśli dom projektuje architekt, możemy dołączyć do projektu i nanieść urządzenia na rzuty. Pełną listę rzeczy do przewidzenia ma [checklista projektanta](/dla-architektow#checklista).',
      ],
    },
    {
      heading: 'Od czego zależy cena smart home w nowym domu',
      blocks: [
        'Cena zależy od wielkości domu, liczby obwodów światła i rolet, liczby paneli i czujników oraz integracji, np. z pompą ciepła, rekuperacją, alarmem i fotowoltaiką. Do tego dochodzi programowanie scen.',
        'Ważny jest też etap budowy: na etapie elektryki automatyka wychodzi taniej niż w wykończonym domu. Możesz zacząć od światła, rolet i ogrzewania, a resztę dołożyć później do tej samej magistrali, bez wymiany tego, co już działa.',
        'Wstępną wycenę przygotujemy na podstawie projektu domu, który pokażesz nam na spotkaniu albo online.',
      ],
    },
    {
      heading: 'Czy smart home da się zrobić w domu, który już stoi',
      blocks: [
        'Tak, w zakresie zależnym od instalacji elektrycznej. Moduły montujemy w rozdzielnicy, a tam, gdzie nie ma przewodów, łączymy urządzenia bezprzewodowe w standardach obsługiwanych przez Ampio, np. Z-Wave albo ZigBee.',
        'Zwykle trzeba jednak dołożyć część przewodów. Dlatego przy budowie opłaca się zostawić zapas, nawet jeśli smart home ma przyjść za kilka lat.',
      ],
    },
  ],
  seo: {
    title: 'Smart home w nowym domu: co zaplanować',
    description:
      'Smart home w nowym domu planuje się przed tynkami: przewody magistrali, głębokie puszki pod panele, rozdzielnica i czujniki. Lista na budowę od PRO-KOM.',
  },
  extras: {
    toc: [
      'Kiedy zaplanować',
      'Przewody',
      'Puszki pod panele',
      'Rozdzielnica',
      'Ogrzewanie, rolety, brama',
      'Sieć i Wi-Fi',
      'Elektryk i instalator',
      'Od czego zależy cena',
      'Gotowy dom',
    ],
    summary: [
      'Smart home planuj, zanim elektryk położy pierwszy przewód.',
      'Przed tynkami: magistrala do paneli, przewody do rolet, bramy i czujników.',
      'Głębokie puszki pod panele i większa rozdzielnica na moduły.',
      'Zapasowy kabel magistrali pozwala rozbudować system później.',
    ],
    checklist: {
      heading: 'Sprawdź, co masz zaplanowane przed tynkami',
      items: [
        'Skrętka magistrali do każdego panelu',
        'Głębokie puszki pod panele',
        'Przewód do czujnika temperatury w każdej strefie',
        'Osobny przewód do każdej rolety i bramy',
        'Większa rozdzielnica z miejscem na moduły',
        'Dwa zasilacze z redundancją',
        'Miejsce na serwer Ampio i router',
        'Zapasowy kabel magistrali',
      ],
      initial: [0, 1],
      done: 'Komplet. Dom jest gotowy na smart home, nawet jeśli moduły dołożysz później.',
      partial:
        '{n} z {all}. Brakujące punkty uzupełnimy w projekcie, zanim elektryk zamknie ściany.',
    },
    howWeDo: [
      'Rozmawiamy o tym, co ma się dziać w domu, i dobieramy moduły w projekcie.',
      'Okablowanie przed tynkami kładziemy razem z elektrykiem, robimy pomiary i zdjęcia tras.',
      'Montujemy rozdzielnicę i panele, programujemy sceny i uczymy obsługi aplikacji.',
      'Na montaż dajemy 24 miesiące gwarancji, a sceny zmieniamy później zdalnie.',
    ],
    faq: [
      {
        question: 'Czy smart home działa bez internetu?',
        answer:
          'Tak. Moduły, panele i czujniki Ampio pracują lokalnie w budynku, więc sceny i automatyki działają dalej. Internet jest potrzebny tylko do sterowania spoza domu.',
      },
      {
        question: 'Co się stanie, gdy zepsuje się jeden moduł?',
        answer:
          'Przestają działać tylko funkcje tego modułu, a reszta domu pracuje normalnie. Ampio nie ma jednego centralnego sterownika.',
      },
      {
        question: 'A gdy zabraknie prądu?',
        answer:
          'System wyłącza się jak zwykła instalacja i sam startuje po powrocie prądu. Jeśli ma działać przy awarii sieci, dokładamy zasilanie awaryjne.',
      },
      {
        question: 'Czy zostaną zwykłe włączniki?',
        answer:
          'W prostszych układach można je zostawić. Przy większej liczbie funkcji wygodniejsze są szklane panele dotykowe.',
      },
      {
        question: 'Czy połączę smart home z Apple Home albo Google Home?',
        answer:
          'Tak, przez standard Matter na serwerze Ampio. Zakres urządzeń sterowanych głosem ustalamy w projekcie.',
      },
      {
        question: 'Czy jesteście autoryzowanym instalatorem Ampio?',
        answer:
          'Tak, PRO-KOM ma autoryzację Ampio. Gwarancja na moduły jest według warunków producenta, a na montaż dajemy 24 miesiące.',
      },
    ],
    plan: {
      opis: 'smart home w nowym domu: projekt przed tynkami, światło, rolety, ogrzewanie',
      label: 'Zaplanuj smart home w nowym domu',
    },
    art: {
      icon: 'smart',
      alt: 'Ilustracja: dom w budowie z przewodami do paneli smart home',
    },
    aside: {
      title: 'Budujesz? Zaplanujmy smart home razem z elektryką',
      text: 'Projekt, dobór modułów i wstępna wycena na podstawie projektu domu.',
      link: { label: 'Smart home: kiedy zacząć', href: '/smart-home#etapy' },
    },
    readAlso: [
      { label: 'Smart home Ampio', href: '/smart-home' },
      { label: 'Współpraca dla architektów', href: '/dla-architektow' },
      { label: 'Sieć i okablowanie w domu', href: '/sieci-wifi#okablowanie' },
    ],
    band: {
      eyebrow: 'Smart home',
      heading: 'Pokaż nam projekt domu, zanim wejdzie elektryk',
      text: 'Dobierzemy moduły, rozpiszemy przewody i puszki do projektu i przygotujemy wstępną wycenę.',
    },
  },
}

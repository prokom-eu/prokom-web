import type { GuidePostData } from './types'

/**
 * Runda v6 §3.1 no. 3: the alarm in a holiday house that stands empty for months. Facts only from
 * the repo: the Alarmy page (`dane/alarmy.ts`, `Alarmy.json`) and the house page (`obiekty/dom.json`).
 */
export const alarmWDomkuLetniskowym: GuidePostData = {
  slug: 'alarm-w-domku-letniskowym',
  title: 'Alarm w domku letniskowym: jak pilnować pustego domu',
  category: 'alarmy',
  publishedAt: '2026-11-08T14:00:00.000Z',
  lead: 'Pusty domek letniskowy pilnuje alarm z czujkami otwarcia i ruchu oraz czujkami, które działają całą dobę: zalania, temperatury i dymu. Powiadomienie przychodzi na Twój telefon i do osoby, która mieszka blisko, nawet gdy w domu padnie internet albo prąd.',
  sections: [
    {
      heading: 'Czy alarm w domku letniskowym ma sens, skoro jestem daleko',
      blocks: [
        'Ma, bo w pustym domu najcenniejsza jest wiedza na czas. Dowiadujesz się o otwartych drzwiach, wycieku wody, spadku temperatury albo braku prądu w dniu, w którym to się dzieje. Bez alarmu zobaczysz to dopiero przy następnym przyjeździe.',
        'Wtedy dzwonisz do sąsiada, opiekuna domu albo do nas. Domki na Podhalu stoją puste od października i po feriach, a przez ten czas pęknięta rura potrafi zalać cały parter.',
        'Przy wyjeździe po sezonie uzbrajasz alarm jednym przyciskiem w aplikacji. W domu ze smart home Ampio ten sam przycisk przełącza ogrzewanie na temperaturę dyżurną i wyłącza wybrane gniazda.',
      ],
    },
    {
      heading: 'Jakie czujki zamontować w domku letniskowym',
      blocks: [
        'Zestaw do domu letniskowego składamy z dwóch grup czujek. Pierwsza pilnuje wejść i działa po uzbrojeniu alarmu. Druga czuwa całą dobę, także wtedy, gdy alarm jest rozbrojony.',
        [
          '**Czujki otwarcia drzwi i okien:** alarm włącza się, zanim ktoś wejdzie do środka.',
          '**Czujki ruchu:** pilnują pomieszczeń, a modele odporne na zwierzęta ignorują kota czy psa, gdy przyjeżdżasz z nimi na weekend.',
          '**Czujki zalania i temperatury:** pod kotłem, pralką i zmywarką oraz w kotłowni.',
          '**Czujka dymu i czujka czadu:** przy kominku i piecu, z powiadomieniem na telefon.',
          '**Czujka ze zdjęciem:** przy alarmie przesyła serię zdjęć, więc od razu widzisz, czy to włamanie.',
          '**Sygnalizator z lampą:** głośny sygnał i błyskające światło odstraszają i pokazują sąsiadom, gdzie jest alarm.',
        ],
        'Na dużej działce warto dołożyć czujki zewnętrzne. Alarm włącza się wtedy, gdy ktoś jest jeszcze na podwórku, zanim dojdzie do drzwi, a wybrane modele, np. Satel AOD-210, pracują od −40°C.',
        'Pełną listę elementów i to, który do czego służy, znajdziesz w zakładce „Dom letniskowy” na stronie [Alarmy](/alarmy#wersje).',
      ],
    },
    {
      heading: 'Czujka zalania i temperatury w pustym domu zimą',
      blocks: [
        'Zimą w pustym domu najczęściej psuje się ogrzewanie. Piec gaśnie w mroźną noc, temperatura w kotłowni spada, a po kilku dniach zamarzają rury. Czujnik temperatury wyśle powiadomienie, gdy w domu zrobi się zimniej niż kilka stopni, zanim woda w rurach zamarznie.',
        'Czujka zalania leży na podłodze i wykrywa wodę. Przykładowo Satel AFD-200 wykrywa wodę i mierzy temperaturę, a bateria według producenta wystarcza do 5 lat.',
        'Jeśli w domu jest smart home Ampio, może sam zamknąć zawór wody po sygnale z czujki zalania. Ampio trzyma też temperaturę dyżurną i nagrzeje dom przed Twoim przyjazdem.',
      ],
    },
    {
      heading: 'Czy alarm zadziała bez prądu i internetu',
      blocks: [
        'Tak. Centrala alarmu ma akumulator, a przy braku internetu wysyła powiadomienia przez sieć komórkową. Najlepiej mieć dwie drogi powiadomień, np. łącze internetowe i moduł LTE: gdy jedna zawiedzie, działa druga.',
        'Ile wytrzyma akumulator, zależy od systemu i liczby czujek. O samym zaniku prądu też dostajesz powiadomienie, więc wiesz, że po burzy coś trzeba sprawdzić.',
        [
          'Brak internetu w domku: alarm z komunikatorem GSM i tak wyśle powiadomienie.',
          'Podgląd z kamer potrzebuje łącza: proponujemy router LTE z anteną zewnętrzną.',
          'Tam, gdzie LTE nie sięga, zapasem jest łącze satelitarne.',
          'Linie wchodzące do budynku zabezpieczamy ogranicznikami przepięć.',
        ],
      ],
    },
    {
      heading: 'Kto dostaje powiadomienie z alarmu',
      blocks: [
        'Najprościej Ty, przez aplikację i SMS. Do listy dopisujesz osoby, które mogą szybko dojechać: sąsiada, rodzinę albo opiekuna domu. Każda z nich dostaje powiadomienie z nazwą strefy i czujki.',
        'Przy ważnych zdarzeniach alarm może też wysłać SMS albo zadzwonić przez moduł GSM/LTE. Jeśli współpracuje z kamerami, od razu sprawdzisz obraz z chwili alarmu i zdecydujesz, czy trzeba kogoś wysyłać.',
        'Agencja ochrony ma sens, gdy nikt w okolicy nie może zareagować. Sygnał trafia wtedy do całodobowego centrum agencji, które wysyła patrol. To osobna umowa z agencją ochrony.',
      ],
    },
    {
      heading: 'Jak wpuścić sąsiada i ekipę sprzątającą bez klucza pod wycieraczką',
      blocks: [
        'Każda osoba dostaje własny kod do alarmu. W historii zdarzeń widzisz, kto rozbroił alarm i o której, np. „ekipa sprzątająca, 10:02–11:15”.',
        'Sąsiad, który odśnieża, może mieć kod do furtki ważny tylko w wybrane dni. Hydraulikowi otworzysz bramę z aplikacji po rozmowie przez wideodomofon. Po wizycie kod wyłączasz.',
      ],
    },
    {
      heading: 'Alarm bezprzewodowy czy przewodowy w domku letniskowym',
      blocks: [
        'W wykończonym domku zwykle wybieramy alarm bezprzewodowy, bo montaż nie wymaga kucia ścian. Baterie w czujkach wymienia się co kilka lat, a aplikacja przypomina, która czujka tego potrzebuje.',
        'Przewodowy ma sens, gdy domek dopiero powstaje albo przechodzi remont, bo kable prowadzimy razem z elektryką. Porównanie obu wersji jest na stronie [Alarmy](/alarmy#przewod).',
        'W budynku zasięg radiowy jest krótszy niż podawany dla otwartej przestrzeni. Dlatego rozmieszczenie czujek i centrali ustalamy na wizji lokalnej.',
      ],
    },
    {
      heading: 'Alarm w domku na wynajem: o czym pamiętać',
      blocks: [
        'Gdy domek albo apartament wynajmujesz na doby, alarm musi się dogadać z gośćmi i sprzątaniem. Pomagają osobne kody z harmonogramem godzin, czujka zalania z powiadomieniem i tryb pustego lokalu po wyjeździe gości.',
        'Gotowe zestawy dla lokali na wynajem znajdziesz na stronie [Apartamenty na wynajem](/dla-kogo/apartamenty#pakiety).',
        'Sprawdź też warunki swojej polisy. Alarm da Ci wiedzę o zdarzeniu na czas, ale nie zastąpi rolet czy zamków, których wymaga ubezpieczyciel.',
      ],
    },
  ],
  seo: {
    title: 'Alarm w domku letniskowym',
    description:
      'Alarm w domku letniskowym: jakie czujki zamontować, jak działa bez prądu i internetu, kto dostaje powiadomienie i jak wpuścić sąsiada bez klucza.',
  },
  extras: {
    toc: [
      'Czy to ma sens',
      'Jakie czujki',
      'Zalanie i mróz',
      'Bez prądu i internetu',
      'Kto dostaje powiadomienie',
      'Kody zamiast klucza',
      'Radiowy czy przewodowy',
      'Domek na wynajem',
    ],
    summary: [
      'Czujki zalania, temperatury i dymu czuwają całą dobę, także po rozbrojeniu alarmu.',
      'Centrala ma akumulator i wysyła powiadomienia przez sieć komórkową, gdy padnie internet.',
      'Powiadomienie dostajesz Ty i osoby z listy, a na życzenie agencja ochrony.',
      'Sąsiad i sprzątanie mają własne kody, więc w historii widzisz każde wejście.',
    ],
    checklist: {
      heading: 'Sprawdź, czy Twój domek jest gotowy na zimę',
      items: [
        'Drzwi i okna mają czujki otwarcia',
        'Pod kotłem i pralką leży czujka zalania',
        'Czujnik temperatury ostrzeże przed mrozem w kotłowni',
        'Przy kominku jest czujka dymu i czadu',
        'Alarm wyśle powiadomienie bez internetu',
        'Na liście powiadomień jest osoba, która mieszka blisko',
        'Sąsiad i sprzątanie mają własne kody',
      ],
      initial: [0],
      done: 'Domek jest dobrze przygotowany. Przed zimą warto sprawdzić baterie i akumulator.',
      partial:
        '{n} z {all}. Brakujące czujki zwykle dokładamy do istniejącego alarmu bez kucia ścian.',
    },
    howWeDo: [
      'Na wizji lokalnej obchodzimy dom z Tobą: drzwi, okna, kotłownia, zawory i zasięg sieci komórkowej.',
      'Wycenę dostajesz na piśmie, a możesz zacząć od alarmu z czujkami zalania i mrozu.',
      'Po montażu testujemy czujki razem z Tobą i ustawiamy listę osób do powiadomień.',
      'Na montaż dajemy 24 miesiące gwarancji, a na życzenie robimy przegląd przed zimą.',
    ],
    faq: [
      {
        question: 'Czy mogę zacząć od samego alarmu i dołożyć kamery później?',
        answer:
          'Tak. Zaczynamy od alarmu z czujkami zalania i mrozu, a kamery czy smart home dokładamy później. Planujemy to od razu z myślą o rozbudowie.',
      },
      {
        question: 'Czy kot uruchomi alarm, gdy przyjadę na weekend?',
        answer:
          'Stosujemy czujki ruchu odporne na zwierzęta, które ignorują psa lub kota do ok. 20 kg, zależnie od modelu. Gdy zwierzę dużo skacze, proponujemy ochronę drzwi i okien zamiast czujek ruchu.',
      },
      {
        question: 'Jak często wymienia się baterie w czujkach bezprzewodowych?',
        answer:
          'Co kilka lat, zależnie od czujki. Aplikacja pokazuje słabą baterię, a wymianę robimy przy przeglądzie razem z kontrolą akumulatora centrali.',
      },
      {
        question: 'Czy czujka zalania działa, gdy alarm jest rozbrojony?',
        answer:
          'Tak. Czujki zalania, temperatury i dymu czuwają całą dobę. Rozbrojenie wyłącza tylko czujki ruchu i otwarcia.',
      },
      {
        question: 'Czy przejmiecie alarm zamontowany przez inną firmę?',
        answer:
          'Tak. Sprawdzamy czujki, akumulator i łączność, a potem dokładamy to, czego brakuje w pustym domu, np. czujki zalania i temperatury.',
      },
    ],
    plan: {
      opis: 'alarm w domku letniskowym: czujki zalania, mrozu i dymu, powiadomienia',
      label: 'Zaplanuj alarm w domku',
    },
    art: {
      icon: 'bell',
      alt: 'Ilustracja: alarm w domku letniskowym zimą',
    },
    aside: {
      title: 'Alarm do domu, w którym nikt nie mieszka na stałe',
      text: 'Zobacz, jak wygląda zima w pustym domu z czujkami zalania i temperatury.',
      link: { label: 'Alarmy: dom letniskowy', href: '/alarmy#dom-letniskowy' },
    },
    readAlso: [
      { label: 'Alarmy i wideodomofony', href: '/alarmy' },
      { label: 'Dom i domek letniskowy', href: '/dla-kogo/dom' },
      { label: 'Apartamenty na wynajem', href: '/dla-kogo/apartamenty' },
    ],
    band: {
      eyebrow: 'Domek letniskowy',
      heading: 'Przygotujemy Twój domek na zimę bez Ciebie',
      text: 'Obejdziemy dom, dobierzemy czujki i ustawimy powiadomienia. Wycena na piśmie po wizji lokalnej.',
    },
  },
}

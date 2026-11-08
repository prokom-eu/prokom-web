import type { GuidePostData } from './types'

/**
 * Runda v6 §3.1 no. 6: a practical post about a home EV charger — the connection, the
 * distribution board, the place, the power and the cable. No formalities, offices or acts: the
 * facts come from the Ładowarki EV page (`ladowarki.ts`) and its package (`Ladowarki.json`).
 */
export const ladowarkaDoAutaWDomu: GuidePostData = {
  slug: 'ladowarka-do-auta-w-domu',
  title: 'Ładowarka do auta w domu: co sprawdzić przed montażem',
  category: 'ladowarki',
  publishedAt: '2026-11-08T11:00:00.000Z',
  lead: 'Zanim zamontujesz ładowarkę do samochodu elektrycznego w domu, sprawdź pięć rzeczy: moc przyłącza, rozdzielnicę, miejsce na ładowarkę, moc, jakiej potrzebuje Twoje auto, i trasę przewodu. Do wstępnej wyceny wystarczą zdjęcia rozdzielnicy, licznika i miejsca montażu.',
  sections: [
    {
      heading: 'Co sprawdzić przed montażem ładowarki w domu',
      blocks: [
        'Ładowarka to urządzenie, które przez kilka godzin pobiera dużo prądu. Dlatego zaczynamy od instalacji w domu, a model dobieramy na końcu.',
        'Przed montażem warto znać odpowiedzi na kilka pytań:',
        [
          'Ile mocy daje przyłącze i czy dom ma trzy fazy.',
          'Czy w rozdzielnicy jest miejsce na nowe zabezpieczenia.',
          'Gdzie stoi auto i z której strony ma gniazdo ładowania.',
          'Ile kilowatów przyjmuje Twoje auto przy ładowaniu prądem przemiennym (AC).',
          'Jak daleko jest od rozdzielnicy do miejsca montażu i którędy poprowadzić przewód.',
        ],
        'Jeśli znasz te odpowiedzi, wycena i montaż idą szybko. Jeśli nie, sprawdzimy je na wizji lokalnej albo ze zdjęć.',
      ],
    },
    {
      heading: 'Jaka moc przyłącza wystarczy do ładowarki',
      blocks: [
        'Moc przyłącza to ilość prądu, jaką dom może pobrać naraz. Ładowarka dzieli ją z kuchenką, pompą ciepła, bojlerem i resztą domu, więc trzeba sprawdzić, ile zostaje na ładowanie.',
        'Ładowanie z mocą 11 kW wymaga trzech faz. Dom z jedną fazą ładuje z mocą 3,7 albo 7,4 kW. Na liczniku i w rozdzielnicy widać, ile faz masz w domu.',
        'Gdy mocy jest mało, ustawiamy niższą moc ładowarki. Przy kilku stacjach, np. w pensjonacie, ustawiamy dzielenie mocy między nimi. Zanim zaczniesz starać się o większą moc u operatora sieci, sprawdzamy, czy nie wystarczy niższa moc i ładowanie nocą.',
      ],
    },
    {
      heading: 'Czy rozdzielnica w domu nadaje się pod ładowarkę',
      blocks: [
        'Ładowarka dostaje w rozdzielnicy własny obwód z osobnymi zabezpieczeniami. Nie podłączamy jej do gniazdek w garażu, bo te nie są przygotowane na wielogodzinny pobór dużego prądu.',
        'W starszych domach rozdzielnica bywa pełna albo stara. Wtedy trzeba ją rozbudować albo dołożyć małą rozdzielnicę obok. To jedna z rzeczy, które najbardziej zmieniają cenę montażu.',
        'Zrób zdjęcie otwartej rozdzielnicy i licznika. Po zdjęciu zwykle widać, czy wystarczy dołożyć zabezpieczenia, czy trzeba czegoś więcej.',
      ],
    },
    {
      heading: 'Gdzie powiesić ładowarkę w garażu albo pod wiatą',
      blocks: [
        'Ładowarkę wieszamy tam, gdzie auto stoi na noc. Domowa Elzab CC Home ma przewód o długości 5 m albo gniazdo Typ 2, więc liczy się, z której strony auto ma gniazdo ładowania.',
        [
          'Garaż: ładowarka na ścianie przy przodzie albo boku auta, z dala od drzwi garażowych.',
          'Wiata: ściana osłonięta od deszczu i śniegu zsuwającego się z dachu.',
          'Podjazd bez ściany: ładowarka ścienna dla firm i obiektów, CC Wall, może stanąć na podstawie.',
        ],
        'CC Home ma obudowę IP44, czyli odporną na zachlapanie, i pracuje od −25°C. Dobrze sprawdza się w garażu i pod wiatą. Wieszamy ją tak, żeby przewód nie leżał na przejściu i nie wpadał pod koła.',
      ],
    },
    {
      heading: 'Jaką moc ładowarki wybrać do domu',
      blocks: [
        'Do ładowania nocą w domu zwykle wystarcza 7,4 albo 11 kW. Auto stoi w garażu kilka godzin, więc nie potrzebujesz najmocniejszej ładowarki.',
        'Mocniejsza ładowarka nie przyspieszy auta, które przyjmuje mniej. Jeśli auto bierze najwyżej 11 kW prądu przemiennego, ładowarka 22 kW nic nie zmieni. Moc 22 kW ma sens przy dwóch autach naraz albo flocie.',
        'Ile potrwa ładowanie Twojego auta, policzysz w [kalkulatorze czasu ładowania](/ladowarki-ev#kalkulator). Wybierasz baterię, zakres ładowania i moc, a kalkulator pokazuje czas.',
      ],
    },
    {
      heading: 'Jaki przewód poprowadzić od rozdzielnicy do ładowarki',
      blocks: [
        'Przewód zasilający dobieramy do mocy ładowarki i do odległości od rozdzielnicy. Im dalej i im większa moc, tym grubszy przewód.',
        'Trasa ma znaczenie dla ceny. Przewód w garażu przy rozdzielnicy to krótka praca, a przewód do wiaty po drugiej stronie podwórka może wymagać przekopu.',
        'Jeśli dopiero budujesz dom albo garaż, poprowadź przewód pod ładowarkę od razu, nawet jeśli auto kupisz później. Gdy u Ciebie robimy też okablowanie, kamery albo smart home, przewód do ładowarki kładziemy przy okazji.',
      ],
    },
    {
      heading: 'Ładowarka do auta zimą i przy fotowoltaice',
      blocks: [
        'Ładowarki Elzab EcoPower pracują od −25°C. Zimą auto ładuje się wolniej, bo zimna bateria przyjmuje mniej, a w mrozie zasięg wyraźnie spada.',
        'Przy fotowoltaice ładowanie można zaplanować na godziny produkcji z paneli. Czy ładowarka sama dopasuje moc do nadwyżki prądu, zależy od modelu i falownika. Sprawdzamy to przy doborze.',
      ],
    },
    {
      heading: 'Którą ładowarkę Elzab wybrać do domu',
      blocks: [
        'Do domu zwykle wybieramy CC Home: okrągłą ładowarkę na ścianę, bez kart i aplikacji. Podłączasz auto i ładujesz, a stan ładowania widać na diodzie LED.',
        'Gdy w domu są dwa auta albo z ładowarki korzysta ktoś spoza domu, lepsza bywa CC Wall z dwoma punktami i kartami RFID. Różnice widać w [porównaniu ładowarek](/ladowarki-ev#urzadzenia), a wersję i kolor dobierzesz w [konfiguratorze](/ladowarki-ev#model).',
        'Ładowarki produkuje Elzab, polski producent z Zabrza. Dokładny model potwierdzamy po obejrzeniu rozdzielnicy.',
      ],
    },
  ],
  seo: {
    title: 'Ładowarka do auta w domu: co sprawdzić',
    description:
      'Ładowarka do samochodu elektrycznego w domu: sprawdź przyłącze, rozdzielnicę, miejsce, moc i przewód przed montażem. Praktyczny poradnik z Podhala.',
  },
  extras: {
    toc: [
      'Co sprawdzić',
      'Moc przyłącza',
      'Rozdzielnica',
      'Miejsce montażu',
      'Moc ładowarki',
      'Przewód',
      'Zima i fotowoltaika',
      'Który model',
    ],
    summary: [
      '11 kW wymaga trzech faz, przy jednej fazie ładujesz z mocą 3,7 albo 7,4 kW.',
      'Ładowarka ma własny obwód i zabezpieczenia w rozdzielnicy.',
      'Do ładowania nocą zwykle wystarcza 7,4 albo 11 kW.',
      'Cenę najbardziej zmienia odległość od rozdzielnicy i jej stan.',
    ],
    checklist: {
      heading: 'Sprawdź, czy dom jest gotowy na ładowarkę',
      items: [
        'Wiem, ile faz mam w domu',
        'W rozdzielnicy jest miejsce na nowe zabezpieczenia',
        'Wiem, ile kW przyjmuje moje auto (AC)',
        'Ładowarka zawiśnie tam, gdzie auto stoi na noc',
        'Przewód ładowarki sięgnie do gniazda w aucie',
        'Znam trasę przewodu od rozdzielnicy do ładowarki',
        'Mam zdjęcia rozdzielnicy, licznika i miejsca montażu',
      ],
      initial: [0, 3],
      done: 'Wszystko gotowe. Wyślij zdjęcia, a podamy cenę montażu na piśmie.',
      partial: '{n} z {all}. Brakujące punkty sprawdzimy na wizji lokalnej albo ze zdjęć.',
    },
    howWeDo: [
      'Wycenę zaczynamy od rozdzielnicy i licznika: oglądamy je na miejscu albo na zdjęciach.',
      'Moc ładowarki dobieramy do przyłącza i do auta, a cenę podajemy na piśmie.',
      'Prowadzimy przewód z rozdzielnicy, montujemy zabezpieczenia, uruchamiamy i testujemy ładowarkę.',
      'Na montaż dajemy 24 miesiące gwarancji PRO-KOM, ładowarka ma gwarancję producenta.',
    ],
    faq: [
      {
        question: 'Czy mogę ładować auto ze zwykłego gniazdka?',
        answer:
          'Do codziennego ładowania montujemy ładowarkę na osobnym obwodzie z własnymi zabezpieczeniami. Zwykłe gniazdko w garażu nie jest przygotowane na wiele godzin dużego poboru prądu.',
      },
      {
        question: 'Czy do ładowarki 11 kW potrzebuję trzech faz?',
        answer:
          'Tak. Przy jednej fazie CC Home ładuje z mocą 3,7 albo 7,4 kW. Ile faz masz w domu, widać na liczniku i w rozdzielnicy.',
      },
      {
        question: 'Czy montujecie samą ładowarkę?',
        answer:
          'Tak. Możesz zamówić u nas samą ładowarkę Elzab EcoPower z montażem, bez innych instalacji. Jeśli robimy też inne instalacje, przewód do ładowarki prowadzimy przy okazji.',
      },
      {
        question: 'Czy ładowarkę można powiesić na zewnątrz?',
        answer:
          'CC Home montujemy w garażu albo pod wiatą, osłoniętą od deszczu. Na otwarty podjazd lepiej pasuje CC Wall na podstawie, która ma szczelniejszą obudowę.',
      },
      {
        question: 'Co wysłać do wyceny?',
        answer:
          'Zdjęcie otwartej rozdzielnicy, licznika i miejsca, gdzie ma wisieć ładowarka. Napisz też, jakie masz auto i jak daleko jest od rozdzielnicy do miejsca montażu.',
      },
    ],
    plan: {
      opis: 'ładowarka do auta w domu: garaż, rozdzielnica, przyłącze',
      label: 'Zaplanuj ładowarkę w domu',
    },
    art: {
      icon: 'ev',
      alt: 'Ilustracja: ładowarka do auta na ścianie garażu',
    },
    aside: {
      title: 'Dobierzemy ładowarkę do Twojego przyłącza',
      text: 'Sprawdzimy rozdzielnicę i licznik, dobierzemy moc i model. Cena na piśmie.',
      link: { label: 'Ładowarki Elzab EcoPower', href: '/ladowarki-ev' },
    },
    readAlso: [
      { label: 'Ile trwa ładowanie auta', href: '/ladowarki-ev#kalkulator' },
      { label: 'Porównanie ładowarek Elzab', href: '/ladowarki-ev#urzadzenia' },
      { label: 'Instalacje w domu', href: '/dla-kogo/dom' },
    ],
    band: {
      eyebrow: 'Ładowarka w domu',
      heading: 'Sprawdzimy, którą ładowarkę da się u Ciebie podłączyć',
      text: 'Wyślij zdjęcia rozdzielnicy i licznika. Odpowiemy, jaka moc i jaki model pasują do Twojego domu.',
    },
  },
}

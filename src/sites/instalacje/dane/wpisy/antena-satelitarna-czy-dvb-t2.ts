import type { GuidePostData } from './types'

/**
 * Runda v6 §3.1 no. 8: satellite or terrestrial (DVB-T2) antenna in the mountains, with a
 * comparison table. Facts come from the Anteny page (`anteny.ts`) and its package (`Anteny.json`);
 * no acts, licence fees or standard numbers.
 */
export const antenaSatelitarnaCzyDvbT2: GuidePostData = {
  slug: 'antena-satelitarna-czy-dvb-t2',
  title: 'Antena satelitarna czy DVB-T2 na Podhalu',
  category: 'anteny',
  publishedAt: '2026-11-08T09:00:00.000Z',
  lead: 'Satelita daje więcej kanałów, zwykle w pakiecie Polsat Box albo CANAL+, a naziemna DVB-T2 daje kanały z multipleksów bez pakietu u operatora. Na Podhalu o wyborze często decyduje to, czy stok nie zasłania nadajnika, a to sprawdzamy miernikiem.',
  sections: [
    {
      heading: 'Antena satelitarna czy naziemna: od czego zależy wybór',
      blocks: [
        'Zacznij od pytania, jakie kanały chcesz oglądać. Jeśli wystarczą Ci kanały ogólnodostępne, główne kanały TVP, Polsat i TVN, zwykle wystarczy antena naziemna. Jeśli chcesz sport, filmy i kanały tematyczne, potrzebny jest pakiet satelitarny.',
        'Drugie pytanie dotyczy miejsca. W górach nadajnik naziemny bywa zasłonięty przez stok albo las, a satelita na południu nieba bywa zasłonięty przez sąsiedni budynek albo drzewa. Dlatego przed montażem sprawdzamy jedno i drugie miernikiem.',
        [
          'Chcesz kanały bez pakietu u operatora: antena naziemna DVB-T2.',
          'Chcesz więcej kanałów w pakiecie: antena satelitarna.',
          'Pensjonat albo dom z kilkoma telewizorami: często obie, na wspólnej instalacji.',
        ],
      ],
    },
    {
      heading: 'Jakie kanały daje telewizja naziemna DVB-T2',
      blocks: [
        'DVB-T2 to nowy standard telewizji naziemnej, czyli tej z anteny na dachu. Kanały nadawane są w multipleksach, czyli pakietach kanałów.',
        'Pięć z sześciu multipleksów nadaje już w DVB-T2: kanały ogólnodostępne, m.in. Polsat i TVN, główne kanały TVP, pakiet płatny i MUX-6. MUX-8 nadawał jeszcze w starym DVB-T i w paśmie VHF, więc część osób potrzebuje do niego anteny VHF.',
        'Aktualną listę multipleksów i ich standard znajdziesz na stronie [Anteny: multipleksy DVB-T2](/anteny#multipleksy).',
      ],
    },
    {
      heading: 'Co daje antena satelitarna na Hot Bird 13°E',
      blocks: [
        'Polsat Box i CANAL+ nadają z satelitów Hot Bird 13°E. Na Podhalu czasza patrzy na azymut około 189°, lekko na zachód od południa, i około 33° nad horyzont.',
        'Antena satelitarna jest bardzo kierunkowa. Kilka stopni obok i jakość sygnału spada, a obraz zaczyna się rwać. Dlatego kąty wyliczone dla Podhala to tylko start, a na miejscu dokręcamy antenę według miernika.',
        'Antenę można często powiesić na balkonie, jeśli widać z niego południe bez przeszkód. W piwnicy ani w środku budynku nie zadziała, bo musi widzieć satelitę.',
      ],
    },
    {
      heading: 'Dlaczego w górach stok zasłania nadajnik DVB-T2',
      blocks: [
        'Sygnał z nadajnika naziemnego biegnie nisko nad terenem. Stok albo las między domem a nadajnikiem potrafi go zasłonić, nawet gdy sąsiad dwa domy dalej ma dobry odbiór.',
        'Pomaga wyższy maszt, inne miejsce na dachu albo antena kierunkowa ustawiona ponad linią stoku. Kierunek zależy od miejscowości, dlatego zawsze ustawiamy go miernikiem.',
        'Obraz może się też zacinać przez maszt telefonii komórkowej w pobliżu. Silny sygnał LTE i 5G potrafi przeciążyć wzmacniacz antenowy. Czy pomoże filtr, pokazuje pomiar jakości sygnału, opisany na stronie [Anteny: filtr LTE/5G](/anteny#filtr-5g).',
      ],
    },
    {
      heading: 'Czy telewizor odbierze DVB-T2 bez dekodera',
      blocks: [
        'Do odbioru DVB-T2 telewizor musi dekodować obraz w formacie HEVC (H.265). Telewizory sprzedawane od grudnia 2019 powinny to mieć, a wiele modeli z lat 2017–2019 też to obsługuje.',
        'Najprostszy test to wyszukanie kanałów. Jeśli z anteny odbierasz TVP1 i Polsat z obrazem i dźwiękiem, telewizor jest gotowy na DVB-T2.',
        'Jeśli telewizor nie ma HEVC, wystarczy zewnętrzny dekoder. Przy antenie satelitarnej potrzebny jest dekoder operatora albo odbiornik satelitarny, niezależnie od wieku telewizora.',
      ],
    },
    {
      heading: 'Jak podłączyć kilka telewizorów do jednej anteny',
      blocks: [
        'Antenę naziemną łatwo rozprowadzić do kilku telewizorów przewodami. Przy satelicie liczy się liczba dekoderów, bo każdy potrzebuje osobnego sygnału z konwertera, czyli głowicy na antenie.',
        [
          'Do 4 telewizorów: konwerter Quad z czterema niezależnymi wyjściami, bez dodatkowych urządzeń.',
          'Wiele pokoi: konwerter Quattro i multiswitch, czyli rozdzielacz sygnału do każdego gniazda. Można do niego dodać antenę naziemną.',
          'Jeden przewód: Unicable II albo dCSS, do 32 tunerów na jednym kablu. Dobre przy remoncie, gdy nie ma jak dołożyć kabli, ale odbiornik musi obsługiwać ten standard.',
        ],
        'Schematy tych trzech rozwiązań pokazujemy na stronie [Anteny: kilka telewizorów](/anteny#satelita).',
      ],
    },
    {
      heading: 'Antena zimą i w halny: śnieg, wiatr i burze',
      blocks: [
        'Mokry śnieg na czaszy osłabia sygnał satelitarny. Antenę montujemy w miejscu, z którego da się ją bezpiecznie odśnieżyć.',
        'Halny w Zakopanem dawał porywy 33 m/s (grudzień 2013). Mocowania i maszty dobieramy z zapasem, bo przestawiona przez wiatr antena to najczęstszy powód rwącego się obrazu.',
        'Maszt i instalację łączymy z uziemieniem i dokładamy ochronę przepięciową. Przy częstych burzach na Podhalu chroni to telewizory i dekodery przed przepięciem.',
      ],
    },
    {
      heading: 'Czy warto mieć antenę satelitarną i naziemną naraz',
      blocks: [
        'W wielu domach i pensjonatach tak. Naziemna daje kanały bez pakietu, a satelita dokłada kanały z pakietu, i oba sygnały mogą iść jednym przewodem do każdego telewizora przez multiswitch.',
        'W pensjonacie i hotelu robimy wspólny punkt odbioru na dachu i gniazdo w każdym pokoju. Modulator może też dodać własny kanał z recepcji, np. z informacjami o obiekcie, widoczny na każdym telewizorze.',
      ],
    },
  ],
  seo: {
    title: 'Antena satelitarna czy naziemna DVB-T2',
    description:
      'Antena satelitarna czy naziemna na Podhalu: kanały, multipleksy DVB-T2, Hot Bird, stok zasłaniający nadajnik i kilka telewizorów. Porównanie w tabeli.',
  },
  extras: {
    toc: [
      'Od czego zależy wybór',
      'Kanały DVB-T2',
      'Satelita Hot Bird',
      'Stok i nadajnik',
      'Telewizor i dekoder',
      'Kilka telewizorów',
      'Śnieg, halny, burze',
      'Obie anteny',
    ],
    summary: [
      'Naziemna DVB-T2: kanały z multipleksów bez pakietu u operatora.',
      'Satelita Hot Bird 13°E: więcej kanałów, zwykle w pakiecie Polsat Box albo CANAL+.',
      'W górach o odbiorze naziemnej decyduje stok między domem a nadajnikiem.',
      'Obie anteny mogą iść jednym przewodem do każdego telewizora.',
    ],
    table: {
      heading: 'Antena satelitarna i naziemna DVB-T2 w porównaniu',
      caption: 'Porównanie anteny satelitarnej i naziemnej DVB-T2 na Podhalu',
      columns: ['Cecha', 'Antena satelitarna', 'Antena naziemna DVB-T2'],
      rows: [
        [
          'Kanały',
          'więcej kanałów, zwykle w pakiecie Polsat Box albo CANAL+',
          'kanały z multipleksów, m.in. TVP, Polsat i TVN',
        ],
        ['Pakiet u operatora', 'zwykle płatny', 'niepotrzebny'],
        ['Skąd sygnał', 'satelity Hot Bird 13°E, na południu nieba', 'nadajnik naziemny w okolicy'],
        [
          'Ustawienie',
          'bardzo kierunkowa, kilka stopni zmienia odbiór',
          'mniej kierunkowa, liczy się kierunek i wysokość',
        ],
        [
          'Co przeszkadza w górach',
          'drzewa i budynki od południa, mokry śnieg na czaszy',
          'stok albo las między domem a nadajnikiem',
        ],
        [
          'Sprzęt przy telewizorze',
          'dekoder operatora albo odbiornik satelitarny',
          'telewizor z HEVC albo zewnętrzny dekoder',
        ],
        [
          'Kilka telewizorów',
          'konwerter Quad, multiswitch albo jeden przewód (Unicable)',
          'rozprowadzenie przewodami do gniazd',
        ],
        [
          'Montaż',
          'dach, ściana albo balkon z widokiem na południe',
          'dach albo maszt ponad stokiem',
        ],
      ],
    },
    howWeDo: [
      'Przed montażem sprawdzamy miernikiem, czy w danym miejscu jest sygnał z satelity i z nadajnika.',
      'Antenę ustawiamy profesjonalnym miernikiem poziomu i jakości sygnału, a wynik pokazujemy przy odbiorze.',
      'Mocowania dobieramy z zapasem na halny, instalację uziemiamy i mierzymy sygnał w każdym gnieździe.',
      'Na montaż dajemy 24 miesiące gwarancji PRO-KOM, a po gwarancji dalej opiekujemy się instalacją.',
    ],
    faq: [
      {
        question: 'Która antena jest lepsza w górach?',
        answer:
          'To zależy od miejsca. Jeśli stok zasłania nadajnik, satelita bywa jedynym pewnym źródłem sygnału. Jeśli od południa stoją drzewa albo budynki, łatwiej o dobry odbiór z anteny naziemnej.',
      },
      {
        question: 'Czy mogę zamontować antenę satelitarną na balkonie?',
        answer:
          'Często tak, jeśli z balkonu widać południe bez przeszkód. Antena musi widzieć satelitę, więc w środku budynku nie zadziała.',
      },
      {
        question: 'Obraz rwie się przy złej pogodzie. Co robić?',
        answer:
          'Najczęściej antena jest lekko przestawiona albo złącze zawilgło. Sprawdzamy to miernikiem i ustawiamy antenę ponownie.',
      },
      {
        question: 'Czy do anteny naziemnej potrzebuję wzmacniacza?',
        answer:
          'Nie zawsze. Decyduje pomiar sygnału na miejscu. Przy maszcie telefonii w pobliżu czasem zamiast mocniejszego wzmacniacza pomaga filtr LTE/5G.',
      },
      {
        question: 'Czy w pensjonacie każdy pokój potrzebuje własnej anteny?',
        answer:
          'Nie. Robimy jeden punkt odbioru na dachu, multiswitch i gniazdo w każdym pokoju. Satelita i naziemna mogą iść razem jednym przewodem.',
      },
    ],
    plan: {
      opis: 'antena satelitarna i naziemna DVB-T2: dom, kilka telewizorów',
      label: 'Zaplanuj montaż anteny',
    },
    art: {
      icon: 'dish',
      alt: 'Ilustracja: antena satelitarna i naziemna na dachu domu',
    },
    aside: {
      title: 'Sprawdzimy odbiór miernikiem przed montażem',
      text: 'Satelita czy naziemna, gdzie powiesić antenę i ile telewizorów podłączyć. Cena na piśmie.',
      link: { label: 'Anteny satelitarne i DVB-T2', href: '/anteny' },
    },
    readAlso: [
      { label: 'Anteny w górach', href: '/anteny#gory' },
      { label: 'Telewizja w każdym pokoju', href: '/anteny#pensjonat-tv' },
      { label: 'Instalacje w pensjonatach', href: '/dla-kogo/pensjonaty' },
    ],
    band: {
      eyebrow: 'Anteny',
      heading: 'Ustawimy antenę miernikiem i podłączymy telewizory',
      text: 'Napisz, ile masz telewizorów i gdzie stoi dom. Sprawdzimy, czy lepsza będzie satelita, naziemna czy obie.',
    },
  },
}

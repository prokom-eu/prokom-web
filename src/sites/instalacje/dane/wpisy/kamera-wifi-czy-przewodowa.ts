import type { GuidePostData } from './types'

/**
 * Runda v6 §3.1 no. 2 (INST-6 PR5): Wi-Fi or wired camera for a house. Facts from the Monitoring
 * page (`dane/monitoring.ts`: PoE, recorder, UPS, separate camera network, FAQ on cable length and
 * working without internet) and the Sieci page (`dane/sieci.ts`: walls, mesh hops, VLANs, radio
 * links). No numbers for Wi-Fi cameras: the repo has no data on them.
 * TODO(krystian): confirm whether PRO-KOM installs Wi-Fi cameras at all — the post only advises.
 */
export const kameraWifiCzyPrzewodowa: GuidePostData = {
  slug: 'kamera-wifi-czy-przewodowa',
  title: 'Kamera Wi-Fi czy przewodowa? Co wybrać do domu',
  category: 'monitoring',
  publishedAt: '2026-11-08T15:00:00.000Z',
  lead: 'Na zewnątrz domu wybierz kamerę przewodową: jeden kabel daje jej prąd i przesyła obraz do rejestratora, więc nagrywa także przy słabym Wi-Fi. Kamera Wi-Fi sprawdzi się w środku domu albo tam, gdzie kabla nie da się poprowadzić, ale i tak potrzebuje zasilania.',
  sections: [
    {
      heading: 'Czym różni się kamera Wi-Fi od kamery przewodowej',
      blocks: [
        'Obie kamery robią to samo: pokazują obraz w telefonie i wysyłają powiadomienia. Różnią się drogą, którą obraz trafia do nagrywania.',
        'Kamera przewodowa jest podłączona kablem sieciowym do rejestratora albo switcha. Kamera Wi-Fi wysyła obraz radiowo przez domowy router, tak jak telefon czy laptop.',
        'Od tej drogi zależy, czy nagranie będzie ciągłe w nocy, przy mrozie i wtedy, gdy domownicy oglądają filmy w internecie.',
      ],
    },
    {
      heading: 'Czy kamera Wi-Fi naprawdę jest bez kabli',
      blocks: [
        'Kamera Wi-Fi bez kabla sieciowego nadal potrzebuje prądu: z zasilacza w gniazdku albo z akumulatora, który trzeba ładować.',
        'Na elewacji oznacza to przewód zasilający do gniazdka albo puszki, często tak samo długi jak kabel sieciowy. Kamera z akumulatorem obywa się bez przewodu, ale co jakiś czas trzeba ją zdjąć i naładować, a zimą akumulatory słabną szybciej.',
      ],
    },
    {
      heading: 'Kiedy kamera Wi-Fi traci obraz',
      blocks: [
        'Kamera Wi-Fi jest tak dobra, jak zasięg w miejscu, gdzie wisi. Beton, cegła, kamień i stropy osłabiają sygnał, a kamera na rogu domu od strony ogrodu bywa poza zasięgiem routera z przedpokoju.',
        'Słabszy sygnał to rwący się obraz, opóźnione powiadomienia i dziury w nagraniach. Mesh, czyli punkty Wi-Fi połączone ze sobą radiowo, pomaga tylko częściowo, bo każdy taki skok obniża prędkość.',
        'Kamera dzieli też sieć z resztą domu. Gdy domownicy oglądają filmy, kamera wysyła obraz tym samym łączem. Dlaczego Wi-Fi słabnie w części domu, opisujemy na stronie [Sieci i Wi-Fi](/sieci-wifi#dlaczego).',
        'Zanim kupisz kamerę Wi-Fi na zewnątrz, stań z telefonem w miejscu, gdzie ma wisieć, i sprawdź, czy film w internecie odtwarza się płynnie. Jeśli telefon ma tam kłopot z siecią, kamera też będzie go miała.',
      ],
    },
    {
      heading: 'Zalety kamery przewodowej z zasilaniem PoE',
      blocks: [
        'Kamera przewodowa korzysta z PoE, czyli zasilania przez kabel sieciowy. Jeden przewód daje jej prąd i przesyła obraz, więc przy kamerze nie trzeba gniazdka.',
        'Wszystkie kable schodzą się w jednym miejscu, zwykle w pomieszczeniu technicznym albo w szafce, gdzie stoi rejestrator. Dzięki temu serwisant od razu wie, który przewód prowadzi do której kamery.',
        [
          'Obraz idzie kablem, więc zasięg Wi-Fi i ruch w domowej sieci nie mają na niego wpływu.',
          'Rejestrator nagrywa wszystkie kamery naraz i trzyma nagrania w domu.',
          'Kabel sieciowy wystarcza do około 90 metrów, a dalej pomaga dodatkowy switch albo światłowód.',
          'Zasilacz awaryjny pod rejestratorem podtrzymuje wszystkie kamery naraz.',
        ],
        'Z czego składa się taki zestaw dla domu, pokazujemy na schemacie na stronie [Monitoring](/monitoring#system).',
      ],
    },
    {
      heading: 'Gdzie kamera Wi-Fi zapisuje nagrania',
      blocks: [
        'Wiele kamer Wi-Fi zapisuje nagrania na karcie pamięci w samej kamerze albo w chmurze producenta. Karta jest w kamerze, więc złodziej, który ją zerwie, zabiera też nagranie. Chmura zwykle oznacza abonament.',
        'Kamera przewodowa nagrywa na rejestrator w domu, na dysk zaprojektowany do zapisu przez całą dobę. Nie płacisz abonamentu za chmurę, a nagrania zostają u Ciebie. Część kamer Wi-Fi da się podłączyć do rejestratora, ale zależy to od modelu i producenta.',
      ],
    },
    {
      heading: 'Kamera Wi-Fi czy przewodowa zimą i w czasie burzy',
      blocks: [
        'Na Podhalu kamera musi wytrzymać mróz, śnieg na obudowie i halny. Zakres pracy różni się między modelami, dlatego przy każdej kamerze, przewodowej i Wi-Fi, sprawdzamy go w karcie modelu.',
        'Przy kamerze przewodowej burzę zostawiamy ogranicznikom przepięć: przy kamerze i przy wejściu kabla do budynku, oba uziemione. Gdy zabraknie prądu, zasilacz awaryjny trzyma rejestrator, switch i kamery. Kamera Wi-Fi przestaje nagrywać razem z routerem, jeśli router nie ma swojego zasilania awaryjnego.',
      ],
    },
    {
      heading: 'Jak zabezpieczyć kamery w domowej sieci',
      blocks: [
        'Każde urządzenie w sieci da się zaatakować, jeśli jest źle ustawione. Dotyczy to kamer Wi-Fi i przewodowych tak samo.',
        [
          'Zmień hasła fabryczne w kamerach i rejestratorze.',
          'Aktualizuj oprogramowanie kamer.',
          'Daj kamerom osobną sieć, oddzieloną od Wi-Fi domowników i gości.',
          'Nie wystawiaj rejestratora wprost do internetu.',
        ],
        'Jak podzielić jedną sieć na kilka osobnych, pokazujemy na stronie [Sieci i Wi-Fi](/sieci-wifi#podzial).',
      ],
    },
    {
      heading: 'Kiedy kamera Wi-Fi ma sens',
      blocks: [
        'Kamera Wi-Fi sprawdza się w środku domu, blisko routera: w przedpokoju, w salonie, przy drzwiach do garażu. Przyda się też w mieszkaniu, w którym nie chcesz kuć ścian, i tam, gdzie kamera ma wisieć tylko przez jakiś czas.',
        'Gdy kamera ma pilnować drugiego budynku albo bramy daleko od domu, a kabla nie da się przekopać, lepszy bywa most radiowy. To osobne połączenie punkt–punkt, które przenosi obraz kamer przewodowych z drugiego budynku do rejestratora.',
        'Na zewnątrz, przy furtce, podjeździe i w ogrodzie, zalecamy kamery przewodowe. Kabel kładzie się raz, a kamera nagrywa bez względu na zasięg Wi-Fi.',
      ],
    },
  ],
  seo: {
    title: 'Kamera Wi-Fi czy przewodowa do domu',
    description:
      'Kamera Wi-Fi czy przewodowa do domu: zasięg, zasilanie, nagrania na karcie albo w rejestratorze, mróz i burza. Porównanie i podpowiedź, co wybrać.',
  },
  extras: {
    toc: [
      'Czym się różnią',
      'Czy Wi-Fi jest bez kabli',
      'Kiedy Wi-Fi traci obraz',
      'Zalety PoE',
      'Gdzie są nagrania',
      'Zima i burza',
      'Bezpieczeństwo w sieci',
      'Kiedy Wi-Fi ma sens',
    ],
    summary: [
      'Kamera Wi-Fi też potrzebuje prądu: z gniazdka albo z akumulatora.',
      'Ściany i stropy osłabiają Wi-Fi, a słaby sygnał to dziury w nagraniach.',
      'Kamera przewodowa PoE dostaje prąd i przesyła obraz jednym kablem do rejestratora.',
      'Na zewnątrz domu wybierz kamerę przewodową, Wi-Fi zostaw do środka.',
    ],
    table: {
      heading: 'Kamera Wi-Fi i przewodowa: porównanie',
      caption: 'Porównanie kamery Wi-Fi i kamery przewodowej z zasilaniem PoE w domu',
      columns: ['Cecha', 'Kamera Wi-Fi', 'Kamera przewodowa (PoE)'],
      rows: [
        ['Zasilanie', 'Zasilacz w gniazdku albo akumulator', 'Ten sam kabel, którym idzie obraz'],
        ['Przesyłanie obrazu', 'Radiowo przez domowy router', 'Kablem sieciowym do rejestratora'],
        ['Zasięg', 'Zależy od Wi-Fi, ścian i stropów', 'Kabel do około 90 metrów, dalej switch'],
        [
          'Gdzie są nagrania',
          'Karta w kamerze albo chmura producenta',
          'Rejestrator z dyskiem w domu',
        ],
        [
          'Brak prądu',
          'Nagrywa, jeśli router ma zasilanie',
          'UPS podtrzymuje rejestrator i kamery',
        ],
        ['Montaż', 'Prostszy, bez kabla sieciowego', 'Trzeba poprowadzić kabel do każdej kamery'],
        ['Najlepsze miejsce', 'W środku domu, blisko routera', 'Furtka, podjazd, ogród, garaż'],
      ],
    },
    howWeDo: [
      'Na wizji lokalnej sprawdzamy, którędy poprowadzić kable do kamer i gdzie stanie rejestrator.',
      'Kamery zewnętrzne zasilamy przez PoE, a na trasie kabla montujemy ograniczniki przepięć.',
      'Kamerom dajemy osobną sieć, zmieniamy hasła fabryczne i nie wystawiamy rejestratora do internetu.',
      'Na montaż dajemy 24 miesiące gwarancji, a przed zimą robimy przegląd kamer i dysku.',
    ],
    faq: [
      {
        question: 'Czy kamera Wi-Fi nagrywa, gdy nie ma internetu?',
        answer:
          'Zależy, gdzie zapisuje. Kamera z kartą pamięci nagrywa dalej, jeśli działa domowa sieć. Kamera, która zapisuje tylko w chmurze, bez internetu niczego nie zachowa.',
      },
      {
        question: 'Czy kamerę Wi-Fi można podłączyć do rejestratora?',
        answer:
          'Część modeli tak, ale zależy to od producenta kamery i rejestratora. Sprawdzamy to w karcie modelu przed zakupem.',
      },
      {
        question: 'Czy da się poprowadzić kabel do kamery w gotowym domu?',
        answer:
          'Zwykle tak. Kabel prowadzimy po elewacji w osłonie, przez strych albo w istniejących wnękach. Trasę ustalamy na wizji lokalnej, bo ma wpływ na wycenę.',
      },
      {
        question: 'Czy wzmacniacz Wi-Fi poprawi obraz z kamery w ogrodzie?',
        answer:
          'Czasem trochę, ale wzmacniacz z gniazdka zwykle przenosi problem dalej. Pewniejszy jest punkt dostępowy podłączony kablem albo kamera przewodowa.',
      },
      {
        question: 'Mam stare kamery na kablu. Trzeba wszystko wymieniać?',
        answer:
          'Nie zawsze, bo często da się zostawić część okablowania albo podłączyć istniejące kamery do nowego rejestratora. Sprawdzamy to na miejscu.',
      },
    ],
    plan: {
      opis: 'kamery do domu: przewodowe na zewnątrz, furtka i podjazd',
      label: 'Zaplanuj kamery do domu',
    },
    art: {
      icon: 'cam',
      alt: 'Ilustracja: kamera przewodowa na elewacji i kamera Wi-Fi w domu',
    },
    aside: {
      title: 'Doradzimy, jakie kamery wybrać',
      text: 'Sprawdzimy trasy kabli i zasięg Wi-Fi w Twoim domu. Wycena na piśmie po wizji lokalnej.',
      link: { label: 'Monitoring: z czego składa się zestaw', href: '/monitoring#system' },
    },
    readAlso: [
      { label: 'Monitoring domu i firmy', href: '/monitoring' },
      { label: 'Sieci i Wi-Fi', href: '/sieci-wifi' },
      { label: 'Dom i domek letniskowy', href: '/dla-kogo/dom' },
    ],
    band: {
      eyebrow: 'Kamery do domu',
      heading: 'Pomożemy wybrać kamery i poprowadzić kable',
      text: 'Przyjedziemy, sprawdzimy trasy kabli i zasięg Wi-Fi, a potem przygotujemy wycenę na piśmie.',
    },
  },
}

import type { GuidePostData } from './types'

/**
 * Runda v6 §3.1 no. 7: cameras in a mountain winter. Facts only from the repo: the Monitoring page
 * (`dane/monitoring.ts`, `Monitoring.json`), the home page (`glownaSekcje.ts`: −28,5°C) and the
 * object pages (`obiekty/dom.json`, `obiekty/hotel.json`).
 */
export const monitoringZimaWGorach: GuidePostData = {
  slug: 'monitoring-zima-w-gorach',
  title: 'Monitoring zimą w górach: mróz, śnieg i wiatr',
  category: 'monitoring',
  publishedAt: '2026-11-08T00:00:00.000Z',
  lead: 'Kamera na mróz w górach to model z zakresem pracy co najmniej do −30°C i szczelną obudową IP67, zamontowany pod okapem albo z daszkiem. Do tego potrzebne są wykrywanie ludzi i aut, które nie reaguje na padający śnieg, oraz rejestrator i zasilacz awaryjny w ciepłym pomieszczeniu.',
  sections: [
    {
      heading: 'Jaka kamera na mróz sprawdzi się na Podhalu',
      blocks: [
        'Na Podhalu zima potrafi być naprawdę ostra. W Kotlinie Orawsko-Nowotarskiej 7 lutego 2023 r. termometry pokazały −28,5°C. Kamera, która stoi na zewnątrz cały rok, musi to wytrzymać bez przerw w nagraniu.',
        'Dobieramy modele z zakresem pracy co najmniej do −30°C, a wybrane kamery pracują od −40°C. Przykładowo Dahua IPC-HDBW3441R-AS-P pracuje od −40 do +60°C.',
        'Zakres pracy różni się między modelami tej samej marki. Dlatego sprawdzamy go w karcie każdej kamery, zanim trafi na elewację.',
      ],
    },
    {
      heading: 'Co oznacza IP67 i IK10 w kamerze zewnętrznej',
      blocks: [
        'To oznaczenia odporności obudowy. IP67 mówi, że kamera jest szczelna na pył i wodę, więc topniejący śnieg i deszcz nie dostaną się do środka.',
        'IK10 to odporność na uderzenia. Przydaje się tam, gdzie kamera wisi nisko albo może w nią trafić bryła lodu z dachu.',
        [
          'IP67: szczelność na wodę i pył, minimum na zewnątrz w górach.',
          'IK10: odporność na uderzenia, przy wejściach i nisko zawieszonych kamerach.',
          'Zakres temperatur: z karty modelu, co najmniej do −30°C.',
        ],
      ],
    },
    {
      heading: 'Jak zamontować kamerę, żeby nie zasypał jej śnieg',
      blocks: [
        'Kamerę montujemy pod okapem albo z daszkiem, żeby śnieg nie zasypywał obiektywu. Kopułka bez daszka zbiera krople i szron, więc zawsze wieszamy ją pod okapem.',
        'Tubowa kamera ma własny daszek i łatwo ją wycelować daleko, np. na wjazd albo parking. Rodzaje kamer i miejsca, w których się sprawdzają, opisujemy na stronie [Monitoring](/monitoring#typy).',
        // TODO(krystian): a sentence on mounting against the halny wind (rigid bracket, wall) —
        // no source in the repo yet, so the text only covers trees moving in the wind.
        'Wiatr szkodzi kamerze inaczej: kołysze drzewami i gałęziami w kadrze, a każdy taki ruch może skończyć się powiadomieniem. Dlatego kadr ustawiamy tak, żeby drzewa zajmowały jak najmniej obrazu.',
      ],
    },
    {
      heading: 'Dlaczego kamera zimą wysyła setki powiadomień',
      blocks: [
        'Śnieg, szron i płatki w świetle podczerwieni wyglądają dla kamery jak ruch. Bez analizy obrazu każdy taki płatek to alarm, a po kilku dniach przestajesz czytać powiadomienia.',
        'Pomaga wykrywanie ludzi i aut, np. Hikvision AcuSense albo Dahua WizSense. Kamera odróżnia człowieka i samochód od liści, śniegu i zwierząt, więc powiadomienie przychodzi wtedy, gdy na parkingu naprawdę ktoś się pojawi.',
      ],
    },
    {
      heading: 'Jak kamera widzi w nocy, gdy wszędzie leży śnieg',
      blocks: [
        'Śnieg odbija światło latarni i reflektorów aut, a obraz potrafi się prześwietlić. Po montażu ustawiamy go pod odblask od śniegu i wieczorne światło na Twojej posesji.',
        'Kamery z jasnym obiektywem F1.0 i ciepłym doświetleniem pokazują kolory po zmroku. Tam, gdzie białe światło przeszkadza gościom, stawiamy na dyskretną podczerwień.',
        'Przy narciarni, garażu albo zapleczu sprawdza się kamera z odstraszaniem: ma białe światło, syrenę i głośnik. Syrenę ustawiamy z harmonogramem, żeby nie budziła gości przy każdym wyjściu po narty.',
      ],
    },
    {
      heading: 'Ile nagrań zmieści dysk zimą',
      blocks: [
        'Mniej niż latem. Noc, padający śnieg i drzewa na wietrze zwiększają strumień danych z kamery, więc ten sam dysk wystarcza na krótszy czas.',
        'Pojemność dysku liczymy z liczby kamer, rozdzielczości i czasu przechowywania nagrań, z zapasem na zimę. Sam możesz to sprawdzić w [kalkulatorze nagrań](/monitoring#nagrania).',
        'W rejestratorze montujemy dyski zaprojektowane do zapisu przez całą dobę, np. WD Purple albo Seagate SkyHawk. Zwykły dysk komputerowy szybciej się zużywa.',
      ],
    },
    {
      heading: 'Gdzie postawić rejestrator, switch i zasilacz awaryjny',
      blocks: [
        'Rejestrator i szafę z urządzeniami montujemy w ogrzewanym pomieszczeniu. Zwykły switch pracuje od ok. −10°C, dlatego w nieogrzewanej skrzynce na zewnątrz stosujemy switch przemysłowy, który znosi −40°C.',
        'Zasilacz awaryjny UPS trzyma nagrywanie, gdy zabraknie prądu. Mały UPS to zwykle około godziny pracy, a kilka godzin wymaga dodatkowej baterii. Akumulatory słabną z wiekiem i w zimnie, dlatego sprawdzamy je przy przeglądzie.',
        'Zimą zdarza się oblodzenie linii, a latem burze. Ogranicznik przepięć przy kamerze i przy wejściu kabla do budynku chroni rejestrator i switch przed skokiem napięcia.',
        'Kamerę przy bramie albo w drugim budynku łączymy z rejestratorem światłowodem albo mostem radiowym. Światłowód nie przewodzi prądu, więc burza nie przeniesie po nim przepięcia między budynkami.',
      ],
    },
    {
      heading: 'Monitoring w hotelu i pensjonacie przed sezonem zimowym',
      blocks: [
        'W ferie, Sylwestra i długie weekendy hotel nie ma okna na prace. Montaż i większe zmiany planujemy na listopad, kwiecień i maj, a serwis w sezonie prowadzimy w dużej części zdalnie.',
        'Przed zimą warto sprawdzić kamery wjazdu, parkingu, wejść i zaplecza: przetrzeć obiektywy, przetestować dysk i nagrania, zaktualizować oprogramowanie. Więcej o tym, jak pracujemy w hotelach na Podhalu, przeczytasz na stronie [Hotele](/dla-kogo/hotele#gory).',
        'Kamery w hotelu mają własną sieć, oddzieloną od Wi-Fi gości, kas i komputerów. Goście korzystają z internetu, ale nie zobaczą obrazu z kamer, nawet gdy w sezonie w sieci jest kilkaset telefonów.',
      ],
    },
  ],
  seo: {
    title: 'Kamera na mróz: monitoring w górach',
    description:
      'Kamera na mróz w górach: jaki zakres temperatur wybrać, jak zamontować ją pod śnieg i wiatr, jak ograniczyć fałszywe alarmy i ile nagrań zmieści dysk zimą.',
  },
  extras: {
    toc: [
      'Kamera na mróz',
      'IP67 i IK10',
      'Montaż pod śnieg',
      'Fałszywe powiadomienia',
      'Noc i śnieg',
      'Dysk zimą',
      'Rejestrator i UPS',
      'Hotel przed sezonem',
    ],
    summary: [
      'Kamera do gór: zakres pracy co najmniej do −30°C i obudowa IP67, wybrane modele od −40°C.',
      'Montaż pod okapem albo z daszkiem, żeby śnieg nie zasypywał obiektywu.',
      'Wykrywanie ludzi i aut ogranicza powiadomienia od padającego śniegu.',
      'Rejestrator i UPS w ciepłym pomieszczeniu, na zewnątrz tylko switch przemysłowy.',
    ],
    table: {
      heading: 'Na co zwrócić uwagę przy kamerze na mróz',
      caption: 'Elementy monitoringu w górach i to, co sprawdzamy przy doborze',
      columns: ['Element', 'Co sprawdzamy', 'Dlaczego w górach'],
      rows: [
        ['Kamera', 'Zakres pracy w karcie modelu, IP67', 'Mróz do −28,5°C i mokry śnieg'],
        ['Miejsce montażu', 'Okap albo daszek, sztywny uchwyt', 'Śnieg na obiektywie, wiatr'],
        ['Analiza obrazu', 'Wykrywanie ludzi i aut', 'Płatki śniegu w podczerwieni'],
        ['Dysk', 'Pojemność z zapasem na zimę', 'Śnieg i noc zwiększają strumień'],
        ['Switch', 'Przemysłowy w nieogrzewanej skrzynce', 'Zwykły pracuje od ok. −10°C'],
        ['UPS', 'Czas pracy i stan akumulatora', 'Akumulatory słabną w zimnie'],
      ],
    },
    howWeDo: [
      'Na wizji lokalnej sprawdzamy, gdzie zbiera się śnieg, skąd wieje i jak oświetlony jest teren nocą.',
      'Zakres pracy każdej kamery sprawdzamy w karcie modelu, a montujemy pod okapem albo z daszkiem.',
      'Po montażu ustawiamy wykrywanie ludzi i aut oraz obraz pod odblask od śniegu.',
      'Przed sezonem robimy przegląd: czyszczenie kamer, test dysku i nagrań, kontrola UPS-a.',
    ],
    faq: [
      {
        question: 'Czy kamera Wi-Fi z marketu wytrzyma zimę w górach?',
        answer:
          'Zależy od zakresu pracy i szczelności podanych w karcie modelu. Na zewnątrz w górach dobieramy kamery co najmniej do −30°C z obudową IP67, więc sprawdź kartę przed zakupem.',
      },
      {
        question: 'Czy kamera sama się rozmrozi po opadach śniegu?',
        answer:
          'Śnieg na obudowie zwykle nie przeszkadza, gorszy jest śnieg na obiektywie. Dlatego kamery wieszamy pod okapem albo z daszkiem.',
      },
      {
        question: 'Co się stanie z nagraniem, gdy zimą zabraknie prądu?',
        answer:
          'Z zasilaczem awaryjnym UPS system nagrywa dalej: od około godziny w małym zestawie do kilku godzin z dodatkową baterią. Bez UPS-a nagrywanie staje razem z prądem.',
      },
      {
        question: 'Jak daleko od budynku może stać kamera na parkingu?',
        answer:
          'Do około 90 metrów wystarcza kabel sieciowy. Dalej stawiamy dodatkowy switch, kładziemy światłowód albo łączymy kamerę radiowo.',
      },
      {
        question: 'Czy przegląd przed zimą da się zrobić zdalnie?',
        answer:
          'Część tak: dysk, nagrania i aktualizacje sprawdzimy zdalnie. Obiektywy i mocowania wymagają wizyty, a do obiektów na Podhalu dojeżdżamy z Rabki-Zdroju.',
      },
    ],
    plan: {
      opis: 'monitoring na zimę w górach: parking, wjazd, wejście',
      label: 'Zaplanuj kamery na zimę',
    },
    art: {
      icon: 'snow',
      alt: 'Ilustracja: kamera pod okapem w śniegu',
    },
    aside: {
      title: 'Kamery dobrane do górskiej zimy',
      text: 'Zakres pracy z karty modelu, montaż pod okapem, wykrywanie ludzi i aut. Wycena po wizji lokalnej.',
      link: { label: 'Monitoring: jak dobieramy kamery', href: '/monitoring#sprzet-kamery' },
    },
    readAlso: [
      { label: 'Monitoring i kamery', href: '/monitoring' },
      { label: 'Instalacje dla hoteli', href: '/dla-kogo/hotele' },
      { label: 'Przegląd przed sezonem', href: '/serwis#plany' },
    ],
    band: {
      eyebrow: 'Kamery na zimę',
      heading: 'Sprawdzimy Twój monitoring przed zimą',
      text: 'Obiektywy, dysk, nagrania i zasilacz awaryjny. Przegląd planujemy przed sezonem, żeby w ferie wszystko działało.',
    },
  },
}

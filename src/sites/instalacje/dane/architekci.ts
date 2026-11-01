import type { ServiceKey } from '@/lib/instalacje/options'

import type { InstIconName } from '../icons'

/*
 * Texts of the page `/dla-architektow` (ADR-I005 §1, spec `prokominstalacje-architekci.md`),
 * from `seed/prokominstalacje/architekci/strona.json` (= `zrodlo/pages/Architekci.js`) and the
 * template `Architekci.body.html`, 1:1 except: no `[SZEF…]` notes on the page (open questions
 * for the boss, `TODO(krystian)` below). Numbers only from
 * `docs/strony/prokominstalacje-architekci-zrodla.md` — a new number = an entry there. The hero
 * is edited in the panel (block `instArchitects`); service names, captions, icons, colours and
 * addresses come from the panel by key.
 */

type Audience = {
  key: string
  name: string
  icon: InstIconName
  heading: string
  text: string
  points: string[]
  cta: { label: string; href: string }
}
type Stage = {
  title: string
  caption: string
  best: boolean
  weDo: string[]
  youGet: string[]
  investor: string[]
}
type Installation = {
  big: boolean
  heading: string
  text: string
  plan: string[]
  look: string[]
  brands: string
}

export const architekci = {
  hero: {
    buttons: [
      { label: 'Wyślij rzuty do konsultacji', href: '#wyslij', icon: 'upload', primary: true },
      { label: 'Umów prezentację dla pracowni', href: '#pokaz', icon: null, primary: false },
    ] as { label: string; href: string; icon: InstIconName | null; primary: boolean }[],
  },
  anchorsLabel: 'Na tej stronie',
  /** Anchor bar (`anc`), 12 sections. */
  anchors: [
    { id: 'dla-ciebie', label: 'Dla kogo' },
    { id: 'etapy', label: 'Etapy projektu' },
    { id: 'checklista', label: 'Checklista' },
    { id: 'liczby', label: 'Liczby do projektu' },
    { id: 'instalacje', label: 'Instalacje' },
    { id: 'nowosci', label: 'Nowe rozwiązania' },
    { id: 'deweloperzy', label: 'Deweloperzy' },
    { id: 'przepisy', label: 'Przepisy' },
    { id: 'doswiadczenie', label: 'Doświadczenie' },
    { id: 'biblioteka', label: 'Biblioteka' },
    { id: 'faq', label: 'Pytania' },
    { id: 'wyslij', label: 'Wyślij rzuty' },
  ],
  /** Sections folded on a phone and their height (`zrodlo/fold.json` → `Architekci`). */
  fold: {
    problemy: 700,
    checklista: 760,
    liczby: 900,
    przepisy: 900,
    doswiadczenie: 760,
    biblioteka: 700,
    zasady: 640,
    faq: 640,
  } as Record<string, number>,
  audienceSection: {
    eyebrow: 'Dla kogo jest ta strona',
    heading: 'Wybierz, kim jesteś. Pokażemy, co dostajesz.',
  },
  audience: [
    {
      key: 'arch',
      name: 'Architekt',
      icon: 'ruler',
      heading: 'Projekt, który obroni się na budowie.',
      text: 'Technikę wpisujesz w projekt raz, w odpowiednim miejscu. Bez improwizacji ekipy i bez kucia po tynkach.',
      points: [
        'Plan urządzeń na Twoich rzutach (kamery, czujki, głośniki, Wi-Fi, panele)',
        'Wytyczne dla branży elektrycznej: szafa rack, przepusty, moc pod ładowarkę',
        'Opis systemów prostym językiem dla inwestora',
        'Konsultacja na etapie koncepcji, zanim zamkniesz projekt',
      ],
      cta: { label: 'Wyślij rzuty', href: '#wyslij' },
    },
    {
      key: 'wn',
      name: 'Projektant wnętrz',
      icon: 'eye',
      heading: 'Technika, której nie widać we wnętrzu.',
      text: 'Dobieramy urządzenia do wnętrza, a nie wnętrze do urządzeń: maskownice, kolor szkła paneli, zabudowy, głośniki pod gładzią.',
      points: [
        'Głośniki w suficie i pod gładzią, maskownice do malowania',
        'Szklane panele Ampio: kolor, ikony i podpisy pod projekt',
        'Telewizor w zabudowie bez kabli, sprzęt w szafie',
        'Pokaz próbek w Twojej pracowni',
      ],
      cta: { label: 'Zobacz rozwiązania', href: '#nowosci' },
    },
    {
      key: 'dev',
      name: 'Deweloper',
      icon: 'apt',
      heading: 'Budynek gotowy na odbiór i na sprzedaż.',
      text: 'Teletechnika budynku z pomiarami, części wspólne, garaż z ładowaniem i opcja smart apartamentu. Jeden wykonawca niskoprądówki.',
      points: [
        'Instalacja telekomunikacyjna: punkt styku, skrzynki w lokalach, światłowód',
        'Wideodomofony, kontrola dostępu do klatek i garażu, monitoring',
        'Ładowarki i przygotowanie miejsc postojowych',
        'Pomiary i dokumentacja do odbioru',
      ],
      cta: { label: 'Zakres dla dewelopera', href: '#deweloperzy' },
    },
    {
      key: 'gw',
      name: 'Generalny wykonawca',
      icon: 'crane',
      heading: 'Podwykonawca, który trzyma harmonogram.',
      text: 'Wchodzimy na budowę w uzgodnionych oknach: przed tynkami i przy wykończeniu. Jedna osoba kontaktowa dla kierownika budowy.',
      points: [
        'Okablowanie i puszki przed tynkami, zdjęcia tras',
        'Koordynacja z elektrykiem i ekipą wykończeniową',
        'Montaż, uruchomienie i szkolenie użytkownika',
        'Serwis po odbiorze, bez telefonów do Ciebie',
      ],
      cta: { label: 'Umów wizję na budowie', href: '#wyslij' },
    },
  ] as Audience[],
  problemsSection: {
    eyebrow: 'Znasz to z budowy',
    heading: 'Technika zaplanowana za późno',
    accent: 'psuje najlepszy projekt.',
    lead: 'Cztery sytuacje, które słyszymy od architektów najczęściej. Każdą da się rozwiązać na rzutach, zanim ekipa wejdzie na budowę.',
    answer: 'U nas',
    bravasTitle: 'Nie tylko u nas.',
    bravasText: 'Badanie BRAVAS 2024 wśród architektów i wykonawców domów premium w USA.',
  },
  problems: [
    {
      icon: 'tool',
      title: 'Technika dokładana po tynkach',
      text: 'Kamera „na kołkach”, kabel w listwie, kucie świeżej gładzi tydzień przed przeprowadzką.',
      answer: 'Trasy, puszki i ramki planujemy na rzutach. Po tynkach już nic nie kujemy.',
    },
    {
      icon: 'eye',
      title: 'Urządzenia psują wnętrze',
      text: 'Rząd włączników, biała kolumna w rogu, czujka na środku sufitu, kable pod telewizorem.',
      answer: 'Dobieramy urządzenia do projektu: maskownice, kolory, szkło paneli, zabudowy.',
    },
    {
      icon: 'chat',
      title: 'Klient chce „smart”, ale nie wie co',
      text: 'Inwestor pyta o inteligentny dom, a na rozmowę o protokołach nie ma czasu ani Ty, ani on.',
      answer:
        'Rozmawiamy z inwestorem prostym językiem i zamieniamy to na listę systemów do projektu.',
    },
    {
      icon: 'users',
      title: 'Sześć firm, nikt za całość',
      text: 'Osobno alarm, kamery, sieć, antena, audio i smart home. Każdy kładzie swoje kable.',
      answer: 'Jeden wykonawca 10 instalacji i jeden opiekun od koncepcji do serwisu.',
    },
  ] as { icon: InstIconName; title: string; text: string; answer: string }[],
  bravas: [
    { value: '28%', label: 'architektów i wykonawców wciąga integratora już na etapie koncepcji' },
    { value: '31%', label: 'potrzebuje łatwiejszego dostępu do wykwalifikowanych integratorów' },
    { value: '30%', label: 'szuka bardziej rzetelnych wykonawców instalacji' },
  ],
  stagesSection: {
    eyebrow: 'Współpraca etap po etapie',
    heading: 'Na każdym etapie wiesz,',
    accent: 'co dostajesz.',
    lead: 'Wchodzimy tam, gdzie jesteś z projektem. Najtaniej dla inwestora jest na etapie koncepcji i projektu budowlanego.',
    tabsLabel: 'Etapy projektu',
    best: 'Najlepszy moment, żeby nas zaprosić',
    prev: 'Poprzedni etap',
    next: 'Następny etap',
    weDo: 'Co robimy',
    youGet: 'Co dostajesz Ty',
    investor: 'Co zyskuje inwestor',
  },
  // TODO(krystian): etap „Projekt wnętrz”, „Rzuty z naniesionymi urządzeniami i zestawienie” —
  // szef: PDF czy też DWG?
  stages: [
    {
      title: 'Koncepcja',
      caption: 'Najlepszy moment',
      best: true,
      weDo: [
        'Rozmowa z Tobą i inwestorem o potrzebach: bezpieczeństwo, sieć, dźwięk, sterowanie, ładowanie auta.',
        'Lista systemów i orientacyjny zakres w wariantach.',
      ],
      youGet: [
        'Lista instalacji z tym, co zmieniają w projekcie: sufity, wnęki, pomieszczenie techniczne.',
      ],
      investor: ['Od początku wie, co dostanie. Bez dopłat „bo tego nie było w projekcie”.'],
    },
    {
      title: 'Projekt budowlany',
      caption: 'Też dobry moment',
      best: true,
      weDo: [
        'Miejsce na szafę rack: wentylacja, osobny obwód, dostęp serwisowy.',
        'Przepusty, kanalizacja teletechniczna, przyłącze światłowodu, moc pod ładowarkę.',
      ],
      youGet: ['Wytyczne dla branży elektrycznej i teletechnicznej do włączenia w projekt.'],
      investor: ['Przyłącza i moc zaplanowane raz, bez rozkopywania podjazdu po latach.'],
    },
    {
      title: 'Projekt wnętrz',
      caption: 'Wykonawczy',
      best: false,
      weDo: [
        'Rozmieszczenie urządzeń na rzutach: kamery, czujki, głośniki, punkty Wi-Fi, panele, ekrany.',
        'Wysokości montażu, trasy kabli, dobór wykończeń: kolor maskownic, szkło paneli.',
      ],
      youGet: ['Rzuty z naniesionymi urządzeniami i zestawienie.'],
      investor: ['Technika zgodna z projektem wnętrza, a nie dobrana na budowie.'],
    },
    {
      title: 'Przed tynkami',
      caption: 'Stan surowy',
      best: false,
      weDo: [
        'Okablowanie, puszki, korytka, ramki pod głośniki sufitowe.',
        'Pomiary torów i zdjęcia tras przed zakryciem.',
      ],
      youGet: ['Termin wejścia uzgodniony z wykonawcą i kierownikiem budowy.'],
      investor: ['Wie, gdzie biegnie każdy kabel, także za 10 lat.'],
    },
    {
      title: 'Wykończenie',
      caption: 'Montaż i uruchomienie',
      best: false,
      weDo: ['Montaż urządzeń, programowanie scen, strojenie dźwięku, pomiar zasięgu Wi-Fi.'],
      youGet: ['Koordynacja z wykonawcą wnętrz. Nie wchodzimy na świeżą gładź bez uzgodnienia.'],
      investor: ['Wszystko działa w dniu przeprowadzki.'],
    },
    {
      title: 'Odbiór i serwis',
      caption: 'Zostajemy po montażu',
      best: false,
      weDo: [
        'Szkolenie inwestora, dokumentacja w zakresie ustalonym przed instalacją.',
        'Gwarancja 24 miesiące na montaż, przeglądy, pomoc zdalna.',
      ],
      youGet: ['Inwestor dzwoni z serwisem do nas, nie do Ciebie.'],
      investor: ['Jeden numer do wszystkich instalacji w domu.'],
    },
  ] as Stage[],
  exchangeSection: {
    eyebrow: 'Konkretnie',
    heading: 'Co od Ciebie,',
    accent: 'co od nas.',
    lead: 'Bez spotkań, z których nic nie wynika. Wysyłasz rzuty, dostajesz wytyczne, które da się wpisać w projekt.',
    fromYou: 'Od Ciebie',
    fromUs: 'Od nas',
    // TODO(krystian): szef — co bezpłatnie przy montażu u nas (dopisać do notki).
    note: 'Konsultacja na etapie projektu bez opłat. Zakres wytycznych ustalamy na początku.',
  },
  exchange: {
    fromYou: [
      { title: 'Rzuty', text: 'PDF albo DWG, nawet wersja robocza.' },
      { title: 'Wysokości i przekroje', text: 'Sufity podwieszane, wnęki, zabudowy.' },
      { title: 'Projekt wnętrz i oświetlenia', text: 'Jeśli już jest. Dopasujemy się do niego.' },
      { title: 'Harmonogram budowy', text: 'Kiedy tynki, kiedy wykończenie.' },
      { title: 'Kontakt do inwestora i wykonawcy', text: 'Tylko za Twoją zgodą.' },
    ],
    fromUs: [
      {
        title: 'Plan urządzeń na rzutach',
        text: 'Kamery, czujki, głośniki, Wi-Fi, panele, ekrany, ładowarka.',
      },
      { title: 'Wytyczne kablowe', text: 'Trasy, typy przewodów, puszki i ramki.' },
      { title: 'Wymagania dla szafy rack', text: 'Miejsce, wentylacja, zasilanie, dostęp.' },
      { title: 'Opis systemów', text: 'Prostym językiem, do projektu albo dla inwestora.' },
      {
        title: 'Budżet w wariantach',
        text: 'Orientacyjnie na etapie projektu, na piśmie po wizji lokalnej.',
      },
    ],
  },
  installationsSection: {
    eyebrow: 'Wszystkie instalacje w jednym miejscu',
    heading: 'Co warto wiedzieć',
    accent: 'o każdej instalacji.',
    lead: 'Dla każdej z 10 instalacji: co daje inwestorowi, co zaplanować w projekcie i jak wygląda we wnętrzu. Smart home i dźwięk na początek, bo o nie pytacie najczęściej.',
    tabsLabel: 'Instalacje',
    plan: 'W projekcie zaplanuj',
    look: 'We wnętrzu',
    brands: 'Marki, z którymi pracujemy',
    fullPage: 'Pełna strona:',
    ask: 'Zapytaj o to w projekcie',
  },
  // TODO(krystian): dźwięk — szef: marki Hi-Fi (np. Bowers & Wilkins, ELAC), dopisać do „brands”.
  installations: {
    order: ['smart', 'snd', 'kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'scr', 'ev'],
    details: {
      smart: {
        big: true,
        heading: 'Smart home Ampio: dom, który sam pilnuje światła, ciepła i rolet.',
        text: 'Polski system Ampio. Światło, ogrzewanie strefowe, rolety, brama, alarm i kamery w jednej aplikacji. Działa także bez internetu, a sceny („przyjazd”, „noc”, „wyjście”) uruchamia jeden przycisk albo czujnik.',
        plan: [
          'Projekt przed tynkami: rozdzielnica z miejscem na moduły, przewody do rolet i stref grzewczych.',
          'Głębokie puszki pod szklane panele przy drzwiach i w strefach.',
          'Czujniki temperatury i ruchu w miejscach uzgodnionych z oświetleniem.',
        ],
        look: [
          'Szklane panele M-DOT z własnymi ikonami',
          'Jeden panel zamiast rzędu włączników',
          'Bez widocznych termostatów',
        ],
        brands: 'Ampio · Matter (Apple, Google, Alexa)',
      },
      snd: {
        big: true,
        heading: 'Dźwięk w domu i obiekcie: słychać, nie widać.',
        text: 'Multiroom w domu: muzyka w każdym pokoju, na tarasie i w łazience, sterowana z telefonu. W restauracji, hotelu, kościele i sali stałe nagłośnienie APART ze strefami i komunikatami. Do domu także głośniki Hi-Fi do zabudowy i głośniki, które są obiektem designu.',
        plan: [
          'Głębokość zabudowy w suficie albo ścianie i ramki montażowe przed płytą g-k.',
          'Przewody głośnikowe z każdej strefy do jednego miejsca na wzmacniacze.',
          'Akustyka: twarde, gładkie wnętrza potrzebują innego doboru niż drewno i tkaniny.',
        ],
        look: ['Maskownice do malowania', 'Głośniki pod gładzią', 'Głośnik jako rzeźba ścienna'],
        brands: 'APART · Sonos · HEOS · MusicCast',
      },
      kam: {
        big: false,
        heading: 'Monitoring, który nie wygląda jak monitoring.',
        text: 'Kompletny system: kamery, rejestrator, dyski do pracy całą dobę, zasilanie PoE i podgląd w telefonie. Kamery z kolorem w nocy i wykrywaniem człowieka i auta.',
        plan: [
          'Miejsca kamer uzgodnione z detalem elewacji: okap, podbitka, gzyms.',
          'Puszka montażowa w ociepleniu, kabel do szafy rack.',
          'Kąty bez sąsiadów i stref prywatnych, zgodnie z zasadami RODO.',
        ],
        look: ['Kamery w kolorze elewacji', 'Bez kabla na wierzchu'],
        brands: 'Hikvision · Dahua · BCS · Ubiquiti',
      },
      alarm: {
        big: false,
        heading: 'Alarm i wideodomofon: spokój, gdy dom stoi pusty.',
        text: 'Czujki ruchu, otwarcia, zalania i dymu, syrena i powiadomienia w telefonie. Przy furtce wideodomofon, który odbierasz z dowolnego miejsca.',
        plan: [
          'Manipulator przy wejściu, centrala w szafie albo obok.',
          'Przewód od furtki do domu w rurze.',
          'Czujki zalania przy kotłowni i pralni, ważne w domach letniskowych.',
        ],
        look: ['Czujki w narożnikach', 'Panel furtki dobrany do ogrodzenia'],
        brands: 'Satel · Ajax · Hikvision · Dahua',
      },
      kd: {
        big: false,
        heading: 'Kontrola dostępu: kod, karta albo telefon zamiast klucza.',
        text: 'Zamki z kodem w apartamentach, karty w hotelu i firmie, brama i szlaban z aplikacji. Wiadomo, kto i kiedy wszedł.',
        plan: [
          'Przewód do zamka lub elektrozaczepu w ościeżnicy.',
          'Rura pod nawierzchnią do bramy, szlabanu i czytnika.',
        ],
        look: ['Czytniki płaskie, w kolorze drzwi', 'Zamek bez klamki z klawiaturą'],
        brands: 'Dobieramy pod obiekt',
      },
      wifi: {
        big: false,
        heading: 'Sieć i Wi-Fi: fundament wszystkich pozostałych instalacji.',
        text: 'Okablowanie strukturalne, szafa rack, światłowód i Wi-Fi bez martwych stref, także w ogrodzie. Na tej sieci działają kamery, smart home, TV i ładowarka.',
        plan: [
          'Miejsce na szafę rack w pomieszczeniu technicznym.',
          'Punkty Wi-Fi w suficie z kablem PoE, kabel do TV i biurka.',
          'Rura pod światłowód od granicy działki.',
        ],
        look: ['Płaskie punkty Wi-Fi w suficie', 'Zero routerów na półce'],
        brands: 'Ubiquiti · MikroTik · TP-Link Omada',
      },
      tel: {
        big: false,
        heading: 'Teletechnika w budownictwie: dla deweloperów i wykonawców.',
        text: 'Instalacje słaboprądowe budynku: światłowód do lokali, RTV/SAT zbiorcza, domofony, okablowanie lokali usługowych, pomiary i dokumentacja do odbioru.',
        plan: [
          'Piony, kanalizacja teletechniczna i skrzynki w lokalach.',
          'Punkt styku i trasa przyłącza operatora.',
        ],
        look: ['Skrzynki mieszkaniowe w zabudowie'],
        brands: 'Dobieramy pod obiekt',
      },
      ant: {
        big: false,
        heading: 'Anteny RTV/SAT: telewizja bez anteny na środku elewacji.',
        text: 'Anteny satelitarne i naziemne ustawiane miernikiem, instalacje zbiorcze i telewizja w każdym pokoju pensjonatu. Montaż z zapasem na halny.',
        plan: [
          'Miejsce na maszt od strony mniej widocznej, przepust przez dach, uziemienie.',
          'Przewód antenowy do szafy i do każdego TV.',
        ],
        look: ['Antena poza głównym widokiem budynku'],
        brands: 'Dobieramy pod obiekt',
      },
      scr: {
        big: false,
        heading: 'Ekrany i digital signage: obraz jako część wnętrza.',
        text: 'Telewizory w zabudowie, ekrany w recepcji i witrynie, menu board w gastronomii. Treść zmieniana zdalnie z komputera.',
        plan: [
          'Wnęka z wentylacją, rura pod przewody za ekranem.',
          'Zasilanie i sieć przy witrynie, recepcji, menu board.',
        ],
        look: ['Ekran w lamelach albo w meblu', 'Bez kabli pod ekranem'],
        brands: 'Samsung · Avtek · Sharp/NEC',
      },
      ev: {
        big: false,
        heading: 'Ładowarki samochodów: zaplanuj moc, zanim inwestor kupi auto.',
        text: 'Ładowarki Elzab EcoPower produkowane w Polsce: CC Home do garażu, CC Wall dla firm i obiektów, CC City na parking. Z doborem mocy do przyłącza i montażem.',
        plan: [
          'Moc przyłącza z zapasem, uzgodniona z projektantem elektrycznym.',
          'Przewód zasilający i sieciowy do miejsca ładowarki.',
          'W budynkach z parkingiem: kanały pod kolejne punkty ładowania.',
        ],
        look: ['Ładowarka dobrana do elewacji garażu'],
        brands: 'Elzab EcoPower',
      },
    },
  } as { order: ServiceKey[]; details: Record<ServiceKey, Installation> },
}

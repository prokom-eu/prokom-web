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
export type ChecklistObject = 'dom' | 'apt' | 'pens' | 'lok' | 'wiel'
export type ChecklistPhase = 'p' | 't' | 'w'
export type NewsFilter = 'all' | 'snd' | 'scr' | 'smart' | 'wifi' | 'kam' | 'ev' | 'sz'
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
  checklistSection: {
    eyebrow: 'Checklista projektanta',
    heading: 'Co przewidzieć w projekcie?',
    accent: 'Wybierz obiekt i instalacje.',
    lead: 'Lista rzeczy, które trzeba zaplanować przed tynkami, żeby potem niczego nie kuć. Odhaczaj albo pobierz jako PDF dla zespołu.',
    objectsTitle: '1. Obiekt',
    systemsTitle: '2. Instalacje',
    pdfTitle: 'Checklista w PDF',
    pdfText: 'Pełna wersja z rysunkami puszek i ramek. Wyślemy na e-mail.',
    toPlan: 'do przewidzenia',
    empty: 'Wybierz co najmniej jedną instalację.',
  },
  checklist: {
    objects: [
      { key: 'dom', name: 'Dom jednorodzinny', icon: 'home' },
      { key: 'apt', name: 'Apartament, mieszkanie', icon: 'key' },
      { key: 'pens', name: 'Pensjonat, hotel', icon: 'bed' },
      { key: 'lok', name: 'Lokal: restauracja, sklep, biuro', icon: 'shop' },
      { key: 'wiel', name: 'Budynek wielorodzinny', icon: 'apt' },
    ] as { key: ChecklistObject; name: string; icon: InstIconName }[],
    systems: [
      { key: 'wifi', name: 'Sieć i Wi-Fi' },
      { key: 'kam', name: 'Monitoring' },
      { key: 'alarm', name: 'Alarm i domofon' },
      { key: 'kd', name: 'Kontrola dostępu' },
      { key: 'smart', name: 'Smart home' },
      { key: 'snd', name: 'Dźwięk' },
      { key: 'scr', name: 'Ekrany i TV' },
      { key: 'ant', name: 'Anteny' },
      { key: 'ev', name: 'Ładowarka EV' },
    ] as { key: ServiceKey; name: string }[],
    phases: [
      { key: 'p', name: 'Na etapie projektu', icon: 'ruler' },
      { key: 't', name: 'Przed tynkami', icon: 'tool' },
      { key: 'w', name: 'Przy wykończeniu', icon: 'check' },
    ] as { key: ChecklistPhase; name: string; icon: InstIconName }[],
    items: [
      {
        system: 'wifi',
        phase: 'p',
        text: 'Miejsce na szafę rack: wentylacja, osobny obwód zasilania, dostęp serwisowy',
        objects: ['dom', 'apt', 'pens', 'lok', 'wiel'],
      },
      {
        system: 'wifi',
        phase: 'p',
        text: 'Rura osłonowa pod światłowód od granicy działki do budynku',
        objects: ['dom', 'pens', 'lok'],
      },
      {
        system: 'wifi',
        phase: 'p',
        text: 'Pion i kanalizacja teletechniczna z zapasem miejsca',
        objects: ['wiel', 'pens'],
      },
      {
        system: 'wifi',
        phase: 't',
        text: 'Kabel sieciowy kat. 6 do TV, biurka i każdego punktu Wi-Fi w suficie',
        objects: ['dom', 'apt', 'pens', 'lok', 'wiel'],
      },
      {
        system: 'wifi',
        phase: 't',
        text: 'Kabel albo pusta rura do garażu, budynku gospodarczego i bramy',
        objects: ['dom', 'pens'],
      },
      {
        system: 'kam',
        phase: 'p',
        text: 'Miejsca kamer na elewacji uzgodnione z detalem: okap, gzyms, podbitka',
        objects: ['dom', 'pens', 'lok', 'wiel'],
      },
      {
        system: 'kam',
        phase: 't',
        text: 'Puszka montażowa pod każdą kamerą w warstwie ocieplenia',
        objects: ['dom', 'pens', 'lok', 'wiel'],
      },
      {
        system: 'kam',
        phase: 'w',
        text: 'Kąty kamer bez sąsiadów i pokoi gości: maski prywatności',
        objects: ['dom', 'pens', 'wiel'],
      },
      {
        system: 'alarm',
        phase: 'p',
        text: 'Miejsce na manipulator przy wejściu i na centralę alarmu',
        objects: ['dom', 'apt', 'pens', 'lok'],
      },
      {
        system: 'alarm',
        phase: 't',
        text: 'Przewody do czujek, sygnalizatora i czujek zalania przy kotłowni i pralni',
        objects: ['dom', 'apt', 'pens'],
      },
      {
        system: 'alarm',
        phase: 't',
        text: 'Wideodomofon: przewód w rurze od furtki do domu',
        objects: ['dom'],
      },
      {
        system: 'alarm',
        phase: 't',
        text: 'Panel domofonu przy wejściu do klatki i unifony w lokalach',
        objects: ['wiel'],
      },
      {
        system: 'kd',
        phase: 't',
        text: 'Przewód do zamka lub elektrozaczepu w ościeżnicy drzwi',
        objects: ['apt', 'pens', 'lok', 'wiel'],
      },
      {
        system: 'kd',
        phase: 'p',
        text: 'Rura pod nawierzchnią do napędu bramy, szlabanu i czytnika',
        objects: ['pens', 'lok', 'wiel', 'dom'],
      },
      {
        system: 'smart',
        phase: 'p',
        text: 'Większa rozdzielnica z miejscem na moduły smart home',
        objects: ['dom', 'apt', 'pens'],
      },
      {
        system: 'smart',
        phase: 't',
        text: 'Głębokie puszki pod panele i przewód do każdej rolety',
        objects: ['dom', 'apt', 'pens'],
      },
      {
        system: 'smart',
        phase: 't',
        text: 'Czujnik temperatury i przewody siłowników w każdej strefie grzewczej',
        objects: ['dom', 'apt', 'pens'],
      },
      {
        system: 'smart',
        phase: 'w',
        text: 'Panele: szkło, kolor i ikony dobrane do projektu wnętrza',
        objects: ['dom', 'apt', 'pens', 'lok'],
      },
      {
        system: 'snd',
        phase: 'p',
        text: 'Sufit podwieszany albo wnęka o głębokości pod głośnik do zabudowy',
        objects: ['dom', 'apt', 'pens', 'lok', 'wiel'],
      },
      {
        system: 'snd',
        phase: 't',
        text: 'Ramki montażowe pod głośniki sufitowe przed płytą g-k',
        objects: ['dom', 'apt', 'pens', 'lok', 'wiel'],
      },
      {
        system: 'snd',
        phase: 't',
        text: 'Przewód głośnikowy z każdej strefy do miejsca wzmacniacza',
        objects: ['dom', 'apt', 'pens', 'lok', 'wiel'],
      },
      {
        system: 'snd',
        phase: 'w',
        text: 'Maskownice w kolorze sufitu albo do malowania',
        objects: ['dom', 'apt', 'pens', 'lok', 'wiel'],
      },
      {
        system: 'snd',
        phase: 't',
        text: 'Taras i ogród: przewód w rurze do głośników zewnętrznych',
        objects: ['dom', 'pens', 'lok'],
      },
      {
        system: 'scr',
        phase: 'p',
        text: 'Wnęka albo zabudowa pod TV z miejscem na wentylację',
        objects: ['dom', 'apt', 'pens'],
      },
      {
        system: 'scr',
        phase: 't',
        text: 'Rura za telewizorem pod przewody, gniazdo zasilania i sieci',
        objects: ['dom', 'apt', 'pens', 'lok'],
      },
      {
        system: 'scr',
        phase: 't',
        text: 'Zasilanie i kabel sieci przy witrynie, menu board albo recepcji',
        objects: ['lok', 'pens'],
      },
      {
        system: 'ant',
        phase: 'p',
        text: 'Miejsce na maszt i antenę, przepust przez dach, uziemienie',
        objects: ['dom', 'pens', 'wiel'],
      },
      {
        system: 'ant',
        phase: 't',
        text: 'Przewód antenowy z anteny do szafy i do każdego telewizora',
        objects: ['dom', 'pens', 'wiel'],
      },
      {
        system: 'ev',
        phase: 'p',
        text: 'Moc przyłącza z zapasem pod ładowarkę, uzgodniona z projektantem elektrycznym',
        objects: ['dom', 'pens', 'lok', 'wiel'],
      },
      {
        system: 'ev',
        phase: 't',
        text: 'Przewód zasilający i kabel sieci do miejsca ładowarki w garażu lub na parkingu',
        objects: ['dom', 'pens', 'lok', 'wiel'],
      },
      {
        system: 'ev',
        phase: 'p',
        text: 'Kanały kablowe pod przyszłe punkty ładowania na miejscach postojowych',
        objects: ['wiel', 'lok'],
      },
    ] as { system: ServiceKey; phase: ChecklistPhase; text: string; objects: ChecklistObject[] }[],
  },
  numbersSection: {
    eyebrow: 'Liczby do projektu',
    heading: 'Wymiary i parametry,',
    accent: 'które warto mieć pod ręką.',
    lead: 'Z kart katalogowych producentów i norm, z którymi pracujemy. Konkretny model może się różnić, dlatego ostateczne wartości podajemy w wytycznych do Twojego projektu.',
    note: 'Stan na październik 2026. Wartości orientacyjne do wstępnego projektu, nie zastępują karty katalogowej wybranego modelu.',
  },
  // Without three numbers of the package that have no source (review I16b, spec §2.3): the
  // motorised-zoom camera's 12 W, Ampio 90×160 mm / 2–18 fields, the rental law's fines.
  numbers: [
    {
      service: 'wifi',
      value: '90 m',
      title: 'kabla stałego w torze skrętki',
      text: 'Kanał do 100 m z kablami przyłączeniowymi. Szafa rack w środku budynku, nie na jego końcu.',
    },
    {
      service: 'wifi',
      value: '55 / 100 m',
      title: '10 Gb/s: Cat6 / Cat6A',
      text: 'Cat6 przenosi 10 Gb/s na 37–55 m, Cat6A na 100 m. Przy długich trasach kładziemy Cat6A.',
    },
    {
      service: 'wifi',
      value: '13–71 W',
      title: 'moc PoE dla urządzenia',
      text: '802.3af 13 W, at 25,5 W, bt 51 i 71 W. Kamera i punkt Wi-Fi na jednym kablu, bez gniazdka obok.',
    },
    {
      service: 'wifi',
      value: '10–12 m',
      title: 'odstęp punktów Wi-Fi',
      text: 'Na środku sufitu, nie w rogu. Tak zalecają wytyczne TP-Link Omada.',
    },
    {
      service: 'kam',
      value: '6–12 W',
      title: 'pobór kamery IP',
      text: 'Np. Hikvision ColorVu 8 MP maks. 6,5 W. Wystarczy PoE 802.3af.',
    },
    {
      service: 'snd',
      value: 'Ø 200–210',
      title: 'mm otworu, głośnik 6–6,5"',
      text: 'Głębokość zabudowy 92–120 mm. Głośnik 8": otwór ok. 257 mm, głębokość ok. 135 mm.',
    },
    {
      service: 'snd',
      value: '1,8–3 m',
      title: 'rozstaw pary stereo w suficie',
      text: 'Miejsce słuchania mniej więcej pośrodku. Pokój do ok. 14 m² to zwykle jedna para.',
    },
    {
      service: 'snd',
      value: '2–3 mm',
      title: 'maks. wykończenia na głośniku pod gładzią',
      text: 'Amina do 2 mm, Sonance Invisible do 3 mm. Gładź na wysoki standard, cienkie warstwy.',
    },
    {
      service: 'scr',
      value: '30–40°',
      title: 'kąt widzenia ekranu',
      text: 'Z 2,1 m to ekran ok. 55–70". Środek ekranu na wysokości oczu siedzącego.',
    },
    {
      service: 'wifi',
      value: '44,45 mm',
      title: '1U w szafie 19"',
      text: 'Szafa wisząca 600×450 mm daje ok. 39 cm użytecznej głębokości. Do tego wentylacja i osobny obwód.',
    },
    {
      service: 'ev',
      value: '3,7–22 kW',
      title: 'moc ładowarki',
      text: '3,7 kW: 1 faza 16 A. 11 kW: 3 fazy 16 A. 22 kW: 3 fazy 32 A. Moc przyłącza ustal z elektrykiem.',
    },
    {
      service: 'smart',
      value: '90×90',
      title: 'mm panelu Ampio M-DOT',
      text: 'Puszka osadzona głębiej niż standardowo.',
    },
    {
      service: 'ant',
      value: '13°E',
      title: 'satelita Hot Bird',
      text: 'Przewód 75 Ω z ekranowaniem klasy A. Osobny przewód do każdego odbiornika z multiswitcha.',
    },
    {
      service: 'tel',
      value: '≤ 1,2 dB',
      title: 'tłumienie toru światłowodu w lokalu',
      text: 'Od skrzynki mieszkaniowej do punktu styku w budynku wielorodzinnym. Pomiary w dokumentacji powykonawczej.',
    },
  ] as { service: ServiceKey; value: string; title: string; text: string }[],
  developersSection: {
    eyebrow: 'Dla deweloperów i inwestorów',
    heading: 'Budynek gotowy na odbiór.',
    accent: 'I na sprzedaż.',
    lead: 'Cała niskoprądówka budynku u jednego wykonawcy: od punktu styku, przez klatki i garaż, po apartament na wynajem. Z pomiarami do odbioru.',
    why: 'Dlaczego to ważne',
    // Spec §2.2: no promise of a higher flat price — this sentence stays.
    noPromise:
      'Nie obiecujemy, że smart home podniesie cenę lokalu: polskie dane tego nie potwierdzają. Pokazujemy to, co realnie przekonuje kupujących: bezpieczeństwo, szybki internet i miejsce do ładowania auta.',
    cta: 'Wyślij projekt inwestycji →',
  },
  developersData: [
    {
      value: '321',
      label: 'mieszkań oddanych w 2024 r. w powiecie tatrzańskim (849 w nowotarskim)',
    },
    {
      value: '4 tys.+',
      label: 'lokali inwestycyjnych planowanych do 2026 r. w polskich kurortach górskich',
    },
    { value: '20%+', label: 'nowych inwestycji w Polsce ma już miejsca z ładowaniem aut' },
  ],
  developers: [
    {
      key: 'lok',
      name: 'Lokale',
      icon: 'key',
      heading: 'W każdym mieszkaniu i apartamencie',
      items: [
        'Skrzynka mieszkaniowa: światłowód jednomodowy, skrętka, przewód antenowy',
        'Gniazda RJ45 i TV w pokojach, punkt Wi-Fi w suficie',
        'Unifon albo monitor wideodomofonu',
        'Opcja: smart apartament Ampio (światło, ogrzewanie, rolety, zamek)',
      ],
      why: 'Od 2013 r. każdy nowy budynek wielorodzinny musi mieć instalację telekomunikacyjną: punkt styku, skrzynkę w lokalu, światłowód, skrętkę i koncentryk.',
    },
    {
      key: 'wsp',
      name: 'Części wspólne',
      icon: 'apt',
      heading: 'Klatki, hol, wejścia, teren',
      items: [
        'Panele wideodomofonu przy wejściach, lista lokatorów',
        'Karty i breloki do klatek, rowerowni i śmietników',
        'Monitoring wejść, holu i terenu z zasadami RODO',
        'Zbiorcza instalacja RTV/SAT dla całego budynku',
      ],
      why: 'Bezpieczeństwo to priorytet dla 50% szukających domu i 34% szukających mieszkania. Najwyżej oceniają czujniki, monitoring i alarm.',
    },
    {
      key: 'gar',
      name: 'Garaż i parking',
      icon: 'car',
      heading: 'Wjazd, miejsca postojowe, ładowanie',
      items: [
        'Szlaban albo brama: pilot, karta, aplikacja, odczyt tablic',
        'Monitoring wjazdu i hali garażowej',
        'Ładowarki Elzab EcoPower z podziałem mocy',
        'Okablowanie i kanały pod kolejne punkty ładowania',
      ],
      why: 'Gotowość do zakupu auta elektrycznego rośnie z 17% do 29%, gdy kierowca ma ładowarkę tam, gdzie parkuje na noc.',
    },
    {
      key: 'inw',
      name: 'Apartamenty inwestycyjne',
      icon: 'bed',
      heading: 'Lokale na wynajem krótkoterminowy',
      items: [
        'Zamki z kodem: gość wchodzi sam, kod ważny tylko w czasie pobytu',
        'Wi-Fi dla gości i telewizja w każdym lokalu',
        'Ogrzewanie w trybie oszczędnym, gdy lokal stoi pusty',
        'Zdalny podgląd i serwis z Rabki i Zakopanego',
      ],
      why: 'W Zakopanem działa ok. 3,5 tys. ofert najmu krótkoterminowego, średnie obłożenie ok. 48%. Od 20.05.2026 każdy lokal potrzebuje numeru rejestrowego.',
    },
    {
      key: 'odb',
      name: 'Odbiór i dokumentacja',
      icon: 'doc',
      heading: 'Pomiary, protokoły, przekazanie',
      items: [
        'Pomiary torów światłowodowych i skrętki z protokołami',
        'Dokumentacja powykonawcza: trasy, opisy, zestawienia',
        'Szkolenie zarządcy i przekazanie haseł',
        'Umowa serwisowa dla wspólnoty albo zarządcy',
      ],
      why: 'Pomiary światłowodu trafiają do dokumentacji powykonawczej. Tłumienie toru od skrzynki w lokalu do punktu styku nie powinno przekraczać 1,2 dB.',
    },
  ] as {
    key: string
    name: string
    icon: InstIconName
    heading: string
    items: string[]
    why: string
  }[],
  lawSection: {
    eyebrow: 'Przepisy 2026–2028',
    heading: 'Co się zmienia w prawie',
    accent: 'i co to znaczy dla instalacji.',
    lead: 'Warunki techniczne, światłowód, ładowanie aut, najem krótkoterminowy i RODO. Śledzimy zmiany, żeby Twój projekt był zgodny z prawem w dniu złożenia wniosku.',
    inProject: 'W projekcie',
  },
  /** Date of the law section (spec §2.5, ADR-I005 §6); check before I13. */
  lawAsOf: '28.10.2026',
  timeline: [
    { date: '2013', label: 'Instalacja telekom. w budynkach wielorodzinnych', now: false },
    { date: '12.02.2026', label: 'GIA: gotowość na światłowód', now: false },
    { date: '20.05.2026', label: 'Rejestr najmu krótkoterminowego', now: false },
    { date: '29.05.2026', label: 'Termin wdrożenia EPBD', now: false },
    { date: '20.09.2026', label: 'Koniec WT z 2002 r.', now: true },
    { date: '20.03.2028', label: 'Koniec okresu przejściowego', now: false },
  ],
  law: [
    {
      date: '20.09.2026',
      status: 'Okres przejściowy',
      tone: 'warn',
      title: 'Stare warunki techniczne tylko z oświadczeniem',
      text: 'Rozporządzenie o warunkach technicznych z 2002 r. straciło moc. Do 20.03.2028 projekt można przygotować według starych przepisów, jeśli inwestor złoży oświadczenie (art. 102a Prawa budowlanego).',
      inProject:
        'Na starcie projektu ustal z inwestorem, według których przepisów projektujesz. Od tego zależą wymagania dla instalacji telekomunikacyjnej.',
    },
    {
      date: 'w toku',
      status: 'Czekamy',
      tone: 'mut',
      title: 'Nowe warunki techniczne',
      text: 'Nowe rozporządzenie o warunkach technicznych nie zostało jeszcze ogłoszone (stan na październik 2026).',
      inProject: 'Przy każdym projekcie sprawdzamy aktualny stan prawny i dopasowujemy wytyczne.',
    },
    {
      date: '12.02.2026',
      status: 'Obowiązuje',
      tone: 'ok',
      title: 'Budynek gotowy na światłowód (GIA)',
      text: 'Unijne rozporządzenie o infrastrukturze gigabitowej: budynki z wnioskiem o pozwolenie złożonym po 12.02.2026 mają mieć infrastrukturę gotową na światłowód i okablowanie światłowodowe. Budynki wielolokalowe także punkt dostępu.',
      inProject:
        'Rura od granicy działki, trasa do pomieszczenia technicznego i światłowód do punktu zakończenia sieci w budynku.',
    },
    {
      date: 'w toku',
      status: 'W przygotowaniu',
      tone: 'mut',
      title: 'Polska ustawa wdrażająca GIA',
      text: 'Projekt nowelizacji megaustawy jest w przygotowaniu. Ma m.in. rozstrzygnąć, czy obowiązek obejmie domy jednorodzinne budowane na własne potrzeby.',
      inProject:
        'Do czasu uchwalenia rekomendujemy przygotowanie pod światłowód także w domu jednorodzinnym. To rura i trasa, niewielki koszt.',
    },
    {
      date: 'od 2013',
      status: 'Stare WT',
      tone: 'ok',
      title: 'Instalacja telekomunikacyjna w budynku wielorodzinnym',
      text: 'Według rozdziału 8a starych warunków technicznych: punkt styku, kanalizacja teletechniczna, co najmniej 2 włókna jednomodowe, 2 skrętki i przewód koncentryczny do każdego mieszkania.',
      inProject:
        'Dla projektów na starych WT: punkt styku w szafie, skrzynki mieszkaniowe, piony i pomiary do dokumentacji.',
    },
    {
      date: '29.05.2026',
      status: 'Czeka na wdrożenie',
      tone: 'warn',
      title: 'Ładowanie aut w budynkach mieszkalnych (EPBD)',
      text: 'Dyrektywa budynkowa: w nowych budynkach mieszkalnych z więcej niż 3 miejscami postojowymi okablowanie co najmniej 50% miejsc, kanały na pozostałe, co najmniej 1 punkt ładowania i 2 miejsca rowerowe na lokal. Termin wdrożenia minął, Polska jeszcze jej nie wdrożyła.',
      inProject:
        'Warto przewidzieć kanały i moc już teraz. Dołożenie ich po wykończeniu garażu kosztuje więcej.',
    },
    {
      date: '20.05.2026',
      status: 'Obowiązuje',
      tone: 'ok',
      title: 'Rejestr najmu krótkoterminowego',
      text: 'Unijne rozporządzenie: każdy lokal na wynajem krótkoterminowy potrzebuje numeru rejestracyjnego. Polska ustawa o najmie krótkoterminowym przeszła przez Sejm 8.10.2026.',
      inProject:
        'Apartamenty inwestycyjne projektuj od razu pod zdalną obsługę: zamek z kodem, Wi-Fi dla gości, podgląd i serwis zdalny.',
    },
    {
      date: 'zawsze',
      status: 'Obowiązuje',
      tone: 'ok',
      title: 'Kamery a RODO',
      text: 'Kamera przy domu, która obejmuje ulicę albo posesję sąsiada, podlega RODO (wyrok TSUE C-212/13). W firmie nagrania przechowuje się najwyżej 3 miesiące, a pracowników informuje 2 tygodnie przed uruchomieniem.',
      inProject: 'Kąty kamer i maski prywatności ustalamy już na rzutach, nie po montażu.',
    },
  ] as {
    date: string
    status: string
    tone: 'ok' | 'warn' | 'mut'
    title: string
    text: string
    inProject: string
  }[],
  newsSection: {
    eyebrow: 'Nowe rozwiązania do projektów',
    heading: 'Co warto pokazać inwestorowi',
    accent: 'w tym sezonie.',
    lead: 'Rozwiązania, które sprawdzamy i montujemy. Przy każdym: parametry z karty katalogowej i to, co trzeba przewidzieć w projekcie. Dodajemy nowe na bieżąco.',
    listLabel: 'Lista rozwiązań',
    filterLabel: 'Filtr kategorii',
    plan: 'W projekcie zaplanuj',
    examples: 'Przykłady',
    places: 'Gdzie się sprawdza',
    ask: 'Zapytaj o to w projekcie',
    prev: 'Poprzednie rozwiązanie',
    next: 'Następne rozwiązanie',
    newsletterTitle: 'Nowe rozwiązania raz w miesiącu, na e-mail.',
    newsletterText:
      'Krótko: jedno rozwiązanie z parametrami, termin prezentacji, oferta dla pracowni. Wypiszesz się jednym kliknięciem.',
    note: 'Parametry z kart katalogowych producentów, stan na październik 2026. Marki podajemy jako przykład: dobieramy sprzęt pod projekt.',
  },
  /** Filter (`NF`) and the card's category label (`CAT`): `sz` is „Dla pracowni” on a card. */
  newsFilters: [
    { key: 'all', name: 'Wszystko' },
    { key: 'snd', name: 'Dźwięk' },
    { key: 'scr', name: 'Obraz' },
    { key: 'smart', name: 'Sterowanie' },
    { key: 'wifi', name: 'Sieć' },
    { key: 'kam', name: 'Bezpieczeństwo' },
    { key: 'ev', name: 'Energia' },
    { key: 'sz', name: 'Szkolenia i oferty' },
  ] as { key: NewsFilter; name: string }[],
  newsCategories: {
    snd: 'Dźwięk',
    scr: 'Obraz',
    smart: 'Sterowanie',
    wifi: 'Sieć',
    kam: 'Bezpieczeństwo',
    ev: 'Energia',
    sz: 'Dla pracowni',
  },
  experienceSection: {
    eyebrow: 'Nasze doświadczenie',
    heading: 'Od 2004 roku na Podhalu.',
    accent: 'Zostajemy po montażu.',
    lead: 'PRO-KOM to firma z Rabki-Zdroju z salonem w Zakopanem. Instalacje, sprzęt, serwis i oprogramowanie w jednej firmie, blisko Twoich inwestycji.',
    realizations: 'Wybrane realizacje',
    realizationsAll: 'Wszystkie realizacje →',
    brands: 'Sprzęt, z którym pracujemy',
    brandsNote: 'Dobieramy sprzęt pod obiekt, nie pod markę. Sprzęt dostępny dla firm:',
  },
  experience: [
    { value: 'od 2004', label: 'PRO-KOM w Rabce-Zdroju' },
    { value: '2 salony', label: 'Rabka-Zdrój i Zakopane' },
    { value: '10', label: 'rodzajów instalacji u jednego wykonawcy' },
    { value: '100+', label: 'klientów firmowych całej PRO-KOM' },
  ],
  // The prototype's realizations name real clients (Blachotrapez, parafia, Empik…): shown only
  // with consent, like the home page (decision I6) — the card lists published realizations.
  // TODO(krystian): szef — lata, zgody, zdjęcia, 2–3 domy z projektem architekta; autoryzacje
  // i certyfikaty (np. Ampio, Satel).
  brands: [
    'Ampio',
    'Dahua',
    'Hikvision',
    'BCS',
    'Ubiquiti',
    'MikroTik',
    'TP-Link Omada',
    'Satel',
    'Ajax',
    'APART',
    'JBL',
    'RCF',
    'Samsung',
    'Elzab EcoPower',
  ],
  librarySection: {
    eyebrow: 'Biblioteka projektanta',
    heading: 'Materiały, które',
    accent: 'skracają projekt.',
    lead: 'Nasze materiały do pobrania i sprawdzone narzędzia producentów, z których korzystamy przy projektach.',
    tools: 'Narzędzia producentów',
  },
  libraryOwn: [
    {
      icon: 'check',
      title: 'Checklista projektanta',
      text: 'Co przewidzieć w projekcie, etap po etapie. PDF, 1 strona na instalację.',
      format: 'PDF',
      status: 'Na e-mail',
    },
    {
      icon: 'grid',
      title: 'Symbole urządzeń do rzutów',
      text: 'Kamery, czujki, głośniki, punkty Wi-Fi, panele, gniazda. Gotowe do wklejenia w rzut.',
      format: 'DWG · PDF',
      status: 'W przygotowaniu',
    },
    {
      icon: 'doc',
      title: 'Opisy systemów do projektu',
      text: 'Krótkie opisy monitoringu, sieci, smart home i dźwięku do części opisowej projektu.',
      format: 'DOCX',
      status: 'W przygotowaniu',
    },
    {
      icon: 'layers',
      title: 'Wytyczne dla szafy rack',
      text: 'Miejsce, wymiary, wentylacja, zasilanie i dostęp. Do pomieszczenia technicznego.',
      format: 'PDF',
      status: 'W przygotowaniu',
    },
  ] as { icon: InstIconName; title: string; text: string; format: string; status: string }[],
  libraryTools: [
    {
      title: 'Ampio: katalog dla architekta',
      text: 'System, panele, realizacje.',
      href: 'https://www.ampio.com/assets/_catalogues/architect_pl.pdf',
      kind: 'PDF',
    },
    {
      title: 'Ampio: katalog dla dewelopera',
      text: 'Smart apartament w inwestycji.',
      href: 'https://www.ampio.com/assets/_catalogues/developer_pl.pdf',
      kind: 'PDF',
    },
    {
      title: 'Ampio: kreator paneli',
      text: 'Kolor szkła, ikony, podpisy, podgląd.',
      href: 'https://kreatorpaneli.ampio.pl/',
      kind: 'Narzędzie',
    },
    {
      title: 'UniFi Design Center',
      text: 'Rzut, symulacja zasięgu Wi-Fi, 3D.',
      href: 'https://design.ui.com/',
      kind: 'Narzędzie',
    },
    {
      title: 'Omada Design Hub',
      text: 'Mapa zasięgu Wi-Fi i rozmieszczenie punktów.',
      href: 'https://design.tplinkcloud.com',
      kind: 'Narzędzie',
    },
    {
      title: 'Dahua Project Design Tool',
      text: 'Pole widzenia kamer i martwe strefy.',
      href: 'https://support.dahuasecurity.com/en/ProjectDesignTool',
      kind: 'Narzędzie',
    },
    {
      title: 'Ajax: kalkulatory',
      text: 'Zasięg radiowy, zasilanie, archiwum wideo.',
      href: 'https://ajax.systems/tools/',
      kind: 'Narzędzie',
    },
    {
      title: 'Sonos dla architektów',
      text: 'Materiały i broszura dla inwestora.',
      href: 'https://www.sonos.com/pl-pl/trades/architects',
      kind: 'Strona',
    },
  ],
  presentationsSection: {
    eyebrow: 'Zobacz i usłysz',
    heading: 'Najlepiej przekonuje',
    accent: 'pokaz na żywo.',
    cta: 'Umów prezentację',
  },
  // TODO(krystian): szef — co mamy na pokazie w salonie (etykieta karty „W salonie PRO-KOM”).
  presentations: [
    {
      icon: 'office',
      title: 'W Twojej pracowni',
      text: 'Przyjeżdżamy z próbkami: panel Ampio, głośnik sufitowy, kamera, punkt Wi-Fi. Pokazujemy, co zaplanować w projekcie.',
      tag: 'Podhale i Kraków',
    },
    {
      icon: 'shop',
      title: 'W salonie PRO-KOM',
      text: 'Rabka-Zdrój albo Zakopane. Zobaczysz i usłyszysz rozwiązania, które możesz pokazać inwestorowi.',
      tag: null,
    },
    {
      icon: 'crane',
      title: 'Na budowie, z inwestorem',
      text: 'Wizja lokalna z Tobą i inwestorem. Na miejscu ustalamy miejsca urządzeń i trasy kabli.',
      tag: 'Przed tynkami',
    },
  ] as { icon: InstIconName; title: string; text: string; tag: string | null }[],
  rulesSection: {
    eyebrow: 'Zasady współpracy',
    heading: 'Chętnie współpracujemy.',
    accent: 'Na jasnych zasadach.',
  },
  // TODO(krystian): szef — „Warunki dla pracowni”: opisane jawnie albo „ustalamy indywidualnie”
  // (6. karta prototypu, do tego czasu bez niej).
  rules: [
    {
      icon: 'layers',
      title: 'Twój projekt, Twoje decyzje',
      text: 'Dobieramy technikę pod projekt, nie pod markę. Jeśli coś koliduje z wnętrzem, szukamy innego rozwiązania.',
    },
    {
      icon: 'shield',
      title: 'Grasz pierwsze skrzypce',
      text: 'Z inwestorem rozmawiamy razem z Tobą albo za Twoją zgodą. Nie zmieniamy projektu za Twoimi plecami.',
    },
    {
      icon: 'doc',
      title: 'Wycena na piśmie',
      text: 'Zakres, sprzęt i cena czarno na białym, w wariantach do wyboru. Inwestor wie, za co płaci.',
    },
    {
      icon: 'users',
      title: 'Jeden opiekun',
      text: 'Jedna osoba od pierwszej rozmowy do odbioru. Nie tłumaczysz projektu od nowa każdemu monterowi.',
    },
    {
      icon: 'check',
      title: 'Gwarancja 24 miesiące',
      text: 'Na montaż. Sprzęt według gwarancji producenta. Serwis i przeglądy po montażu.',
    },
  ] as { icon: InstIconName; title: string; text: string }[],
  contactSection: {
    eyebrow: 'Twój opiekun w PRO-KOM',
    role: 'Opiekun architektów i wykonawców · instalacje niskoprądowe i smart home',
    quote:
      '„Zawsze pomożemy. Nawet jeśli to jedno pytanie o puszkę pod kamerę albo głębokość sufitu pod głośnik. Zadzwoń, zanim projekt pójdzie do druku.”',
    response: 'Odpowiadamy do 24 h w dni robocze.',
  },
  faqSection: {
    eyebrow: 'Pytania i odpowiedzi',
    heading: 'Pytania architektów.',
    aside: {
      title: 'Jedno pytanie do projektu?',
      text: 'Zadzwoń albo napisz. Zawsze pomożemy, nawet jeśli chodzi tylko o puszkę pod kamerę.',
      cta: 'Wyślij rzuty',
      href: '#wyslij',
    },
  },
  // TODO(krystian): szef — potwierdzić odpowiedź „Czy pomożecie, jeśli inwestor wybierze innego
  // wykonawcę?”.
  faq: [
    {
      question: 'Kiedy najlepiej nas zaprosić?',
      answer:
        'Na etapie koncepcji albo projektu budowlanego. Wtedy miejsce na szafę rack, przepusty, moc pod ładowarkę i sufity pod głośniki nic nie kosztują. Pomożemy też później, ale przed tynkami to ostatni moment bez kucia.',
    },
    {
      question: 'Czy muszę znać się na smart home i sieciach?',
      answer:
        'Nie. Wystarczą rzuty i rozmowa o potrzebach inwestora. Technikę bierzemy na siebie, a do projektu oddajemy proste wytyczne.',
    },
    {
      question: 'Co dostanę do projektu?',
      answer:
        'Plan urządzeń na rzutach, wytyczne kablowe, wymagania dla szafy rack i opis systemów prostym językiem. Zakres ustalamy na początku, zależnie od etapu i obiektu.',
    },
    {
      question: 'Czy pracujecie z projektem elektrycznym innego projektanta?',
      answer:
        'Tak. Instalacje niskoprądowe uzgadniamy z projektantem elektrycznym i wykonawcą. Zasilanie, moc i zabezpieczenia zostają w jego branży.',
    },
    {
      question: 'Czy pomożecie, jeśli inwestor wybierze innego wykonawcę?',
      answer:
        'Jedno pytanie do projektu zawsze. Zadzwoń i zapytaj. Pełne wytyczne przygotowujemy do projektów, które realizujemy.',
    },
    {
      question: 'Ile to kosztuje inwestora?',
      answer:
        'Zależy od obiektu i zakresu. Na etapie projektu podajemy orientacyjny budżet w wariantach, a dokładną wycenę na piśmie po wizji lokalnej.',
    },
    {
      question: 'Jaki obszar obsługujecie?',
      answer:
        'Podhale i Małopolskę: salony w Rabce-Zdroju i Zakopanem. Przy większych inwestycjach jedziemy dalej, dojazd ustalamy indywidualnie.',
    },
    {
      question: 'Według których przepisów projektować teletechnikę w 2026 r.?',
      answer:
        'Stare warunki techniczne straciły moc 20.09.2026. Do 20.03.2028 można projektować według nich, jeśli inwestor złoży oświadczenie. Nowe warunki nie zostały jeszcze ogłoszone, dlatego stan prawny sprawdzamy przy każdym projekcie.',
    },
    {
      question: 'Czy dom jednorodzinny musi mieć światłowód?',
      answer:
        'Unijne rozporządzenie GIA obejmuje nowe budynki z wnioskiem o pozwolenie po 12.02.2026. Polska ustawa, która może zwolnić domy budowane na własne potrzeby, jest w przygotowaniu. Rura pod światłowód kosztuje niewiele, więc rekomendujemy ją w każdym projekcie.',
    },
    {
      question: 'Kto zajmuje się serwisem po odbiorze?',
      answer:
        'My. Inwestor dostaje jeden numer do wszystkich instalacji. Na montaż dajemy 24 miesiące gwarancji, a przeglądy robimy przed sezonem.',
    },
  ],
  formSection: {
    eyebrow: 'Wyślij rzuty',
    heading: 'Prześlij projekt.',
    accent: 'Oddzwonimy z konkretami.',
    lead: 'Opiekun przejrzy rzuty i zadzwoni z pierwszymi uwagami: co przewidzieć, gdzie miejsce na szafę rack, na co uważać w suficie i elewacji.',
    steps: [
      'Wysyłasz rzuty i etap projektu',
      'Oddzwaniamy do 24 h w dni robocze',
      'Dostajesz uwagi i propozycję zakresu',
    ],
  },
  form: {
    roles: ['Architekt', 'Projektant wnętrz', 'Generalny wykonawca', 'Deweloper', 'Inwestor'],
    stages: ['Koncepcja', 'Projekt budowlany', 'Projekt wnętrz', 'Budowa', 'Wykończenie'],
    objects: ['Dom', 'Apartamenty', 'Pensjonat, hotel', 'Lokal', 'Wielorodzinny', 'Inny'],
  },
  formTexts: {
    region: 'Formularz: wyślij rzuty do opiekuna',
    role: 'Kim jesteś',
    stage: 'Etap projektu',
    object: 'Obiekt',
    name: 'Imię i nazwisko',
    namePlaceholder: 'np. Anna Kowalska',
    firm: 'Pracownia lub firma',
    firmPlaceholder: 'np. Pracownia Architektury',
    phone: 'Telefon *',
    phonePlaceholder: 'np. 600 000 000',
    town: 'Miejscowość inwestycji',
    townPlaceholder: 'np. Zakopane',
    // Spec §2.6: no upload in v1 — a link instead of the file field.
    link: 'Link do rzutów (opcjonalnie)',
    linkPlaceholder: 'np. dysk Google, WeTransfer',
    linkNote: 'Pliki możesz też wysłać mailem w odpowiedzi na potwierdzenie.',
    message: 'Wiadomość',
    messagePlaceholder:
      'Co projektujesz, jakie instalacje rozważa inwestor, na kiedy potrzebujesz uwag',
    send: 'Wyślij do opiekuna',
    sending: 'Wysyłamy…',
    sentTitle: 'Dziękujemy. Mamy Twoje zgłoszenie.',
    sentNumber: 'Numer zgłoszenia:',
    sentText: 'Opiekun oddzwoni do 24 h w dni robocze. Jeśli projekt jest pilny, zadzwoń:',
    sentMail: 'Rzuty możesz też wysłać na',
    again: 'Wyślij kolejny projekt',
    errors: {
      name: 'Podaj imię, żebyśmy wiedzieli, jak się do Ciebie zwracać.',
      phone: 'Podaj numer telefonu (9 cyfr), żebyśmy mogli oddzwonić.',
      email: 'Podaj adres e-mail, na który wyślemy wiadomość.',
      consent: 'Zaznacz zgodę na kontakt w sprawie zgłoszenia.',
      marketing: 'Zaznacz zgodę na informacje handlowe e-mailem, żeby zapisać się na nowości.',
      failed: 'Nie udało się wysłać. Spróbuj ponownie albo zadzwoń.',
      limit: 'Za dużo zgłoszeń z tego adresu. Spróbuj za chwilę albo zadzwoń.',
    },
  },
  emailForms: {
    name: 'Imię',
    namePlaceholder: 'np. Anna',
    email: 'E-mail',
    emailPlaceholder: 'adres@pracownia.pl',
    pdfSend: 'Wyślij PDF',
    pdfSent: 'Wysłane. Opiekun prześle checklistę na podany adres.',
    newsSend: 'Zapisz pracownię',
    newsSent: 'Zapisane. Pierwszy e-mail z nowościami wkrótce.',
    // ADR-I005 §3 / spec §2.7: a separate consent for commercial e-mails, never pre-ticked.
    marketing:
      'Zgadzam się na otrzymywanie informacji handlowych PRO-KOM e-mailem (nowe rozwiązania, prezentacje). Zgodę mogę wycofać w każdej chwili.',
  },
  /** The home's `#architekci` (`Main.body.html`, `Main.js` → `arhm`, ADR-I005 §5). */
  teaser: {
    eyebrow: 'Dla architektów, projektantów i deweloperów',
    heading: 'Projektujesz dom albo inwestycję?',
    accent: 'Technikę zaplanujemy z Tobą.',
    lead: 'Plan urządzeń na rzutach i proste wytyczne do projektu: monitoring, sieć, smart home Ampio, dźwięk, ekrany i ładowarki. Bez kucia po tynkach i bez urządzeń, które psują wnętrze.',
    points: [
      {
        icon: 'ruler',
        title: 'Plan urządzeń na rzutach',
        text: 'Kamery, czujki, głośniki, Wi-Fi, panele i trasy kabli.',
      },
      {
        icon: 'eye',
        title: 'Technika, której nie widać',
        text: 'Głośniki w suficie, szklane panele, TV w zabudowie.',
      },
      {
        icon: 'users',
        title: 'Jeden opiekun',
        text: 'Od koncepcji, przez budowę, do serwisu po odbiorze.',
      },
      { icon: 'chat', title: 'Zawsze pomożemy', text: 'Nawet jeśli to jedno pytanie do projektu.' },
    ] as { icon: InstIconName; title: string; text: string }[],
    more: 'Współpraca dla architektów →',
    send: 'Wyślij rzuty',
    news: 'Nowość',
  },
  /** The link from service pages and „Dla kogo” pages (spec §7, ADR-I005). */
  related: { label: 'Projektujesz? Współpraca dla architektów →', href: '/dla-architektow' },
}

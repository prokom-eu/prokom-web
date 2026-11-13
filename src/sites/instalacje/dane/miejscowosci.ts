import type { AreaSlug } from '@/lib/instalacje/area'

import type { ServiceKey } from './types'

/**
 * Texts of the town pages `/obszar/<slug>` (ADR-I006). Every field below is written for its town:
 * no sentence repeats between towns (`miejscowosci.test.ts`), no made-up realizations, reviews or
 * numbers, no equipment prices. Contact data, the salon's address, service names and links and
 * the realizations come from the panel.
 */
export type TownText = {
  slug: AreaSlug
  /** „w Nowym Targu” — after „Instalacje”, „Pracujemy” etc. */
  locative: string
  /**
   * `podhale`: the everyday travel zone (Kontakt, home page). `dalej`: further in Małopolska —
   * travel agreed one by one, usually for larger investments (as the Kontakt page says).
   */
  zone: 'podhale' | 'dalej'
  /** One sentence for the list `/obszar`. */
  summary: string
  /** Meta description, ≤ 160 characters. */
  description: string
  /** Hero lead, two sentences. */
  lead: string
  /** „Czym ta okolica się różni” — three features of the place and what they mean for the install. */
  traits: readonly { icon: string; title: string; text: string }[]
  /** The services that matter most here, in order, each with why. */
  services: readonly { key: ServiceKey; text: string }[]
  /** How we get there from the salon in Rabka-Zdrój (the address itself comes from the panel). */
  route: string
  faq: readonly { question: string; answer: string }[]
  /** Neighbouring towns with their own page. */
  nearby: readonly AreaSlug[]
  /** Names a realization's „place” may use for this town (default: the town's name). */
  places?: readonly string[]
}

/** Texts shared by every town page (not part of the uniqueness check). */
export const townPage = {
  parent: { label: 'Obszar działania', href: '/obszar' },
  eyebrow: (locative: string) => `Instalacje ${locative}`,
  h1: (name: string) => ({ a: `Instalacje ${name}:`, b: 'monitoring, alarmy, smart home' }),
  tags: ['Wycena na piśmie po wizji lokalnej', '24 miesiące gwarancji na montaż'],
  routeTitle: 'Dojazd z salonu',
  routeLink: { label: 'Kontakt i dojazd', href: '/kontakt' },
  zoneNote: {
    podhale: 'Na co dzień jeździmy tu z Rabki-Zdroju — to nasza okolica.',
    dalej:
      'Dojazd ustalamy indywidualnie, zwykle przy większych inwestycjach. Napisz, co planujesz, a powiemy wprost, czy i kiedy przyjedziemy.',
  },
  traitsEyebrow: 'Czym ta okolica się różni',
  traitsHeading: (locative: string) => `Instalacja ${locative} — na co uważamy`,
  servicesEyebrow: 'Usługi',
  servicesHeading: (locative: string) => `Co montujemy ${locative} najczęściej`,
  servicesLead: 'Kolejność i opisy dobraliśmy do tej okolicy. Pełny zakres jest w ofercie.',
  serviceLink: 'Zobacz usługę',
  allServices: { label: 'Pełna oferta', href: '/uslugi' },
  realizationsEyebrow: 'Realizacje z okolicy',
  realizationsHeading: 'Tu już pracowaliśmy',
  realizationsLink: { label: 'Wszystkie realizacje', href: '/realizacje' },
  faqHeading: (locative: string) => `Pytania o instalacje ${locative}`,
  nearbyHeading: 'Pracujemy też w okolicy',
  allTowns: 'Wszystkie miejscowości',
  cta: {
    eyebrow: 'Wycena na piśmie',
    title: (locative: string) => `Zaplanuj instalację ${locative}`,
    text: 'Opisz obiekt w formularzu albo zadzwoń. Na zgłoszenie odpowiadamy do 24 h w dni robocze, a wycenę dostaniesz na piśmie przed montażem.',
  },
  list: {
    title: 'Obszar działania: od Podhala po Kraków',
    seoTitle: 'Obszar działania: Podhale, Kraków',
    eyebrow: 'Gdzie pracujemy',
    h1a: 'Instalacje od Podhala',
    h1b: 'po Kraków',
    lead: 'Salon mamy w Rabce-Zdroju. Na Podhalu i w okolicy jeździmy na co dzień, dalej w Małopolsce — przy większych inwestycjach. Wybierz miejscowość, żeby zobaczyć, co tam montujemy najczęściej.',
    description:
      'Monitoring, alarmy, sieci, smart home i nagłośnienie od Rabki-Zdroju po Kraków: Podhale, Zakopane, Nowy Targ, Myślenice. Wycena na piśmie po wizji lokalnej.',
    zones: {
      podhale: 'Podhale i okolice — na co dzień',
      dalej: 'Dalej w Małopolsce — przy większych inwestycjach',
    },
  },
} as const

export const TOWNS: readonly TownText[] = [
  {
    slug: 'rabka-zdroj',
    locative: 'w Rabce-Zdroju',
    zone: 'podhale',
    places: ['Rabka-Zdrój', 'Rabka', 'Ponice'],
    summary: 'Nasze miasto i salon — domy, pensjonaty, sanatoria i firmy od Ponic po Chabówkę.',
    description:
      'Monitoring, alarmy, Wi-Fi i smart home w Rabce-Zdroju. Salon na miejscu, wizja lokalna bez dalekiego dojazdu, serwis po montażu. Wycena na piśmie.',
    lead: 'W Rabce-Zdroju mamy salon, więc do obiektów w mieście i w Poniach mamy najbliżej. Montujemy w domach, pensjonatach, firmach i obiektach parafialnych — i zostajemy przy nich po odbiorze.',
    traits: [
      {
        icon: 'town',
        title: 'Uzdrowisko i goście',
        text: 'Pensjonaty i domy wczasowe żyją z gości, którzy oczekują działającego Wi-Fi w każdym pokoju. Sieć planujemy pod obłożenie w sezonie, nie pod pusty budynek.',
      },
      {
        icon: 'mountain',
        title: 'Domy na stokach',
        text: 'Wiele domów stoi na zboczach nad doliną Raby i Poniczanki. Kamery ustawiamy tak, żeby spadek terenu nie zasłaniał wjazdu ani furtki.',
      },
      {
        icon: 'church',
        title: 'Kościoły i szkoły',
        text: 'Robimy nagłośnienie i projekcję w obiektach, w których liczy się zrozumiałość mowy, a nie głośność. Ustawienia zostawiamy proste dla osoby, która obsługuje je na co dzień.',
      },
    ],
    services: [
      {
        key: 'kam',
        text: 'Kamery przy domu i pensjonacie z podglądem w telefonie. Blisko salonu, więc przegląd albo przestawienie kamery to krótka wizyta.',
      },
      {
        key: 'wifi',
        text: 'Wi-Fi w pensjonatach i domach wczasowych: punkty dostępowe na korytarzach i osobna sieć dla gości.',
      },
      {
        key: 'snd',
        text: 'Nagłośnienie kościołów, kaplic i sal — z mikrofonami bezprzewodowymi i prostym sterowaniem.',
      },
      {
        key: 'alarm',
        text: 'Alarm z powiadomieniem na telefon dla domów, w których właściciele często wyjeżdżają.',
      },
      {
        key: 'smart',
        text: 'Smart home Ampio w nowych domach: ogrzewanie, rolety i światło z jednej aplikacji, zaplanowane przed tynkami.',
      },
    ],
    route:
      'Salon jest w Rabce-Zdroju — możesz przyjść z rzutem domu albo zdjęciami obiektu i porozmawiać przy stole. Na wizję lokalną w mieście i w Poniach dojeżdżamy bez planowania dalekiej trasy.',
    faq: [
      {
        question: 'Czy mogę przyjść do salonu w Rabce przed wyceną?',
        answer:
          'Tak. Przynieś rzut, szkic albo zdjęcia obiektu — pokażemy sprzęt i powiemy, od czego zacząć. Wycenę na piśmie przygotujemy po wizji lokalnej.',
      },
      {
        question: 'Prowadzę pensjonat w Rabce — czy zrobicie Wi-Fi bez kucia ścian?',
        answer:
          'Zwykle tak. Najpierw sprawdzamy, którędy da się poprowadzić przewody istniejącymi kanałami, a punkty dostępowe stawiamy tam, gdzie nie trzeba ruszać pokoi.',
      },
      {
        question: 'Czy przejmiecie serwis instalacji założonej przez inną firmę w Rabce?',
        answer:
          'Tak. Oglądamy, co jest zamontowane, porządkujemy hasła i dokumentację, a potem robimy przeglądy jak przy własnych instalacjach.',
      },
    ],
    nearby: ['jordanow', 'nowy-targ', 'mszana-dolna', 'lubien'],
  },
  {
    slug: 'nowy-targ',
    locative: 'w Nowym Targu',
    zone: 'podhale',
    summary: 'Stolica Podhala — firmy, hale, sklepy i domy w Kotlinie Nowotarskiej.',
    description:
      'Monitoring firm i hal, alarmy domów, sieci w biurach i ładowarki EV w Nowym Targu. Sprzęt na mróz Kotliny Nowotarskiej, wycena na piśmie, serwis.',
    lead: 'Nowy Targ to dla nas firmy, hale, sklepy i domy jednorodzinne na osiedlach wokół miasta. W Kotlinie Nowotarskiej zimą często trzyma mróz, więc sprzęt na zewnątrz dobieramy z zapasem.',
    traits: [
      {
        icon: 'snow',
        title: 'Mroźna kotlina',
        text: 'Zimne powietrze zalega w kotlinie, a nocą temperatura spada mocniej niż w okolicy. Kamery i czujki zewnętrzne muszą mieć zakres pracy dopasowany do takich nocy.',
      },
      {
        icon: 'factory',
        title: 'Hale i place',
        text: 'Przy halach i placach składowych liczy się zasięg i noc: kamery z oświetlaczem, czytelny obraz bramy wjazdowej i nagrania, które da się szybko przejrzeć.',
      },
      {
        icon: 'shop',
        title: 'Sklepy w centrum',
        text: 'W lokalach przy rynku i głównych ulicach łączymy monitoring kasy z alarmem i ekranem w witrynie, żeby jedna firma odpowiadała za całość.',
      },
    ],
    services: [
      {
        key: 'kam',
        text: 'Monitoring hal, placów i parkingów firm z nagrywarką w biurze i podglądem dla właściciela.',
      },
      {
        key: 'kd',
        text: 'Kontrola dostępu w firmach z kilkoma zmianami: karty lub kody dla pracowników i historia wejść.',
      },
      {
        key: 'wifi',
        text: 'Sieć w biurze i na hali — przewodowa tam, gdzie stoją komputery, Wi-Fi tam, gdzie chodzą ludzie.',
      },
      {
        key: 'ev',
        text: 'Ładowarki Elzab EcoPower dla firm z samochodami służbowymi i dla domów z instalacją fotowoltaiczną.',
      },
      {
        key: 'alarm',
        text: 'Alarmy w domach na osiedlach wokół miasta, z czujkami zewnętrznymi dobranymi do mrozu.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy zakopianką na południe — Nowy Targ to pierwsze duże miasto po drodze. Termin wizji lokalnej ustalamy w rozmowie.',
    faq: [
      {
        question: 'Czy kamery wytrzymają mróz w Nowym Targu?',
        answer:
          'Dobieramy kamery i obudowy do najniższych temperatur, jakie zdarzają się w kotlinie, i prowadzimy zasilanie tak, żeby przewody nie pękały zimą. Na wizji lokalnej sprawdzamy, które miejsca są najbardziej wystawione.',
      },
      {
        question: 'Mamy halę i biuro w Nowym Targu — czy jedna nagrywarka wystarczy?',
        answer:
          'Często tak, jeśli obiekty łączy sieć. Gdy są daleko od siebie, stawiamy osobne rejestratory i jeden podgląd w telefonie — decyzję podejmujemy po obejrzeniu terenu.',
      },
      {
        question: 'Czy zamontujecie ładowarkę samochodu przy firmie w Nowym Targu?',
        answer:
          'Tak. Najpierw sprawdzamy przyłącze i rozdzielnicę, potem dobieramy moc ładowarki tak, żeby nie wyłączała reszty zakładu.',
      },
    ],
    nearby: ['rabka-zdroj', 'poronin', 'szczawnica', 'bialka-tatrzanska'],
  },
  {
    slug: 'zakopane',
    locative: 'w Zakopanem',
    zone: 'podhale',
    summary: 'Apartamenty na wynajem, pensjonaty, sklepy i lokale pod Tatrami.',
    description:
      'Zamki z kodem do apartamentów, Wi-Fi w pensjonatach, monitoring sklepów i nagłośnienie lokali w Zakopanem. Montaż odporny na halny, wycena na piśmie.',
    lead: 'W Zakopanem najczęściej pracujemy dla właścicieli apartamentów na wynajem, pensjonatów, sklepów i lokali. Goście przyjeżdżają o każdej porze, a halny potrafi w jedną noc sprawdzić każdy montaż na zewnątrz.',
    traits: [
      {
        icon: 'wind',
        title: 'Halny',
        text: 'Wiatr halny szarpie masztami, antenami i kamerami na narożnikach. Uchwyty i maszty mocujemy tak, jakby wiało każdej nocy, i unikamy wysokich, wiotkich wysięgników.',
      },
      {
        icon: 'key',
        title: 'Wynajem na doby',
        text: 'Gość przyjeżdża wieczorem, właściciel jest daleko. Zamek z kodem i zdalny podgląd wejścia oszczędzają przekazywania kluczy i nocnych telefonów.',
      },
      {
        icon: 'shop',
        title: 'Sezon w lokalach',
        text: 'W sklepach i restauracjach w sezonie jest tłoczno, a hałas z ulicy wchodzi do środka. Nagłośnienie strefowe i ekrany w witrynie pracują tu codziennie przez wiele godzin.',
      },
    ],
    services: [
      {
        key: 'kd',
        text: 'Zamki z kodem do apartamentów i pensjonatów: osobny kod dla każdego gościa, wydawany bez spotkania.',
      },
      {
        key: 'wifi',
        text: 'Wi-Fi w pensjonatach i apartamentowcach, z siecią gości oddzieloną od kamer i recepcji.',
      },
      {
        key: 'kam',
        text: 'Monitoring sklepów i lokali: kasa, wejście i zaplecze, nagrania dostępne dla właściciela z telefonu.',
      },
      {
        key: 'snd',
        text: 'Muzyka i komunikaty w sklepach i restauracjach, osobno w każdej strefie lokalu.',
      },
      {
        key: 'scr',
        text: 'Ekrany w witrynach i menu board w lokalach gastronomicznych, z treścią zmienianą zdalnie.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy zakopianką przez Nowy Targ. Zakopane jest w naszej strefie dojazdu, ale salonu tu nie mamy — wizję lokalną umawiamy na konkretny dzień i łączymy z innymi wizytami pod Tatrami.',
    faq: [
      {
        question: 'Czy zamek z kodem w apartamencie w Zakopanem działa bez internetu?',
        answer:
          'Zależy od modelu. Są zamki, które przyjmują kody wygenerowane wcześniej i działają bez sieci, oraz takie, którymi zarządza się zdalnie przez internet. Dobieramy je do tego, jak wynajmujesz.',
      },
      {
        question: 'Czy po halnym w Zakopanem przyjedziecie poprawić antenę albo kamerę?',
        answer:
          'Tak, zgłoś awarię przez formularz serwisu albo telefonicznie. Odpowiadamy do 24 h w dni robocze, a część ustawień kamer sprawdzamy najpierw zdalnie.',
      },
      {
        question: 'Mam sklep na Krupówkach w Zakopanem — od czego zacząć: kamery czy alarm?',
        answer:
          'W lokalu otwartym do późna zwykle zaczynamy od kamer nad kasą i wejściem, a alarm dokładamy na noc. Na wizji lokalnej pokażemy, gdzie kamera da najwięcej.',
      },
    ],
    nearby: ['poronin', 'bukowina-tatrzanska', 'nowy-targ', 'bialka-tatrzanska'],
  },
  {
    slug: 'jordanow',
    locative: 'w Jordanowie',
    zone: 'podhale',
    summary: 'Sąsiednie miasteczko za Chabówką — domy, gospodarstwa i firmy niedaleko zakopianki.',
    description:
      'Alarmy, monitoring, anteny i smart home w Jordanowie i okolicy. Domy, gospodarstwa i firmy niedaleko zakopianki, sprzęt na rozległe działki. Wycena na piśmie.',
    lead: 'Jordanów leży tuż za Chabówką, więc to dla nas bliski sąsiad. Pracujemy tu w domach jednorodzinnych, gospodarstwach na rozległych działkach i firmach, które korzystają z bliskości zakopianki.',
    traits: [
      {
        icon: 'home',
        title: 'Rozległe działki',
        text: 'Dom, stodoła i garaż stoją często w różnych miejscach jednej działki. Kamery łączymy przewodem albo mostem radiowym, żeby budynek gospodarczy też był w podglądzie.',
      },
      {
        icon: 'dish',
        title: 'Telewizja na wzgórzach',
        text: 'Wzgórza Beskidu Makowskiego zasłaniają nadajniki. Antenę naziemną albo satelitarną ustawiamy po pomiarze sygnału na dachu, nie na oko.',
      },
      {
        icon: 'car',
        title: 'Firmy przy trasie',
        text: 'Warsztaty, składy i firmy usługowe przy drodze potrzebują czytelnego obrazu wjazdu i tablic rejestracyjnych, także po zmroku.',
      },
    ],
    services: [
      {
        key: 'alarm',
        text: 'Alarm domu z czujkami w budynkach gospodarczych i powiadomieniem na telefon.',
      },
      {
        key: 'kam',
        text: 'Kamery obejmujące całą działkę — dom, podwórze i wjazd — z jedną nagrywarką.',
      },
      {
        key: 'ant',
        text: 'Anteny satelitarne i naziemne ustawiane po pomiarze, z rozprowadzeniem sygnału do kilku telewizorów.',
      },
      {
        key: 'smart',
        text: 'Smart home Ampio w budowanych domach: zaplanowany razem z elektryką, zanim wejdą tynki.',
      },
    ],
    route:
      'Z Rabki-Zdroju do Jordanowa jedziemy przez Chabówkę — to jedna z najbliższych miejscowości poza miastem, a termin wizji lokalnej ustalamy w rozmowie.',
    faq: [
      {
        question: 'Czy obejmiecie kamerami stodołę oddaloną od domu w Jordanowie?',
        answer:
          'Tak. Gdy przekop jest możliwy, kładziemy przewód w ziemi; gdy nie, łączymy budynki mostem radiowym. Wybór zależy od odległości i tego, co stoi między budynkami.',
      },
      {
        question: 'Telewizja naziemna słabo łapie u mnie w okolicy Jordanowa — co możecie zrobić?',
        answer:
          'Mierzymy sygnał na dachu i sprawdzamy, z którego nadajnika da się go odebrać. Jeśli naziemna nie wystarczy, proponujemy antenę satelitarną.',
      },
      {
        question: 'Budujemy dom pod Jordanowem — kiedy zaprosić was na budowę?',
        answer:
          'Najlepiej przed elektrykiem, na etapie stanu surowego. Wtedy przewody do kamer, alarmu i sieci idą razem z resztą instalacji, bez kucia po tynkach.',
      },
    ],
    nearby: ['rabka-zdroj', 'lubien', 'mszana-dolna', 'pcim'],
  },
  {
    slug: 'mszana-dolna',
    locative: 'w Mszanie Dolnej',
    zone: 'podhale',
    summary: 'Między Gorcami a Beskidem Wyspowym — domy, restauracje, sale weselne i firmy.',
    description:
      'Nagłośnienie sal i restauracji, monitoring, alarmy i Wi-Fi w Mszanie Dolnej. Między Gorcami a Beskidem Wyspowym. Wycena na piśmie, serwis po montażu.',
    lead: 'Mszana Dolna leży między Gorcami a Beskidem Wyspowym, na wschód od Rabki. Montujemy tu w domach, restauracjach i salach przyjęć, w których jednego wieczoru gra zespół, a następnego odbywa się zebranie.',
    traits: [
      {
        icon: 'music',
        title: 'Sale przyjęć',
        text: 'W salach weselnych i restauracjach dźwięk ma brzmieć dobrze przy pełnej sali i przy kilku stolikach. Strefy i osobne sterowanie pozwalają grać głośno w jednej części, a rozmawiać w drugiej.',
      },
      {
        icon: 'drop',
        title: 'Doliny potoków',
        text: 'Część domów stoi blisko Mszanki i Raby, w wilgotnych dolinach. Zewnętrzne puszki i złącza uszczelniamy tak, żeby wilgoć nie wchodziła do przewodów.',
      },
      {
        icon: 'lte',
        title: 'Słabszy zasięg',
        text: 'W bocznych dolinach zasięg komórkowy bywa słaby, a to od niego zależy powiadomienie z alarmu. Sprawdzamy sygnał przed montażem i dobieramy sposób łączności.',
      },
    ],
    services: [
      {
        key: 'snd',
        text: 'Nagłośnienie i obraz w salach przyjęć i restauracjach: muzyka, mikrofony, rzutnik albo ekran.',
      },
      {
        key: 'kam',
        text: 'Monitoring parkingu i wejścia do lokalu, z nagraniami dostępnymi po imprezie.',
      },
      {
        key: 'alarm',
        text: 'Alarm domu z łącznością dobraną do zasięgu w dolinie — tak, żeby powiadomienie naprawdę dochodziło.',
      },
      {
        key: 'wifi',
        text: 'Wi-Fi w lokalu i na sali, z osobną siecią dla gości i dla kasy.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy na wschód, w stronę Gorców i Beskidu Wyspowego. Mszana Dolna jest w naszej codziennej strefie dojazdu, a przy okazji wizyty obejrzymy też obiekty w okolicznych wsiach.',
    faq: [
      {
        question:
          'Czy nagłośnicie salę weselną w Mszanie Dolnej tak, żeby zespół mógł się podpiąć?',
        answer:
          'Tak. Planujemy stałe nagłośnienie sali z miejscem na podłączenie zespołu albo DJ-a, a do tego mikrofony do przemówień. Ustawienia zapisujemy tak, żeby obsługa nie musiała ich za każdym razem szukać.',
      },
      {
        question: 'Pod Mszaną Dolną słabo łapie telefon — czy alarm wyśle powiadomienie?',
        answer:
          'Sprawdzamy zasięg na miejscu. Gdy sieć komórkowa jest słaba, alarm wysyła powiadomienia przez internet z domowego łącza, a komórka zostaje jako zapas.',
      },
      {
        question: 'Mam restaurację w Mszanie Dolnej — czy ekran z menu zmienię sam?',
        answer:
          'Tak. Treść na ekranie zmieniasz z komputera albo telefonu, a my przygotujemy szablon i pokażemy, jak to robić.',
      },
    ],
    nearby: ['rabka-zdroj', 'limanowa', 'jordanow', 'pcim'],
  },
  {
    slug: 'lubien',
    locative: 'w Lubniu',
    zone: 'dalej',
    summary: 'Wieś przy zakopiance za tunelem pod Luboniem Małym — domy przy trasie i nowe budowy.',
    description:
      'Monitoring, alarmy, anteny i sieci w Lubniu przy zakopiance. Domy przy ruchliwej trasie, nowe budowy, zasilanie awaryjne. Wycena na piśmie po wizji.',
    lead: 'Lubień leży przy zakopiance na północ od Rabki — jedziemy tam nową trasą przez tunel. Pracujemy w domach przy drodze i na nowych budowach na zboczach nad doliną Raby.',
    traits: [
      {
        icon: 'car',
        title: 'Dom przy trasie',
        text: 'Przy ruchliwej drodze kamera widzi setki przejeżdżających aut. Strefy detekcji ustawiamy tak, żeby powiadomienia przychodziły z podwórza, a nie z ulicy.',
      },
      {
        icon: 'crane',
        title: 'Nowe budowy',
        text: 'Na zboczach powstają nowe domy. Plac budowy możemy zabezpieczyć kamerą z zasilaniem z akumulatora, a później przenieść ją na gotowy dom.',
      },
      {
        icon: 'battery',
        title: 'Przerwy w prądzie',
        text: 'Burze w górach potrafią wyłączyć prąd na wiele godzin. Alarm i nagrywarkę podpinamy do zasilania awaryjnego, żeby nie gasły razem z domem.',
      },
    ],
    services: [
      {
        key: 'kam',
        text: 'Kamery przy domu przy trasie, z mądrze ustawionymi strefami powiadomień.',
      },
      {
        key: 'alarm',
        text: 'Alarm z akumulatorem i powiadomieniem na telefon, gdy zgaśnie prąd albo otworzą się drzwi.',
      },
      {
        key: 'ant',
        text: 'Anteny naziemne i satelitarne ustawione po pomiarze — doliny wokół Lubnia mają różny odbiór.',
      },
      {
        key: 'wifi',
        text: 'Wi-Fi w całym domu i na działce, z punktem dostępowym przy tarasie albo garażu.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy zakopianką na północ, przez tunel pod Luboniem Małym. Lubień jest już poza naszą codzienną strefą, więc dojazd i termin ustalamy przy pierwszej rozmowie.',
    faq: [
      {
        question:
          'Mieszkam przy zakopiance w Lubniu — czy kamera nie będzie budzić mnie co chwilę?',
        answer:
          'Nie powinna. Ustawiamy strefy detekcji tylko na Twoją posesję i wybieramy rozpoznawanie ludzi i pojazdów, więc auta jadące drogą nie wysyłają powiadomień.',
      },
      {
        question: 'Czy zabezpieczycie budowę domu pod Lubniem, zanim będzie prąd?',
        answer:
          'Tak. Stawiamy kamerę z akumulatorem i łącznością komórkową, a po przeprowadzce przenosimy ją albo zamieniamy na stałą instalację.',
      },
      {
        question: 'Co się stanie z alarmem w Lubniu, gdy burza wyłączy prąd?',
        answer:
          'Centrala przełącza się na akumulator i wysyła powiadomienie o braku zasilania. Pojemność akumulatora dobieramy do tego, jak długo zwykle trwają przerwy w Twojej okolicy.',
      },
    ],
    nearby: ['rabka-zdroj', 'pcim', 'jordanow', 'myslenice'],
  },
  {
    slug: 'pcim',
    locative: 'w Pcimiu',
    zone: 'dalej',
    summary: 'Długa wieś w dolinie Raby przy zakopiance — domy, warsztaty i firmy.',
    description:
      'Monitoring firm i domów, alarmy, sieci i ładowarki EV w Pcimiu w dolinie Raby. Obiekty przy zakopiance, łączenie kilku budynków. Wycena na piśmie.',
    lead: 'Pcim ciągnie się wzdłuż Raby i zakopianki między Lubniem a Myślenicami. Pracujemy tu w domach i w firmach, które mają dom, biuro i warsztat na jednej działce.',
    traits: [
      {
        icon: 'tool',
        title: 'Warsztat przy domu',
        text: 'Częsty układ to dom i zakład obok siebie. Jedna sieć, jedna nagrywarka i osobne strefy alarmu dla domu i warsztatu upraszczają obsługę.',
      },
      {
        icon: 'flood',
        title: 'Nad Rabą',
        text: 'Część zabudowy stoi nisko nad rzeką. Rejestratory, zasilacze i rozdzielnice sieciowe montujemy wyżej, a nie w piwnicy na podłodze.',
      },
      {
        icon: 'mountain',
        title: 'Boczne doliny',
        text: 'Domy w bocznych dolinach mają słabszy internet i zasięg. Na miejscu sprawdzamy, czy podgląd kamer pójdzie przez łącze kablowe, radiowe czy komórkowe.',
      },
    ],
    services: [
      {
        key: 'kam',
        text: 'Monitoring domu i warsztatu z jednym podglądem w telefonie i nagraniami w jednym miejscu.',
      },
      {
        key: 'alarm',
        text: 'Alarm z osobnymi strefami dla domu i zakładu — uzbrajasz warsztat, a w domu dalej chodzisz swobodnie.',
      },
      {
        key: 'wifi',
        text: 'Sieć łącząca budynki na działce, z punktami Wi-Fi tam, gdzie się pracuje.',
      },
      {
        key: 'ev',
        text: 'Ładowarka samochodu przy domu albo firmie, podłączona po sprawdzeniu przyłącza.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy zakopianką na północ, przez Lubień. Pcim jest po drodze do Myślenic, poza codzienną strefą — dojazd ustalamy indywidualnie, a wizję lokalną łączymy z innymi wizytami w dolinie Raby.',
    faq: [
      {
        question: 'Mam dom i warsztat obok siebie w Pcimiu — jeden alarm czy dwa?',
        answer:
          'Zwykle jedna centrala z dwiema strefami. Uzbrajasz osobno dom i warsztat, a wszystko obsługujesz z jednej aplikacji.',
      },
      {
        question: 'Internet u mnie pod Pcimiem jest słaby — czy podgląd kamer zadziała?',
        answer:
          'Kamery nagrywają na miejscu niezależnie od internetu. Podgląd w telefonie dopasowujemy do łącza: przy słabym ustawiamy lżejszy strumień obrazu.',
      },
      {
        question: 'Gdzie postawić nagrywarkę w domu nad Rabą w Pcimiu?',
        answer:
          'Wysoko i w suchym miejscu, najlepiej w szafce na piętrze albo w pomieszczeniu technicznym nad poziomem gruntu. Na wizji lokalnej wskażemy konkretne miejsce.',
      },
    ],
    nearby: ['lubien', 'myslenice', 'jordanow', 'mszana-dolna'],
  },
  {
    slug: 'myslenice',
    locative: 'w Myślenicach',
    zone: 'dalej',
    summary: 'Miasto domów jednorodzinnych i nowych osiedli — instalacje planowane od budowy.',
    description:
      'Smart home Ampio, alarmy, monitoring i ładowarki EV w domach jednorodzinnych w Myślenicach. Instalacje planowane od stanu surowego. Wycena na piśmie.',
    lead: 'Wokół Myślenic rosną osiedla domów jednorodzinnych, a wielu inwestorów buduje tu z myślą o dojazdach do Krakowa. Najwięcej sensu ma zaplanowanie instalacji, zanim elektryk zamknie ściany.',
    traits: [
      {
        icon: 'home',
        title: 'Domy jednorodzinne',
        text: 'Nowe domy to szansa, żeby przewody do kamer, alarmu, sieci i smart home poszły razem z elektryką. Później każdy taki przewód to kucie albo listwa.',
      },
      {
        icon: 'ev',
        title: 'Dojazdy do Krakowa',
        text: 'Kto codziennie jeździ do pracy, coraz częściej myśli o samochodzie elektrycznym. Miejsce i przewód pod ładowarkę warto przewidzieć w garażu od razu.',
      },
      {
        icon: 'stroller',
        title: 'Rodziny z dziećmi',
        text: 'Wideodomofon z podglądem w telefonie i Wi-Fi w każdym pokoju to dziś podstawa. Planujemy je tak, żeby nie trzeba było dokładać wzmacniaczy po przeprowadzce.',
      },
    ],
    services: [
      {
        key: 'smart',
        text: 'Smart home Ampio zaplanowany na etapie projektu: ogrzewanie, rolety, światło i sceny z aplikacji.',
      },
      {
        key: 'alarm',
        text: 'Alarm i wideodomofon w nowym domu, z przewodami poprowadzonymi przed tynkami.',
      },
      {
        key: 'wifi',
        text: 'Okablowanie strukturalne i Wi-Fi na każdym piętrze, z szafką sieciową w pomieszczeniu technicznym.',
      },
      {
        key: 'ev',
        text: 'Ładowarka Elzab EcoPower w garażu, z mocą dobraną do przyłącza domu.',
      },
      {
        key: 'kam',
        text: 'Kamery wokół domu, zaplanowane razem z oświetleniem elewacji.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy zakopianką na północ, przez Lubień i Pcim. Myślenice są już poza naszą codzienną strefą, więc dojazd i termin ustalamy przy pierwszej rozmowie.',
    faq: [
      {
        question: 'Budujemy dom w Myślenicach — na jakim etapie zaprosić was na budowę?',
        answer:
          'Najlepiej na etapie projektu albo stanu surowego, zanim elektryk zacznie kłaść przewody. Wtedy przygotujemy rozmieszczenie punktów i listę przewodów dla ekipy elektrycznej.',
      },
      {
        question: 'Czy smart home w domu pod Myślenicami można rozbudować później?',
        answer:
          'Tak, jeśli na starcie poprowadzimy przewody do miejsc, gdzie kiedyś coś stanie. Ampio rozbudowuje się modułami, bez wymiany całej instalacji.',
      },
      {
        question: 'Czy przyjedziecie do Myślenic z Rabki?',
        answer:
          'Tak, przy domach w budowie i większych instalacjach. Dojazd ustalamy indywidualnie — opisz obiekt, a powiemy, kiedy możemy przyjechać na wizję lokalną.',
      },
    ],
    nearby: ['dobczyce', 'pcim', 'krakow', 'wieliczka'],
  },
  {
    slug: 'dobczyce',
    locative: 'w Dobczycach',
    zone: 'dalej',
    summary:
      'Domy i działki rekreacyjne nad Jeziorem Dobczyckim — obiekty, w których nie ma nikogo.',
    description:
      'Monitoring i alarmy domów letniskowych, smart home i sieci w Dobczycach nad Jeziorem Dobczyckim. Zdalny nadzór nad pustym domem. Wycena na piśmie.',
    lead: 'Nad Jeziorem Dobczyckim stoją zarówno domy całoroczne, jak i domki odwiedzane tylko w weekendy. Właściciele najczęściej pytają, jak pilnować domu, w którym przez większość tygodnia nikogo nie ma.',
    traits: [
      {
        icon: 'drop',
        title: 'Domki nad jeziorem',
        text: 'Dom odwiedzany w weekendy potrzebuje alarmu, który zgłosi włamanie, zalanie albo zanik prądu. Czujki zalania przy kotłowni i pod zlewem dokładamy na życzenie.',
      },
      {
        icon: 'thermo',
        title: 'Ogrzewanie na odległość',
        text: 'Zimą przyjemnie jest przyjechać do ciepłego domu. Smart home pozwala podnieść temperaturę z telefonu w drodze, a w tygodniu trzymać ją niską.',
      },
      {
        icon: 'home',
        title: 'Nowe domy całoroczne',
        text: 'Wokół miasta przybywa domów jednorodzinnych. Instalacje w nich planujemy jak w Myślenicach — razem z elektryką, przed tynkami.',
      },
    ],
    services: [
      {
        key: 'alarm',
        text: 'Alarm domku letniskowego z czujkami zalania i powiadomieniem o zaniku prądu.',
      },
      {
        key: 'kam',
        text: 'Kamery z podglądem w telefonie, żeby w tygodniu sprawdzić, czy przy domu wszystko w porządku.',
      },
      {
        key: 'smart',
        text: 'Ogrzewanie i rolety sterowane zdalnie w Ampio — dom gotowy na Twój przyjazd.',
      },
      {
        key: 'wifi',
        text: 'Łącze i Wi-Fi w domu, w którym nikt nie mieszka na stałe, z routerem, który sam wraca do pracy po zaniku prądu.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy zakopianką do Myślenic, a dalej na wschód, nad jezioro. Dobczyce są poza codzienną strefą — dojazd ustalamy indywidualnie, najchętniej przy większym zakresie prac.',
    faq: [
      {
        question: 'Domek nad Jeziorem Dobczyckim stoi pusty w tygodniu — co zamontować najpierw?',
        answer:
          'Najczęściej alarm z powiadomieniem na telefon i jedną-dwie kamery na wejście i podjazd. Czujkę zalania warto dodać przy kotłowni.',
      },
      {
        question: 'Czy dom w Dobczycach może sam ogrzać się przed moim przyjazdem?',
        answer:
          'Tak, jeśli ogrzewanie da się sterować elektrycznie. W smart home ustawiasz temperaturę z telefonu, a w tygodniu dom trzyma niższą.',
      },
      {
        question: 'Czy kamery mają sens w domu pod Dobczycami bez stałego internetu?',
        answer:
          'Tak. Nagrywają na miejscu, a do podglądu wystarcza łącze komórkowe z routerem. Podgląd ustawimy tak, żeby nie zjadał pakietu danych.',
      },
    ],
    nearby: ['myslenice', 'wieliczka', 'krakow', 'limanowa'],
  },
  {
    slug: 'krakow',
    locative: 'w Krakowie',
    zone: 'dalej',
    summary:
      'Mieszkania, biura, lokale usługowe i inwestycje deweloperskie — przy większych zleceniach.',
    description:
      'Teletechnika dla deweloperów, kontrola dostępu w biurach, monitoring lokali i smart home w mieszkaniach w Krakowie. Przy większych inwestycjach.',
    lead: 'W Krakowie pracujemy przy większych zleceniach: lokalach usługowych, biurach, budynkach deweloperskich i mieszkaniach, w których inwestor chce instalacji zaplanowanej od projektu. Dojeżdżamy z Rabki-Zdroju, więc zakres i terminy ustalamy z góry.',
    traits: [
      {
        icon: 'apt',
        title: 'Mieszkania w blokach',
        text: 'W mieszkaniu nie wszystko wolno ruszyć: piony, wideodomofon budynku i ściany nośne należą do wspólnoty. Smart home i sieć planujemy w granicach lokalu, bez naruszania części wspólnych.',
      },
      {
        icon: 'office',
        title: 'Biura i lokale',
        text: 'W biurach liczy się kontrola dostępu, porządna sieć i monitoring wejść. W lokalach usługowych — kamery nad kasą, nagłośnienie i ekrany, które pracują cały dzień.',
      },
      {
        icon: 'build',
        title: 'Inwestycje deweloperskie',
        text: 'Deweloperom i projektantom dajemy teletechnikę budynku: okablowanie, wideodomofony, kontrolę dostępu do garażu i klatek, z dokumentacją do odbioru.',
      },
    ],
    services: [
      {
        key: 'tel',
        text: 'Teletechnika budynków wielorodzinnych: okablowanie, gniazda, szafy i dokumentacja powykonawcza.',
      },
      {
        key: 'kd',
        text: 'Kontrola dostępu w biurach i garażach podziemnych: karty, kody i historia wejść.',
      },
      {
        key: 'kam',
        text: 'Monitoring lokali usługowych i biur z dostępem dla właściciela i zarządcy.',
      },
      {
        key: 'snd',
        text: 'Nagłośnienie sklepów i lokali, z muzyką i komunikatami w osobnych strefach.',
      },
      {
        key: 'smart',
        text: 'Smart home Ampio w mieszkaniach od dewelopera, zaplanowany przed wykończeniem.',
      },
      {
        key: 'scr',
        text: 'Ekrany reklamowe w lokalach i witrynach, z treścią zmienianą zdalnie.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy zakopianką na północ, przez Myślenice. Kraków jest poza naszą codzienną strefą: przyjeżdżamy przy większych inwestycjach, a dojazd i harmonogram ustalamy indywidualnie przed wyceną.',
    faq: [
      {
        question: 'Czy robicie instalacje w Krakowie, skoro salon jest w Rabce?',
        answer:
          'Tak, przy większych zleceniach: lokalach, biurach, inwestycjach deweloperskich i mieszkaniach z pełnym zakresem prac. Przy drobnej naprawie powiemy wprost, czy dojazd z Rabki ma sens.',
      },
      {
        question: 'Jesteśmy deweloperem z Krakowa — czy dostaniemy dane do projektu?',
        answer:
          'Tak. Przygotowujemy założenia teletechniki do projektu i uzgadniamy je z projektantem. Szczegóły współpracy są na stronie dla architektów i deweloperów.',
      },
      {
        question: 'Czy smart home w mieszkaniu w Krakowie wymaga zgody wspólnoty?',
        answer:
          'Instalacja wewnątrz lokalu zwykle nie. Zgody potrzeba, gdy coś ma powstać na częściach wspólnych, na przykład przewód na klatce albo kamera na elewacji.',
      },
    ],
    nearby: ['wieliczka', 'skawina', 'myslenice', 'dobczyce'],
  },
  {
    slug: 'wieliczka',
    locative: 'w Wieliczce',
    zone: 'dalej',
    summary: 'Nowe osiedla domów pod Krakowem i obiekty noclegowe dla turystów.',
    description:
      'Alarmy, wideodomofony, monitoring i Wi-Fi w nowych domach i obiektach noclegowych w Wieliczce. Instalacje przy większych inwestycjach. Wycena na piśmie.',
    lead: 'Wieliczka to nowe osiedla domów na obrzeżach Krakowa i obiekty noclegowe dla turystów. Przyjeżdżamy tu przy budowie domu, wykończeniu kilku lokali naraz albo większej modernizacji.',
    traits: [
      {
        icon: 'grid',
        title: 'Osiedla szeregowców',
        text: 'W zabudowie szeregowej i bliźniaczej sąsiad stoi za ścianą. Kamery ustawiamy tak, żeby obejmowały Twoją posesję, a nie okna i ogród sąsiadów.',
      },
      {
        icon: 'bed',
        title: 'Noclegi dla turystów',
        text: 'Pensjonaty i apartamenty dla zwiedzających potrzebują Wi-Fi w każdym pokoju i wejścia bez recepcji przez całą dobę.',
      },
      {
        icon: 'crane',
        title: 'Budowy pod miastem',
        text: 'Wiele domów dopiero powstaje. Przewody do alarmu, kamer i sieci planujemy razem z elektryką, a na czas budowy możemy postawić kamerę na placu.',
      },
    ],
    services: [
      {
        key: 'alarm',
        text: 'Alarm i wideodomofon w domu szeregowym albo bliźniaku, z podglądem furtki w telefonie.',
      },
      {
        key: 'kam',
        text: 'Kamery ustawione z poszanowaniem prywatności sąsiadów, z maskami zasłaniającymi cudze okna.',
      },
      {
        key: 'wifi',
        text: 'Wi-Fi w obiektach noclegowych, z siecią gości odseparowaną od reszty.',
      },
      {
        key: 'kd',
        text: 'Zamki z kodem w apartamentach dla turystów, z kodami dla każdego pobytu.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy zakopianką w stronę Krakowa, a potem na wschód od miasta. Wieliczka jest poza codzienną strefą — przyjeżdżamy przy większych zleceniach, po wcześniejszym ustaleniu dojazdu.',
    faq: [
      {
        question: 'Mieszkam w szeregowcu w Wieliczce — czy kamera może patrzeć na wspólny podjazd?',
        answer:
          'Kamera powinna obejmować przede wszystkim Twoją część. Jeśli w kadrze jest wspólny podjazd, ustawiamy maski prywatności, a sąsiadów warto uprzedzić przed montażem.',
      },
      {
        question: 'Prowadzę apartamenty dla turystów w Wieliczce — jak wpuszczać gości nocą?',
        answer:
          'Zamek z kodem albo kontrola dostępu z kodami wysyłanymi przed przyjazdem. Gość wchodzi o dowolnej porze, a Ty widzisz w historii, kiedy otwarto drzwi.',
      },
      {
        question: 'Czy przyjedziecie do Wieliczki do jednego domu?',
        answer:
          'Do domu w budowie z pełnym zakresem instalacji — chętnie. Przy wymianie jednej kamery najpierw spróbujemy pomóc zdalnie.',
      },
    ],
    nearby: ['krakow', 'dobczyce', 'myslenice', 'skawina'],
  },
  {
    slug: 'skawina',
    locative: 'w Skawinie',
    zone: 'dalej',
    summary: 'Miasto przemysłu i domów pod Krakowem — zakłady, magazyny i nowe osiedla.',
    description:
      'Monitoring zakładów i magazynów, kontrola dostępu, sieci i ładowarki EV w Skawinie. Domy jednorodzinne pod Krakowem. Przy większych inwestycjach.',
    lead: 'Skawina łączy tradycję przemysłową z nowymi osiedlami domów na obrzeżach Krakowa. Przyjeżdżamy tu do zakładów, magazynów i firm usługowych oraz do domów budowanych z pełnym zakresem instalacji.',
    traits: [
      {
        icon: 'factory',
        title: 'Zakłady i magazyny',
        text: 'Na terenie firmy liczy się ogrodzenie, bramy i rampy. Kamery z analizą obrazu odróżniają człowieka przy płocie od liści na wietrze.',
      },
      {
        icon: 'card',
        title: 'Wielu pracowników',
        text: 'Gdy przez bramę przechodzi kilka zmian dziennie, klucze się nie sprawdzają. Karty, breloki albo kody łatwo dodać i odebrać, a historia wejść zostaje.',
      },
      {
        icon: 'plug',
        title: 'Floty i ładowanie',
        text: 'Firmy z samochodami służbowymi zaczynają ładować je na miejscu. Kilka ładowarek na jednym przyłączu wymaga zaplanowania mocy, żeby nie wyłączać produkcji.',
      },
    ],
    services: [
      {
        key: 'kam',
        text: 'Monitoring terenu zakładu, bram i ramp, z czasem przechowywania nagrań ustalonym z firmą.',
      },
      {
        key: 'kd',
        text: 'Kontrola dostępu dla pracowników kilku zmian: brama, hala i biuro na jednym systemie.',
      },
      {
        key: 'wifi',
        text: 'Sieć na hali i w magazynie, z Wi-Fi dla skanerów i terminali.',
      },
      {
        key: 'ev',
        text: 'Ładowarki dla floty firmowej, z mocą rozłożoną na kilka stanowisk.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy zakopianką w stronę Krakowa, a dalej na zachód od miasta. Do Skawiny przyjeżdżamy przy większych zleceniach — termin i dojazd ustalamy przy pierwszej rozmowie.',
    faq: [
      {
        question: 'Czy zrobicie monitoring całego terenu zakładu w Skawinie?',
        answer:
          'Tak. Zaczynamy od obejścia terenu i ustalenia, co trzeba widzieć: ogrodzenie, bramy, rampy, parking. Na tej podstawie dobieramy kamery i miejsce na nagrywarkę.',
      },
      {
        question: 'Mamy w Skawinie kilka zmian — jak połączyć kontrolę dostępu z bramą?',
        answer:
          'Jeden system obsługuje bramę, drzwi hali i biura. Pracownik używa tej samej karty albo kodu, a uprawnienia ustawiasz osobno dla każdej strefy.',
      },
      {
        question: 'Ile ładowarek zmieści się na przyłączu firmy w Skawinie?',
        answer:
          'To zależy od mocy przyłącza i tego, co pracuje w zakładzie. Sprawdzamy rozdzielnicę i proponujemy rozwiązanie, które dzieli moc między stanowiska.',
      },
    ],
    nearby: ['krakow', 'wieliczka', 'myslenice', 'dobczyce'],
  },
  {
    slug: 'limanowa',
    locative: 'w Limanowej',
    zone: 'dalej',
    summary: 'Miasto w Beskidzie Wyspowym — firmy, sklepy, domy na wzgórzach.',
    description:
      'Monitoring firm i sklepów, alarmy domów, anteny i nagłośnienie w Limanowej w Beskidzie Wyspowym. Przy większych zleceniach. Wycena na piśmie.',
    lead: 'Limanowa leży w Beskidzie Wyspowym, za Mszaną Dolną. Przyjeżdżamy tu do firm, sklepów i domów na wzgórzach, zwykle gdy zakres prac jest większy niż jedna kamera.',
    traits: [
      {
        icon: 'mountain',
        title: 'Domy na wzgórzach',
        text: 'Pojedyncze góry Beskidu Wyspowego zasłaniają nadajniki i stacje komórkowe. Odbiór telewizji i zasięg sprawdzamy w konkretnym miejscu, a nie z mapy.',
      },
      {
        icon: 'shop',
        title: 'Handel w mieście',
        text: 'W sklepach i punktach usługowych w centrum łączymy kamery nad kasą z alarmem na noc i ekranem z ofertą w witrynie.',
      },
      {
        icon: 'storm',
        title: 'Burze',
        text: 'Na wzgórzach burze są częste, a przepięcia uszkadzają kamery i rejestratory. Stosujemy ochronę przepięciową i uziemienie masztów.',
      },
    ],
    services: [
      {
        key: 'kam',
        text: 'Monitoring firm i sklepów z podglądem dla właściciela, także poza miastem.',
      },
      {
        key: 'alarm',
        text: 'Alarm domu na wzgórzu, z łącznością sprawdzoną przed montażem.',
      },
      {
        key: 'ant',
        text: 'Anteny satelitarne i naziemne z ochroną przepięciową masztu.',
      },
      {
        key: 'snd',
        text: 'Nagłośnienie sal, lokali i obiektów parafialnych.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy na wschód, przez Mszanę Dolną. Limanowa jest poza naszą codzienną strefą — dojazd ustalamy indywidualnie, zwykle przy większych zleceniach.',
    faq: [
      {
        question: 'Czy burza nie uszkodzi kamer na domu pod Limanową?',
        answer:
          'Ryzyko zmniejszają ochronniki przepięciowe na przewodach i dobre uziemienie. Montujemy je przy kamerach zewnętrznych i przy masztach antenowych.',
      },
      {
        question: 'Mam sklep w Limanowej — czy podłączycie też ekran w witrynie?',
        answer:
          'Tak. Przy jednej wizycie możemy zaplanować kamery, alarm i ekran z ofertą, z jedną firmą do serwisu wszystkiego.',
      },
      {
        question: 'Czy dojedziecie do Limanowej na drobną naprawę?',
        answer:
          'Przy drobnej usterce najpierw spróbujemy pomóc zdalnie. Na miejsce przyjeżdżamy przy większych pracach albo gdy zdalnie nie da się nic zrobić.',
      },
    ],
    nearby: ['mszana-dolna', 'dobczyce', 'rabka-zdroj', 'szczawnica'],
  },
  {
    slug: 'poronin',
    locative: 'w Poroninie',
    zone: 'podhale',
    summary: 'Między Nowym Targiem a Zakopanem — pensjonaty, domki i domy góralskie.',
    description:
      'Wi-Fi w pensjonatach, zamki z kodem, monitoring i anteny w Poroninie i okolicy. Montaż odporny na halny i mróz. Wycena na piśmie po wizji lokalnej.',
    lead: 'Poronin leży przy zakopiance tuż przed Zakopanem. Pracujemy tu w pensjonatach, domkach na wynajem i domach góralskich, w których drewno i duże połacie dachu wymagają innego montażu niż w murowanym bloku.',
    traits: [
      {
        icon: 'home',
        title: 'Drewniane domy',
        text: 'W domach z bali i z drewnianą elewacją przewody prowadzimy tak, żeby nie były widoczne i nie osłabiały konstrukcji. Puszki i uchwyty dobieramy do drewna.',
      },
      {
        icon: 'wind',
        title: 'Wiatr od Tatr',
        text: 'Halny dochodzi tu z pełną siłą. Anteny i kamery na szczytach dachów mocujemy do konstrukcji, a nie do samego pokrycia.',
      },
      {
        icon: 'bed',
        title: 'Domki na wynajem',
        text: 'Kilka domków na jednej działce to jedna sieć, jeden monitoring parkingu i osobne kody do każdego domku.',
      },
    ],
    services: [
      {
        key: 'wifi',
        text: 'Wi-Fi w pensjonacie albo kilku domkach na działce, z jednym zarządzaniem siecią.',
      },
      {
        key: 'kd',
        text: 'Zamki z kodem do domków i pokoi, bez przekazywania kluczy gościom.',
      },
      {
        key: 'kam',
        text: 'Kamery na parking i wejścia, zamocowane pewnie na drewnianej elewacji.',
      },
      {
        key: 'ant',
        text: 'Anteny satelitarne na wietrznych dachach, z masztem przykręconym do konstrukcji.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy zakopianką przez Nowy Targ — Poronin jest ostatnią większą miejscowością przed Zakopanem. Wizyty w okolicy łączymy, żeby łatwiej znaleźć termin.',
    faq: [
      {
        question: 'Czy da się poprowadzić przewody w domu z bali w Poroninie bez szpecenia ścian?',
        answer:
          'Zwykle tak — przez podłogi, stropy, poddasze albo za listwami. Trasę ustalamy na wizji lokalnej, zanim cokolwiek wywiercimy.',
      },
      {
        question: 'Mam trzy domki na jednej działce w Poroninie — jedno Wi-Fi czy trzy?',
        answer:
          'Jedna sieć z punktem dostępowym w każdym domku. Goście łączą się z tą samą nazwą sieci, a Ty zarządzasz wszystkim z jednego miejsca.',
      },
      {
        question: 'Antena w Poroninie przekręca się po każdym halnym — co z tym zrobić?',
        answer:
          'Zwykle winny jest maszt albo uchwyt zamocowany do pokrycia. Przenosimy mocowanie na konstrukcję dachu i stosujemy krótszy, sztywniejszy maszt.',
      },
    ],
    nearby: ['zakopane', 'bukowina-tatrzanska', 'nowy-targ', 'bialka-tatrzanska'],
  },
  {
    slug: 'bukowina-tatrzanska',
    locative: 'w Bukowinie Tatrzańskiej',
    zone: 'podhale',
    summary: 'Wysoko położona wieś z termami i pensjonatami — śnieg, wiatr i ruch gości.',
    description:
      'Wi-Fi w pensjonatach, zamki z kodem, monitoring i anteny w Bukowinie Tatrzańskiej. Sprzęt na śnieg i wiatr, sieć na sezon. Wycena na piśmie.',
    lead: 'Bukowina Tatrzańska leży wysoko na grzbiecie z widokiem na Tatry. Dla właścicieli pensjonatów i apartamentów montujemy sieci, zamki z kodem i kamery, które muszą działać w środku zimy, przy pełnym obłożeniu.',
    traits: [
      {
        icon: 'snow',
        title: 'Śnieg i lód',
        text: 'Zaspy i nawisy z dachów zasłaniają kamery i niszczą uchwyty. Kamery montujemy pod okapem albo z daszkiem, z dala od miejsc, z których zsuwa się śnieg.',
      },
      {
        icon: 'users',
        title: 'Pełne obłożenie',
        text: 'W szczycie sezonu wszyscy goście korzystają z sieci naraz, często oglądając filmy po dniu na stoku. Wi-Fi planujemy pod taki wieczór, a nie pod pusty pensjonat.',
      },
      {
        icon: 'wind',
        title: 'Otwarty grzbiet',
        text: 'Na grzbiecie wiatr nie ma przeszkód. Maszty antenowe i kamery na wysięgnikach mocujemy sztywno i sprawdzamy po pierwszej zimie.',
      },
    ],
    services: [
      {
        key: 'wifi',
        text: 'Wi-Fi w pensjonacie z siecią gości, które utrzyma wieczorne obciążenie w sezonie.',
      },
      {
        key: 'kd',
        text: 'Zamki z kodem do pokoi i apartamentów — goście przyjeżdżają o różnych porach po stoku i termach.',
      },
      {
        key: 'kam',
        text: 'Kamery na parking i wejście, zamontowane tak, żeby nie zasypał ich śnieg.',
      },
      {
        key: 'scr',
        text: 'Ekran w recepcji z pogodą, warunkami na stokach i informacjami dla gości.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy przez Nowy Targ i Poronin, a potem w górę do Bukowiny. Wizję lokalną planujemy na konkretny dzień i często łączymy z obiektami w Białce.',
    faq: [
      {
        question:
          'Goście w moim pensjonacie w Bukowinie skarżą się na wolne Wi-Fi wieczorem — dlaczego?',
        answer:
          'Najczęściej jeden router nie obsługuje wszystkich naraz albo łącze jest za słabe na pełne obłożenie. Sprawdzamy jedno i drugie i proponujemy punkty dostępowe na korytarzach.',
      },
      {
        question: 'Czy kamera w Bukowinie Tatrzańskiej będzie widzieć coś po opadach śniegu?',
        answer:
          'Jeśli stoi pod okapem i ma daszek — tak. Unikamy miejsc, gdzie zsuwa się śnieg z dachu, a obudowy dobieramy do mrozu.',
      },
      {
        question: 'Czy ekran w recepcji w Bukowinie może sam pokazywać pogodę?',
        answer:
          'Tak. Ekran z odtwarzaczem pokazuje pogodę i Twoje komunikaty, a treść zmieniasz zdalnie, bez podchodzenia do recepcji.',
      },
    ],
    nearby: ['bialka-tatrzanska', 'poronin', 'zakopane', 'nowy-targ'],
  },
  {
    slug: 'bialka-tatrzanska',
    locative: 'w Białce Tatrzańskiej',
    zone: 'podhale',
    summary: 'Stacja narciarska, termy i apartamenty — zima w pełnym obłożeniu.',
    description:
      'Zamki z kodem do apartamentów, Wi-Fi, monitoring parkingów i ekrany w Białce Tatrzańskiej. Instalacje na sezon narciarski. Wycena na piśmie.',
    lead: 'Białka Tatrzańska zimą żyje narciarzami, a przez cały rok gośćmi term i apartamentów. Montujemy tu zamki z kodem, sieci i monitoring parkingów dla obiektów, w których goście zmieniają się co kilka dni.',
    traits: [
      {
        icon: 'apt',
        title: 'Apartamenty na wynajem',
        text: 'Wiele nowych budynków to apartamenty wynajmowane przez właścicieli spoza Podhala. Zdalne zarządzanie kodami i podgląd wejścia zastępują osobę z kluczami na miejscu.',
      },
      {
        icon: 'car',
        title: 'Parkingi w sezonie',
        text: 'Przy stokach i obiektach noclegowych parkingi są pełne, a goście pytają o swoje auta. Kamery z dobrym obrazem nocą obejmują wjazd i całą płytę.',
      },
      {
        icon: 'drop',
        title: 'Nad Białką',
        text: 'Wilgoć znad rzeki i mróz osadzają szron na obudowach. Dobieramy kamery z ogrzewaniem i uszczelnionymi złączami.',
      },
    ],
    services: [
      {
        key: 'kd',
        text: 'Zamki z kodem do apartamentów zarządzane zdalnie — dla właścicieli, którzy mieszkają daleko.',
      },
      {
        key: 'wifi',
        text: 'Wi-Fi w apartamentowcach i pensjonatach, z osobną siecią dla każdego lokalu albo gości.',
      },
      {
        key: 'kam',
        text: 'Monitoring parkingów i wejść, z obrazem czytelnym także w zimowy wieczór.',
      },
      {
        key: 'scr',
        text: 'Ekrany informacyjne w recepcjach i lokalach przy stoku.',
      },
      {
        key: 'ev',
        text: 'Ładowarki dla gości przyjeżdżających samochodem elektrycznym, na parkingu obiektu.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy przez Nowy Targ w stronę Białki. W sezonie narciarskim drogi bywają zatłoczone, więc termin wizji lokalnej ustalamy z wyprzedzeniem.',
    faq: [
      {
        question: 'Mieszkam daleko od Białki — czy zarządzę zamkami w apartamencie zdalnie?',
        answer:
          'Tak. Kody dla gości tworzysz w aplikacji, a historia otwarć pokazuje, kiedy ktoś wszedł. Na miejscu nie musi być nikogo z kluczami.',
      },
      {
        question: 'Czy ładowarka EV na parkingu pensjonatu w Białce się opłaca?',
        answer:
          'Coraz więcej gości o nią pyta. Najpierw sprawdzamy przyłącze, potem dobieramy moc ładowarki i jej miejsce na parkingu.',
      },
      {
        question: 'Kiedy najlepiej umówić montaż w Białce Tatrzańskiej?',
        answer:
          'Poza szczytem sezonu narciarskiego — wtedy łatwiej o dojazd i wolne pokoje do pracy. Wizję lokalną można zrobić wcześniej, żeby zdążyć przed zimą.',
      },
    ],
    nearby: ['bukowina-tatrzanska', 'nowy-targ', 'poronin', 'szczawnica'],
  },
  {
    slug: 'szczawnica',
    locative: 'w Szczawnicy',
    zone: 'podhale',
    summary: 'Uzdrowisko w Pieninach — pensjonaty, sanatoria i obiekty w wąskich dolinach.',
    description:
      'Wi-Fi w pensjonatach i sanatoriach, monitoring, nagłośnienie i anteny w Szczawnicy w Pieninach. Instalacje w wąskich dolinach. Wycena na piśmie.',
    lead: 'Szczawnica to uzdrowisko w Pieninach nad Dunajcem, z pensjonatami, sanatoriami i domami w wąskich dolinach potoków. Strome stoki zasłaniają sygnał, więc łączność planujemy tu szczególnie starannie.',
    traits: [
      {
        icon: 'lte',
        title: 'Wąskie doliny',
        text: 'Stoki Pienin i Beskidu Sądeckiego zasłaniają nadajniki. Zanim zaproponujemy alarm z powiadomieniem albo podgląd kamer, sprawdzamy, jaką łączność da się tu uzyskać.',
      },
      {
        icon: 'hotel',
        title: 'Sanatoria i kuracjusze',
        text: 'Goście uzdrowiska spędzają w obiekcie wiele dni. Wi-Fi w pokojach i spokojne nagłośnienie wspólnych sal są tu ważniejsze niż w hotelu na jedną noc.',
      },
      {
        icon: 'flood',
        title: 'Nad Dunajcem i Grajcarkiem',
        text: 'Część zabudowy stoi nisko nad wodą. Urządzenia sieciowe i rejestratory montujemy wysoko, z dala od piwnic.',
      },
    ],
    services: [
      {
        key: 'wifi',
        text: 'Wi-Fi w pensjonatach i sanatoriach, na wszystkich piętrach i w salach wspólnych.',
      },
      {
        key: 'snd',
        text: 'Nagłośnienie świetlic, stołówek i sal spotkań, z komunikatami dla gości.',
      },
      {
        key: 'kam',
        text: 'Monitoring wejść i parkingu, z podglądem dopasowanym do łącza w dolinie.',
      },
      {
        key: 'ant',
        text: 'Anteny satelitarne tam, gdzie w dolinie nie dochodzi telewizja naziemna.',
      },
    ],
    route:
      'Z Rabki-Zdroju jedziemy przez Nowy Targ i Krościenko nad Dunajcem. To dłuższa trasa w naszej strefie, więc wizytę umawiamy na konkretny dzień i od razu oglądamy cały obiekt.',
    faq: [
      {
        question: 'Czy w Szczawnicy w dolinie będzie działać podgląd kamer w telefonie?',
        answer:
          'Najpierw sprawdzamy łącze: kablowe, radiowe albo komórkowe. Kamery nagrywają na miejscu zawsze, a podgląd ustawiamy tak, żeby działał na tym, co jest dostępne.',
      },
      {
        question: 'Prowadzimy dom wczasowy w Szczawnicy — jak nagłośnić stołówkę i salę?',
        answer:
          'Osobne strefy z niezależną głośnością i mikrofon do ogłoszeń. Dźwięk ustawiamy tak, żeby był zrozumiały, a nie głośny.',
      },
      {
        question: 'Telewizja naziemna nie dochodzi do mojego pensjonatu w Szczawnicy — co dalej?',
        answer:
          'W głębokich dolinach zwykle proponujemy antenę satelitarną i rozprowadzenie sygnału do pokoi. Na miejscu mierzymy, co da się odebrać.',
      },
    ],
    nearby: ['nowy-targ', 'bialka-tatrzanska', 'limanowa', 'mszana-dolna'],
  },
]

/** The text of one town page, or null (an unknown slug is a 404). */
export const townText = (slug: string): TownText | null =>
  TOWNS.find((town) => town.slug === slug) ?? null

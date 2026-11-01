import type { PageBlock } from './page'

export const GOPOS_SLUG = 'gopos'

/** Ids of records the seed made earlier: images by file, brands by name, products by short id. */
export type GoposRefs = {
  image: (file: string) => number | undefined
  brand: (name: string) => number | undefined
  /** By the short id of the seed package (`d3`, `gopos`, `pol`). */
  product: (shortId: string) => number | undefined
}

const NO_REFS: GoposRefs = {
  image: () => undefined,
  brand: () => undefined,
  product: () => undefined,
}

/** The three kits of the board (decyzja 24.10: kity z planszy, nie ze spec. §6.5). */
export const GOPOS_KITS = [
  {
    name: 'Kawiarnia, food truck',
    description: 'Jedno stanowisko, szybka obsługa przy ladzie.',
    images: ['p-posnet-vero.webp', 'p-sunmi-drukarka-bonow.webp', 'p-terminal-polcard.webp'],
    products: ['vero', 'druks', 'pol', 'gopos'],
  },
  {
    name: 'Restauracja',
    tag: 'Polecany na start',
    description: 'Sala, kuchnia, kelnerzy i dowozy — pełny obieg.',
    images: ['p-sunmi-d3-pro.webp', 'p-sunmi-kds.webp', 'p-sunmi-v3-mix.webp'],
    products: ['d3', 'hx', 'kds', 'v3mix', 'pol', 'u7', 'gopos'],
  },
  {
    name: 'Fast food, samoobsługa',
    description: 'Kiosk, ekran kuchenny i numerki odbioru.',
    images: ['p-sunmi-kiosk.webp', 'p-sunmi-kds.webp', 'p-sunmi-d3-pro.webp'],
    products: ['kiosk', 'kds', 'd3', 'hx', 'pol', 'gopos'],
  },
] as const

/**
 * `/gopos` of the Biznes line (spec. §6.5, plansza Gopos) — texts of the board 1:1, except the
 * partner's figures without a source (plan §4, decyzja 24.10): no stats in the hero, no „6000+”
 * and „od 2016” badges, no „14 dni” and „5 platform” — `TODO(krystian)` [SZEF] below.
 */
export function biznesGoposLayout(refs: GoposRefs = NO_REFS): PageBlock[] {
  const ids = (list: readonly (number | undefined)[]) =>
    list.filter((id): id is number => id !== undefined)
  return [
    {
      blockType: 'bzPageHero',
      heading: 'GoPOS w Twoim lokalu.',
      headingAccent: 'Wdrożony, przeszkolony, serwisowany z Rabki.',
      lead: 'System dla gastronomii — sala, kuchnia, dowozy i KSeF w jednym. Dobieramy sprzęt, konfigurujemy menu, fiskalizujemy i uczymy zespół na miejscu. A w sezonie jesteśmy pod telefonem.',
      primary: { label: 'Umów prezentację w lokalu', href: '/gopos#kontakt' },
      secondary: { label: 'Zobacz zestawy', href: '/gopos#zestawy' },
      parent: { label: 'Oferta', href: '/oferta' },
      variant: 'photo',
      photo: {
        image: refs.image('foto-gopos-lokal.webp') ?? null,
        // Badge „Autoryzowany partner GoPOS” = status in Partners ([SZEF]); `none` hides it.
        partner: refs.brand('GoPOS') ?? null,
        // TODO(krystian): [SZEF] liczby z planszy (6000+ lokali, 14 dni próby, 5 platform dostaw,
        // „1 telefon”) — tylko ze źródłem GoPOS (plan §4); bez niego pas liczb jest ukryty.
        stats: [],
      },
    },
    {
      blockType: 'bzCards',
      eyebrow: 'Dlaczego GoPOS przez PRO-KOM',
      heading: 'Program to połowa sukcesu. Druga połowa to wdrożenie.',
      lead: 'GoPOS możesz kupić sam. Z nami dostajesz go razem ze sprzętem, fiskalizacją, siecią i ludźmi, którzy przyjadą, gdy trzeba.',
      surface: 'default',
      columns: '4',
      tone: 'green',
      cards: [
        {
          title: 'Jeden telefon do wszystkiego',
          icon: 'phone',
          text: 'Sprzęt, drukarka fiskalna, terminal, Wi-Fi i program. Nie szukasz winnego między pięcioma firmami.',
        },
        {
          title: 'Gotowe przed dostawą',
          icon: 'rocket',
          text: 'Menu, stoliki, drukarki bonów i konta kelnerów ustawiamy u siebie. W lokalu tylko montaż.',
        },
        {
          title: 'Szkolenie w Twoim lokalu',
          icon: 'users',
          text: 'Kelnerzy, kuchnia i właściciel uczą się na Waszym menu, nie na przykładach z instrukcji.',
        },
        {
          title: 'Serwis w sezonie',
          icon: 'wrench',
          text: 'Pomoc zdalna od ręki, a serwisant z Rabki dojeżdża na całe Podhale. Także w ferie.',
        },
      ],
    },
    {
      blockType: 'bzModules',
      eyebrow: 'Moduły GoPOS',
      heading: 'Wybierz, czego potrzebuje Twój lokal.',
      // TODO(krystian): moduły CRM, Room Service, Menu Board i Multilokalizacja (ZMIANY-katalog-v2:
      // bez kart produktów, opis na /gopos) — brak tekstów; do dopisania w panelu (limit 12).
      modules: [
        {
          name: 'Stanowisko POS',
          subtitle: 'sala, bar, wynos',
          icon: 'monitor',
          description:
            'Sprzedaż na dotykowym ekranie: stoliki, rachunki, dzielenie rachunku, rabaty i zamknięcie dnia — prosto, bez długiego szkolenia.',
          points: [
            { text: 'Plan sali i stolików' },
            { text: 'Dzielenie rachunku' },
            { text: 'Raporty w telefonie właściciela' },
          ],
          image: refs.image('p-gopos-ekran.webp') ?? null,
        },
        {
          name: 'Mobilny kelner',
          subtitle: 'zamówienie przy stoliku',
          icon: 'phone',
          description:
            'Kelner przyjmuje zamówienie na terminalu Sunmi i od razu wysyła je na kuchnię i bar. Mniej chodzenia, mniej pomyłek.',
          points: [
            { text: 'Zamówienie trafia od razu na kuchnię' },
            { text: 'Płatność przy stoliku' },
            { text: 'Drukarka w ręku (V3 MIX)' },
          ],
          image: refs.image('p-sunmi-v3-mix.webp') ?? null,
        },
        {
          name: 'Ekran kuchenny GoKDS',
          subtitle: 'kuchnia bez karteczek',
          icon: 'monitor',
          description:
            'Kuchnia widzi zamówienia na ekranie w kolejności, z czasem przygotowania. Koniec z gubionymi bonami w szczycie.',
          points: [
            { text: 'Kolejka zamówień z czasem' },
            { text: 'Ekran IP55, działa mokrymi dłońmi' },
            { text: 'Sala, wynos i dowozy w jednej kolejce' },
          ],
          image: refs.image('p-sunmi-kds.webp') ?? null,
        },
        {
          name: 'Kiosk GoKiosk',
          subtitle: 'samoobsługa',
          icon: 'store',
          description:
            'Gość sam zamawia i płaci przy kiosku — mniejsza kolejka przy ladzie w szczycie sezonu.',
          points: [
            { text: 'Zamówienie i płatność bez kasjera' },
            { text: 'Numerki odbioru' },
            { text: 'Ekran 24" Sunmi K2' },
          ],
          image: refs.image('p-sunmi-kiosk.webp') ?? null,
        },
        {
          name: 'Dowozy GoHub',
          // TODO(krystian): [SZEF] lista platform dostaw — potwierdzić u GoPOS.
          subtitle: 'Uber Eats, Glovo, Wolt, Pyszne, Bolt',
          icon: 'bolt',
          description:
            'Zamówienia z platform dostaw wpadają do tej samej kolejki co zamówienia z sali — bez przepisywania z kilku tabletów.',
          points: [
            // TODO(krystian): [SZEF] plansza: „5 platform w jednym miejscu” — liczba bez źródła.
            { text: 'Platformy dostaw w jednym miejscu' },
            { text: 'Jedna kolejka na kuchni' },
            { text: 'Własne zamówienia online (GoOrder) bez prowizji platform' },
          ],
          image: refs.image('p-gopos-ekosystem.webp') ?? null,
        },
        {
          name: 'E-Menu QR',
          subtitle: 'menu w telefonie gościa',
          icon: 'phone',
          description:
            'Menu w telefonie gościa po zeskanowaniu kodu QR na stoliku. Zmieniasz ceny i dania raz — wszędzie.',
          points: [
            { text: 'Kod QR na stoliku' },
            { text: 'Menu zawsze aktualne' },
            { text: 'Zmiana dań i cen w jednym miejscu' },
          ],
          image: refs.image('p-gopos-zestaw.webp') ?? null,
        },
        {
          name: 'Magazyn GoStock',
          subtitle: 'stany i dostawy',
          icon: 'server',
          description:
            'Stany magazynowe, dostawy i inwentaryzacja w tym samym systemie co sprzedaż.',
          points: [
            { text: 'Stany na bieżąco' },
            { text: 'Dostawy i inwentaryzacja' },
            { text: 'Raporty dla właściciela' },
          ],
          image: refs.image('p-sunmi-d3-pro.webp') ?? null,
        },
        {
          name: 'KSeF i praca offline',
          subtitle: 'faktury i brak internetu',
          icon: 'doc',
          description:
            'Faktury do KSeF wystawiasz z POS. Gdy padnie internet, GoPOS pracuje dalej, a drukarka fiskalna drukuje paragony.',
          points: [
            { text: 'Faktury do KSeF z POS' },
            { text: 'Praca offline' },
            { text: 'Drukarka fiskalna Posnet' },
          ],
          image: refs.image('p-posnet-thermal-hx.webp') ?? null,
        },
      ],
    },
    {
      blockType: 'bzOrderFlow',
      eyebrow: 'Jedno zamówienie w GoPOS',
      heading: 'Restauracja, która nie gubi zamówień. Nawet w sezonie.',
      lead: 'GoPOS na sprzęcie Sunmi, z drukarką fiskalną Posnet i terminalem PolCard. Wgrywamy Twoje menu, szkolimy zespół na miejscu i zostajemy na serwis — w Rabce, Zakopanem i na całym Podhalu.',
      // TODO(krystian): [SZEF] plansza ma też „6000+ lokali w Polsce” i „od 2016 na rynku” —
      // tylko ze źródłem GoPOS (plan §4).
      badges: [{ text: 'dowozy Wolt, Glovo, Pyszne' }],
      image: refs.image('p-gopos-zestaw.webp') ?? null,
      ticket: 'Stolik 4 · 2× pierogi',
      steps: [
        {
          label: '1 · Sala',
          title: 'Zamówienie przy stoliku',
          text: 'Kelner przyjmuje zamówienie na terminalu Sunmi.',
          image: refs.image('p-sunmi-v3-mix.webp') ?? null,
        },
        {
          label: '2 · Kuchnia',
          title: 'Od razu na ekranie',
          text: 'Danie pojawia się na ekranie kuchni — bez karteczek.',
          image: refs.image('p-sunmi-kds.webp') ?? null,
        },
        {
          label: '3 · Płatność',
          title: 'Karta albo BLIK',
          text: 'Rachunek zamykasz przy stoliku, także dzielony.',
          image: refs.image('p-terminal-polcard.webp') ?? null,
        },
        {
          label: '4 · Raport',
          title: 'Sprzedaż w telefonie',
          text: 'Właściciel widzi utarg i food cost na bieżąco.',
          image: refs.image('p-gopos-zestaw.webp') ?? null,
        },
      ],
      note: 'Tak wygląda jedno zamówienie w Twoim lokalu — od sali do raportu.',
      primary: { label: 'Zobacz zestawy', href: '/gopos#zestawy' },
      secondary: { label: 'Branża: gastronomia', href: '/branze/gastronomia' },
    },
    {
      blockType: 'bzKits',
      eyebrow: 'Zestawy GoPOS',
      heading: 'Trzy typowe lokale. Dobierzemy pod Twój.',
      lead: 'Każdy zestaw to punkt wyjścia. Liczbę stanowisk, drukarek i terminali dopasujemy do sali, kuchni i sezonu.',
      kits: GOPOS_KITS.map((kit) => ({
        name: kit.name,
        tag: 'tag' in kit ? kit.tag : null,
        description: kit.description,
        images: ids(kit.images.map(refs.image)),
        products: ids(kit.products.map(refs.product)),
      })),
    },
    {
      blockType: 'bzTimeline',
      eyebrow: 'Jak wdrażamy',
      heading: 'Od prezentacji do pierwszego sezonu.',
      steps: [
        {
          title: 'Prezentacja u Ciebie',
          text: 'Pokazujemy GoPOS na sprzęcie w Twoim lokalu — z Twoim menu na ekranie.',
        },
        {
          title: 'Konfiguracja u nas',
          text: 'Menu, stoliki, drukarki bonów, kelnerzy — ustawiamy przed dostawą.',
        },
        {
          title: 'Montaż i fiskalizacja',
          text: 'Sprzęt, drukarka fiskalna, terminal i Wi-Fi. Termin tak, żeby lokal działał.',
        },
        {
          title: 'Szkolenie zespołu',
          text: 'Kelnerzy, kuchnia i właściciel — na miejscu, na Waszym menu.',
        },
        {
          title: 'Wsparcie w sezonie',
          text: 'Pomoc zdalna od ręki, serwisant z Rabki na całe Podhale.',
        },
      ],
    },
    {
      blockType: 'bzPanels',
      panels: [
        {
          eyebrow: 'Masz już inny system?',
          title: 'Przejście bez zamykania lokalu.',
          style: 'dark',
          text: 'Przygotowujemy GoPOS równolegle: menu, stoliki, drukarki bonów. Stary system wyłączamy dopiero wtedy, gdy nowy działa — najlepiej poza sezonem, ale zdążymy też przed nim.',
          primary: { label: 'Zapytaj o przejście', href: '/gopos#kontakt' },
        },
        {
          eyebrow: 'Hotel z restauracją',
          title: 'GoPOS + NFHotel',
          style: 'light',
          text: 'GoPOS i NFHotel mają integrację. Wdrażamy oba systemy — recepcję i restaurację — z jednym zespołem i jednym telefonem do serwisu.',
          primary: { label: 'Branża: gastronomia', href: '/branze/gastronomia' },
          secondary: { label: 'NFHotel w katalogu', href: '/produkt/nfhotel' },
        },
      ],
    },
    {
      blockType: 'faq',
      eyebrow: 'Pytania właścicieli lokali',
      heading: 'Zanim zdecydujesz',
      lead: 'Lokale z Rabki, Zakopanego, Nowego Targu i Białki pytają najczęściej o to samo.',
      items: [
        {
          question: 'GoPOS to zakup czy abonament?',
          // TODO(krystian): [SZEF] plansza dodaje „Na start GoPOS daje 14 dni bezpłatnie.” —
          // liczba bez źródła GoPOS (plan §4).
          answer:
            'GoPOS działa w abonamencie miesięcznym (umowa z GoPOS), a sprzęt — stanowiska Sunmi, drukarkę fiskalną, terminal — kupujesz u nas.',
        },
        {
          question: 'Co, jeśli padnie internet w szczycie?',
          answer:
            'GoPOS pracuje offline, drukarka fiskalna drukuje paragony, a terminal może łączyć się przez sieć komórkową.',
        },
        {
          question: 'Mam już kasę Posnet. Czy zadziała z GoPOS?',
          answer:
            'GoPOS współpracuje z drukarkami fiskalnymi (np. Posnet Thermal HX, Posnet Vero). Kasę z klawiaturą zwykle zastępujemy drukarką — sprawdzimy model i powiemy wprost.',
        },
        {
          question: 'Czy obsłużycie lokal w Zakopanem albo Białce w sezonie?',
          answer:
            'Tak. Najpierw pomagamy zdalnie, a gdy trzeba — przyjeżdża serwisant z Rabki. Zakres pomocy w sezonie i sprzęt zastępczy możemy zapisać w umowie opieki.',
        },
        {
          question: 'Mam hotel z restauracją. Czy GoPOS połączy się z recepcją?',
          answer:
            'GoPOS ma integrację z NFHotel — restauracja i recepcja pracują razem. Wdrażamy i serwisujemy oba systemy.',
        },
        {
          question: 'Jak wygląda faktura do KSeF z restauracji?',
          // TODO(krystian): [SZEF] plansza: „Od 1.01.2027 faktury dla firm idą przez KSeF.” — data
          // nieścisła (ZMIANY-v20 §5); zdanie bez daty do czasu potwierdzenia.
          answer:
            'Faktury dla firm idą przez KSeF. W GoPOS wystawisz je prosto z POS — konfigurujemy to przy wdrożeniu, razem z certyfikatem i uprawnieniami dla księgowej.',
        },
      ],
    },
    {
      blockType: 'bzContact',
      heading: 'Umówmy prezentację GoPOS w Twoim lokalu.',
      lead: 'Przyjedziemy z zestawem i Twoim menu na ekranie. Powiedz, ile masz miejsc, czy są dowozy i ogródek — przygotujemy propozycję na piśmie. Oddzwaniamy w ciągu 60 minut w godzinach pracy.',
      formHeading: 'Formularz zapytania',
      formNote: 'Pola z gwiazdką są wymagane. Resztę dopiszemy razem przez telefon.',
      // TODO(krystian): [SZEF] obietnica „60 min” — ta sama co w Ustawieniach strony (spec. §13).
      promises: [
        { text: 'Odpowiedź w 60 min' },
        { text: 'Wycena na piśmie' },
        { text: 'Bez spamu i newslettera' },
      ],
      successText:
        'Oddzwonimy w ciągu 60 minut w godzinach pracy. Poza godzinami pracy odezwiemy się następnego dnia roboczego rano.',
    },
  ]
}

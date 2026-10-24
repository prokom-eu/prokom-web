import type { Page } from '../../payload-types'

/**
 * Start content of B7d: „Dla kogo pracujemy”, „PRO-KOM w faktach”, „Ostatnio w Aktualnościach”,
 * FAQ and the contact section. Texts 1:1 from `docs/design/prokombiznes/boards/Main.dc.html`
 * (`.dk`, `.own`/`.fk26`, `.nw26`, `.fq26`, `.cf26`). Local only, like the rest of
 * `pnpm seed:biznes`.
 */

type HomeBlock = NonNullable<Page['layout']>[number]

export function factsBlocks(brand: (name: string) => number | undefined): HomeBlock[] {
  return [
    {
      blockType: 'bzReferences',
      eyebrow: 'Dla kogo pracujemy',
      heading: 'Ponad 100 firm i instytucji z Podhala i Małopolski.',
      lead: 'Od jednej kasy w kwiaciarni po serwer i sieć w pensjonacie na 60 pokoi. Sześć rodzajów firm, które obsługujemy najczęściej.',
      kinds: [
        {
          title: 'Sklepy i handel',
          icon: 'store',
          examples: 'spożywcze, odzieżowe, budowlane, apteki',
          solutions: 'kasy, Subiekt, PC-Market, skanery, wagi',
        },
        {
          title: 'Gastronomia',
          icon: 'bell',
          examples: 'restauracje, kawiarnie, bary, food trucki',
          solutions: 'GoPOS, Sunmi, drukarki fiskalne, terminale',
        },
        {
          title: 'Hotele i pensjonaty',
          icon: 'cal',
          examples: 'Rabka, Zakopane, Białka, Szczawnica',
          solutions: 'NFHotel, Wi-Fi dla gości, recepcja',
        },
        {
          title: 'Biura i usługi',
          icon: 'doc',
          examples: 'kancelarie, biura rachunkowe, warsztaty, salony',
          solutions: 'komputery, Microsoft 365, kopie, opieka IT',
        },
        {
          title: 'Szkoły i instytucje',
          icon: 'grad',
          examples: 'szkoły, gminy, ośrodki kultury, parafie',
          solutions: 'monitory interaktywne, pracownie, dofinansowania',
        },
        {
          title: 'Zdrowie i uzdrowiska',
          icon: 'shield',
          examples: 'gabinety, przychodnie, sanatoria',
          solutions: 'serwery, bezpieczeństwo danych, podpis, UPS',
        },
      ],
      // Only the real, public review of the board; its two "Miejsce na opinię…" placeholders
      // must never be published. Shown after „Pokaż opinie klientów” in the site settings.
      // TODO(krystian): [SZEF] wybór opinii i zgody (spec. §13).
      reviews: [
        {
          quote:
            'Bardzo polecam tę firmę. Szybka, bardzo życzliwa, a przede wszystkim profesjonalna obsługa.',
          author: 'E. Smołecka',
          source: 'opinia w serwisie Panorama Firm · 12.05.2023',
        },
      ],
      note: 'Zdjęcia z wdrożeń i nazwy klientów dodamy po uzyskaniu zgód. Logotypy klientów pojawią się w tym miejscu.',
    },
    {
      blockType: 'bzFacts',
      eyebrow: 'PRO-KOM w faktach',
      heading: 'Lokalna firma, która jest tu od lat — i będzie dalej.',
      // TODO(krystian): [SZEF] treść cytatu, podpis (SVG) i decyzja: zdjęcie czy ikona.
      owner: {
        label: 'Słowo od właściciela',
        quote:
          'Prowadzę PRO-KOM w Rabce od 2004 roku. Nie chodzi nam o to, żeby sprzedać jak najwięcej, tylko żeby u klienta po prostu działało. Dlatego zostajemy z firmami na lata — a telefon odbiera ktoś, kto zna Twoją firmę.',
        highlight: 'u klienta po prostu działało',
        name: 'Tadeusz Wójciak',
        role: 'właściciel PRO-KOM · Rabka-Zdrój',
        year: '2004',
        yearText: 'od tego roku PRO-KOM działa w Rabce-Zdroju',
        photoPlaceholder: false,
      },
      stats: [
        { value: '100+', label: 'firm pod stałą opieką' },
        { value: '4', label: 'autoryzacje i partnerstwa' },
      ],
      authorizationsLabel: 'Autoryzowany serwis i partner',
      authorizations: ['Posnet', 'Elzab', 'InsERT', 'GoPOS'].flatMap((name) => brand(name) ?? []),
      areaText: 'Dojeżdżamy do firm na całym Podhalu i w Małopolsce.',
      contactLink: { label: 'Kontakt i dojazd', href: '/kontakt' },
    },
    {
      blockType: 'bzNews',
      heading: 'Ostatnio w Aktualnościach',
      allLabel: 'Wszystkie aktualności',
      readLabel: 'Czytaj',
    },
    {
      blockType: 'faq',
      eyebrow: 'Pytania i odpowiedzi',
      heading: 'Zanim zadzwonisz',
      lead: 'Najczęstsze pytania od firm z Podhala. Nie ma tu Twojego pytania? Zadzwoń albo napisz, odpowiemy od ręki.',
      items: [
        {
          question: 'Czy obsługujecie firmy spoza Rabki?',
          answer:
            'Tak. Dojeżdżamy na całe Podhale i Małopolskę: Nowy Targ, Zakopane, Jordanów, Mszana Dolna, Limanowa, Myślenice, Nowy Sącz i Kraków.',
        },
        {
          question: 'Ile kosztuje opieka informatyczna?',
          answer:
            'Zależy od liczby stanowisk, serwera i zakresu. Zaczynamy od bezpłatnego przeglądu IT, a potem dostajesz ofertę na piśmie ze stałą miesięczną opłatą — bez niespodzianek na fakturze.',
        },
        {
          // TODO(krystian): [SZEF] daty KSeF do sprawdzenia przed publikacją (ZMIANY-v20 §5).
          question: 'Czy pomożecie przygotować firmę do KSeF?',
          answer:
            'Tak. Sprawdzimy program do faktur, nadamy uprawnienia księgowej, przygotujemy certyfikat i procedurę awaryjną — przed obowiązkowym terminem 1 stycznia 2027 r. dla najmniejszych firm.',
        },
        {
          // TODO(krystian): numer i godziny wpisane w tekst odpowiedzi (tu i w pytaniach 05–06) —
          // po zmianie w Ustawieniach strony / Danych firmy poprawić też tutaj.
          question: 'Co, gdy coś przestanie działać?',
          answer:
            'Dzwonisz na 889 003 889 w godzinach pracy (pn–pt 9–17). Ustalamy przyczynę i naprawiamy, a gdy trzeba, przyjeżdża serwisant z Rabki. Klienci z umową opieki mają czas reakcji zapisany w umowie.',
        },
        {
          // TODO(krystian): formularz „Zmień serwis kasy” nie istnieje (v20 usunęło szybkie sprawy).
          question: 'Czy przejmujecie serwis kasy od innej firmy?',
          answer:
            'Tak. Wystarczy telefon na 889 003 889 albo formularz „Zmień serwis kasy”. Formalności i termin najbliższego przeglądu bierzemy na siebie — jesteśmy autoryzowanym serwisem Posnet i Elzab.',
        },
        {
          question: 'Jestem księgową / prowadzę biuro rachunkowe — jak możemy współpracować?',
          answer:
            'Pomagamy Twoim klientom przejść na KSeF: program do faktur, certyfikat i uprawnienia dla biura. Zadzwoń na 889 003 889 — ustalimy, jak najprościej przekazywać nam sprawy klientów.',
        },
      ],
    },
    {
      blockType: 'bzContact',
      heading: 'Napisz, czego potrzebujesz. Odezwiemy się szybko.',
      lead: 'Jedna wiadomość wystarczy. Oddzwonimy w ciągu 60 minut w godzinach pracy, a wycenę przygotujemy na piśmie.',
      formHeading: 'Formularz zapytania',
      // TODO(krystian): B8 — dopisek z planszy („Pola z gwiazdką są wymagane. Resztę dopiszemy
      // razem przez telefon.”) wraca z formularzem v20; formularz S8b oznacza pola opcjonalne.
      // TODO(krystian): [SZEF] obietnica „60 min” — ta sama co w Ustawieniach strony (spec. §13).
      promises: [
        { text: 'Odpowiedź w 60 min' },
        { text: 'Wycena na piśmie' },
        { text: 'Bez zobowiązań' },
      ],
    },
  ]
}

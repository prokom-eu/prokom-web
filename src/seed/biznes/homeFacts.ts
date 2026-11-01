import type { Page } from '../../payload-types'
import { BIZNES_CONTACT } from './contact'

/**
 * Start content of the lower home page, v150 (K4c, board `Strona.dc.html` start: `#s4-opinie`,
 * `#s4-fakty`, `#s4-faq`, `#s4-kontakt`): „Opinie”, „Słowo od właściciela”, FAQ and the contact
 * section. „Ostatnio w Aktualnościach” is gone (K4-FINAL §2). Local only, like the rest of
 * `pnpm seed:biznes`.
 */

type HomeBlock = NonNullable<Page['layout']>[number]

export function factsBlocks(brand: (name: string) => number | undefined): HomeBlock[] {
  return [
    {
      blockType: 'bzReferences',
      eyebrow: 'Opinie',
      heading: 'Co mówią klienci.',
      lead: 'Publikujemy opinie w oryginalnym brzmieniu — z podpisem i źródłem.',
      // Only the real, public review of the board; the section shows after „Pokaż opinie
      // klientów” in the site settings, placeholders never in production (ADR-017 D-K4-6).
      // TODO(krystian): [SZEF] wybór opinii i zgody (spec. §13).
      reviews: [
        {
          quote:
            'Bardzo polecam tę firmę. Szybka, bardzo życzliwa, a przede wszystkim profesjonalna obsługa.',
          author: 'E. Smołecka',
          source: 'opinia w serwisie Panorama Firm · 12.05.2023',
        },
      ],
    },
    {
      blockType: 'bzFacts',
      // For screen readers only (the board shows the label above the quote).
      heading: 'O firmie — słowo od właściciela',
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
      // K4-FINAL §1: „100+ klientów firmowych”; statuses: 2 serwisy (Posnet, Elzab),
      // 2 partnerstwa (GoPOS, InsERT).
      stats: [
        { value: '2004', label: 'rok założenia' },
        { value: '100+', label: 'klientów firmowych' },
        { value: '2', label: 'autoryzowane serwisy kas' },
        { value: '2', label: 'autoryzowane partnerstwa' },
      ],
      authorizations: ['Posnet', 'Elzab', 'GoPOS', 'InsERT'].flatMap((name) => brand(name) ?? []),
      contactLink: { label: 'Poznaj PRO-KOM i pozostałe linie firmy', href: '/o-firmie' },
    },
    {
      blockType: 'faq',
      eyebrow: 'Pytania i odpowiedzi',
      heading: 'Zanim zadzwonisz.',
      lead: 'Najczęstsze pytania od firm z Podhala. Nie ma tu Twojego? Zadzwoń albo napisz — odpowiemy od ręki.',
      // Board `FAQ4` (v150).
      items: [
        {
          question: 'Czy obsługujecie firmy spoza Rabki?',
          answer:
            'Tak. Dojeżdżamy na całe Podhale i Małopolskę: Nowy Targ, Zakopane, Jordanów, Mszana Dolna, Limanowa, Myślenice, Nowy Sącz i Kraków.',
        },
        {
          // K4-FINAL §1: no pricing model of the IT care.
          question: 'Ile kosztuje opieka informatyczna?',
          answer:
            'Zależy od liczby stanowisk, serwera i zakresu. Zaczynamy od bezpłatnego przeglądu IT, a potem dostajesz wycenę na piśmie.',
        },
        {
          // TODO(krystian): [SZEF] daty KSeF do sprawdzenia przed publikacją (ZMIANY-v20 §5).
          question: 'Czy pomożecie przygotować firmę do KSeF?',
          answer:
            'Tak. Sprawdzimy program do faktur, nadamy uprawnienia księgowej, przygotujemy certyfikat i procedurę awaryjną — przed obowiązkowym terminem 1 stycznia 2027 r. dla najmniejszych firm.',
        },
        {
          // The number comes from `contact.ts`; the hours in the sentence follow BIZNES_COMPANY.
          question: 'Co, gdy coś przestanie działać?',
          answer: `Dzwonisz na ${BIZNES_CONTACT.phone} w godzinach pracy (pn–pt 9–17). Ustalamy przyczynę i naprawiamy, a gdy trzeba, przyjeżdża serwisant z Rabki. Klienci z umową opieki mają czas reakcji zapisany w umowie.`,
        },
        {
          question: 'Czy przejmujecie serwis kasy od innej firmy?',
          answer: `Tak. Wystarczy telefon na ${BIZNES_CONTACT.phone}. Formalności i termin najbliższego przeglądu bierzemy na siebie — jesteśmy autoryzowanym serwisem Posnet i Elzab.`,
        },
        {
          question: 'Prowadzę biuro rachunkowe — jak możemy współpracować?',
          answer: `Pomagamy Twoim klientom przejść na KSeF: program do faktur, certyfikat i uprawnienia dla biura. Zadzwoń na ${BIZNES_CONTACT.phone} — ustalimy, jak najprościej przekazywać nam sprawy klientów.`,
        },
      ],
    },
    {
      blockType: 'bzContact',
      heading: 'Napisz, czego potrzebujesz. Odezwiemy się szybko.',
      lead: 'Jedna wiadomość wystarczy. Oddzwonimy w ciągu 60 minut w godzinach pracy, a wycenę przygotujemy na piśmie.',
      formHeading: 'Formularz zapytania',
      formNote: 'Pola z gwiazdką są wymagane. Resztę dopiszemy razem przez telefon.',
      // TODO(krystian): [SZEF] obietnica „60 min” — ta sama co w Ustawieniach strony (spec. §13).
      promises: [
        { text: 'Odpowiedź w 60 min' },
        { text: 'Wycena na piśmie' },
        { text: 'Bez zobowiązań' },
      ],
      successText:
        'Oddzwonimy w ciągu 60 minut w godzinach pracy. Poza godzinami pracy odezwiemy się następnego dnia roboczego rano.',
    },
  ]
}

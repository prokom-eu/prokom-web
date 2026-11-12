import type { Page } from '../../payload-types'
import { BIZNES_CONTACT } from './contact'

/**
 * Start content of the lower home page, v150 (K4c, board `Strona.dc.html` start: `#s4-opinie`,
 * `#s4-fakty`, `#s4-faq`, `#s4-kontakt`): „Opinie”, „Słowo od właściciela”, FAQ and the contact
 * section. „Ostatnio w Aktualnościach” is gone (K4-FINAL §2). Local only, like the rest of
 * `pnpm seed:biznes`.
 */

type HomeBlock = NonNullable<Page['layout']>[number]

/** FAQ lead before B3-1 (with „60 minut”) and after it (prototype 0611 `#faq`). */
export const FAQ_LEAD_OLD =
  'Najczęstsze pytania od firm z Podhala. Nie ma tu Twojego? Zadzwoń albo napisz. Oddzwonimy w ciągu 60 minut w godzinach pracy.'
export const FAQ_LEAD_BIZ2 =
  'Najczęstsze pytania od firm z Podhala. Nie ma tu Twojego? Zadzwoń albo napisz.'

export function factsBlocks(brand: (name: string) => number | undefined): HomeBlock[] {
  return [
    {
      blockType: 'bzReferences',
      eyebrow: 'Opinie',
      heading: 'Co mówią klienci',
      lead: 'Publikujemy opinie w oryginalnym brzmieniu, z podpisem i źródłem.',
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
      // POPRAWKI-0311 §C: the visible H2 of „O firmie” while the owner's word is hidden (with
      // the quote the section is named by the owner's label).
      heading: 'Od 2004 roku przy kasach i komputerach firm z Podhala',
      headingAccent: 'przy kasach i komputerach firm',
      lead: 'Sprzedajemy, wdrażamy i serwisujemy w Rabce-Zdroju. Uprawnienia producentów widzisz obok — to one pozwalają nam serwisować kasy i wdrażać programy.',
      // TODO(krystian): cytat do akceptacji szefa (napisany przez nas). Na stronie dopiero po
      // „Pokaż słowo od właściciela” w Ustawieniach strony. [SZEF] też podpis (SVG) i zdjęcie.
      owner: {
        label: 'Słowo od właściciela',
        quote:
          'Prowadzę PRO-KOM w Rabce od 2004 roku. Nie chodzi nam o to, żeby sprzedać jak najwięcej, tylko żeby u klienta po prostu działało. Dlatego zostajemy z firmami na lata, a telefon odbiera ktoś, kto zna Twoją firmę.',
        highlight: 'u klienta po prostu działało',
        name: 'Tadeusz Wójciak',
        role: 'właściciel PRO-KOM · Rabka-Zdrój',
        year: '2004',
        yearText: 'od tego roku PRO-KOM działa w Rabce-Zdroju',
        photoPlaceholder: false,
      },
      // K4-FINAL §1: „100+ klientów firmowych”. POPRAWKI-0311 §C: two numbers — the
      // authorizations say the rest with their status (Posnet, Elzab, InsERT, GoPOS).
      stats: [
        { value: '2004', label: 'rok założenia firmy' },
        { value: '100+', label: 'klientów firmowych' },
      ],
      authorizations: ['Posnet', 'Elzab', 'InsERT', 'GoPOS'].flatMap((name) => brand(name) ?? []),
      contactLink: { label: 'Poznaj PRO-KOM i pozostałe linie firmy', href: '/o-firmie' },
    },
    {
      blockType: 'faq',
      eyebrow: 'Pytania i odpowiedzi',
      heading: 'Zanim zadzwonisz',
      // Plan 0611 §7.1 pkt 9: the call-back promise only in the hero, the steps and the form.
      lead: FAQ_LEAD_BIZ2,
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
            'Zależy od liczby stanowisk, serwera i zakresu. Zaczynamy od bezpłatnego przeglądu IT, a potem przygotowujemy wycenę.',
        },
        {
          // TODO(krystian): [SZEF] daty KSeF do sprawdzenia przed publikacją (ZMIANY-v20 §5).
          question: 'Czy pomożecie przygotować firmę do KSeF?',
          answer:
            'Tak. Sprawdzimy program do faktur, nadamy uprawnienia księgowej, przygotujemy certyfikat i procedurę awaryjną przed obowiązkowym terminem 1 stycznia 2027 r. dla najmniejszych firm.',
        },
        {
          // The number comes from `contact.ts`; the hours in the sentence follow BIZNES_COMPANY.
          question: 'Co, gdy coś przestanie działać?',
          answer: `Dzwonisz na ${BIZNES_CONTACT.phone} w godzinach pracy (pn–pt 9–17). Ustalamy przyczynę i naprawiamy, a gdy trzeba, przyjeżdża serwisant z Rabki. Klienci z umową opieki mają czas reakcji ustalony w umowie.`,
        },
        {
          question: 'Czy przejmujecie serwis kasy od innej firmy?',
          answer: `Tak. Wystarczy telefon na ${BIZNES_CONTACT.phone}. Formalności i termin najbliższego przeglądu bierzemy na siebie, bo jesteśmy autoryzowanym serwisem Posnet i Elzab.`,
        },
        {
          question: 'Prowadzę biuro rachunkowe. Jak możemy współpracować?',
          answer: `Pomagamy Twoim klientom przejść na KSeF: program do faktur, certyfikat i uprawnienia dla biura. Zadzwoń na ${BIZNES_CONTACT.phone}, a ustalimy, jak najprościej przekazywać nam sprawy klientów.`,
        },
      ],
    },
    {
      blockType: 'bzContact',
      heading: 'Napisz, czego potrzebujesz. Oddzwonimy w ciągu 60 minut w godzinach pracy.',
      lead: 'Jedna wiadomość wystarczy. Oddzwonimy z pytaniami i przygotujemy wycenę.',
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

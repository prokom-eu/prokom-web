import type { PageBlock } from './page'

type ContactBlock = PageBlock

export const CONTACT_SLUG = 'kontakt'

/**
 * Towns served, from the board (FAQ „Dojeżdżacie do mnie?” and the area diagram) — into
 * `SiteSettings.biznes.serviceAreas` when empty. TODO(krystian): [SZEF] potwierdzić listę.
 */
export const SERVICE_AREAS = [
  'Rabka-Zdrój',
  'Nowy Targ',
  'Zakopane',
  'Jordanów',
  'Mszana Dolna',
  'Limanowa',
  'Myślenice',
  'Nowy Sącz',
  'Szczawnica',
  'Kraków',
]

/** `/kontakt` of the Biznes line (spec. §6.9, plansza Kontakt) — texts of the board. */
export function biznesContactLayout(): ContactBlock[] {
  return [
    {
      blockType: 'bzContactInfo',
      heading: 'Kontakt i dojazd',
      lead: 'Jeden numer do ofert i serwisu, jeden adres, jedna skrzynka. Wszystko o nas w jednym miejscu.',
      areaLabel: 'Dojeżdżamy na całe Podhale i Małopolskę',
      phoneNote: 'kasy, komputery, programy, awarie',
      emailNote: 'odpisujemy w godzinach pracy',
      addressNote: 'biuro, salon i serwis w jednym miejscu',
    },
    {
      blockType: 'bzQuickCards',
      cards: [
        {
          title: 'Awaria kasy lub komputera',
          // Not the board's „Zdalnie łączymy się…”: remote help only on /opieka-it (ZMIANY-v20
          // §1.2); the sentence of the home FAQ instead.
          // TODO(krystian): [SZEF] numer w tekście — ten sam co w Ustawieniach strony.
          text: 'Zadzwoń na 889 003 889. Ustalimy przyczynę i naprawimy, a gdy trzeba, przyjeżdża serwisant z Rabki.',
          linkLabel: 'Zgłoś serwis',
          href: '/kontakt#kontakt',
        },
        {
          title: 'Nowa firma, nowy lokal',
          text: 'Kasa, terminal, program, komputery, sieć — z fiskalizacją i szkoleniem w cenie. Opisz firmę, a przygotujemy zestaw.',
          linkLabel: 'Przygotuj zapytanie',
          href: '/kontakt#kontakt',
        },
        {
          title: 'Przegląd kasy',
          // TODO(krystian): [SZEF] „co 2 lata” to fakt prawny — źródło (przepis) do treści albo
          // pola „źródło” przed publikacją (plan §4).
          text: 'Obowiązkowy co 2 lata. Podaj numer unikatowy kasy albo nazwę firmy — sprawdzimy termin i umówimy serwisanta. Przypomnimy przed kolejnym.',
          linkLabel: 'Umów przegląd',
          href: '/kontakt#kontakt',
        },
      ],
    },
    {
      blockType: 'bzContact',
      heading: 'Powiedz, czego potrzebujesz. Resztą zajmiemy się my.',
      // The board's lead promises „trzy krótkie kroki” of the old form: the v20 lead instead.
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
    {
      blockType: 'faq',
      eyebrow: 'Pytania o kontakt',
      heading: 'Dojazd, godziny, wyceny',
      items: [
        {
          question: 'Dojeżdżacie do mnie?',
          answer:
            'Tak — na całe Podhale i Małopolskę: Rabka, Nowy Targ, Zakopane, Limanowa, Mszana Dolna, Myślenice, Nowy Sącz, Kraków. Dalej też, po ustaleniu.',
        },
        {
          question: 'Czy mogę przyjechać z kasą do serwisu?',
          // TODO(krystian): [SZEF] godziny w odpowiedzi — te same co w Danych firmy.
          answer:
            'Tak, ul. Orkana 16B w Rabce, pn–pt 9–17. Warto zadzwonić wcześniej — przygotujemy części i papier do kasy.',
        },
        {
          question: 'Jak szybko odpowiadacie?',
          answer:
            'Najszybciej, jak to możliwe, w godzinach pracy. Klienci z umową opieki mają czas reakcji zapisany w umowie.',
        },
        {
          question: 'Czy mogę dostać wycenę bez wizyty?',
          answer:
            'Tak. Opisz firmę w formularzu albo zadzwoń — większość wycen przygotowujemy zdalnie, na piśmie.',
        },
      ],
    },
  ]
}

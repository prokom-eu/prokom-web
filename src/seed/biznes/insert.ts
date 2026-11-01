import type { GoposRefs } from './gopos'
import type { PageBlock } from './page'

export const INSERT_SLUG = 'insert'

/** Ids of records the seed made earlier (the same lookups as for /gopos). */
export type InsertRefs = GoposRefs

const NO_REFS: InsertRefs = {
  image: () => undefined,
  brand: () => undefined,
  product: () => undefined,
}

/**
 * `/insert` of the Biznes line (spec. §6.6, plansza Insert) — texts of the board 1:1. The picker
 * is one tile = one program (decyzja 24.10); „Subiekt nexo PRO” has no product of its own, so its
 * switch puts Subiekt nexo on the list.
 */
export function biznesInsertLayout(refs: InsertRefs = NO_REFS): PageBlock[] {
  const image = (file: string) => refs.image(file) ?? null
  const product = (shortId: string) => refs.product(shortId) ?? null
  return [
    {
      blockType: 'bzPageHero',
      heading: 'Subiekt dobrany do firmy.',
      headingAccent: 'I podłączony do KSeF.',
      lead: 'Programy InsERT do sprzedaży, magazynu, księgowości i kadr. Pomagamy wybrać, instalujemy, przenosimy dane z poprzedniego programu, łączymy z kasą i uczymy zespół na Waszych dokumentach.',
      primary: { label: 'Który Subiekt dla mnie?', href: '/insert#dobor' },
      secondary: { label: 'KSeF w InsERT', href: '/insert#ksef' },
      parent: { label: 'Oferta', href: '/oferta' },
      variant: 'screen',
      screen: {
        // Badge „Autoryzowany partner InsERT” = status in Partners ([SZEF]); `none` hides it.
        partner: refs.brand('InsERT') ?? null,
        screenImage: image('ekran-subiekt-nexo-zlecenie.webp'),
        boxImage: image('p-insert-subiekt-nexo.webp'),
        // TODO(krystian): [SZEF] potwierdzić „Gotowy na KSeF — wszystkie programy InsERT”.
        notes: [
          { title: 'Gotowy na KSeF', text: 'wszystkie programy InsERT', icon: 'check' },
          { title: 'Dane przeniesione', text: 'towary, kontrahenci, ceny', icon: 'server' },
        ],
      },
    },
    {
      blockType: 'bzProgramPicker',
      eyebrow: 'Który Subiekt dla mnie?',
      heading: 'Zaznacz, co pasuje do Twojej firmy.',
      lead: 'Jedno kliknięcie — i widzisz, od którego programu zaczęlibyśmy rozmowę. Ostateczny wybór i tak potwierdzimy po krótkiej rozmowie.',
      resultLabel: 'Polecamy na start',
      initial: 2,
      talk: { label: 'Porozmawiajmy', href: '/insert#kontakt' },
      // TODO(krystian): [SZEF] zrzuty i pudełka z materiałów InsERT — plansza ma zaślepki: zrzut
      // nexo przy Subiekcie 123 oraz zrzut i pudełko nexo przy nexo PRO i GT.
      options: [
        {
          trait: 'Jednoosobowa firma',
          traitText: 'Głównie faktury, bez magazynu, chcę pracować z dowolnego miejsca.',
          icon: 'store',
          program: 'Subiekt 123',
          caption: 'najmniejsze firmy, w przeglądarce',
          description:
            'Sprzedaż i faktury w przeglądarce — dla najmniejszych firm, które chcą prosto i bez instalacji.',
          points: [
            { text: 'Działa w przeglądarce, bez instalacji' },
            { text: 'Faktury gotowe na KSeF' },
            { text: 'Dobra na start działalności' },
          ],
          screenImage: image('ekran-subiekt-nexo-faktura.webp'),
          boxImage: image('p-insert-subiekt-123.webp'),
          product: product('s123'),
        },
        {
          trait: 'Sklep, hurtownia, warsztat',
          traitText: 'Magazyn, kilka stanowisk, kasa lub drukarka fiskalna.',
          icon: 'server',
          program: 'Subiekt nexo',
          caption: 'małe i średnie: sklep, hurtownia, warsztat',
          description:
            'Sprzedaż i magazyn dla małych i średnich firm. Wiele programów w jednym oknie, sprzedaż z wielu magazynów.',
          points: [
            { text: 'Wiele programów w jednym oknie' },
            { text: 'Sprzedaż z wielu magazynów' },
            { text: 'Współpraca z drukarką fiskalną i KSeF' },
          ],
          screenImage: image('ekran-subiekt-nexo-zlecenie.webp'),
          boxImage: image('p-insert-subiekt-nexo.webp'),
          product: product('nexo'),
        },
        {
          trait: 'Kilka oddziałów, e-sklep',
          traitText: 'Waluty, integracje, sklep internetowy, INTRASTAT.',
          icon: 'compass',
          program: 'Subiekt nexo PRO',
          caption: 'oddziały, waluty, e-commerce',
          description:
            'Dla firm wielooddziałowych: waluty, integracje (Sfera), e-commerce, partie towaru, INTRASTAT i audyt.',
          points: [
            { text: 'Wiele oddziałów i waluty' },
            { text: 'Integracje Sfera i e-commerce' },
            { text: 'Partie, INTRASTAT, audyt zmian' },
          ],
          screenImage: image('ekran-subiekt-nexo-zlecenie.webp'),
          boxImage: image('p-insert-subiekt-nexo.webp'),
          // No nexo PRO product in the catalog: the switch lists Subiekt nexo (plansza does so).
          product: product('nexo'),
        },
        {
          trait: 'Pracuję na Subiekcie GT',
          traitText: 'Mam GT od lat i chcę, żeby działał z KSeF.',
          icon: 'bolt',
          program: 'Subiekt GT',
          caption: 'sprawdzona linia dla mikro i małych',
          description:
            'Sprawdzona linia dla mikro i małych firm. Jeśli GT Ci wystarcza — zostajesz. Jeśli rośniesz — przeniesiemy dane do nexo.',
          points: [
            { text: 'Gotowy na KSeF' },
            { text: 'Aktualizacja i konfiguracja KSeF' },
            { text: 'Przejście na nexo, gdy przyjdzie pora' },
          ],
          screenImage: image('ekran-subiekt-nexo-zlecenie.webp'),
          boxImage: image('p-insert-subiekt-nexo.webp'),
          product: product('gt'),
        },
      ],
    },
    {
      blockType: 'bzCards',
      eyebrow: 'Rodzina programów InsERT',
      heading: 'Sprzedaż, księgowość i kadry — w jednym ekosystemie.',
      surface: 'default',
      columns: '3',
      tone: 'accent',
      // Board tiles: Gratyfikant orange and Gestor teal have no tokens — red and green instead.
      cards: [
        {
          title: 'Subiekt',
          monogram: 'S',
          monogramTone: 'blue',
          text: 'Sprzedaż, magazyn i faktury — od Subiekta 123 po nexo PRO.',
        },
        {
          title: 'Rachmistrz',
          monogram: 'R',
          monogramTone: 'green',
          text: 'Księga przychodów i rozchodów oraz ryczałt.',
        },
        {
          title: 'Rewizor',
          monogram: 'Rw',
          monogramTone: 'violet',
          text: 'Pełna księgowość dla firm i biur rachunkowych.',
        },
        {
          title: 'Gratyfikant',
          monogram: 'G',
          monogramTone: 'red',
          text: 'Kadry i płace: umowy, listy płac, deklaracje.',
        },
        {
          title: 'Gestor',
          monogram: 'Ge',
          monogramTone: 'green',
          text: 'Relacje z klientami: kontakty, zadania, sprzedaż.',
        },
        {
          title: 'Biuro',
          monogram: 'B',
          monogramTone: 'dark',
          text: 'Program dla biur rachunkowych obsługujących wielu klientów.',
        },
      ],
    },
    {
      blockType: 'bzKsef',
      eyebrow: 'KSeF w programach InsERT',
      date: '2027-01-01T00:00:00.000Z',
      dateLabel: 'dni do 1 stycznia 2027',
      // TODO(krystian): [SZEF] fakt prawny bez źródła w treści (plan §4) — potwierdzić z MF
      // (ZMIANY-v20 §5: wyjątki dla faktur z kas i firm do 10 000 zł/mies. do końca 2026).
      text: 'Od tego dnia do KSeF dołączają najmniejsze firmy, a faktury dla firm do paragonów idą już tylko przez KSeF. Program InsERT jest gotowy — trzeba jeszcze przygotować firmę.',
      // TODO(krystian): przycisk „6 rzeczy do zrobienia przed 2027” → wpis KSeF po B11
      // (/aktualnosci/<slug>); bez wpisu przycisk jest ukryty.
      checklist: [
        {
          title: 'Uwierzytelnienie firmy',
          text: 'profil zaufany, podpis lub pieczęć — dobierzemy',
        },
        { title: 'Uprawnienia dla księgowej', text: 'kto wystawia, kto odbiera faktury' },
        { title: 'Certyfikat KSeF', text: 'także do pracy offline' },
        { title: 'Konfiguracja w programie', text: 'Subiekt, Rachmistrz, Rewizor' },
        { title: 'Test na Twoich fakturach', text: 'zanim zrobi się na poważnie' },
        { title: 'Procedura awaryjna', text: 'co robić, gdy nie ma internetu' },
      ],
    },
    {
      blockType: 'bzCards',
      eyebrow: 'Wdrożenie z PRO-KOM',
      heading: 'Program to licencja. Spokój to wdrożenie.',
      surface: 'default',
      columns: '3',
      tone: 'accent',
      cards: [
        {
          title: 'Instalacja i konfiguracja',
          icon: 'rocket',
          text: 'Program, stanowiska, użytkownicy i uprawnienia — gotowe do pracy pierwszego dnia.',
        },
        {
          title: 'Przeniesienie danych',
          icon: 'server',
          text: 'Kartoteki towarów i kontrahentów z innego programu lub z Excela. Bez przepisywania ręcznie.',
        },
        {
          title: 'Kasa i drukarka fiskalna',
          icon: 'store',
          text: 'Łączymy Subiekta z drukarką fiskalną Posnet lub Elzab i skanerem kodów.',
        },
        {
          title: 'Szkolenie na Twoich danych',
          icon: 'users',
          text: 'Uczymy na Waszych towarach i dokumentach, nie na przykładach z instrukcji.',
        },
        {
          title: 'Aktualizacje i odnowienia',
          icon: 'bell',
          text: 'Pilnujemy terminów pakietów aktualizacji — zmiany przepisów nie zaskoczą programu.',
        },
        {
          title: 'Pomoc zdalna',
          icon: 'monitor',
          text: 'Problem z dokumentem lub wydrukiem? Łączymy się zdalnie i rozwiązujemy od ręki.',
        },
      ],
    },
    {
      blockType: 'faq',
      eyebrow: 'Pytania o InsERT',
      heading: 'Zanim wybierzesz program',
      lead: 'Najczęstsze pytania właścicieli sklepów, hurtowni i warsztatów.',
      items: [
        {
          question: 'Subiekt GT czy nexo — co wybrać?',
          answer:
            'Jeśli pracujesz na GT i wszystko działa — możesz zostać, GT jest gotowy na KSeF. Nową firmę albo firmę, która rośnie (więcej magazynów, stanowisk, integracji), stawiamy od razu na nexo. Doradzimy po krótkiej rozmowie.',
        },
        {
          question: 'Czy przeniesiecie dane z mojego obecnego programu?',
          answer:
            'Tak — kartoteki towarów i kontrahentów przenosimy z innego programu albo z Excela. Zakres przenoszenia ustalamy przed wdrożeniem, żeby nic nie zginęło.',
        },
        {
          question: 'Czy Subiekt będzie współpracował z moją kasą lub drukarką fiskalną?',
          answer:
            'Subiekt współpracuje z drukarkami fiskalnymi (np. Posnet, Elzab). Sprawdzimy model Twojego urządzenia i powiemy, czy wystarczy, czy lepiej wymienić.',
        },
        {
          question: 'Jak wygląda KSeF w programach InsERT?',
          answer:
            'Wszystkie programy InsERT są przygotowane do KSeF. My zajmujemy się resztą: uwierzytelnienie, uprawnienia dla księgowej, certyfikat, konfiguracja w programie i test na Twoich fakturach.',
        },
        {
          question: 'Pracuję z biurem rachunkowym. Czy to ma znaczenie?',
          answer:
            'Tak — ustawimy program tak, żeby biuro dostawało dane w wygodnej formie, i nadamy księgowej uprawnienia w KSeF.',
        },
        {
          question: 'Kupuję licencję czy abonament?',
          answer:
            'Programy InsERT kupuje się jako licencję, a aktualizacje (m.in. zmiany przepisów) są w pakietach aktualizacji. Przy wycenie pokażemy oba elementy osobno i przypomnimy o odnowieniu.',
        },
      ],
    },
    {
      blockType: 'bzContact',
      heading: 'Porozmawiajmy o programie dla Twojej firmy.',
      lead: 'Powiedz, czym się zajmujesz i na czym pracujesz dziś. Doradzimy program, przygotujemy wycenę licencji i wdrożenia na piśmie. Oddzwaniamy w ciągu 60 minut w godzinach pracy.',
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

import type { DashVariant, FlowVariant, SiteVariant } from '@/lib/software/mockups'

/**
 * Sample texts of the mock-ups, 1:1 from `v24/boards/Vis.dc.html` (`V`, `D`, `F`). Pictures, not
 * content: they show a type of business, so they live here, not in the panel (ZMIANY-v24 §8).
 */

/** Brand theme of the sample firm: tokens `--mk-<theme>-*`. */
export type MockTheme = 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

/** A value in the widget; `ok` paints it green. */
export type MockRow = { label: string; value: string; ok?: boolean }

export type SiteData = {
  theme: MockTheme
  brand: string
  url: string
  eyebrow: string
  title: string
  lead: string
  cta: string
  nav: [string, string, string]
  widget: {
    title: string
    tag: string
    /** Chips with the chosen ones marked `true`. */
    chips: [string, boolean][]
    rows: MockRow[]
    button: string
  }
  features: [icon: string, title: string, note: string][]
}

const ok = true
/** „#” of order numbers, kept apart so the number is not read as a colour (no-raw-colors.test). */
const NO = '#'

export const SITES: Record<SiteVariant, SiteData> = {
  wizytowka: {
    theme: 'a',
    brand: 'Twoja Firma',
    url: 'twojafirma.pl',
    eyebrow: 'TWOJA BRANŻA · TWOJE MIASTO',
    title: 'Klient znajduje Cię w Google i od razu dzwoni',
    lead: 'Kim jesteś, co robisz, jak dojechać. Wszystko na jednym ekranie.',
    cta: 'Zadzwoń teraz',
    nav: ['O firmie', 'Usługi', 'Kontakt'],
    widget: {
      title: 'Szybki kontakt',
      tag: 'odpowiadamy dziś',
      chips: [],
      rows: [
        { label: 'Telefon', value: '600 000 000' },
        { label: 'Godziny', value: 'pn–pt 8–17' },
        { label: 'Dojazd', value: 'mapa ✓', ok },
      ],
      button: 'Wyślij zapytanie',
    },
    features: [
      ['☎', 'Telefon', 'jednym kliknięciem'],
      ['⌖', 'Mapa', 'i godziny'],
      ['G', 'Google', 'gotowa od startu'],
    ],
  },
  firmowa: {
    theme: 'e',
    brand: 'Twoja Firma',
    url: 'twojafirma.pl',
    eyebrow: 'OD 2009 ROKU · CAŁA POLSKA',
    title: 'Oferta, realizacje i opinie w jednym miejscu',
    lead: 'Klient widzi, co robisz i dlaczego warto. Treści zmieniasz sam w panelu.',
    cta: 'Zapytaj o wycenę',
    nav: ['Oferta', 'Realizacje', 'Kontakt'],
    widget: {
      title: 'Zapytanie o wycenę',
      tag: '2 minuty',
      chips: [
        ['Usługa', true],
        ['Produkt', false],
        ['Serwis', false],
      ],
      rows: [
        { label: 'Termin', value: 'w tym miesiącu' },
        { label: 'Odpowiedź', value: 'w 24 h', ok },
      ],
      button: 'Wyślij zapytanie',
    },
    features: [
      ['★', 'Opinie', 'klientów'],
      ['▦', 'Realizacje', 'z opisem'],
      ['✎', 'Panel', 'zmieniasz sam'],
    ],
  },
  rozbudowana: {
    theme: 'f',
    brand: 'Twoja Firma',
    url: 'twojafirma.pl',
    eyebrow: 'OFERTA · BLOG · PL EN DE',
    title: 'Cała oferta, poradnik i kilka języków',
    lead: 'Dziesiątki podstron, czytelna nawigacja i kilka osób w panelu.',
    cta: 'Zobacz ofertę',
    nav: ['Oferta', 'Poradnik', 'Zespół'],
    widget: {
      title: 'Najnowsze wpisy',
      tag: 'blog',
      chips: [
        ['PL', true],
        ['EN', false],
        ['DE', false],
      ],
      rows: [
        { label: 'Jak wybrać rozwiązanie', value: 'Poradnik' },
        { label: 'Nowość w ofercie', value: 'Aktualności' },
        { label: 'Projekt dla klienta', value: 'Realizacje' },
      ],
      button: 'Wszystkie wpisy',
    },
    features: [
      ['∞', 'Podstrony', 'bez limitu'],
      ['3', 'Języki', 'PL · EN · DE'],
      ['R', 'Role', 'kto pisze, kto zatwierdza'],
    ],
  },
  landing: {
    theme: 'd',
    brand: 'Twoja Firma',
    url: 'twojafirma.pl/kampania',
    eyebrow: 'JEDNA USŁUGA · JEDEN CEL',
    title: 'Jedna usługa, jeden cel: zapytanie od klienta',
    lead: 'Strona pod reklamę w Google lub na Facebooku. Formularz na każdym ekranie.',
    cta: 'Policz koszt',
    nav: ['Jak działa', 'Cennik', 'FAQ'],
    widget: {
      title: 'Policz koszt',
      tag: 'szacunek',
      chips: [
        ['Mały', false],
        ['Średni', true],
        ['Duży', false],
      ],
      rows: [
        { label: 'Zakres', value: 'średni' },
        { label: 'Termin', value: '2 tygodnie' },
        { label: 'Cena od', value: '2 400 zł', ok },
      ],
      button: 'Odbierz wycenę',
    },
    features: [
      ['1', 'Korzyści', 'w 5 sekund'],
      ['2', 'Opinie', 'i pytania'],
      ['3', 'Formularz', 'zawsze pod ręką'],
    ],
  },
  pensjonat: {
    theme: 'b',
    brand: 'Pod Turbaczem',
    url: 'podturbaczem.pl',
    eyebrow: 'PENSJONAT · RABKA-ZDRÓJ',
    title: 'Cisza, widok na Gorce i śniadanie',
    lead: 'Osiem pokoi z widokiem. Zapytaj o termin bez prowizji portalu.',
    cta: 'Zapytaj o termin',
    nav: ['Pokoje', 'Okolica', 'Galeria'],
    widget: {
      title: 'Pokój z widokiem',
      tag: '2–3 osoby',
      chips: [
        ['12.01', false],
        ['13.01', true],
        ['14.01', true],
        ['15.01', false],
      ],
      rows: [
        { label: 'Śniadanie', value: 'w cenie' },
        { label: 'Parking', value: 'bezpłatny' },
      ],
      button: 'Wyślij zapytanie',
    },
    features: [
      ['PL', 'Strona w 3', 'językach'],
      ['0%', 'Prowizji', 'portalu'],
      ['8', 'Pokoi', 'z widokiem'],
    ],
  },
  restauracja: {
    theme: 'c',
    brand: 'Karczma Pod Lipą',
    url: 'karczmapodlipa.pl',
    eyebrow: 'KUCHNIA REGIONALNA',
    title: 'Kwaśnica, pstrąg i domowe pierogi',
    lead: 'Menu dnia zmieniamy codziennie rano. Stolik zarezerwujesz w minutę.',
    cta: 'Zarezerwuj stolik',
    nav: ['Menu', 'Sala', 'Dojazd'],
    widget: {
      title: 'Menu dnia',
      tag: 'dziś',
      chips: [],
      rows: [
        { label: 'Kwaśnica na żeberkach', value: '24 zł' },
        { label: 'Pstrąg z masłem', value: '46 zł' },
        { label: 'Pierogi z bryndzą', value: '32 zł' },
      ],
      button: 'Rezerwuj stolik',
    },
    features: [
      ['☰', 'Menu', 'zmieniasz sam'],
      ['EN', 'Wersja', 'dla turystów'],
      ['60', 'Miejsc', 'na sali'],
    ],
  },
  budowlanka: {
    theme: 'e',
    brand: 'Bud-Mont',
    url: 'bud-mont.pl',
    eyebrow: 'BUDOWA · REMONTY · WYKOŃCZENIA',
    title: 'Budujemy i wykańczamy. Terminowo, z umową',
    lead: 'Domy, remonty i wykończenia pod klucz. Wycena po bezpłatnych oględzinach.',
    cta: 'Umów oględziny',
    nav: ['Usługi', 'Realizacje', 'Kontakt'],
    widget: {
      title: 'Bezpłatne oględziny',
      tag: 'w 3 dni',
      chips: [
        ['Dom', true],
        ['Mieszkanie', false],
        ['Lokal', false],
      ],
      rows: [
        { label: 'Wycena', value: 'na piśmie' },
        { label: 'Gwarancja', value: 'w umowie', ok },
      ],
      button: 'Umów termin',
    },
    features: [
      ['▦', 'Realizacje', 'z opisem'],
      ['✓', 'Umowa', 'i gwarancja'],
      ['⌖', 'Zasięg', 'cały region'],
    ],
  },
  turystyka: {
    theme: 'd',
    brand: 'Gorce Adventure',
    url: 'gorceadventure.pl',
    eyebrow: 'WYCIECZKI · SPŁYWY · ATRAKCJE',
    title: 'Przygoda w Gorcach. Rezerwujesz w minutę',
    lead: 'Spływy, wycieczki z przewodnikiem i atrakcje dla grup. PL, EN, DE.',
    cta: 'Zarezerwuj',
    nav: ['Atrakcje', 'Grupy', 'Kontakt'],
    widget: {
      title: 'Spływ Dunajcem',
      tag: 'wolne miejsca',
      chips: [
        ['sob', false],
        ['ndz', true],
        ['pn', false],
      ],
      rows: [
        { label: 'Osoby', value: '4' },
        { label: 'Cena od', value: '89 zł / os.' },
        { label: 'Termin', value: 'potwierdzony', ok },
      ],
      button: 'Rezerwuj termin',
    },
    features: [
      ['3', 'Języki', 'PL · EN · DE'],
      ['⌚', 'Rezerwacja', '24/7'],
      ['★', 'Opinie', 'gości'],
    ],
  },
  uroda: {
    theme: 'f',
    brand: 'Studio Lumi',
    url: 'studiolumi.pl',
    eyebrow: 'KOSMETOLOGIA · FRYZJER · SPA',
    title: 'Umów wizytę o każdej porze',
    lead: 'Zabiegi, cennik i wolne terminy. Przypomnienie SMS dzień wcześniej.',
    cta: 'Umów wizytę',
    nav: ['Zabiegi', 'Cennik', 'Kontakt'],
    widget: {
      title: 'Wolne terminy',
      tag: 'dziś',
      chips: [
        ['10:00', false],
        ['12:30', true],
        ['15:00', false],
        ['17:30', false],
      ],
      rows: [
        { label: 'Zabieg', value: 'manicure' },
        { label: 'Przypomnienie', value: 'SMS ✓', ok },
      ],
      button: 'Rezerwuję',
    },
    features: [
      ['⌚', 'Rezerwacja', 'online'],
      ['SMS', 'Przypomnienia', 'automatycznie'],
      ['☰', 'Cennik', 'zawsze aktualny'],
    ],
  },
  warsztat: {
    theme: 'a',
    brand: 'AutoSerwis Max',
    url: 'autoserwismax.pl',
    eyebrow: 'MECHANIKA · OPONY · DIAGNOSTYKA',
    title: 'Auto gotowe na czas. Status naprawy w SMS',
    lead: 'Przeglądy, naprawy i wymiana opon. Zapisz się online na wolny termin.',
    cta: 'Zapisz auto',
    nav: ['Usługi', 'Cennik', 'Kontakt'],
    widget: {
      title: 'Status naprawy',
      tag: 'na żywo',
      chips: [],
      rows: [
        { label: 'Przyjęte', value: '8:10', ok },
        { label: 'Diagnoza', value: 'gotowa', ok },
        { label: 'Do odbioru', value: 'ok. 15:00' },
      ],
      button: 'Sprawdź status',
    },
    features: [
      ['SMS', 'Status naprawy', 'dla klienta'],
      ['⌚', 'Zapisy', 'online'],
      ['✓', 'Gwarancja', 'na usługi'],
    ],
  },
  sklep: {
    theme: 'c',
    brand: 'Sklep u Basi',
    url: 'sklepubasi.pl',
    eyebrow: 'SKLEP · RABKA-ZDRÓJ',
    title: 'Świeże produkty i nowości co tydzień',
    lead: 'Godziny, nowości, promocje tygodnia i dojazd. Zamówienie odbierasz w sklepie.',
    cta: 'Zobacz nowości',
    nav: ['Nowości', 'Promocje', 'Kontakt'],
    widget: {
      title: 'Promocje tygodnia',
      tag: 'do niedzieli',
      chips: [],
      rows: [
        { label: 'Oscypek wędzony', value: '−15%' },
        { label: 'Miód gorczański', value: '−10%' },
        { label: 'Odbiór', value: 'dziś od 15:00', ok },
      ],
      button: 'Zarezerwuj odbiór',
    },
    features: [
      ['★', 'Nowości', 'co tydzień'],
      ['⌖', 'Dojazd', 'i parking'],
      ['⌚', 'Godziny', 'zawsze aktualne'],
    ],
  },
  biuro: {
    theme: 'a',
    brand: 'Biuro Saldo',
    url: 'biurosaldo.pl',
    eyebrow: 'KSIĘGOWOŚĆ · KADRY · DORADZTWO',
    title: 'Księgowość, którą wreszcie rozumiesz',
    lead: 'Pełna księgowość, kadry i doradztwo dla firm. Odpowiadamy w 24 godziny.',
    cta: 'Umów konsultację',
    nav: ['Usługi', 'Cennik', 'Kontakt'],
    widget: {
      title: 'Umów konsultację',
      tag: 'online lub w biurze',
      chips: [
        ['pn 9:00', false],
        ['wt 11:00', true],
        ['śr 14:00', false],
      ],
      rows: [
        { label: 'Czas', value: '30 minut' },
        { label: 'Koszt', value: 'bezpłatnie', ok },
      ],
      button: 'Zarezerwuj',
    },
    features: [
      ['%', 'Księgowość', 'pełna i KPiR'],
      ['ZUS', 'Kadry', 'i płace'],
      ['24h', 'Odpowiedź', 'na pytanie'],
    ],
  },
  produkcja: {
    theme: 'e',
    brand: 'Metal-Tech',
    url: 'metal-tech.pl',
    eyebrow: 'PRODUKCJA · OBRÓBKA CNC · B2B',
    title: 'Produkujemy na wymiar. Wycena w 48 godzin',
    lead: 'Konstrukcje, obróbka CNC i krótkie serie dla firm. Wyślij rysunek, odpiszemy z ceną.',
    cta: 'Wyślij zapytanie',
    nav: ['Oferta', 'Park maszyn', 'Kontakt'],
    widget: {
      title: 'Zapytanie ofertowe',
      tag: 'B2B',
      chips: [
        ['Rysunek PDF', true],
        ['DXF', false],
        ['STEP', false],
      ],
      rows: [
        { label: 'Seria', value: 'od 1 szt.' },
        { label: 'Wycena', value: 'w 48 h', ok },
      ],
      button: 'Wyślij rysunek',
    },
    features: [
      ['CNC', 'Park maszyn', 'na stronie'],
      ['48h', 'Wycena', 'na piśmie'],
      ['EN', 'Wersja', 'dla klientów z UE'],
    ],
  },
  przebudowa: {
    theme: 'e',
    brand: 'Twoja Firma',
    url: 'twojafirma.pl',
    eyebrow: 'NOWA STRONA · TE SAME ADRESY',
    title: 'Twoja strona, tylko szybsza i nowoczesna',
    lead: 'Treści przeniesione, stare adresy działają, Google zostaje.',
    cta: 'Zapytaj o wycenę',
    nav: ['Oferta', 'O firmie', 'Kontakt'],
    widget: {
      title: 'Nowa strona',
      tag: 'po przebudowie',
      chips: [],
      rows: [
        { label: 'Szybkość', value: '1,9 s', ok },
        { label: 'Stare adresy', value: '42 / 42', ok },
      ],
      button: 'Zapytaj o wycenę',
    },
    features: [
      ['↓', '1,9 s', 'na telefonie'],
      ['301', 'Przekierowania', 'wszystkich adresów'],
      ['✎', 'Panel', 'zmieniasz sam'],
    ],
  },
}

/** Status tag of a list row: green done, violet new, grey otherwise. */
export type DashTag = 'ok' | 'new' | 'plain'

export type DashData = {
  nav: [string, string, string, string, string]
  crumb: string
  title: string
  button: string
  kpi: [label: string, value: string, delta?: string][]
  chart: string
  /** Seven days, Monday first; the fifth (Friday) is the highlighted bar. */
  bars: [number, number, number, number, number, number, number]
  list: string
  rows: [title: string, note: string, tag: string, tone: DashTag][]
  /**
   * The company dashboard (SWA14 §4.2): a „na żywo” badge in the corner, and its parts can be lit
   * by the points of „W cenie” (KPIs, chart, „Wymaga uwagi”, the Monday report).
   */
  live?: string
}

export const DASHES: Record<DashVariant, DashData> = {
  zamowienia: {
    nav: ['Pulpit', 'Zamówienia', 'Klienci', 'Faktury', 'Raporty'],
    crumb: 'Zamówienia',
    title: 'Zamówienia · listopad',
    button: '+ Nowe',
    kpi: [
      ['Nowe', '18', '+4'],
      ['W realizacji', '11'],
      ['Do faktury', '7'],
    ],
    chart: 'Zamówienia dziennie',
    bars: [5, 8, 6, 9, 12, 7, 10],
    list: 'Ostatnie',
    rows: [
      [`${NO}1284 · Firma Nowak`, 'Anna · dziś 9:12', 'nowe', 'new'],
      [`${NO}1283 · Hotel Gorce`, 'Piotr · w realizacji', 'w toku', 'plain'],
      [`${NO}1282 · Biuro Saldo`, 'gotowe 8:40', 'do faktury', 'ok'],
      [`${NO}1281 · Vectra`, 'wczoraj', 'zamknięte', 'ok'],
    ],
  },
  crm: {
    nav: ['Pulpit', 'Klienci', 'Oferty', 'Zadania', 'Raporty'],
    crumb: 'Klienci',
    title: 'Do kogo zadzwonić dziś',
    button: '+ Klient',
    kpi: [
      ['Klienci', '248', '+12'],
      ['Otwarte oferty', '14'],
      ['Telefony dziś', '5'],
    ],
    chart: 'Nowe zapytania',
    bars: [3, 4, 2, 6, 5, 7, 4],
    list: 'Dzisiaj',
    rows: [
      ['Hotel Gorce', 'oferta wysłana 3 dni temu', 'zadzwoń', 'new'],
      ['Firma Nowak', 'zapytanie z formularza', 'nowe', 'new'],
      ['Biuro Saldo', 'umowa do podpisu', 'oferta', 'plain'],
      ['Vectra', 'wygrana · 18 400 zł', 'wygrane', 'ok'],
    ],
  },
  czas: {
    nav: ['Pulpit', 'Czas pracy', 'Urlopy', 'Rozliczenia', 'Raporty'],
    crumb: 'Czas pracy',
    title: 'Listopad · godziny zespołu',
    button: 'Eksport',
    kpi: [
      ['Pracownicy', '14'],
      ['Godziny', '1 284', '+3%'],
      ['Do wypłaty', 'gotowe'],
    ],
    chart: 'Godziny dziennie',
    bars: [9, 10, 9, 11, 8, 4, 0],
    list: 'Teraz w pracy',
    rows: [
      ['Anna Kowal', 'start 7:58 · biuro', 'w pracy', 'ok'],
      ['Piotr Lis', 'start 8:05 · u klienta', 'w pracy', 'ok'],
      ['Ewa Zając', 'urlop 12–14.11', 'urlop', 'plain'],
      ['Marek Nowak', 'zmiana od 14:00', 'później', 'plain'],
    ],
  },
  excel: {
    nav: ['Pulpit', 'Dane', 'Import', 'Uprawnienia', 'Raporty'],
    crumb: 'Dane firmy',
    title: 'Siedem arkuszy, jedna baza',
    button: 'Importuj',
    kpi: [
      ['Wiersze', '4 812'],
      ['Duplikaty', '0', '−312'],
      ['Arkusze', '7 → 1'],
    ],
    chart: 'Import danych',
    bars: [2, 6, 10, 12, 12, 12, 12],
    list: 'Zaimportowane',
    rows: [
      ['Klienci.xlsx', '2 931 rekordów', 'scalone', 'ok'],
      ['Cennik_2026.xlsx', '1 204 pozycje', 'aktualne', 'ok'],
      ['Zamowienia_FINAL_v7', '677 wierszy', 'scalone', 'ok'],
      ['Kontakty_stare.xls', '312 duplikatów', 'usunięte', 'plain'],
    ],
  },
  // Sample data, no real firm (SWA14 §4.2).
  pulpit: {
    nav: ['Firma', 'Pulpit', 'Sprzedaż', 'Zlecenia', 'Zespół'],
    crumb: 'Pulpit firmy',
    title: 'Listopad',
    button: 'Raport · pn 7:00',
    kpi: [
      ['Przychód · listopad', '184 200 zł', '↑ 12%'],
      ['Zlecenia w toku', '37'],
      ['Do zapłaty', '3 faktury'],
      ['Marża', '31%'],
    ],
    chart: 'Sprzedaż dziennie',
    bars: [6, 8, 7, 9, 13, 5, 2],
    list: 'Wymaga uwagi',
    rows: [
      ['2 zlecenia po terminie', 'Ekipa A · od wtorku', 'pilne', 'new'],
      ['Faktura FV/11/082', '7 dni po terminie', 'przypomnij', 'new'],
      ['Ekipa B', '96% grafiku', 'pełna', 'plain'],
    ],
    live: 'na żywo',
  },
}

export type FlowData = {
  title: string
  nodes: [
    [icon: string, step: string, text: string],
    [icon: string, step: string, text: string],
    [icon: string, step: string, text: string],
  ]
  count: string
  logs: [text: string, status: string][]
}

export const FLOWS: Record<FlowVariant, FlowData> = {
  sms: {
    title: 'Powiadomienia dla klientów',
    nodes: [
      ['⚡', 'kiedy', 'Zamówienie zmienia status'],
      ['SMS', 'automat', 'SMS i e-mail do klienta'],
      ['✓', 'efekt', 'Klient wie, co się dzieje'],
    ],
    count: '128 wysłanych',
    logs: [
      ['Firma Nowak · „Zamówienie wysłane”', 'SMS ✓'],
      ['Hotel Gorce · „Gotowe do odbioru”', 'SMS ✓'],
      ['Biuro Saldo · przypomnienie o płatności', 'e-mail ✓'],
      ['Vectra · potwierdzenie terminu', 'SMS ✓'],
    ],
  },
  faktury: {
    title: 'Faktury bez przepisywania',
    nodes: [
      ['⚡', 'kiedy', 'Zlecenie zakończone'],
      ['FV', 'automat', 'Pozycje do programu'],
      ['✓', 'efekt', 'Faktura gotowa w Subiekcie'],
    ],
    count: '0 ręcznie',
    logs: [
      [`Zlecenie ${NO}1282 · Biuro Saldo`, 'faktura ✓'],
      [`Zlecenie ${NO}1281 · Vectra`, 'faktura ✓'],
      [`Zlecenie ${NO}1279 · Hotel Gorce`, 'faktura ✓'],
      ['Pozycji przepisanych ręcznie: 0', '✓'],
    ],
  },
  raporty: {
    title: 'Raport dla szefa',
    nodes: [
      ['⏱', 'kiedy', 'Piątek, 16:00'],
      ['Σ', 'automat', 'Zbiera dane z systemu'],
      ['✉', 'efekt', 'Raport w skrzynce'],
    ],
    count: 'co tydzień',
    logs: [
      ['Zamówienia w tygodniu: 46', '↑ 8'],
      ['Sprzedaż: 48 200 zł', '✓'],
      ['Opóźnione: 1', 'uwaga'],
      ['Wysłano do szefa · 16:00', '✓'],
    ],
  },
  ai: {
    title: 'Asystent AI do zapytań',
    nodes: [
      ['?', 'kiedy', 'Pytanie z maila lub formularza'],
      ['AI', 'asystent', 'Szkic odpowiedzi'],
      ['✓', 'Ty', 'Zatwierdzasz i wysyłasz'],
    ],
    count: '14 szkiców',
    logs: [
      ['„Ile kosztuje usługa?” · 22:14', 'szkic ✓'],
      ['„Do you deliver to Slovakia?” (EN)', 'szkic ✓'],
      ['„Kiedy wolny termin?”', 'szkic ✓'],
      ['Wysłane po Twoim kliknięciu', '✓'],
    ],
  },
}

/** Care panel: 30 days of uptime (day 18 slower), four facts. */
export const CARE = {
  eyebrow: 'OPIEKA · TWOJAFIRMA.PL',
  title: 'Wszystko działa',
  slowDay: 17,
  rows: [
    ['Kopia zapasowa', 'dziś 03:00 ✓'],
    ['Aktualizacje', 'na bieżąco ✓'],
    ['Czas odpowiedzi', '0,4 s'],
    ['Reakcja na zgłoszenie', 'w umowie'],
  ] as [string, string][],
}

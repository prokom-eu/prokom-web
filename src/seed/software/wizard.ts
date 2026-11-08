import type { PriceDisplay } from '../../lib/software/priceDisplay'
import type { SoftwareWizard } from '../../lib/software/wizard/schema'

import { SOFTWARE_INDUSTRIES } from './industries'

/**
 * Wizard v3 „Aurora” (ZMIANY-v24 §7, board `AU-kreator`): data of `v24/wzorzec/aurora.js` (`T`,
 * `FEAT`, `OPT`, `STEPS`, `LBL`, tip rules, `vkind`/`vvar`) and texts of `TRESCI-v24.md`
 * (`c_kreator`, `p_kreator`, `p_kreator2`). Prices and terms come from the solutions; team sizes
 * follow the spec (§7.1, decision 08.11), not the board. `pnpm -s software:wizard-json` prints it.
 */

/** How prices read on the site — unchanged from v22, also read by the cards and the offer window. */
export const PRICE_DISPLAY: PriceDisplay = {
  template: 'od {cena} zł netto',
  short: 'od {cena} zł',
  monthTemplate: 'od {cena} zł / mies.',
  levelMonthTemplate: '{cena} zł / mies.',
  fallback: 'Zapytaj o wycenę',
  termFallback: 'po krótkiej rozmowie',
  priceSub: 'netto · stała cena za zakres',
  moreHint:
    'Dodatki wycenimy w 5–7 dni. Cena „od” to podstawa, dopłatę za dodatki zobaczysz w wycenie.',
  moreSelectedNote:
    'Dodatki wycenimy w 5–7 dni. Cena „od” to podstawa, dopłatę za dodatki zobaczysz w wycenie.',
  noPrice: {
    price: 'Zapytaj o wycenę',
    term: 'po krótkiej rozmowie',
    priceSub: 'cena w 5–7 dni',
    termSub: 'cenę i termin dostaniesz w 5–7 dni',
    mobileBar: 'Zapytaj o wycenę',
  },
  scopeIntro: 'Tyle kosztuje podstawa.',
}

const opts = (...pairs: [string, string][]) => pairs.map(([id, label]) => ({ id, label }))

export const WIZARD_V3: SoftwareWizard = {
  types: [
    {
      id: 'wizytowka',
      group: 'site',
      solution: 'strona-wizytowka',
      label: 'Strona wizytówka',
      desc: 'Kim jesteś, telefon, mapa, formularz.',
    },
    {
      id: 'firmowa',
      group: 'site',
      solution: 'strona-firmowa-z-panelem',
      label: 'Strona firmowa',
      desc: 'Oferta, realizacje, opinie, panel.',
    },
    {
      id: 'rozbudowana',
      group: 'site',
      solution: 'rozbudowana-strona-firmowa',
      label: 'Rozbudowana strona',
      desc: 'Wiele podstron, blog, języki.',
    },
    {
      id: 'landing',
      group: 'site',
      solution: 'landing-page',
      label: 'Landing page',
      desc: 'Jedna usługa albo kampania.',
    },
    {
      id: 'przebudowa',
      group: 'redo',
      solution: 'przebudowa-starej-strony',
      label: 'Przebudowa starej strony',
      desc: 'Masz stronę, ale nic nie daje.',
    },
    {
      id: 'system',
      group: 'sys',
      solution: 'z-excela-do-systemu',
      label: 'System dla firmy',
      desc: 'Zamówienia, klienci, zadania, godziny.',
    },
    {
      id: 'automatyzacje',
      group: 'auto',
      solution: 'asystent-ai-do-zapytan',
      label: 'Automatyzacje i AI',
      desc: 'SMS-y, faktury, odpowiedzi same.',
    },
    {
      id: 'nie-wiem',
      group: 'idk',
      solution: null,
      label: 'Nie wiem jeszcze',
      desc: 'Opiszesz po swojemu, doradzimy.',
      noPrice: {
        tile: '0 zł',
        price: '0 zł za rozmowę',
        sub: '30 minut, bez zobowiązań',
        term: 'rozmowa 30 min',
      },
    },
  ],
  // The board starts with „Strona firmowa” in the live card.
  defaultType: 'firmowa',
  groups: {
    site: ['type', 'ind', 'have', 'feat', 'res'],
    redo: ['type', 'ind', 'redo', 'fix', 'res'],
    sys: ['type', 'ind', 'today', 'sysf', 'res'],
    auto: ['type', 'ind', 'auto', 'res'],
    idk: ['type', 'ind', 'desc', 'res'],
  },
  steps: {
    type: {
      label: 'Rodzaj',
      title: 'Czego potrzebujesz?',
      lead: 'Wybierz jedno. Nie wiesz? Zaznacz ostatni kafelek.',
    },
    ind: {
      label: 'Branża',
      title: 'Jaka to firma?',
      lead: 'Dopasujemy podgląd, możliwości i podpowiedzi do branży.',
    },
    have: {
      label: 'Co już masz',
      title: 'Co już masz?',
      lead: 'Zaznacz wszystko, co pasuje. Brakujące rzeczy pomożemy przygotować.',
    },
    feat: {
      label: 'Co ma umieć',
      title: 'Co strona ma umieć?',
      lead: 'Najczęstsze możliwości dla tego rodzaju strony i Twojej branży. Szczegóły ustalimy w rozmowie.',
    },
    redo: {
      label: 'Twoja strona',
      title: 'Twoja obecna strona',
      lead: 'Podaj adres, sprawdzimy ją przed rozmową. Zaznacz, co masz.',
    },
    fix: {
      label: 'Co poprawić',
      title: 'Co jest dziś nie tak?',
      lead: 'Zaznacz problemy. Każdy rozwiążemy przy przebudowie.',
    },
    today: {
      label: 'Jak pracujecie',
      title: 'Jak dziś pracujecie?',
      lead: 'Od tego zależy, od czego zaczniemy.',
    },
    sysf: {
      label: 'Co ma robić',
      title: 'Co system ma robić?',
      lead: 'Zaznacz najważniejsze. Zaczniemy od tego, co najbardziej boli.',
    },
    auto: {
      label: 'Co ułatwić',
      title: 'Co ma się dziać samo?',
      lead: 'Zaznacz, co dziś robicie ręcznie.',
    },
    desc: {
      label: 'Opisz',
      title: 'Opisz po swojemu',
      lead: 'Bez nazw technologii. Napisz, co Cię męczy albo co chcesz osiągnąć.',
    },
    res: {
      label: 'Wynik',
      title: 'Gotowe. Wyślij, a odpiszemy z wyceną',
      lead: 'Dokładna cena i termin na piśmie w 1 dzień roboczy. Możesz dopisać, o co Ci chodzi.',
    },
  },
  options: {
    have: opts(
      ['domena', 'Domena'],
      ['logo', 'Logo'],
      ['zdjecia', 'Zdjęcia'],
      ['teksty', 'Teksty'],
      ['stara-strona', 'Stara strona'],
      ['zero', 'Zaczynamy od zera'],
    ),
    featByType: {
      wizytowka: opts(
        ['telefon', 'Telefon i formularz'],
        ['mapa', 'Mapa i godziny'],
        ['opinie', 'Opinie z Google'],
        ['galeria', 'Galeria zdjęć'],
      ),
      firmowa: opts(
        ['oferta', 'Oferta na podstronach'],
        ['realizacje', 'Realizacje i opinie'],
        ['wycena', 'Formularz wyceny'],
        ['blog', 'Blog lub aktualności'],
        ['jezyki', 'Wersje językowe'],
      ),
      rozbudowana: opts(
        ['poradnik', 'Blog i poradnik'],
        ['jezyki', 'Wersje językowe'],
        ['role', 'Role w panelu'],
        ['wyszukiwarka', 'Wyszukiwarka'],
        ['strefa', 'Strefa dla klientów'],
      ),
      landing: opts(
        ['google', 'Kampania w Google'],
        ['facebook', 'Kampania na Facebooku'],
        ['kalkulator', 'Kalkulator lub formularz'],
        ['pytania', 'Opinie i pytania'],
      ),
    },
    redo: opts(
      ['domena', 'Mam dostęp do domeny'],
      ['tresci', 'Mam treści do przeniesienia'],
      ['logo', 'Mam logo i zdjęcia'],
      ['dostepy', 'Nie wiem, kto ma dostępy'],
    ),
    fix: opts(
      ['wolna', 'Wolno się ładuje'],
      ['telefon', 'Źle wygląda na telefonie'],
      ['google', 'Nikt nie dzwoni z Google'],
      ['tresci', 'Trudno zmienić treści'],
      ['wyglad', 'Przestarzały wygląd'],
      ['bezpieczenstwo', 'Boję się o bezpieczeństwo'],
    ),
    today: opts(
      ['excel', 'Excel i arkusze'],
      ['papier', 'Papier i zeszyt'],
      ['program', 'Gotowy program, który nie wystarcza'],
      ['maile', 'Maile i telefony'],
      ['start', 'Dopiero zaczynamy'],
    ),
    sysf: opts(
      ['zamowienia', 'Zamówienia i zlecenia'],
      ['klienci', 'Klienci i oferty'],
      ['kalendarz', 'Kalendarz i rezerwacje'],
      ['czas', 'Czas pracy'],
      ['magazyn', 'Magazyn i stany'],
      ['faktury', 'Faktury do programu'],
      ['raporty', 'Raporty dla szefa'],
      ['aplikacja', 'Aplikacja dla pracowników'],
    ),
    sizes: opts(
      ['1-3', '1–3 osoby'],
      ['4-10', '4–10 osób'],
      ['11-30', '11–30 osób'],
      ['30-plus', 'ponad 30 osób'],
    ),
    auto: opts(
      ['sms', 'SMS-y i e-maile do klientów'],
      ['faktury', 'Faktury bez przepisywania'],
      ['raporty', 'Raporty dla szefa'],
      ['ai', 'Odpowiedzi AI na zapytania'],
      ['platnosci', 'Przypomnienia o płatnościach'],
    ),
    prog: opts(
      ['faktury', 'Subiekt lub inny program do faktur'],
      ['excel', 'Excel'],
      ['poczta', 'Gmail lub Outlook'],
      ['system', 'Własny system'],
      ['nie-wiem', 'Nie wiem'],
    ),
    desc: opts(
      ['brak-strony', 'Nie mamy strony'],
      ['excel', 'Wszystko jest w Excelu'],
      ['strona', 'Strona nic nie daje'],
      ['informatyk', 'Informatyk zniknął'],
      ['przepisywanie', 'Za dużo przepisywania'],
      ['start', 'Nie wiem, od czego zacząć'],
    ),
  },
  exclusive: { have: 'zero' },
  industries: SOFTWARE_INDUSTRIES.map((industry) => ({
    key: industry.key,
    name: industry.name,
    icon: industry.icon,
    site: industry.site,
    system: industry.system,
    // aurora.js: the first 2 features of the industry join „Co ma umieć” (not for „Inna firma”).
    features:
      industry.key === 'inna'
        ? []
        : industry.features
            .slice(0, 2)
            .map((label, i) => ({ id: `${industry.key}-${i + 1}`, label })),
  })),
  tips: [
    {
      when: { groups: ['site'], has: { have: ['zero'] } },
      text: 'Zaczynamy od zera? Pomożemy z domeną, logo i tekstami. Ustalimy to na krótkiej rozmowie.',
    },
    {
      when: { groups: ['site'], picked: ['have'], lacks: { have: ['teksty'] } },
      text: 'Nie masz tekstów? Napiszemy je po 20-minutowej rozmowie o Twojej firmie.',
    },
    {
      when: { types: ['wizytowka', 'firmowa'], industries: ['nocleg'] },
      text: 'Dla obiektu noclegowego kluczowe jest zapytanie o termin bez prowizji portalu. Dodamy je.',
    },
    {
      when: { types: ['landing'] },
      text: 'Landing najlepiej działa z kampanią reklamową. Pomożemy ją ustawić i policzyć zgłoszenia.',
    },
    {
      when: { groups: ['site'] },
      text: 'W cenie każdej strony: wersja na telefon, podstawowe SEO, panel po polsku, SSL i szybkość poniżej 2,5 s.',
    },
    {
      when: { groups: ['redo'], has: { fix: ['google'] } },
      text: 'Zaczniemy od darmowego audytu: sprawdzimy, dlaczego Google nie przyprowadza klientów.',
    },
    {
      when: { groups: ['redo'], has: { redo: ['dostepy'] } },
      text: 'Spokojnie, to częste. Odzyskamy dostęp do domeny i serwera, zanim cokolwiek zmienimy.',
    },
    {
      when: { groups: ['redo'] },
      text: 'Stare adresy przekierujemy na nowe, więc nie stracisz pozycji w Google.',
    },
    {
      when: { groups: ['sys'], has: { today: ['program'] } },
      text: 'Najpierw sprawdzimy, czy Twój program da się rozbudować. Czasem to taniej niż nowy system.',
    },
    {
      when: { groups: ['sys'], sizes: ['1-3'] },
      text: 'Na start wystarczy jeden moduł. Kolejne dołożymy, gdy firma urośnie.',
    },
    {
      when: { groups: ['sys'] },
      text: 'Zaczynamy od modułu, który najbardziej boli. Działa po 2–3 tygodniach, płacisz po odbiorze.',
    },
    {
      when: { groups: ['auto'], has: { auto: ['ai'] } },
      text: 'Asystent AI tylko szykuje odpowiedzi. Nic nie wychodzi bez Twojego kliknięcia.',
    },
    {
      when: { groups: ['auto'] },
      text: 'Najpierw testujemy na Twoich danych. Każda wiadomość i faktura ma historię.',
    },
    {
      when: { groups: ['idk'] },
      text: 'Nie musisz znać nazw. Opisz, co Cię męczy. Powiemy uczciwie, co się opłaca. Czasem: nic nie budować.',
    },
    { text: 'Po 5–7 dniach klikasz podgląd. Dopiero wtedy decydujesz, czy ruszamy.' },
  ],
  preview: [
    { when: { groups: ['redo'] }, kind: 'before', variant: 'przebudowa' },
    { when: { groups: ['sys'] }, kind: 'dash', variant: 'zamowienia', fromIndustry: 'system' },
    { when: { groups: ['auto'], has: { auto: ['ai'] } }, kind: 'flow', variant: 'ai' },
    { when: { groups: ['auto'], has: { auto: ['faktury'] } }, kind: 'flow', variant: 'faktury' },
    { when: { groups: ['auto'], has: { auto: ['raporty'] } }, kind: 'flow', variant: 'raporty' },
    { when: { groups: ['auto'] }, kind: 'flow', variant: 'sms' },
    { when: { types: ['landing'] }, kind: 'site', variant: 'landing' },
    { when: { anyIndustry: true }, kind: 'site', variant: 'firmowa', fromIndustry: 'site' },
    { when: { types: ['wizytowka'] }, kind: 'site', variant: 'wizytowka' },
    { when: { types: ['rozbudowana'] }, kind: 'site', variant: 'rozbudowana' },
    { kind: 'site', variant: 'firmowa' },
  ],
  inPrice: {
    title: 'W cenie każdej strony',
    items: [
      'wersja na telefon',
      'podstawowe SEO',
      'panel po polsku',
      'certyfikat SSL',
      'szybkość poniżej 2,5 s',
    ],
  },
  summary: {
    type: 'Rodzaj',
    industry: 'Branża',
    have: 'Masz już',
    feat: 'Ma umieć',
    redo: 'Twoja strona',
    fix: 'Do poprawy',
    today: 'Dziś',
    sysf: 'System ma',
    size: 'Użytkownicy',
    auto: 'Automaty',
    prog: 'Programy',
    desc: 'Temat',
    url: 'Adres strony',
  },
  ui: {
    eyebrow: 'Kreator · 60 sekund',
    title: 'Policz swój projekt.',
    em: 'Bez dzwonienia.',
    lead: 'Pytamy tylko o to, co ważne dla Twojego wyboru. Cena i podpowiedź zmieniają się na żywo. Resztę napiszesz po swojemu.',
    back: '← Wstecz',
    skip: 'Pomiń',
    next: 'Dalej →',
    showResult: 'Pokaż wynik →',
    restart: 'Zacznij od nowa',
    stepsLabel: 'Kroki kreatora',
    live: 'Twój projekt na żywo',
    stepOf: 'krok {n} z {m}',
    tipLabel: 'Podpowiedź',
    fullOffer: 'Zobacz pełną ofertę →',
    sizeQ: 'Ile osób będzie z niego korzystać?',
    progQ: 'Z jakich programów korzystacie?',
    descPick: 'Albo kliknij, co pasuje:',
    descPlaceholder: 'Np. zamówienia przychodzą mailem i ciągle coś ginie…',
    urlLabel: 'Adres obecnej strony',
    urlPlaceholder: 'np. twojafirma.pl',
  },
  page: {
    eyebrow: 'Kreator wyceny · 60 sekund',
    title: 'Zobacz cenę i termin,',
    em: 'zanim zadzwonisz.',
    lead: 'Kilka kliknięć dopasowanych do tego, co wybierzesz. Bez rejestracji i bez dodatków na siłę. Kontakt zostawiasz tylko wtedy, gdy chcesz wycenę na piśmie.',
    stepsEyebrow: 'Co dalej po wysłaniu',
    stepsTitle: 'Cztery kroki do startu',
    steps: [
      { title: 'Odpowiadamy', text: 'W 1 dzień roboczy dzwonimy albo odpisujemy, jak wolisz.' },
      { title: 'Krótka rozmowa', text: '30 minut u Ciebie w firmie, w Rabce-Zdroju albo online.' },
      {
        title: 'Podgląd i wycena',
        text: 'Po 5–7 dniach klikasz podgląd. Wycena na piśmie, ważna 30 dni.',
      },
      {
        title: 'Ty decydujesz',
        text: '30% po podpisaniu umowy, reszta po odbiorze albo po etapach.',
      },
    ],
  },
  send: {
    noteLabel: 'Coś jeszcze? Napisz po swojemu',
    notePlaceholder: 'Twoje słowa: co jest najważniejsze, termin, pytania…',
    name: { label: 'Imię i nazwa firmy', placeholder: 'Imię i nazwa firmy' },
    contact: {
      label: 'E-mail albo telefon',
      placeholder: 'E-mail albo telefon',
      error: 'Wpisz telefon albo adres e-mail.',
    },
    errors: { consent: 'Zaznacz zgodę, bez niej nie możemy odpowiedzieć.' },
    button: 'Wyślij do wyceny →',
    messageTemplate: 'Kreator: {rodzaj}',
  },
  priceDisplay: PRICE_DISPLAY,
}

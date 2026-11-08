import type { Payload } from 'payload'

import { THEME_STORAGE_KEY } from '../../lib/brand/theme'
import { PROMO_CLOSED_KEY } from '../../lib/site/promo'
import { PROJECT_KEY } from '../../lib/software/project'
import type { SwLegalBlock } from '../../payload-types'
import { h2, p, richText, ul } from '../biznes/lexical'

import { upsertSoftwarePage, type PageBlock } from './page'

type Count = (name: string, result: boolean | 'updated') => void

export const SOFTWARE_PRIVACY_SLUG = 'polityka-prywatnosci'
export const SOFTWARE_TERMS_SLUG = 'regulamin'

const EMAIL = 'kontakt@prokomsoftware.pl'
const PHONE = '883 200 151'
const mail = { text: EMAIL, href: `mailto:${EMAIL}` }
const tel = { text: PHONE, href: 'tel:+48883200151' }

// TODO(krystian): [SZEF/prawnik] data obowiązywania wszystkich czterech tekstów = data akceptacji
// (ta sama idzie do nowej wersji klauzuli zgody w `lib/inquiry/consent.ts`). Do tego czasu
// „listopad 2026” z planszy i baner „Wersja robocza” poza produkcją (pole `draft`).
const UPDATED = 'listopad 2026'

type Row = [string, string, string?, string?]

/**
 * A `legalTable` block node inside the text. The id only has to be unique within the text; a fixed
 * one per table keeps the printed JSON (`pnpm software:pages-json`) the same between runs.
 */
const table = (id: string, caption: string, heads: string[], rows: Row[]) => ({
  type: 'block',
  version: 2,
  format: '',
  fields: {
    id,
    blockName: '',
    blockType: 'legalTable',
    caption,
    head1: heads[0],
    head2: heads[1],
    head3: heads[2] ?? '',
    head4: heads[3] ?? '',
    rows: rows.map(([c1, c2, c3, c4], index) => ({
      id: `${id}${String(index).padStart(2, '0')}`,
      c1,
      c2,
      c3: c3 ?? '',
      c4: c4 ?? '',
    })),
  },
})

const note = (id: string, text: string) => ({
  type: 'block',
  version: 2,
  format: '',
  fields: { id, blockName: '', blockType: 'legalNote', text },
})

// TODO(krystian): [SZEF/prawnik] PROJEKT polityki prywatności v24 (TRESCI-v24 `p_polityka`,
// PRZEKAZANIE-v24 §7) — do akceptacji przed produkcją. Do potwierdzenia: okres przechowywania
// zapytań (propozycja 12 miesięcy) i logów serwera (propozycja 30 dni), „serwer w Polsce”
// (ADR-002), brak inspektora ochrony danych, biuro rachunkowe jako odbiorca. Zdanie planszy o
// „drugim składniku logowania” do panelu pominięte — panel go dziś nie ma.
const PRIVACY = [
  h2('Administrator danych'),
  p(
    'Administratorem Twoich danych osobowych jest ',
    { bold: 'PRO-KOM Tadeusz Wójciak, ul. Orkana 16B, 34-700 Rabka-Zdrój, NIP 7352511447' },
    ' (dalej: „PRO-KOM”, „my”). Strona prokomsoftware.pl to jedna z linii firmy PRO-KOM.',
  ),
  p(
    'W sprawach danych osobowych napisz na ',
    mail,
    ', zadzwoń pod ',
    tel,
    ' albo wyślij list na adres firmy. Nie wyznaczyliśmy inspektora ochrony danych — nie mamy takiego obowiązku.',
  ),
  h2('Jakie dane zbieramy'),
  p('Zbieramy tylko to, co jest potrzebne, żeby odpowiedzieć na Twoją sprawę:'),
  ul(
    [
      { bold: 'formularz kontaktowy, kreator wyceny, zgłoszenie audytu' },
      ' — imię, nazwa firmy, telefon lub e-mail, treść wiadomości, wybrane opcje i lista „Twój projekt”, adres Twojej strony (przy audycie);',
    ],
    [{ bold: 'rozmowa telefoniczna i e-mail' }, ' — dane, które sam nam podasz;'],
    [{ bold: 'umowa' }, ' — dane firmy potrzebne do umowy i faktury;'],
    [
      { bold: 'dane techniczne' },
      ' — logi serwera (adres IP, data i godzina, typ przeglądarki), potrzebne do bezpieczeństwa strony. Ochrona przed spamem trzyma w pamięci skrót adresu IP, nie sam adres, i nie zapisuje go przy wiadomości.',
    ],
  ),
  note(
    'a1b2c3d4e5f6a7b8c9d0e101',
    'Nie prosimy o dane wrażliwe. Nie wpisuj w formularzu haseł, numerów kart ani danych zdrowotnych.',
  ),
  h2('Po co i na jakiej podstawie'),
  table(
    'a1b2c3d4e5f6a7b8c9d0e102',
    'Cele i podstawy prawne przetwarzania danych',
    ['Cel', 'Podstawa prawna (RODO)'],
    [
      [
        'Odpowiedź na zapytanie, przygotowanie wyceny i podglądu',
        'art. 6 ust. 1 lit. b — działania przed zawarciem umowy, na Twoje żądanie; przy kontaktach firmowych także lit. f',
      ],
      ['Zawarcie i wykonanie umowy, opieka po wdrożeniu', 'art. 6 ust. 1 lit. b'],
      ['Faktury i obowiązki księgowe', 'art. 6 ust. 1 lit. c — obowiązek prawny'],
      ['Ustalenie i dochodzenie roszczeń', 'art. 6 ust. 1 lit. f — prawnie uzasadniony interes'],
      [
        'Bezpieczeństwo strony i statystyki bez cookies',
        'art. 6 ust. 1 lit. f — prawnie uzasadniony interes',
      ],
    ],
  ),
  h2('Komu przekazujemy dane'),
  p(
    'Twoich danych nie sprzedajemy i nie przekazujemy do celów marketingowych innych firm. Dostęp mogą mieć wyłącznie podmioty, które pomagają nam prowadzić stronę i firmę — na podstawie umów powierzenia:',
  ),
  ul(
    ['dostawca serwera — dane są przechowywane na serwerze w Polsce;'],
    ['dostawca poczty e-mail;'],
    ['dostawca miejsca na zaszyfrowane kopie zapasowe;'],
    ['biuro rachunkowe — przy umowach i fakturach;'],
    ['organy publiczne — tylko gdy wymaga tego prawo.'],
  ),
  p('Nie przekazujemy danych poza Europejski Obszar Gospodarczy.'),
  h2('Jak długo przechowujemy dane'),
  // TODO(krystian): [SZEF] okresy „12 miesięcy” i „do 30 dni” to propozycje (PRZEKAZANIE-v24 §7) —
  // potwierdzić przed produkcją; dziś panel nie usuwa zapytań sam (usuwamy ręcznie).
  table(
    'a1b2c3d4e5f6a7b8c9d0e103',
    'Okresy przechowywania danych',
    ['Dane', 'Okres'],
    [
      ['Zapytania bez umowy', '12 miesięcy od ostatniego kontaktu, potem usuwamy je z panelu'],
      [
        'Umowy i korespondencja projektowa',
        'przez czas umowy i do upływu terminu przedawnienia roszczeń',
      ],
      [
        'Faktury i dokumenty księgowe',
        '5 lat od końca roku, w którym minął termin płatności podatku',
      ],
      ['Logi serwera', 'do 30 dni'],
    ],
  ),
  p(
    'Kopie zapasowe są szyfrowane i rotowane — usunięte dane znikają z nich najpóźniej po około 3 miesiącach.',
  ),
  h2('Twoje prawa'),
  p('Masz prawo do:'),
  ul(
    ['dostępu do swoich danych i otrzymania ich kopii (art. 15 RODO);'],
    ['sprostowania danych (art. 16);'],
    ['usunięcia danych (art. 17);'],
    ['ograniczenia przetwarzania (art. 18);'],
    ['przenoszenia danych (art. 20);'],
    ['sprzeciwu wobec przetwarzania na podstawie uzasadnionego interesu (art. 21).'],
  ),
  p(
    'Wystarczy wiadomość na ',
    mail,
    '. Odpowiemy bez zbędnej zwłoki, najpóźniej w ciągu miesiąca.',
  ),
  p(
    'Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa, ',
    { text: 'uodo.gov.pl', href: 'https://uodo.gov.pl' },
    ').',
  ),
  h2('Czy musisz podać dane'),
  p(
    'Nie. Podanie danych jest dobrowolne, ale bez telefonu albo e-maila nie będziemy mogli odpowiedzieć na zapytanie. Do zawarcia umowy potrzebne są dane firmy.',
  ),
  h2('Decyzje automatyczne'),
  p(
    'Nie podejmujemy wobec Ciebie decyzji opartych wyłącznie na automatycznym przetwarzaniu i nie profilujemy. Kreator wyceny pokazuje orientacyjną cenę — to podpowiedź, nie decyzja. Wiążąca jest wycena na piśmie.',
  ),
  h2('Statystyki i pliki cookies'),
  p(
    'Do statystyk używamy narzędzia ',
    { bold: 'Umami' },
    ' uruchomionego na naszym serwerze. Nie zapisuje plików cookies i nie łączy wizyt z konkretną osobą — liczy odsłony, źródło wejścia i typ urządzenia. Szczegóły: ',
    { text: 'Pliki cookies', href: '/cookies' },
    '.',
  ),
  h2('Bezpieczeństwo'),
  ul(
    ['połączenie szyfrowane (HTTPS) na całej stronie;'],
    ['kopie zapasowe co noc, szyfrowane i trzymane poza serwerem;'],
    ['panel administracyjny tylko dla upoważnionych osób, na osobnym adresie;'],
    ['ochrona formularzy przed spamem bez zewnętrznych usług.'],
  ),
  h2('Zmiany polityki'),
  p(
    'Gdy zmienimy sposób przetwarzania danych, zaktualizujemy tę stronę i datę na górze. Poprzednie wersje udostępnimy na prośbę.',
  ),
]

// TODO(krystian): [SZEF/prawnik] PROJEKT regulaminu (art. 8 UŚUDE, TRESCI-v24 `p_regulamin`) — do
// akceptacji przed produkcją; „Raport w 2 dni robocze” = obietnica `/audyt`.
const TERMS = [
  h2('Postanowienia ogólne'),
  p(
    'Regulamin określa zasady świadczenia usług drogą elektroniczną w serwisie prokomsoftware.pl (dalej: „Strona”). Usługodawcą jest ',
    { bold: 'PRO-KOM Tadeusz Wójciak, ul. Orkana 16B, 34-700 Rabka-Zdrój, NIP 7352511447' },
    '.',
  ),
  p(
    'Regulamin wydajemy na podstawie art. 8 ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną. Korzystając ze Strony, akceptujesz Regulamin.',
  ),
  h2('Usługi na Stronie'),
  p('Na Stronie bezpłatnie udostępniamy:'),
  ul(
    ['przeglądanie treści, oferty i podglądów projektów;'],
    ['formularz kontaktowy;'],
    ['kreator wyceny — orientacyjna cena i termin;'],
    ['zgłoszenie darmowego audytu strony;'],
    ['wyszukiwarkę i listę „Twój projekt”.'],
  ),
  p(
    'Usługi świadczymy do czasu, aż przestaniesz z nich korzystać — np. zamkniesz stronę albo wyślesz zgłoszenie.',
  ),
  h2('Wymagania techniczne'),
  ul(
    ['urządzenie z dostępem do internetu;'],
    ['aktualna przeglądarka z włączonym JavaScriptem;'],
    ['adres e-mail albo numer telefonu, jeśli chcesz, żebyśmy odpowiedzieli.'],
  ),
  h2('Zasady korzystania'),
  p(
    'Nie wolno przesyłać przez Stronę treści bezprawnych, obraźliwych, spamu ani wysyłać zgłoszeń automatycznie. Zgłoszenia, które naruszają te zasady, możemy pominąć.',
  ),
  h2('Wyceny i cennik'),
  p(
    'Ceny w cenniku i w kreatorze są orientacyjne i podajemy je netto, chyba że zaznaczono inaczej. Nie są ofertą w rozumieniu art. 66 Kodeksu cywilnego. Wiążące są tylko: wycena na piśmie i umowa.',
  ),
  h2('Darmowy audyt'),
  p(
    'Darmowy audyt to bezpłatna, wstępna ocena Twojej strony. Raport wysyłamy w 2 dni robocze od zgłoszenia. Audyt nie zobowiązuje do zamówienia. Płatne rodzaje audytu wykonujemy na podstawie osobnego zamówienia.',
  ),
  h2('Reklamacje'),
  p(
    'Uwagi i reklamacje dotyczące działania Strony wyślij na ',
    mail,
    '. Opisz problem i podaj, jak się z Tobą skontaktować. Odpowiemy w ciągu 14 dni.',
  ),
  h2('Dane osobowe'),
  p(
    'Zasady przetwarzania danych opisuje ',
    { text: 'Polityka prywatności', href: `/${SOFTWARE_PRIVACY_SLUG}` },
    '.',
  ),
  h2('Postanowienia końcowe'),
  p(
    'Oferta PRO-KOM Software jest skierowana do przedsiębiorców i instytucji. Przedsiębiorcy prowadzący jednoosobową działalność, dla których umowa nie ma charakteru zawodowego, korzystają z ochrony przewidzianej dla konsumentów w zakresie wskazanym w przepisach.',
  ),
  p(
    'W sprawach nieuregulowanych stosuje się prawo polskie. O zmianach Regulaminu poinformujemy na tej stronie, z nową datą wersji.',
  ),
]

// TODO(krystian): [SZEF/prawnik] PROJEKT strony cookies (D2-1b, TRESCI-v24 `p_cookies`): tabela =
// wszystkie zapisy przeglądarki linii (`lib/brand/theme.ts`, `lib/software/project.ts`,
// `lib/site/promo.ts`, szyna `SiteRail`). „Ostatnio oglądane” (`pk-recent-*`) jest wyłączone
// (`CompanyData.recentlyViewed`) — po włączeniu dopisać. Sprawdzać przy każdym nowym kluczu.
const COOKIES = [
  h2('W skrócie'),
  p(
    'Pliki cookies to małe pliki zapisywane w przeglądarce. Podobną rolę pełni pamięć przeglądarki (localStorage). Strona nie ustawia cookies — ani własnych, ani analitycznych czy reklamowych — dlatego nie prosimy o zgodę. Poniżej wymieniamy wszystko, co zapisuje w pamięci przeglądarki.',
  ),
  h2('Co zapisujemy'),
  table(
    'a1b2c3d4e5f6a7b8c9d0e201',
    'Zapisy strony w przeglądarce',
    ['Nazwa', 'Po co', 'Jak długo', 'Rodzaj'],
    [
      [
        THEME_STORAGE_KEY,
        'pamięta wybrany motyw: jasny albo ciemny',
        'do usunięcia w przeglądarce',
        'pamięć przeglądarki, niezbędna',
      ],
      [
        PROJECT_KEY,
        'lista rozwiązań dodanych do „Twój projekt”',
        'do usunięcia w przeglądarce',
        'pamięć przeglądarki, niezbędna',
      ],
      [
        PROMO_CLOSED_KEY,
        'pamięta, że zamknąłeś pasek z kampanią',
        'do usunięcia w przeglądarce',
        'pamięć przeglądarki, niezbędna',
      ],
      [
        'pk-rail-home, pk-rail-pulse',
        'stan bocznej szyny nawigacji w tej karcie',
        'do zamknięcia karty',
        'pamięć sesji, niezbędna',
      ],
      [
        'sesja panelu',
        'logowanie pracowników PRO-KOM do panelu — tylko na domenie panelu',
        'do wylogowania',
        'cookie niezbędne',
      ],
    ],
  ),
  h2('Statystyki bez cookies'),
  p(
    'Używamy narzędzia Umami na naszym serwerze. Nie zapisuje niczego na Twoim urządzeniu i nie rozpoznaje Cię przy kolejnej wizycie. Widzimy tylko zbiorcze liczby: odsłony, źródło wejścia, typ urządzenia.',
  ),
  h2('Treści zewnętrzne'),
  p(
    'Mapa na Stronie jest grafiką. Mapy Google otwierają się dopiero po kliknięciu „Wyznacz trasę” — wtedy obowiązują zasady Google. Nie ładujemy fontów ani skryptów z zewnętrznych serwerów.',
  ),
  h2('Jak usunąć zapisane dane'),
  p(
    'Zapisane dane usuniesz w ustawieniach przeglądarki: Prywatność → Usuń dane witryn. Strona będzie działać dalej — zapomni tylko motyw i listę „Twój projekt”. Jak przetwarzamy dane z formularzy, opisuje ',
    { text: 'polityka prywatności', href: `/${SOFTWARE_PRIVACY_SLUG}` },
    '.',
  ),
]

// TODO(krystian): [SZEF] PROJEKT deklaracji dostępności (D2-1b, TRESCI-v24 `p_dostepnosc`): tylko to,
// co sprawdza repo (axe w CI, `docs/jakosc.md`, `motion.css`, motyw jasny/ciemny).
const ACCESSIBILITY = [
  h2('Standard'),
  p(
    'Projektujemy i budujemy Stronę zgodnie z wytycznymi ',
    { bold: 'WCAG 2.1 na poziomie AA' },
    '. Zgodność sprawdzamy testami automatycznymi (axe, Lighthouse) przy każdej zmianie oraz ręcznie — klawiaturą i czytnikiem ekranu.',
  ),
  h2('Co zrobiliśmy'),
  ul(
    ['kontrast tekstu co najmniej 4,5 : 1 w trybie jasnym i ciemnym;'],
    ['pełna obsługa klawiaturą i widoczny fokus;'],
    ['struktura nagłówków i opisy obrazów dla czytników ekranu;'],
    ['etykiety pól i czytelne komunikaty błędów w formularzach;'],
    ['powiększanie tekstu do 200% bez utraty treści;'],
    ['ograniczenie animacji, gdy w systemie włączysz „Ogranicz ruch”;'],
    ['tryb jasny i ciemny do wyboru.'],
  ),
  h2('Znane ograniczenia'),
  p(
    'Podglądy projektów w nagłówku strony głównej są ilustracją — tę samą informację podajemy obok w tekście. Jeśli trafisz na inną barierę, daj nam znać.',
  ),
  h2('Zgłoś barierę'),
  p(
    'Napisz na ',
    mail,
    ' albo zadzwoń pod ',
    tel,
    '. Opisz, na jakiej stronie i co nie działa. Odpowiemy w 1 dzień roboczy i poprawimy to możliwie szybko.',
  ),
  h2('Dostępność salonu'),
  p(
    'Biuro i salon PRO-KOM: ul. Orkana 16B, 34-700 Rabka-Zdrój, pn–pt 9:00–17:00. Jeśli potrzebujesz pomocy przy wejściu albo wolisz spotkanie u siebie lub online — zadzwoń, umówimy się.',
  ),
]

type LegalPage = {
  slug: string
  title: string
  heading: string
  lead: string
  /** Empty: no version badge (cookies and accessibility on the boards). */
  version: string
  eyebrow: string
  body: object[]
}

const PAGES: LegalPage[] = [
  {
    slug: SOFTWARE_PRIVACY_SLUG,
    title: 'Polityka prywatności',
    eyebrow: 'Informacje prawne · RODO',
    heading: 'Polityka **prywatności.**',
    lead: 'Kto przetwarza Twoje dane, po co, jak długo i jakie masz prawa. Napisane możliwie prosto — bez prawniczego żargonu tam, gdzie się da.',
    version: '1.0',
    body: PRIVACY,
  },
  {
    slug: SOFTWARE_TERMS_SLUG,
    title: 'Regulamin',
    eyebrow: 'Informacje prawne',
    heading: 'Regulamin **strony.**',
    lead: 'Zasady korzystania z prokomsoftware.pl: formularzy, kreatora wyceny i zgłoszeń darmowego audytu.',
    version: '1.0',
    body: TERMS,
  },
  {
    slug: 'cookies',
    title: 'Pliki cookies',
    eyebrow: 'Informacje prawne',
    heading: 'Pliki **cookies.**',
    lead: 'Krótko: nie śledzimy Cię. Nie używamy cookies reklamowych ani Google Analytics, dlatego nie zobaczysz u nas banera zgód.',
    version: '',
    body: COOKIES,
  },
  {
    slug: 'dostepnosc',
    title: 'Deklaracja dostępności',
    eyebrow: 'Informacje prawne',
    heading: 'Deklaracja **dostępności.**',
    lead: 'Chcemy, żeby z prokomsoftware.pl wygodnie korzystał każdy — także na telefonie, z klawiatury, z czytnikiem ekranu albo przy słabszym wzroku.',
    version: '',
    body: ACCESSIBILITY,
  },
]

/** The `swLegal` block of a legal page (one block = the whole page). */
function legalBlock(page: LegalPage): SwLegalBlock & { blockType: 'swLegal' } {
  return {
    blockType: 'swLegal',
    eyebrow: page.eyebrow,
    heading: page.heading,
    lead: page.lead,
    version: page.version,
    updated: UPDATED,
    draft: true,
    askTitle: 'Masz pytanie o dane?',
    askText: 'Napisz albo zadzwoń — odpowiemy w 1 dzień roboczy.',
    body: richText<SwLegalBlock['body']>(page.body),
  }
}

/** Legal pages of Software v24 — slug, title and layout, as the seed and `pages-json` use them. */
export const SOFTWARE_LEGAL_PAGES = PAGES.map((page) => ({
  slug: page.slug,
  title: page.title,
  layout: (): PageBlock[] => [legalBlock(page)],
}))

/**
 * Creates the published legal drafts of the tenant — privacy, terms, cookies, accessibility. A
 * page without the `swLegal` block (the v23 `hero` + `richText` drafts) is replaced; a page that
 * has it stays as edited in the panel.
 */
export async function seedSoftwareLegal(payload: Payload, tenantId: number, count: Count) {
  for (const page of SOFTWARE_LEGAL_PAGES) {
    await upsertSoftwarePage(payload, tenantId, { ...page, block: 'swLegal' }, count)
  }
}

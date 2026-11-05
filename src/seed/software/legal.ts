import type { Payload } from 'payload'

import type { RichTextBlock } from '../../payload-types'
import { h2, p, richText, ul } from '../biznes/lexical'

import { SOFTWARE_CONTACT } from './map'
import { upsertSoftwarePage, type PageBlock } from './page'

type Count = (name: string, result: boolean | 'updated') => void

export const SOFTWARE_PRIVACY_SLUG = 'polityka-prywatnosci'

// TODO(krystian): [SZEF/prawnik] DRAFT of the Software privacy policy (spec. §6.11, §13 pkt 24):
// the board `Polityka` plus the technical facts of the Biznes draft (`src/seed/biznes/legal.ts`:
// IP hash of the spam limiter, Nginx log, backups up to ~3 months). Placeholders in brackets stay
// visible on purpose (the draft notice asks to fill them): [E-MAIL SOFTWARE], [OKRES
// PRZECHOWYWANIA], [DATA AKTUALIZACJI]. To confirm: „serwery w Polsce” (ADR-002 „przyjęta
// wstępnie”), Umami for statistics (ADR-020), the accounting office as a recipient, legal
// bases. No newsletter (v21). The board's trust chips („Serwery w Polsce”, „Statystyki bez
// cookies”, „Bez sprzedaży danych”) are left out until these sentences are approved — the hero
// block has no chips; the RODO table is a list (the text editor has no tables). Approving the text means a new consent clause version as well
// (`lib/inquiry/consent.ts`).
const PRIVACY = [
  h2('Kto jest administratorem'),
  p(
    'Administratorem Twoich danych osobowych jest ',
    { bold: 'PRO-KOM Tadeusz Wójciak' },
    ', ul. Orkana 16B, 34-700 Rabka-Zdrój, NIP 7352511447 (dalej: „my”).',
  ),
  p(
    'We wszystkich sprawach dotyczących danych osobowych napisz na ',
    { bold: '[E-MAIL SOFTWARE]' },
    ' albo listownie na adres firmy z dopiskiem „Dane osobowe”.',
  ),
  h2('Jakie dane zbieramy'),
  ul(
    [
      { bold: 'Formularz kontaktowy:' },
      ' imię, telefon lub e-mail, nazwa firmy (jeśli podasz), temat i treść wiadomości, a także lista „Twój projekt”, jeśli wyślesz ją razem z wiadomością.',
    ],
    [
      { bold: 'Kreator „Dobierz rozwiązanie”:' },
      ' Twoje odpowiedzi (czego potrzebujesz, branża, zakres i dodatkowe funkcje). Trafiają do nas dopiero, gdy wyślesz je w formularzu.',
    ],
    [{ bold: 'Darmowy audyt strony:' }, ' adres strony do sprawdzenia, imię i dane kontaktowe.'],
    [{ bold: 'Informacja o zgodzie:' }, ' kiedy ją wyraziłeś i której wersji klauzuli dotyczyła.'],
    [
      { bold: 'Ochrona przed spamem:' },
      ' przy wysyłce formularza strona trzyma w pamięci skrót adresu IP, nie sam adres, i nie zapisuje go przy wiadomości.',
    ],
    [
      { bold: 'Dziennik serwera:' },
      ' adres IP, czas i adres odwiedzonej strony — dla bezpieczeństwa i usuwania awarii; kasowany po zapełnieniu rotowanych plików.',
    ],
  ),
  p(
    'Podanie danych jest dobrowolne, ale bez telefonu lub e-maila nie będziemy mogli odpowiedzieć.',
  ),
  h2('Po co i na jakiej podstawie'),
  ul(
    [
      { bold: 'Odpowiedź na wiadomość, przygotowanie wyceny i oferty' },
      ' — art. 6 ust. 1 lit. b RODO (działania przed zawarciem umowy na Twoje żądanie).',
    ],
    [{ bold: 'Realizacja umowy, jeśli ją zawrzemy' }, ' — art. 6 ust. 1 lit. b RODO.'],
    [{ bold: 'Faktury i obowiązki księgowe' }, ' — art. 6 ust. 1 lit. c RODO (obowiązek prawny).'],
    [
      { bold: 'Kontakt w sprawie podobnych usług, obrona przed roszczeniami, bezpieczeństwo' },
      ' — art. 6 ust. 1 lit. f RODO (nasz prawnie uzasadniony interes).',
    ],
  ),
  h2('Jak długo przechowujemy dane'),
  // TODO(krystian): [SZEF] Jak długo trzymamy wiadomości z formularzy i zgłoszenia, z których nie
  // powstała umowa (np. 12 miesięcy? do końca roku następnego?) — decyzja szefa, nie zgadujemy.
  p(
    'Wiadomości i zgłoszenia, z których nie powstała umowa: ',
    { bold: '[OKRES PRZECHOWYWANIA]' },
    '. Dane z umów i faktur: przez okres wymagany przepisami podatkowymi i rachunkowymi. Kopie zapasowe są szyfrowane i rotowane — usunięte dane znikają z nich najpóźniej po około 3 miesiącach.',
  ),
  h2('Komu przekazujemy dane'),
  p(
    'Nie sprzedajemy danych. Dostęp do nich mogą mieć wyłącznie firmy, które pomagają nam prowadzić stronę i firmę, na podstawie umów powierzenia:',
  ),
  ul(
    ['dostawca hostingu i serwerów w Polsce,'],
    ['dostawca poczty e-mail,'],
    ['dostawca przestrzeni na zaszyfrowane kopie zapasowe,'],
    ['biuro rachunkowe (dane z faktur).'],
  ),
  p('Nie przekazujemy danych poza Europejski Obszar Gospodarczy.'),
  h2('Twoje prawa'),
  ul(
    [{ bold: 'Dostęp' }, ' do swoich danych i kopii (art. 15)'],
    [{ bold: 'Sprostowanie' }, ' błędnych danych (art. 16)'],
    [{ bold: 'Usunięcie' }, ' danych (art. 17)'],
    [{ bold: 'Ograniczenie' }, ' przetwarzania (art. 18)'],
    [{ bold: 'Przeniesienie' }, ' danych (art. 20)'],
    [{ bold: 'Sprzeciw' }, ' wobec przetwarzania (art. 21)'],
  ),
  p(
    'Jeśli uznasz, że przetwarzamy dane niezgodnie z prawem, możesz złożyć skargę do ',
    { bold: 'Prezesa Urzędu Ochrony Danych Osobowych' },
    ' (ul. Stawki 2, 00-193 Warszawa, ',
    { text: 'uodo.gov.pl', href: 'https://uodo.gov.pl' },
    ').',
  ),
  h2('Cookies i statystyki'),
  p(
    'Do statystyk używamy narzędzia ',
    { bold: 'Umami' },
    ', które działa ',
    { bold: 'bez plików cookies' },
    ' i nie śledzi Cię między stronami. Dlatego na tej stronie nie zobaczysz banera z prośbą o zgodę na cookies.',
  ),
  p(
    'Strona zapamiętuje w Twojej przeglądarce tylko wybrany motyw, jasny lub ciemny (',
    { bold: 'pk-theme' },
    '), i listę „Twój projekt” — identyfikatory i nazwy wybranych rozwiązań (',
    { bold: 'pk-project' },
    '). Te dane nie trafiają do nas, dopóki nie wyślesz formularza. Usuniesz je, czyszcząc dane strony w ustawieniach przeglądarki.',
  ),
  h2('Zmiany i kontakt'),
  p(
    'Gdy zmienimy tę politykę, opublikujemy nową wersję na tej stronie z datą aktualizacji. Pytania? Napisz na ',
    { bold: '[E-MAIL SOFTWARE]' },
    ' albo przyjdź do salonu przy ul. Orkana 16B w Rabce-Zdroju.',
  ),
  // TODO(krystian): [SZEF] Od kiedy obowiązuje ta wersja polityki — data akceptacji tekstu przez
  // szefa/prawnika (ta sama data idzie do wersji klauzuli zgody w `lib/inquiry/consent.ts`).
  p('Ostatnia aktualizacja: [DATA AKTUALIZACJI]'),
]

/** Hero and text of `/polityka-prywatnosci` — shared blocks in the Software look (ADR-014 SW0 7). */
export function softwarePrivacyLayout(): PageBlock[] {
  return [
    {
      blockType: 'hero',
      heading: 'Twoje dane. **Krótko i po ludzku.**',
      lead: 'Zbieramy tylko to, czego potrzebujemy, żeby odpowiedzieć na Twoją wiadomość i przygotować wycenę. Bez cookies śledzących i bez sprzedawania danych.',
    },
    { blockType: 'richText', content: richText<RichTextBlock['content']>(PRIVACY) },
  ]
}

// TODO(krystian): [SZEF/prawnik] DRAFT of the Software cookies page (D2-1b, plan F2 pkt 4; spec
// WSPOLNE-ELEMENTY §12): the keys are the only browser storage of the line (`lib/brand/theme.ts`,
// `lib/software/project.ts`, `lib/site/promo.ts`); statistics by Umami without cookies (ADR-020);
// no embeds. Check again whenever a key, an embed or analytics is added.
const COOKIES = [
  p(
    'Strona nie ustawia cookies — ani własnych, ani analitycznych czy reklamowych — i nie osadza treści innych firm (map, filmów, czatów). Dlatego nie prosimy o zgodę na cookies.',
  ),
  h2('Statystyki'),
  p(
    'Ruch na stronie liczymy narzędziem ',
    { bold: 'Umami' },
    ', które działa bez plików cookies, nie zapisuje nic w Twojej przeglądarce i nie śledzi Cię między stronami.',
  ),
  h2('Co zapisujemy w przeglądarce'),
  p(
    'Kilka ustawień trzymamy w pamięci przeglądarki. Zostają na Twoim urządzeniu i nie są wysyłane na serwer, dopóki sam nie wyślesz wiadomości.',
  ),
  ul(
    [{ bold: 'pk-theme' }, ' — wybrany motyw strony: jasny albo ciemny.'],
    [
      { bold: 'pk-project' },
      ' — lista „Twój projekt”: wybrane rozwiązania, żeby nie znikały po odświeżeniu strony.',
    ],
    [
      { bold: 'pk-project-sent' },
      ' — numer wysłanej wiadomości i nazwy rozwiązań, pokazywane na stronie podziękowania; tylko do zamknięcia karty.',
    ],
    [{ bold: 'pk-sz-closed' }, ' — informacja, że zamknąłeś pasek z kampanią.'],
  ),
  h2('Jak to usunąć'),
  p(
    'Dane te usuniesz, czyszcząc dane witryny w ustawieniach przeglądarki. Strona działa też bez nich — motyw i lista „Twój projekt” nie zostaną wtedy zapamiętane.',
  ),
  h2('Dane osobowe'),
  p(
    'Jak przetwarzamy dane z formularzy, opisuje ',
    { text: 'polityka prywatności', href: `/${SOFTWARE_PRIVACY_SLUG}` },
    '.',
  ),
]

// TODO(krystian): [SZEF] DRAFT of the Software accessibility statement (D2-1b, the shared legal bar
// links it on every line): only what the repo checks (axe in CI, docs/jakosc.md, `motion.css`).
const ACCESSIBILITY = [
  p(
    'Chcemy, żeby ze strony wygodnie korzystał każdy — także z czytnikiem ekranu, samą klawiaturą albo w powiększeniu.',
  ),
  h2('Co robimy'),
  ul(
    ['Projektujemy i sprawdzamy stronę według WCAG 2.1 na poziomie AA.'],
    ['Kontrast tekstu spełnia poziom AA w motywie jasnym i ciemnym.'],
    [
      'Całą stronę obsłużysz klawiaturą: fokus jest zawsze widoczny, a okna i menu zamyka klawisz Esc.',
    ],
    ['Obrazy mają teksty alternatywne, a pola formularzy — etykiety.'],
    ['Animacje wyłączają się, gdy w systemie ustawisz ograniczenie ruchu.'],
    ['Każdą zmianę kodu strony sprawdzamy automatycznym testem dostępności (WCAG 2.1 AA).'],
  ),
  h2('Zgłoś problem'),
  p(
    'Coś nie działa albo trudno z tego skorzystać? Napisz na ',
    { text: SOFTWARE_CONTACT.email, href: `mailto:${SOFTWARE_CONTACT.email}` },
    ' — odpowiemy i poprawimy.',
  ),
]

/** Hero and text of a short legal page in the Software look. */
const legalLayout =
  (heading: string, lead: string, content: Parameters<typeof richText>[0]) => (): PageBlock[] => [
    { blockType: 'hero', heading, lead },
    { blockType: 'richText', content: richText<RichTextBlock['content']>(content) },
  ]

const LEGAL_PAGES = [
  {
    slug: SOFTWARE_PRIVACY_SLUG,
    title: 'Polityka prywatności',
    layout: softwarePrivacyLayout,
  },
  {
    slug: 'cookies',
    title: 'Cookies',
    layout: legalLayout(
      'Cookies. **Bez banera, bo bez śledzenia.**',
      'Co strona zapisuje w Twojej przeglądarce i jak to usunąć.',
      COOKIES,
    ),
  },
  {
    slug: 'dostepnosc',
    title: 'Dostępność',
    layout: legalLayout(
      'Dostępność. **Dla każdego.**',
      'Jak dbamy o to, żeby ze strony mógł skorzystać każdy, i jak zgłosić problem.',
      ACCESSIBILITY,
    ),
  },
] as const

/**
 * Creates the published legal drafts of the tenant — privacy, cookies, accessibility (only while a
 * page has no text block; text edited in the panel stays).
 */
export async function seedSoftwareLegal(payload: Payload, tenantId: number, count: Count) {
  for (const page of LEGAL_PAGES) {
    await upsertSoftwarePage(payload, tenantId, { ...page, block: 'richText' }, count)
  }
}

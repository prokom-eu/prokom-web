import type { Payload } from 'payload'

import type { RichTextBlock } from '../../payload-types'
import { h2, p, richText, ul } from '../biznes/lexical'

import { upsertSoftwarePage, type PageBlock } from './page'

type Count = (name: string, result: boolean | 'updated') => void

export const SOFTWARE_PRIVACY_SLUG = 'polityka-prywatnosci'

// TODO(krystian): [SZEF/prawnik] DRAFT of the Software privacy policy (spec. §6.11, §13 pkt 24):
// the board `Polityka` plus the technical facts of the Biznes draft (`src/seed/biznes/legal.ts`:
// IP hash of the spam limiter, Nginx log, backups up to ~3 months). Placeholders in brackets stay
// visible on purpose (the draft notice asks to fill them): [E-MAIL SOFTWARE], [OKRES
// PRZECHOWYWANIA], [DATA AKTUALIZACJI]. To confirm: „serwery w Polsce” (ADR-002 „przyjęta
// wstępnie”), Umami for statistics (ADR-016 in SW12), the accounting office as a recipient, legal
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

/** Creates the published privacy policy draft of the tenant (only while it has no text block). */
export function seedSoftwareLegal(payload: Payload, tenantId: number, count: Count) {
  return upsertSoftwarePage(
    payload,
    tenantId,
    {
      slug: SOFTWARE_PRIVACY_SLUG,
      title: 'Polityka prywatności',
      block: 'richText',
      layout: softwarePrivacyLayout,
    },
    count,
  )
}

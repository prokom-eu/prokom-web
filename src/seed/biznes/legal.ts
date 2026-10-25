import type { Payload } from 'payload'

import type { RichTextBlock } from '../../payload-types'
import { h2, p, richText, ul } from './lexical'
import { upsertBiznesPage } from './page'

type Report = (name: string, changed: boolean) => void

const text = (children: object[]) => ({
  blockType: 'richText' as const,
  content: richText<RichTextBlock['content']>(children),
})

const CONTACT_EMAIL = 'biuro@pro-kom.eu'

// TODO(krystian): [SZEF/prawnik] DRAFT of the privacy policy, built only from facts in the code
// and ADRs: administrator and address (board), form fields (`Inquiries`), the IP hash of the
// app's spam limiter (ADR-003), the Nginx access log with full IPs rotated by size
// (`docker/nginx/nginx.conf`, `docker/compose.proxy.yml`), retention (`INQUIRY_RETENTION_MONTHS`,
// default 24 — open inquiries are not deleted automatically) and backups up to ~3 months
// (ADR-003, S9b-2), no analytics. To confirm before production: legal bases; NIP (spec. §13 pkt 1)
// and the e-mail for data matters (biuro@ or biznes@, ZMIANY-v20 §1.3 — also in `CompanyData`);
// the providers of hosting and mail (Seohost, ADR-002 „przyjęta wstępnie”) and of the off-site
// backups (`docs/runbook.md`, not chosen yet), where they keep data and whether anything leaves
// the EEA; the effective date. Approving the text means a new consent clause version as well
// (`lib/inquiry/consent.ts`).
const PRIVACY = [
  p(
    'Ta polityka opisuje, jak PRO-KOM Tadeusz Wójciak przetwarza dane osobowe osób, które korzystają ze strony i wysyłają zapytania przez formularze.',
  ),
  h2('Administrator danych'),
  p(
    'Administratorem danych jest PRO-KOM Tadeusz Wójciak, ul. Orkana 16B, 34-700 Rabka-Zdrój, NIP 7352511447. W sprawach danych osobowych napisz na ',
    { text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    '.',
  ),
  h2('Jakie dane zbieramy'),
  ul(
    [
      'Dane z formularzy: imię, telefon, e-mail, nazwę firmy i NIP, miejscowość, treść wiadomości, wybrane produkty, tematy i odpowiedzi z kreatora, oczekiwany termin realizacji oraz preferowany sposób kontaktu — tylko te, które podasz.',
    ],
    ['Adres strony, z której wysłano formularz, i parametry kampanii z adresu (utm), jeśli były.'],
    ['Informację o zgodzie: kiedy ją wyraziłeś i której wersji klauzuli dotyczyła.'],
    [
      'Adres IP przy wysyłce formularza — do ochrony przed spamem. Aplikacja trzyma w pamięci jego skrót, nie sam adres, i nie zapisuje go przy zapytaniu.',
    ],
    [
      'Dziennik serwera: przy każdym wejściu na stronę serwer zapisuje adres IP, czas, adres strony i wynik odpowiedzi. Służy bezpieczeństwu i usuwaniu awarii (art. 6 ust. 1 lit. f RODO) i jest kasowany po zapełnieniu rotowanych plików dziennika.',
    ],
  ),
  p('Nie zakładamy kont klientów i nie korzystamy z narzędzi analitycznych ani reklamowych.'),
  h2('Po co i na jakiej podstawie'),
  ul(
    [
      'Odpowiedź na zapytanie i przygotowanie oferty — na podstawie Twojej zgody (art. 6 ust. 1 lit. a RODO) i działań przed zawarciem umowy na Twoje żądanie (art. 6 ust. 1 lit. b RODO).',
    ],
    [
      'Informacje o nowościach i promocjach — tylko jeśli zaznaczysz osobną, dobrowolną zgodę (art. 6 ust. 1 lit. a RODO).',
    ],
  ),
  p(
    'Zgodę możesz wycofać w każdej chwili. Wycofanie nie wpływa na zgodność z prawem przetwarzania, które odbyło się wcześniej.',
  ),
  h2('Jak długo przechowujemy dane'),
  p(
    'Zakończone zapytania usuwamy po 24 miesiącach od ostatniej zmiany ich statusu; zapytania w toku przechowujemy do czasu ich zakończenia. Kopie zapasowe są szyfrowane i rotowane — usunięte dane znikają z nich najpóźniej po około 3 miesiącach.',
  ),
  h2('Komu przekazujemy dane'),
  p(
    'Dane przechowujemy na serwerze dostawcy usług hostingowych, wiadomości e-mail wysyłamy przez naszego dostawcę poczty, a zaszyfrowane kopie zapasowe trzymamy u dostawcy przestrzeni na kopie. Przetwarzają oni dane wyłącznie na nasze zlecenie.',
  ),
  h2('Twoje prawa'),
  p(
    'Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania i przeniesienia oraz prawo sprzeciwu. Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych.',
  ),
  h2('Pamięć przeglądarki i cookies'),
  p(
    'Co strona zapisuje w Twojej przeglądarce, opisujemy na stronie ',
    {
      text: 'Cookies',
      href: '/cookies',
    },
    '.',
  ),
]

// TODO(krystian): [SZEF/prawnik] DRAFT — the keys are the only browser storage of the site
// (`lib/cart/store.ts`, `lib/brand/theme.ts`, `lib/site/promo.ts`); the site sets no cookies.
// Check again whenever a new key, an embed (map, video) or analytics is added (ADR needed).
const COOKIES = [
  p(
    'Strona nie ustawia cookies — ani własnych, ani analitycznych czy reklamowych — i nie osadza treści innych firm (map, filmów, czatów). Dlatego nie prosimy o zgodę na cookies.',
  ),
  h2('Co zapisujemy w przeglądarce'),
  p(
    'Kilka ustawień trzymamy w pamięci przeglądarki (localStorage). Zostają na Twoim urządzeniu i nie są wysyłane na serwer, dopóki sam nie wyślesz zapytania.',
  ),
  ul(
    [
      { bold: 'pk-cart' },
      ' — lista zapytania: wybrane produkty, ilości i uwagi, żeby nie znikały po odświeżeniu strony. Czyścimy ją po wysłaniu zapytania.',
    ],
    [{ bold: 'pk-theme' }, ' — wybrany motyw strony: jasny albo ciemny.'],
    [{ bold: 'pk-sz-closed' }, ' — informacja, że zamknąłeś pasek z kampanią.'],
  ),
  h2('Jak to usunąć'),
  p(
    'Dane te usuniesz, czyszcząc dane witryny w ustawieniach przeglądarki. Strona działa też bez nich — lista zapytania i wybrany motyw nie zostaną wtedy zapamiętane.',
  ),
  h2('Dane osobowe'),
  p(
    'Jak przetwarzamy dane z formularzy, opisuje ',
    {
      text: 'polityka prywatności',
      href: '/polityka-prywatnosci',
    },
    '.',
  ),
]

// TODO(krystian): [SZEF] not in spec. §2 (the footer links it): a short statement of what the
// site does for accessibility — every point is checked in the repo (axe in CI, docs/jakosc.md).
const ACCESSIBILITY = [
  p(
    'Chcemy, żeby ze strony wygodnie korzystał każdy — także z czytnikiem ekranu, samą klawiaturą albo w powiększeniu.',
  ),
  h2('Co robimy'),
  ul(
    ['Projektujemy i sprawdzamy stronę według WCAG 2.1 na poziomie AA.'],
    ['Kontrast tekstu spełnia poziom AA w motywie jasnym i ciemnym.'],
    [
      'Całą stronę obsłużysz klawiaturą: fokus jest zawsze widoczny, a nakładki zamyka klawisz Esc.',
    ],
    ['Obrazy mają teksty alternatywne, a pola formularzy — etykiety.'],
    ['Animacje wyłączają się, gdy w systemie ustawisz ograniczenie ruchu.'],
    ['Każdą zmianę kodu strony sprawdzamy automatycznym testem dostępności (WCAG 2.1 AA).'],
  ),
  h2('Zgłoś problem'),
  p(
    'Coś nie działa albo trudno z tego skorzystać? Napisz na ',
    { text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    ' — odpowiemy i poprawimy.',
  ),
]

const LEGAL_PAGES = [
  {
    slug: 'polityka-prywatnosci',
    title: 'Polityka prywatności',
    layout: [text(PRIVACY)],
    description:
      'Kto przetwarza dane z formularzy PRO-KOM Biznes, po co, jak długo i jakie masz prawa.',
  },
  {
    slug: 'cookies',
    title: 'Cookies',
    layout: [text(COOKIES)],
    description: 'Strona nie ustawia cookies. Co zapisuje w pamięci przeglądarki i jak to usunąć.',
  },
  {
    slug: 'dostepnosc',
    title: 'Dostępność',
    layout: [text(ACCESSIBILITY)],
    description: 'Jak dbamy o dostępność strony PRO-KOM Biznes i jak zgłosić problem.',
  },
]

/**
 * Legal pages of Biznes (B11b) from text blocks: created and published only when missing — never
 * merged, because `upsertBiznesPage` replaces a layout without Biznes blocks (a sample page),
 * which would overwrite the text edited in the panel. Drafts to approve (TODOs above).
 */
export async function seedBiznesLegal(
  payload: Payload,
  tenantId: number,
  report: Report,
): Promise<void> {
  for (const page of LEGAL_PAGES) {
    const { totalDocs } = await payload.count({
      collection: 'pages',
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: page.slug } }] },
      overrideAccess: true,
    })
    if (totalDocs > 0) {
      report(`pages ${page.slug}`, false)
      continue
    }
    await upsertBiznesPage(payload, tenantId, page, report)
  }
}

import type { Payload } from 'payload'

import type { Page, RichTextBlock } from '../../payload-types'
import { h2, p, richText, ul } from '../biznes/lexical'
import { SEED_CONTEXT } from '../config'
import { INSTALACJE_CONTACT } from './contact'

const text = (children: object[]): NonNullable<Page['layout']>[number] => ({
  blockType: 'richText',
  content: richText<RichTextBlock['content']>(children),
})

const EMAIL = INSTALACJE_CONTACT.email

// TODO(krystian): [SZEF/prawnik] DRAFT of the Instalacje privacy policy (I13, decision of
// Krystian 01.11: „zrób to wszystko sam”), built only from facts in the code and ADRs like the
// Biznes and Software drafts: the administrator (`CompanyData`), the form fields of the line
// (`Inquiries`: planner, contact, service, quantity survey, architects' forms with the separate
// marketing consent — ADR-I005 §3), the IP hash of the spam limiter (ADR-003), the Nginx log,
// retention (`INQUIRY_RETENTION_MONTHS`, default 24), encrypted backups ~3 months (S9b-2,
// Backblaze B2 EU — S10), statistics without cookies (Umami on our server, ADR-020 — only when
// `UMAMI_WEBSITES` has the line). To confirm before production: legal bases, hosting and mail
// providers (ADR-002, ADR-019), the effective date. Approving the text means a new consent clause
// version as well (`lib/inquiry/consent.ts`).
const PRIVACY = [
  p(
    'Ta polityka opisuje, jak PRO-KOM Tadeusz Wójciak przetwarza dane osobowe osób, które korzystają ze strony prokominstalacje.pl i wysyłają zapytania przez formularze.',
  ),
  h2('Administrator danych'),
  p(
    'Administratorem danych jest PRO-KOM Tadeusz Wójciak, ul. Orkana 16B, 34-700 Rabka-Zdrój, NIP 7352511447. W sprawach danych osobowych napisz na ',
    { text: EMAIL, href: `mailto:${EMAIL}` },
    ' albo listownie na adres firmy z dopiskiem „Dane osobowe”.',
  ),
  h2('Jakie dane zbieramy'),
  ul(
    [
      { bold: 'Formularze' },
      ' (Zaplanuj instalację, Kontakt, Serwis, przedmiar teletechniki, formularz na stronie głównej, formularze dla architektów): imię, telefon, e-mail, nazwę pracowni lub firmy, miejscowość, treść wiadomości, wybrane usługi i odpowiedzi kreatora, pilność zgłoszenia, link do rzutów i preferowany sposób kontaktu — tylko te, które podasz.',
    ],
    ['Adres strony, z której wysłano formularz, i parametry kampanii z adresu (utm), jeśli były.'],
    ['Informację o zgodzie: kiedy ją wyraziłeś i której wersji klauzuli dotyczyła.'],
    [
      'Adres IP przy wysyłce formularza — do ochrony przed spamem. Aplikacja trzyma w pamięci jego skrót, nie sam adres, i nie zapisuje go przy zapytaniu.',
    ],
    [
      'Dziennik serwera: przy każdym wejściu na stronę serwer zapisuje adres IP, czas, adres strony i wynik odpowiedzi. Służy bezpieczeństwu i usuwaniu awarii (art. 6 ust. 1 lit. f RODO) i jest kasowany po zapełnieniu rotowanych plików dziennika.',
    ],
    [
      'Statystyki odwiedzin (jeśli są włączone): liczymy wejścia narzędziem Umami na naszym serwerze, bez cookies i bez danych z formularzy. Narzędzie nie przechowuje adresu IP.',
    ],
  ),
  p('Nie zakładamy kont klientów i nie korzystamy z narzędzi reklamowych.'),
  h2('Po co i na jakiej podstawie'),
  ul(
    [
      'Odpowiedź na zapytanie, wizja lokalna i przygotowanie wyceny — na podstawie Twojej zgody (art. 6 ust. 1 lit. a RODO) i działań przed zawarciem umowy na Twoje żądanie (art. 6 ust. 1 lit. b RODO).',
    ],
    [
      'Informacje o nowych rozwiązaniach dla pracowni (formularz „Nowości” na stronie dla architektów) — tylko jeśli zaznaczysz osobną, dobrowolną zgodę (art. 6 ust. 1 lit. a RODO).',
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
    'Dane przechowujemy na serwerze dostawcy usług hostingowych, wiadomości e-mail wysyłamy przez naszego dostawcę poczty, a zaszyfrowane kopie zapasowe trzymamy u dostawcy przestrzeni na kopie w Unii Europejskiej. Przetwarzają oni dane wyłącznie na nasze zlecenie.',
  ),
  p(
    'Jeśli napiszesz do nas przez WhatsApp albo otworzysz trasę w Mapach Google, korzystasz z usług tych firm na ich zasadach — strona tylko otwiera ich aplikację.',
  ),
  h2('Twoje prawa'),
  p(
    'Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania i przeniesienia oraz prawo sprzeciwu. Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych.',
  ),
  h2('Pamięć przeglądarki i cookies'),
  p(
    'Co strona zapisuje w Twojej przeglądarce, opisujemy na stronie ',
    { text: 'Cookies', href: '/cookies' },
    '.',
  ),
]

// TODO(krystian): [SZEF/prawnik] DRAFT — the keys are the only browser storage of the Instalacje
// site (`lib/brand/theme.ts` `pk-theme`, `widzety/architekci/checklistStore.ts`
// `inst-arch-checklist`, `lib/site/promo.ts` `pk-sz-closed`); no cookies, no embeds (the contact map is our own drawing, routes open
// Google Maps in a new tab). Check again whenever a key, an embed or analytics is added.
const COOKIES = [
  p(
    'Strona nie ustawia cookies — ani własnych, ani analitycznych czy reklamowych — i nie osadza treści innych firm: mapa dojazdu to nasz rysunek, a trasa otwiera Mapy Google w nowej karcie dopiero po kliknięciu. Dlatego nie prosimy o zgodę na cookies.',
  ),
  h2('Co zapisujemy w przeglądarce'),
  p(
    'Kilka ustawień trzymamy w pamięci przeglądarki (localStorage). Zostają na Twoim urządzeniu i nie są wysyłane na serwer.',
  ),
  ul(
    [{ bold: 'pk-theme' }, ' — wybrany motyw strony: jasny albo ciemny.'],
    [
      { bold: 'inst-arch-checklist' },
      ' — punkty odhaczone na checkliście projektanta na stronie dla architektów.',
    ],
    [{ bold: 'pk-sz-closed' }, ' — informacja, że zamknąłeś pasek z akcją sezonową.'],
  ),
  h2('Jak to usunąć'),
  p(
    'Dane te usuniesz, czyszcząc dane witryny w ustawieniach przeglądarki. Strona działa też bez nich — motyw, odhaczone punkty i zamknięty pasek nie zostaną wtedy zapamiętane.',
  ),
  h2('Dane osobowe'),
  p(
    'Jak przetwarzamy dane z formularzy, opisuje ',
    { text: 'polityka prywatności', href: '/polityka-prywatnosci' },
    '.',
  ),
]

// TODO(krystian): [SZEF] a short statement of what the site does for accessibility; every point is
// checked in the repo (axe in `tests/e2e/a11y.e2e.spec.ts`, touch targets and scrolling in
// `tests/e2e/instalacje/strony.e2e.spec.ts` — buttons ≥ 40 px, MOBILE §10 aims at 44, docs/jakosc.md).
// The retention „24 miesiącach” of the privacy policy = the default `INQUIRY_RETENTION_MONTHS`;
// change the text together with the variable.
const ACCESSIBILITY = [
  p(
    'Chcemy, żeby ze strony wygodnie korzystał każdy — także z czytnikiem ekranu, samą klawiaturą, w powiększeniu albo na telefonie.',
  ),
  h2('Co robimy'),
  ul(
    ['Projektujemy i sprawdzamy stronę według WCAG 2.1 na poziomie AA.'],
    ['Kontrast tekstu spełnia poziom AA w motywie jasnym i ciemnym.'],
    [
      'Całą stronę obsłużysz klawiaturą: fokus jest zawsze widoczny, menu i arkusze zamyka klawisz Esc.',
    ],
    [
      'Interaktywne rysunki (przekroje obiektów, kalkulatory) mają opis tekstowy i sterowanie przyciskami.',
    ],
    ['Przyciski na telefonie mają co najmniej 40 pikseli wysokości, a większość 44.'],
    ['Animacje wyłączają się, gdy w systemie ustawisz ograniczenie ruchu.'],
    ['Zmiany strony sprawdzamy automatycznym testem dostępności.'],
  ),
  h2('Zgłoś problem'),
  p(
    'Coś nie działa albo trudno z tego skorzystać? Napisz na ',
    { text: EMAIL, href: `mailto:${EMAIL}` },
    ' — odpowiemy i poprawimy.',
  ),
]

export const INSTALACJE_LEGAL_PAGES: {
  slug: string
  title: string
  layout: NonNullable<Page['layout']>
  description: string
}[] = [
  {
    slug: 'polityka-prywatnosci',
    title: 'Polityka prywatności',
    layout: [text(PRIVACY)],
    description:
      'Kto przetwarza dane z formularzy PRO-KOM Instalacje, po co, jak długo i jakie masz prawa.',
  },
  {
    slug: 'cookies',
    title: 'Cookies',
    layout: [text(COOKIES)],
    description:
      'Strona PRO-KOM Instalacje nie ustawia cookies. Co zapisuje w pamięci przeglądarki i jak to usunąć.',
  },
  {
    slug: 'dostepnosc',
    title: 'Dostępność',
    layout: [text(ACCESSIBILITY)],
    description: 'Jak dbamy o dostępność strony PRO-KOM Instalacje i jak zgłosić problem.',
  },
]

/** The footer's legal links (`SiteSettings.footer.links`), as in the prototype's footer. */
export const LEGAL_LINKS = INSTALACJE_LEGAL_PAGES.map((page) => ({
  label: page.title,
  href: `/${page.slug}`,
}))

type Count = (name: string, result: 'created' | 'updated' | 'skipped') => void

/**
 * Legal pages of Instalacje (I13): created and published only when missing — never merged, so a
 * text edited in the panel stays. Drafts to approve (TODOs above).
 */
export async function seedInstalacjeLegal(payload: Payload, tenantId: number, count: Count) {
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const
  for (const page of INSTALACJE_LEGAL_PAGES) {
    const { totalDocs } = await payload.count({
      collection: 'pages',
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: page.slug } }] },
      overrideAccess: true,
    })
    if (totalDocs > 0) {
      count('legal-pages', 'skipped')
      continue
    }
    await payload.create({
      collection: 'pages',
      data: {
        tenant: tenantId,
        title: page.title,
        slug: page.slug,
        layout: page.layout,
        seo: { title: page.title, description: page.description },
        _status: 'published',
      },
      ...local,
    })
    count('legal-pages', 'created')
  }
}

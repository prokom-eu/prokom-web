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
const PHONE = INSTALACJE_CONTACT.phone
const TEL = `tel:${PHONE.replace(/\s/g, '')}`

/** Version of the three texts (shown at the end of each; change it with any edit of substance). */
export const LEGAL_VERSION = '8 listopada 2026 r.'

// Prepared 08.11.2026 without a lawyer (decision of Krystian 08.11: „zrób sam”, licences OK),
// from facts in the code and ADRs and the law as of that date: RODO art. 13 (information duty),
// Prawo komunikacji elektronicznej art. 399 (storage in the end device; ust. 3 pkt 2 — no
// consent for what is necessary for a service the user asked for), UODO address from
// uodo.gov.pl/pl/p/kontakt (Moniuszki 1A since July 2025). Facts: the administrator
// (`CompanyData`), the line's forms (`Inquiries`), the IP hash of the spam limiter (ADR-003),
// the Nginx log, retention (`INQUIRY_RETENTION_MONTHS` = 24), encrypted backups ~3 months in
// Backblaze B2 EU (ADR-019), server VPS and mail at Polish providers with data centres in Poland
// (ADR-019, ADR-002; location confirmed by Krystian 08.11),
// server-only Sentry EU without personal data (ADR-021), Umami without cookies on our server
// (ADR-020, only with `UMAMI_WEBSITES`). Check again when a form field, a provider, analytics
// or an embed changes.
const PRIVACY = [
  p(
    'Ta polityka opisuje, jak PRO-KOM Tadeusz Wójciak przetwarza dane osobowe osób, które korzystają ze strony prokominstalacje.pl i wysyłają zapytania przez formularze. Piszemy ją zgodnie z art. 13 RODO (rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679).',
  ),
  h2('Administrator danych'),
  p(
    'Administratorem danych jest PRO-KOM Tadeusz Wójciak, ul. Orkana 16B, 34-700 Rabka-Zdrój, NIP 7352511447. W sprawach danych osobowych napisz na ',
    { text: EMAIL, href: `mailto:${EMAIL}` },
    ', zadzwoń pod numer ',
    { text: PHONE, href: TEL },
    ' albo napisz listownie na adres firmy z dopiskiem „Dane osobowe”. Nie wyznaczyliśmy inspektora ochrony danych — sprawami danych zajmuje się bezpośrednio właściciel firmy.',
  ),
  h2('Jakie dane zbieramy'),
  ul(
    [
      { bold: 'Formularze' },
      ' (Zaplanuj instalację, Kontakt, zgłoszenie serwisowe, zapytanie o teletechnikę, formularz na stronie głównej, formularze dla architektów): imię i nazwisko lub nazwę firmy albo pracowni, telefon, e-mail, miejscowość, treść wiadomości, wybrane usługi i odpowiedzi kreatora, pilność zgłoszenia i preferowany sposób kontaktu — tylko te, które podasz.',
    ],
    ['Adres strony, z której wysłano formularz, i parametry kampanii z adresu (utm), jeśli były.'],
    [
      'Informację o zgodzie na kontakt: kiedy ją wyraziłeś i której wersji klauzuli dotyczyła; przy zapisie na informacje dla pracowni — także zaznaczenie tej osobnej zgody.',
    ],
    [
      'Adres IP przy wysyłce formularza — do ochrony przed spamem. Aplikacja trzyma w pamięci jego skrót, nie sam adres, i nie zapisuje go przy zapytaniu.',
    ],
    [
      'Dziennik serwera: przy każdym wejściu na stronę serwer zapisuje adres IP, czas, adres strony i wynik odpowiedzi. Służy bezpieczeństwu i usuwaniu awarii i jest kasowany po zapełnieniu rotowanych plików dziennika.',
    ],
    [
      'Statystyki odwiedzin (jeśli są włączone): liczymy wejścia narzędziem Umami na naszym serwerze, bez cookies i bez danych z formularzy. Narzędzie nie przechowuje adresu IP.',
    ],
  ),
  p(
    'Nie zakładamy kont klientów, nie korzystamy z narzędzi reklamowych, nie profilujemy i nie podejmujemy decyzji w sposób zautomatyzowany.',
  ),
  h2('Po co i na jakiej podstawie'),
  ul(
    [
      'Odpowiedź na zapytanie, wizja lokalna i przygotowanie wyceny — na podstawie Twojej zgody wyrażonej w formularzu (art. 6 ust. 1 lit. a RODO) i działań przed zawarciem umowy, które podejmujemy na Twoje żądanie (art. 6 ust. 1 lit. b RODO).',
    ],
    [
      'Informacje o nowych rozwiązaniach dla pracowni (formularz „Nowości” na stronie dla architektów) — tylko jeśli zaznaczysz osobną, dobrowolną zgodę (art. 6 ust. 1 lit. a RODO).',
    ],
    [
      'Bezpieczeństwo strony, ochrona przed spamem, statystyki odwiedzin bez danych osobowych i ewentualne dochodzenie lub obrona roszczeń — na podstawie naszego prawnie uzasadnionego interesu (art. 6 ust. 1 lit. f RODO).',
    ],
  ),
  p(
    'Podanie danych jest dobrowolne, ale bez numeru telefonu albo adresu e-mail nie odpowiemy na zapytanie. Zgodę możesz wycofać w każdej chwili, pisząc na adres powyżej. Wycofanie nie wpływa na zgodność z prawem przetwarzania, które odbyło się wcześniej.',
  ),
  h2('Jak długo przechowujemy dane'),
  p(
    'Zakończone zapytania usuwamy po 24 miesiącach od ostatniej zmiany ich statusu; zapytania w toku przechowujemy do czasu ich zakończenia. W tym samym terminie usuwamy kopie zapytań z naszej skrzynki pocztowej. Dane z zapisu na informacje dla pracowni przechowujemy do wycofania zgody. Jeśli zawrzemy umowę, dane potrzebne do jej rozliczenia przechowujemy tak długo, jak wymagają tego przepisy podatkowe i rachunkowe. Kopie zapasowe są szyfrowane i rotowane — usunięte dane znikają z nich najpóźniej po około 3 miesiącach.',
  ),
  h2('Komu przekazujemy dane'),
  p(
    'Dane przetwarzają na nasze zlecenie i według naszych poleceń: dostawca serwera, na którym działa strona i baza zapytań (serwer w Polsce), dostawca poczty, przez którego wysyłamy i odbieramy wiadomości e-mail (w Polsce), oraz dostawca przestrzeni na kopie zapasowe (centrum danych w Amsterdamie; kopie szyfrujemy przed wysłaniem i dostawca nie ma do nich klucza). Raporty o błędach serwera trafiają do usługi Sentry z centrum danych we Frankfurcie i nie zawierają danych z formularzy.',
  ),
  p(
    'Nie przekazujemy danych do państw poza Europejskim Obszarem Gospodarczym. Jeśli otworzysz trasę w Mapach Google, korzystasz z usług tej firmy na jej zasadach — strona tylko otwiera jej aplikację w nowej karcie.',
  ),
  h2('Twoje prawa'),
  p(
    'Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania i przeniesienia oraz prawo sprzeciwu wobec przetwarzania na podstawie naszego prawnie uzasadnionego interesu. Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych, ul. Stanisława Moniuszki 1A, 00-014 Warszawa.',
  ),
  h2('Pamięć przeglądarki i cookies'),
  p(
    'Co strona zapisuje w Twojej przeglądarce, opisujemy na stronie ',
    { text: 'Cookies', href: '/cookies' },
    '.',
  ),
  h2('Zmiany polityki'),
  p(
    `Gdy zmienimy zasady przetwarzania danych, zaktualizujemy tę stronę i datę wersji. Wersja z ${LEGAL_VERSION}`,
  ),
]

// Keys are the only browser storage of the Instalacje site: `pk-theme` (`lib/brand/theme.ts`),
// `inst-arch-checklist` (`widzety/architekci/checklistStore.ts`), `pk-sz-closed`
// (`lib/site/promo.ts`), `pk-recent-instalacje` (`lib/shared/recent.ts`, only with
// `CompanyData.recentlyViewed`), session `pk-rail-home` / `pk-rail-pulse` (`SiteRail.tsx`). No
// cookies on the public site, no embeds. Check again whenever a key, an embed or analytics is added.
const COOKIES = [
  p(
    'Strona nie ustawia cookies — ani własnych, ani analitycznych czy reklamowych — i nie osadza treści innych firm: mapa dojazdu to nasz rysunek, a trasa otwiera Mapy Google w nowej karcie dopiero po kliknięciu. Dlatego nie wyświetlamy okna zgody na cookies.',
  ),
  h2('Co zapisujemy w przeglądarce'),
  p(
    'Kilka ustawień trzymamy w pamięci przeglądarki (localStorage i sessionStorage). Zostają na Twoim urządzeniu, nie są wysyłane na serwer i nie służą do śledzenia. Są potrzebne do działania strony i zapamiętania Twoich ustawień — na to przepisy nie wymagają zgody (art. 399 ust. 3 pkt 2 ustawy Prawo komunikacji elektronicznej).',
  ),
  ul(
    [{ bold: 'pk-theme' }, ' — wybrany motyw strony: jasny albo ciemny.'],
    [
      { bold: 'inst-arch-checklist' },
      ' — punkty odhaczone na checkliście projektanta na stronie dla architektów.',
    ],
    [{ bold: 'pk-sz-closed' }, ' — informacja, że zamknąłeś pasek z akcją sezonową.'],
    [
      { bold: 'pk-recent-instalacje' },
      ' — do pięciu ostatnio oglądanych stron, pokazywanych w wyszukiwarce. Dziś ta funkcja jest wyłączona i klucz nie powstaje.',
    ],
    [
      { bold: 'pk-rail-home, pk-rail-pulse' },
      ' — stan bocznego paska nawigacji w bieżącej karcie; znikają po jej zamknięciu.',
    ],
  ),
  h2('Jak to usunąć'),
  p(
    'Dane te usuniesz, czyszcząc dane witryny w ustawieniach przeglądarki. Strona działa też bez nich — Twoje ustawienia nie zostaną wtedy zapamiętane.',
  ),
  h2('Dane osobowe'),
  p(
    'Jak przetwarzamy dane z formularzy, opisuje ',
    { text: 'polityka prywatności', href: '/polityka-prywatnosci' },
    `. Wersja z ${LEGAL_VERSION}`,
  ),
]

// A voluntary statement: the law on the digital accessibility of public bodies (2019) does not
// cover a private company, and the accessibility act of 26.04.2024 (EAA) covers e-commerce — this
// site sells nothing. Every point is checked in the repo: axe on 35 pages × 2 themes (INST-2),
// touch targets 44 px and no sideways scroll (`tests/e2e/instalacje/phone-audit.ts`, MOBILE §10),
// reduced motion (`ruch.e2e.spec.ts`), 200% text in the hero (INST-2 PR4).
const ACCESSIBILITY = [
  p(
    'Chcemy, żeby ze strony prokominstalacje.pl wygodnie korzystał każdy — także z czytnikiem ekranu, samą klawiaturą, w powiększeniu albo na telefonie. Tę deklarację publikujemy dobrowolnie.',
  ),
  h2('Stan dostępności'),
  p(
    'Strona jest projektowana i sprawdzana według wytycznych WCAG 2.1 na poziomie AA. Ocenę przygotowaliśmy sami, na podstawie testów automatycznych i ręcznych.',
  ),
  ul(
    ['Kontrast tekstu spełnia poziom AA w motywie jasnym i ciemnym.'],
    [
      'Całą stronę obsłużysz klawiaturą: fokus jest zawsze widoczny, menu i arkusze zamyka klawisz Esc.',
    ],
    [
      'Interaktywne rysunki (przekroje obiektów, kalkulatory, pokaz na stronie głównej) mają opis tekstowy i sterowanie przyciskami; pokaz można wstrzymać.',
    ],
    [
      'Przyciski i pola formularzy w treści strony mają na telefonie co najmniej 44 piksele wysokości.',
    ],
    [
      'Strona działa na ekranach od 360 pikseli szerokości, a pokaz na stronie głównej także przy powiększeniu tekstu do 200%.',
    ],
    ['Animacje wyłączają się, gdy w systemie ustawisz ograniczenie ruchu.'],
    ['Zdjęcia realizacji mają opisy alternatywne.'],
    [
      'Kluczowe strony i formularze sprawdzamy automatycznym testem dostępności przy każdej zmianie.',
    ],
  ),
  h2('Znane ograniczenia'),
  ul(
    [
      'Rysunki przekrojów obiektów są ilustracjami — te same informacje znajdziesz w tekście obok i w opisach punktów.',
    ],
    ['Trasa dojazdu otwiera się w Mapach Google, na których dostępność nie mamy wpływu.'],
  ),
  h2('Zgłoś problem'),
  p(
    'Coś nie działa albo trudno z tego skorzystać? Napisz na ',
    { text: EMAIL, href: `mailto:${EMAIL}` },
    ' albo zadzwoń pod ',
    { text: PHONE, href: TEL },
    '. Odpowiemy w ciągu 7 dni i, jeśli to możliwe, poprawimy stronę albo przekażemy Ci informację w inny sposób.',
  ),
  p(`Deklarację sporządzono ${LEGAL_VERSION}`),
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

type Count = (name: string, result: 'created' | 'updated' | 'skipped') => void

/**
 * Legal pages of Instalacje (I13): created and published only when missing — never merged, so a
 * text edited in the panel stays.
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

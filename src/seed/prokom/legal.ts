import type { Payload } from 'payload'

import type { Page, RichTextBlock } from '../../payload-types'
import { h2, p, richText, ul } from '../biznes/lexical'
import { SEED_CONTEXT } from '../config'
import { PROKOM_SITE } from '../shared/prokom'

const text = (children: object[]): NonNullable<Page['layout']>[number] => ({
  blockType: 'richText',
  content: richText<RichTextBlock['content']>(children),
})

const EMAIL = PROKOM_SITE.email
const PHONE = PROKOM_SITE.phone
const TEL = `tel:+48${PHONE.replace(/\s/g, '')}`

/** Version of the three texts (shown at the end of each; change it with any edit of substance). */
export const PROKOM_LEGAL_VERSION = '15 listopada 2026 r.'

// Prepared 15.11.2026 at night without a lawyer, on the pattern of Instalacje (08.11, Krystian:
// „zrób sam”) — the same administrator, providers, retention and law (RODO art. 13, Prawo
// komunikacji elektronicznej art. 399), with the hub's forms and browser keys. Spec §6.13: noindex
// until a lawyer accepts it — TODO(krystian): akceptacja prawnika przed publikacją (spec §6.13).
// Browser keys of the hub: `pk-theme` (lib/brand/theme.ts), `pk-hub-request-list`
// (sites/prokom/dostawy/list.ts, session), `pk-recent-prokom` (lib/shared/recent.ts, only with
// `CompanyData.recentlyViewed`), `pk-sz-closed` (seasonal bar, lib/site/promo.ts), session
// `pk-rail-home` / `pk-rail-pulse` (SiteRail).
const PRIVACY = [
  p(
    'Ta polityka opisuje, jak PRO-KOM Tadeusz Wójciak przetwarza dane osobowe osób, które korzystają ze strony pro-kom.eu i wysyłają zapytania przez formularze. Piszemy ją zgodnie z art. 13 RODO (rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679).',
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
      ' (Kontakt, Dla firm, Dla domu, Pomoc, Inwestycje i dostawy, Współpraca): imię i nazwisko lub nazwę firmy albo instytucji, NIP (jeśli podasz), telefon, e-mail, miejscowość lub miejsce dostawy, treść wiadomości, listę zapytania z ilościami, wybrane usługi i termin, odnośnik do specyfikacji albo rzutów — tylko te, które podasz.',
    ],
    ['Adres strony, z której wysłano formularz, i parametry kampanii z adresu (utm), jeśli były.'],
    ['Informację o zgodzie na kontakt: kiedy ją wyraziłeś i której wersji klauzuli dotyczyła.'],
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
    'Zapytanie trafia do linii PRO-KOM, której dotyczy sprawa (Biznes, Instalacje, Software, Tech albo Gaming) — to ta sama firma, linie to jej działy. Nie zakładamy kont klientów, nie korzystamy z narzędzi reklamowych, nie profilujemy i nie podejmujemy decyzji w sposób zautomatyzowany.',
  ),
  h2('Po co i na jakiej podstawie'),
  ul(
    [
      'Odpowiedź na zapytanie i przygotowanie oferty lub wyceny — na podstawie Twojej zgody wyrażonej w formularzu (art. 6 ust. 1 lit. a RODO) i działań przed zawarciem umowy, które podejmujemy na Twoje żądanie (art. 6 ust. 1 lit. b RODO).',
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
    'Zakończone zapytania usuwamy po 24 miesiącach od ostatniej zmiany ich statusu; zapytania w toku przechowujemy do czasu ich zakończenia. W tym samym terminie usuwamy kopie zapytań z naszej skrzynki pocztowej. Jeśli zawrzemy umowę, dane potrzebne do jej rozliczenia przechowujemy tak długo, jak wymagają tego przepisy podatkowe i rachunkowe. Kopie zapasowe są szyfrowane i rotowane — usunięte dane znikają z nich najpóźniej po około 3 miesiącach.',
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
    `Gdy zmienimy zasady przetwarzania danych, zaktualizujemy tę stronę i datę wersji. Wersja z ${PROKOM_LEGAL_VERSION}`,
  ),
]

const COOKIES = [
  p(
    'Strona nie ustawia cookies — ani własnych, ani analitycznych czy reklamowych — i nie osadza treści innych firm: trasa otwiera Mapy Google w nowej karcie dopiero po kliknięciu. Dlatego nie wyświetlamy okna zgody na cookies.',
  ),
  h2('Co zapisujemy w przeglądarce'),
  p(
    'Kilka ustawień trzymamy w pamięci przeglądarki (localStorage i sessionStorage). Zostają na Twoim urządzeniu, nie są wysyłane na serwer i nie służą do śledzenia. Są potrzebne do działania strony i zapamiętania Twoich ustawień — na to przepisy nie wymagają zgody (art. 399 ust. 3 pkt 2 ustawy Prawo komunikacji elektronicznej).',
  ),
  ul(
    [{ bold: 'pk-theme' }, ' — wybrany motyw strony: jasny albo ciemny.'],
    [
      { bold: 'pk-hub-request-list' },
      ' — lista zapytania na stronie „Inwestycje i dostawy” w bieżącej karcie; znika po jej zamknięciu.',
    ],
    [
      { bold: 'pk-recent-prokom' },
      ' — do pięciu ostatnio oglądanych stron, pokazywanych w wyszukiwarce. Dziś ta funkcja jest wyłączona i klucz nie powstaje.',
    ],
    [{ bold: 'pk-sz-closed' }, ' — informacja, że zamknąłeś pasek z akcją sezonową.'],
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
    `. Wersja z ${PROKOM_LEGAL_VERSION}`,
  ),
]

const ACCESSIBILITY = [
  p(
    'Chcemy, żeby ze strony pro-kom.eu wygodnie korzystał każdy — także z czytnikiem ekranu, samą klawiaturą, w powiększeniu albo na telefonie. Tę deklarację publikujemy dobrowolnie.',
  ),
  h2('Stan dostępności'),
  p(
    'Strona jest projektowana i sprawdzana według wytycznych WCAG 2.1 na poziomie AA. Ocenę przygotowaliśmy sami, na podstawie testów automatycznych i ręcznych.',
  ),
  ul(
    ['Kontrast tekstu spełnia poziom AA w motywie jasnym i ciemnym.'],
    [
      'Całą stronę obsłużysz klawiaturą: fokus jest zawsze widoczny, zakładki obsługują strzałki, menu i arkusze zamyka klawisz Esc.',
    ],
    ['Przyciski i pola formularzy mają na telefonie co najmniej 44 piksele wysokości.'],
    ['Strona działa na ekranach od 360 pikseli szerokości.'],
    [
      'Ruchome elementy strony głównej zatrzymują się po najechaniu, na ekranach dotykowych i gdy w systemie ustawisz ograniczenie ruchu.',
    ],
    ['Kluczowe strony sprawdzamy automatycznym testem dostępności przy każdej zmianie.'],
  ),
  h2('Znane ograniczenia'),
  ul(
    [
      'Rysunki i schematy (np. kierunki dojazdu) są ilustracjami — te same informacje są w tekście obok.',
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
  p(`Deklarację sporządzono ${PROKOM_LEGAL_VERSION}`),
]

export const PROKOM_LEGAL_PAGES: {
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
      'Kto przetwarza dane z formularzy pro-kom.eu, po co, jak długo i jakie masz prawa.',
  },
  {
    slug: 'cookies',
    title: 'Cookies',
    layout: [text(COOKIES)],
    description:
      'Strona pro-kom.eu nie ustawia cookies. Co zapisuje w pamięci przeglądarki i jak to usunąć.',
  },
  {
    slug: 'dostepnosc',
    title: 'Dostępność',
    layout: [text(ACCESSIBILITY)],
    description: 'Jak dbamy o dostępność strony pro-kom.eu i jak zgłosić problem.',
  },
]

type Count = (name: string, result: 'created' | 'updated' | 'skipped') => void

/**
 * Legal pages of the hub (H5): created and published only when missing — never merged, so a text
 * edited in the panel stays. `noindex` until a lawyer accepts them (spec §6.13).
 */
export async function seedProkomLegal(payload: Payload, tenantId: number, count: Count) {
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const
  for (const page of PROKOM_LEGAL_PAGES) {
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

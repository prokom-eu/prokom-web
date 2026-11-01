import type { Payload } from 'payload'

import type { BiznesSetting, Post } from '../../payload-types'
import { postHref } from '../../lib/posts/list'
import { missingFields } from './fill'
import { h2, p, richText } from './lexical'

type Report = (name: string, changed: boolean) => void
type Refs = {
  image: (file: string) => number | undefined
  product: (shortId: string) => number | undefined
}

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

export const KSEF_POST_SLUG = 'ksef-od-1-stycznia-2027'

const KSEF_DATE = '2027-01-01T00:00:00.000Z'

// TODO(krystian): [SZEF] facts as of 15.10.2026 (board `Wpis`) — check again before the post goes
// to production (MF communications change). The board also names the MF communication of
// 16.09.2026, pit.pl (2.10.2026) and infor.pl (KSeF 2.0 authentication) as sources: add their
// links in the panel — a source without an https address cannot be saved.
// TODO(krystian): projekt MF przedłużenia braku kar KSeF do końca 2027 — usunięty z wpisu i panelu
// KSeF (audyt 01.11, brak źródła na stronie); wrócić ze zdaniem tylko z linkiem do komunikatu MF.
const VERIFIED_AT = '2026-10-15T00:00:00.000Z'

/** The KSeF post from the board `Wpis`, texts 1:1. */
function ksefPost(refs: Refs) {
  const cover = refs.image('p-ksef.webp')
  const related = ['ksef', 'euro'].map(refs.product).filter((id): id is number => id !== undefined)
  return {
    title: 'KSeF od 1 stycznia 2027: 6 rzeczy, które mała firma musi zrobić do grudnia',
    slug: KSEF_POST_SLUG,
    category: 'ksef' as const,
    publishedAt: '2026-10-14T00:00:00.000Z',
    lead: 'Od 1 kwietnia 2026 KSeF obowiązuje większość firm. 1 stycznia 2027 dołączają najmniejsze — i tego samego dnia kończą się faktury dla firm wystawiane z kasy. Oto checklista, którą przechodzimy z każdym klientem.',
    ...(cover !== undefined && { cover }),
    summary:
      'do końca 2026 r. nie ma kar za błędy w KSeF. Ale terminy wystawiania faktur, numer KSeF w przelewach i koniec faktur z kasy w B2B od 1.01.2027 zostają.',
    content: richText<Post['content']>([
      h2('1. Uwierzytelnienie — kto i czym się loguje'),
      p(
        'Jednoosobowa działalność: Profil Zaufany, podpis kwalifikowany albo (od 1.04.2026) login.gov — mObywatel, bank, e-Dowód. Spółka: kwalifikowana pieczęć elektroniczna z NIP albo osoba uprawniona swoim podpisem w kontekście NIP spółki. Podpis bez NIP/PESEL wymaga zgłoszenia odcisku w ZAW-FA.',
      ),
      p('Pomożemy wyrobić podpis albo pieczęć EuroCert.'),
      h2('2. Uprawnienia dla księgowej i pracowników'),
      p(
        'Właściciel nadaje uprawnienia w Aplikacji Podatnika KSeF 2.0: kto wystawia, kto odbiera, kto może nadawać dalej. Bez tego biuro rachunkowe nie zobaczy faktur zakupu.',
      ),
      h2('3. Certyfikat KSeF — zanim skończy się token'),
      p(
        'Certyfikat typu 1 służy do uwierzytelniania programu (Subiekt, PC-Market, NFHotel, GoPOS). Typ 2 jest potrzebny do trybu offline24 — faktur wystawianych bez połączenia, wysyłanych następnego dnia roboczego. Stary token działa tylko do końca 2026 r.',
      ),
      h2('4. Program podłączony do KSeF 2.0'),
      p(
        'Fakturowanie w programie z API KSeF 2.0 albo w bezpłatnej Aplikacji Podatnika. Wdrażamy i testujemy na Twoich fakturach — nie na przykładach z instrukcji.',
      ),
      h2('5. Kasy fiskalne: co się zmienia'),
      p(
        'Kasa dalej drukuje paragony. Ale od 1.01.2027 faktura do paragonu dla firmy idzie wyłącznie przez KSeF — z programu lub aplikacji, nie z kasy. Paragon z NIP do 450 zł przestaje być fakturą uproszczoną w B2B. W gastronomii i hotelu konfigurujemy to w GoPOS i NFHotel.',
      ),
      h2('6. Procedura awaryjna — spisana, nie „jakoś to będzie”'),
      p(
        'Kto i jak wysyła faktury po awarii internetu, sprzętu albo KSeF. Offline24 jest bezterminowy, ale wymaga certyfikatu typu 2 i wysyłki następnego dnia roboczego.',
      ),
      h2('Ulga 700 zł — przy okazji'),
      p(
        'Firmy, które dopiero zaczynają ewidencję na kasie online, mogą odliczyć 90% ceny netto, maksymalnie 700 zł (art. 111 ust. 4 ustawy o VAT). Zakup nie później niż 6 miesięcy od rozpoczęcia ewidencji; brak przeglądu w 3 lata oznacza zwrot ulgi.',
      ),
    ]),
    sources: [
      { name: 'MF — podatki.gov.pl', url: 'https://www.podatki.gov.pl/', verifiedAt: VERIFIED_AT },
      {
        name: 'ksef.podatki.gov.pl',
        url: 'https://ksef.podatki.gov.pl/',
        verifiedAt: VERIFIED_AT,
      },
      {
        name: 'ustawa o VAT (art. 108g, 111)',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20040540535',
        verifiedAt: VERIFIED_AT,
      },
    ],
    ...(related.length > 0 && { relatedProducts: related }),
    aside: {
      cta: {
        eyebrow: 'Wdrożenie KSeF',
        title: 'Przygotujemy firmę do KSeF w 1–2 wizyty',
        text: 'Podpis lub pieczęć, uprawnienia, certyfikat, program, kasy, procedura awaryjna — i szkolenie dla osoby, która wystawia faktury.',
        link: { label: 'Zapytaj o wdrożenie', href: `${postHref(KSEF_POST_SLUG)}#kontakt` },
      },
      countdown: { label: 'Ile dni do 1.01.2027', date: KSEF_DATE, caption: 'liczone od dziś' },
    },
    // TODO(krystian): [SZEF] the board adds „Odpowiadamy pn–pt 9–17.” — hours only from the
    // panel (spec. §9 pkt 9); the call-back promise is appended from `callbackTime`.
    contact: {
      heading: 'KSeF bez nerwów. Zróbmy to przed grudniem.',
      lead: 'Powiedz, jaki masz program i kasę — resztę sprawdzimy i przygotujemy.',
    },
  }
}

type KsefGroup = NonNullable<NonNullable<BiznesSetting['news']>['ksef']>

// TODO(krystian): [SZEF] legal facts as of 15.10.2026 (board `Aktualnosci`, spec. §13 pkt 11) —
// check before publication; the second button leads to the post with the sources. The threshold
// „do 10 000 zł faktur miesięcznie” is in neither the note nor the post: add its source (MF,
// „pytania i odpowiedzi KSeF 2.0”, spec. §13 pkt 11) to the note or the post before production.
const KSEF_PANEL: KsefGroup = {
  eyebrow: 'KSeF dla najmniejszych firm',
  date: KSEF_DATE,
  dateLabel: 'dni do 1 stycznia 2027',
  text: 'Od 1 kwietnia 2026 KSeF obowiązuje większość firm, a od 1 stycznia 2027 także najmniejsze (do 10 000 zł faktur miesięcznie). Tego dnia kończą się też faktury dla firm wystawiane z kasy. Sprawdzimy program, kasy i sposób fakturowania — i przygotujemy firmę, zanim zrobi się nerwowo.',
  link: { label: 'Przygotuj firmę do KSeF', href: '/aktualnosci#kontakt' },
  secondaryLink: { label: 'Co się zmienia', href: postHref(KSEF_POST_SLUG) },
  steps: [
    {
      title: 'Uwierzytelnienie',
      text: 'JDG: Profil Zaufany lub podpis kwalifikowany. Spółka: pieczęć kwalifikowana z NIP. Pomożemy wyrobić podpis EuroCert.',
    },
    {
      title: 'Uprawnienia',
      text: 'Nadajemy dostęp księgowej i pracownikom w Aplikacji Podatnika KSeF 2.0 — kto wystawia, kto odbiera.',
    },
    {
      title: 'Certyfikat KSeF',
      text: 'Typ 1 do programu, typ 2 do trybu offline24 na wypadek awarii. Token działa tylko do końca 2026.',
    },
    {
      title: 'Program',
      text: 'Subiekt, PC-Market, NFHotel, GoPOS — podłączone do KSeF 2.0 i przetestowane na Twoich fakturach.',
    },
    {
      title: 'Kasy fiskalne',
      text: 'Kasa dalej drukuje paragony. Faktura do paragonu dla firmy od 2027 tylko przez KSeF — ustawiamy to w programie.',
    },
    {
      title: 'Procedura awaryjna',
      text: 'Kto i jak wysyła faktury po awarii internetu lub KSeF. Spisana, przećwiczona, w szufladzie.',
    },
  ],
  note: 'Brak kar za błędy w KSeF do 31.12.2026. Terminy wystawiania faktur i numeru KSeF w przelewach od 1.01.2027 bez zmian.',
}

/**
 * News of Biznes (B11): the KSeF post from the board, created and published when missing (later
 * it belongs to the panel), and the KSeF panel of the list in the Biznes settings — only the
 * fields still empty. Reports `posts <slug>` and `biznes-settings news`.
 */
export async function seedBiznesNews(
  payload: Payload,
  tenantId: number,
  refs: Refs,
  report: Report,
): Promise<void> {
  const { totalDocs } = await payload.count({
    collection: 'posts',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: KSEF_POST_SLUG } }] },
    overrideAccess: true,
  })
  report(`posts ${KSEF_POST_SLUG}`, totalDocs === 0)
  if (totalDocs === 0) {
    await payload.create({
      collection: 'posts',
      data: { ...ksefPost(refs), tenant: tenantId, _status: 'published' },
      ...local,
    })
  }

  const {
    docs: [settings],
  } = await payload.find({
    collection: 'biznes-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    ...local,
  })
  if (!settings) return
  const patch = missingFields(settings.news, { ksef: KSEF_PANEL })
  const changed = Object.keys(patch).length > 0
  report('biznes-settings news', changed)
  if (changed) {
    await payload.update({
      collection: 'biznes-settings',
      id: settings.id,
      data: { news: { ...settings.news, ...patch } },
      ...local,
    })
  }
}

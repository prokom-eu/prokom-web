import type { SectionData, SectionVariant } from '../../lib/biznes/pages/sections'
import type { IconName } from '../../lib/catalog/options'
import { hardSpaces, hardSpacesDeep } from '../../lib/text/hardSpace'
import type { BzSectionBlock, FaqBlock } from '../../payload-types'
import type { PageBlock } from './page'
import { BIZNES_CONTACT } from './contact'

/**
 * Subpages of the K4 package (K4hij, `seed/prokombiznes/k4/strony-k4.json`) as page layouts
 * from `bzSection` blocks (decyzja Krystiana 01.11 — hybryda). Pure: `run.ts` reads the file and
 * gives `slugOf` (short id of the board → product slug). Headings and short texts not in the
 * file are copied from the board (`k4/boards/Strona.dc.html`, view `gopos` / `insert`).
 */

/** Short id of the board → slug of the product in the database; `undefined` when unknown. */
export type SlugOf = (shortId: string) => string | undefined

type Pair = [string, string]

/** The parts of `strony-k4.json` the K4h pages use (Polish keys of the design package). */
export type K4PagesFile = {
  gopos: {
    hero: {
      pill: string
      h1a: string
      h1b: string
      lead: string
      proof: { t: string; d: string }[]
      stage: { s: string; k: string }[]
      flowDev: Record<string, number>
    }
    flow: { k: string; t: string; d: string }[]
    seg: {
      k: string
      t: string
      h1a: string
      h1b: string
      lead: string
      mods: string[]
      tk: [string, string, string[]]
    }[]
    segImg: Record<string, string>
    mods: { s: string; core: boolean; n: string; d: string; hw: string[] }[]
    stats: Pair[]
    statsSrc: string
    areas: { t: string; it: [string, string, string | null][] }[]
    areasSrc: string
    ext: { t: string; k: string; s?: string | null; f: string[]; v: Pair[] }[]
    extSrc: string
    hub: { plat: string[]; out: Pair[]; lead: string; src: string }
    ksef: string[]
    devs: string[]
    pakiety: {
      h: string[]
      rows: [string, string, string][]
      fun: string[]
      dod: string[]
      src: string
    }
    cases: [string, string, string, string][]
    casesSrc: string
    vids: { id: string; t: string; k: string }[]
    steps: Pair[]
    integ: [string, string[]][]
    integSrc: string
    faq: { q: string; a: string }[]
  }
  insert: {
    pill: string
    shelf: [string, string, string][]
    stats: Pair[]
    statsSrc: string
    q: { q: string; o: { t: string; k: string }[] }[]
    rules: { when: string[]; s: string; why: string }[]
    cmpH: string[]
    cmp: { k: string; v: string[] }[]
    ksefLead: string
    kt: { d: string; t: string; s: string }[]
    chk: Pair[]
    ksefSrc: string
    ksefEnd: string
    insp: {
      lead: string
      steps: Pair[]
      presets: [string, number, number][]
      def: [number, number]
      pula: number
      notes: Pair[]
      src: string
    }
    portfel: Pair[]
    portfelSrc: string
    all: { t: string; it: [string, string, string, string | null][] }[]
    allSrc: string
    tiles: { t: string; d: string }[]
    req: { min: Pair[]; zal: Pair[]; pc: string[]; src: string }
    vids: { id: string; t: string; k: string }[]
    faq: { q: string; a: string }[]
  }
}

/** Layout of a page plus the board ids the database does not know (for the seed report). */
export type K4Layout = { layout: PageBlock[]; missing: string[] }

const GOPOS_PRESENTATION_NOTE = 'Prezentacja GoPOS w lokalu'
const OFFER_CRUMB = { name: 'Oferta', href: '/oferta' }
const OFFICE_PHONE = { label: BIZNES_CONTACT.phone, href: BIZNES_CONTACT.phoneHref }

/**
 * Sources are shown only as links (K4-FINAL §1): the address is the first domain (with a path)
 * the caption names — „Integracje według gopos.pl/gohub · stan na …” → https://gopos.pl/gohub.
 */
export function sourceLink(caption: string): string | undefined {
  const match = caption.match(/\b((?:[a-z0-9-]+\.)+(?:pl|com|eu|gov\.pl)(?:\/[\w/-]*)?)/i)
  return match ? `https://${match[1]!.replace(/\/$/, '')}` : undefined
}

type SectionInput<V extends SectionVariant> = {
  variant: V
  data?: SectionData<V>
  anchor?: string
  surface?: BzSectionBlock['surface']
  eyebrow?: string
  heading?: string
  headingAccent?: string
  lead?: string
  items?: { title: string; text?: string; label?: string; icon?: IconName }[]
  source?: string
}

function section<V extends SectionVariant>(input: SectionInput<V>): BzSectionBlock {
  const { variant, data, source, surface = 'default', items, ...texts } = input
  // Hard spaces after one-letter words in every text (K4-FINAL §1); slugs and links have none.
  return {
    blockType: 'bzSection',
    variant,
    surface,
    ...hardSpacesDeep(texts),
    ...(items ? { items: hardSpacesDeep(items) } : {}),
    ...(source ? { source: hardSpaces(source), sourceUrl: sourceLink(source) } : {}),
    ...(data ? { data: hardSpacesDeep(data) as BzSectionBlock['data'] } : {}),
  }
}

const faq = (eyebrow: string, heading: string, items: { q: string; a: string }[]): FaqBlock => ({
  blockType: 'faq',
  eyebrow,
  heading,
  items: items.map(({ q, a }) => ({ question: hardSpaces(q), answer: hardSpaces(a) })),
})

/** Resolves board ids, remembering the unknown ones. */
function resolver(slugOf: SlugOf) {
  const missing = new Set<string>()
  const one = (id: string): string | undefined => {
    const slug = slugOf(id)
    if (!slug) missing.add(id)
    return slug
  }
  const many = (ids: readonly string[]): string[] =>
    ids.flatMap((id) => {
      const slug = one(id)
      return slug ? [slug] : []
    })
  return { one, many, missing }
}

/** `/gopos` (K4h, K32 §3, plansza Web-GoPOS). */
export function goposK4Layout(file: K4PagesFile, slugOf: SlugOf): K4Layout {
  const g = file.gopos
  const r = resolver(slugOf)
  const modules = g.mods.flatMap((mod) => {
    const slug = r.one(mod.s)
    return slug
      ? [{ slug, ...(mod.core ? { core: true } : {}), name: mod.n, text: mod.d, hw: mod.hw }]
      : []
  })
  const nameOf = new Map(modules.map((m) => [m.slug, m.name]))
  const core = modules.find((m) => m.core)?.slug ?? 'gopos'
  const venueModules = (ids: readonly string[]) =>
    r.many(ids).map((slug) => ({ slug, name: nameOf.get(slug) ?? slug }))
  const initial = venueModules(g.seg[0]?.mods ?? []).map((m) => m.slug)
  const ticket = (tk: [string, string, string[]]) => ({
    label: tk[0],
    text: tk[1],
    statuses: tk[2],
  })
  const presentation = { slug: core, note: GOPOS_PRESENTATION_NOTE }
  const devices = r.many(g.devs)

  const layout: PageBlock[] = [
    section({
      variant: 'gopos-hero',
      surface: 'dark',
      heading: g.hero.h1a,
      headingAccent: g.hero.h1b,
      lead: g.hero.lead,
      data: {
        trail: [OFFER_CRUMB],
        pill: g.hero.pill,
        presentation,
        proof: g.hero.proof.map(({ t, d }) => ({ t, d })),
        stage: g.hero.stage.flatMap((device) => {
          const slug = r.one(device.s)
          const step = g.hero.flowDev[device.s]
          return slug && step !== undefined ? [{ slug, label: device.k, step }] : []
        }),
        flow: g.flow.map(({ k, t, d }) => ({ k, t, d })),
        ticket: ticket(g.seg[0]!.tk),
      },
    }),
    section({
      variant: 'stats',
      surface: 'muted',
      eyebrow: 'GoPOS w liczbach',
      items: g.stats.map(([title, text]) => ({ title, text })),
      source: g.statsSrc,
    }),
    section({
      variant: 'gopos-venues',
      anchor: 'lokal',
      eyebrow: 'Twój lokal',
      heading: 'GoPOS ustawiony pod to, jak pracujesz',
      lead: 'Wybierz rodzaj lokalu — pokażemy, jak wygląda dzień pracy i od jakiego pakietu zacząć.',
      data: {
        venues: g.seg.map((venue) => {
          const image = g.segImg[venue.k] ? r.one(g.segImg[venue.k]!) : undefined
          return {
            key: venue.k,
            tab: venue.t,
            h1a: venue.h1a,
            h1b: venue.h1b,
            lead: venue.lead,
            ...(image ? { image } : {}),
            modules: venueModules(venue.mods),
            ticket: ticket(venue.tk),
          }
        }),
      },
    }),
    section({
      variant: 'gopos-areas',
      anchor: 'moduly',
      surface: 'muted',
      eyebrow: 'Moduły GoPOS',
      heading: 'Cały lokal w jednym systemie',
      lead: 'Zaczynasz od sprzedaży, resztę dokładasz, kiedy jest potrzebna. Wybierz obszar.',
      source: g.areasSrc,
      data: {
        initial,
        core,
        areas: g.areas.map((area) => ({
          t: area.t,
          items: area.it.map(([t, d, id]) => {
            const slug = id ? r.one(id) : undefined
            return { t, d, ...(slug ? { slug } : {}) }
          }),
        })),
        ext: {
          items: g.ext.map((item) => {
            const slug = item.s ? r.one(item.s) : undefined
            return {
              t: item.t,
              k: item.k,
              ...(slug ? { slug } : {}),
              f: item.f,
              v: item.v.map(([n, d]) => ({ n, d })),
            }
          }),
          source: g.extSrc,
        },
      },
    }),
    section({
      variant: 'gopos-hub',
      eyebrow: 'Dowozy · GoHub',
      heading: 'Pięć aplikacji z zamówieniami. Jedna kolejka.',
      lead: g.hub.lead,
      source: g.hub.src,
      data: {
        initial,
        core,
        hubSlug: r.one('gohub') ?? 'gohub',
        platforms: g.hub.plat,
        out: g.hub.out.map(([t, d]) => ({ t, d })),
      },
    }),
    section({
      variant: 'cards',
      surface: 'muted',
      eyebrow: 'Faktury, internet, raporty',
      heading: 'KSeF, praca bez internetu i utarg w telefonie',
      items: [
        { title: 'Faktury do KSeF prosto z kasy', text: `${g.ksef.join('. ')}.`, icon: 'doc' },
        {
          title: 'Gdy padnie internet',
          text: 'System działa także przy chwilowym braku internetu — sprzedaż się nie przerywa, a dane zsynchronizują się, gdy połączenie wróci.',
          icon: 'refresh',
        },
        {
          title: 'Lokal w telefonie',
          text: 'Aplikacja GoPOS Now pokazuje sprzedaż i raporty w telefonie — z dowolnego miejsca, także gdy nie ma Cię w lokalu.',
          icon: 'chart',
        },
      ],
      source: 'Źródło: gopos.pl · stan na 26.10.2026',
    }),
    // A list with nothing known is left out: the panel would refuse it (at least one product).
    ...(devices.length > 0
      ? [
          section({
            variant: 'products',
            eyebrow: 'Sprzęt pod GoPOS',
            heading: 'Urządzenia, które wdrażamy z GoPOS',
            data: { slugs: devices, visible: 4 },
          }),
        ]
      : []),
    section({
      variant: 'gopos-package',
      anchor: 'pakiet',
      surface: 'muted',
      eyebrow: 'Konfigurator pakietu',
      heading: 'Wybierz moduły, których potrzebuje Twój lokal',
      data: {
        initial,
        core,
        modules,
        note: 'GoPOS działa w abonamencie (umowa z GoPOS), sprzęt kupujesz u nas. Wdrożenie i szkolenie w lokalu robimy my.',
        compare: {
          head: g.pakiety.h,
          rows: g.pakiety.rows,
          functions: g.pakiety.fun,
          addons: g.pakiety.dod,
          source: g.pakiety.src,
        },
      },
    }),
    section({
      variant: 'cases',
      eyebrow: 'Wyniki klientów GoPOS',
      heading: 'Liczby z lokali, które pracują na GoPOS',
      items: g.cases.map(([name, place, value, text]) => ({
        title: `${name} · ${place}`,
        label: value,
        text,
      })),
      source: g.casesSrc,
    }),
    section({
      variant: 'videos',
      anchor: 'film-gopos',
      surface: 'muted',
      eyebrow: 'Filmy GoPOS',
      heading: 'Zobacz GoPOS w akcji',
      data: {
        label: 'Film GoPOS',
        note: 'Filmy z oficjalnego kanału GoPOS. Odtwarzają się po kliknięciu.',
        videos: g.vids.map(({ id, t, k }) => ({ id, t, k })),
      },
    }),
    section({
      variant: 'steps',
      eyebrow: 'Wdrożenie',
      heading: 'Od prezentacji do pierwszego sezonu',
      items: g.steps.map(([title, text]) => ({ title, text })),
    }),
    section({
      variant: 'chips',
      surface: 'muted',
      eyebrow: 'Integracje',
      heading: 'GoPOS dogaduje się z tym, czego już używasz',
      source: g.integSrc,
      data: {
        groups: g.integ.map(([t, items]) => ({ t, items })),
        total: { v: '30+', t: 'integracji według GoPOS' },
        visible: 3,
      },
    }),
    faq('Pytania', 'Zanim zdecydujesz', g.faq),
    section({
      variant: 'band',
      eyebrow: 'Prezentacja w lokalu',
      heading: 'Pokażemy GoPOS na Twoim menu.',
      lead: 'Przyjedziemy ze sprzętem, ustawimy kilka Twoich dań i pokażemy, jak zamówienie idzie na kuchnię.',
      data: {
        actions: [
          { label: 'Umów prezentację', add: core, note: GOPOS_PRESENTATION_NOTE, primary: true },
          OFFICE_PHONE,
        ],
      },
    }),
  ]
  return { layout, missing: [...r.missing] }
}

/** `/insert` (K4h, K33 §7, K34 §5, plansza Web-InsERT). */
export function insertK4Layout(file: K4PagesFile, slugOf: SlugOf): K4Layout {
  const i = file.insert
  const r = resolver(slugOf)
  const ksefSlug = r.one('ksef')
  const pointsSlug = r.one('insert-inspunkty-ksef')
  const rules = i.rules.flatMap((rule) => {
    const slug = r.one(rule.s)
    return slug ? [{ when: rule.when, slug, why: rule.why }] : []
  })

  const layout: PageBlock[] = [
    section({
      variant: 'insert-hero',
      surface: 'dark',
      heading: 'Programy InsERT dobrane do firmy.',
      headingAccent: 'I gotowe na KSeF.',
      lead: 'Sprzedaż, magazyn, księgowość i kadry. Pomagamy wybrać program, instalujemy, przenosimy dane, łączymy z kasą i uczymy zespół na Twoich dokumentach.',
      data: {
        trail: [OFFER_CRUMB],
        pill: i.pill,
        boxes: i.shelf.flatMap(([id, name]) => {
          const slug = r.one(id)
          return slug ? [{ slug, name }] : []
        }),
        badges: [
          'Autoryzowany partner InsERT',
          'KSeF w programie',
          'Szkolenie na Twoich dokumentach',
        ],
        actions: [
          { label: 'Który Subiekt dla mnie?', href: '#ktory' },
          { label: 'KSeF w InsERT', href: '#ksef' },
        ],
      },
    }),
    section({
      variant: 'stats',
      surface: 'muted',
      eyebrow: 'InsERT w liczbach',
      items: i.stats.map(([title, text]) => ({ title, text })),
      source: i.statsSrc,
    }),
    // Without the fallback rule (no conditions) the picker could name a program by chance.
    ...(rules.some((rule) => rule.when.length === 0)
      ? [
          section({
            variant: 'insert-picker',
            anchor: 'ktory',
            eyebrow: 'Który Subiekt dla mnie?',
            heading: 'Trzy pytania — i wiesz, od czego zacząć',
            data: {
              questions: i.q.map((question) => ({ q: question.q, options: question.o })),
              rules,
            },
          }),
        ]
      : []),
    section({
      variant: 'table',
      surface: 'muted',
      eyebrow: 'Porównanie',
      heading: 'Subiekt 123, GT czy nexo?',
      data: { head: ['Cecha', ...i.cmpH], rows: i.cmp },
    }),
    ...(ksefSlug
      ? [
          section({
            variant: 'insert-ksef',
            anchor: 'ksef',
            eyebrow: 'KSeF w programach InsERT',
            heading: 'Program jest gotowy. Przygotujmy firmę.',
            lead: i.ksefLead,
            source: i.ksefSrc,
            data: {
              date: i.ksefEnd,
              timeline: i.kt,
              checklist: i.chk.map(([t, d]) => ({ t, d })),
              ksefSlug,
              pointsSlug: pointsSlug ?? ksefSlug,
            },
          }),
        ]
      : []),
    ...(pointsSlug
      ? [
          section({
            variant: 'insert-points',
            anchor: 'inspunkty',
            surface: 'muted',
            eyebrow: 'InsPunkty · Portfel InsERT',
            heading: 'Ile InsPunktów zużyje Twoja firma na KSeF?',
            lead: i.insp.lead,
            source: i.insp.src,
            data: {
              slug: pointsSlug,
              pool: i.insp.pula,
              defaults: i.insp.def,
              presets: i.insp.presets.map(([t, sales, purchases]) => ({ t, sales, purchases })),
              steps: i.insp.steps.map(([t, d]) => ({ t, d })),
              notes: i.insp.notes.map(([t, d]) => ({ t, d })),
              rules: i.portfel.map(([t, d]) => ({ t, d })),
              rulesSource: i.portfelSrc,
            },
          }),
        ]
      : []),
    section({
      variant: 'tabs',
      eyebrow: 'Cała oferta InsERT',
      heading: 'Wszystkie programy i usługi w jednym miejscu',
      lead: 'Od faktur w przeglądarce po ERP, programy dla biur rachunkowych i branżowe. Wybierz obszar.',
      source: i.allSrc,
      data: {
        tabs: i.all.map((group) => ({
          t: group.t,
          items: group.it.map(([t, l, d, id]) => {
            const slug = id ? r.one(id) : undefined
            return { t, l, d, ...(slug ? { slug } : {}) }
          }),
        })),
      },
    }),
    section({
      variant: 'cards',
      surface: 'muted',
      eyebrow: 'Wdrożenie z PRO-KOM',
      heading: 'Program to licencja. Spokój to wdrożenie.',
      items: i.tiles.map(({ t, d }) => ({ title: t, text: d })),
    }),
    section({
      variant: 'insert-requirements',
      eyebrow: 'Wymagania · Subiekt nexo',
      heading: 'Jaki komputer do Subiekta nexo?',
      lead: 'Program działa na komputerach z Windows i bazie SQL Server, którą dostajesz w zestawie. Sprawdzimy Twój sprzęt przed instalacją.',
      source: i.req.src,
      data: {
        minimum: i.req.min.map(([k, v]) => ({ k, v })),
        recommended: i.req.zal.map(([k, v]) => ({ k, v })),
        // `pc` holds product slugs already, not board ids.
        computers: i.req.pc,
      },
    }),
    section({
      variant: 'videos',
      surface: 'muted',
      eyebrow: 'Filmy InsERT',
      heading: 'Zobacz programy w działaniu',
      data: {
        label: 'Film InsERT',
        note: 'Filmy z oficjalnego kanału InsERT. Odtwarzają się po kliknięciu.',
        videos: i.vids.map(({ id, t, k }) => ({ id, t, k })),
      },
    }),
    faq('Pytania', 'Zanim wybierzesz program', i.faq),
    section({
      variant: 'band',
      eyebrow: 'Opieka nad programem',
      heading: 'Masz już program InsERT?',
      lead: 'Przejmiemy opiekę: aktualizacje, KSeF, uprawnienia, pomoc zdalna.',
      data: { actions: [{ ...OFFICE_PHONE, primary: true }] },
    }),
  ]
  return { layout, missing: [...r.missing] }
}

/** The parts of `strony-k4.json` the K4i pages use. */
export type K4FirmaFile = {
  opieka_it: {
    lead: string
    areas: { t: string; img?: string; co: string[]; p: string[] }[]
    steps: Pair[]
    dla: [string, string, string[], string | null][]
    start: Pair[]
    stan: string[]
    faq: { q: string; a: string }[]
  }
  firma: {
    stats: Pair[]
    zasady: [string, string, string][]
    linie: [string, string, string, string, boolean][]
    aut: [string, string[]][]
    tematy: [string, string, string, string, string][]
    need: string[]
    faq: { q: string; a: string }[]
    maps: string
  }
}

// Texts of the board (`Strona.dc.html`, views `opieka`, `ofirmie`, `kontakt`) that the data file
// does not carry — copied 1:1, the hours as „pn–pt 9:00–17:00” (K4-FINAL §1).
type ReportTone = 'ok' | 'warn' | 'urgent' | 'due'
const CARE_REPORT_ROWS: { t: string; d: string; s: string; tone: ReportTone }[] = [
  {
    t: 'Kopie zapasowe',
    d: 'wykonywane, ale nikt nie sprawdził odtworzenia',
    s: 'do poprawy',
    tone: 'warn',
  },
  {
    t: 'Aktualizacje Windows',
    d: '2 z 6 komputerów bez aktualizacji',
    s: 'do poprawy',
    tone: 'warn',
  },
  { t: 'Antywirus ESET', d: 'aktywny na wszystkich stanowiskach', s: 'w porządku', tone: 'ok' },
  { t: 'Konta i dostępy', d: 'aktywne konto byłego pracownika', s: 'pilne', tone: 'urgent' },
  { t: 'Licencje i podpis', d: 'odnowienie ESET za 41 dni', s: 'termin', tone: 'due' },
  { t: 'Kasa fiskalna', d: 'przegląd techniczny za 43 dni', s: 'termin', tone: 'due' },
]

const CARE_SITUATIONS: [string, string, string][] = [
  [
    'Dysk w komputerze przestaje działać',
    'Szukasz serwisu. Dane z ostatnich tygodni mogą przepaść, bo nikt nie sprawdzał kopii.',
    'Wymieniamy sprzęt i odtwarzamy dane z kopii, którą wcześniej przetestowaliśmy.',
  ],
  [
    'Pracownik odchodzi z firmy',
    'Jego hasła, poczta i dostępy do programów zostają aktywne — czasem miesiącami.',
    'Zamykamy dostępy od razu, a skrzynkę i pliki przekazujemy następcy.',
  ],
  [
    'Kasa nie łączy się z terminalem',
    'Serwis kas odsyła do informatyka, informatyk do serwisu kas. Klienci czekają.',
    'Jedno zgłoszenie. Znamy kasę, terminal i sieć, więc szukamy przyczyny, nie winnego.',
  ],
  [
    'Kończy się licencja albo podpis',
    'Dowiadujesz się, gdy program przestaje działać albo nie da się podpisać dokumentu.',
    'Pilnujemy terminów w kalendarzu firmy i odnawiamy, zanim coś stanie.',
  ],
  [
    'Przychodzi nowy pracownik',
    'Komputer, poczta i program konfigurowane w pierwszym tygodniu jego pracy.',
    'Stanowisko, konto i uprawnienia gotowe pierwszego dnia.',
  ],
]

const CARE_ON_CALL: Pair[] = [
  [
    'Zgłaszasz',
    `Telefon ${BIZNES_CONTACT.phone} albo e-mail ${BIZNES_CONTACT.email}, ${BIZNES_CONTACT.hoursText}. Rozmawiasz z zespołem, który zna Twoją firmę.`,
  ],
  [
    'Diagnoza zdalna',
    'Za Twoją zgodą łączymy się z komputerem. Większość spraw kończy się na tym etapie.',
  ],
  [
    'Na miejscu, gdy trzeba',
    'Gdy trzeba wymienić sprzęt albo coś sprawdzić — przyjeżdżamy z Rabki-Zdroju.',
  ],
  [
    'Zamknięte i zapisane',
    'Wpisujemy, co zostało zrobione, do dokumentacji firmy. Dokumentacja jest Twoja.',
  ],
]

// TODO(krystian): [SZEF] przykładowy kalendarz z planszy (miesiące i terminy) — do akceptacji.
const CARE_CALENDAR: [string, string, string][] = [
  ['STY', 'Licencja ESET', 'odnowienie'],
  ['MAR', 'Podpis kwalifikowany', 'koniec ważności certyfikatu'],
  ['MAJ', 'Kasa fiskalna', 'przegląd techniczny'],
  ['WRZ', 'Microsoft 365', 'liczba licencji po sezonie'],
  ['LIS', 'Serwer', 'koniec gwarancji — decyzja'],
]

const trustLinks = (maps: string) => [
  {
    title: 'Dane w rejestrze',
    text: 'Nazwa, adres i NIP — w publicznej wyszukiwarce firm CEIDG.',
    label: 'Sprawdź w CEIDG',
    href: 'https://www.biznes.gov.pl/pl/wyszukiwarka-firm',
  },
  {
    title: 'Autoryzowany serwis Posnet i Elzab',
    text: 'Autoryzację serwisu kas potwierdzają producenci — na swoich stronach.',
    label: 'Strona Posnet',
    href: 'https://www.posnet.com.pl',
  },
  {
    title: 'Autoryzowany partner GoPOS i InsERT',
    text: 'Status partnera sprawdzisz u producentów systemów, z którymi pracujemy.',
    label: 'Strona InsERT',
    href: 'https://www.insert.com.pl',
  },
  {
    title: 'Opinie klientów',
    text: 'Opinie o PRO-KOM w Google i Panoramie Firm — pisane przez klientów, nie przez nas.',
    label: 'Opinie w Google',
    href: maps,
  },
]

/** Who each line is for (board `LN4`; the data file has the other texts). */
const LINE_AUDIENCE: Record<string, string> = {
  Biznes: 'dla firm, gastronomii, biur i instytucji',
  Instalacje: 'domy, firmy, pensjonaty, szkoły',
  Software: 'firmy z Podhala i całej Polski',
  Tech: 'Rabka-Zdrój i okolice',
}

const CARE_NOTE = 'Opieka IT'

function linesData(file: K4FirmaFile) {
  // Decyzja Krystiana 01.11: the 4 lines of the data file (the board's Zakopane is left out).
  // TODO(krystian): linia Zakopane — dopisać, gdy będzie jej tekst i adres.
  return {
    lines: file.firma.linie.map(([n, t, d, u, here]) => ({
      n,
      t,
      d,
      w: LINE_AUDIENCE[n] ?? 'firmy i klienci indywidualni',
      u,
      here,
    })),
    note: 'pro-kom.eu — wspólne wejście do wszystkich linii, aktualności i realizacji. Nowa strona PRO-KOM — wkrótce.',
  }
}

/** `/opieka-it` (K4i, K34 §6, K35 §0, plansza Web-Opieka; H1 z planszy — decyzja Krystiana 01.11). */
export function opiekaK4Layout(file: K4FirmaFile, slugOf: SlugOf): K4Layout {
  const o = file.opieka_it
  const r = resolver(slugOf)
  // The care card (`opieka`) is a draft that redirects to this page, so the inquiry would drop
  // it: every button lists the published free IT review, the note says what it is about.
  const review = r.one('przeglad')
  const care = review
  const layout: PageBlock[] = []
  if (review) {
    layout.push(
      section({
        variant: 'care-hero',
        // „Bezpłatny przegląd IT” in the menu shortcuts and the footer leads here.
        anchor: 'przeglad',
        heading: 'Komputery, sieć i kasy pod jedną opieką.',
        headingAccent: 'Jeden numer, gdy coś stanie.',
        lead: 'Przejmujemy IT w firmie: komputery, serwer, kopie danych, sieć, pocztę, kasy i programy. Zakres i czas reakcji ustalamy w umowie. Pomagamy zdalnie i na miejscu — z Rabki-Zdroju na całe Podhale i Małopolskę.',
        data: {
          trail: [OFFER_CRUMB],
          pill: 'Opieka informatyczna · Podhale i Małopolska',
          review: {
            slug: review,
            label: 'Umów bezpłatny przegląd IT',
            note: 'Bezpłatny przegląd IT',
          },
          stats: [
            { v: '8', k: 'obszarów pod jedną opieką' },
            { v: '60 min', k: 'oddzwaniamy w godzinach pracy' },
            { v: '1', k: 'numer do komputerów, sieci i kas' },
          ],
          report: {
            title: 'Raport z przeglądu IT',
            sub: 'Przykładowa firma · 6 stanowisk',
            rows: CARE_REPORT_ROWS,
            summary: {
              n: '3',
              t: '3 sprawy do poprawy',
              d: 'Plan naprawy i wycenę opieki dostajesz na piśmie.',
            },
            badges: ['Bezpłatny przegląd na start', 'Licencje i przeglądy kas — przypominamy'],
          },
        },
      }),
    )
  }
  layout.push(
    section({
      variant: 'care-areas',
      anchor: 'zakres',
      eyebrow: 'Zakres opieki',
      heading: 'Osiem obszarów, jeden numer telefonu',
      lead: 'Wybierz obszar i zobacz, czym się zajmujemy i na jakim sprzęcie pracujemy.',
      data: {
        areas: o.areas.map((area) => ({
          t: area.t,
          co: area.co,
          products: r.many(area.p).slice(0, 4),
        })),
      },
    }),
    section({
      variant: 'table',
      surface: 'muted',
      eyebrow: 'Z opieką i bez',
      heading: 'Te same sytuacje. Dwa różne dni w firmie.',
      lead: 'Sytuacje, które zdarzają się w każdej firmie. Różnica jest w tym, czy ktoś był przygotowany, zanim się wydarzyły.',
      data: {
        head: ['Sytuacja', 'Bez stałej opieki', 'Z opieką PRO-KOM'],
        rows: CARE_SITUATIONS.map(([k, without, withCare]) => ({ k, v: [without, withCare] })),
      },
    }),
    section({
      variant: 'switch-steps',
      eyebrow: 'Jak to działa',
      heading: 'Od rozmowy do spokojnej pracy',
      data: {
        modes: [
          { t: 'Start opieki', steps: o.steps.map(([t, d]) => ({ t, d })) },
          { t: 'Gdy coś się dzieje', steps: CARE_ON_CALL.map(([t, d]) => ({ t, d })) },
        ],
      },
    }),
    section({
      variant: 'audience',
      surface: 'muted',
      eyebrow: 'Dla kogo',
      heading: 'Opieka dopasowana do rodzaju firmy',
      data: {
        items: o.dla.map(([t, k, l, img]) => {
          const image = img ? r.one(img) : undefined
          return { t, k, l, ...(image ? { image } : {}) }
        }),
      },
    }),
    section({
      variant: 'start-calendar',
      data: {
        start: {
          eyebrow: 'Na start',
          heading: 'Co porządkujemy w pierwszych tygodniach',
          items: o.start.map(([t, d]) => ({ t, d })),
        },
        calendar: {
          eyebrow: 'Terminy',
          heading: 'Pilnujemy dat, które łatwo przegapić',
          items: CARE_CALENDAR.map(([m, t, d]) => ({ m, t, d })),
          note: 'Przykładowy kalendarz firmy. Daty ustalamy dla Twojego sprzętu i licencji.',
        },
      },
    }),
    faq('Pytania', 'Zanim podpiszesz umowę', o.faq),
  )
  if (care) {
    layout.push(
      section({
        variant: 'seats',
        eyebrow: 'Wycena od zakresu',
        heading: 'Ile masz stanowisk?',
        lead: 'Zaznacz — dopiszemy to do zapytania, a wycenę od zakresu dostaniesz na piśmie.',
        data: { slug: care, options: o.stan, label: 'Zapytaj o opiekę IT', note: CARE_NOTE },
      }),
      section({
        variant: 'band',
        eyebrow: 'Opieka IT z Rabki-Zdroju',
        heading: 'Porozmawiajmy o Twojej firmie.',
        lead: 'Opowiedz, ile masz stanowisk i co Cię dziś niepokoi. Zaproponujemy zakres opieki i przygotujemy wycenę na piśmie.',
        data: {
          actions: [
            { label: 'Dodaj opiekę IT do zapytania', add: care, note: CARE_NOTE, primary: true },
            OFFICE_PHONE,
          ],
        },
      }),
    )
  }
  return { layout, missing: [...r.missing] }
}

/** `/o-firmie` (K4i, K34 §7, plansza Web-OFirmie). */
export function aboutK4Layout(file: K4FirmaFile): K4Layout {
  const f = file.firma
  const location: PageBlock = {
    blockType: 'bzLocation',
    eyebrow: 'Gdzie nas znaleźć',
    lead: 'Biuro, salon i serwis w jednym miejscu. Dojeżdżamy do firm na całym Podhalu i w Małopolsce.',
    areaLabel: 'Dojeżdżamy na całe Podhale i Małopolskę',
    phoneNote: 'oferty i serwis',
  }
  const layout: PageBlock[] = [
    section({
      variant: 'about-hero',
      heading: 'Lokalna firma IT,',
      headingAccent: 'która zostaje z klientem na lata.',
      lead: 'Od 2004 roku sprzedajemy, wdrażamy i serwisujemy kasy fiskalne, komputery, programy i sieci dla firm i instytucji z Podhala i Małopolski. Biuro, salon i serwis mamy w jednym miejscu — w Rabce-Zdroju. Telefon odbiera zespół, który zna Twoją firmę, a nie infolinia.',
      data: {
        pill: 'O firmie · PRO-KOM Tadeusz Wójciak',
        actions: [{ label: 'Jak pracujemy', href: '#zasady' }],
        // „100+ klientów firmowych” (K4-FINAL §1) — the data file, not the board's wording.
        stats: f.stats.map(([v, k]) => ({ v, k })),
        authorizations: [
          { brand: 'posnet', status: 'Autoryzowany serwis' },
          { brand: 'elzab', status: 'Autoryzowany serwis' },
          { brand: 'gopos', status: 'Autoryzowany partner' },
          { brand: 'insert', status: 'Autoryzowany partner' },
        ],
        register: {
          label: 'Dane sprawdzisz w CEIDG po numerze NIP',
          href: 'https://www.biznes.gov.pl/pl/wyszukiwarka-firm',
        },
      },
    }),
    section({
      variant: 'cards',
      eyebrow: 'Zaufanie',
      heading: 'Nie musisz wierzyć nam na słowo.',
      lead: 'Wszystko, co piszemy o sobie, możesz sprawdzić w niezależnych źródłach — zanim do nas zadzwonisz.',
      items: trustLinks(f.maps),
    }),
    section({
      variant: 'cards',
      anchor: 'zasady',
      surface: 'muted',
      eyebrow: 'Jak pracujemy',
      heading: 'Osiem zasad, które łatwo sprawdzić.',
      lead: 'Bez obietnic z ulotki — tak pracujemy na co dzień.',
      items: f.zasady.map(([, title, text], i) => ({
        title,
        text,
        label: String(i + 1).padStart(2, '0'),
      })),
    }),
    section({
      variant: 'lines',
      anchor: 'linie',
      eyebrow: 'Rodzina PRO-KOM',
      heading: f.linie.length === 4 ? 'Jedna firma, cztery linie.' : 'Jedna firma, kilka linii.',
      lead: 'Każda linia ma swoją stronę i swoich specjalistów — a za wszystkim stoi ta sama firma z Rabki-Zdroju.',
      data: linesData(file),
    }),
    section({
      variant: 'brands',
      surface: 'muted',
      eyebrow: 'Autoryzacje i partnerzy',
      heading: 'Marki, które sprzedajemy, wdrażamy i serwisujemy',
      data: {
        groups: f.aut.map(([k, names]) => ({ k, names })),
        note: 'Logotypy należą do ich właścicieli.',
        action: { label: 'Cała oferta', href: '/oferta' },
      },
    }),
    location,
    section({
      variant: 'band',
      eyebrow: 'Porozmawiajmy',
      heading: 'Opowiedz, jak pracuje Twoja firma.',
      lead: 'Przyjedziemy albo zadzwonimy. Wycenę dostajesz na piśmie, bez zobowiązań.',
      data: {
        actions: [
          { label: 'Napisz do nas', href: '/kontakt#formularz', primary: true },
          OFFICE_PHONE,
        ],
      },
    }),
  ]
  return { layout, missing: [] }
}

/** Where „Z czym dzwonisz?” cards lead (data file: `tel`, `kreator`, `form`). */
const TOPIC_LINKS: Record<string, string> = {
  tel: OFFICE_PHONE.href,
  kreator: '/konfigurator',
  form: '#formularz',
}

/** `/kontakt` (K4i, K34 §8, K4-FINAL §5, plansza Web-Kontakt). */
export function contactK4Layout(file: K4FirmaFile): K4Layout {
  const f = file.firma
  const layout: PageBlock[] = [
    section({
      variant: 'contact-hero',
      heading: 'Zadzwoń, napisz',
      headingAccent: 'albo wpadnij do Rabki.',
      lead: 'Jeden numer do ofert, serwisu, programów i awarii. Odbiera zespół z Rabki-Zdroju, który zna Twoją firmę — w godzinach pracy oddzwaniamy w ciągu 60 minut.',
      data: {
        bringNote:
          'Z kasą do przeglądu możesz przyjechać sam — zadzwoń wcześniej, przygotujemy części i papier.',
      },
    }),
    section({
      variant: 'cards',
      eyebrow: 'Z czym dzwonisz?',
      heading: 'Najczęstsze sprawy — od razu wiesz, co dalej',
      // TODO(krystian): [SZEF] „przegląd kasy co najmniej raz na 2 lata” — fakt prawny bez źródła.
      items: f.tematy.map(([, title, text, label, go]) => ({
        title,
        text,
        label,
        href: TOPIC_LINKS[go] ?? '#formularz',
      })),
    }),
    section({
      variant: 'contact-form',
      anchor: 'formularz',
      eyebrow: 'Napisz do nas',
      heading: 'Powiedz, czego potrzebujesz.',
      headingAccent: 'Resztą zajmiemy się my.',
      lead: 'Oddzwonimy w godzinach pracy z konkretną propozycją. Wycena na piśmie, bez zobowiązań.',
      data: {
        topics: f.need,
        bullets: [
          'Bez zakładania konta',
          'Bez newslettera i spamu',
          'Odpowiada człowiek z Rabki, nie infolinia',
        ],
        successText: 'Oddzwaniamy w ciągu 60 minut w godzinach pracy.',
      },
    }),
    faq('Pytania o kontakt', 'Dojazd, godziny, wyceny', f.faq),
    section({
      variant: 'lines',
      surface: 'muted',
      eyebrow: 'Inne linie PRO-KOM',
      heading: 'Szukasz monitoringu, strony albo naprawy telefonu?',
      lead: 'To też my — każda linia ma swoją stronę i swoich specjalistów.',
      data: linesData(file),
    }),
  ]
  return { layout, missing: [] }
}

/** The part of `strony-k4.json` the vending page uses. */
export type K4VendingFile = {
  automaty_vendingowe: {
    pill: string
    h1a: string
    h1b: string
    lead: string
    proof: [string, string, string][]
    co: { t: string; d: string; p: string[] }[]
    steps: Pair[]
    soft: { lead: string; f: Pair[]; src: string }
    dla: [string, string, string][]
    ref: string
    refSrc: string
    grp: Pair[]
    faq: { q: string; a: string }[]
    src: { t: string; url: string }[]
  }
}

/** The KSeF and relief texts switch on this day (D-K4-7, Europe/Warsaw). */
export const KSEF_SWITCH_DATE = '2027-01-01'

const VENDING_NOTE = 'Automat vendingowy — dobór'

/** `/automaty-vendingowe` (K4j, K32 §2, plansza Web-Vending). */
export function vendingK4Layout(file: K4VendingFile, slugOf: SlugOf): K4Layout {
  const v = file.automaty_vendingowe
  const r = resolver(slugOf)
  const layout: PageBlock[] = [
    section({
      variant: 'vending-hero',
      heading: v.h1a,
      headingAccent: v.h1b,
      lead: v.lead,
      data: {
        trail: [OFFER_CRUMB],
        // „Partner Optivendi” in full (K4-FINAL §1), not the data file's „jako partner”.
        pill: 'Automaty vendingowe · Partner Optivendi',
        logoBrand: 'optivendi',
        proof: v.proof.map(([, t, d]) => ({ t, d })),
        collage: r.many(['optivendi-pizzomat', 'optivendi-chlebomat', 'optivendi-lodomat']),
        badges: ['Pizza w 2–3 min', 'Pieczywo od świtu', 'Lody w 16 s'],
        actions: [
          { label: 'Dobierz automat', href: '#co' },
          { label: 'Porozmawiajmy', href: '/kontakt#formularz' },
        ],
      },
    }),
    section({
      variant: 'vending-picker',
      anchor: 'co',
      eyebrow: 'Co chcesz sprzedawać?',
      heading: 'Zacznij od produktu. Automat dobierzemy.',
      lead: 'Wybierz, co ma się sprzedawać — pokażemy maszyny, które się do tego nadają.',
      data: {
        tabs: v.co.flatMap((tab) => {
          const slugs = r.many(tab.p)
          return slugs.length > 0 ? [{ t: tab.t, d: tab.d, slugs }] : []
        }),
        note: VENDING_NOTE,
      },
    }),
    section({
      variant: 'steps',
      surface: 'muted',
      eyebrow: 'Jak to działa',
      heading: 'Od pomysłu do pierwszej sprzedaży',
      items: v.steps.map(([title, text]) => ({ title, text })),
    }),
    section({
      variant: 'app-mockup',
      eyebrow: 'Oprogramowanie Optivendi',
      heading: 'Automat w Twoim telefonie.',
      lead: v.soft.lead,
      source: v.soft.src,
      data: {
        features: v.soft.f.map(([t, d]) => ({ t, d })),
        // The board's screen without „−20%” (K4 audit): only „happy hour od 18:00”.
        screen: {
          title: 'Automat · hol główny',
          status: 'online',
          figures: [
            { k: 'Sprzedaż dziś', v: '86 szt.' },
            { k: 'Temperatura', v: '5,2°C' },
          ],
          rows: [
            { t: 'Woda 0,5 l', d: 'zostały 4 szt. · uzupełnij' },
            { t: 'Kanapka z kurczakiem', d: 'happy hour od 18:00' },
            { t: 'Płatności', d: 'gotówka · karta · BLIK' },
          ],
        },
      },
    }),
    section({
      variant: 'cards',
      surface: 'muted',
      eyebrow: 'Dla kogo',
      heading: 'Gdzie automat zarabia najlepiej',
      lead: v.ref,
      source: v.refSrc,
      items: v.dla.map(([title, text]) => ({ title, text })),
    }),
    section({
      variant: 'catalog-tabs',
      eyebrow: 'Cała oferta',
      heading: 'Wszystkie automaty w jednym miejscu',
      data: {
        category: 'automaty-vendingowe',
        tabs: v.grp.map(([t]) => ({ t, subcategory: t })),
        note: 'bez cen — oferta na piśmie',
      },
    }),
    faq('Pytania', 'Zanim postawisz automat', v.faq),
    section({
      variant: 'sources',
      data: { items: v.src.map(({ t, url }) => ({ t, url })), note: 'Stan na 26.10.2026.' },
    }),
    section({
      variant: 'band',
      eyebrow: 'Automaty vendingowe',
      heading: 'Sprzedawaj także wtedy, gdy Cię nie ma.',
      lead: 'Pokażemy, który automat pasuje do Twojego miejsca, i przygotujemy ofertę razem z Optivendi — jako jej partner.',
      data: {
        actions: [
          { label: 'Zapytaj o automat', href: '/kontakt#formularz', primary: true },
          OFFICE_PHONE,
        ],
      },
    }),
  ]
  return { layout, missing: [...r.missing] }
}

/**
 * `/ksef` (K4j, K35 §2, K36 §3, plansza Web-KSeF + ksef-po-2027): texts of the board in both
 * versions (D-K4-7); the switch day is a field of each section.
 */
export function ksefK4Layout(slugOf: SlugOf): K4Layout {
  const r = resolver(slugOf)
  const ask = r.one('ksef')
  const layout: PageBlock[] = []
  if (ask) {
    layout.push(
      section({
        variant: 'ksef-hero',
        data: {
          trail: [{ name: 'Oprogramowanie', href: '/oferta/programy-sprzedazowe-erp' }],
          pill: 'KSeF · Krajowy System e-Faktur',
          switchDate: KSEF_SWITCH_DATE,
          before: {
            h1a: 'KSeF bez wyjątków od 1 stycznia 2027.',
            h1b: 'Przygotuj firmę teraz.',
            lead: 'Od 1 kwietnia 2026 r. większość firm wystawia faktury w KSeF. Do końca 2026 r. najmniejsi mogą jeszcze wystawiać poza systemem faktury do 10 000 zł brutto miesięcznie, a faktury z kas fiskalnych nie muszą trafiać do KSeF. Od 1 stycznia 2027 r. te wyjątki się kończą i zaczynają obowiązywać kary.',
          },
          after: {
            h1a: 'KSeF obowiązuje wszystkie firmy.',
            h1b: 'Sprawdźmy, czy u Ciebie wszystko działa.',
            lead: 'Od 1 stycznia 2027 r. nie ma już limitu 10 000 zł ani wyjątku dla faktur z kas fiskalnych: faktury dla firm wystawiasz w KSeF, a za fakturę poza systemem albo niedosłaną w terminie z trybu offline grożą kary z art. 106ni ustawy o VAT. Sprawdzimy program, uprawnienia i tryb awaryjny.',
          },
          timeline: [
            {
              date: '2026-02-01',
              d: '1 lutego 2026',
              t: 'Najwięksi podatnicy',
              s: 'sprzedaż powyżej 200 mln zł w 2024 r.; od tej daty wszyscy odbierają faktury w KSeF',
            },
            {
              date: '2026-04-01',
              d: '1 kwietnia 2026',
              t: 'Pozostali podatnicy VAT',
              s: 'obowiązek wystawiania faktur w KSeF',
            },
            {
              date: '2026-12-31',
              d: '31 grudnia 2026',
              t: 'Koniec wyjątków',
              s: 'limit 10 000 zł poza KSeF i faktury z kas poza systemem',
            },
            {
              date: '2027-01-01',
              d: '1 stycznia 2027',
              t: 'KSeF bez wyjątków',
              s: 'faktury z kas dla firm w KSeF, kary z art. 106ni ustawy o VAT',
            },
          ],
          ask: { slug: ask, label: 'Przygotujcie moją firmę', note: 'Przygotowanie firmy do KSeF' },
        },
      }),
    )
  }
  layout.push(
    section({
      variant: 'ksef-quiz',
      eyebrow: 'Sprawdź w 30 sekund',
      heading: 'Czy KSeF dotyczy mojej firmy?',
      lead: 'Trzy pytania — i wiesz, co musisz zrobić i do kiedy.',
      data: {
        switchDate: KSEF_SWITCH_DATE,
        questions: [
          {
            key: 'b2b',
            t: 'Wystawiasz faktury dla firm?',
            options: [
              { k: 'tak', n: 'Tak' },
              { k: 'nie', n: 'Nie, tylko konsumentom' },
            ],
          },
          {
            key: 'lim',
            t: 'Ile sprzedajesz na fakturach poza KSeF miesięcznie?',
            beforeOnly: true,
            options: [
              { k: 'pod', n: 'do 10 000 zł brutto' },
              { k: 'nad', n: 'więcej' },
            ],
          },
          {
            key: 'kasa',
            t: 'Wystawiasz faktury do paragonów z kasy?',
            options: [
              { k: 'tak', n: 'Tak' },
              { k: 'nie', n: 'Nie' },
            ],
          },
        ],
        results: {
          consumer: {
            t: 'Faktury dla konsumentów nie muszą trafiać do KSeF',
            l: [
              'Możesz je wysyłać do KSeF dobrowolnie. Pamiętaj, że faktury od dostawców odbierasz już w KSeF — potrzebny jest dostęp do systemu.',
            ],
          },
          now: {
            t: 'Już teraz wystawiasz faktury w KSeF',
            l: [
              'Obowiązek dla Twojej firmy działa od 1 kwietnia 2026 r. Sprawdź program, uprawnienia i procedurę na wypadek awarii — od 1 stycznia 2027 r. za błędy grożą kary.',
            ],
          },
          soon: {
            t: 'Masz czas do 31 grudnia 2026 r.',
            l: [
              'Dopóki faktury poza KSeF nie przekraczają 10 000 zł brutto w miesiącu, możesz je jeszcze wystawiać po staremu. Od 1 stycznia 2027 r. wszystkie faktury dla firm idą przez KSeF.',
            ],
          },
          // TODO(krystian): [SZEF] wynik i pytania po 1.01.2027 (tryb offline / awaryjny) — tekst w grudniu 2026 (K4-FINAL, W6).
          after: {
            t: 'Wystawiasz faktury w KSeF',
            l: [
              'Od 1 stycznia 2027 r. wszystkie faktury dla firm idą przez KSeF, a za błędy grożą kary z art. 106ni ustawy o VAT. Sprawdź program, uprawnienia i procedurę na wypadek awarii.',
            ],
          },
          registerNote:
            'Faktury z kasy fiskalnej do końca 2026 r. mogą być poza KSeF. Od 2027 r. faktura dla firmy do paragonu z kasy online trafia do KSeF — program sprzedaży musi to obsłużyć.',
        },
      },
    }),
    section({
      variant: 'ksef-steps',
      surface: 'muted',
      eyebrow: 'Lista kontrolna',
      heading: '6 kroków do gotowości na KSeF',
      data: {
        storageKey: 'pk-ksef-kroki',
        steps: [
          {
            t: 'Sprawdź program do faktur',
            d: 'Czy Twój program wysyła faktury do KSeF i odbiera faktury zakupowe? W programach InsERT nexo i GT to jest wbudowane.',
            w: 'Subiekt, Rachmistrz, Rewizor',
          },
          {
            t: 'Dostęp i uprawnienia',
            d: 'W Aplikacji Podatnika KSeF nadajesz uprawnienia: sobie, pracownikom i biuru rachunkowemu.',
            w: 'uprawnienia dla księgowej',
          },
          {
            t: 'Certyfikat KSeF',
            d: 'Certyfikat jest potrzebny w trybie offline — do drugiego kodu QR na fakturze.',
            w: 'tryb offline i awaria',
          },
          {
            t: 'Faktury z kasy fiskalnej',
            d: 'Od 2027 r. faktura dla firmy do paragonu z kasy online idzie do KSeF. Sprawdź, jak zrobi to Twój program i kasa.',
            w: 'Posnet, Elzab, GoPOS',
          },
          {
            t: 'Procedura na awarię',
            d: 'Offline24 — dosłanie do następnego dnia roboczego, awaria KSeF — w ciągu 7 dni roboczych. Ustal, kto to robi.',
            w: 'kto, kiedy, jak',
          },
          {
            t: 'Test i szkolenie',
            d: 'Wystaw pierwsze faktury testowo, sprawdź podgląd i pobieranie zakupów, przeszkol osoby, które fakturują.',
            w: 'na Twoich dokumentach',
          },
        ],
      },
    }),
    section({
      variant: 'ksef-penalties',
      data: {
        switchDate: KSEF_SWITCH_DATE,
        penalties: {
          eyebrow: 'Od 1 stycznia 2027',
          heading: 'Kary za faktury poza KSeF',
          figures: [
            { v: 'do 100%', k: 'kwoty VAT wykazanej na fakturze' },
            { v: 'do 18,7%', k: 'kwoty brutto, gdy faktura jest bez VAT' },
          ],
          text: 'Kary przewiduje art. 106ni ustawy o VAT — m.in. za wystawienie faktury poza KSeF albo za niedosłanie w terminie faktury z trybu offline.',
          before: 'W 2026 r. obowiązuje okres przejściowy bez tych kar.',
          after: 'Okres przejściowy bez kar skończył się 31 grudnia 2026 r.',
        },
        help: {
          eyebrow: 'Jak pomagamy',
          heading: 'Od programu po pierwszą fakturę',
          items: [
            {
              t: 'Programy InsERT z KSeF',
              d: 'Subiekt, Rachmistrz i Rewizor — wybór, wdrożenie i szkolenie (autoryzowany partner).',
            },
            {
              t: 'Uprawnienia i certyfikat',
              d: 'Nadajemy uprawnienia w Aplikacji Podatnika i przygotowujemy certyfikat do trybu offline.',
            },
            {
              t: 'Kasy i POS',
              d: 'Kasy online Posnet i Elzab, GoPOS — żeby faktury do paragonów szły tak, jak wymagają przepisy.',
            },
            {
              t: 'Podpis kwalifikowany',
              d: 'EuroCert — podpis lub pieczęć do e-deklaracji i dokumentów.',
            },
          ],
          products: r.many(['ksef', 'nexo', 'euro']),
          link: { label: 'Programy InsERT z KSeF', href: '/insert' },
        },
      },
    }),
    faq('Pytania', 'KSeF w pytaniach i odpowiedziach', [
      {
        q: 'Czy KSeF jest już obowiązkowy?',
        a: 'Tak. Od 1 lutego 2026 r. dla największych firm, od 1 kwietnia 2026 r. dla pozostałych podatników VAT. Do 31 grudnia 2026 r. można jeszcze wystawiać poza KSeF faktury do łącznie 10 000 zł brutto w miesiącu.',
      },
      {
        q: 'Co zmienia się 1 stycznia 2027 r.?',
        a: 'Kończy się limit 10 000 zł poza KSeF, faktury dla firm do paragonów z kasy online trafiają do KSeF, a zaczynają obowiązywać kary z art. 106ni ustawy o VAT.',
      },
      {
        q: 'Czy faktury dla konsumentów też muszą być w KSeF?',
        a: 'Nie muszą — można je wysyłać do KSeF dobrowolnie.',
      },
      {
        q: 'Co, jeśli KSeF nie działa?',
        a: 'Fakturę wystawiasz w trybie offline lub awaryjnym i dosyłasz: w trybie offline24 do następnego dnia roboczego, przy awarii KSeF — w ciągu 7 dni roboczych od jej zakończenia.',
      },
      {
        q: 'Czy pomożecie, jeśli mamy inny program niż InsERT?',
        a: 'Tak — sprawdzimy, czy Twój program obsługuje KSeF, i pomożemy z uprawnieniami. Jeśli program nie daje rady, zaproponujemy zmianę.',
      },
    ]),
    section({
      variant: 'sources',
      data: {
        items: [
          {
            t: 'ksef.podatki.gov.pl — od kiedy trzeba wystawiać faktury w KSeF',
            url: 'https://ksef.podatki.gov.pl/od-kiedy-trzeba-wystawiac-faktury-w-ksef',
          },
          {
            t: 'KSeF 2.0 w pytaniach i odpowiedziach MF',
            url: 'https://www.podatki.biz/artykuly/ksef-2-0-w-pytaniach-i-odpowiedziach-mf-czesc-i_34_59974.htm',
          },
          {
            t: 'Ustawa o VAT, art. 106ni — kary (ISAP)',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20040540535',
          },
          // TODO(krystian): [SZEF] źródło z planszy (artykuł branżowy) — zostaje obok ISAP?
          {
            t: 'Kary od 2027 r. (art. 106ni ustawy o VAT)',
            url: 'https://bnbn.pl/ksef-zpp-apel-kary-od-stycznia-2027/',
          },
        ],
        note: 'Stan na 28.10.2026. To informacja ogólna, nie porada podatkowa — szczegóły potwierdź z księgową.',
      },
    }),
  )
  if (ask) {
    layout.push(
      section({
        variant: 'band',
        eyebrow: 'KSeF z PRO-KOM',
        heading: 'Zdążmy przed 1 stycznia.',
        lead: 'Sprawdzimy program, nadamy uprawnienia, przygotujemy certyfikat i przetestujemy pierwsze faktury — u Ciebie w firmie albo zdalnie.',
        data: {
          after: { date: KSEF_SWITCH_DATE, heading: 'Sprawdźmy Twój KSeF.' },
          actions: [
            {
              label: 'Dodaj KSeF do zapytania',
              add: ask,
              note: 'Przygotowanie firmy do KSeF',
              primary: true,
            },
            OFFICE_PHONE,
          ],
        },
      }),
    )
  }
  return { layout, missing: [...r.missing] }
}

/** `/ulga-na-kase-fiskalna` (K4j, K35 §3, plansza Web-Ulga). */
export function ulgaK4Layout(slugOf: SlugOf): K4Layout {
  const r = resolver(slugOf)
  const registers = r.many(['ergo', 'k10', 'minilt', 'pospay2'])
  const layout: PageBlock[] = [
    section({
      variant: 'ulga-hero',
      heading: 'Ulga na kasę fiskalną.',
      headingAccent: 'Do 700 zł zwrotu za każdą kasę.',
      lead: 'Jeśli zaczynasz ewidencję sprzedaży na kasie online, odliczysz 90% ceny netto każdej kasy zgłoszonej na start — maksymalnie 700 zł na kasę. Ulgę rozlicza Twoja księgowa, a my dbamy o to, żeby kasa była zafiskalizowana i gotowa w terminie.',
      data: {
        trail: [{ name: 'Kasy fiskalne', href: '/oferta/kasy-fiskalne' }],
        pill: 'Nowa firma · pierwsza kasa fiskalna',
        cards: [
          { k: 'Odliczasz', v: '90%', d: 'ceny netto kasy' },
          { k: 'Maksymalnie', v: 'do 700 zł', d: 'na każdą kasę zgłoszoną na start' },
          { k: 'Tylko', v: 'Kasa online', d: 'ulga przysługuje tylko na kasy online' },
          {
            k: 'Kto rozlicza',
            v: 'Księgowa',
            d: 'Czynny podatnik VAT — w JPK_V7; zwolniony z VAT — wniosek do urzędu skarbowego',
          },
        ],
        actions: [{ label: 'Zobacz kasy fiskalne', href: '/oferta/kasy-fiskalne' }],
      },
    }),
    section({
      variant: 'yes-no',
      eyebrow: 'Kto może skorzystać',
      heading: 'Ulga jest dla tych, którzy zaczynają',
      data: {
        yes: {
          t: 'Ulga przysługuje',
          items: [
            'Zaczynasz ewidencję sprzedaży na kasie online w obowiązującym terminie.',
            'Zaczynasz ewidencję dobrowolnie, a firma wcześniej nie używała kasy rejestrującej.',
            'Każda kasa zgłoszona w dniu rozpoczęcia ewidencji — ulga na każdą z nich.',
          ],
        },
        no: {
          t: 'Ulga nie przysługuje',
          items: [
            'Kolejna kasa kupiona po rozpoczęciu ewidencji.',
            'Kasa, która nie jest kasą online.',
            'Kasa bez faktury zakupu albo nieopłacona w całości.',
          ],
        },
      },
    }),
    section({
      variant: 'steps',
      surface: 'muted',
      eyebrow: 'Krok po kroku',
      heading: 'Od zakupu do zwrotu',
      items: [
        {
          title: 'Kupujesz kasę online',
          label: 'Ty',
          text: 'Na fakturę — i płacisz całą kwotę. Dobieramy model do Twojej sprzedaży.',
        },
        {
          title: 'Fiskalizacja i zgłoszenie',
          label: 'PRO-KOM',
          text: 'Jako autoryzowany serwis fiskalizujemy kasę i przygotowujemy dokumenty.',
        },
        {
          title: 'Start ewidencji',
          label: 'Ty',
          text: 'Zaczynasz sprzedaż na kasie w terminie. Szkolimy zespół na miejscu.',
        },
        {
          title: 'Rozliczenie ulgi',
          label: 'Twoja księgowa',
          text: 'Czynny podatnik VAT — w pliku JPK_V7. Zwolniony z VAT — wniosek do urzędu skarbowego o zwrot na konto.',
        },
      ],
    }),
    section({
      variant: 'notice',
      eyebrow: 'Uwaga na 3 lata',
      heading: 'Kiedy trzeba oddać ulgę?',
      lead: 'W ciągu 3 lat od rozpoczęcia ewidencji ulgę trzeba zwrócić m.in. wtedy, gdy:',
      data: {
        items: [
          'zaprzestaniesz działalności albo zostanie otwarta likwidacja lub upadłość,',
          'nie zgłosisz kasy w terminie na obowiązkowy przegląd techniczny,',
          'okaże się, że nie były spełnione warunki ulgi.',
        ],
        aside: {
          t: 'Pilnujemy przeglądów za Ciebie',
          d: 'Jako autoryzowany serwis Posnet i Elzab przypominamy o terminie przeglądu technicznego kasy.',
        },
      },
    }),
    ...(registers.length > 0
      ? [
          section({
            variant: 'products',
            surface: 'muted',
            eyebrow: 'Kasy online',
            heading: 'Kasy, od których zwykle zaczynamy',
            data: { slugs: registers, visible: 0 },
          }),
        ]
      : []),
    faq('Pytania', 'Ulga na kasę — pytania', [
      {
        q: 'Ile wynosi ulga na kasę fiskalną?',
        a: '90% ceny netto kasy, maksymalnie do 700 zł na każdą kasę zgłoszoną w dniu rozpoczęcia ewidencji. Ulgę rozlicza Twoja księgowa.',
      },
      {
        q: 'Czy ulga przysługuje na każdą kasę?',
        a: 'Tylko na kasy online, od których zaczynasz ewidencję. Na kolejną kasę kupioną później ulga już nie przysługuje.',
      },
      {
        q: 'Kto rozlicza ulgę?',
        a: 'Twoja księgowa: czynny podatnik VAT odlicza ją w pliku JPK_V7, a podatnik zwolniony z VAT składa wniosek o zwrot do urzędu skarbowego.',
      },
      {
        q: 'Kiedy trzeba oddać ulgę?',
        a: 'Jeśli w ciągu 3 lat od rozpoczęcia ewidencji zaprzestaniesz działalności, nie zgłosisz kasy na przegląd techniczny w terminie albo nie były spełnione warunki ulgi.',
      },
      {
        q: 'Czy pomożecie z dokumentami?',
        a: 'Fiskalizujemy kasę i przekazujemy dokumenty, które księgowa potrzebuje do rozliczenia ulgi.',
      },
    ]),
    section({
      variant: 'sources',
      data: {
        items: [
          {
            t: 'Ustawa o VAT, art. 111 ust. 4 i 6 (ISAP)',
            url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20040540535',
          },
          {
            t: 'Ulga na zakup kasy fiskalnej — 2026',
            url: 'https://poradnikprzedsiebiorcy.pl/-ulga-na-zakup-kasy-fiskalnej-kiedy',
          },
          {
            t: 'Kiedy trzeba zwrócić ulgę (art. 111 ust. 6)',
            url: 'https://www.infakt.pl/blog/zwrot-ulgi-na-kase-fiskalna-2/',
          },
        ],
        note: 'Stan na 28.10.2026. To informacja ogólna, nie porada podatkowa — ulgę rozlicza Twoja księgowa.',
      },
    }),
    section({
      variant: 'band',
      eyebrow: 'Otwierasz firmę?',
      heading: 'Kasa gotowa na dzień otwarcia.',
      lead: 'Dobierzemy kasę, zafiskalizujemy ją, przeszkolimy zespół i przypomnimy o przeglądzie. Dokumenty do ulgi przekażesz księgowej.',
      data: {
        actions: [
          { label: 'Gotowe zestawy na start', href: '/zestawy', primary: true },
          OFFICE_PHONE,
        ],
      },
    }),
  ]
  return { layout, missing: [...r.missing] }
}

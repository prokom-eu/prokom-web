import type { SectionData, SectionVariant } from '../../lib/biznes/pages/sections'
import type { IconName } from '../../lib/catalog/options'
import { hardSpaces, hardSpacesDeep } from '../../lib/text/hardSpace'
import type { BzSectionBlock, FaqBlock } from '../../payload-types'
import type { PageBlock } from './page'

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
const OFFICE_PHONE = { label: '889 003 889', href: 'tel:+48889003889' }

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
    'Telefon 889 003 889 albo e-mail biznes@pro-kom.eu, pn–pt 9:00–17:00. Rozmawiasz z zespołem, który zna Twoją firmę.',
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
  const care = r.one('opieka')
  const review = r.one('przeglad') ?? care
  const layout: PageBlock[] = []
  if (review) {
    layout.push(
      section({
        variant: 'care-hero',
        heading: 'Komputery, sieć i kasy pod jedną opieką.',
        headingAccent: 'Jeden numer, gdy coś stanie.',
        lead: 'Przejmujemy IT w firmie: komputery, serwer, kopie danych, sieć, pocztę, kasy i programy. Zakres i czas reakcji zapisujemy w umowie. Pomagamy zdalnie i na miejscu — z Rabki-Zdroju na całe Podhale i Małopolskę.',
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
  kreator: '/kreator',
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

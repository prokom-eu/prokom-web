import adresy from '../../../seed/prokominstalacje/adresy.json'
import rawNoweRozwiazania from '../../../seed/prokominstalacje/architekci/nowe-rozwiazania.json'
import rawApt from '../../../seed/prokominstalacje/obiekty/apt.json'
import rawBud from '../../../seed/prokominstalacje/obiekty/bud.json'
import rawDev from '../../../seed/prokominstalacje/obiekty/dev.json'
import rawDom from '../../../seed/prokominstalacje/obiekty/dom.json'
import rawFirma from '../../../seed/prokominstalacje/obiekty/firma.json'
import rawGmina from '../../../seed/prokominstalacje/obiekty/gmina.json'
import rawHotel from '../../../seed/prokominstalacje/obiekty/hotel.json'
import rawKosc from '../../../seed/prokominstalacje/obiekty/kosc.json'
import rawPens from '../../../seed/prokominstalacje/obiekty/pens.json'
import rawRest from '../../../seed/prokominstalacje/obiekty/rest.json'
import rawSklep from '../../../seed/prokominstalacje/obiekty/sklep.json'
import rawSzk from '../../../seed/prokominstalacje/obiekty/szk.json'
import rawOffer76 from '../../../seed/prokominstalacje/oferta-76.json'
import rawAlarmy from '../../../seed/prokominstalacje/strony-zrzut/Alarmy.json'
import rawArchitekci from '../../../seed/prokominstalacje/strony-zrzut/Architekci.json'
import rawAnteny from '../../../seed/prokominstalacje/strony-zrzut/Anteny.json'
import rawDostep from '../../../seed/prokominstalacje/strony-zrzut/Dostep.json'
import rawKontakt from '../../../seed/prokominstalacje/strony-zrzut/Kontakt.json'
import rawLadowarki from '../../../seed/prokominstalacje/strony-zrzut/Ladowarki.json'
import rawMain from '../../../seed/prokominstalacje/strony-zrzut/Main.json'
import rawMonitoring from '../../../seed/prokominstalacje/strony-zrzut/Monitoring.json'
import rawMultimedia from '../../../seed/prokominstalacje/strony-zrzut/Multimedia.json'
import rawNaglosnienie from '../../../seed/prokominstalacje/strony-zrzut/Naglosnienie.json'
import rawOFirmie from '../../../seed/prokominstalacje/strony-zrzut/OFirmie.json'
import rawOferta from '../../../seed/prokominstalacje/strony-zrzut/Oferta.json'
import rawPoradnik from '../../../seed/prokominstalacje/strony-zrzut/Poradnik.json'
import rawRealizacje from '../../../seed/prokominstalacje/strony-zrzut/Realizacje.json'
import rawSerwis from '../../../seed/prokominstalacje/strony-zrzut/Serwis.json'
import rawSieci from '../../../seed/prokominstalacje/strony-zrzut/Sieci.json'
import rawSmartHome from '../../../seed/prokominstalacje/strony-zrzut/SmartHome.json'
import rawTeletechnika from '../../../seed/prokominstalacje/strony-zrzut/Teletechnika.json'
import rawZaplanuj from '../../../seed/prokominstalacje/strony-zrzut/Zaplanuj.json'
import rawWspolne from '../../../seed/prokominstalacje/wspolne.json'
import {
  OBJECT_GROUPS,
  OBJECT_KEYS,
  OFFER_CATEGORIES,
  OFFER_FAMILIES,
  REALIZATION_KINDS,
  SERVICE_GROUPS,
  SERVICE_KEYS,
} from '../../lib/instalacje/options'
import { HOME_SLUG } from '../../lib/pages/slug'
import type {
  InstArchNew,
  InstObject,
  InstService,
  InstSolution,
  Realization,
} from '../../payload-types'
import { withoutLaw } from './bezPrzepisow'

/**
 * Pure mapping of the Instalacje package (`seed/prokominstalacje/`, v4.0) to the collections
 * (ADR-I002 §5 and „Mapa pól (I2)”). The writing is in `run.ts`; these functions are tested on
 * the real package files. UI keys of the prototype (`cls`, `on`, `open`, …) and drawings
 * (`art: [svg-path]`) are left out.
 */

// Runda v6 §1.1: every package file without law (`bezPrzepisow.ts`).
const noweRozwiazania = withoutLaw(rawNoweRozwiazania)
const apt = withoutLaw(rawApt)
const bud = withoutLaw(rawBud)
const dev = withoutLaw(rawDev)
const dom = withoutLaw(rawDom)
const firma = withoutLaw(rawFirma)
const gmina = withoutLaw(rawGmina)
const hotel = withoutLaw(rawHotel)
const kosc = withoutLaw(rawKosc)
const pens = withoutLaw(rawPens)
const rest = withoutLaw(rawRest)
const sklep = withoutLaw(rawSklep)
const szk = withoutLaw(rawSzk)
const oferta = withoutLaw(rawOffer76)
const Alarmy = withoutLaw(rawAlarmy)
const Architekci = withoutLaw(rawArchitekci)
const Anteny = withoutLaw(rawAnteny)
const Dostep = withoutLaw(rawDostep)
const Kontakt = withoutLaw(rawKontakt)
const Ladowarki = withoutLaw(rawLadowarki)
const Main = withoutLaw(rawMain)
const Monitoring = withoutLaw(rawMonitoring)
const Multimedia = withoutLaw(rawMultimedia)
const Naglosnienie = withoutLaw(rawNaglosnienie)
const OFirmie = withoutLaw(rawOFirmie)
const Oferta = withoutLaw(rawOferta)
const Poradnik = withoutLaw(rawPoradnik)
const Realizacje = withoutLaw(rawRealizacje)
const Serwis = withoutLaw(rawSerwis)
const Sieci = withoutLaw(rawSieci)
const SmartHome = withoutLaw(rawSmartHome)
const Teletechnika = withoutLaw(rawTeletechnika)
const Zaplanuj = withoutLaw(rawZaplanuj)
const wspolne = withoutLaw(rawWspolne)

type Data<T> = Omit<T, 'id' | 'tenant' | 'updatedAt' | 'createdAt' | '_status'>
export type ServiceData = Data<InstService>
export type ObjectData = Data<InstObject>
export type RealizationData = Data<Realization>

type ServiceKey = (typeof SERVICE_KEYS)[number]['value']
type ObjectKey = (typeof OBJECT_KEYS)[number]['value']
type RealizationKind = (typeof REALIZATION_KINDS)[number]['value']
type OfferCategory = (typeof OFFER_CATEGORIES)[number]['value']

/** Ids of the imported records by key: relations need them, so `run.ts` creates records first. */
export type Refs = {
  service: (key: string) => number | undefined
  object: (key: string) => number | undefined
}

// --- shapes of the package (checked against the JSON files below) ---

type Fact = string[] | { b: string; s: string }
type Tag = string | { n: string }
type SeedHero = {
  crumb?: string
  eye?: string
  h1a: string
  h1b?: string
  lead?: string
  kv?: Fact[]
  tags?: Tag[]
  cta?: string
  ctaHref?: string
}
type SeedPackage = {
  ic?: string
  n: string
  d?: string
  f?: string[]
  pr?: string
  hot?: boolean
  badge?: string
}
type SeedPage = { _title: string; _description: string }
type SeedServicePage = SeedPage & {
  dane: {
    hero: SeedHero
    anc: { href: string; n: string }[]
    pkgs: SeedPackage[]
    cena: { ic?: string; t: string; d?: string }[]
    faq: { q: string; a: string }[]
    // Cards without `k` link to other pages (Serwis, Realizacje), not services: left for I4.
    rel: { k?: string }[]
    segRel: { k: string }[]
    sx: {
      faqA: { t?: string; d?: string; cta?: string; href?: string }
      faqH?: string
      relH?: string
      pkg: { eye?: string; h?: string; p?: string; note?: string }
      cena: { btn?: string; eye?: string; h?: string; p?: string }
    }
    ctaEye?: string
    ctaH?: string
    ctaP?: string
  }
}
type SeedObject = {
  k: string
  h: string
  dla?: string
  title: string
  desc: string
  sceneT?: string
  prepEye?: string
  hero: SeedHero
  hs: { d: string }[]
  pr: { eye?: string; h?: string; ha?: string; lead?: string }
  prob: { q: string; d?: string; fix?: string; s?: string; ic?: string }[]
  day: {
    eye?: string
    h?: string
    lead?: string
    items: { tm: string; n: string; d?: string; s?: string[]; ic?: string }[]
  }
  law: { h?: string; lead?: string; items: { who?: string; a?: string; t: string; d?: string }[] }
  gory: { h?: string; items: { ic?: string; t: string; d?: string }[] }
  realH?: string
  real: { t: string; m?: string; d?: string }[]
  prep: string[]
  pkgH?: string
  pkgs: SeedPackage[]
  faqH?: string
  faq: string[][]
  rel: string[]
  anc: string[][]
  cta: string[]
  fold: string[]
}

const SERVICE_PAGES: Record<string, SeedServicePage> = {
  Monitoring,
  Alarmy,
  Dostep,
  Sieci,
  Teletechnika,
  Anteny,
  SmartHome,
  Naglosnienie,
  Multimedia,
  Ladowarki,
}
const OBJECTS: SeedObject[] = [
  dom,
  apt,
  pens,
  hotel,
  rest,
  sklep,
  firma,
  kosc,
  szk,
  gmina,
  dev,
  bud,
]

// --- helpers ---

const LINKS: Record<string, string> = { ...adresy.dc, ...adresy.prototyp }

/** A prototype link (`X.dc.html#…`, `slug.html`) → public address; the fragment stays. */
export function mapHref(href: string): string {
  const [file = '', fragment] = href.split('#', 2)
  if (!/\.html$/.test(file)) return href
  const target = LINKS[file]
  if (!target) throw new Error(`Seed (Instalacje): no address for "${file}" in adresy.json.`)
  return fragment === undefined ? target : `${target}#${fragment}`
}

const optionalHref = (href: string | undefined) => (href ? mapHref(href) : undefined)

/** Page slug from a prototype link (`SegDom.dc.html` → `dom`, last path segment). */
const slugOf = (href: string) => mapHref(href).split('/').filter(Boolean).pop() ?? HOME_SLUG

const icon = (value: string | undefined) => value?.replace(/^ikona:/, '') || undefined

/**
 * P0-2 (audit 06.11): the package asks to send photos, but no Instalacje form takes files
 * (decision „bez przesyłania plików”). The same wording as the code's fallbacks since L1-I.
 */
// Photos are welcome only as a reply to our e-mail (audit 06.11 P0-2, the allowed wording).
const PHOTO_PROMISES: Readonly<Record<string, string>> = {
  'Zależy od liczby kamer, tras kabli, wysokości montażu i rodzaju kamer. Po wizji lokalnej dostajesz wycenę na piśmie, zwykle w wariantach. Zdjęcia obiektu możesz wysłać wcześniej.':
    'Zależy od liczby kamer, tras kabli, wysokości montażu i rodzaju kamer. Po wizji lokalnej dostajesz wycenę na piśmie, zwykle w wariantach. Zdjęcia obiektu możesz wysłać w odpowiedzi na nasz e-mail.',
  'Do wyceny wystarczą zdjęcia rozdzielnicy, licznika i miejsca montażu. Ostateczną cenę podajemy na piśmie.':
    'Do wstępnej wyceny wystarczy opis rozdzielnicy, licznika i miejsca montażu — zdjęcia możesz wysłać w odpowiedzi na nasz e-mail. Ostateczną cenę podajemy na piśmie.',
  'Zrób zdjęcie dachu albo miejsca na antenę i napisz, ile telewizorów chcesz podłączyć.':
    'Opisz dach albo miejsce na antenę i napisz, ile telewizorów chcesz podłączyć. Zdjęcia możesz wysłać w odpowiedzi na nasz e-mail.',
  'Najwięcej zmieniają drzwi i integracje. Zrób zdjęcie drzwi z obu stron i boku skrzydła, a powiemy, jaki zamek pasuje.':
    'Najwięcej zmieniają drzwi i integracje. Opisz drzwi, a zdjęcia z obu stron i boku skrzydła możesz wysłać w odpowiedzi na nasz e-mail. Powiemy, jaki zamek pasuje.',
  'Wyślij zdjęcia do wyceny': 'Opisz obiekt do wyceny',
  'Wyślij zdjęcie obiektu albo obecnej instalacji. Powiemy, od czego zacząć i czego się spodziewać.':
    'Opisz obiekt albo obecną instalację. Powiemy, od czego zacząć i czego się spodziewać.',
  'Wyślij zdjęcie rozdzielnicy. Powiemy, którą ładowarkę da się podłączyć.':
    'Opisz rozdzielnicę i przyłącze. Powiemy, którą ładowarkę da się podłączyć.',
  'Nie podajemy ceny „za kamerę” w ciemno, bo dwie takie same kamery na różnych budynkach to zupełnie inna praca. Wyślij zdjęcia, a powiemy, czego się spodziewać.':
    'Nie podajemy ceny „za kamerę” w ciemno, bo dwie takie same kamery na różnych budynkach to zupełnie inna praca. Opisz obiekt, a powiemy, czego się spodziewać.',
}

/** A package text without a photo promise (P0-2). */
const noPhotos = <T extends string | undefined>(text: T): T =>
  (text === undefined ? text : (PHOTO_PROMISES[text] ?? text)) as T

/**
 * P3-23 (audit 06.11): package titles too long for Google — with „ | PRO-KOM Instalacje” (21
 * characters) every title stays ≤ 60. Keyed by the package title without the site name.
 */
export const SHORT_SEO_TITLES: Readonly<Record<string, string>> = {
  'Alarmy i wideodomofony Rabka-Zdrój, Podhale': 'Alarmy i wideodomofony na Podhalu',
  'Dostęp, monitoring i sieć dla firm, Podhale': 'Dostęp, monitoring i sieć dla firm',
  'Nagłośnienie i transmisja mszy dla parafii': 'Nagłośnienie kościoła i transmisja mszy',
  'Monitoring placu budowy bez prądu, Podhale': 'Monitoring placu budowy bez prądu',
  'Nagłośnienie lokali i kościołów, Podhale': 'Nagłośnienie lokali i kościołów',
  'Alarm i kamery dla domu i domku, Podhale': 'Alarm i kamery w domu i domku, Podhale',
  'Zamki z kodem dla apartamentów na wynajem': 'Zamki z kodem dla apartamentów na doby',
  'Monitoring i alarm dla sklepów, Zakopane': 'Monitoring i alarm w sklepie, Zakopane',
}

/**
 * Titles the seed wrote before P3-23 (fixed pages with an own title) → their successors. With
 * `SHORT_SEO_TITLES` they let the seed move an existing page forward (`forwardSeoTitle`).
 */
const FORMER_OWN_TITLES: Readonly<Record<string, string>> = {
  'Dla architektów: smart home i teletechnika': 'Dla architektów: instalacje w projekcie',
  'Zaplanuj instalację na Podhalu w 2 minuty': 'Zaplanuj instalację w 2 minuty',
  'Serwis kamer, alarmów i sieci na Podhalu': 'Serwis kamer, alarmów i sieci, Podhale',
  // Runda v6 §1.1: no „RODO” in the guide title.
  'Poradnik: monitoring, RODO i Wi-Fi': 'Poradnik: monitoring, alarmy i Wi-Fi',
}

/**
 * The new SEO title for a page that still has a former default of the seed, else `null`. Pages
 * are created once and then belong to the panel; only an untouched old default moves forward,
 * so CI snapshots, local and older databases follow P3-23 and a title edited in the panel stays.
 */
export function forwardSeoTitle(current: string | null | undefined, wanted: string): string | null {
  if (!current || current === wanted) return null
  const next = SHORT_SEO_TITLES[current] ?? FORMER_OWN_TITLES[current]
  return next === wanted ? wanted : null
}

/** The site name is added by the title template of the site settings. */
export function seoTitle(title: string): string {
  const base = title.replace(/\s*\|\s*PRO-KOM.*$/, '').trim()
  return SHORT_SEO_TITLES[base] ?? base
}

/** „Cena po wizji lokalnej” is the no-price text of the settings, not a price. */
const price = (value: string | undefined) =>
  value && /\d|\[CENA\]/.test(value) ? value : undefined

function valueOf<T extends string>(
  options: readonly { label: string; value: T }[],
  label: string,
  what: string,
): T {
  const option = options.find((o) => o.label === label)
  if (!option) throw new Error(`Seed (Instalacje): unknown ${what} "${label}".`)
  return option.value
}

const isServiceKey = (key: string | undefined): key is ServiceKey =>
  SERVICE_KEYS.some((k) => k.value === key)

const ids = (keys: string[], ref: (key: string) => number | undefined): number[] =>
  keys.map(ref).filter((id): id is number => id !== undefined)

function hero(seed: SeedHero): ServiceData['hero'] {
  return {
    crumb: seed.crumb,
    eyebrow: seed.eye,
    h1a: seed.h1a,
    h1b: seed.h1b,
    lead: seed.lead,
    facts: (seed.kv ?? []).map((fact) =>
      Array.isArray(fact)
        ? { value: fact[0] ?? '', label: fact[1] ?? '' }
        : { value: fact.b, label: fact.s },
    ),
    tags: (seed.tags ?? []).map((tag) => (typeof tag === 'string' ? tag : tag.n)),
    cta: { text: seed.cta, href: optionalHref(seed.ctaHref) },
  }
}

function withoutCta(value: ServiceData['hero']): ObjectData['hero'] {
  const { cta: _cta, ...rest } = value
  return rest
}

const packages = (seed: SeedPackage[]): NonNullable<ServiceData['packages']> =>
  seed.map((pkg) => ({
    name: pkg.n,
    icon: icon(pkg.ic),
    description: pkg.d,
    items: pkg.f ?? [],
    price: price(pkg.pr),
    badge: pkg.badge || undefined,
    featured: pkg.hot ?? false,
  }))

// --- services ---

/** Anchor bars changed after the prototype (RUNDA-V5 §10: new Teletechnika sections). */
export const ANCHORS_V5: Partial<Record<string, { anchorId: string; name: string }[]>> = {
  tel: [
    { anchorId: 'zakres', name: 'Zakres' },
    { anchorId: 'etapy', name: 'Etapy budowy' },
    { anchorId: 'przy-odbiorze', name: 'Odbiór' },
    { anchorId: 'bledy', name: 'Błędy' },
    { anchorId: 'dla-kogo', name: 'Dla kogo' },
    { anchorId: 'zapytanie', name: 'Zapytanie ofertowe' },
    { anchorId: 'faq', name: 'Pytania' },
  ],
}

export type SeedServiceItem = {
  menu: (typeof wspolne.SV)[number]
  page: SeedServicePage
}

export function servicesToImport(): SeedServiceItem[] {
  return wspolne.SV.map((menu) => {
    const file = menu.href.replace(/\.dc\.html$/, '')
    const page = SERVICE_PAGES[file]
    if (!page) throw new Error(`Seed (Instalacje): no page file for service "${menu.k}".`)
    return { menu, page }
  })
}

export function serviceData({ menu, page }: SeedServiceItem, refs: Refs): ServiceData {
  const key = menu.k
  if (!isServiceKey(key)) throw new Error(`Seed (Instalacje): unknown service key "${key}".`)
  const tile = Main.dane.u[key]
  const area = oferta.obszary.find((a) => a.usluga === key)
  if (!area) throw new Error(`Seed (Instalacje): no offer area for "${key}".`)
  const d = page.dane
  return {
    key,
    slug: slugOf(menu.href),
    name: menu.n,
    group: valueOf(SERVICE_GROUPS, menu.g, 'menu group'),
    icon: icon(menu.ic),
    color: wspolne.HU[key],
    menuCaption: menu.s,
    tile: {
      description: tile.d,
      parts: tile.parts,
      highlights: tile.hl,
      items: tile.pl,
      priceFrom: price(tile.pr),
      wide: tile.big,
    },
    offer: {
      family: valueOf(OFFER_FAMILIES, area.rodzina, 'offer family'),
      description: area.opis,
      brands: area.marki,
    },
    hero: hero(d.hero),
    anchors:
      ANCHORS_V5[key] ?? d.anc.map((a) => ({ anchorId: a.href.replace(/^#/, ''), name: a.n })),
    packagesIntro: {
      eyebrow: d.sx.pkg.eye,
      heading: d.sx.pkg.h,
      text: d.sx.pkg.p,
      note: noPhotos(d.sx.pkg.note),
    },
    packages: packages(d.pkgs),
    priceIntro: {
      eyebrow: d.sx.cena.eye,
      heading: d.sx.cena.h,
      text: noPhotos(d.sx.cena.p),
      button: noPhotos(d.sx.cena.btn),
    },
    priceFactors: d.cena.map((c) => ({ title: c.t, icon: icon(c.ic), description: c.d })),
    faqHeading: d.sx.faqH,
    faq: d.faq.map((f) => ({ question: f.q, answer: noPhotos(f.a) })),
    faqAside: {
      title: d.sx.faqA.t,
      text: noPhotos(d.sx.faqA.d),
      button: d.sx.faqA.cta,
      href: optionalHref(d.sx.faqA.href),
    },
    relatedHeading: d.sx.relH,
    relatedServices: ids(
      d.rel.flatMap((r) => (r.k ? [r.k] : [])),
      refs.service,
    ),
    similarObjects: ids(
      d.segRel.map((r) => r.k),
      refs.object,
    ),
    cta: { eyebrow: d.ctaEye, heading: noPhotos(d.ctaH), text: noPhotos(d.ctaP) },
  }
}

// --- objects ---

export type SeedObjectItem = { menu: (typeof wspolne.SG)[number]; page: SeedObject }

export function objectsToImport(): SeedObjectItem[] {
  return wspolne.SG.map((menu) => {
    const page = OBJECTS.find((o) => o.k === menu.k)
    if (!page) throw new Error(`Seed (Instalacje): no file obiekty/${menu.k}.json.`)
    return { menu, page }
  })
}

export function objectData({ menu, page: o }: SeedObjectItem, refs: Refs): ObjectData {
  const key = OBJECT_KEYS.find((k) => k.value === o.k)?.value as ObjectKey | undefined
  if (!key) throw new Error(`Seed (Instalacje): unknown object key "${o.k}".`)
  const [ctaEyebrow, ctaHeading, ctaText] = o.cta
  return {
    key,
    slug: slugOf(menu.href),
    name: menu.n,
    group: valueOf(OBJECT_GROUPS, menu.g, 'object group'),
    icon: icon(menu.ic),
    color: o.h,
    menuCaption: menu.s,
    forWhom: o.dla,
    // Object pages have no hero button: the key is left out, so the stored empty group compares equal.
    hero: withoutCta(hero(o.hero)),
    sceneTitle: o.sceneT,
    hotspots: o.hs.map((h) => ({ description: h.d })),
    anchors: o.anc.map(([anchorId = '', name = '']) => ({ anchorId, name })),
    problemsIntro: { eyebrow: o.pr.eye, heading: o.pr.h, headingAccent: o.pr.ha, text: o.pr.lead },
    problems: o.prob.map((p) => ({
      quote: p.q,
      description: p.d,
      fix: p.fix,
      service: isServiceKey(p.s) ? p.s : undefined,
      icon: icon(p.ic),
    })),
    dayIntro: { eyebrow: o.day.eye, heading: o.day.h, text: o.day.lead },
    day: o.day.items.map((item) => ({
      time: item.tm,
      name: item.n,
      description: item.d,
      services: (item.s ?? []).filter(isServiceKey),
      icon: icon(item.ic),
    })),
    // Runda v6 §1.1: no law section — stored law is cleared (the fields stay in the schema).
    lawIntro: { heading: null, text: null },
    law: [],
    mountainsIntro: { heading: o.gory.h },
    mountains: o.gory.items.map((g) => ({ title: g.t, icon: icon(g.ic), description: g.d })),
    realizationsHeading: o.realH,
    realizations: o.real.map((r) => ({ title: r.t, place: r.m, description: r.d })),
    prepareIntro: { eyebrow: o.prepEye },
    prepare: o.prep,
    packagesHeading: o.pkgH,
    packages: packages(o.pkgs),
    faqHeading: o.faqH,
    faq: o.faq.map(([question = '', answer = '']) => ({ question, answer: noPhotos(answer) })),
    relatedServices: ids(o.rel, refs.service),
    cta: { eyebrow: ctaEyebrow, heading: ctaHeading, text: ctaText },
    foldOnPhone: o.fold.map((entry) => {
      const [anchorId = '', height] = entry.split(':')
      return height ? { anchorId, maxHeight: Number(height) } : { anchorId }
    }),
    seo: { title: seoTitle(o.title), description: o.desc },
  }
}

// --- offer ---

export type SolutionItem = {
  legacyId: number
  serviceKey: ServiceKey
  data: Omit<Data<InstSolution>, 'service' | 'legacyId'>
  categories: OfferCategory[]
}

const isOfferCategory = (value: string): value is OfferCategory =>
  OFFER_CATEGORIES.some((c) => c.value === value)

/** The 76 solutions in package order; the position is the import id. */
export function solutionsToImport(): SolutionItem[] {
  let legacyId = 0
  return oferta.obszary.flatMap((area) => {
    const serviceKey = area.usluga
    if (!isServiceKey(serviceKey))
      throw new Error(`Seed (Instalacje): unknown service key "${serviceKey}" in oferta-76.json.`)
    return area.rozwiazania.map((s) => {
      const categories = s.obiekty.filter(isOfferCategory)
      if (categories.length !== s.obiekty.length) {
        throw new Error(`Seed (Instalacje): unknown offer category in "${s.nazwa}".`)
      }
      legacyId += 1
      return {
        legacyId,
        serviceKey,
        categories,
        data: { name: s.nazwa, description: s.opis, order: s.kolejnosc, categories },
      }
    })
  })
}

// --- architects' „Nowe rozwiązania” (I16b, ADR-I005 §2) ---

export type ArchNewsItem = {
  legacyId: number
  /** `doPotwierdzenia` of the package: a draft until the boss confirms (the note says what). */
  draft: boolean
  data: Omit<Data<InstArchNew>, 'publishedAt'>
}

type ArchCategory = InstArchNew['category']
type ArchType = InstArchNew['type']
const ARCH_CATEGORIES: readonly string[] = ['snd', 'scr', 'smart', 'wifi', 'kam', 'ev', 'sz']
const ARCH_TYPES: readonly string[] = ['Nowość', 'Rozwiązanie', 'Szkolenie', 'Oferta']

/**
 * The 20 cards of `architekci/nowe-rozwiazania.json` in package order (the position is the
 * import id, the order). The first card is featured (the prototype starts on it, the home's
 * „Nowość”): while it is a draft, the page and the home take the first published card.
 */
export function archNewsToImport(): ArchNewsItem[] {
  return noweRozwiazania.pozycje.map((p, index) => {
    if (!ARCH_CATEGORIES.includes(p.kategoria) || !ARCH_TYPES.includes(p.typ)) {
      throw new Error(`Seed (Instalacje): unknown category or type in „${p.tytul}”.`)
    }
    return {
      legacyId: index + 1,
      draft: Boolean(p.doPotwierdzenia),
      data: {
        legacyId: index + 1,
        title: p.tytul,
        category: p.kategoria as ArchCategory,
        type: p.typ as ArchType,
        description: p.opis,
        params: p.parametry.map((x) => ({ label: x.nazwa, value: x.wartosc })),
        planItems: p.wProjekcie.map((text) => ({ text })),
        examples: p.przyklady || null,
        places: p.gdzie.map((name) => ({ name })),
        illustration: p.ilustracja,
        order: index + 1,
        featured: index === 0,
        internalNote: p.doPotwierdzenia || null,
      },
    }
  })
}

// --- realizations ---

/**
 * The 11 realizations of `Realizacje.json`: real client names — the clients agreed to the
 * publication (boss 01.11.2026, ADR-I002 §2). The home page shows the first ones (`Main.rl`,
 * shorter names) → featured.
 */
/**
 * Services and object kind of each realization for the filters of `/realizacje` (I12): the
 * prototype's table `R` of `zrodlo/pages/Realizacje.js` (columns 6 and 7), in the order of
 * `Realizacje.json` — the package snapshot has no such keys.
 */
const REALIZATION_FILTERS: { services: ServiceKey[]; kind: RealizationKind }[] = [
  { services: ['snd', 'scr', 'wifi'], kind: 'firma' },
  { services: ['snd', 'scr'], kind: 'kosciol' },
  { services: ['snd'], kind: 'sklep' },
  { services: ['snd', 'scr'], kind: 'gastro' },
  { services: ['scr', 'snd'], kind: 'gastro' },
  { services: ['snd'], kind: 'gastro' },
  { services: ['snd'], kind: 'kosciol' },
  { services: ['snd'], kind: 'kosciol' },
  { services: ['scr'], kind: 'szkola' },
  { services: ['scr'], kind: 'sklep' },
  { services: ['ant'], kind: 'dom' },
]

export function realizationsToImport(): (RealizationData & { legacyId: number })[] {
  const featured = Main.dane.rl.length
  if (REALIZATION_FILTERS.length !== Realizacje.dane.rl.list.length) {
    throw new Error('Seed (Instalacje): REALIZATION_FILTERS does not match Realizacje.json.')
  }
  return Realizacje.dane.rl.list.map((r, index) => ({
    legacyId: index + 1,
    title: r.n,
    category: r.k,
    place: r.m,
    scope: r.z,
    description: r.ph || undefined,
    // The clients agreed to the publication (boss 01.11.2026).
    clientConsent: true,
    featured: index < featured,
    services: REALIZATION_FILTERS[index]?.services,
    kind: REALIZATION_FILTERS[index]?.kind,
  }))
}

// --- pages (ADR-I002 §0) ---

export type PageItem = { slug: string; title: string; seo: { title: string; description: string } }

const PAGE_FILES: {
  slug: string
  title: string
  file: SeedPage
  seoTitle?: string
  /** Own description when the package's is over 160 characters. */
  seoDescription?: string
}[] = [
  // I12: the package's titles of the four pages + „| PRO-KOM Instalacje” have 73–76 characters.
  { slug: 'uslugi', title: 'Pełna oferta', file: Oferta, seoTitle: 'Oferta instalacji na Podhalu' },
  // The package's title has 57 characters + „| PRO-KOM Instalacje” (SEO §2.2: ≤ 65 in all).
  {
    slug: 'zaplanuj',
    title: 'Zaplanuj instalację',
    file: Zaplanuj,
    seoTitle: 'Zaplanuj instalację w 2 minuty',
  },
  // The package's title (52 characters, no „|”) + „| PRO-KOM Instalacje” is over 65.
  {
    slug: 'kontakt',
    title: 'Kontakt',
    file: Kontakt,
    seoTitle: 'Kontakt i dojazd: Rabka-Zdrój i Podhale',
  },
  // The package's title + „| PRO-KOM Instalacje” has 66 characters.
  {
    slug: 'serwis',
    title: 'Serwis',
    file: Serwis,
    seoTitle: 'Serwis kamer, alarmów i sieci, Podhale',
  },
  // The package's title (spec §3) without „| PRO-KOM” + „| PRO-KOM Instalacje” has 71 characters.
  {
    slug: 'dla-architektow',
    title: 'Dla architektów',
    file: Architekci,
    seoTitle: 'Dla architektów: instalacje w projekcie',
    // The package's description has 211 characters (the field: ≤ 160).
    seoDescription:
      'Współpraca z architektami na Podhalu i w Małopolsce: plan urządzeń na rzutach, wytyczne do projektu, smart home Ampio, głośniki do zabudowy, monitoring.',
  },
  {
    slug: 'o-firmie',
    title: 'O firmie',
    file: OFirmie,
    seoTitle: 'O firmie: instalacje na Podhalu od 2004',
  },
  {
    slug: 'realizacje',
    title: 'Realizacje',
    file: Realizacje,
    seoTitle: 'Realizacje: nagłośnienie i multimedia',
  },
  {
    slug: 'poradnik',
    title: 'Poradnik',
    file: Poradnik,
    seoTitle: 'Poradnik: monitoring, alarmy i Wi-Fi',
  },
]

/**
 * Pages of the Instalacje tenant: the 10 services and the fixed pages (home: `home.ts`, I5). Their blocks come
 * with the sessions that build them; the import sets title and SEO (services: here, not in
 * `InstServices.seo`, because page metadata reads `Pages`). Legal pages come in I13.
 */
export function pagesToImport(): PageItem[] {
  const seo = (file: SeedPage) => ({
    title: seoTitle(file._title),
    description: file._description,
  })
  return [
    ...servicesToImport().map(({ menu, page }) => ({
      slug: slugOf(menu.href),
      title: menu.n,
      seo: seo(page),
    })),
    ...PAGE_FILES.map(({ slug, title, file, seoTitle: ownTitle, seoDescription: ownText }) => ({
      slug,
      title,
      seo: {
        title: ownTitle ?? seo(file).title,
        description: ownText ?? seo(file).description,
      },
    })),
  ]
}

import adresy from '../../../seed/prokominstalacje/adresy.json'
import apt from '../../../seed/prokominstalacje/obiekty/apt.json'
import bud from '../../../seed/prokominstalacje/obiekty/bud.json'
import dev from '../../../seed/prokominstalacje/obiekty/dev.json'
import dom from '../../../seed/prokominstalacje/obiekty/dom.json'
import firma from '../../../seed/prokominstalacje/obiekty/firma.json'
import gmina from '../../../seed/prokominstalacje/obiekty/gmina.json'
import hotel from '../../../seed/prokominstalacje/obiekty/hotel.json'
import kosc from '../../../seed/prokominstalacje/obiekty/kosc.json'
import pens from '../../../seed/prokominstalacje/obiekty/pens.json'
import rest from '../../../seed/prokominstalacje/obiekty/rest.json'
import sklep from '../../../seed/prokominstalacje/obiekty/sklep.json'
import szk from '../../../seed/prokominstalacje/obiekty/szk.json'
import oferta from '../../../seed/prokominstalacje/oferta-76.json'
import Alarmy from '../../../seed/prokominstalacje/strony-zrzut/Alarmy.json'
import Anteny from '../../../seed/prokominstalacje/strony-zrzut/Anteny.json'
import Dostep from '../../../seed/prokominstalacje/strony-zrzut/Dostep.json'
import Kontakt from '../../../seed/prokominstalacje/strony-zrzut/Kontakt.json'
import Ladowarki from '../../../seed/prokominstalacje/strony-zrzut/Ladowarki.json'
import Main from '../../../seed/prokominstalacje/strony-zrzut/Main.json'
import Monitoring from '../../../seed/prokominstalacje/strony-zrzut/Monitoring.json'
import Multimedia from '../../../seed/prokominstalacje/strony-zrzut/Multimedia.json'
import Naglosnienie from '../../../seed/prokominstalacje/strony-zrzut/Naglosnienie.json'
import OFirmie from '../../../seed/prokominstalacje/strony-zrzut/OFirmie.json'
import Oferta from '../../../seed/prokominstalacje/strony-zrzut/Oferta.json'
import Poradnik from '../../../seed/prokominstalacje/strony-zrzut/Poradnik.json'
import Realizacje from '../../../seed/prokominstalacje/strony-zrzut/Realizacje.json'
import Serwis from '../../../seed/prokominstalacje/strony-zrzut/Serwis.json'
import Sieci from '../../../seed/prokominstalacje/strony-zrzut/Sieci.json'
import SmartHome from '../../../seed/prokominstalacje/strony-zrzut/SmartHome.json'
import Teletechnika from '../../../seed/prokominstalacje/strony-zrzut/Teletechnika.json'
import Zaplanuj from '../../../seed/prokominstalacje/strony-zrzut/Zaplanuj.json'
import wspolne from '../../../seed/prokominstalacje/wspolne.json'
import {
  OBJECT_GROUPS,
  OBJECT_KEYS,
  OFFER_CATEGORIES,
  OFFER_FAMILIES,
  SERVICE_GROUPS,
  SERVICE_KEYS,
} from '../../lib/instalacje/options'
import { HOME_SLUG } from '../../lib/pages/slug'
import type { InstObject, InstService, InstSolution, Realization } from '../../payload-types'

/**
 * Pure mapping of the Instalacje package (`seed/prokominstalacje/`, v4.0) to the collections
 * (ADR-I002 §5 and „Mapa pól (I2)”). The writing is in `run.ts`; these functions are tested on
 * the real package files. UI keys of the prototype (`cls`, `on`, `open`, …) and drawings
 * (`art: [svg-path]`) are left out.
 */

type Data<T> = Omit<T, 'id' | 'tenant' | 'updatedAt' | 'createdAt' | '_status'>
export type ServiceData = Data<InstService>
export type ObjectData = Data<InstObject>
export type RealizationData = Data<Realization>

type ServiceKey = (typeof SERVICE_KEYS)[number]['value']
type ObjectKey = (typeof OBJECT_KEYS)[number]['value']
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

/** The site name is added by the title template of the site settings. */
export function seoTitle(title: string): string {
  return title.replace(/\s*\|\s*PRO-KOM.*$/, '').trim()
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
    anchors: d.anc.map((a) => ({ anchorId: a.href.replace(/^#/, ''), name: a.n })),
    packagesIntro: {
      eyebrow: d.sx.pkg.eye,
      heading: d.sx.pkg.h,
      text: d.sx.pkg.p,
      note: d.sx.pkg.note,
    },
    packages: packages(d.pkgs),
    priceIntro: {
      eyebrow: d.sx.cena.eye,
      heading: d.sx.cena.h,
      text: d.sx.cena.p,
      button: d.sx.cena.btn,
    },
    priceFactors: d.cena.map((c) => ({ title: c.t, icon: icon(c.ic), description: c.d })),
    faqHeading: d.sx.faqH,
    faq: d.faq.map((f) => ({ question: f.q, answer: f.a })),
    faqAside: {
      title: d.sx.faqA.t,
      text: d.sx.faqA.d,
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
    cta: { eyebrow: d.ctaEye, heading: d.ctaH, text: d.ctaP },
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
    lawIntro: { heading: o.law.h, text: o.law.lead },
    law: o.law.items.map((l) => ({ who: l.who, article: l.a, title: l.t, description: l.d })),
    mountainsIntro: { heading: o.gory.h },
    mountains: o.gory.items.map((g) => ({ title: g.t, icon: icon(g.ic), description: g.d })),
    realizationsHeading: o.realH,
    realizations: o.real.map((r) => ({ title: r.t, place: r.m, description: r.d })),
    prepareIntro: { eyebrow: o.prepEye },
    prepare: o.prep,
    packagesHeading: o.pkgH,
    packages: packages(o.pkgs),
    faqHeading: o.faqH,
    faq: o.faq.map(([question = '', answer = '']) => ({ question, answer })),
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

// --- realizations ---

/**
 * The 11 realizations of `Realizacje.json`: real client names, so drafts without consent
 * (ADR-I002 §2). The home page shows the first ones (`Main.rl`, shorter names) → featured.
 */
export function realizationsToImport(): (RealizationData & { legacyId: number })[] {
  const featured = Main.dane.rl.length
  return Realizacje.dane.rl.list.map((r, index) => ({
    legacyId: index + 1,
    title: r.n,
    category: r.k,
    place: r.m,
    scope: r.z,
    description: r.ph || undefined,
    clientConsent: false,
    featured: index < featured,
  }))
}

// --- pages (ADR-I002 §0) ---

export type PageItem = { slug: string; title: string; seo: { title: string; description: string } }

const PAGE_FILES: { slug: string; title: string; file: SeedPage; seoTitle?: string }[] = [
  { slug: 'uslugi', title: 'Pełna oferta', file: Oferta },
  // The package's title has 57 characters + „| PRO-KOM Instalacje” (SEO §2.2: ≤ 65 in all).
  {
    slug: 'zaplanuj',
    title: 'Zaplanuj instalację',
    file: Zaplanuj,
    seoTitle: 'Zaplanuj instalację na Podhalu w 2 minuty',
  },
  // The package's title (52 characters, no „|”) + „| PRO-KOM Instalacje” is over 65.
  {
    slug: 'kontakt',
    title: 'Kontakt',
    file: Kontakt,
    seoTitle: 'Kontakt i dojazd: Rabka-Zdrój i Zakopane',
  },
  { slug: 'serwis', title: 'Serwis', file: Serwis },
  { slug: 'o-firmie', title: 'O firmie', file: OFirmie },
  { slug: 'realizacje', title: 'Realizacje', file: Realizacje },
  { slug: 'poradnik', title: 'Poradnik', file: Poradnik },
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
    ...PAGE_FILES.map(({ slug, title, file, seoTitle: own }) => ({
      slug,
      title,
      seo: own ? { ...seo(file), title: own } : seo(file),
    })),
  ]
}

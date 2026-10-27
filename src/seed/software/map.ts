import fakty from '../../../seed/prokomsoftware/fakty.json'
import ikony from '../../../seed/prokomsoftware/ikony.json'
import kreator from '../../../seed/prokomsoftware/kreator.json'
import miejscowosci from '../../../seed/prokomsoftware/miejscowosci.json'
import nawigacja from '../../../seed/prokomsoftware/nawigacja.json'
import obszary from '../../../seed/prokomsoftware/obszary.json'
import popularne from '../../../seed/prokomsoftware/popularne.json'
import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import stronaGlowna from '../../../seed/prokomsoftware/strona-glowna.json'
import technologie from '../../../seed/prokomsoftware/technologie.json'
import wyszukiwarka from '../../../seed/prokomsoftware/wyszukiwarka.json'
import { isIconName } from '../../lib/catalog/options'
import type { City, Solution, SolutionArea } from '../../payload-types'
import { SOFTWARE_NOT_FOUND, SOFTWARE_THANKS } from './pages'

/**
 * Pure mapping of the Software package (`seed/prokomsoftware/`, v20) to the shapes of the
 * collections and settings (ADR-014). The writing is in `run.ts`; these functions are tested
 * on the real package files.
 */

type SeedSolutions = typeof rozwiazania
export type SeedSolution = SeedSolutions['items'][number]
export type SeedArea = (typeof obszary.items)[number]
export type SeedCity = (typeof miejscowosci.items)[number]

/** Finds the id of an imported solution by its slug. */
export type SolutionRef = (slug: string) => number | undefined

type Data<T> = Omit<T, 'id' | 'tenant' | 'updatedAt' | 'createdAt' | '_status'>
export type SolutionData = Data<Solution>
export type AreaData = Data<SolutionArea>
export type CityData = Data<City>

function solutionRef(ref: SolutionRef, slug: string, where: string): number {
  const id = ref(slug)
  if (id === undefined) throw new Error(`Seed (Software): ${where} → unknown solution "${slug}".`)
  return id
}

// --- solutions ---

/**
 * Solutions of the package without the ones removed from the offer (`removed`, ADR-014 v20
 * pkt 2): they never reach the database, the index or the sitemap — matched by id and slug.
 */
export function solutionsToImport(pkg: SeedSolutions = rozwiazania): SeedSolution[] {
  const ids = new Set(pkg.removed.map((item) => item.legacyId))
  const slugs = new Set(pkg.removed.map((item) => item.slug))
  return pkg.items.filter((item) => !ids.has(item.legacyId) && !slugs.has(item.slug))
}

/** Solutions removed from the offer, to warn about one left in the local database. */
export function removedSolutions(pkg: SeedSolutions = rozwiazania) {
  return pkg.removed.map(({ legacyId, slug, name }) => ({ legacyId, slug, name }))
}

/** CSS gradients of the package → card keys (ADR-014 doprecyzowania SW2a 3). */
const CARD_GRADIENT_KEYS: Record<string, NonNullable<Solution['cardGradient']>> = {
  '135deg, #F3B07C, #F7D9B5': 'peach',
  '135deg, #D8C3A8, #A38363': 'sand',
  '135deg, #BFD9CF, #7FA898': 'sage',
}

export function cardGradientKey(css: string | null): Solution['cardGradient'] {
  if (css === null) return null
  const key = CARD_GRADIENT_KEYS[css]
  if (!key) throw new Error(`Seed (Software): unknown card gradient "${css}" — add its key.`)
  return key
}

/**
 * Monthly prices and version names the package keeps only in a price note („Cena miesięczna:
 * Podstawowa 149, Standard 299, Systemy 790 zł/mies.”) — fields of the panel since SW9.
 */
const PRICE_EXTRAS: Record<
  string,
  { priceMonthly: boolean; sizeNames: { start: string; std: string; full: string } }
> = {
  'opieka-nad-strona-i-systemem': {
    priceMonthly: true,
    sizeNames: { start: 'Podstawowa', std: 'Standard', full: 'Systemy' },
  },
}

/**
 * Card, prices and the „12 rzeczy” card of one solution. Only the prices and terms per size
 * are stored; `priceFrom`/`leadTime` of the package are computed from them (ADR-014 rozstrz.
 * SW0 5). The order of the 12 cards is `SoftwareSettings.home.popular`, not `featuredOrder`.
 */
export function solutionData(item: SeedSolution): SolutionData {
  return {
    legacyId: item.legacyId,
    slug: item.slug,
    name: item.name,
    category: item.category as Solution['category'],
    label: item.label,
    tag: item.tag,
    lead: item.lead,
    features: item.features,
    forWhom: item.forWhom,
    situations: item.situations as NonNullable<Solution['situations']>,
    industryGroups: item.industryGroups as NonNullable<Solution['industryGroups']>,
    keywords: item.keywords,
    hasLivePreview: item.hasLivePreview,
    toast: item.toast,
    cardGradient: cardGradientKey(item.cardGradient),
    prices: { start: item.prices.start, std: item.prices.std, full: item.prices.full },
    leadTimes: {
      start: item.leadTimes.start,
      std: item.leadTimes.std,
      full: item.leadTimes.full,
    },
    priceNote: item.priceNote,
    priceMonthly: PRICE_EXTRAS[item.slug]?.priceMonthly ?? false,
    sizeNames: PRICE_EXTRAS[item.slug]?.sizeNames ?? { start: null, std: null, full: null },
    featured: {
      name: item.featuredName ?? null,
      tag: item.featuredTag ?? null,
      lead: item.featuredLead ?? null,
      features: item.featuredFeatures ?? [],
    },
  }
}

// --- areas ---

/** Icon names by drawing: the package gives areas the path, the panel takes a name. */
const ICONS_BY_PATH = new Map<string, string[]>()
for (const [name, path] of Object.entries(ikony.icons)) {
  ICONS_BY_PATH.set(path, [...(ICONS_BY_PATH.get(path) ?? []), name])
}

/** One name per drawing: two names with the same path (`mount`, `mountain`) stop the seed. */
function areaIcon(path: string, key: string): SolutionArea['icon'] {
  const names = ICONS_BY_PATH.get(path) ?? []
  if (names.length > 1) {
    throw new Error(`Seed (Software): area "${key}" — icon path of ${names.join(' and ')}.`)
  }
  const [name] = names
  if (!name || !isIconName(name)) {
    throw new Error(`Seed (Software): area "${key}" has an icon outside ikony.json.`)
  }
  return name
}

/** One area of the start page; its colour is the token `--grad-area-<key>` (no gradient field). */
export function areaData(item: SeedArea, ref: SolutionRef): AreaData {
  return {
    key: item.key as SolutionArea['key'],
    name: item.name,
    icon: areaIcon(item.icon, item.key),
    short: item.short,
    description: item.description,
    gain: item.gain,
    countLabel: item.countLabel,
    priceFrom: item.priceFrom,
    priceLabel: item.priceLabel,
    chips: item.chips.map((chip) => ({
      label: chip.label,
      solution: chip.solution ? solutionRef(ref, chip.solution, `area "${item.key}"`) : null,
    })),
    cta: { label: item.cta, href: item.href },
    order: item.order,
  }
}

// --- cities ---

/**
 * Hero badges as on the board `Miasto` (bold title, then text). The package has them shifted
 * by one text, so they are kept here per city; a city with badges not listed here stops the
 * seed until its badges are checked against the board.
 */
const CITY_BADGES: Record<string, { title: string; text: string }[]> = {
  'rabka-zdroj': [
    { title: 'Salon na miejscu', text: 'przyjdź z laptopem i pomysłem' },
    { title: 'Spotkanie u Ciebie', text: 'Rabka i okolice' },
  ],
}

type Pair = readonly string[]

function link([label, href]: Pair) {
  if (!label || !href) throw new Error(`Seed (Software): incomplete link [${label}, ${href}].`)
  return { link: { label, href } }
}

/** A city page: only Rabka-Zdrój has its own text at the start, the rest stay inactive. */
export function cityData(item: SeedCity, ref: SolutionRef): CityData {
  const base = { name: item.name, slug: item.slug, locative: item.locative, active: item.active }
  const { hero, who, local, faq, cta, seo } = item
  // An inactive city of the package has its name only; its text is written later (spec. §6.9).
  if (!hero && !who && !local && !faq && !cta && !seo) return base
  if (!hero || !who || !local || !faq || !cta || !seo) {
    throw new Error(`Seed (Software): city "${base.slug}" has only part of its page.`)
  }
  const badges = CITY_BADGES[item.slug]
  if (hero.badges.length && !badges) {
    throw new Error(`Seed (Software): city "${item.slug}" — check its hero badges on the board.`)
  }
  return {
    ...base,
    hero: {
      eyebrow: hero.eyebrow,
      title: hero.title,
      titleAccent: hero.titleAccent,
      lead: hero.lead,
      ctas: hero.ctas.map(link),
      badges,
    },
    who: {
      title: item.whoTitle,
      lead: item.whoLead,
      items: who.map((card) => ({
        name: card.name,
        text: card.text,
        cta: card.cta,
        solution: solutionRef(ref, card.solution, `city "${item.slug}"`),
      })),
    },
    local: { title: item.localTitle, items: local.map(([title, text]) => ({ title, text })) },
    faq: faq.map(({ q, a }) => ({ question: q, answer: a })),
    nearby: item.nearby,
    cta: { title: cta.title, text: cta.text, buttons: cta.buttons.map(link) },
    seo: { title: seo.title, description: seo.description },
  }
}

// --- settings ---

type FactRow = { key: string; value: string | null }

/** Facts [SZEF] (`SiteSettings.software.facts`); an empty value hides its sentence. */
export function factsData(): FactRow[] {
  return Object.entries(fakty.facts).map(([key, value]) => ({ key, value }))
}

/** Facts of the package missing in the panel: values saved there are never changed. */
export function missingFacts(
  stored: readonly { key?: string | null }[] | null | undefined,
  facts: FactRow[],
): FactRow[] {
  const keys = new Set((stored ?? []).map((row) => row.key))
  return facts.filter((fact) => !keys.has(fact.key))
}

/**
 * Settings JSON 1:1 with the package (ADR-014 doprecyzowania SW2a 6). `home` = the start page
 * texts without `homeOrder` (the section order is the order of the page blocks, D2) + the
 * technology layers + the 12 cards.
 */
export function softwareSettingsData() {
  const { homeOrder: _order, ...homeTexts } = structuredClone(stronaGlowna)
  return {
    navigation: structuredClone(nawigacja),
    search: {
      synonyms: wyszukiwarka.synonyms.map(({ phrase, expansions }) => ({ phrase, expansions })),
      stopWords: wyszukiwarka.stopWords,
      popular: wyszukiwarka.popular,
    },
    wizard: structuredClone(kreator),
    home: {
      ...homeTexts,
      technologies: structuredClone(technologie.layers),
      popular: { order: structuredClone(popularne.order), tabs: structuredClone(popularne.tabs) },
    },
    thanks: structuredClone(SOFTWARE_THANKS),
    notFound: structuredClone(SOFTWARE_NOT_FOUND),
  }
}

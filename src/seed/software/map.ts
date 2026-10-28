import fakty from '../../../seed/prokomsoftware/fakty.json'
import branze from '../../../seed/prokomsoftware/branze.json'
import ikony from '../../../seed/prokomsoftware/ikony.json'
import kreator from '../../../seed/prokomsoftware/kreator.json'
import miejscowosci from '../../../seed/prokomsoftware/miejscowosci.json'
import nawigacja from '../../../seed/prokomsoftware/nawigacja.json'
import obszary from '../../../seed/prokomsoftware/obszary.json'
import popularne from '../../../seed/prokomsoftware/popularne.json'
import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import stronaGlowna from '../../../seed/prokomsoftware/strona-glowna.json'
import technologie from '../../../seed/prokomsoftware/technologie.json'
import wpisy from '../../../seed/prokomsoftware/wpisy.json'
import wyszukiwarka from '../../../seed/prokomsoftware/wyszukiwarka.json'
import { isIconName } from '../../lib/catalog/options'
import type { City, Industry, Post, Solution, SolutionArea } from '../../payload-types'
import { h2, p, richText, ul } from '../biznes/lexical'
import { SOFTWARE_NOT_FOUND, SOFTWARE_THANKS } from './pages'
import { HOME_SECTION_TEXTS } from './homeExtras'
import { wizardSeed } from './wizardExtras'

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
export type IndustryData = Data<Industry>
export type PostData = Data<Post>

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
function iconOf(path: string, where: string): NonNullable<SolutionArea['icon']> {
  const names = ICONS_BY_PATH.get(path) ?? []
  if (names.length > 1) {
    throw new Error(`Seed (Software): ${where} — icon path of ${names.join(' and ')}.`)
  }
  const [name] = names
  if (!name || !isIconName(name)) {
    throw new Error(`Seed (Software): ${where} has an icon outside ikony.json.`)
  }
  return name
}

/** One area of the start page; its colour is the token `--grad-area-<key>` (no gradient field). */
export function areaData(item: SeedArea, ref: SolutionRef): AreaData {
  return {
    key: item.key as SolutionArea['key'],
    name: item.name,
    icon: iconOf(item.icon, `area "${item.key}"`),
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

// --- industries ---

type SeedIndustryPage = (typeof branze.pagesAtStart)[number]

/** Page contents of the package by name (`pagesAtStart[].content`). */
const INDUSTRY_CONTENTS = { budowlanka: branze.budowlanka } as const

/** Slug of a solution of the package by its import id (problems name them by `id`). */
function slugOfLegacyId(legacyId: number, where: string): string {
  const item = solutionsToImport().find((solution) => solution.legacyId === legacyId)
  if (!item) throw new Error(`Seed (Software): ${where} → unknown solution id ${legacyId}.`)
  return item.slug
}

/**
 * One Software industry page (ADR-014 §1.6, `branze.json` → `pagesAtStart`). Only a page with
 * content (`budowlanka`) is active; the others keep name, group and wizard kind (spec. §6.7).
 * The FAQ goes to the shared `faq` field (rozstrz. v20 8); card prices come from the solutions.
 */
export function industryData(
  page: SeedIndustryPage,
  order: number,
  ref: SolutionRef,
): IndustryData {
  const base = {
    name: page.name,
    slug: page.slug,
    active: page.active,
    order,
    software: {
      group: page.group as NonNullable<Industry['software']>['group'],
      wizardFirm: (page.wizardFirm ?? null) as NonNullable<Industry['software']>['wizardFirm'],
    },
  }
  if (page.content === null) {
    if (page.active)
      throw new Error(`Seed (Software): industry "${page.slug}" active without text.`)
    return base
  }
  const content = INDUSTRY_CONTENTS[page.content as keyof typeof INDUSTRY_CONTENTS]
  if (!content) throw new Error(`Seed (Software): industry "${page.slug}" → unknown content.`)
  const where = `industry "${page.slug}"`
  return {
    ...base,
    faq: content.faq.map(({ q, a }) => ({ question: q, answer: a })),
    software: {
      ...base.software,
      wizardTitle: content.wizardTitle,
      problems: content.problems.map((problem) => ({
        question: problem.q,
        note: problem.s,
        icon: iconOf(problem.ic, where),
        title: problem.h,
        text: problem.p,
        features: problem.f,
        solution: solutionRef(ref, slugOfLegacyId(problem.id, where), where),
        cta: { label: problem.cta, href: problem.href },
      })),
      moduleMap: content.timeline.map(([name, icon, x, y, delay]) => ({
        name: String(name),
        icon: iconOf(String(icon), where),
        x: Number(x),
        y: Number(y),
        delay: Number(delay),
      })),
      offline: content.offline.map(([, title, text]) => ({ title, text })),
      topSolutions: content.solutions.map((card) => solutionRef(ref, card.solution, where)),
    },
  }
}

/** The 12 industry pages of the package, in its order. */
export function industriesToImport(ref: SolutionRef): IndustryData[] {
  return branze.pagesAtStart.map((page, index) => industryData(page, index + 1, ref))
}

// --- posts ---

type SeedPost = (typeof wpisy.items)[number]
type SeedSection = SeedPost['sections'][number]

/** Package categories (`Poradnik`) → values of `POST_CATEGORIES`. */
const POST_CATEGORY: Record<string, Post['category']> = {
  Poradnik: 'poradnik',
  Nowości: 'nowosci',
  Realizacje: 'realizacje',
}

function sectionNodes(section: SeedSection): object[] {
  const nodes: object[] = [h2(section.h2)]
  if ('stats' in section && section.stats) {
    nodes.push(
      p(section.p),
      ul(...section.stats.map(([value, text]) => [{ bold: value }, ` ${text}`])),
    )
    return nodes
  }
  if ('compare' in section && section.compare) {
    nodes.push(ul(...section.compare.map(([title, text]) => [{ bold: `${title}:` }, ` ${text}`])))
  }
  nodes.push(p(section.p))
  return nodes
}

/**
 * A Software post of the package as a draft (`wpisy.json`): its figures are checked and the
 * sources dated on the day of publication (spec. §13), so the seed never publishes it. „W
 * skrócie” = `tldr`, the list lead goes to the SEO description; reading time is computed.
 */
export function softwarePostData(item: SeedPost, ref: SolutionRef): PostData {
  const category = POST_CATEGORY[item.category]
  if (!category) throw new Error(`Seed (Software): post "${item.slug}" → unknown category.`)
  return {
    title: item.title,
    slug: item.slug,
    category,
    lead: item.lead,
    summary: item.tldr,
    content: richText<Post['content']>(item.sections.flatMap(sectionNodes)),
    // TODO(krystian): check the figures and fill in the missing source address and every
    // „Sprawdzone dnia” in the panel before publishing (wpisy.json → sources[].note). A draft
    // is saved without validation, so the incomplete sources wait there; publishing checks them.
    sources: item.sources.map((source) => ({
      name: source.name,
      url: source.url,
      verifiedAt: source.verifiedAt,
    })) as unknown as PostData['sources'],
    relatedSolutions: item.relatedSolutions.map((slug) =>
      solutionRef(ref, slug, `post "${item.slug}"`),
    ),
    seo: { description: item.listLead },
  }
}

/** The posts of the package. */
export function softwarePosts(): SeedPost[] {
  return wpisy.items
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
 * technology layers + the 12 cards + the section headings of the board (SW5).
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
    wizard: wizardSeed(kreator),
    home: {
      ...homeTexts,
      technologies: structuredClone(technologie.layers),
      popular: { order: structuredClone(popularne.order), tabs: structuredClone(popularne.tabs) },
      sections: structuredClone(HOME_SECTION_TEXTS),
    },
    thanks: structuredClone(SOFTWARE_THANKS),
    notFound: structuredClone(SOFTWARE_NOT_FOUND),
  }
}

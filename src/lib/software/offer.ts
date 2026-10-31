import { z } from 'zod'

import type { Solution } from '@/payload-types'

import { cardPrice } from './cardPrice'
import {
  AREA_KEYS,
  type AreaKey,
  CATEGORY_AREA,
  SITUATIONS,
  SOLUTION_CATEGORIES,
  type SolutionCategory,
} from './options'
import { formatPrice } from './price'
import { firstIssue, label, obj, slug, text } from './schema'
import type { PriceDisplay } from './wizard'

/**
 * Offer window of a solution (spec. §5.1, board `Katalog`, `stany/okno-90…98`; ADR-014 v22 pkt 4,
 * decyzja SWD2 2A). Texts of one solution live in `Solutions` (W cenie, przykłady, poziomy,
 * tabela, Przykład z życia, nadpisania); texts shared by a category — steps, „Co od Ciebie”,
 * payment, ownership, questions, situations — in `SoftwareSettings.offer` (this schema), with an
 * optional override per solution. `buildOfferView` puts both together into what the window
 * renders: pure, so the catalog, „12 rzeczy” (SWR5) and the industry page (SW10) show the same.
 */

const step = obj({ name: label, text, time: z.string().trim().max(160) })
/** A question; `aFallback` replaces an answer whose window token is empty (no examples). */
const question = obj({ q: label, a: text, aFallback: text.optional() })
const situations = z.strictObject({ Z: label.optional(), R: label.optional(), P: label.optional() })
/** A „Co dostajesz” point; skipped when a card feature already says `skipIf` (board `OM_PLUS`). */
const benefit = obj({ text: label, skipIf: z.string().trim().min(2).max(40).optional() })

const template = obj({
  benefitsTitle: label,
  benefits: z.array(benefit).max(6),
  situations,
  steps: z.array(step).min(1).max(6),
  needs: z.array(label).max(6),
  needsHint: label.optional(),
  /** Full payment rule, `{platnosc}` in the questions. */
  payment: text,
  /** Payment guarantee next to the price. */
  paymentShort: label,
  ownership: label,
  /** Instead of the „W cenie” card when there is no price (apps, automations). */
  askText: text.optional(),
  /** Heading of the level choice (care, audit). */
  levelsTitle: label.optional(),
  faq: z.array(question).max(4),
})

const override = template.partial().extend({
  /** A remark under the price card (pensjonat, opieka, audyt). */
  note: text.optional(),
  /** Replaces `common.more` (przejęcie). */
  more: text.optional(),
  /** `false`: „Co dostajesz” without the card features (audyt). */
  cardFeatures: z.boolean().optional(),
  /** Level chosen when the window opens; default = the recommended one, else the first. */
  defaultLevel: z.number().int().min(0).max(2).optional(),
  /** Colour of the badge (`--grad-area-<key>`) when not the category's (audyt, przejęcie). */
  tone: z.enum(AREA_KEYS.map(({ value }) => value) as [AreaKey, ...AreaKey[]]).optional(),
})

export const softwareOfferSchema = obj({
  common: obj({
    /** First guarantee: „Wycena na piśmie, ważna 30 dni”. */
    quote: label,
    /** „Potrzebujesz więcej? Np. {wiecej} — …”. */
    more: text,
    /** `{budowa}` when the solution has no term. */
    budowaFallback: label,
    /** Under the ask text: „Odpowiadamy w ciągu [CZAS ODPOWIEDZI].” */
    askNote: label.optional(),
  }),
  categories: obj(
    Object.fromEntries(SOLUTION_CATEGORIES.map(({ value }) => [value, template])) as Record<
      SolutionCategory,
      typeof template
    >,
  ),
  solutions: z.record(slug, override),
})

export type SoftwareOffer = z.infer<typeof softwareOfferSchema>
type Template = z.infer<typeof template>
type Override = z.infer<typeof override>

export function validateSoftwareOffer(value: unknown): true | string {
  return firstIssue(softwareOfferSchema, value, 'Teksty okna oferty')
}

/** Slugs the settings point to — each must be a solution of the tenant. */
export const offerSolutionSlugs = (offer: SoftwareOffer): string[] => Object.keys(offer.solutions)

// ---------------------------------------------------------------------------------------------
// The window

type Situation = (typeof SITUATIONS)[number]['value']

/** What the window reads of one solution (the data layer maps a `Solutions` document to it). */
export type OfferSolution = {
  slug: string
  name: string
  category: SolutionCategory
  label?: string
  tag?: string
  lead?: string
  features: string[]
  forWhom?: string
  situations: readonly Situation[]
  hasLivePreview: boolean
  toast?: string
  thumbnail?: string
  priceFrom: number | null
  priceMonthly: boolean
  leadTime: string | null
  levels: {
    name: string
    shortName?: string
    price: number
    term?: string
    recommended: boolean
    description?: string
  }[]
  levelRows: { label: string; cells: string[] }[]
  included: string[]
  moreExamples: string[]
  example?: string
  benefits: string[]
  needs: string[]
  faq: { q: string; a: string }[]
}

/** A card of „Dobrze łączy się z”. */
export type RelatedCard = {
  slug: string
  name: string
  label?: string
  thumbnail?: string
  /** „od 1 999 zł netto”, „od 149 zł / mies.”, „Zapytaj o wycenę”. */
  price: string
}

export type OfferStep = { name: string; text: string; time: string }

export type OfferCell =
  | { kind: 'yes' | 'no' | 'more' }
  /** A text in the cell (reaction time, result). */
  | { kind: 'text'; text: string }

export type OfferLevel = {
  name: string
  /** Name in the table column. */
  columnName: string
  /** „149 zł”. */
  amount: string
  /** „/ mies.”, „netto”, „za darmo”. */
  suffix: string
  /** Fact and sticky bar: „299 zł / mies.”, „990 zł netto”, „0 zł”. */
  price: string
  /** Reaction time (care) or result term (audit). */
  term: string | null
  description: string | null
  recommended: boolean
  steps: OfferStep[]
  /** Sticky bar: „Opieka · poziom Rozszerzona”, „Audyt pełny”. */
  barLabel: string
  /** Name saved in „Twój projekt”: „Opieka nad stroną i systemem · poziom Rozszerzona”. */
  projectName: string
}

export type OfferPrice =
  /** One „od” price with what it includes (strony, systemy, przejęcie). */
  | {
      kind: 'included'
      head: { before: string; amount: string; after: string }
      items: string[]
      more: string | null
    }
  /** No price yet (aplikacje, automatyzacje). */
  | { kind: 'ask'; title: string; text: string | null; note: string | null }
  /** Levels of care or kinds of audit, with the comparison table — the only table (spec. §5.1). */
  | {
      kind: 'levels'
      title: string | null
      monthly: boolean
      levels: OfferLevel[]
      defaultIndex: number
      rows: { label: string; cells: OfferCell[] }[]
    }

export type OfferView = {
  slug: string
  name: string
  category: SolutionCategory
  /** „Strony”, „Opieka i audyt” — the breadcrumb „Oferta · …”. */
  categoryName: string
  /** Badge background `--grad-area-<tone>` (ADR-015 v22 pkt 3) — never a text colour. */
  tone: AreaKey
  label?: string
  lead?: string
  hasLivePreview: boolean
  toast?: string
  thumbnail?: string
  forWhom?: string
  /** First two parts of „Dla kogo” for the fact tile. */
  forWhomShort?: string
  /** „Termin”, „Czas reakcji” (care), „Wynik” (audit). */
  termLabel: string
  /** Term of a solution without levels („od 2 tygodni”, or the fallback). */
  term: string
  price: OfferPrice
  note: string | null
  /** Quote, payment and ownership; none with levels (the board shows the level choice there). */
  guarantees: string[]
  benefits: { title: string; items: string[] }
  example: string | null
  situations: string[]
  /** Steps of a solution without levels (with levels: `OfferLevel.steps`). */
  steps: OfferStep[]
  needs: string[]
  needsHint: string | null
  faq: { q: string; a: string }[]
  related: RelatedCard[]
  /** Sticky bar of a solution without levels. */
  bar: { label: string; price: string }
}

/** Fills the page tokens (`[FAKT]`, `{termin}`, `{cena:<slug>}`); `null` = drop the text. */
export type FillText = (text: string, term: string | null) => string | null

/** Window tokens; `null` = missing (the text is dropped), `''` = empty on purpose. */
type WindowTokens = Partial<
  Record<'cena' | 'wCenie' | 'wiecej' | 'platnosc' | 'budowa', string | null>
>

const WINDOW_TOKEN = /\{(cena|wCenie|wiecej|platnosc|budowa)\}/g

function windowText(value: string, tokens: WindowTokens): string | null {
  let missing = false
  const filled = value.replace(WINDOW_TOKEN, (_token, name: keyof WindowTokens) => {
    const token = tokens[name]
    if (token === null || token === undefined) missing = true
    return token ?? ''
  })
  return missing ? null : filled
}

const WORD = /[^a-ząćęłńóśźż0-9]+/

function words(value: string): string[] {
  return value
    .toLowerCase()
    .split(WORD)
    .filter((word) => word.length > 3)
}

/** The point repeats what the price card or the table already says (board `dupT`). */
function repeats(value: string, said: ReadonlySet<string>): boolean {
  const own = words(value)
  const hits = own.filter((word) => said.has(word)).length
  return hits >= 2 || (own.length > 0 && hits / own.length >= 0.5)
}

/** Defined keys of the override win; situations merge per letter. */
function merge(base: Template, extra: Override | undefined): Template & Override {
  if (!extra) return base
  const defined = Object.fromEntries(
    Object.entries(extra).filter(([, value]) => value !== undefined),
  ) as Override
  return { ...base, ...defined, situations: { ...base.situations, ...extra.situations } }
}

const lowerFirst = (value: string) => value.charAt(0).toLowerCase() + value.slice(1)

/** „Gotowa pod Google i AI” etc. as one sentence for `{wCenie}` (board `incA`). */
const includedSentence = (items: readonly string[]) =>
  items.length === 0 ? '' : `${items.map((item, i) => (i ? lowerFirst(item) : item)).join(', ')}. `

const joinHead = ({ before, amount, after }: { before: string; amount: string; after: string }) =>
  [before, amount, after].filter(Boolean).join(' ')

/** One-line price of a solution („od 1 999 zł netto”) — the related cards and the bar. */
export function priceLine(
  solution: Pick<OfferSolution, 'priceFrom' | 'priceMonthly' | 'leadTime'>,
  display: PriceDisplay,
): string {
  return joinHead(cardPrice(solution, display).head)
}

export function relatedCard(solution: OfferSolution, display: PriceDisplay): RelatedCard {
  return {
    slug: solution.slug,
    name: solution.name,
    label: solution.label,
    thumbnail: solution.thumbnail,
    price: priceLine(solution, display),
  }
}

const CELL_WORDS: Record<string, OfferCell['kind']> = { tak: 'yes', nie: 'no', dochodzi: 'more' }

function cellOf(value: string | undefined): OfferCell {
  const word = (value ?? '').trim()
  const kind = CELL_WORDS[word.toLowerCase()]
  return kind ? ({ kind } as OfferCell) : { kind: 'text', text: word }
}

/** Words after `{cena}` in a template, without the currency: „zł netto” → „netto”. */
function suffixOf(template: string): string {
  return (template.split('{cena}')[1] ?? '')
    .trim()
    .replace(/^zł\s*/, '')
    .trim()
}

type BuildOptions = {
  offer: SoftwareOffer
  display: PriceDisplay
  /** Cards of the related solutions, published ones of the same tenant, in order. */
  related: RelatedCard[]
  fill: FillText
}

/**
 * The window of one solution. Every text goes through the window tokens and then `fill` (facts,
 * `{termin}`, `{cena:<slug>}`); a text that comes back empty is left out, so is an empty section
 * (decyzja SWD2 3 — nothing is required for publishing).
 */
export function buildOfferView(solution: OfferSolution, options: BuildOptions): OfferView {
  const { offer, display, fill } = options
  const t = merge(offer.categories[solution.category], offer.solutions[solution.slug])
  const hasLevels = solution.levels.length > 0
  const hasPrice = !hasLevels && solution.priceFrom !== null
  const included = hasPrice ? solution.included : []

  const tokens: WindowTokens = {
    cena: hasPrice ? `${formatPrice(solution.priceFrom ?? 0)} zł` : null,
    wCenie: includedSentence(included),
    wiecej: solution.moreExamples.length > 0 ? solution.moreExamples.join(', ') : null,
    platnosc: t.payment,
  }
  const text = (value: string, extra: WindowTokens = {}, term = solution.leadTime) => {
    const filled = windowText(value, { ...tokens, ...extra })
    return filled === null ? null : fill(filled, term)
  }
  const texts = (values: readonly string[]) =>
    values.map((value) => text(value)).filter((value): value is string => Boolean(value))

  const stepsFor = (build: string | null): OfferStep[] =>
    t.steps.flatMap((item) => {
      const name = text(item.name)
      const body = text(item.text)
      if (!name || !body) return []
      const time = text(item.time, { budowa: build ?? offer.common.budowaFallback }) ?? ''
      return [{ name, text: body, time }]
    })

  // „Co dostajesz”: card features without what the price card / table says, then the category's
  // (or the solution's own) points, at most 6 (board).
  const said = new Set(
    (included.length > 0 ? included : solution.levelRows.map((row) => row.label)).flatMap(words),
  )
  const features = t.cardFeatures === false ? [] : solution.features
  const own = said.size > 0 ? features.filter((feature) => !repeats(feature, said)) : features
  const ownText = own.join(' ').toLowerCase()
  const extra = (
    solution.benefits.length > 0
      ? solution.benefits.map((benefit) => ({ text: benefit, skipIf: undefined }))
      : t.benefits
  ).filter(
    (item) =>
      !(item.skipIf && ownText.includes(item.skipIf.toLowerCase())) &&
      !(said.size > 0 && repeats(item.text, said)),
  )
  const benefits = texts([...own, ...extra.map((item) => item.text)]).slice(0, 6)

  const price = hasLevels
    ? levelsPrice(solution, t, display, stepsFor, text)
    : hasPrice
      ? {
          kind: 'included' as const,
          head: cardPrice(solution, display).head,
          items: texts(included),
          more: t.more ? text(t.more) : tokens.wiecej ? text(offer.common.more) : null,
        }
      : {
          kind: 'ask' as const,
          title: display.fallback,
          text: t.askText ? text(t.askText) : null,
          note: offer.common.askNote ? text(offer.common.askNote) : null,
        }

  const term = solution.leadTime ?? display.termFallback
  const situationText = (letter: Situation) =>
    t.situations[letter] ?? SITUATIONS.find(({ value }) => value === letter)?.label ?? letter
  const faq = (
    solution.faq.length > 0
      ? solution.faq.map(({ q, a }) => ({ q, a, aFallback: undefined }))
      : t.faq
  ).flatMap((item) => {
    const q = text(item.q)
    const a = text(item.a) ?? (item.aFallback ? text(item.aFallback) : null)
    return q && a ? [{ q, a }] : []
  })

  return {
    slug: solution.slug,
    name: solution.name,
    category: solution.category,
    categoryName:
      SOLUTION_CATEGORIES.find(({ value }) => value === solution.category)?.label ??
      solution.category,
    tone: t.tone ?? CATEGORY_AREA[solution.category],
    label: solution.label,
    lead: solution.lead,
    hasLivePreview: solution.hasLivePreview,
    toast: solution.toast,
    thumbnail: solution.thumbnail,
    forWhom: solution.forWhom,
    forWhomShort: solution.forWhom?.split(',').slice(0, 2).join(','),
    termLabel: hasLevels ? (solution.priceMonthly ? 'Czas reakcji' : 'Wynik') : 'Termin',
    term,
    price,
    note: t.note ? text(t.note) : null,
    guarantees: hasLevels ? [] : texts([offer.common.quote, t.paymentShort, t.ownership]),
    benefits: { title: t.benefitsTitle, items: benefits },
    example: solution.example ? text(solution.example) : null,
    situations: (['Z', 'R', 'P'] as const)
      .filter((letter) => solution.situations.includes(letter))
      .map(situationText),
    steps: hasLevels ? [] : stepsFor(solution.leadTime),
    needs: texts(solution.needs.length > 0 ? solution.needs : t.needs),
    needsHint: t.needsHint ? text(t.needsHint) : null,
    faq,
    related: options.related,
    bar: {
      label: solution.priceFrom === null ? 'Cena i termin' : `Termin ${term}`,
      price: solution.priceFrom === null ? 'po rozmowie' : priceLine(solution, display),
    },
  }
}

function levelsPrice(
  solution: OfferSolution,
  t: Template & Override,
  display: PriceDisplay,
  stepsFor: (build: string | null) => OfferStep[],
  text: (value: string) => string | null,
): Extract<OfferPrice, { kind: 'levels' }> {
  const monthly = solution.priceMonthly
  const kind = solution.label ?? solution.name
  const levels = solution.levels.map((level): OfferLevel => {
    const amount = `${formatPrice(level.price)} zł`
    const suffix =
      level.price === 0 ? 'za darmo' : suffixOf(monthly ? display.monthTemplate : display.template)
    return {
      name: level.name,
      columnName: level.shortName ?? level.name,
      amount,
      suffix,
      price: level.price === 0 ? amount : `${amount} ${suffix}`,
      term: level.term ?? null,
      description: level.description ? text(level.description) : null,
      recommended: level.recommended,
      steps: stepsFor(level.term ?? null),
      barLabel: monthly ? `${kind} · poziom ${level.name}` : `${kind} ${lowerFirst(level.name)}`,
      projectName: `${solution.name} · ${monthly ? 'poziom ' : ''}${level.name}`,
    }
  })
  const recommended = levels.findIndex((level) => level.recommended)
  const wanted = t.defaultLevel ?? (recommended >= 0 ? recommended : 0)
  return {
    kind: 'levels',
    title: t.levelsTitle ? text(t.levelsTitle) : null,
    monthly,
    levels,
    defaultIndex: Math.min(wanted, levels.length - 1),
    rows: solution.levelRows.map((row) => ({
      label: row.label,
      cells: levels.map((_, i) => cellOf(row.cells[i])),
    })),
  }
}

/** Fields of a solution the window reads (the `select` of `getOfferViews`). */
export type OfferSolutionDoc = Pick<
  Solution,
  | 'slug'
  | 'name'
  | 'category'
  | 'label'
  | 'tag'
  | 'lead'
  | 'features'
  | 'forWhom'
  | 'situations'
  | 'hasLivePreview'
  | 'toast'
  | 'thumbnail'
  | 'priceFrom'
  | 'priceMonthly'
  | 'leadTime'
  | 'levels'
  | 'levelRows'
  | 'included'
  | 'moreExamples'
  | 'example'
  | 'benefits'
  | 'needs'
  | 'faq'
>

const clean = (value: string | null | undefined): string | undefined => value?.trim() || undefined
const list = (values: readonly string[] | null | undefined): string[] =>
  (values ?? []).map((value) => value.trim()).filter(Boolean)
const isPrice = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

/** A stored solution as the window reads it: empty texts dropped, prices checked. */
export function offerSolutionOf(doc: OfferSolutionDoc): OfferSolution {
  // A level without a valid price (a draft, old data) is left out — with its table column.
  const priced = (doc.levels ?? []).flatMap((level, index) =>
    isPrice(level.price) ? [{ level, index }] : [],
  )
  return {
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    label: clean(doc.label),
    tag: clean(doc.tag),
    lead: clean(doc.lead),
    features: list(doc.features),
    forWhom: clean(doc.forWhom),
    situations: doc.situations ?? [],
    hasLivePreview: Boolean(doc.hasLivePreview),
    toast: clean(doc.toast),
    thumbnail: clean(doc.thumbnail),
    priceFrom: isPrice(doc.priceFrom) ? doc.priceFrom : null,
    priceMonthly: Boolean(doc.priceMonthly),
    leadTime: clean(doc.leadTime) ?? null,
    levels: priced.map(({ level }) => ({
      name: level.name,
      shortName: clean(level.shortName),
      price: level.price,
      term: clean(level.term),
      recommended: Boolean(level.recommended),
      description: clean(level.description),
    })),
    // The table keeps the cells of the levels that stay, so columns never shift.
    levelRows: (doc.levelRows ?? []).map((row) => ({
      label: row.label,
      cells: priced.map(({ index }) => row.cells?.[index] ?? ''),
    })),
    included: list(doc.included),
    moreExamples: list(doc.moreExamples),
    example: clean(doc.example),
    benefits: list(doc.benefits),
    needs: list(doc.needs),
    faq: (doc.faq ?? []).flatMap(({ q, a }) => (q.trim() && a.trim() ? [{ q, a }] : [])),
  }
}

const emptyTemplate: Template = {
  benefitsTitle: '',
  benefits: [],
  situations: {},
  steps: [],
  needs: [],
  payment: '',
  paymentShort: '',
  ownership: '',
  faq: [],
}

/**
 * Settings not saved yet (or in an old shape): the window still shows everything of the solution
 * itself (price, W cenie, poziomy, przykład), only the shared category texts are missing.
 */
export const EMPTY_OFFER: SoftwareOffer = {
  common: { quote: '', more: '', budowaFallback: '' },
  categories: {
    strony: emptyTemplate,
    systemy: emptyTemplate,
    aplikacje: emptyTemplate,
    automatyzacje: emptyTemplate,
    opieka: emptyTemplate,
  },
  solutions: {},
}

/**
 * Windows a page sends for its cards (start page „12 rzeczy”, SWR5): those of `slugs` and of their
 * „Dobrze łączy się z” (one level), not all of the tenant's — fewer bytes on the heaviest page. A
 * related card that would switch to a window not sent is left out (the window never goes blank).
 */
export function offerViewsFor(
  views: Readonly<Record<string, OfferView>>,
  slugs: readonly string[],
): Record<string, OfferView> {
  const keep = new Set<string>()
  for (const slug of slugs) {
    const view = views[slug]
    if (!view) continue
    keep.add(slug)
    for (const card of view.related) if (views[card.slug]) keep.add(card.slug)
  }
  return Object.fromEntries(
    [...keep].map((slug) => {
      const view = views[slug]!
      return [slug, { ...view, related: view.related.filter((card) => keep.has(card.slug)) }]
    }),
  )
}

import { z } from 'zod'

import { formatPrice } from './price'
import type { PREVIEW_FEATURES, PriceDisplay, SoftwareWizard, WizardCondition } from './wizard'

/**
 * What the Software wizard shows and sends (`/dobierz`, spec. §6.3), computed from the rules in
 * `SoftwareSettings.wizard` only — the components and the server call these functions and never
 * test need ids themselves (SW7). The one fixed id is `own` („Opisz po swojemu”), the key the
 * schema reserves in `mapping`. v22: one „od” price, no sizes (ADR-014 v22 pkt 10).
 */

export const OWN = 'own'

/** Address of the wizard page (the start page has it as section `#dobierz`, SW5). */
export const WIZARD_PATH = '/dobierz'

/** Steps of the wizard: Potrzeba → Szczegóły → Zakres (z opisem) → Wynik. */
export type WizardStep = 'need' | 'detail' | 'scope' | 'describe' | 'result'

const STEPS: readonly WizardStep[] = ['need', 'detail', 'scope', 'result']
/** „Opisz po swojemu”: Potrzeba → Twój opis → Wynik (`stepsOwn`). */
const STEPS_OWN: readonly WizardStep[] = ['need', 'describe', 'result']

/** The steps of this path, in order — names from `steps` / `stepsOwn` by the same index. */
export function stepsOf(answers: Pick<WizardAnswers, 'own'>): readonly WizardStep[] {
  return answers.own ? STEPS_OWN : STEPS
}

export type WizardAnswers = {
  /** Id of `needs`; `null` before the first click and in „Opisz po swojemu”. */
  need: string | null
  own: boolean
  /** Answers to the need's question (one, or several when `multi`). */
  options: string[]
  /** Chip of the need's `haves` set. */
  have: string | null
  /** Address of the current site (needs with `url`). */
  url: string
  when: string | null
  description: string
  /**
   * Positions in „Co będzie potrzebne” (`results[].nd`) the customer already has. Positions, not
   * texts: the browser gets the texts with facts filled in, the server compares with the rules.
   */
  checklist: number[]
  /** Ticked „Potrzebujesz czegoś więcej?” (`scope.<result>.moreExamples[].id`) — to quote. */
  more: string[]
  /** Added „Często dobierane razem” (`addOns.items[].id`). */
  addOns: string[]
  /** „Chcesz sprzedawać online?” accepted: the result is `shopHint.toShop.result`. */
  shop: boolean
  /** `contactPrefs[].id`; `null` = the first one. */
  contactPref: string | null
}

export const EMPTY_ANSWERS: WizardAnswers = {
  need: null,
  own: false,
  options: [],
  have: null,
  url: '',
  when: null,
  description: '',
  checklist: [],
  more: [],
  addOns: [],
  shop: false,
  contactPref: null,
}

/** A level of a solution (care): its own price. */
export type WizardLevel = { name: string; price: number }

/** What the wizard needs of a solution it prices with (from the solutions index). */
export type WizardSolution = {
  name: string
  /** The one „od” price (ADR-014 v22 pkt 1); `null` → „Zapytaj o wycenę”, `0` → free. */
  priceFrom: number | null
  /** „od 2 tygodni” as stored; `null` → `termFallback`. */
  leadTime: string | null
  priceMonthly: boolean
  levels: WizardLevel[]
}

type Solutions = Readonly<Record<string, WizardSolution>>
type Need = SoftwareWizard['needs'][string]
type Result = SoftwareWizard['results'][string]
type Scope = SoftwareWizard['scope'][string]

/** The needs in their order (`needOrder`), as `[id, need]`. */
export function orderedNeeds(rules: SoftwareWizard): [string, Need][] {
  return rules.needOrder.flatMap((id) =>
    rules.needs[id] ? [[id, rules.needs[id]] as [string, Need]] : [],
  )
}

export function needOf(rules: SoftwareWizard, answers: WizardAnswers): Need | null {
  return answers.own || answers.need === null ? null : (rules.needs[answers.need] ?? null)
}

/** Result of `mapping` (per answer, `*` = any other), before the shop switch. */
function mappedResultId(rules: SoftwareWizard, answers: WizardAnswers): string {
  const key = answers.own || answers.need === null ? OWN : answers.need
  const target = rules.mapping[key] ?? rules.mapping[OWN]
  if (target === undefined) return OWN
  if (typeof target === 'string') return target
  const first = answers.options[0]
  return (first !== undefined ? target[first] : undefined) ?? target['*'] ?? OWN
}

type Context = {
  need: string | null
  options: string[]
  result: string
  kind: string
  have: string | null
  when: string | null
  /** An answer outside `scope.<result>.featuresInPrice`. */
  outsidePrice: boolean
}

function contextFor(rules: SoftwareWizard, answers: WizardAnswers, result: string): Context {
  const inPrice = scopeOf(rules, result)?.featuresInPrice
  return {
    need: answers.own ? null : answers.need,
    options: answers.options,
    result,
    kind: rules.results[result]?.kind ?? '',
    have: answers.have,
    when: answers.when,
    outsidePrice: !!inPrice && answers.options.some((option) => !inPrice.includes(option)),
  }
}

function matches(condition: WizardCondition, context: Context): boolean {
  const { needs, options, results, kinds, haves, whens, minOptions, outsidePrice } = condition
  if (needs && (context.need === null || !needs.includes(context.need))) return false
  if (options && !options.some((option) => context.options.includes(option))) return false
  if (results && !results.includes(context.result)) return false
  if (kinds && !kinds.includes(context.kind)) return false
  if (haves && (context.have === null || !haves.includes(context.have))) return false
  if (whens && (context.when === null || !whens.includes(context.when))) return false
  if (minOptions !== undefined && context.options.length < minOptions) return false
  if (outsidePrice && !context.outsidePrice) return false
  return true
}

const anyMatches = (conditions: WizardCondition[], context: Context) =>
  conditions.some((condition) => matches(condition, context))

/** The shop hint applies to these answers (shown with either side). */
export function shopHintApplies(rules: SoftwareWizard, answers: WizardAnswers): boolean {
  const base = mappedResultId(rules, answers)
  return anyMatches(rules.shopHint.when, contextFor(rules, answers, base))
}

/** Id of the recommended result (`mapping`, then the accepted shop hint). */
export function resultIdOf(rules: SoftwareWizard, answers: WizardAnswers): string {
  if (answers.shop && shopHintApplies(rules, answers)) return rules.shopHint.toShop.result
  return mappedResultId(rules, answers)
}

function contextOf(rules: SoftwareWizard, answers: WizardAnswers): Context {
  return contextFor(rules, answers, resultIdOf(rules, answers))
}

function scopeOf(rules: SoftwareWizard, result: string): Scope | undefined {
  return result === '_info' ? undefined : rules.scope[result]
}

const nameIn = (list: { id: string; n: string }[], id: string | null) =>
  id === null ? undefined : list.find((item) => item.id === id)?.n

/**
 * `{data}` of the term notes: the deadline as Polish words („30 listopada”). The text has no year,
 * so it is the same every year — the point is one rule in the JSON instead of a fact to edit.
 */
export function winterDateText(deadline: SoftwareWizard['winterDeadline']): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2024, deadline.month - 1, deadline.day)))
}

function whenNoteOf(rules: SoftwareWizard, answers: WizardAnswers, context: Context): string {
  const notes: Record<string, string | undefined> = rules.whenNotes
  if (answers.when === null) return rules.whenNotes.default
  const big = anyMatches(rules.bigWhen, context)
  const note = notes[`${answers.when}${big ? 'Big' : 'Small'}`] ?? notes[answers.when]
  return (note ?? rules.whenNotes.default).replace('{data}', winterDateText(rules.winterDeadline))
}

const fill = (template: string, amount: number) => template.replace('{cena}', formatPrice(amount))

/** A short price („od 999 zł”, „0 zł”, „od 149 zł / mies.”) — tiles and add-ons. */
function shortPrice(display: PriceDisplay, solution: WizardSolution | undefined): string {
  const amount = solution?.priceFrom ?? null
  if (amount === null) return display.fallback
  // Free (the quick audit): no „od” — just 0 zł, as on the cards.
  if (amount === 0) return '0 zł'
  return fill(solution?.priceMonthly ? display.monthTemplate : display.short, amount)
}

/** Price of step 1 tiles: the lowest „od” of the need's results, else „Zapytaj o wycenę”. */
export function tileHintOf(rules: SoftwareWizard, needId: string, solutions: Solutions): string {
  const target = rules.mapping[needId]
  const results =
    target === undefined ? [] : typeof target === 'string' ? [target] : Object.values(target)
  const priced = results.flatMap((resultId) => {
    const slug = rules.resultToSolutionSlug[resultId]
    const solution = slug ? solutions[slug] : undefined
    return solution && solution.priceFrom !== null && !solution.priceMonthly ? [solution] : []
  })
  if (priced.length === 0) return rules.priceDisplay.fallback
  const lowest = priced.reduce((low, each) => (each.priceFrom! < low.priceFrom! ? each : low))
  return shortPrice(rules.priceDisplay, lowest)
}

/** Price and term of a result: the one „od” price and term of its solution (v22). */
function priceOf(
  rules: SoftwareWizard,
  result: Result,
  solution: WizardSolution | undefined,
): { price: string; priceShort: string; priceSub: string; term: string; ask: boolean } {
  const display = rules.priceDisplay
  if (result.free) {
    const price = rules.free.price
    return { price, priceShort: price, priceSub: '', term: rules.free.term, ask: false }
  }
  const amount = solution?.priceFrom ?? null
  if (amount === null) {
    const { price, priceSub, term } = display.noPrice
    return { price, priceShort: price, priceSub, term, ask: true }
  }
  const monthly = result.month || solution?.priceMonthly
  return {
    price: fill(monthly ? display.monthTemplate : display.template, amount),
    priceShort: shortPrice(display, solution),
    priceSub: display.priceSub,
    term: solution?.leadTime ?? display.termFallback,
    ask: false,
  }
}

export type WizardAddOn = {
  id: string
  name: string
  description: string
  /** SVG path of the icon (`icons`). */
  icon: string
  price: string
  on: boolean
}

/** Ids of „Często dobierane razem” for these answers (the first rule that applies). */
export function addOnIdsOf(rules: SoftwareWizard, answers: WizardAnswers): string[] {
  const context = contextOf(rules, answers)
  return rules.addOns.rules.find((rule) => anyMatches(rule.when, context))?.items ?? []
}

function addOnPrice(
  display: PriceDisplay,
  item: SoftwareWizard['addOns']['items'][number],
  solutions: Solutions,
): string {
  const solution = solutions[item.slug]
  const level = item.level ? solution?.levels.find((each) => each.name === item.level) : undefined
  if (!level) return shortPrice(display, solution)
  return solution?.priceMonthly
    ? fill(display.levelMonthTemplate, level.price)
    : `${formatPrice(level.price)} zł`
}

export type ResultView = {
  resultId: string
  result: Result
  /** Slug of the solution that prices the result (`null` = none). */
  solutionSlug: string | null
  /** „od 1 999 zł netto” — the ticket, the message. */
  price: string
  /** „od 1 999 zł” — the big price, `priceSub` under it says „netto”. */
  priceShort: string
  /** „netto · stała cena na piśmie”, or the no-price line. */
  priceSub: string
  term: string
  /** No price in the panel: „Zapytaj o wycenę”. */
  ask: boolean
  /** Step „Zakres”: what the „od” price includes and what else may be quoted. */
  included: string[]
  more: { id: string; name: string; on: boolean }[]
  /** „Do wyceny na piśmie”: answers outside the price and ticked „more”, by name. */
  toQuote: string[]
  scope: string | null
  /** Line under the title from the chosen chip („+ przebudowa starej strony…”). */
  resultNote: string | null
  whenNote: string
  recommend: string | null
  honest: string | null
  gains: string[]
  checklist: string[]
  addOns: WizardAddOn[]
  /** „Twój wybór”: need, answers and term, in this order. */
  choice: string[]
}

function optionNames(need: Need | null, ids: string[]): string[] {
  return need ? need.o.filter((option) => ids.includes(option.id)).map((option) => option.n) : []
}

/** Answers of the need's question outside `featuresInPrice` (rozbudowana: not the blog). */
function featuresOutside(
  rules: SoftwareWizard,
  answers: WizardAnswers,
  resultId: string,
): string[] {
  const inPrice = scopeOf(rules, resultId)?.featuresInPrice
  if (!inPrice) return []
  const outside = answers.options.filter((option) => !inPrice.includes(option))
  return optionNames(needOf(rules, answers), outside)
}

function sentenceOf(
  rule: { text: string } | undefined,
  rules: SoftwareWizard,
  answers: WizardAnswers,
): string | null {
  if (!rule) return null
  return rule.text.replace(
    '{lista}',
    optionNames(needOf(rules, answers), answers.options).join(', '),
  )
}

export function resultView(
  rules: SoftwareWizard,
  answers: WizardAnswers,
  solutions: Solutions,
): ResultView {
  const context = contextOf(rules, answers)
  const result = rules.results[context.result] ?? rules.results[OWN]
  if (!result) throw new Error('Software wizard rules without the `own` result')
  const need = needOf(rules, answers)
  const solutionSlug = rules.resultToSolutionSlug[context.result] ?? null
  const solution = solutionSlug ? solutions[solutionSlug] : undefined
  const scopeRule = rules.scopeRules.find((rule) => anyMatches(rule.when, context))
  const set = need?.have ? rules.haves[need.have] : undefined
  const chip = set?.o.find((option) => option.id === answers.have)
  const scope = scopeOf(rules, context.result)
  const more = (scope?.moreExamples ?? []).map((example) => ({
    id: example.id,
    name: example.n,
    on: answers.more.includes(example.id),
  }))
  const added = addOnIdsOf(rules, answers)

  return {
    resultId: context.result,
    result,
    solutionSlug,
    ...priceOf(rules, result, solution),
    included: scope?.included ?? [],
    more,
    toQuote: [
      ...featuresOutside(rules, answers, context.result),
      ...more.filter((each) => each.on).map((each) => each.name),
    ],
    scope: scopeRule ? (rules.scopeNotes[scopeRule.note] ?? null) : null,
    resultNote: chip?.resultNote ?? null,
    whenNote: whenNoteOf(rules, answers, context),
    recommend: sentenceOf(
      rules.recommend.find((rule) => anyMatches(rule.when, context)),
      rules,
      answers,
    ),
    honest: sentenceOf(
      rules.honest.find((rule) => anyMatches(rule.when, context)),
      rules,
      answers,
    ),
    gains: result.g,
    checklist: result.nd,
    addOns: added.flatMap((id) => {
      const item = rules.addOns.items.find((each) => each.id === id)
      if (!item) return []
      return [
        {
          id,
          name: item.n,
          description: item.d,
          icon: rules.icons[item.icon] ?? '',
          price: addOnPrice(rules.priceDisplay, item, solutions),
          on: answers.addOns.includes(id),
        },
      ]
    }),
    choice: choiceOf(rules, answers, { withWhen: true }),
  }
}

/**
 * The answers without what the current result no longer offers — after going back and changing a
 * chip, a ticked „więcej”, an add-on, a checklist position or the shop switch of the previous
 * result would stay hidden in the state and make the server refuse the inquiry.
 */
export function pruneAnswers(rules: SoftwareWizard, answers: WizardAnswers): WizardAnswers {
  const next = { ...answers, shop: answers.shop && shopHintApplies(rules, answers) }
  const resultId = resultIdOf(rules, next)
  const more = new Set(scopeOf(rules, resultId)?.moreExamples.map((example) => example.id))
  const addOns = new Set(addOnIdsOf(rules, next))
  const items = rules.results[resultId]?.nd.length ?? 0
  return {
    ...next,
    more: next.more.filter((id) => more.has(id)),
    addOns: next.addOns.filter((id) => addOns.has(id)),
    checklist: next.checklist.filter((index) => index < items),
  }
}

/** Names of the chosen answers to the need's question (under the result's title). */
export function optionNamesOf(rules: SoftwareWizard, answers: WizardAnswers): string[] {
  return optionNames(needOf(rules, answers), answers.options)
}

/** Quick words under „Kilka słów od siebie”: the need's own, else the general ones. */
export function phrasesOf(rules: SoftwareWizard, answers: WizardAnswers): string[] {
  const own = answers.need === null ? undefined : rules.needPhrases[answers.need]
  return own && own.length > 0 ? own : rules.phrases
}

/** Contact field of the chosen preference: label, placeholder, error and what it checks. */
export function contactFieldOf(rules: SoftwareWizard, answers: WizardAnswers) {
  const field = contactPrefOf(rules, answers)?.field ?? 'any'
  return { field, ...rules.send.contact[field] }
}

/** Chips of „Twój wybór”; the term only once the scope step is passed. */
export function choiceOf(
  rules: SoftwareWizard,
  answers: WizardAnswers,
  { withWhen }: { withWhen: boolean },
): string[] {
  const need = needOf(rules, answers)
  const chips: string[] = []
  if (answers.own) chips.push(rules.ui.ownChip)
  if (need) chips.push(need.n, ...optionNames(need, answers.options))
  const when = withWhen ? nameIn(rules.whens, answers.when) : undefined
  if (when) chips.push(when)
  return chips
}

export type Preview =
  | { kind: 'idle' }
  | {
      kind: 'www'
      /** [name, slogan, lead, button, domain, menu cards] — `previewBrands`. */
      brand: SoftwareWizard['previewBrands'][string]
      navs: string[]
      features: (typeof PREVIEW_FEATURES)[number][]
    }
  | { kind: 'odsw'; issues: [string, string][] }
  | { kind: 'sys'; view: SoftwareWizard['systemViews'][string] }
  | { kind: 'app'; view: SoftwareWizard['preview']['appViews'][string] }
  | { kind: 'auto'; actions: string[] }

/** Chosen keys of a lookup in the order clicked, else the defaults. */
function picked<T>(lookup: Record<string, T>, chosen: string[], defaults: string[]): T[] {
  const keys = chosen.filter((id) => id in lookup)
  return (keys.length > 0 ? keys : defaults).flatMap((id) => (id in lookup ? [lookup[id]!] : []))
}

/** The live preview: the need's view (`pv`) filled from its answers. */
export function previewOf(rules: SoftwareWizard, answers: WizardAnswers): Preview {
  const need = needOf(rules, answers)
  if (!need || answers.need === null) return { kind: 'idle' }
  const context = contextOf(rules, answers)
  const first = answers.options[0]
  const { preview } = rules
  switch (need.pv) {
    case 'odsw':
      return {
        kind: 'odsw',
        issues: picked(rules.rebuildIssues, answers.options, preview.rebuildDefault),
      }
    case 'sys': {
      const view =
        (first !== undefined ? rules.systemViews[first] : undefined) ??
        rules.systemViews[preview.systemDefault]
      return view ? { kind: 'sys', view } : { kind: 'idle' }
    }
    case 'app': {
      const view =
        (first !== undefined ? preview.appViews[first] : undefined) ??
        preview.appViews[preview.appDefault]
      return view ? { kind: 'app', view } : { kind: 'idle' }
    }
    case 'auto':
      return {
        kind: 'auto',
        actions: picked(rules.automationActions, answers.options, preview.automationDefault),
      }
    default: {
      const brand =
        (first !== undefined ? rules.previewBrands[first] : undefined) ??
        rules.previewBrands[answers.need] ??
        rules.previewBrands[preview.defaultBrand]
      if (!brand) return { kind: 'idle' }
      const nav = preview.navs.find((entry) => !entry.when || anyMatches(entry.when, context))
      return {
        kind: 'www',
        brand,
        navs: nav?.items ?? [],
        features: preview.features
          .filter((feature) => anyMatches(feature.when, context))
          .map((feature) => feature.id),
      }
    }
  }
}

type Params = Record<string, string | string[] | undefined>

const param = (params: Params, name: string) => {
  const value = params[name]
  return Array.isArray(value) ? value[0] : value
}

/**
 * `?potrzeba=` and `?firma=` set steps 1–2 (industry pages, intent tiles), `?tryb=opis` starts
 * „Opisz po swojemu” (empty catalog result). Unknown values are ignored.
 */
export function parseWizardParams(
  rules: SoftwareWizard,
  params: Params,
): { step: WizardStep; answers: WizardAnswers } {
  if (param(params, 'tryb') === 'opis') {
    return { step: 'describe', answers: { ...EMPTY_ANSWERS, own: true } }
  }
  const firma = param(params, 'firma')
  const asked = param(params, 'potrzeba')
  const hasOption = (id: string) => rules.needs[id]?.o.some((option) => option.id === firma)
  const needId =
    asked !== undefined && asked in rules.needs
      ? asked
      : firma !== undefined
        ? rules.needOrder.find(hasOption)
        : undefined
  if (needId === undefined) return { step: 'need', answers: EMPTY_ANSWERS }
  const options = firma !== undefined && hasOption(needId) ? [firma] : []
  return {
    step: options.length > 0 ? 'scope' : 'detail',
    answers: { ...EMPTY_ANSWERS, need: needId, options },
  }
}

const MAX_URL = 200
const MAX_DESCRIPTION = 2000

const id = z.string().max(40)

const answersShape = z.strictObject({
  need: id.nullable(),
  own: z.boolean(),
  options: z.array(id).max(20),
  have: id.nullable(),
  url: z.string().trim().max(MAX_URL),
  when: id.nullable(),
  description: z.string().trim().max(MAX_DESCRIPTION),
  checklist: z.array(z.number().int().min(0).max(19)).max(20),
  more: z.array(id).max(10),
  addOns: z.array(id).max(10),
  shop: z.boolean(),
  contactPref: id.nullable(),
})

/**
 * The answers as sent by the browser, checked against this site's rules (the server never
 * trusts names or prices from the body) — or `null` when they do not fit.
 */
export function parseSoftwareAnswers(rules: SoftwareWizard, input: unknown): WizardAnswers | null {
  const parsed = answersShape.safeParse(input)
  if (!parsed.success) return null
  const answers = parsed.data
  const unique = (list: (string | number)[]) => new Set(list).size === list.length
  if (answers.own) {
    if (answers.need !== null || answers.options.length > 0 || answers.have !== null) return null
    if (answers.url !== '' || answers.shop) return null
  } else {
    const need = answers.need === null ? undefined : rules.needs[answers.need]
    if (!need) return null
    const optionIds = new Set(need.o.map((option) => option.id))
    if (!answers.options.every((each) => optionIds.has(each)) || !unique(answers.options))
      return null
    if (!need.multi && answers.options.length > 1) return null
    const set = need.have ? rules.haves[need.have] : undefined
    if (answers.have !== null && !set?.o.some((option) => option.id === answers.have)) return null
    if (!need.url && answers.url !== '') return null
    if (answers.shop && !shopHintApplies(rules, answers)) return null
  }
  if (answers.when !== null && !rules.whens.some((when) => when.id === answers.when)) return null
  const resultId = resultIdOf(rules, answers)
  const items = rules.results[resultId]?.nd.length ?? 0
  if (!answers.checklist.every((index) => index < items) || !unique(answers.checklist)) return null
  const moreIds = new Set(scopeOf(rules, resultId)?.moreExamples.map((example) => example.id))
  if (!answers.more.every((each) => moreIds.has(each)) || !unique(answers.more)) return null
  const addOnIds = new Set(addOnIdsOf(rules, answers))
  if (!answers.addOns.every((each) => addOnIds.has(each)) || !unique(answers.addOns)) return null
  if (
    answers.contactPref !== null &&
    !rules.contactPrefs.some((pref) => pref.id === answers.contactPref)
  )
    return null
  return answers
}

export function contactPrefOf(rules: SoftwareWizard, answers: WizardAnswers) {
  return rules.contactPrefs.find((pref) => pref.id === answers.contactPref) ?? rules.contactPrefs[0]
}

/** Solutions of the added add-ons (inquiry items), in the order of the rules. */
export function addOnSlugsOf(rules: SoftwareWizard, answers: WizardAnswers): string[] {
  const slugs = rules.addOns.items
    .filter((item) => answers.addOns.includes(item.id))
    .map((item) => item.slug)
  return [...new Set(slugs)]
}

function addOnNames(rules: SoftwareWizard, answers: WizardAnswers): string[] {
  return rules.addOns.items.filter((item) => answers.addOns.includes(item.id)).map((item) => item.n)
}

function toQuoteOf(rules: SoftwareWizard, answers: WizardAnswers): string[] {
  const resultId = resultIdOf(rules, answers)
  const more = scopeOf(rules, resultId)?.moreExamples ?? []
  return [
    ...featuresOutside(rules, answers, resultId),
    ...more.filter((example) => answers.more.includes(example.id)).map((example) => example.n),
  ]
}

/**
 * The answers as „pytanie: odpowiedź” for the panel and the e-mail (`Inquiries.wizard`) —
 * readable without the rules at hand: every answer of the state, named.
 */
export function wizardSummary(
  rules: SoftwareWizard,
  answers: WizardAnswers,
): Record<string, string | string[]> {
  const need = needOf(rules, answers)
  const resultId = resultIdOf(rules, answers)
  const set = need?.have ? rules.haves[need.have] : undefined
  const summary: Record<string, string | string[]> = {
    Potrzeba: need?.n ?? rules.ui.ownChip,
  }
  const options = optionNames(need, answers.options)
  if (options.length > 0) summary['Szczegóły'] = options
  const have = set ? nameIn(set.o, answers.have) : undefined
  if (set && have) summary[set.q] = have
  if (need?.url && answers.url) summary[need.url.q] = answers.url
  const when = nameIn(rules.whens, answers.when)
  if (when) summary[rules.ui.whenQ] = when
  summary[rules.ui.recommend] = rules.results[resultId]?.n ?? resultId
  const toQuote = toQuoteOf(rules, answers)
  if (toQuote.length > 0) summary['Do wyceny'] = toQuote
  const addOns = addOnNames(rules, answers)
  if (addOns.length > 0) summary['Dodatki'] = addOns
  const had = answers.checklist.flatMap((index) => rules.results[resultId]?.nd[index] ?? [])
  if (had.length > 0) summary['Już mam'] = had
  if (answers.description) summary[rules.ui.yourNeeds] = answers.description
  summary[rules.send.prefQ] = contactPrefOf(rules, answers)?.n ?? ''
  return summary
}

/**
 * The inquiry's `message`, written by the server (spec. §6.3): the result, the choice, what is to
 * be quoted („+ do wyceny: …”), the add-ons and the description.
 */
export function wizardMessage(rules: SoftwareWizard, answers: WizardAnswers): string {
  const result = rules.results[resultIdOf(rules, answers)]
  const toQuote = toQuoteOf(rules, answers)
  const addOns = addOnNames(rules, answers)
  return [
    `Kreator: ${result?.n ?? rules.ui.ownChip}`,
    choiceOf(rules, answers, { withWhen: true }).join(', '),
    toQuote.length > 0 ? `+ do wyceny: ${toQuote.join(', ')}` : '',
    addOns.length > 0 ? `+ dodatki: ${addOns.join(', ')}` : '',
    answers.description,
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * Every text of the rules through `fill` (facts like `[CZAS ODPOWIEDZI]`, `{cena:<slug>}`,
 * ADR-014 §1.4); a text dropped on production (missing value) becomes `''`, which the component
 * does not render.
 */
export function fillWizardTexts(
  rules: SoftwareWizard,
  fill: (text: string) => string | null,
): SoftwareWizard {
  const walk = (value: unknown): unknown => {
    if (typeof value === 'string') return /[[{]/.test(value) ? (fill(value) ?? '') : value
    if (Array.isArray(value)) return value.map(walk)
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, each]) => [key, walk(each)]))
    }
    return value
  }
  return walk(rules) as SoftwareWizard
}

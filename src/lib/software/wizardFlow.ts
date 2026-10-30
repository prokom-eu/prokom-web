import { z } from 'zod'

import { SOLUTION_SIZES, type SolutionSize } from './options'
import { formatPrice } from './price'
import type { PREVIEW_FEATURES, SoftwareWizard, WizardCondition } from './wizard'

/**
 * What the Software wizard shows and sends (`/dobierz`, spec. §6.3), computed from the rules in
 * `SoftwareSettings.wizard` only — the components and the server call these functions and never
 * test need ids themselves (SW7). The one fixed id is `own` („Opisz po swojemu”), the key the
 * schema reserves in `mapping`.
 */

export const OWN = 'own'

/** Address of the wizard page (the start page has it as section `#dobierz`, SW5). */
export const WIZARD_PATH = '/dobierz'

/** Steps by index: Potrzeba, Szczegóły, Zakres, Opis, Wynik. */
export const STEP = { need: 0, detail: 1, scope: 2, describe: 3, result: 4 } as const

export type WizardAnswers = {
  /** Id of `needs`; `null` before the first click and in „Opisz po swojemu”. */
  need: string | null
  own: boolean
  /** Answers to the need's question (one, or several when `multi`). */
  options: string[]
  size: SolutionSize
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
  /** `contactPrefs[].id`; `null` = the first one. */
  contactPref: string | null
}

export const EMPTY_ANSWERS: WizardAnswers = {
  need: null,
  own: false,
  options: [],
  // The board starts with Standard chosen.
  size: 'std',
  have: null,
  url: '',
  when: null,
  description: '',
  checklist: [],
  contactPref: null,
}

/** What the wizard needs of a solution priced by a result (from the solutions index). */
export type WizardSolution = {
  name: string
  /** The one „od” price (ADR-014 v22 pkt 1); `null` → „Zapytaj o wycenę”. */
  priceFrom: number | null
  /** „od 2 tygodni” as stored; `null` → `termFallback`. */
  leadTime: string | null
  priceMonthly: boolean
}

type Need = SoftwareWizard['needs'][string]
type Result = SoftwareWizard['results'][string]

/** The needs in their order (`needOrder`), as `[id, need]`. */
export function orderedNeeds(rules: SoftwareWizard): [string, Need][] {
  return rules.needOrder.flatMap((id) =>
    rules.needs[id] ? [[id, rules.needs[id]] as [string, Need]] : [],
  )
}

export function needOf(rules: SoftwareWizard, answers: WizardAnswers): Need | null {
  return answers.own || answers.need === null ? null : (rules.needs[answers.need] ?? null)
}

/** Id of the recommended result (`mapping`; per answer with `*` for any other). */
export function resultIdOf(rules: SoftwareWizard, answers: WizardAnswers): string {
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
  size: SolutionSize
}

function contextOf(rules: SoftwareWizard, answers: WizardAnswers): Context {
  const result = resultIdOf(rules, answers)
  return {
    need: answers.own ? null : answers.need,
    options: answers.options,
    result,
    kind: rules.results[result]?.kind ?? '',
    size: answers.size,
  }
}

function matches(condition: WizardCondition, context: Context): boolean {
  const { needs, options, results, kinds, sizes } = condition
  if (needs && (context.need === null || !needs.includes(context.need))) return false
  if (options && !options.some((option) => context.options.includes(option))) return false
  if (results && !results.includes(context.result)) return false
  if (kinds && !kinds.includes(context.kind)) return false
  if (sizes && !sizes.includes(context.size)) return false
  return true
}

const anyMatches = (conditions: WizardCondition[], context: Context) =>
  conditions.some((condition) => matches(condition, context))

/** The size step is shown (and the price is of the chosen size). */
export function hasSize(rules: SoftwareWizard, answers: WizardAnswers): boolean {
  const need = needOf(rules, answers)
  return need !== null && !need.noSize
}

const nameIn = (list: { id: string; n: string }[], id: string | null) =>
  id === null ? undefined : list.find((item) => item.id === id)?.n

function whenNoteOf(rules: SoftwareWizard, answers: WizardAnswers, context: Context): string {
  const notes: Record<string, string | undefined> = rules.whenNotes
  if (answers.when === null) return rules.whenNotes.default
  const big = anyMatches(rules.bigWhen, context)
  const sized = notes[`${answers.when}${big ? 'Big' : 'Small'}`]
  return sized ?? notes[answers.when] ?? rules.whenNotes.default
}

/**
 * Price and term of a result: the one „od” price and term of its solution (v22). Until the v22
 * wizard (SWR4) the size step stays, but every size shows the same „od” price — there are no
 * size prices any more.
 */
function priceOf(
  rules: SoftwareWizard,
  result: Result,
  solution: WizardSolution | undefined,
): { price: string; term: string; ask: boolean } {
  const display = rules.priceDisplay
  if (result.free) return { price: rules.free.price, term: rules.free.term, ask: false }
  const amount = solution?.priceFrom ?? null
  const term = solution?.leadTime ?? display.termFallback
  if (amount === null) return { price: display.fallback, term, ask: true }
  const template =
    result.month || solution?.priceMonthly ? display.monthTemplate : display.templateFrom
  return { price: template.replace('{cena}', formatPrice(amount)), term, ask: false }
}

export type ResultView = {
  resultId: string
  result: Result
  /** Slug of the solution that prices the result (`null` = none). */
  solutionSlug: string | null
  hasSize: boolean
  price: string
  term: string
  /** No price in the panel: „Zapytaj o wycenę”. */
  ask: boolean
  scope: string | null
  /** Line under the title from the chosen chip („+ przebudowa starej strony…”). */
  resultNote: string | null
  whenNote: string
  gains: string[]
  checklist: string[]
  /** „Twój wybór”: need, answers, size and term, in this order. */
  choice: string[]
}

export function resultView(
  rules: SoftwareWizard,
  answers: WizardAnswers,
  solutions: Readonly<Record<string, WizardSolution>>,
): ResultView {
  const context = contextOf(rules, answers)
  const result = rules.results[context.result] ?? rules.results[OWN]
  if (!result) throw new Error('Software wizard rules without the `own` result')
  const need = needOf(rules, answers)
  const sized = hasSize(rules, answers)
  const solutionSlug = rules.resultToSolutionSlug[context.result] ?? null
  const solution = solutionSlug ? solutions[solutionSlug] : undefined
  const scopeRule = rules.scopeRules.find((rule) => anyMatches(rule.when, context))
  const set = need?.have ? rules.haves[need.have] : undefined
  const chip = set?.o.find((option) => option.id === answers.have)

  return {
    resultId: context.result,
    result,
    solutionSlug,
    hasSize: sized,
    ...priceOf(rules, result, solution),
    scope: scopeRule ? (rules.scopeNotes[scopeRule.note] ?? null) : null,
    resultNote: chip?.resultNote ?? null,
    whenNote: whenNoteOf(rules, answers, context),
    gains: sized ? [...result.g, rules.sizeGains[answers.size]] : result.g,
    checklist: result.nd,
    choice: choiceOf(rules, answers, { withScope: true }),
  }
}

/** Chips of „Twój wybór”; size and term only once the scope step is passed. */
export function choiceOf(
  rules: SoftwareWizard,
  answers: WizardAnswers,
  { withScope }: { withScope: boolean },
): string[] {
  const need = needOf(rules, answers)
  const chips: string[] = []
  if (answers.own) chips.push(rules.ui.ownChip)
  if (need) {
    chips.push(need.n)
    for (const option of need.o) if (answers.options.includes(option.id)) chips.push(option.n)
  }
  if (withScope) {
    const size = hasSize(rules, answers) ? nameIn(rules.sizes, answers.size) : undefined
    const when = nameIn(rules.whens, answers.when)
    if (size) chips.push(size)
    if (when) chips.push(when)
  }
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
): { step: number; answers: WizardAnswers } {
  if (param(params, 'tryb') === 'opis') {
    return { step: STEP.describe, answers: { ...EMPTY_ANSWERS, own: true } }
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
  if (needId === undefined) return { step: STEP.need, answers: EMPTY_ANSWERS }
  const options = firma !== undefined && hasOption(needId) ? [firma] : []
  return {
    step: options.length > 0 ? STEP.scope : STEP.detail,
    answers: { ...EMPTY_ANSWERS, need: needId, options },
  }
}

const MAX_URL = 200
const MAX_DESCRIPTION = 2000

const answersShape = z.object({
  need: z.string().max(40).nullable(),
  own: z.boolean(),
  options: z.array(z.string().max(40)).max(20),
  size: z.enum(SOLUTION_SIZES),
  have: z.string().max(40).nullable(),
  url: z.string().trim().max(MAX_URL),
  when: z.string().max(40).nullable(),
  description: z.string().trim().max(MAX_DESCRIPTION),
  checklist: z.array(z.number().int().min(0).max(19)).max(20),
  contactPref: z.string().max(40).nullable(),
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
    if (answers.url !== '') return null
  } else {
    const need = answers.need === null ? undefined : rules.needs[answers.need]
    if (!need) return null
    const optionIds = new Set(need.o.map((option) => option.id))
    if (!answers.options.every((id) => optionIds.has(id)) || !unique(answers.options)) return null
    if (!need.multi && answers.options.length > 1) return null
    const set = need.have ? rules.haves[need.have] : undefined
    if (answers.have !== null && !set?.o.some((option) => option.id === answers.have)) return null
    if (!need.url && answers.url !== '') return null
  }
  if (answers.when !== null && !rules.whens.some((when) => when.id === answers.when)) return null
  const result = rules.results[resultIdOf(rules, answers)]
  const items = result?.nd.length ?? 0
  if (!answers.checklist.every((index) => index < items) || !unique(answers.checklist)) return null
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
  const options = need?.o.filter((option) => answers.options.includes(option.id)) ?? []
  if (options.length > 0) summary['Szczegóły'] = options.map((option) => option.n)
  if (hasSize(rules, answers)) {
    summary.Zakres = nameIn(rules.sizes, answers.size) ?? answers.size
  }
  const have = set ? nameIn(set.o, answers.have) : undefined
  if (set && have) summary[set.q] = have
  if (need?.url && answers.url) summary[need.url.q] = answers.url
  const when = nameIn(rules.whens, answers.when)
  if (when) summary[rules.ui.whenQ] = when
  summary[rules.ui.recommend] = rules.results[resultId]?.n ?? resultId
  const had = answers.checklist.flatMap((index) => rules.results[resultId]?.nd[index] ?? [])
  if (had.length > 0) summary['Już mam'] = had
  if (answers.description) summary[rules.ui.yourNeeds] = answers.description
  summary[rules.send.prefQ] = contactPrefOf(rules, answers)?.n ?? ''
  return summary
}

/** The inquiry's `message`, written by the server (spec. §6.3): the result and the description. */
export function wizardMessage(rules: SoftwareWizard, answers: WizardAnswers): string {
  const result = rules.results[resultIdOf(rules, answers)]
  const size = hasSize(rules, answers) ? nameIn(rules.sizes, answers.size) : undefined
  const head = `Kreator: ${result?.n ?? rules.ui.ownChip}${size ? ` (${size})` : ''}`
  const choice = choiceOf(rules, answers, { withScope: true }).join(', ')
  return [head, choice, answers.description].filter(Boolean).join('\n')
}

/**
 * Every text of the rules through `fill` (facts like `[CZAS ODPOWIEDZI]`, ADR-014 §1.4); a text
 * dropped on production (missing value) becomes `''`, which the component does not render.
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

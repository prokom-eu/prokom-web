import { formatPrice } from '../price'
import type { IndexSolution } from '../solutionsIndex'
import {
  DESCRIPTION_STEP,
  PICK_STEPS,
  SIZE_STEP,
  type SoftwareWizard,
  URL_STEP,
  WIZARD_PICKS,
  type WizardCondition,
  type WizardGroup,
  type WizardPick,
  type WizardStep,
  type WizardType,
} from './schema'

/**
 * Behaviour of wizard v3 (ZMIANY-v24 §7.1, `v24/wzorzec/aurora.js`): pure functions shared by the
 * client (steps, live preview) and the server (the inquiry). The rules are data of
 * `SoftwareSettings.wizard`; this module only reads them.
 */

export type WizardAnswers = {
  /** `types[].id`; `null` until step 1. */
  type: string | null
  /** `industries[].key` (`?firma=`); `null` = skipped. */
  industry: string | null
  /** Multiple-choice answers by pick (`have`, `feat`, `fix`…), ids of `options`. */
  picks: Partial<Record<WizardPick, string[]>>
  /** Team size (`options.sizes`), system group only. */
  size: string | null
  /** Address of the current site (przebudowa). */
  url: string
  /** „Opisz po swojemu” (Nie wiem jeszcze). */
  description: string
  /** „Coś jeszcze? Napisz po swojemu” of the result. */
  note: string
}

export const EMPTY_ANSWERS: WizardAnswers = {
  type: null,
  industry: null,
  picks: {},
  size: null,
  url: '',
  description: '',
  note: '',
}

/** What the result needs from a solution (the solutions index). */
export type WizardSolution = Pick<
  IndexSolution,
  'slug' | 'name' | 'priceFrom' | 'leadTime' | 'priceMonthly' | 'features'
>

export type WizardOption = { id: string; label: string }

export function typeOf(wizard: SoftwareWizard, answers: WizardAnswers): WizardType | undefined {
  return wizard.types.find((type) => type.id === answers.type)
}

/** Group of the chosen kind — before step 1 the first kind's, so the step bar has its shape. */
function groupOf(wizard: SoftwareWizard, answers: WizardAnswers): WizardGroup {
  return (typeOf(wizard, answers) ?? wizard.types[0])?.group ?? 'idk'
}

export function stepsOf(wizard: SoftwareWizard, answers: WizardAnswers): WizardStep[] {
  return wizard.groups[groupOf(wizard, answers)]
}

/** Only the kind is required; the industry and every question may be skipped. */
export function canNext(step: WizardStep, answers: WizardAnswers): boolean {
  return step !== 'type' || answers.type !== null
}

/** Options of a pick; „Co ma umieć” = the kind's features + up to 2 of the industry. */
export function pickOptions(
  wizard: SoftwareWizard,
  answers: WizardAnswers,
  pick: WizardPick,
): WizardOption[] {
  if (pick !== 'feat') return wizard.options[pick]
  const own = (answers.type && wizard.options.featByType[answers.type]) || []
  const industry = wizard.industries.find((i) => i.key === answers.industry)
  const labels = new Set(own.map((o) => o.label))
  return [...own, ...(industry?.features ?? []).filter((o) => !labels.has(o.label)).slice(0, 2)]
}

/** The picks the current group asks (its steps). */
function askedPicks(wizard: SoftwareWizard, answers: WizardAnswers): WizardPick[] {
  const steps = stepsOf(wizard, answers)
  return WIZARD_PICKS.filter((pick) => steps.includes(PICK_STEPS[pick]))
}

/** Answers the group does not ask, and unknown ids, are dropped. */
export function prune(wizard: SoftwareWizard, answers: WizardAnswers): WizardAnswers {
  const steps = stepsOf(wizard, answers)
  const picks: WizardAnswers['picks'] = {}
  for (const pick of askedPicks(wizard, answers)) {
    const known = new Set(pickOptions(wizard, answers, pick).map((o) => o.id))
    const kept = (answers.picks[pick] ?? []).filter((id) => known.has(id))
    if (kept.length) picks[pick] = kept
  }
  const sizeKnown = wizard.options.sizes.some((o) => o.id === answers.size)
  return {
    ...answers,
    industry: wizard.industries.some((i) => i.key === answers.industry) ? answers.industry : null,
    picks,
    size: steps.includes(SIZE_STEP) && sizeKnown ? answers.size : null,
    url: steps.includes(URL_STEP) ? answers.url : '',
    description: steps.includes(DESCRIPTION_STEP) ? answers.description : '',
  }
}

export function chooseType(
  wizard: SoftwareWizard,
  answers: WizardAnswers,
  type: string,
): WizardAnswers {
  return prune(wizard, { ...answers, type })
}

/** A new industry drops the features of the previous one from „Co ma umieć”. */
export function chooseIndustry(
  wizard: SoftwareWizard,
  answers: WizardAnswers,
  industry: string | null,
): WizardAnswers {
  return prune(wizard, { ...answers, industry })
}

/** Ticks or unticks an option; the exclusive one („Zaczynamy od zera”) clears the others. */
export function toggle(
  wizard: SoftwareWizard,
  answers: WizardAnswers,
  pick: WizardPick,
  id: string,
): WizardAnswers {
  const current = answers.picks[pick] ?? []
  const exclusive = wizard.exclusive[pick]
  let next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
  if (exclusive && !current.includes(id)) {
    next = id === exclusive ? [id] : next.filter((x) => x !== exclusive)
  }
  return { ...answers, picks: { ...answers.picks, [pick]: next } }
}

const labelsOf = (options: WizardOption[], ids: string[] = []) =>
  ids.flatMap((id) => options.find((o) => o.id === id)?.label ?? [])

/** Chips of the result: the industry, then the answers of the group in step order. */
export function summaryOf(
  wizard: SoftwareWizard,
  answers: WizardAnswers,
): { label: string; values: string[] }[] {
  const rows: { label: string; values: string[] }[] = []
  const industry = wizard.industries.find((i) => i.key === answers.industry)
  if (industry) rows.push({ label: wizard.summary.industry, values: [industry.name] })
  for (const pick of askedPicks(wizard, answers)) {
    const values = labelsOf(pickOptions(wizard, answers, pick), answers.picks[pick])
    if (values.length) rows.push({ label: wizard.summary[pick], values })
    if (PICK_STEPS[pick] === SIZE_STEP && answers.size) {
      const size = labelsOf(wizard.options.sizes, [answers.size])
      if (size.length) rows.push({ label: wizard.summary.size, values: size })
    }
  }
  return rows
}

/** Every key of the condition must match; no condition always applies. */
export function matches(
  wizard: SoftwareWizard,
  when: WizardCondition | undefined,
  answers: WizardAnswers,
): boolean {
  if (!when) return true
  const type = typeOf(wizard, answers)
  const picked = (pick: WizardPick) => answers.picks[pick] ?? []
  if (when.groups && !(type && when.groups.includes(type.group))) return false
  if (when.types && !(type && when.types.includes(type.id))) return false
  if (when.industries && !when.industries.some((key) => key === answers.industry)) return false
  if (when.anyIndustry && !answers.industry) return false
  if (when.sizes && !(answers.size && when.sizes.includes(answers.size))) return false
  if (when.picked?.some((pick) => picked(pick).length === 0)) return false
  for (const [pick, ids] of Object.entries(when.has ?? {})) {
    if (!ids?.some((id) => picked(pick as WizardPick).includes(id))) return false
  }
  for (const [pick, ids] of Object.entries(when.lacks ?? {})) {
    if (ids?.some((id) => picked(pick as WizardPick).includes(id))) return false
  }
  return true
}

export function tipOf(wizard: SoftwareWizard, answers: WizardAnswers): string {
  return wizard.tips.find((tip) => matches(wizard, tip.when, answers))?.text ?? ''
}

/** Mock-up of the live preview (kind + variant of `Mockup`). */
export function previewOf(
  wizard: SoftwareWizard,
  answers: WizardAnswers,
): { kind: SoftwareWizard['preview'][number]['kind']; variant: string } {
  const rule = wizard.preview.find((r) => matches(wizard, r.when, answers)) ?? wizard.preview.at(-1)
  if (!rule) return { kind: 'site', variant: 'firmowa' }
  const industry = wizard.industries.find((i) => i.key === answers.industry)
  const variant = rule.fromIndustry && industry ? industry[rule.fromIndustry] : rule.variant
  return { kind: rule.kind, variant }
}

export type WizardResult = {
  name: string
  /** Slug of the recommended solution (`items[].solution`); `null` for „Nie wiem jeszcze”. */
  solution: string | null
  price: string
  priceSub: string
  term: string
  /** „Co dostajesz” — the first 3 features of the solution. */
  points: string[]
  /** No price: we quote after a talk. */
  ask: boolean
}

/** Name, price and term of the chosen kind — prices only from `Solutions` (ADR-014). */
export function resultOf(
  wizard: SoftwareWizard,
  answers: WizardAnswers,
  solutions: ReadonlyMap<string, WizardSolution>,
): WizardResult {
  const type = typeOf(wizard, answers) ?? wizard.types[0]
  const display = wizard.priceDisplay
  if (!type)
    return { name: '', solution: null, price: '', priceSub: '', term: '', points: [], ask: true }
  if (!type.solution) {
    const own = type.noPrice
    return {
      name: type.label,
      solution: null,
      price: own?.price ?? display.noPrice.price,
      priceSub: own?.sub ?? display.noPrice.priceSub,
      term: own?.term ?? display.noPrice.term,
      points: [],
      ask: !own,
    }
  }
  const solution = solutions.get(type.solution)
  const points = solution?.features.slice(0, 3) ?? []
  if (!solution || solution.priceFrom === null) {
    return {
      name: type.label,
      solution: type.solution,
      price: display.noPrice.price,
      priceSub: display.noPrice.priceSub,
      term: solution?.leadTime ?? display.noPrice.term,
      points,
      ask: true,
    }
  }
  const template = solution.priceMonthly ? display.monthTemplate : display.short
  return {
    name: type.label,
    solution: type.solution,
    price: template.replace('{cena}', formatPrice(solution.priceFrom)),
    priceSub: display.priceSub,
    term: solution.leadTime ?? display.termFallback,
    points,
    ask: false,
  }
}

/** Price on a tile of step 1. */
export function tilePriceOf(
  wizard: SoftwareWizard,
  type: WizardType,
  solutions: ReadonlyMap<string, WizardSolution>,
): string {
  if (!type.solution) return type.noPrice?.tile ?? wizard.priceDisplay.noPrice.price
  const solution = solutions.get(type.solution)
  if (!solution || solution.priceFrom === null) return wizard.priceDisplay.noPrice.mobileBar
  return wizard.priceDisplay.short.replace('{cena}', formatPrice(solution.priceFrom))
}

type Query = Record<string, string | string[] | undefined>
const one = (value: string | string[] | undefined) => (typeof value === 'string' ? value : null)

/**
 * Links into the wizard: `?firma=<industry>` (showroom, industry pages) chooses the industry,
 * `?rodzaj=<kind>` the kind (then step 2), `?tryb=opis` the description of „Nie wiem jeszcze”.
 */
export function parseParams(
  wizard: SoftwareWizard,
  query: Query,
): { answers: WizardAnswers; step: number } {
  const firma = one(query.firma)
  const industry = wizard.industries.some((i) => i.key === firma) ? firma : null
  let answers: WizardAnswers = { ...EMPTY_ANSWERS, industry }
  const idk = wizard.types.find((type) => type.group === 'idk')
  if (one(query.tryb) === 'opis' && idk) {
    answers = chooseType(wizard, answers, idk.id)
    return { answers, step: Math.max(0, stepsOf(wizard, answers).indexOf(DESCRIPTION_STEP)) }
  }
  const rodzaj = one(query.rodzaj)
  if (rodzaj && wizard.types.some((type) => type.id === rodzaj)) {
    return { answers: chooseType(wizard, answers, rodzaj), step: 1 }
  }
  return { answers, step: 0 }
}

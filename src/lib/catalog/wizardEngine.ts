import {
  WIZARD_SCALES,
  WIZARD_STAGES,
  type Wizard,
  type WizardQuestion,
  type WizardRecommendation,
  type WizardScale,
  type WizardStage,
} from './wizard'

/**
 * Engine of Konfigurator 3.0 (K35 §1.2), ported 1:1 from the board's `k3model` as pure functions
 * over the rules (`BiznesSettings.wizard`). The page and the inquiry run the same code: the page
 * for the result, the server to name the profile of a sent `?kr=` link.
 */

export type WizardState = {
  firm: string | null
  stage: WizardStage | null
  scale: WizardScale | null
  /** Answers given explicitly; a question without one takes its usual answer. */
  answers: Record<string, boolean>
  /** Needs ticked (`true`) or switched off (`false`) by hand. */
  manual: Record<string, boolean>
}

export const emptyWizardState = (): WizardState => ({
  firm: null,
  stage: null,
  scale: null,
  answers: {},
  manual: {},
})

/** Where a need came from: preset, an answer, the situation, the scale, by hand. */
export type NeedSource = 'typ' | 'ans' | 'etap' | 'skala' | 'man'

export type WizardNeed = {
  id: string
  title: string
  why: string
  iconPath: string
  sources: NeedSource[]
  /** „Nasz wybór”. */
  top: string
  /** Up to two other options. */
  alts: string[]
  /** „Dopasowane, bo: …” — at most 3. */
  reasons: string[]
  links: WizardRecommendation['links']
}

export type WizardBundle = { slug: string; area: string; level: string | null }

export type WizardResult = {
  questions: WizardQuestion[]
  /** Every question of the firm with its effective answer. */
  answers: Record<string, boolean>
  sources: Record<string, NeedSource[]>
  /** Selected needs, in the order of the result. */
  selected: string[]
  /** Selected needs with at least one product listed on the site. */
  needs: WizardNeed[]
  firmName: string
  stageName: string
  scaleName: string
  bundle: string | null
  scene: string | null
}

/** Firms whose opening adds card payments (K35 §1.2 pkt 1 — `etap`). */
const OPENING_PAYMENTS = ['sklep', 'gastro', 'gabinet', 'warsztat']

/** Bundle levels by scale, with fallbacks (board `PZ`). */
const LEVELS: Record<WizardScale, string[]> = {
  '1': ['Mały', 'Standard', 'Średni'],
  '2': ['Standard', 'Średni', 'Mały'],
  '4': ['Średni', 'Duży', 'Standard'],
  '10': ['Duży', 'Średni', 'Standard'],
}
const NO_SCALE_LEVELS = ['Standard', 'Mały', 'Średni', 'Duży']

const nameOf = (list: readonly { id: string; name: string }[], id: string | null) =>
  list.find((item) => item.id === id)?.name ?? ''

/**
 * Needs and their sources (preset, answers, situation, scale) — before manual changes — plus
 * the answer overrides and reason tags of each need.
 */
function collect(rules: Wizard, state: WizardState) {
  const sources: Record<string, NeedSource[]> = {}
  const tags: Record<string, string[]> = {}
  const overrides: Record<string, { list: string[]; tag: string }[]> = {}
  const add = (need: string, source: NeedSource, tag?: string) => {
    const list = (sources[need] ??= [])
    if (!list.includes(source)) list.push(source)
    if (tag) {
      const t = (tags[need] ??= [])
      if (!t.includes(tag)) t.push(tag)
    }
  }
  const firm = state.firm ?? ''
  for (const need of rules.presets[firm] ?? []) add(need, 'typ')
  const questions = rules.questions[firm] ?? []
  const answers: Record<string, boolean> = {}
  for (const q of questions) {
    const yes = state.answers[q.id] ?? q.default
    answers[q.id] = yes
    if (!yes) continue
    for (const need of q.add) add(need, 'ans', q.tag)
    for (const [need, list] of Object.entries(q.overrides)) {
      ;(overrides[need] ??= []).push({ list, tag: q.tag })
    }
  }
  if (state.stage === 'ksef') add('ksef', 'etap', 'przygotowanie do KSeF')
  if (state.stage === 'awaria') add('opieka', 'etap', 'serwis i opieka')
  if (state.stage === 'nowa' && OPENING_PAYMENTS.includes(firm)) add('plat', 'etap', 'nowy lokal')
  if (state.scale === '4' || state.scale === '10') {
    const tag = state.scale === '10' ? 'ponad 10 stanowisk' : '4–10 stanowisk'
    add('kopie', 'skala', tag)
    add('opieka', 'skala', tag)
    if (state.scale === '10') add('ups', 'skala', tag)
  }
  return { sources, tags, overrides, questions, answers }
}

/** Runs the engine for a state; `listed` = the card is on the site (published, this tenant). */
export function runWizard(
  rules: Wizard,
  state: WizardState,
  listed: (slug: string) => boolean,
  bundles: readonly WizardBundle[],
): WizardResult {
  const { sources, tags, overrides, questions, answers } = collect(rules, state)
  const auto = new Set(Object.keys(sources))
  const selected = rules.needs
    .map((need) => need.id)
    .filter((id) => (auto.has(id) && state.manual[id] !== false) || state.manual[id] === true)
  for (const id of selected) if (state.manual[id] === true && !auto.has(id)) sources[id] = ['man']

  const firmName = nameOf(rules.firms, state.firm)
  const stageName = nameOf(rules.stages, state.stage)
  const scaleName = nameOf(rules.scales, state.scale)
  const firmLabel = firmName.toLowerCase()

  const needs = selected.flatMap((id): WizardNeed[] => {
    const rec = rules.recommendations[id]
    if (!rec) return []
    const lists: { list: readonly string[]; tag: string }[] = [...(overrides[id] ?? [])]
    if (state.firm && rec.byFirm[state.firm]) {
      lists.push({ list: rec.byFirm[state.firm]!, tag: firmLabel })
    }
    if (state.scale && rec.byScale[state.scale]) {
      lists.push({ list: rec.byScale[state.scale]!, tag: scaleName.toLowerCase() })
    }
    lists.push({ list: rec.products, tag: '' })
    const picks: string[] = []
    let firstTag = ''
    for (const { list, tag } of lists) {
      for (const slug of list) {
        if (!listed(slug) || picks.includes(slug)) continue
        if (picks.length === 0) firstTag = tag
        picks.push(slug)
      }
    }
    if (picks.length === 0) return []
    const reasons: string[] = []
    if (firstTag) reasons.push(firstTag)
    for (const tag of tags[id] ?? []) if (!reasons.includes(tag)) reasons.push(tag)
    const own = sources[id] ?? []
    if (own.includes('typ') && firmLabel && !reasons.includes(firmLabel)) {
      reasons.push(`typowe: ${firmLabel}`)
    }
    if (own.includes('man')) reasons.push('zaznaczone przez Ciebie')
    const need = rules.needs.find((n) => n.id === id)!
    return [
      {
        id,
        title: rec.title || need.name,
        why: rec.why,
        iconPath: need.iconPath,
        sources: own,
        top: picks[0]!,
        alts: picks.slice(1, 3),
        reasons: reasons.slice(0, 3),
        links: rec.links,
      },
    ]
  })

  return {
    questions,
    answers,
    sources,
    selected,
    needs,
    firmName,
    stageName,
    scaleName,
    bundle: pickBundle(rules, state, bundles),
    scene: (state.firm && rules.scenes[state.firm]) || null,
  }
}

/** The ready bundle of the firm's area, the level by scale with fallbacks (K35 §1.2 pkt 4). */
function pickBundle(
  rules: Wizard,
  state: WizardState,
  bundles: readonly WizardBundle[],
): string | null {
  const area = state.firm ? rules.bundleAreas[state.firm] : undefined
  if (!area) return null
  const levels = state.scale ? LEVELS[state.scale] : NO_SCALE_LEVELS
  const rank = (level: string | null) => {
    const at = level ? levels.indexOf(level) : -1
    return at < 0 ? levels.length : at
  }
  const own = bundles.filter((bundle) => bundle.area === area)
  // Stable: bundles of the same rank keep their order (the panel's order).
  const sorted = own
    .map((bundle, i) => ({ bundle, i }))
    .sort((a, b) => rank(a.bundle.level) - rank(b.bundle.level) || a.i - b.i)
  return sorted[0]?.bundle.slug ?? null
}

/** Steps: 0 Firma, 1 Sytuacja i skala, 2 Szczegóły, 3 Wynik — which one can be opened. */
export function stepReady(rules: Wizard, state: WizardState, step: number): boolean {
  if (step === 0) return true
  const firm = Boolean(state.firm && rules.firms.some((f) => f.id === state.firm))
  if (step === 1) return firm
  const profile = firm && Boolean(state.stage) && Boolean(state.scale)
  return step === 2 || step === 3 ? profile : false
}

const MAX_KR = 500

/**
 * `?kr=firma|etap|skala|potrzeby|odpowiedzi` (K35 §1.3) → a state, or `null` when anything is
 * not in the rules. A list of needs is the exact selection (automatic needs not listed are
 * switched off); an empty one means „compute automatically”.
 */
export function parseKr(rules: Wizard, kr: string): WizardState | null {
  if (!kr || kr.length > MAX_KR) return null
  const [firm = '', stage = '', scale = '', needsField = '', answersField = '', ...rest] =
    kr.split('|')
  if (rest.length > 0) return null
  if (!rules.firms.some((f) => f.id === firm)) return null
  if (!(WIZARD_STAGES as readonly string[]).includes(stage)) return null
  if (!(WIZARD_SCALES as readonly string[]).includes(scale)) return null
  const questions = new Set((rules.questions[firm] ?? []).map((q) => q.id))
  const answers: Record<string, boolean> = {}
  for (const part of answersField.split(',').filter(Boolean)) {
    const [id = '', value] = part.split(':')
    if (!questions.has(id) || (value !== '0' && value !== '1')) return null
    answers[id] = value === '1'
  }
  const state: WizardState = {
    firm,
    stage: stage as WizardStage,
    scale: scale as WizardScale,
    answers,
    manual: {},
  }
  const listed = needsField.split(',').filter(Boolean)
  if (listed.length === 0) return state
  const known = new Set(rules.needs.map((need) => need.id))
  if (listed.some((id) => !known.has(id))) return null
  const auto = Object.keys(collect(rules, state).sources)
  const manual: Record<string, boolean> = {}
  for (const id of listed) if (!auto.includes(id)) manual[id] = true
  for (const id of auto) if (!listed.includes(id)) manual[id] = false
  return { ...state, manual }
}

/** The state as a `?kr=` value; the needs only when changed by hand (else computed again). */
export function formatKr(state: WizardState, selected: readonly string[]): string {
  const manual = Object.keys(state.manual).length > 0
  const answers = Object.entries(state.answers)
    .map(([id, yes]) => `${id}:${yes ? 1 : 0}`)
    .join(',')
  return [
    state.firm ?? '',
    state.stage ?? '',
    state.scale ?? '',
    manual ? selected.join(',') : '',
    answers,
  ].join('|')
}

/** Address of Konfigurator 3.0 (ADR-017 D-K4-1); the result link adds `?kr=`. */
export const CONFIGURATOR_PATH = '/konfigurator'
export const configuratorHref = (kr?: string) =>
  kr ? `${CONFIGURATOR_PATH}?kr=${encodeURIComponent(kr)}` : CONFIGURATOR_PATH

/**
 * The profile sent with the inquiry (K35 §1.3: „handlowiec widzi, skąd wzięła się lista”): the
 * firm, situation and scale named for people, every question with its answer, the selected needs
 * and the link that opens the same result. Needs do not depend on what is listed on the site.
 */
export function wizardProfile(
  rules: Wizard,
  state: WizardState,
  /** The site's address: the link becomes clickable in the panel and the e-mail. */
  origin = '',
): Record<string, string | string[]> {
  const result = runWizard(rules, state, () => true, [])
  const needName = (id: string) => rules.needs.find((need) => need.id === id)?.name ?? id
  return {
    'Rodzaj firmy': result.firmName,
    Sytuacja: result.stageName,
    Skala: result.scaleName,
    Odpowiedzi: result.questions.map(
      (q) => `${q.question} — ${result.answers[q.id] ? 'Tak' : 'Nie'}`,
    ),
    Potrzeby: result.selected.map(needName),
    Link: origin + configuratorHref(formatKr(state, result.selected)),
  }
}

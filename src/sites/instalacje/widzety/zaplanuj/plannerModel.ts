import { CONSENT_CLAUSE } from '@/lib/inquiry/consent'
import { sourceFromHref } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'
import {
  answersOf,
  chargerLines,
  isServiceKey,
  PLAN_QUESTIONS,
  PLAN_SIZES,
  PLAN_STAGES,
  PLAN_VIA,
  PLANNER_OBJECTS,
  planHashState,
  norm,
  questionKeys,
  travelZone,
  type PlanCharger,
  type PlannerObject,
  type QuestionKey,
} from '@/lib/instalacje/plan'

import type { ServiceKey } from '../../dane/types'
import { zaplanuj as Z } from '../../dane/zaplanuj'

/*
 * Logic of the planner `/zaplanuj`, ported from `zrodlo/pages/Zaplanuj.js` (`page()`,
 * `mountPage()`) as pure functions; `plannerModel.test.ts` runs the original and compares.
 * Differences on purpose: the name is required (the inquiry needs it, as on the home form, I6),
 * no photo counter (no upload in v1), step 5 is the `/wyslane` page.
 */

export type PlannerStep = 1 | 2 | 3 | 4

export type PlannerState = {
  step: PlannerStep
  services: ServiceKey[]
  unsure: boolean
  /** Index of the chosen quick pick, -1 = none. */
  preset: number
  object: PlannerObject | ''
  size: number
  stage: number
  answers: Partial<Record<QuestionKey, number>>
  town: string
  message: string
  via: number
  when: number
  consent: boolean
  name: string
  phone: string
  email: string
  /** The services came from the link of another page (hint on step 1). */
  fromLink: boolean
  /** The charger configured on Ładowarki (`konf`), shown on step 3 and sent with the answers. */
  charger: PlanCharger | null
}

export const INITIAL_PLANNER: PlannerState = {
  step: 1,
  services: [],
  unsure: false,
  preset: -1,
  object: '',
  size: -1,
  stage: -1,
  answers: {},
  town: '',
  message: '',
  via: 0,
  when: -1,
  consent: false,
  name: '',
  phone: '',
  email: '',
  fromLink: false,
  charger: null,
}

/**
 * The state after reading the address (`mountPage()`): object, services, charger. The service
 * pages link with `?usluga=<key>` (I4); the hash of the prototype wins when both are there.
 */
export function plannerFromHash(hash: string, search = ''): PlannerState {
  const service = new URLSearchParams(search).get('usluga')
  const found = planHashState(hash)
  if (!found.services && service && isServiceKey(service)) found.services = [service]
  return {
    ...INITIAL_PLANNER,
    ...(found.object && { object: found.object }),
    ...(found.services && { services: found.services, fromLink: true }),
    ...(found.charger && { charger: found.charger }),
  }
}

export const phoneDigits = (phone: string) => phone.replace(/\D/g, '').length
export const emailOk = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())

export type PlannerError = 'services' | 'name' | 'phone' | 'email' | 'consent'

/** What blocks leaving a step (`check(s)`), in the order of the fields. */
export function stepError(s: PlannerState, step: PlannerStep): PlannerError | null {
  if (step === 1 && s.services.length === 0 && !s.unsure) return 'services'
  if (step === 4) {
    if (!s.name.trim()) return 'name'
    if (phoneDigits(s.phone) < 9) return 'phone'
    if (s.via === 2 && !emailOk(s.email)) return 'email'
    if (!s.consent) return 'consent'
  }
  return null
}

/**
 * A step chosen in the progress bar (`steps[].go`): forward only through steps without an error;
 * the first one with an error stops it.
 */
export function goToStep(
  s: PlannerState,
  target: PlannerStep,
): { step: PlannerStep; error: PlannerError | null } {
  for (let step = s.step; step < target; step++) {
    const error = stepError(s, step as PlannerStep)
    if (error) return { step: step as PlannerStep, error }
  }
  return { step: target, error: null }
}

export const plannerQuestions = (s: PlannerState) => questionKeys(s.services)

const answered = (s: PlannerState) =>
  plannerQuestions(s).filter((k) => s.answers[k] !== undefined).length

/** Fill of the ticket's ring in % (`pct`, the name is one of the nine parts as in the prototype). */
export function plannerProgress(s: PlannerState): number {
  const qk = plannerQuestions(s)
  const parts = [
    s.services.length > 0 || s.unsure,
    s.object !== '',
    s.size >= 0,
    s.stage >= 0,
    s.town !== '',
    (s.services.length > 0 && answered(s) === qk.length) || (s.unsure && s.step > 3),
    s.name !== '',
    phoneDigits(s.phone) >= 9,
    s.consent,
  ]
  return Math.round((parts.filter(Boolean).length / parts.length) * 100)
}

/** Travel zone as the planner shows it (`zoneOf`): nothing for two letters or less. */
export function plannerZone(town: string): string {
  const zone = travelZone(town)
  if (!zone) return ''
  return zone === 'Małopolska · dojazd ustalimy' && norm(town).length <= 2 ? '' : zone
}

/** The first two hints for the current answers (`H.slice(0, 2)`). */
export function plannerHints(s: PlannerState): string[] {
  const has = (k: ServiceKey) => s.services.includes(k)
  const H: string[] = []
  if (s.step === 1 && s.fromLink && s.services.length) H.push(Z.hints.fromLink)
  if (s.step === 1 && !s.services.length && !s.unsure) H.push(Z.hints.empty)
  if (s.unsure) H.push(Z.hints.unsure)
  if (s.stage === 0) H.push(Z.hints.build)
  if (has('kam')) H.push(Z.hints.kam)
  if (has('wifi') && ['pens', 'hotel', 'apt', 'rest'].includes(s.object)) H.push(Z.hints.wifi)
  if (has('kd') && ['pens', 'apt', 'hotel'].includes(s.object)) H.push(Z.hints.kd)
  if (has('smart')) H.push(Z.hints.smart)
  if (has('snd')) H.push(Z.hints.snd)
  if (has('ev')) H.push(Z.hints.ev)
  if (s.step === 4) H.unshift(Z.hints.contact)
  if (!H.length) H.push(Z.hints.default)
  return H.slice(0, 2)
}

/** What to photograph (`tips`): the chosen services, the building outside, at most five. */
export function plannerTips(s: PlannerState): string[] {
  return [...s.services.map((k) => Z.step3.tips[k]), Z.step3.tipOutside].slice(0, 5)
}

/** The text between Wstecz and Dalej (`navHint`). */
export function plannerNavHint(s: PlannerState): string {
  if (s.step === 1) {
    if (s.services.length) return `Wybrano: ${s.services.length}`
    return s.unsure ? 'Doradzimy' : 'Krok 1 z 4'
  }
  if (s.step === 3 && s.services.length) {
    return `${answered(s)} z ${plannerQuestions(s).length} odpowiedzi`
  }
  return `Krok ${s.step} z 4`
}

/** The ticket on the side (`sumObj`, `sumStage`, `sumQ`, `sumTown`). */
export function plannerSummary(s: PlannerState) {
  const object = PLANNER_OBJECTS.find((o) => o.key === s.object)
  const size = PLAN_SIZES[s.size]
  const stage = PLAN_STAGES[s.stage]
  const zone = plannerZone(s.town)
  return {
    object: object ? object.label + (size ? ` · ${size.label.toLowerCase()}` : '') : '—',
    stage: stage ? stage.label : '—',
    details: s.services.length ? `${answered(s)} z ${plannerQuestions(s).length}` : '—',
    town: s.town ? s.town + (zone ? ` · ${zone}` : '') : '—',
    none: s.unsure ? Z.side.unsure : Z.side.none,
  }
}

/** Quick pick (`pre[].pick`): its services, and its object when none is chosen yet. */
export function pickPreset(s: PlannerState, index: number): PlannerState {
  const preset = Z.step1.presets[index]
  if (!preset) return s
  return {
    ...s,
    preset: index,
    services: [...preset.services],
    unsure: false,
    fromLink: false,
    object: s.object || preset.object,
  }
}

/** A service tile (`svc[].toggle`): on or off; the quick pick and „Nie wiem” are cleared. */
export function toggleService(s: PlannerState, key: ServiceKey): PlannerState {
  const on = s.services.includes(key)
  return {
    ...s,
    preset: -1,
    unsure: false,
    fromLink: false,
    services: on ? s.services.filter((x) => x !== key) : [...s.services, key],
  }
}

/** „Nie wiem, doradźcie mi” (`uns`): on clears the services; off keeps them (none). */
export function toggleUnsure(s: PlannerState): PlannerState {
  return { ...s, unsure: !s.unsure, services: s.unsure ? s.services : [], preset: -1 }
}

/** Answer of a question (`qs[].a[].pick`). */
export function answer(s: PlannerState, key: QuestionKey, index: number): PlannerState {
  return { ...s, answers: { ...s.answers, [key]: index } }
}

/** One question card of step 3: service, question, answers with „Nie wiem”. */
export function questionCards(s: PlannerState) {
  return plannerQuestions(s).map((key) => ({
    key,
    service: PLAN_QUESTIONS[key].service,
    question: PLAN_QUESTIONS[key].q,
    answers: answersOf(key),
    chosen: s.answers[key],
  }))
}

export const chargerSummary = (c: PlanCharger) => chargerLines(c)

/** `/wyslane?nr=…&kontakt=…`: the number and how we get back in touch — no personal data. */
export function sentHref(number: string | null, via: number): string {
  const query = new URLSearchParams()
  if (number) query.set('nr', number)
  query.set('kontakt', PLAN_VIA[via]?.contact ?? 'phone')
  return `/wyslane?${query.toString()}`
}

/**
 * Body of `POST /api/inquiry`: a wizard inquiry „Instalacje — Zaplanuj” (ADR-I002 §4). The
 * answers go in `wizard` (the server checks them and names them), the town in `city`, the
 * free text in `message`; the server takes the services from the answers.
 */
export function plannerBody(
  s: PlannerState,
  { href, formToken, website }: { href: string; formToken: string; website: string },
) {
  const asked = new Set<string>(plannerQuestions(s))
  const answers = Object.fromEntries(Object.entries(s.answers).filter(([k]) => asked.has(k)))
  const town = s.town.trim()
  const message = s.message.trim()
  const email = s.email.trim()
  return {
    type: 'wizard' as const,
    category: Z.category,
    source: sourceFromHref(href),
    topics: s.services,
    ...(town ? { city: town } : {}),
    name: s.name.trim(),
    phone: s.phone.trim(),
    ...(email ? { email } : {}),
    ...(message ? { message } : {}),
    wizard: {
      services: s.services,
      unsure: s.unsure,
      ...(s.object && { object: s.object }),
      ...(s.size >= 0 && { size: s.size }),
      ...(s.stage >= 0 && { stage: s.stage }),
      answers,
      ...(s.charger && s.services.includes('ev') && { charger: s.charger }),
      via: s.via,
      ...(s.when >= 0 && { when: s.when }),
    },
    consent: { accepted: s.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: website,
    formToken,
  }
}

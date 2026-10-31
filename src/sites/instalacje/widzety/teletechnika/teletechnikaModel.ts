import { CONSENT_CLAUSE } from '@/lib/inquiry/consent'
import { sourceFromHref } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'

import { type QuoteScope, type TeleLayer, teletechnika } from '../../dane/teletechnika'

/*
 * Logic of the Teletechnika widgets, ported 1:1 from `zrodlo/pages/Teletechnika.js` (`page()`,
 * `mountPage()`) as pure functions; `teletechnikaModel.test.ts` runs the original and compares.
 */

const B = teletechnika.building

// ── Building cross-section (`tt`) ────────────────────────────────────────────────────────

export type BuildingState = {
  layers: TeleLayer[]
  /** Build stage 0–5. */
  step: number
  /** Highlighted element 0–8, −1 = none. */
  el: number
}

export const INITIAL_BUILDING: BuildingState = {
  layers: ['fib', 'lan', 'rtv', 'dom'],
  step: 3,
  el: -1,
}
export const AUTOPLAY_MS = 3200

/** Autoplay (`mountPage`, every 3.2 s until the first touch): the next stage, after the 4th. */
export const autoplayStep = (s: BuildingState, n: number): BuildingState => ({
  ...s,
  step: (3 + n + 1) % B.steps.length,
})

/** Classes of the scene root: stage, blueprint, built parts, layers, focus. */
export function sceneClass(s: BuildingState): string {
  return (
    `ttx s${s.step}` +
    (s.step < 2 ? ' bp' : '') +
    [2, 3, 4, 5]
      .filter((n) => s.step >= n)
      .map((n) => ` g${n}`)
      .join('') +
    B.layers
      .filter((l) => s.layers.includes(l.key))
      .map((l) => ` L${l.key}`)
      .join('') +
    (s.el >= 0 ? ' focus' : '')
  )
}

/** A layer on/off; turning one on shows at least the „Montaż” stage. */
export const toggleLayer = (s: BuildingState, key: TeleLayer): BuildingState => ({
  ...s,
  layers: s.layers.includes(key) ? s.layers.filter((x) => x !== key) : [...s.layers, key],
  step: Math.max(s.step, 3),
})
export const pickStep = (s: BuildingState, step: number): BuildingState => ({ ...s, step, el: -1 })
export const pickElement = (s: BuildingState, el: number): BuildingState => ({
  ...s,
  el: s.el === el ? -1 : el,
})

/** The note under the scene: the picked element, or the current stage. */
export function buildingNote(s: BuildingState) {
  const e = s.el >= 0 ? B.elements[s.el] : undefined
  const step = B.steps[s.step] ?? B.steps[0]!
  return {
    key: e ? String(s.el + 1) : String(s.step + 1).padStart(2, '0'),
    element: Boolean(e),
    title: e ? e.title : `${B.stage} ${step.title}`,
    text: e ? e.text : step.text,
  }
}

/** The scene markup with the highlight and marker classes of the picked element filled in. */
export function sceneHtml(html: string, el: number): string {
  return html
    .replace(/%tt\.hl\.k(\d)%/g, (_, k: string) => `tthl${Number(k) - 1 === el ? ' on' : ''}`)
    .replace(/%tt\.mk\.k(\d)\.cls%/g, (_, k: string) => `ttm${Number(k) - 1 === el ? ' on' : ''}`)
}

// ── Quote form (`rfq`) ───────────────────────────────────────────────────────────────────

const Q = teletechnika.quote

export type QuoteState = {
  type: number
  scopes: QuoteScope[]
  units: string
  place: string
  stage: string
  term: string
  name: string
  phone: string
  email: string
  consent: boolean
}

export const INITIAL_QUOTE: QuoteState = {
  type: 0,
  scopes: ['lan', 'fib', 'dom'],
  units: '',
  place: '',
  stage: '',
  term: '',
  name: '',
  phone: '',
  email: '',
  consent: false,
}

/** Only digits, at most four (the prototype's `onLok`). */
export const unitsValue = (raw: string) => raw.replace(/[^0-9]/g, '').slice(0, 4)

/** Limits of the inquiry schema (`src/lib/inquiry/schema.ts`) for the fields of this form. */
export const QUOTE_LIMITS = {
  place: 100,
  term: 100,
  name: 120,
  phone: 30,
  email: 254,
  // Goes into the message (5000); a stage is a short phrase.
  stage: 300,
} as const

/** The server's phone format (`+48 600 100 200`, brackets and dashes) and at least 9 digits. */
export const phoneOk = (phone: string) => {
  const p = phone.trim()
  return /^\+?[\d\s()-]{6,}$/.test(p) && p.replace(/[^0-9]/g, '').length >= 9
}
export const emailOk = (email: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())

export type QuoteErrorKey = 'name' | 'phone' | 'consent'

/**
 * Missing answers in the order of the form (the prototype's `errs`). The phone is required on
 * every Instalacje form (decyzja Krystiana 31.10) — the prototype took a phone or an e-mail.
 */
export function quoteErrors(s: QuoteState): QuoteErrorKey[] {
  const errors: QuoteErrorKey[] = []
  if (!s.name.trim()) errors.push('name')
  if (!phoneOk(s.phone)) errors.push('phone')
  if (!s.consent) errors.push('consent')
  return errors
}

export const quoteErrorText = (errors: QuoteErrorKey[]) =>
  errors.length ? `${Q.errors.prefix} ${errors.map((e) => Q.errors[e]).join(', ')}.` : ''

export function quoteSummary(s: QuoteState) {
  return {
    type: Q.types[s.type] ?? Q.types[0]!,
    scope:
      Q.scopes
        .filter((z) => s.scopes.includes(z.key))
        .map((z) => z.label)
        .join(', ') || Q.summary.empty,
    units: s.units || Q.summary.empty,
  }
}

/**
 * Body of `POST /api/inquiry`: a contact inquiry „Teletechnika — przedmiar” (no new inquiry
 * type before I11, ADR-I001); the service `tel` in `topics` (service keys only, I11), the scope,
 * investment and stage in the message, the place in `city`, the term in `deadline`. The phone is
 * required; an e-mail is sent only when valid.
 */
export function quoteBody(
  s: QuoteState,
  { href, formToken, website }: { href: string; formToken: string; website: string },
) {
  const summary = quoteSummary(s)
  const place = s.place.trim()
  const term = s.term.trim()
  const message = [
    'Zapytanie ofertowe — teletechnika.',
    `Inwestycja: ${summary.type}`,
    s.scopes.length > 0 && `Zakres: ${summary.scope}`,
    s.units && `Liczba lokali: ${s.units}`,
    s.stage.trim() && `Etap budowy: ${s.stage.trim()}`,
    'Przedmiar: wyślemy mailem po zgłoszeniu.',
  ]
    .filter(Boolean)
    .join('\n')
  return {
    type: 'contact' as const,
    category: Q.category,
    source: sourceFromHref(href),
    topics: ['tel'],
    ...(place ? { city: place } : {}),
    ...(term ? { deadline: term } : {}),
    name: s.name.trim(),
    phone: s.phone.trim(),
    ...(emailOk(s.email) ? { email: s.email.trim() } : {}),
    message,
    consent: { accepted: s.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: website,
    formToken,
  }
}

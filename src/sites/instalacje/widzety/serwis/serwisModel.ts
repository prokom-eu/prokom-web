import { CONSENT_CLAUSE } from '@/lib/inquiry/consent'
import { sourceFromHref } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'

import { serwis as S } from '../../dane/serwis'

/*
 * The fault form of `/serwis` (`#zglos`, `zrodlo/pages/Serwis.js` → `sv`) as pure functions;
 * `serwisModel.test.ts` runs the original and compares. Differences on purpose: name and
 * consent (the inquiry needs them, as on the home form, I6), the system's service key in
 * `topics`, the urgency in `deadline` (ADR-I002 §4).
 */

export type FaultState = {
  /** 0 = we installed it, 1 = another company (`who`). */
  who: number
  sys: number
  sym: number
  urg: number
  name: string
  phone: string
  town: string
  consent: boolean
}

export const INITIAL_FAULT: FaultState = {
  who: 0,
  sys: 0,
  sym: 0,
  urg: 1,
  name: '',
  phone: '',
  town: '',
  consent: false,
}

export const systemOf = (s: FaultState) => S.form.systems[s.sys] ?? S.form.systems[0]!

/** The symptom shown for the system (`sym` clamped to its list, like the prototype). */
export const symptomOf = (s: FaultState) => {
  const list = systemOf(s).symptoms
  return list[Math.min(s.sym, list.length - 1)]!
}

/** Another system clears the symptom (`sys[].pick`). */
export const pickSystem = (s: FaultState, sys: number): FaultState => ({ ...s, sys, sym: 0 })

/** „Pilne” shows the phone note (`sv.urgent`). */
export const isUrgent = (s: FaultState) => s.urg === 0

/** The server's phone format (`+48 600 100 200`, brackets and dashes) and at least 9 digits. */
export const phoneOk = (phone: string) => {
  const p = phone.trim()
  return /^\+?[\d\s()-]{6,}$/.test(p) && p.replace(/\D/g, '').length >= 9
}

export type FaultError = 'name' | 'phone' | 'consent'

/** The first missing answer: name, a phone the server takes (`send`: 9 digits), consent. */
export function faultError(s: FaultState): FaultError | null {
  if (!s.name.trim()) return 'name'
  if (!phoneOk(s.phone)) return 'phone'
  if (!s.consent) return 'consent'
  return null
}

/** What the confirmation lists (`sSys`, `sSym`, `sUrg`). */
export function faultSummary(s: FaultState) {
  return { system: systemOf(s).label, symptom: symptomOf(s), urgency: S.form.urgency[s.urg]! }
}

/** Steps of the tracker after sending (`steps`): the first done, the second current. */
export const trackSteps = () =>
  S.track.steps.map((step, i) => ({ ...step, state: i < 1 ? 'done' : i === 1 ? 'on' : '' }))

/**
 * Body of `POST /api/inquiry`: a contact inquiry „Instalacje — serwis”. The system's service
 * (when it is one) in `topics`, the urgency in `deadline`, the town in `city`, who installed it,
 * the system and the symptom in the message.
 */
export function faultBody(
  s: FaultState,
  { href, formToken, website }: { href: string; formToken: string; website: string },
) {
  const system = systemOf(s)
  const summary = faultSummary(s)
  const town = s.town.trim()
  return {
    type: 'contact' as const,
    category: S.form.category,
    source: sourceFromHref(href),
    topics: system.service ? [system.service] : [],
    ...(town ? { city: town } : {}),
    deadline: summary.urgency,
    name: s.name.trim(),
    phone: s.phone.trim(),
    message: [
      'Zgłoszenie serwisowe.',
      `Instalacja: ${S.form.who[s.who] ?? S.form.who[0]}`,
      `System: ${summary.system}`,
      `Objaw: ${summary.symptom}`,
    ].join('\n'),
    consent: { accepted: s.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: website,
    formToken,
  }
}

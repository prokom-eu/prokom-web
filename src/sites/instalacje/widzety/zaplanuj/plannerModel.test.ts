import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE } from '@/lib/inquiry/consent'
import { norm, parsePlanAnswers } from '@/lib/instalacje/plan'
import { parseInquiryInput } from '@/lib/inquiry/schema'

import wspolne from '../../../../../seed/prokominstalacje/wspolne.json'
import type { ServiceKey } from '../../dane/types'
import {
  goToStep,
  INITIAL_PLANNER,
  pickPreset,
  plannerBody,
  plannerFromHash,
  plannerHints,
  plannerNavHint,
  plannerProgress,
  plannerSummary,
  plannerTips,
  plannerZone,
  sentHref,
  stepError,
  toggleService,
  toggleUnsure,
  type PlannerState,
  type PlannerStep,
} from './plannerModel'

// The reference: the prototype's own class (`zrodlo/pages/Zaplanuj.js`, v4.2) with the base
// class's `norm()` (`zrodlo/common.js`) and a `setState` that merges.
const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../../docs/design/prokominstalacje/zrodlo/pages/Zaplanuj.js',
      import.meta.url,
    ),
  ),
  'utf8',
)
type Zk = {
  pct: string
  navHint: string
  stepNo: string
  hints: string[]
  sumObj: string
  sumStage: string
  sumQ: string
  sumTown: string
  sumNoneT: string
  zone: string
  tips: string[]
  nextCls: string
  errT: string
  pre: { pick: () => void }[]
  svc: { toggle: () => void }[]
  uns: () => void
  steps: { go: () => void }[]
}
type Proto = {
  state: Record<string, unknown>
  initState(): Record<string, unknown>
  mountPage(): void
  page(P: unknown, c: unknown): { zk: Zk }
}
const Prototype = new Function(
  'norm',
  `return class { ${source}
    norm(s) { return norm(s) }
    focusStep() {}
    setState(o) { Object.assign(this.state, o) } }`,
)(norm) as new () => Proto
const P = new Proxy({}, { get: (_, key) => String(key) })
const C = { SV: wspolne.SV }
const SVK = wspolne.SV.map((s) => s.k as ServiceKey)

function proto(s: PlannerState): Proto {
  const p = new Prototype()
  p.state = {
    ...p.initState(),
    step: s.step,
    svc: [...s.services],
    uns: s.unsure,
    pre: s.preset,
    obj: s.object,
    size: s.size,
    stage: s.stage,
    ans: { ...s.answers },
    town: s.town,
    via: s.via,
    when: s.when,
    cons: s.consent,
    name: s.name,
    phone: s.phone,
    email: s.email,
    fromLink: s.fromLink,
  }
  return p
}
const zkOf = (s: PlannerState) => proto(s).page(P, C).zk

const ready: PlannerState = {
  ...INITIAL_PLANNER,
  step: 4,
  services: ['kam', 'wifi', 'kd'],
  object: 'pens',
  size: 1,
  stage: 0,
  answers: { kam: 1, wifi: 3 },
  town: 'Zakopane',
  name: 'Anna',
  phone: '600 100 200',
  consent: true,
}

const STATES: [string, PlannerState][] = [
  ['start', INITIAL_PLANNER],
  ['from a link', { ...INITIAL_PLANNER, services: ['kam', 'ev'], fromLink: true }],
  ['unsure', { ...INITIAL_PLANNER, unsure: true, step: 2 }],
  ['unsure after details', { ...INITIAL_PLANNER, unsure: true, step: 4 }],
  ['step 2 with a town', { ...ready, step: 2, town: 'Chabówka' }],
  ['short town', { ...ready, step: 2, town: 'Kr' }],
  ['far town', { ...ready, step: 2, town: 'Kraków', stage: 2 }],
  ['step 3', { ...ready, step: 3, services: ['alarm', 'smart', 'snd', 'ev'], answers: {} }],
  ['ready', ready],
  ['bad phone', { ...ready, phone: '600 100' }],
  ['e-mail chosen', { ...ready, via: 2, email: 'anna@' }],
  ['no consent', { ...ready, consent: false }],
  ['hotel', { ...ready, object: 'hotel', size: 2, services: ['wifi', 'kd'] }],
]

describe('planner as the prototype', () => {
  it.each(STATES)('ticket, hints and navigation: %s', (_, s) => {
    const zk = zkOf(s)
    const sum = plannerSummary(s)
    expect(String(plannerProgress(s))).toBe(zk.pct)
    expect(plannerNavHint(s)).toBe(zk.navHint)
    expect(plannerHints(s)).toEqual(zk.hints)
    expect([sum.object, sum.stage, sum.details, sum.town, sum.none]).toEqual([
      zk.sumObj,
      zk.sumStage,
      zk.sumQ,
      zk.sumTown,
      zk.sumNoneT,
    ])
    expect(plannerZone(s.town) || 'strefa dojazdu').toBe(zk.zone)
    expect(plannerTips(s)).toEqual(zk.tips)
    // The prototype does not check the name; every state above has one on step 4.
    expect(stepError(s, s.step) !== null).toBe(zk.nextCls.includes('dim'))
  })

  it.each([0, 1, 2, 3])('quick pick %i', (i) => {
    const start = { ...INITIAL_PLANNER, unsure: true, fromLink: true }
    const p = proto(start)
    p.page(P, C).zk.pre[i]!.pick()
    const ours = pickPreset(start, i)
    expect([ours.services, ours.object, ours.preset, ours.unsure, ours.fromLink]).toEqual([
      p.state.svc,
      p.state.obj,
      p.state.pre,
      p.state.uns,
      p.state.fromLink,
    ])
    // A chosen object stays.
    expect(pickPreset({ ...start, object: 'apt' }, i).object).toBe('apt')
  })

  it('service tiles and „Nie wiem” as the prototype', () => {
    let ours: PlannerState = { ...INITIAL_PLANNER, preset: 2, unsure: true }
    const p = proto(ours)
    for (const key of ['kam', 'ev', 'kam'] as ServiceKey[]) {
      p.page(P, C).zk.svc[SVK.indexOf(key)]!.toggle()
      ours = toggleService(ours, key)
      expect([ours.services, ours.preset, ours.unsure]).toEqual([
        p.state.svc,
        p.state.pre,
        p.state.uns,
      ])
    }
    p.page(P, C).zk.uns()
    ours = toggleUnsure(ours)
    expect([ours.services, ours.unsure]).toEqual([p.state.svc, p.state.uns])
  })

  it.each<[string, PlannerState, PlannerStep]>([
    ['empty to 3', INITIAL_PLANNER, 3],
    ['with a service to 4', { ...INITIAL_PLANNER, services: ['kam'] }, 4],
    ['back to 1', { ...ready, step: 3 }, 1],
  ])('the progress bar: %s', (_, s, target) => {
    const p = proto(s)
    p.page(P, C).zk.steps[target - 1]!.go()
    const ours = goToStep(s, target)
    expect(ours.step).toBe(p.state.step)
    expect(ours.error ? 'err' : '').toBe(p.state.err ? 'err' : '')
  })

  it('reads the address like mountPage()', () => {
    const p = new Prototype()
    p.state = p.initState()
    // Node: the prototype reads `window.location.hash` only.
    const g = globalThis as { window?: unknown }
    g.window = { location: { hash: '#obiekt=biuro&uslugi=ev,kam' } }
    p.mountPage()
    delete g.window
    const ours = plannerFromHash('#obiekt=biuro&uslugi=ev,kam')
    expect([ours.object, ours.services, ours.fromLink]).toEqual([
      p.state.obj,
      p.state.svc,
      p.state.fromLink,
    ])
  })
})

describe('planner rules of the site', () => {
  it('takes the service of a service page link (`?usluga=`), the hash first', () => {
    expect(plannerFromHash('', '?usluga=ant').services).toEqual(['ant'])
    expect(plannerFromHash('', '?usluga=zle').services).toEqual([])
    expect(plannerFromHash('#uslugi=kam', '?usluga=ant').services).toEqual(['kam'])
  })

  it('asks for the name before the phone (the inquiry needs it)', () => {
    expect(stepError({ ...ready, name: ' ' }, 4)).toBe('name')
  })

  it('sends answers the server accepts', () => {
    const s: PlannerState = {
      ...ready,
      services: ['kam', 'ev'],
      answers: { kam: 1, ev: 0, wifi: 2 },
      message: '  parking  ',
      when: 1,
      charger: {
        model: 'EcoPower Wall',
        punkty: 1,
        mocNaPunkt: '11 kW',
        wyjscie: 'gniazdo',
        montaz: 'ściana',
      },
    }
    const body = plannerBody(s, {
      href: 'https://instalacje.localhost/zaplanuj',
      formToken: 't',
      website: '',
    })
    expect(body).toMatchObject({
      type: 'wizard',
      category: 'Instalacje — Zaplanuj',
      city: 'Zakopane',
      message: 'parking',
      consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
    })
    // An answer of a service no longer chosen is not sent.
    expect(body.wizard.answers).toEqual({ kam: 1, ev: 0 })
    expect(parsePlanAnswers(body.wizard)).not.toBeNull()
    expect(parseInquiryInput(body, 'instalacje').success).toBe(true)
  })

  it('sends the charger only with the EV service', () => {
    const charger = { model: 'M', punkty: 1, mocNaPunkt: '7 kW', wyjscie: 'W', montaz: 'S' }
    const body = plannerBody(
      { ...ready, charger },
      { href: 'https://x.pl/', formToken: 't', website: '' },
    )
    expect(body.wizard).not.toHaveProperty('charger')
  })

  it('goes to /wyslane with the number and the contact way only', () => {
    expect(sentHref('PKI-2026-0007', 1)).toBe('/wyslane?nr=PKI-2026-0007&kontakt=whatsapp')
    expect(sentHref(null, 0)).toBe('/wyslane?kontakt=phone')
  })
})

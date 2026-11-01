import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { parseInquiryInput } from '@/lib/inquiry/schema'

import { serwis } from '../../dane/serwis'
import {
  faultBody,
  faultError,
  faultSummary,
  INITIAL_FAULT,
  isUrgent,
  pickSystem,
  symptomOf,
  trackSteps,
  type FaultState,
} from './serwisModel'

// The reference: the prototype's own class (`zrodlo/pages/Serwis.js`, v4.2) with a `setState`
// that merges and a stub of the shared sections (`sub`).
const source = readFileSync(
  fileURLToPath(
    new URL('../../../../../docs/design/prokominstalacje/zrodlo/pages/Serwis.js', import.meta.url),
  ),
  'utf8',
)
type Sv = {
  sys: { n: string; ic: string; pick: () => void }[]
  sym: { n: string }[]
  urg: { n: string }[]
  urgent: boolean
  sSys: string
  sSym: string
  sUrg: string
  errT: string
  send: () => void
  steps: { t: string; d: string; cls: string }[]
}
type Proto = {
  state: Record<string, unknown>
  props: Record<string, unknown>
  initState(): Record<string, unknown>
  page(P: unknown, c: unknown): { sv: Sv; plans: { n: string; f: string[]; pr: string }[] }
}
const Prototype = new Function(
  `return class { ${source}
    sub(c, o) { return o }
    setState(o) { Object.assign(this.state, o) } }`,
)() as new () => Proto
const P = new Proxy({}, { get: (_, key) => String(key) })

function sv(state: Partial<{ sys: number; sym: number; urg: number; ph: string }>): {
  proto: Proto
  sv: Sv
} {
  const proto = new Prototype()
  proto.props = {}
  proto.state = { ...proto.initState(), ...state }
  return { proto, sv: proto.page(P, {}).sv }
}

const ours = (s: Partial<FaultState>): FaultState => ({ ...INITIAL_FAULT, ...s })

describe('fault form as the prototype', () => {
  it('lists the same systems and urgencies', () => {
    const ref = sv({}).sv
    expect(serwis.form.systems.map((s) => s.label)).toEqual(ref.sys.map((s) => s.n))
    expect(serwis.form.systems.map((s) => s.icon)).toEqual(ref.sys.map((s) => s.ic))
    expect(serwis.form.urgency).toEqual(ref.urg.map((u) => u.n))
  })

  it.each([
    { sys: 0, sym: 2, urg: 0 },
    { sys: 3, sym: 1, urg: 2 },
    { sys: 9, sym: 3, urg: 1 },
    { sys: 8, sym: 0, urg: 1 },
  ])('symptoms, summary and the urgent note for %o', (st) => {
    const ref = sv(st).sv
    const s = ours(st)
    expect(serwis.form.systems[s.sys]!.symptoms).toEqual(ref.sym.map((x) => x.n))
    expect(faultSummary(s)).toEqual({ system: ref.sSys, symptom: ref.sSym, urgency: ref.sUrg })
    expect(symptomOf(s)).toBe(ref.sSym)
    expect(isUrgent(s)).toBe(ref.urgent)
  })

  it('another system clears the symptom', () => {
    const { proto } = sv({ sys: 0, sym: 2 })
    proto.page(P, {}).sv.sys[4]!.pick()
    expect(pickSystem(ours({ sys: 0, sym: 2 }), 4)).toMatchObject({
      sys: proto.state.sys,
      sym: proto.state.sym,
    })
  })

  it('asks for a phone of 9 digits with the prototype text', () => {
    const { proto } = sv({ ph: '600 100' })
    proto.page(P, {}).sv.send()
    expect(faultError(ours({ name: 'Anna', phone: '600 100', consent: true }))).toBe('phone')
    expect(serwis.form.errors.phone).toBe(proto.state.err)
  })

  it('shows the tracker steps of a sent report', () => {
    const { proto } = sv({ ph: '600 100 200' })
    proto.page(P, {}).sv.send()
    const ref = proto.page(P, {}).sv.steps
    expect(trackSteps().map((s) => [s.title, s.text, s.state])).toEqual(
      ref.map((s) => [s.t, s.d, s.cls.replace('trs', '').trim()]),
    )
  })

  it('shows the care plans without prices', () => {
    const ref = new Prototype()
    ref.props = {}
    ref.state = ref.initState()
    const plans = ref.page(P, {}).plans
    expect(serwis.plans.items.map((p) => p.name)).toEqual(plans.map((p) => p.n))
    // Without prices the prototype shows no amount; the page takes the panel's no-price text.
    expect(plans.every((p) => !/\d|CENA/.test(p.pr))).toBe(true)
  })
})

describe('fault form rules of the site', () => {
  const ready = ours({ name: 'Anna', phone: '600 100 200', consent: true })

  it('takes only a phone the server accepts', () => {
    expect(faultError({ ...ready, phone: '+48 (12) 600-12-34' })).toBeNull()
    expect(faultError({ ...ready, phone: '600 100 200 wew. 5' })).toBe('phone')
  })

  it('asks for the name first and the consent last', () => {
    expect(faultError({ ...ready, name: '' })).toBe('name')
    expect(faultError({ ...ready, consent: false })).toBe('consent')
    expect(faultError(ready)).toBeNull()
  })

  it('sends a contact inquiry the server accepts: service, urgency, town', () => {
    const body = faultBody(
      { ...ready, who: 1, sys: 3, sym: 1, urg: 0, town: ' Zakopane ' },
      { href: 'https://instalacje.localhost/serwis#zglos', formToken: 't', website: '' },
    )
    expect(body).toMatchObject({
      type: 'contact',
      category: 'Instalacje — serwis',
      topics: ['kd'],
      city: 'Zakopane',
      deadline: 'Pilne: obiekt bez zabezpieczenia',
      message: 'Zgłoszenie serwisowe.\nInstalacja: Inna firma\nSystem: Zamki\nObjaw: Słaba bateria',
    })
    expect(parseInquiryInput(body, 'instalacje').success).toBe(true)
  })

  it('sends no topic for „Inne”', () => {
    const body = faultBody(
      { ...ready, sys: 9 },
      { href: 'https://x.pl/', formToken: 't', website: '' },
    )
    expect(body.topics).toEqual([])
    expect(parseInquiryInput(body, 'instalacje').success).toBe(true)
  })
})

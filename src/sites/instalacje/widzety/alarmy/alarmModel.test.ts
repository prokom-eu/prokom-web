import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { type AlarmMode, type AlarmTest, alarmy } from '../../dane/alarmy'
import {
  doorPhone,
  holiday,
  house,
  houseAutoplayStep,
  INITIAL_HOUSE,
  type Simulation,
  versionItems,
} from './alarmModel'

// The reference: the prototype's own `page()` (`zrodlo/pages/Alarmy.js`, v4.2), run with icon
// keys instead of paths. The port must give the same classes, texts and numbers for each set.
const source = readFileSync(
  fileURLToPath(
    new URL('../../../../../docs/design/prokominstalacje/zrodlo/pages/Alarmy.js', import.meta.url),
  ),
  'utf8',
)
type Ref = {
  al: {
    clock: string
    rooms: { n: string; cls: string }[]
    sens: { l: string; cls: string }[]
    sirCls: string
    stT: string
    stS: string
    msgs: { t: string; s: string; cls: string }[]
    note: string
  }
  av: { items: { n: string; cls: string }[] }
  vd: { time: string; lbl: string; msg: string; cls: string; c1: string; c2: string }
  dl: {
    date: string
    clock: string
    stat: { v: string; cls: string }[]
    feed: { ic: string; t: string; s: string; cls: string }[]
  }
  dm: { r: string; rs: string }
}
const Prototype = new Function(
  `return class { ${source} sub(c, o) { return o } setState() {} every() {} }`,
)() as new () => {
  state: Record<string, unknown>
  initState(): Record<string, unknown>
  page(P: unknown, c: unknown): Ref
}
const P = new Proxy({}, { get: (_, key) => String(key) })

function reference(state: Record<string, unknown>): Ref {
  const proto = new Prototype()
  proto.state = { ...proto.initState(), tick: 0, ...state }
  return proto.page(P, {})
}

const MODES: AlarmMode[] = ['off', 'night', 'full']
const TESTS: (AlarmTest | null)[] = [null, 'in', 'water', 'smoke']

describe('house cross-section', () => {
  it.each(
    MODES.flatMap((mode) =>
      TESTS.flatMap((test) => [0, 1, 2, 3, 7].map((step) => [mode, test, step] as const)),
    ),
  )('%s, test %s, step %i as the prototype', (mode, test, step) => {
    const tick = 100 + step
    const sim: Simulation = test ? { test, t0: 100 } : null
    const ref = reference({ amode: mode, sim: test ? { k: test, t0: 100 } : null, tick })
    const v = house(mode, sim, tick)
    const h = alarmy.house
    expect(v.rooms.map((r) => ({ n: r.name, cls: r.cls }))).toEqual(
      ref.al.rooms.map((r) => ({ n: r.n, cls: r.cls })),
    )
    expect(v.sensors.map((s) => ({ l: s.letter, cls: s.cls }))).toEqual(
      ref.al.sens.map((s) => ({ l: s.l, cls: s.cls })),
    )
    expect(v.siren ? 'sirg on' : 'sirg').toBe(ref.al.sirCls)
    expect([h.status[v.status].title, h.status[v.status].sub]).toEqual([ref.al.stT, ref.al.stS])
    expect(
      v.messages.map((m) => ({
        t: h.messages[m.key].title,
        s: h.messages[m.key].sub,
        cls: m.alarm ? 'amsg al' : 'amsg',
      })),
    ).toEqual(ref.al.msgs)
    expect([v.clock, v.note]).toEqual([ref.al.clock, ref.al.note])
  })

  it('autoplay: test on the 2nd step, next scenario after the 9th', () => {
    let s = INITIAL_HOUSE
    s = houseAutoplayStep(s, 10)
    expect(s.sim).toBeNull()
    s = houseAutoplayStep(s, 11)
    expect(s.sim).toEqual({ test: 'in', t0: 11 })
    for (let i = 0; i < 7; i++) s = houseAutoplayStep(s, 12 + i)
    expect(s).toEqual({ scenario: 1, n: 0, mode: 'night', sim: null })
  })
})

describe('alarm versions', () => {
  it.each([0, 1, 2, 3])('version %i as the prototype', (avs) => {
    const ref = reference({ avs })
    expect(
      versionItems(avs).map((i) => ({
        n: alarmy.versions.elements[i.key].name,
        cls: i.on ? 'alvi on' : 'alvi',
      })),
    ).toEqual(ref.av.items.map((i) => ({ n: i.n, cls: i.cls })))
  })
})

describe('door phone', () => {
  it.each([0, 1, 2, 3])('state %i as the prototype', (vd) => {
    const ref = reference({ vd })
    const d = doorPhone(vd)
    const s = alarmy.doorPhone.states[vd]!
    expect([d.time, s.label, s.message, d.ringing ? 'ring' : '']).toEqual([
      ref.vd.time,
      ref.vd.lbl,
      ref.vd.msg,
      ref.vd.cls,
    ])
    expect([d.talk ? 'on' : '', d.gate ? 'on' : '']).toEqual([ref.vd.c1, ref.vd.c2])
  })
})

describe('holiday house', () => {
  it.each([1, 2, 12, 20, 21, 22, 34, 35, 36, 37, 52, 60])('day %i as the prototype', (dday) => {
    const ref = reference({ dday })
    const v = holiday(dday)
    const h = alarmy.holiday
    expect([v.date, v.clock]).toEqual([ref.dl.date, ref.dl.clock])
    expect([
      { v: v.inside.value, cls: v.inside.bad ? 'dls bad' : 'dls' },
      { v: v.outside, cls: 'dls' },
      { v: v.leak ? h.stats.leak : h.stats.dry, cls: v.leak ? 'dls bad' : 'dls' },
    ]).toEqual(ref.dl.stat.map((s) => ({ v: s.v, cls: s.cls })))
    const feed = v.feed.length
      ? v.feed.map((f) => ({ ic: f.icon, t: f.title, s: f.sub, cls: `phn dlf ${f.tone}` }))
      : [{ ic: 'check', t: h.empty.title, s: h.empty.sub, cls: 'phn dlf ok' }]
    expect(feed).toEqual(ref.dl.feed)
  })
})

describe('intercom question', () => {
  it.each([0, 1, 2])('answer %i as the prototype', (dmq) => {
    const ref = reference({ dmq })
    const a = alarmy.intercoms.question.answers[dmq]!
    expect([a.result, a.text]).toEqual([ref.dm.r, ref.dm.rs])
  })
})

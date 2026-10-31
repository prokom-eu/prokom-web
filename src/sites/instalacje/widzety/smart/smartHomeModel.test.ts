import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { type RoomStateKey, type SceneKey, smartHome } from '../../dane/smartHome'
import {
  adjust,
  autoplayStep,
  checklistProgress,
  type Control,
  cycleRoom,
  ecoSummary,
  failureRooms,
  INITIAL_PLAN,
  type PlanState,
  planView,
  sceneState,
  toggle,
} from './smartHomeModel'

// The reference: the prototype's own class (`zrodlo/pages/SmartHome.js`, v4.2) with a `setState`
// that really merges, so clicks and the autoplay run in the original too.
const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../../docs/design/prokominstalacje/zrodlo/pages/SmartHome.js',
      import.meta.url,
    ),
  ),
  'utf8',
)
type Pick = { pick: () => void }
type Ref = {
  sh: {
    scenes: (Pick & { on: string })[]
    tOff: () => void
    rooms: (Pick & { lst: string; t: string; cls: string; gcls: string; n: string })[]
    wins: { bw: number | string; bh: number | string }[]
    gate: { w: number }
    alCls: string
    alT: string
    sel: {
      n: string
      l: number
      b: number
      t: number
      lm: () => void
      lp: () => void
      bm: () => void
      bp: () => void
      tm: () => void
      tp: () => void
    }
    appS: string
    note: string
  }
  fl: { toggle: () => void; [k: string]: unknown }
  rb: { sum: string; rooms: (Pick & { cls: string })[] }
  ck: { items: Pick[]; bar: string; txt: string }
  pn: { size: Pick[]; icons: { press: () => void }[]; gst: string }
}
type Proto = {
  state: Record<string, unknown>
  initState(): Record<string, unknown>
  mountPage(): void
  page(P: unknown, c: unknown): Ref
  tick?: () => void
}
const Prototype = new Function(
  `return class { ${source}
    sub(c, o) { return o }
    setState(o) { Object.assign(this.state, o) }
    every(ms, fn) { this.tick = fn.bind(this) } }`,
)() as new () => Proto
const P = new Proxy({}, { get: (_, key) => String(key) })

function fresh(): Proto {
  const proto = new Prototype()
  proto.state = proto.initState()
  return proto
}

function expectSame(proto: Proto, state: PlanState) {
  const ref = proto.page(P, {}).sh
  const v = planView(state)
  expect(
    v.rooms.map((r) => ({
      lst: `opacity:${r.glow}`,
      t: r.temp,
      cls: r.terrace ? 'shr ext' : 'shr',
      gcls: r.selected ? 'shg sel' : 'shg',
    })),
  ).toEqual(ref.rooms.map((r) => ({ lst: r.lst, t: r.t, cls: r.cls, gcls: r.gcls })))
  expect(v.windows.map((w) => ({ bw: w.bw, bh: w.bh }))).toEqual(
    ref.wins.map((w) => ({ bw: w.bw, bh: w.bh })),
  )
  expect(v.gateWidth).toBe(ref.gate.w)
  expect([v.alarm.armed ? 'shal arm' : 'shal', v.alarm.text]).toEqual([ref.alCls, ref.alT])
  expect([v.app, v.note]).toEqual([ref.appS, ref.note])
  const sel = state.rs[state.sel]
  expect([smartHome.plan.rooms[state.sel].name, sel.l, sel.b, sel.t]).toEqual([
    ref.sel.n,
    ref.sel.l,
    ref.sel.b,
    ref.sel.t,
  ])
  expect(smartHome.plan.scenes.map((s) => String(state.scene === s.key))).toEqual(
    ref.scenes.map((s) => s.on),
  )
}

const SCENES = smartHome.plan.scenes.map((s) => s.key)
const BUTTONS: Record<string, [Control, boolean]> = {
  lm: ['l', false],
  lp: ['l', true],
  bm: ['b', false],
  bp: ['b', true],
  tm: ['t', false],
  tp: ['t', true],
}

describe('floor plan', () => {
  it('starts as the prototype', () => {
    expectSame(fresh(), INITIAL_PLAN)
  })

  it.each(SCENES.map((k, i) => [k, i] as const))('scene %s as the prototype', (key, i) => {
    const proto = fresh()
    proto.page(P, {}).sh.scenes[i]!.pick()
    expectSame(proto, { ...INITIAL_PLAN, ...sceneState(key as SceneKey) })
  })

  it.each([
    [['lp', 'lp', 'lp', 'bp', 'bp', 'bp', 'bp', 'bp', 'tm', 'tm']],
    [['lm', 'lm', 'lm', 'lm', 'bm', 'tp', 'tp', 'tp']],
  ])('room card %j as the prototype, in two rooms, offline', (buttons) => {
    const proto = fresh()
    let state = INITIAL_PLAN
    for (const room of [5, 2]) {
      proto.page(P, {}).sh.rooms[room]!.pick()
      state = { ...state, sel: state.sel === 'sal' ? 'gab' : 'syp' }
      for (const b of buttons) {
        ;(proto.page(P, {}).sh.sel as unknown as Record<string, () => void>)[b]!()
        const [control, up] = BUTTONS[b]!
        state = adjust(state, control, up)
        expectSame(proto, state)
      }
    }
    proto.page(P, {}).sh.tOff()
    expectSame(proto, { ...state, off: true })
  })

  it('autoplay: 12 steps as the prototype', () => {
    const proto = fresh()
    proto.mountPage()
    for (let step = 0; step < 12; step++) {
      proto.tick!()
      expectSame(proto, autoplayStep(step))
    }
  })
})

describe('failure demo', () => {
  it.each([false, true])('fail %s as the prototype', (fail) => {
    const proto = fresh()
    if (fail) proto.page(P, {}).fl.toggle()
    const ref = proto.page(P, {}).fl
    const rooms = failureRooms(fail)
    const F = smartHome.why.failure
    expect({
      btn: fail ? F.restore : F.fail,
      cc: fail ? 'flc bad' : 'flc',
      aTxt: fail ? F.central.bad : F.central.ok,
      bTxt: fail ? F.modular.bad : F.modular.ok,
      ...Object.fromEntries(rooms.central.map((off, i) => [`a${i}`, off ? 'flrm off' : 'flrm'])),
      ...Object.fromEntries(
        rooms.modular.map((off, i) => [`b${i}`, off ? 'flrm off bad' : 'flrm']),
      ),
    }).toEqual({
      btn: ref.btn,
      cc: ref.cc,
      aTxt: ref.aTxt,
      bTxt: ref.bTxt,
      ...Object.fromEntries(
        [0, 1, 2, 3, 4, 5].flatMap((i) => [
          [`a${i}`, ref[`a${i}`]],
          [`b${i}`, ref[`b${i}`]],
        ]),
      ),
    })
  })
})

describe('guesthouse rooms', () => {
  it.each([[[]], [[1]], [[0, 0, 2, 3]], [[1, 4, 0, 2, 5, 5, 3]]])(
    'clicks %j as the prototype',
    (clicks: number[]) => {
      const proto = fresh()
      let rooms: RoomStateKey[] = [...smartHome.objects.initialRooms]
      for (const i of clicks) {
        proto.page(P, {}).rb.rooms[i]!.pick()
        rooms = cycleRoom(rooms, i)
      }
      const ref = proto.page(P, {}).rb
      expect(ecoSummary(rooms)).toBe(ref.sum)
      expect(rooms.map((r) => `rbr ${r}`)).toEqual(ref.rooms.map((r) => r.cls))
    },
  )
})

describe('checklist and panel', () => {
  it.each([[[]], [[1]], [[2, 3, 4, 5, 6, 7]], [[0, 0, 0]]])(
    'checklist clicks %j as the prototype',
    (clicks: number[]) => {
      const proto = fresh()
      let done = [...smartHome.stages.checklist.initial]
      for (const i of clicks) {
        proto.page(P, {}).ck.items[i]!.pick()
        done = toggle(done, i)
      }
      const ref = proto.page(P, {}).ck
      const p = checklistProgress(done)
      expect([`width:${p.width}`, p.text]).toEqual([ref.bar, ref.txt])
    },
  )

  it.each([0, 1, 2])('panel size %i as the prototype', (size) => {
    const proto = fresh()
    proto.page(P, {}).pn.size[size]!.pick()
    const ref = proto.page(P, {}).pn
    const s = smartHome.panels.sizes[size]!
    expect(`grid-template-columns:repeat(${s.cols},minmax(0,1fr))`).toBe(ref.gst)
    expect(s.fields).toBe(ref.icons.length)
  })
})

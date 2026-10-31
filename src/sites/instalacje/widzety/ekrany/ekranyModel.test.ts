import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { ekrany } from '../../dane/ekrany'
import {
  autoplayStep,
  brightnessView,
  INITIAL_PITCH,
  INITIAL_SCREEN,
  INITIAL_SYNC,
  ledView,
  lowerPhone,
  resetPrices,
  SCREEN_KEYS,
  type ScreenState,
  screenView,
  type SyncState,
  syncLog,
  syncRows,
  togglePromo,
} from './ekranyModel'

// The reference: the prototype's own class (`zrodlo/pages/Multimedia.js`, v4.2) with a
// `setState` that really merges, so clicks and the autoplay run in the original too.
const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../../docs/design/prokominstalacje/zrodlo/pages/Multimedia.js',
      import.meta.url,
    ),
  ),
  'utf8',
)
type Pick = { pick: () => void }
type Ref = {
  tv: {
    tabs: (Pick & { on: string })[]
    fmt: string
    frame: string
    s: { h: string; sub: string; f: string; items: Record<string, string>[] }
    clock: string
    dots: string[]
    sched: { n: string; st: string; cls: string }[]
    nowSt: string
    note: string
  }
  sy: { log: string; btns: { go: () => void }[]; rows: { n: string; p: string; cls: string }[] }
  js: {
    places: (Pick & { on: string })[]
    vcls: string
    nits: string
    cls: string
    txt: string
    bar: string
    marks: { n: string; st: string }[]
    scrSt: string
    rLabel: string
    tR: () => void
  }
  ld: { pT: string; min: string; cmf: string; z1: string; z2: string; onP: (e: unknown) => void }
}
type Proto = {
  state: Record<string, unknown> & { tick: number }
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
  proto.state = { ...proto.initState(), tick: 13 }
  return proto
}

function expectScreen(proto: Proto, state: ScreenState) {
  const ref = proto.page(P, {}).tv
  const v = screenView(state, proto.state.tick)
  const sl = v.slide
  const items =
    sl.kind === 'rec'
      ? sl.items.map(([ic, val, n]) => ({ ic, v: val, n, st: '' }))
      : sl.kind === 'menu'
        ? sl.items.map(([n, val]) => ({ n, v: val, st: '' }))
        : sl.kind === 'conf'
          ? sl.items.map(([n, h]) => ({ n, st: `height:${h}%` }))
          : []
  expect({
    fmt: v.format,
    frame: v.portrait ? 'tvf port' : 'tvf',
    s: { h: sl.title, sub: 'sub' in sl ? sl.sub : '', f: sl.foot, items },
    clock: v.clock,
    dots: v.dots.map((on) => (on ? 'on' : '')),
    sched: v.schedule.map((p) => ({
      n: p.name,
      st: `left:${p.left};width:${p.width}`,
      cls: p.on ? 'on' : '',
    })),
    nowSt: `left:${v.now}`,
    note: v.note,
    tabs: SCREEN_KEYS.map((k) => String(k === state.tab)),
  }).toEqual({
    fmt: ref.fmt,
    frame: ref.frame,
    s: ref.s,
    clock: ref.clock,
    dots: ref.dots,
    sched: ref.sched,
    nowSt: ref.nowSt,
    note: ref.note,
    tabs: ref.tabs.map((t) => t.on),
  })
}

describe('screens in the hero', () => {
  it.each(SCREEN_KEYS.flatMap((k, i) => [0, 1, 2].map((slide) => [k, i, slide] as const)))(
    '%s, slide %i as the prototype',
    (tab, i, slide) => {
      const proto = fresh()
      proto.page(P, {}).tv.tabs[i]!.pick()
      proto.state.sl = slide
      expectScreen(proto, { tab, slide })
    },
  )

  it.each([false, true])('autoplay: 40 ticks as the prototype, touched %s', (touched) => {
    const proto = fresh()
    proto.mountPage()
    proto.state.touched = touched
    let state = INITIAL_SCREEN
    for (let n = 1; n <= 40; n++) {
      proto.tick!()
      state = autoplayStep(state, n, touched)
      expect([state.tab, state.slide]).toEqual([proto.state.tab, proto.state.sl])
      expectScreen(proto, state)
    }
  })
})

describe('demo: two salons', () => {
  it.each([[[]], [[0]], [[0, 0, 1]], [[1, 1, 0, 2]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]]])(
    'clicks %j as the prototype',
    (clicks: number[]) => {
      const proto = fresh()
      let state: SyncState = INITIAL_SYNC
      const actions = [lowerPhone, togglePromo, resetPrices]
      for (const i of clicks) {
        proto.page(P, {}).sy.btns[i]!.go()
        state = actions[i]!(state)
      }
      const ref = proto.page(P, {}).sy
      expect(syncRows(state).map((r) => ({ n: r.name, p: r.price, cls: r.cls }))).toEqual(ref.rows)
      // The prototype stamps the click with the current time.
      const time = /o (\d\d:\d\d:\d\d)/.exec(ref.log)?.[1] ?? ''
      expect(syncLog(state, time)).toBe(ref.log)
    },
  )
})

describe('brightness', () => {
  it.each(ekrany.brightness.places.flatMap((_, i) => [false, true].map((r) => [i, r] as const)))(
    'place %i, regular screen %s as the prototype',
    (place, regular) => {
      const proto = fresh()
      proto.page(P, {}).js.places[place]!.pick()
      if (regular) proto.page(P, {}).js.tR()
      const ref = proto.page(P, {}).js
      const v = brightnessView(place, regular)
      expect({
        vcls: v.scene,
        nits: v.range,
        cls: v.cls,
        txt: v.text,
        bar: `width:${v.bar}`,
        marks: v.marks.map((m) => ({ n: m.label, st: `left:${m.left}` })),
        scrSt: `opacity:${v.screenOpacity};filter:contrast(${v.screenContrast})`,
        rLabel: v.toggle,
      }).toEqual({
        vcls: ref.vcls,
        nits: ref.nits,
        cls: ref.cls,
        txt: ref.txt,
        bar: ref.bar,
        marks: ref.marks,
        scrSt: ref.scrSt,
        rLabel: ref.rLabel,
      })
    },
  )
})

describe('LED pixel pitch', () => {
  it.each([9, 12, 25, 40, 63, 80, 100, INITIAL_PITCH])('pitch %i as the prototype', (pitch) => {
    const proto = fresh()
    proto.page(P, {}).ld.onP({ target: { value: String(pitch) } })
    const ref = proto.page(P, {}).ld
    const v = ledView(pitch)
    expect({
      pT: v.pitch,
      min: v.min,
      cmf: v.comfort,
      z1: `width:${v.closeWidth}`,
      z2: `left:${v.comfortLeft};width:${v.comfortWidth}`,
    }).toEqual({ pT: ref.pT, min: ref.min, cmf: ref.cmf, z1: ref.z1, z2: ref.z2 })
  })
})

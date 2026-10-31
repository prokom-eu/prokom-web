import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  calcView,
  type ConfigOption,
  type ConfigState,
  configView,
  decodeKonf,
  encodeKonf,
  FLAKES,
  homeLimited,
  INITIAL_CALC,
  INITIAL_CONFIG,
  pickPath,
} from './ladowarkiModel'

// The reference: the prototype's own class (`zrodlo/pages/Ladowarki.js`, v4.2) with a `setState`
// that really merges, so clicks run in the original too.
const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../../docs/design/prokominstalacje/zrodlo/pages/Ladowarki.js',
      import.meta.url,
    ),
  ),
  'utf8',
)
type Pick = { pick: () => void }
type Ref = {
  cf: {
    models: Pick[]
    opts: { l: string; ch: (Pick & { n: string; on: string })[] }[]
    title: string
    out: { k: string; v: string }[]
    inst: string
    href: string
    cols: Pick[]
    colN: string
  }
  ev: {
    paths: Pick[]
    dev: string
    kwTxt: string
    pct: number
    fillSt: string
    onBat: (e: unknown) => void
    ranges: Pick[]
    pw: (Pick & { on: string; dis: string; cls: string })[]
    obc: Pick[]
    time: string
    kwh: string
    eff: string
    phase: string
    note: string
    flakes: { x: number; y: number; r: number; st: string }[]
  }
}
type Proto = {
  state: Record<string, unknown>
  initState(): Record<string, unknown>
  page(P: unknown, c: unknown): Ref
}
const Prototype = new Function(
  `return class { ${source}
    sub(c, o) { return o }
    setState(o) { Object.assign(this.state, o) } }`,
)() as new () => Proto
const P = new Proxy({}, { get: (_, key) => String(key) })

function fresh(): Proto {
  const proto = new Prototype()
  proto.state = { ...proto.initState(), tick: 0 }
  return proto
}

const OPTIONS: Record<number, ConfigOption[]> = {
  0: ['hp', 'ho'],
  1: ['wp', 'wk', 'wo', 'wm'],
  2: ['cp', 'ck', 'co'],
}
const SIZES: Record<ConfigOption, number> = {
  hp: 3,
  ho: 2,
  wp: 2,
  wk: 2,
  wo: 2,
  wm: 2,
  wc: 6,
  cp: 2,
  ck: 2,
  co: 2,
}

/** Every combination of a model's options. */
function combos(cm: number): ConfigState[] {
  let states: ConfigState[] = [{ ...INITIAL_CONFIG, cm }]
  for (const key of [...OPTIONS[cm]!, ...(cm === 1 ? (['wc'] as const) : [])]) {
    states = states.flatMap((s) =>
      Array.from({ length: SIZES[key] }, (_, i) => ({ ...s, [key]: i })),
    )
  }
  return states
}

describe('version configurator', () => {
  it.each([0, 1, 2].flatMap(combos).map((s) => [JSON.stringify(s), s] as const))(
    '%s as the prototype',
    (_, state) => {
      const proto = fresh()
      proto.page(P, {}).cf.models[state.cm]!.pick()
      const keys = OPTIONS[state.cm]!
      keys.forEach((key, o) => proto.page(P, {}).cf.opts[o]!.ch[state[key]]!.pick())
      if (state.cm === 1) proto.page(P, {}).cf.cols[state.wc]!.pick()
      const ref = proto.page(P, {}).cf
      const v = configView(state)
      expect({
        opts: v.options.map((o) => ({
          l: o.label,
          ch: o.choices.map((n, i) => ({ n, on: String(state[o.key] === i) })),
        })),
        title: v.title,
        out: v.out.map(([k, val]) => ({ k, v: val })),
        inst: v.install,
        colN: v.colour?.name ?? '',
        href: v.href.replace('/zaplanuj', 'Zaplanuj.dc.html').replace(/&konf=.*$/, ''),
      }).toEqual({
        opts: ref.opts.map((o) => ({ l: o.l, ch: o.ch.map((c) => ({ n: c.n, on: c.on })) })),
        title: ref.title,
        out: ref.out,
        inst: ref.inst,
        colN: ref.colN,
        href: ref.href,
      })
    },
  )

  it('the link carries the version for the planner (ADR-I002 §4)', () => {
    const v = configView({ ...INITIAL_CONFIG, cm: 1, wp: 1, wk: 1, wo: 1, wm: 1, wc: 4 })
    const konf = new URL(`https://x${v.href}`).hash.split('&konf=')[1]!
    expect(konf).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeKonf(konf)).toEqual({
      model: 'CC Wall',
      punkty: 2,
      mocNaPunkt: '22 kW',
      wyjscie: 'przewód 7,5 m',
      montaz: 'na podstawie',
      kolor: 'Zielony',
    })
    expect(v.href.startsWith('/zaplanuj#obiekt=firma&uslugi=ev&konf=')).toBe(true)
  })

  it('konf: Polish letters round-trip, anything else is not a configuration', () => {
    const config = {
      model: 'CC Home',
      punkty: 1,
      mocNaPunkt: '3,7 kW',
      wyjscie: 'przewód 5 m',
      montaz: 'na ścianie',
    }
    expect(decodeKonf(encodeKonf(config))).toEqual(config)
    expect(decodeKonf('nie-json')).toBeNull()
    expect(decodeKonf(encodeKonf({ ...config, punkty: 'dwa' } as never))).toBeNull()
  })
})

describe('charging time calculator', () => {
  const cases: [number, number, number, number, number, number][] = []
  for (const path of [0, 1, 2])
    for (const bat of [30, 60, 110])
      for (const rg of [0, 1, 2])
        for (const pw of [0, 1, 2, 3])
          for (const obc of [0, 1, 2]) cases.push([path, bat, rg, pw, obc, (bat + pw * 3) % 12])

  it.each(cases)(
    'path %i, battery %i, range %i, power %i, car %i, step %i as the prototype',
    (path, bat, rg, pw, obc, anim) => {
      const proto = fresh()
      let state = INITIAL_CALC
      proto.page(P, {}).ev.paths[path]!.pick()
      state = pickPath(state, path)
      proto.page(P, {}).ev.onBat({ target: { value: String(bat) } })
      proto.page(P, {}).ev.ranges[rg]!.pick()
      proto.page(P, {}).ev.pw[pw]!.pick()
      proto.page(P, {}).ev.obc[obc]!.pick()
      proto.state.anim = anim
      state = { ...state, bat, rg, obc, pw: homeLimited(state, pw) ? state.pw : pw }
      const ref = proto.page(P, {}).ev
      const v = calcView(state, anim)
      expect({
        dev: v.device,
        kwTxt: v.kw,
        pct: v.pct,
        fillSt: `width:${v.fill}`,
        time: v.time,
        kwh: v.kwh,
        eff: v.eff,
        phase: v.supply,
        note: v.note,
        pw: [0, 1, 2, 3].map((i) => ({
          on: String(v.pw === i),
          dis: homeLimited(state, i) ? 'true' : '',
        })),
      }).toEqual({
        dev: ref.dev,
        kwTxt: ref.kwTxt,
        pct: ref.pct,
        fillSt: ref.fillSt,
        time: ref.time,
        kwh: ref.kwh,
        eff: ref.eff,
        phase: ref.phase,
        note: ref.note,
        pw: ref.pw.map((p) => ({ on: p.on, dis: p.dis })),
      })
    },
  )

  it('snowflakes as the prototype', () => {
    const ref = fresh().page(P, {}).ev.flakes
    expect(
      FLAKES.map((f) => ({
        x: f.x,
        y: f.y,
        r: f.r,
        st: `animation-duration:${f.duration};animation-delay:${f.delay}`,
      })),
    ).toEqual(ref)
  })
})

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { naglosnienie, type VenueKey } from '../../dane/naglosnienie'
import {
  autoplayStep,
  chainView,
  churchView,
  INITIAL_CALC,
  INITIAL_CHURCH,
  INITIAL_MIXER,
  type MixerState,
  mixerHtml,
  mixerView,
  setLevel,
  speakerCount,
  toggleMute,
  VENUE_KEYS,
} from './naglosnienieModel'
import { SND_MIXER } from './scena'

// The reference: the prototype's own class (`zrodlo/pages/Naglosnienie.js`, v4.2) with a
// `setState` that really merges, so clicks and the autoplay run in the original too.
const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../../docs/design/prokominstalacje/zrodlo/pages/Naglosnienie.js',
      import.meta.url,
    ),
  ),
  'utf8',
)
type Pick = { pick: () => void }
type Ref = {
  mx: {
    venues: (Pick & { n: string; on: string })[]
    ch: {
      n: string
      db: string
      l: string
      seg: string[]
      cls: string
      onLv: (e: unknown) => void
      mute: () => void
    }[]
    src: (Pick & { on: string })[]
    cls: string
    ann: () => void
    note: string
    [k: string]: unknown
  }
  chn: {
    tabs: Pick[]
    ann: () => void
    src: { cls: string }[]
    mix: string
    mixS: string
    amp: string
    ampS: string
    zones: { n: string; sp: string[]; v: string }[]
    note: string
  }
  ko: {
    revT: string
    beam: string
    refl: { d: string; st: string }[]
    blur: string
    bar: string
    txt: string
    tCol: () => void
    onVol: (e: unknown) => void
    onRev: (e: unknown) => void
  }
  ig: {
    hT: string
    res: string
    unit: string
    dots: string[]
    note: string
    modes: Pick[]
    onA: (e: unknown) => void
    onH: (e: unknown) => void
  }
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
const input = (value: number) => ({ target: { value: String(value) } })

function fresh(): Proto {
  const proto = new Prototype()
  proto.state = { ...proto.initState(), tick: 10 }
  return proto
}

function expectMixer(proto: Proto, state: MixerState) {
  const ref = proto.page(P, {}).mx
  const v = mixerView(state)
  expect(v.svgClass).toBe(ref.cls)
  expect(
    v.zones.map((z, i) => ({
      [`z${i}`]: { n: z.name, db: z.db, cls: z.cls, st: `--lv:${z.lv}` },
    })),
  ).toEqual(v.zones.map((_, i) => ({ [`z${i}`]: ref[`z${i}`] })))
  expect(
    v.channels.map((c) => ({
      n: c.name,
      db: c.db,
      l: String(c.level),
      seg: c.segments,
      cls: c.muted ? 'cch mute' : 'cch',
    })),
  ).toEqual(ref.ch.map((c) => ({ n: c.n, db: c.db, l: c.l, seg: c.seg, cls: c.cls })))
  expect(v.note).toBe(ref.note)
  expect(VENUE_KEYS.map((k) => String(k === state.ven))).toEqual(ref.venues.map((x) => x.on))
  expect(VENUE_KEYS.map((k) => naglosnienie.mixer.venues[k].name)).toEqual(
    ref.venues.map((x) => x.n),
  )
  expect([0, 1, 2].map((i) => String(i === state.src))).toEqual(ref.src.map((x) => x.on))
}

describe('zone mixer', () => {
  it('starts as the prototype', () => {
    expectMixer(fresh(), INITIAL_MIXER)
  })

  it.each(VENUE_KEYS.map((k, i) => [k, i] as const))('venue %s as the prototype', (key, i) => {
    const proto = fresh()
    proto.page(P, {}).mx.venues[i]!.pick()
    expectMixer(proto, { ...INITIAL_MIXER, ven: key as VenueKey })
  })

  it('faders, mutes and sources as the prototype', () => {
    const proto = fresh()
    let state = INITIAL_MIXER
    const steps: [string, number, number?][] = [
      ['lv', 0, 100],
      ['lv', 1, 0],
      ['mute', 2],
      ['src', 1],
      ['lv', 3, 45],
      ['mute', 2],
      ['mute', 0],
      ['src', 2],
      ['lv', 2, 5],
    ]
    for (const [kind, i, value] of steps) {
      const mx = proto.page(P, {}).mx
      if (kind === 'lv') {
        mx.ch[i]!.onLv(input(value!))
        state = setLevel(state, i, value!)
      } else if (kind === 'mute') {
        mx.ch[i]!.mute()
        state = toggleMute(state, i)
      } else {
        mx.src[i]!.pick()
        state = { ...state, src: i }
      }
      expectMixer(proto, state)
    }
  })

  it('an announcement as the prototype, with a muted zone', () => {
    const proto = fresh()
    proto.page(P, {}).mx.ch[1]!.mute()
    proto.page(P, {}).mx.ann()
    expectMixer(proto, { ...toggleMute(INITIAL_MIXER, 1), pri: true })
    // Four ticks later it is over.
    proto.state.tick += 4
    expectMixer(proto, toggleMute(INITIAL_MIXER, 1))
  })

  it('autoplay: 60 ticks as the prototype', () => {
    const proto = fresh()
    proto.mountPage()
    let state = INITIAL_MIXER
    for (let n = 1; n <= 60; n++) {
      proto.tick!()
      state = autoplayStep({ ...state, pri: false }, n)
      // The prototype's announcement starts at the current tick; ours is a flag.
      const pri = proto.state.pri === proto.state.tick
      expect({ ven: state.ven, lv: state.lv, pri: state.pri }).toEqual({
        ven: proto.state.ven,
        lv: proto.state.lv,
        pri,
      })
      proto.state.pri = -99
    }
  })
})

describe('signal chain', () => {
  it.each([
    [0, false],
    [0, true],
    [1, false],
    [1, true],
  ])('line %i, announcement %s as the prototype', (line, ann) => {
    const proto = fresh()
    proto.page(P, {}).chn.tabs[line]!.pick()
    if (ann) proto.page(P, {}).chn.ann()
    const ref = proto.page(P, {}).chn
    const v = chainView(line, ann)
    expect({
      src: v.sources.map((x) => x.cls),
      mix: v.mixer,
      mixS: v.mixerSub,
      amp: v.amp,
      ampS: v.ampSub,
      zones: v.zones.map((z) => ({ n: z.name, sp: z.speakers, v: z.value })),
      note: v.note,
    }).toEqual({
      src: ref.src.map((x) => x.cls),
      mix: ref.mix,
      mixS: ref.mixS,
      amp: ref.amp,
      ampS: ref.ampS,
      zones: ref.zones,
      note: ref.note,
    })
  })
})

describe('church', () => {
  const cases: [number, number, boolean][] = []
  for (const vol of [20, 35, 60, 70, 85, 100])
    for (const rev of [1, 3, 5]) for (const cols of [false, true]) cases.push([vol, rev, cols])

  it.each(cases)('volume %i, reverb %i, columns %s as the prototype', (vol, rev, cols) => {
    const proto = fresh()
    proto.page(P, {}).ko.onVol(input(vol))
    proto.page(P, {}).ko.onRev(input(rev))
    if (cols) proto.page(P, {}).ko.tCol()
    const ref = proto.page(P, {}).ko
    const v = churchView({ ...INITIAL_CHURCH, vol, rev, cols })
    expect({
      revT: v.reverb,
      beam: v.beam,
      refl: v.reflections.map((r) => ({ d: r.d, st: `opacity:${r.opacity}` })),
      blur: `filter:blur(${v.blur}px);opacity:${v.phraseOpacity}`,
      bar: `width:${v.bar}`,
      txt: v.text,
    }).toEqual({
      revT: ref.revT,
      beam: ref.beam,
      refl: ref.refl,
      blur: ref.blur,
      bar: ref.bar,
      txt: ref.txt,
    })
  })
})

describe('speaker calculator', () => {
  const cases: [number, number, number][] = []
  for (const area of [20, 50, 120, 300, 600])
    for (const height of [24, 30, 44, 46, 60])
      for (const mode of [0, 1]) cases.push([area, height, mode])

  it.each(cases)('area %i, height %i, mode %i as the prototype', (area, height, mode) => {
    const proto = fresh()
    proto.page(P, {}).ig.onA(input(area))
    proto.page(P, {}).ig.onH(input(height))
    proto.page(P, {}).ig.modes[mode]!.pick()
    const ref = proto.page(P, {}).ig
    const v = speakerCount({ ...INITIAL_CALC, area, height, mode })
    expect({ hT: v.heightText, res: v.result, unit: v.unit, dots: v.dots, note: v.note }).toEqual({
      hT: ref.hT,
      res: ref.res,
      unit: ref.unit,
      dots: ref.dots,
      note: ref.note,
    })
  })
})

describe('mixer markup', () => {
  it.each(VENUE_KEYS)(
    '%s: every binding filled in, the banner only during an announcement',
    (ven) => {
      for (const pri of [false, true]) {
        const html = mixerHtml(SND_MIXER, { ...INITIAL_MIXER, ven, pri })
        expect(html).not.toMatch(/%[\w.]+%/)
        expect(html.includes('m_mxban')).toBe(pri)
        for (const zone of naglosnienie.mixer.venues[ven].zones) expect(html).toContain(zone)
      }
    },
  )

  it('the scene has no scripts or event handlers', () => {
    const all = [SND_MIXER.base, SND_MIXER.priority, ...Object.values(SND_MIXER.venues)].join('')
    expect(all).not.toMatch(/<script|\son\w+=/i)
  })
})

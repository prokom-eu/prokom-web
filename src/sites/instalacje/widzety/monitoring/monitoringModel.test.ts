import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { type CamMode, monitoring, SYSTEM_ELEMENT_KEYS } from '../../dane/monitoring'
import {
  dori,
  INITIAL_NVR,
  nvrNoteKey,
  nvrTime,
  type NvrState,
  recording,
  shownElement,
  stepElement,
  timeline,
  toggleDeter,
  versionElements,
} from './monitoringModel'

// The reference: the prototype's own `page()` (`zrodlo/pages/Monitoring.js`, v4.2), run with
// icon keys instead of paths. The port must give the same numbers and texts for each set.
const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../../docs/design/prokominstalacje/zrodlo/pages/Monitoring.js',
      import.meta.url,
    ),
  ),
  'utf8',
)
type Ref = {
  nv: { time: string; note: string; ev: { cls: string; st: string; k: string; t: string }[] }
  dori: {
    ppm: number
    w: string
    zones: { n: string; st: string }[]
    manSt: string
    lv: { cls: string }[]
    txt: string
  }
  rec: { big: string; unit: string; bar: string; txt: string }
  sy: { list: { n: string }[]; info: { n: string; spec: string }; pos: string; cnt: string }
}
const Prototype = new Function(
  `return class { ${source} sub(c, o) { return o } setState() {} }`,
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

describe('recorder preview', () => {
  it.each([
    [{ ...INITIAL_NVR }, 0],
    [{ ...INITIAL_NVR, mode: 'ir' as CamMode, mask: false }, 75],
    [{ ...INITIAL_NVR, mode: 'day' as CamMode }, 1999],
    [{ ...INITIAL_NVR, ai: false }, 61],
    [{ ...INITIAL_NVR, ai: false, mode: 'day' as CamMode, mask: false }, 3],
  ])('note, clock and timeline as the prototype (%o, tick %i)', (state: NvrState, tick) => {
    const ref = reference({ ...state, tick })
    const n = monitoring.nvr.notes
    expect(n[nvrNoteKey(state)] + (state.mask ? n.mask : '')).toBe(ref.nv.note)
    expect(nvrTime(state.mode, tick)).toBe(ref.nv.time)
    expect(
      timeline(state.ai).map((e) => ({
        cls: `tlev ${e.kind}`,
        st: `left:${e.left}%`,
        k: e.mark,
        t: monitoring.nvr.timeline.titles[e.kind],
      })),
    ).toEqual(ref.nv.ev)
  })

  it('switching deterrence on in the day shows the night in IR', () => {
    const day = { ...INITIAL_NVR, mode: 'day' as CamMode, deter: false }
    expect(toggleDeter(day)).toMatchObject({ deter: true, mode: 'ir' })
    expect(toggleDeter({ ...day, deter: true })).toMatchObject({ deter: false, mode: 'day' })
    expect(toggleDeter({ ...INITIAL_NVR, deter: false })).toMatchObject({ mode: 'col' })
  })
})

describe('DORI calculator', () => {
  it.each([
    [1, 0, 12],
    [0, 0, 2],
    [2, 3, 40],
    [1, 2, 25],
    [0, 1, 7],
  ])('res %i, lens %i, %i m as the prototype', (res, lens, dist) => {
    const ref = reference({ res, lens, dist })
    const r = dori(res, lens, dist)
    expect(r.ppm).toBe(ref.dori.ppm)
    expect(r.width).toBe(ref.dori.w)
    expect(r.zones.map((z) => ({ n: z.name, st: `left:${z.left};width:${z.width}` }))).toEqual(
      ref.dori.zones,
    )
    expect(`left:${r.man.left};transform:scale(${r.man.scale})`).toBe(ref.dori.manSt)
    expect(ref.dori.lv.map((l, i) => (i <= r.level ? 'on' : ''))).toEqual(
      ref.dori.lv.map((l) => l.cls),
    )
    expect(monitoring.dori.levelTexts[r.level + 1]).toBe(ref.dori.txt)
  })
})

describe('recording calculator', () => {
  it.each([
    [8, 1, 1],
    [1, 0, 3],
    [32, 2, 0],
    [3, 0, 2],
    [22, 1, 0],
    [12, 2, 1],
  ])('%i cameras, bitrate %i, disk %i as the prototype', (n, br, tb) => {
    const ref = reference({ n, br, tb })
    const r = recording(n, br, tb)
    const t = monitoring.recording
    expect([r.big, r.unit, `width:${r.bar}`]).toEqual([ref.rec.big, ref.rec.unit, ref.rec.bar])
    expect(`${r.cameras} ok. ${r.dailyText} ${t.perDay} ${t.tails[r.tail]}`).toBe(ref.rec.txt)
  })
})

describe('installation versions', () => {
  it.each([0, 1, 2, 3].flatMap((sv) => SYSTEM_ELEMENT_KEYS.map((se) => [sv, se] as const)))(
    'version %i, element %s as the prototype',
    (sv, se) => {
      const ref = reference({ sv, se })
      const version = monitoring.system.versions[sv]!
      const keys = versionElements(version)
      const shown = shownElement(version, se)
      const el = monitoring.system.elements[shown]
      expect(keys.map((k) => monitoring.system.elements[k].name)).toEqual(
        ref.sy.list.map((l) => l.n),
      )
      expect([el.name, version.spec[shown] ?? '']).toEqual([ref.sy.info.n, ref.sy.info.spec])
      expect([String(keys.indexOf(shown) + 1), String(keys.length)]).toEqual([
        ref.sy.pos,
        ref.sy.cnt,
      ])
    },
  )

  it('steps through the set and wraps around', () => {
    const home = monitoring.system.versions[0]!
    expect(stepElement(home, 'cam', -1)).toBe('app')
    expect(stepElement(home, 'app', 1)).toBe('cam')
    expect(stepElement(home, 'ptz', 1)).toBe('hdd')
  })
})

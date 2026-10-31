import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { type NetMode, sieci, type VlanKey } from '../../dane/sieci'
import {
  cable,
  coverage,
  DEVICES,
  INITIAL_NET_AUTOPLAY,
  link,
  netAutoplayStep,
  portalCode,
  wall,
} from './sieciModel'

// The reference: the prototype's own class (`zrodlo/pages/Sieci.js`, v4.2), run with icon keys
// instead of paths and a `setState` that merges (for the autoplay).
const source = readFileSync(
  fileURLToPath(
    new URL('../../../../../docs/design/prokominstalacje/zrodlo/pages/Sieci.js', import.meta.url),
  ),
  'utf8',
)
type Ref = {
  wf: {
    tag: string
    note: string
    heat: { x: number; y: number; r: number }[]
    rooms: { n: string; q: string; qc: string }[]
    aps: { n: string }[]
    devs: { cls: string; ic: string }[]
  }
  pt: { code: string }
  lb: {
    db: string
    bars: string[]
    txt: string
    cat: string
    catS: string
    catCls: string
    lnk: string
    lnkS: string
    lnkIc: string
  }
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

function reference(state: Record<string, unknown>): Ref {
  const proto = new Prototype()
  proto.state = { ...proto.initState(), tick: 0, ...state }
  return proto.page(P, {})
}

describe('coverage map', () => {
  it.each(
    (['po', 'przed'] as NetMode[]).flatMap((wm) =>
      (['', 'g', 'k', 'b', 's'] as (VlanKey | '')[]).map((vl) => [wm, vl] as const),
    ),
  )('%s, network %j as the prototype', (wm, vl) => {
    const ref = reference({ wm, vl }).wf
    const v = coverage(wm, vl)
    expect([v.tag, v.note]).toEqual([ref.tag, ref.note])
    expect(v.sources.map((s) => ({ x: s.x, y: s.y, r: s.r }))).toEqual(ref.heat)
    expect(v.sources.map((s) => ({ n: s.label }))).toEqual(ref.aps.map((a) => ({ n: a.n })))
    expect(
      v.rooms.map((r) => ({
        n: r.name,
        q: sieci.coverage.quality[r.quality],
        qc: `wq q${r.quality}`,
      })),
    ).toEqual(ref.rooms.map((r) => ({ n: r.n, q: r.q, qc: r.qc })))
    expect(
      DEVICES.map(([k, ic]) => ({ cls: `wdv${vl ? (vl === k ? ' on' : ' dim') : ''}`, ic })),
    ).toEqual(ref.devs.map((d) => ({ cls: d.cls, ic: d.ic })))
  })

  it('autoplay: 24 steps as the prototype', () => {
    const proto = new Prototype()
    proto.state = { ...proto.initState(), tick: 0 }
    proto.mountPage()
    let s = INITIAL_NET_AUTOPLAY
    for (let k = 0; k < 24; k++) {
      proto.tick!()
      s = netAutoplayStep(s)
      expect([s.mode, s.vlan]).toEqual([proto.state.wm, proto.state.vl])
    }
  })

  it.each([0, 3, 4, 11, 12, 50])('portal code at tick %i as the prototype', (tick) => {
    expect(portalCode(tick)).toBe(reference({ tick }).pt.code)
  })
})

describe('„Sprawdź sam”', () => {
  it.each([0, 1].flatMap((wb) => [0, 1, 2, 3, 4, 5].map((ww) => [wb, ww] as const)))(
    'wall: band %i, wall %i as the prototype',
    (wb, ww) => {
      const ref = reference({ wb, ww }).lb
      const v = wall(wb, ww)
      expect([v.db, v.bars, v.text]).toEqual([ref.db, ref.bars, ref.txt])
    },
  )

  it.each([0, 1, 2].flatMap((cs) => [10, 55, 60, 100].map((cl) => [cl, cs] as const)))(
    'cable: %i m, speed %i as the prototype',
    (cl, cs) => {
      const ref = reference({ cl, cs }).lb
      const v = cable(cl, cs)
      expect([v.title, v.text, `labres ${v.ok ? 'ok' : 'warn'}`]).toEqual([
        ref.cat,
        ref.catS,
        ref.catCls,
      ])
    },
  )

  it.each(
    [0, 1, 2].flatMap((ld) => [0, 1].flatMap((lg) => [0, 1].map((ls) => [ld, lg, ls] as const))),
  )('link: distance %i, dig %i, see %i as the prototype', (ld, lg, ls) => {
    const ref = reference({ ld, lg, ls }).lb
    const v = link(ld, lg, ls)
    expect([v.title, v.text, v.icon]).toEqual([ref.lnk, ref.lnkS, ref.lnkIc])
  })
})

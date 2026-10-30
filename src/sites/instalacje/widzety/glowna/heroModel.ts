import {
  glowna,
  HERO_LAYERS,
  type HeroLayer,
  type HeroMode,
  type HeroObject,
} from '../../dane/glowna'
import { type Box, type Camera, OBJECTS, type Rect, type Screen } from './objects'

/**
 * The hero „Twój obiekt na żywo” as pure functions (ADR-I003 §2): a port of `page()` from
 * `zrodlo/pages/Main.js` (v4.2) — the isometric scene, the „Na żywo” panel and the autoplay.
 * The output is data (points, classes), React draws it. Kept 1:1 with the prototype, which
 * `heroModel.test.ts` checks against the prototype's own code.
 */

export type HeroState = {
  obj: HeroObject
  mode: HeroMode
  /** Layers in the order they were switched on (the planner link keeps that order). */
  layers: HeroLayer[]
  /** Below 1100 px: the scene is cropped to the building (`viewBox`). */
  narrow: boolean
  /** Global counter (+1 every 1300 ms): lit windows, the PTZ camera, the screens. */
  tick: number
}

export const INITIAL_HERO: Omit<HeroState, 'narrow' | 'tick'> = {
  obj: 'pens',
  mode: 'night',
  layers: ['kam', 'wifi'],
}

export type Polygon = { p: string; c: string }
export type Ring = { x: string; y: string; rx: string; ry: string; c: string }
export type Device = { x: string; y: string; icon: string; cls: string }
export type PanelLine = { layer: HeroLayer; name: string; text: string; icon: string; arm: boolean }

export type HeroScene = {
  viewBox: string
  name: string
  modeName: string
  aria: string
  gnd: Polygon[]
  zones: Polygon[]
  trees: { x: string; y: string; s: string }[]
  body: Polygon[]
  cones: Polygon[]
  rings: Ring[]
  arcs: { d: string; c: string }[]
  scr: Polygon[]
  dv: Device[]
  temps: { x: string; y: string; t: string }[]
  smoke: { x: string; y: string; c: string }[]
  walker: { x0: string; y0: string; x1: string; y1: string }
  /** The „Osoba 97%” box on the walker (cameras on). */
  det: boolean
  flakes: { x: string; y: string; r: string; t: string; d: string }[]
  lines: PanelLine[]
  more: number
  moreText: string
}

// Isometric projection of the prototype: grid unit, origin.
const U = 11
const CC = 0.866 * U
const SS = 0.5 * U
const OX = 880
const OY = 400

type P3 = [number, number, number]

const pr = (x: number, y: number, z: number): [number, number] => [
  (x - y) * CC + OX,
  (x + y) * SS - z * U + OY,
]
const pp = (points: P3[]) =>
  points
    .map(([x, y, z]) => {
      const [px, py] = pr(x, y, z)
      return `${px.toFixed(1)},${py.toFixed(1)}`
    })
    .join(' ')
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const quad = (r: Rect, z: number): P3[] => [
  [r[0], r[1], z],
  [r[0] + r[2], r[1], z],
  [r[0] + r[2], r[1] + r[3], z],
  [r[0], r[1] + r[3], z],
]

/** Builds the faces of one box (walls, windows, roof); `wi` counts windows across boxes. */
function makeBox(
  b: Box,
  bi: number,
  counter: { wi: number },
  lit: boolean,
  smartOn: boolean,
  tick: number,
): { dep: number; out: Polygon[] } {
  const { x, y, w, d, h } = b
  const z0 = b.z ?? 0
  const h1 = z0 + h
  const m = b.m ?? 'plas'
  const out: Polygon[] = []
  const W = (pts: P3[], c: string) => out.push({ p: pp(pts), c })
  W(
    [
      [x + w, y, z0],
      [x + w, y + d, z0],
      [x + w, y + d, h1],
      [x + w, y, h1],
    ],
    `fR ${m}`,
  )
  W(
    [
      [x, y + d, z0],
      [x + w, y + d, z0],
      [x + w, y + d, h1],
      [x, y + d, h1],
    ],
    `fL ${m}`,
  )
  const wc = () => {
    counter.wi++
    const on =
      lit &&
      (counter.wi * 7 + bi * 3 + (smartOn ? Math.floor(tick / 2) : 0)) % 5 < (smartOn ? 3 : 2)
    return on ? 'win lit' : 'win'
  }
  const yf = y + d + 0.02
  const xf = x + w + 0.02
  if (b.win === 'res') {
    const fl = Math.max(1, Math.floor((h - 0.3) / 2.8))
    const n = Math.max(1, Math.floor(w / 2.7))
    const g = w / n
    const nm = Math.max(1, Math.floor(d / 2.8))
    const g2 = d / nm
    for (let f = 0; f < fl; f++) {
      const z = z0 + f * 2.8 + 0.9
      for (let i = 0; i < n; i++) {
        const xi = x + g * (i + 0.5) - 0.55
        if (f === 0 && i === Math.floor(n / 2) && b.door !== false)
          W(
            [
              [xi - 0.15, yf, z0],
              [xi + 1.25, yf, z0],
              [xi + 1.25, yf, z0 + 2.2],
              [xi - 0.15, yf, z0 + 2.2],
            ],
            'door',
          )
        else
          W(
            [
              [xi, yf, z],
              [xi + 1.1, yf, z],
              [xi + 1.1, yf, z + 1.35],
              [xi, yf, z + 1.35],
            ],
            wc(),
          )
      }
      for (let j = 0; j < nm; j++) {
        const yi = y + g2 * (j + 0.5) - 0.55
        W(
          [
            [xf, yi, z],
            [xf, yi + 1.1, z],
            [xf, yi + 1.1, z + 1.35],
            [xf, yi, z + 1.35],
          ],
          wc(),
        )
      }
      if (b.balk && f > 0) {
        const zb = z0 + f * 2.8
        W(
          [
            [x + 0.4, y + d, zb],
            [x + w - 0.4, y + d, zb],
            [x + w - 0.4, y + d + 0.8, zb],
            [x + 0.4, y + d + 0.8, zb],
          ],
          'balkT',
        )
        W(
          [
            [x + 0.4, y + d + 0.8, zb],
            [x + w - 0.4, y + d + 0.8, zb],
            [x + w - 0.4, y + d + 0.8, zb + 0.85],
            [x + 0.4, y + d + 0.8, zb + 0.85],
          ],
          'balk',
        )
      }
    }
  } else if (b.win === 'shop') {
    const pw = (w - 2) / 3
    const top = Math.min(h - 0.8, 3.4)
    for (let i = 0; i < 3; i++) {
      const xi = x + 1 + i * pw + 0.2
      W(
        [
          [xi, yf, 0.35],
          [xi + pw - 0.4, yf, 0.35],
          [xi + pw - 0.4, yf, top],
          [xi, yf, top],
        ],
        lit ? 'win big lit' : 'win big',
      )
    }
    W(
      [
        [xf, y + 2, 1],
        [xf, y + 3.3, 1],
        [xf, y + 3.3, 2.4],
        [xf, y + 2, 2.4],
      ],
      wc(),
    )
    W(
      [
        [xf, y + 5, 1],
        [xf, y + 6.3, 1],
        [xf, y + 6.3, 2.4],
        [xf, y + 5, 2.4],
      ],
      wc(),
    )
  } else if (b.win === 'hall') {
    const n = Math.floor(w / 3.2)
    const sw = (w - 2) / n
    for (let i = 0; i < n; i++) {
      const xi = x + 1 + i * sw
      W(
        [
          [xi, yf, h - 2.3],
          [xi + sw - 0.5, yf, h - 2.3],
          [xi + sw - 0.5, yf, h - 1.3],
          [xi, yf, h - 1.3],
        ],
        wc(),
      )
    }
    for (const gx of [2, 8])
      W(
        [
          [x + gx, yf, 0],
          [x + gx + 4.5, yf, 0],
          [x + gx + 4.5, yf, 4.4],
          [x + gx, yf, 4.4],
        ],
        'gate',
      )
    const nm = Math.floor(d / 3.2)
    const sd = (d - 2) / nm
    for (let j = 0; j < nm; j++) {
      const yi = y + 1 + j * sd
      W(
        [
          [xf, yi, h - 2.3],
          [xf, yi + sd - 0.5, h - 2.3],
          [xf, yi + sd - 0.5, h - 1.3],
          [xf, yi, h - 1.3],
        ],
        wc(),
      )
    }
  } else if (b.win === 'gar') {
    const gh = Math.min(2.4, h - 0.5)
    W(
      [
        [x + 1, yf, 0],
        [x + w - 1, yf, 0],
        [x + w - 1, yf, gh],
        [x + 1, yf, gh],
      ],
      'gdoor',
    )
  }
  if (b.roof === 'gable') {
    const o = b.o || 1
    const R = b.R || 4
    const ym = y + d / 2
    W(
      [
        [x - o, y - o, h1],
        [x + w + o, y - o, h1],
        [x + w + o, ym, h1 + R],
        [x - o, ym, h1 + R],
      ],
      'rB',
    )
    W(
      [
        [x + w, y, h1],
        [x + w, y + d, h1],
        [x + w, ym, h1 + R],
      ],
      `fR ${m}`,
    )
    if (b.gw)
      W(
        [
          [xf, ym - 0.7, h1 + 0.6],
          [xf, ym + 0.7, h1 + 0.6],
          [xf, ym + 0.7, h1 + 2],
          [xf, ym - 0.7, h1 + 2],
        ],
        wc(),
      )
    W(
      [
        [x + w + o, y - o, h1],
        [x + w + o, ym, h1 + R],
        [x + w + o, ym, h1 + R - 0.45],
        [x + w + o, y - o, h1 - 0.45],
      ],
      'rE',
    )
    W(
      [
        [x - o, y + d + o, h1],
        [x + w + o, y + d + o, h1],
        [x + w + o, ym, h1 + R],
        [x - o, ym, h1 + R],
      ],
      'rF',
    )
    W(
      [
        [x - o, y + d + o, h1],
        [x + w + o, y + d + o, h1],
        [x + w + o, y + d + o, h1 - 0.45],
        [x - o, y + d + o, h1 - 0.45],
      ],
      'rE',
    )
    W(
      [
        [x + w + o, y + d + o, h1],
        [x + w + o, ym, h1 + R],
        [x + w + o, ym, h1 + R - 0.45],
        [x + w + o, y + d + o, h1 - 0.45],
      ],
      'rE2',
    )
  } else {
    W(
      [
        [x, y, h1],
        [x + w, y, h1],
        [x + w, y + d, h1],
        [x, y + d, h1],
      ],
      `top ${m}`,
    )
    if (w > 3 && d > 3)
      W(
        [
          [x + 0.45, y + 0.45, h1],
          [x + w - 0.45, y + 0.45, h1],
          [x + w - 0.45, y + d - 0.45, h1],
          [x + 0.45, y + d - 0.45, h1],
        ],
        `topIn ${m}`,
      )
  }
  return { dep: x + w / 2 + y + d / 2 + z0 * 0.05, out }
}

const xy = (p: { x: number; y: number; z: number }) => {
  const [x, y] = pr(p.x, p.y, p.z)
  return { x: x.toFixed(1), y: y.toFixed(1) }
}

function cone(k: Camera, tick: number, night: boolean): Polygon {
  let a = k.a
  if (k.ptz) a += 0.38 * Math.sin(tick * 0.8)
  const far: P3[] = []
  for (let i = -2; i <= 2; i++) {
    const aa = a + (k.s * i) / 2
    far.push([clamp(k.x + k.L * Math.cos(aa), 0, 36), clamp(k.y + k.L * Math.sin(aa), 0, 28), 0])
  }
  return { p: pp([[k.x, k.y, k.z], ...far]), c: night ? 'cone ir' : 'cone' }
}

function screen(s: Screen, tick: number): Polygon[] {
  const Q = (u0: number, u1: number, v0: number, v1: number): P3[] =>
    s.f === 'fr'
      ? [
          [s.x, s.y + u0, s.z + v0],
          [s.x, s.y + u1, s.z + v0],
          [s.x, s.y + u1, s.z + v1],
          [s.x, s.y + u0, s.z + v1],
        ]
      : [
          [s.x + u0, s.y, s.z + v0],
          [s.x + u1, s.y, s.z + v0],
          [s.x + u1, s.y, s.z + v1],
          [s.x + u0, s.y, s.z + v1],
        ]
  return [
    { p: pp(Q(0, s.w, 0, s.h)), c: 'scrn' },
    { p: pp(Q(0.12, s.w - 0.12, 0.12, s.h * 0.55)), c: `scrc s${tick % 3}` },
    { p: pp(Q(0.12, s.w * 0.6, s.h * 0.66, s.h - 0.12)), c: `scrc s${(tick + 1) % 3}` },
  ]
}

/** What one installation does in the object, at this time of day. */
function layerText(state: HeroState, layer: HeroLayer): string {
  const t = glowna.hero.objects[state.obj].layers
  if (layer === 'kam' && state.mode === 'night') return t.kamN
  if (layer === 'alarm' && state.mode === 'night') return t.alarmN
  if (layer === 'smart' && state.mode === 'winter') return t.smartW
  return t[layer]
}

export function moreText(count: number): string {
  const { one, few, many } = glowna.hero.more
  return count === 1 ? one : count < 5 ? few : many
}

/** The scene and the panel for one state. */
export function heroScene(state: HeroState): HeroScene {
  const cfg = OBJECTS[state.obj]
  const texts = glowna.hero.objects[state.obj]
  const has = (k: HeroLayer) => state.layers.includes(k)
  const night = state.mode === 'night'
  const winter = state.mode === 'winter'
  const lit = state.mode !== 'day'
  const smartOn = has('smart')

  const gnd: Polygon[] = [
    {
      p: pp([
        [0, 0, 0],
        [36, 0, 0],
        [36, 28, 0],
        [0, 28, 0],
      ]),
      c: 'gnd',
    },
    {
      p: pp([
        [0, 28, 0],
        [36, 28, 0],
        [36, 28, -1.4],
        [0, 28, -1.4],
      ]),
      c: 'gEL',
    },
    {
      p: pp([
        [36, 0, 0],
        [36, 28, 0],
        [36, 28, -1.4],
        [36, 0, -1.4],
      ]),
      c: 'gER',
    },
  ]
  for (const r of cfg.pav) gnd.push({ p: pp(quad(r, 0.01)), c: r[4] ?? 'pav' })
  for (const r of cfg.lines) gnd.push({ p: pp(quad(r, 0.02)), c: 'pline' })
  const zones = has('alarm')
    ? cfg.zones.map((r) => ({ p: pp(quad(r, 0.03)), c: night ? 'zone arm' : 'zone' }))
    : []

  const items: Box[] = [...cfg.boxes]
  for (const car of cfg.cars) {
    const ky = car.o === 'y'
    items.push(
      ky
        ? { x: car.x, y: car.y, w: 2, d: 4.2, h: 1.05, m: `car ${car.c}` }
        : { x: car.x, y: car.y, w: 4.2, d: 2, h: 1.05, m: `car ${car.c}` },
    )
    items.push(
      ky
        ? { x: car.x + 0.15, y: car.y + 1.1, z: 1.05, w: 1.7, d: 2.1, h: 0.75, m: 'cab' }
        : { x: car.x + 1, y: car.y + 0.15, z: 1.05, w: 2.1, d: 1.7, h: 0.75, m: 'cab' },
    )
  }
  for (const t of cfg.trucks ?? []) {
    items.push({ x: t.x, y: t.y, w: 8.5, d: 2.6, h: 3.1, m: 'car tr' })
    items.push({ x: t.x + 8.7, y: t.y, w: 2.6, d: 2.6, h: 2.5, m: 'car k2' })
  }
  for (const p of cfg.posts ?? [])
    items.push({ x: p.x, y: p.y, w: p.w || 0.6, d: p.d || 0.5, h: p.h || 1.7, m: 'post' })
  const counter = { wi: 0 }
  const body = items
    .map((b, i) => makeBox(b, i, counter, lit, smartOn, state.tick))
    .sort((a, b) => a.dep - b.dep)
    .flatMap((b) => b.out)

  const trees = cfg.trees.map(([x, y, s]) => {
    const [px, py] = pr(x, y, 0)
    return { x: px.toFixed(1), y: py.toFixed(1), s: String(s || 1) }
  })
  const cones = has('kam') ? cfg.cam.map((k) => cone(k, state.tick, night)) : []
  const rings: Ring[] = []
  if (has('wifi'))
    for (const a of cfg.ap) {
      const { x, y } = xy(a)
      const rx = (a.r * 1.2247 * U).toFixed(1)
      const ry = (a.r * 0.707 * U).toFixed(1)
      rings.push({ x, y, rx, ry, c: 'cov' })
      for (const rc of ['r1', 'r2', 'r3']) rings.push({ x, y, rx, ry, c: `ring ${rc}` })
    }
  const arcs: { d: string; c: string }[] = []
  if (has('snd'))
    for (const s of cfg.snd) {
      const [qx, qy] = pr(s.x, s.y, s.z)
      ;[9, 15, 21].forEach((r, i) =>
        arcs.push({
          d: `M${(qx + 7).toFixed(1)} ${(qy - r * 0.7).toFixed(1)} a ${r} ${r} 0 0 1 0 ${(r * 1.4).toFixed(1)}`,
          c: `arc a${i + 1}`,
        }),
      )
    }
  const scr = has('scr') ? cfg.scr.flatMap((s) => screen(s, state.tick)) : []

  const dv: Device[] = []
  const D = (
    k: HeroLayer,
    points: { x: number; y: number; z: number }[],
    icon: string,
    extra = '',
  ) => {
    if (!has(k)) return
    for (const p of points) dv.push({ ...xy(p), icon, cls: `dv${extra}` })
  }
  D('alarm', cfg.sir, 'bell', night ? ' arm' : '')
  D('kd', cfg.kd, 'lock')
  D('wifi', cfg.ap, 'wifi')
  D('smart', cfg.smart, 'home')
  D('ev', cfg.ev, 'bolt')
  D('snd', cfg.snd, 'spk')
  D('kam', cfg.cam, 'cam')

  const temps = smartOn && lit ? cfg.temps.map(([x, y, z, t]) => ({ ...xy({ x, y, z }), t })) : []
  const smoke: { x: string; y: string; c: string }[] = []
  if (lit)
    for (const b of cfg.boxes.filter((box) => box.m === 'chim')) {
      const [qx, qy] = pr(b.x + b.w / 2, b.y + b.d / 2, (b.z ?? 0) + b.h)
      for (const c of ['smk', 'smk sm2', 'smk sm3'])
        smoke.push({ x: qx.toFixed(1), y: (qy - 3).toFixed(1), c })
    }

  const w0 = pr(cfg.wk[0][0], cfg.wk[0][1], 0)
  const w1 = pr(cfg.wk[1][0], cfg.wk[1][1], 0)
  const walker = {
    x0: w0[0].toFixed(0),
    y0: w0[1].toFixed(0),
    x1: w1[0].toFixed(0),
    y1: w1[1].toFixed(0),
  }

  const flakes: HeroScene['flakes'] = []
  if (winter)
    for (let i = 0; i < 90; i++)
      flakes.push({
        x: ((i * 61) % 1460).toFixed(0),
        y: (((i * 37) % 200) - 60).toFixed(0),
        r: (1 + (i % 3) * 0.7).toFixed(1),
        t: (7 + (i % 5) * 1.6).toFixed(1),
        d: (-(i % 11) * 0.9).toFixed(1),
      })

  // Newest first; the panel shows two, the rest as „+N … więcej”.
  const all = [...state.layers]
    .reverse()
    .filter((k) => HERO_LAYERS.includes(k))
    .map((k) => ({
      layer: k,
      name: glowna.hero.layers[k].label,
      text: layerText(state, k),
      icon: glowna.hero.layers[k].icon,
      arm: k === 'alarm' && night,
    }))
  const lines = all.slice(0, 2)
  const more = Math.max(0, all.length - 2)
  const modeName = glowna.hero.modes[state.mode].label
  const h = glowna.hero

  return {
    viewBox: state.narrow ? '600 200 650 600' : '0 0 1440 1000',
    name: texts.name,
    modeName,
    aria: `${h.scene}: ${texts.name}, ${modeName.toLowerCase()}. ${h.sceneOn}: ${lines.map((l) => l.name).join(', ') || h.sceneNothing}`,
    gnd,
    zones,
    trees,
    body,
    cones,
    rings,
    arcs,
    scr,
    dv,
    temps,
    smoke,
    walker,
    det: has('kam'),
    flakes,
    lines,
    more,
    moreText: moreText(more),
  }
}

/** Stars of the night sky (static: in the server-rendered backdrop). */
export function heroStars(): { x: string; y: string; r: string; d: string }[] {
  return Array.from({ length: 46 }, (_, i) => ({
    x: (((i * 131) % 1420) + 10).toFixed(0),
    y: (((i * 53) % 260) + 10).toFixed(0),
    r: (0.7 + (i % 3) * 0.5).toFixed(2),
    d: ((i % 7) * 0.4).toFixed(1),
  }))
}

// --- autoplay (`mountPage`): every 2300 ms until the first touch ---

const SEQ: HeroLayer[] = ['kam', 'wifi', 'alarm', 'smart', 'snd', 'scr', 'kd', 'ev']
const AUTO_OBJECTS: HeroObject[] = ['pens', 'dom', 'rest', 'hotel', 'sklep', 'firma']
const AUTO_MODES: HeroMode[] = ['night', 'winter', 'day']
export const AUTOPLAY_MS = 2300
export const TICK_MS = 1300

export type Autoplay = { hold: number; index: number }
export const AUTOPLAY_START: Autoplay = { hold: 0, index: 0 }

type Scene = Pick<HeroState, 'obj' | 'mode' | 'layers'>

/** One autoplay step: layers grow one by one, hold two steps, then the next object and time. */
export function autoplayStep(state: Scene, auto: Autoplay): { state: Scene; auto: Autoplay } {
  if (state.layers.length < SEQ.length)
    return { state: { ...state, layers: SEQ.slice(0, state.layers.length + 1) }, auto }
  if (auto.hold < 2) return { state, auto: { ...auto, hold: auto.hold + 1 } }
  const index = (auto.index + 1) % AUTO_OBJECTS.length
  return {
    state: { obj: AUTO_OBJECTS[index], mode: AUTO_MODES[index % 3], layers: SEQ.slice(0, 2) },
    auto: { hold: 0, index },
  }
}

/** The planner with this object and these installations (order as switched on). */
export function planHref({ obj, layers }: Pick<HeroState, 'obj' | 'layers'>): string {
  return `/zaplanuj#obiekt=${obj}${layers.length ? `&uslugi=${layers.join(',')}` : ''}`
}

/** Clock of the camera preview: a fixed night time, otherwise the real one. */
export function previewTime(state: Pick<HeroState, 'mode' | 'tick'>, now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return state.mode === 'night'
    ? `${glowna.hero.preview.nightClock}:${pad(state.tick % 60)}`
    : `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

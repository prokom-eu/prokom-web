import type { HeroObject } from '../../dane/glowna'

/**
 * Geometry of the six hero objects (`zrodlo/pages/Main.js` → `OBJ`, v4.2), in the units of the
 * isometric grid (36 × 28 plot, `U = 11` px). Copied, not redrawn (ADR-I003 §4).
 */

type Point3 = { x: number; y: number; z: number }

export type Box = {
  x: number
  y: number
  z?: number
  w: number
  d: number
  h: number
  /** Material: wall colour class (`wood`, `plas`, `met`, `gla`, `chim`, `car k1`…). */
  m?: string
  roof?: 'gable'
  /** Gable: ridge height and eaves overhang. */
  R?: number
  o?: number
  win?: 'res' | 'shop' | 'hall' | 'gar'
  /** Balconies on the upper floors; a window in the gable; no door in the front wall. */
  balk?: number
  gw?: number
  door?: boolean
}

/** A rectangle on the ground `[x, y, w, d]`, optionally with its class (`deck`). */
export type Rect = [number, number, number, number] | [number, number, number, number, string]

export type Camera = Point3 & {
  /** Direction, spread and length of the view cone; `ptz` sways with the tick. */
  a: number
  s: number
  L: number
  ptz?: number
}

export type Screen = Point3 & { w: number; h: number; f: 'fl' | 'fr' }

export type ObjectGeometry = {
  boxes: Box[]
  pav: Rect[]
  lines: Rect[]
  cars: { x: number; y: number; o: 'x' | 'y'; c: string }[]
  trucks?: { x: number; y: number }[]
  posts?: { x: number; y: number; w?: number; d?: number; h?: number }[]
  trees: [number, number, number][]
  cam: Camera[]
  sir: Point3[]
  ap: (Point3 & { r: number })[]
  zones: Rect[]
  snd: Point3[]
  scr: Screen[]
  kd: Point3[]
  smart: Point3[]
  ev: Point3[]
  /** Temperature tags `[x, y, z, text]` (smart home, not in daylight). */
  temps: [number, number, number, string][]
  /** Walker path: from, to. */
  wk: [[number, number], [number, number]]
}

export const OBJECTS: Record<HeroObject, ObjectGeometry> = {
  dom: {
    boxes: [
      {
        x: 9,
        y: 6,
        w: 12,
        d: 9,
        h: 5.9,
        roof: 'gable',
        R: 5.6,
        o: 1.3,
        m: 'wood',
        win: 'res',
        gw: 1,
      },
      { x: 22, y: 8, w: 6, d: 6.5, h: 3, m: 'plas', win: 'gar' },
      { x: 17, y: 9.9, z: 10.4, w: 0.9, d: 0.9, h: 2.2, m: 'chim' },
    ],
    pav: [
      [22, 14.5, 6, 13.5],
      [15.6, 15, 2.4, 13],
    ],
    lines: [],
    cars: [{ x: 23.8, y: 18.5, o: 'y', c: 'k1' }],
    posts: [{ x: 27.5, y: 15.1 }],
    trees: [
      [3, 3, 1.1],
      [32, 3, 1],
      [2.5, 13, 0.9],
      [33.5, 25, 1],
      [5, 25.5, 1.1],
    ],
    cam: [
      { x: 21.02, y: 14.6, z: 4.9, a: 0.85, s: 0.4, L: 11 },
      { x: 9.02, y: 15.02, z: 4.9, a: 1.95, s: 0.4, L: 10 },
      { x: 28.02, y: 14.5, z: 2.7, a: 1.5, s: 0.36, L: 12, ptz: 1 },
    ],
    sir: [{ x: 21.02, y: 7.5, z: 5.2 }],
    ap: [{ x: 15, y: 10.5, z: 3.2, r: 9.5 }],
    zones: [
      [7.5, 4.5, 15, 12],
      [21, 7, 8, 8.5],
    ],
    snd: [{ x: 11.5, y: 20.5, z: 0.9 }],
    scr: [{ x: 17.6, y: 15.03, z: 1.2, w: 1.3, h: 0.9, f: 'fl' }],
    kd: [{ x: 16.8, y: 27.6, z: 1.2 }],
    smart: [{ x: 21.03, y: 11.5, z: 3.6 }],
    ev: [{ x: 27.8, y: 15.4, z: 2.1 }],
    temps: [
      [12, 15.02, 2.4, '21°'],
      [21.02, 8.6, 4.2, '20°'],
    ],
    wk: [
      [16.8, 27],
      [16.8, 16.4],
    ],
  },
  pens: {
    boxes: [
      {
        x: 5,
        y: 5,
        w: 18,
        d: 10,
        h: 8.8,
        roof: 'gable',
        R: 6.2,
        o: 1.5,
        m: 'wood',
        win: 'res',
        balk: 1,
        gw: 1,
      },
      { x: 24.5, y: 6, w: 6.5, d: 7, h: 3.2, roof: 'gable', R: 2.2, o: 0.6, m: 'wood', win: 'gar' },
      { x: 18, y: 9.4, z: 13.9, w: 1, d: 1, h: 2.4, m: 'chim' },
    ],
    pav: [
      [20, 18, 15.5, 9.5],
      [14.4, 15, 2.4, 13],
    ],
    lines: [
      [23, 18, 0.14, 5.5],
      [26, 18, 0.14, 5.5],
      [29, 18, 0.14, 5.5],
      [32, 18, 0.14, 5.5],
    ],
    cars: [
      { x: 20.6, y: 19, o: 'y', c: 'k2' },
      { x: 23.6, y: 19, o: 'y', c: 'k3' },
      { x: 26.6, y: 19, o: 'y', c: 'k4' },
      { x: 32.6, y: 19, o: 'y', c: 'k1' },
    ],
    posts: [{ x: 27.4, y: 17.3 }],
    trees: [
      [2, 2, 1.1],
      [33, 2, 1],
      [1.6, 14, 0.95],
      [3, 25.5, 1.1],
      [34, 15.5, 0.9],
    ],
    cam: [
      { x: 23.02, y: 14.6, z: 7.8, a: 0.75, s: 0.42, L: 13 },
      { x: 31.02, y: 12.6, z: 2.8, a: 1.45, s: 0.38, L: 12, ptz: 1 },
      { x: 5.02, y: 15.02, z: 7.8, a: 1.95, s: 0.38, L: 10 },
      { x: 27.5, y: 13.03, z: 2.7, a: 1.65, s: 0.3, L: 7 },
    ],
    sir: [{ x: 31.03, y: 8, z: 3 }],
    ap: [
      { x: 10, y: 10, z: 6.2, r: 9 },
      { x: 18.5, y: 10, z: 3.2, r: 9 },
    ],
    zones: [
      [3.5, 3.5, 21, 13],
      [23.5, 5, 8.5, 9],
    ],
    snd: [{ x: 8, y: 19.5, z: 0.9 }],
    scr: [{ x: 10.3, y: 15.03, z: 1.2, w: 1.4, h: 0.95, f: 'fl' }],
    kd: [{ x: 16.6, y: 15.03, z: 1.3 }],
    smart: [{ x: 23.03, y: 9, z: 5.6 }],
    ev: [{ x: 27.7, y: 17.6, z: 2.1 }],
    temps: [
      [8, 15.02, 4.6, '21°'],
      [19, 15.02, 7.4, '16°'],
      [23.02, 6.6, 3.2, '19°'],
    ],
    wk: [
      [15.6, 27.2],
      [15.6, 16.4],
    ],
  },
  hotel: {
    boxes: [
      { x: 5, y: 3, w: 22, d: 10, h: 14, m: 'plas', win: 'res', door: false },
      { x: 5, y: 13.5, w: 12, d: 7, h: 4.2, m: 'gla', win: 'shop' },
      { x: 9, y: 5, z: 14, w: 4, d: 3, h: 1.4, m: 'met' },
    ],
    pav: [
      [20, 17, 15.5, 10.5],
      [17, 14, 3, 14],
    ],
    lines: [
      [23, 17, 0.14, 5.5],
      [26, 17, 0.14, 5.5],
      [29, 17, 0.14, 5.5],
      [32, 17, 0.14, 5.5],
    ],
    cars: [
      { x: 20.6, y: 18, o: 'y', c: 'k3' },
      { x: 23.6, y: 18, o: 'y', c: 'k4' },
      { x: 26.6, y: 18, o: 'y', c: 'k2' },
      { x: 29.6, y: 18, o: 'y', c: 'k1' },
    ],
    posts: [
      { x: 24.4, y: 16.4 },
      { x: 27.4, y: 16.4 },
    ],
    trees: [
      [1.5, 2, 1],
      [33.5, 2.5, 1.05],
      [1.5, 24, 1.1],
      [33.5, 13.5, 0.9],
    ],
    cam: [
      { x: 27.02, y: 12.6, z: 12.5, a: 0.7, s: 0.45, L: 15 },
      { x: 17.02, y: 20.2, z: 3.8, a: 1.3, s: 0.4, L: 9 },
      { x: 27.02, y: 3.4, z: 12.5, a: 0.2, s: 0.35, L: 9, ptz: 1 },
      { x: 5.02, y: 20.52, z: 3.8, a: 1.9, s: 0.35, L: 8 },
    ],
    sir: [{ x: 27.03, y: 8, z: 4 }],
    ap: [
      { x: 12, y: 8, z: 9.6, r: 8 },
      { x: 21, y: 8, z: 4, r: 8 },
      { x: 11, y: 17, z: 2.2, r: 7 },
    ],
    zones: [[3.5, 1.5, 25, 20.5]],
    snd: [{ x: 11, y: 20.55, z: 3.3 }],
    scr: [
      { x: 7.2, y: 20.53, z: 1.2, w: 2.4, h: 1.4, f: 'fl' },
      { x: 27.03, y: 5.6, z: 9.4, w: 2.2, h: 1.2, f: 'fr' },
    ],
    kd: [{ x: 17.03, y: 16.6, z: 1.3 }],
    smart: [{ x: 27.03, y: 9.6, z: 7.4 }],
    ev: [
      { x: 24.7, y: 16.7, z: 2.1 },
      { x: 27.7, y: 16.7, z: 2.1 },
    ],
    temps: [
      [10, 13.02, 10.6, '21°'],
      [22, 13.02, 7.8, '17°'],
    ],
    wk: [
      [18.5, 27.2],
      [18.5, 16],
    ],
  },
  rest: {
    boxes: [
      {
        x: 7,
        y: 5,
        w: 17,
        d: 11,
        h: 4.6,
        roof: 'gable',
        R: 6,
        o: 1.6,
        m: 'wood',
        win: 'res',
        gw: 1,
      },
      { x: 12, y: 9.8, z: 9.5, w: 1, d: 1, h: 2.4, m: 'chim' },
    ],
    pav: [
      [8, 17.5, 13, 5, 'deck'],
      [26, 8, 9.5, 18],
      [15.8, 16, 2.4, 12],
    ],
    lines: [
      [26, 12, 5.2, 0.14],
      [26, 15, 5.2, 0.14],
      [26, 18, 5.2, 0.14],
      [26, 21, 5.2, 0.14],
    ],
    cars: [
      { x: 26.6, y: 9, o: 'x', c: 'k4' },
      { x: 26.6, y: 15.5, o: 'x', c: 'k1' },
      { x: 26.6, y: 21.8, o: 'x', c: 'k3' },
    ],
    posts: [
      { x: 9.5, y: 18.8, w: 1, d: 1, h: 0.8 },
      { x: 13, y: 18.8, w: 1, d: 1, h: 0.8 },
      { x: 16.5, y: 18.8, w: 1, d: 1, h: 0.8 },
      { x: 9.5, y: 21, w: 1, d: 1, h: 0.8 },
      { x: 13, y: 21, w: 1, d: 1, h: 0.8 },
      { x: 18.6, y: 16.8, w: 1.4, d: 0.3, h: 2.1 },
      { x: 32.2, y: 24.3 },
    ],
    trees: [
      [2, 2, 1.1],
      [32, 2, 1],
      [2, 25, 1.1],
      [23.5, 26, 0.9],
    ],
    cam: [
      { x: 24.02, y: 15.6, z: 3.9, a: 0.6, s: 0.42, L: 12 },
      { x: 7.02, y: 16.02, z: 3.9, a: 1.85, s: 0.4, L: 9 },
      { x: 24.02, y: 5.4, z: 3.9, a: 0.1, s: 0.35, L: 10, ptz: 1 },
    ],
    sir: [{ x: 24.03, y: 13, z: 3.9 }],
    ap: [{ x: 15, y: 10, z: 2.4, r: 10 }],
    zones: [[5.5, 3.5, 20, 14]],
    snd: [
      { x: 11, y: 21, z: 1.6 },
      { x: 18, y: 21, z: 1.6 },
    ],
    scr: [{ x: 18.65, y: 17.13, z: 0.65, w: 1.3, h: 1.35, f: 'fl' }],
    kd: [{ x: 24.03, y: 8.5, z: 1.3 }],
    smart: [{ x: 24.03, y: 11, z: 2.8 }],
    ev: [{ x: 32.5, y: 24.6, z: 2.1 }],
    temps: [[10, 16.02, 2.4, '22°']],
    wk: [
      [17, 27.3],
      [17, 17.2],
    ],
  },
  sklep: {
    boxes: [{ x: 5, y: 4, w: 21, d: 11, h: 5.2, m: 'plas', win: 'shop' }],
    pav: [[4, 17, 31.5, 10.5]],
    lines: [
      [7, 17, 0.14, 5.5],
      [10, 17, 0.14, 5.5],
      [13, 17, 0.14, 5.5],
      [16, 17, 0.14, 5.5],
      [19, 17, 0.14, 5.5],
      [22, 17, 0.14, 5.5],
      [25, 17, 0.14, 5.5],
      [28, 17, 0.14, 5.5],
    ],
    cars: [
      { x: 7.5, y: 18, o: 'y', c: 'k1' },
      { x: 13.5, y: 18, o: 'y', c: 'k3' },
      { x: 16.5, y: 18, o: 'y', c: 'k2' },
      { x: 25.5, y: 18, o: 'y', c: 'k4' },
    ],
    posts: [
      { x: 29.8, y: 16.4 },
      { x: 27, y: 15.6, w: 0.9, d: 0.5, h: 2.4 },
    ],
    trees: [
      [2, 1.5, 1],
      [32, 1.5, 1.05],
      [33.5, 12, 0.9],
    ],
    cam: [
      { x: 26.02, y: 14.6, z: 4.6, a: 0.8, s: 0.45, L: 14 },
      { x: 5.02, y: 15.02, z: 4.6, a: 1.8, s: 0.4, L: 12 },
      { x: 26.02, y: 4.4, z: 4.6, a: 0.15, s: 0.35, L: 9, ptz: 1 },
    ],
    sir: [{ x: 26.03, y: 12, z: 4.6 }],
    ap: [{ x: 15, y: 9, z: 2.6, r: 10 }],
    zones: [[3.5, 2.5, 24, 14]],
    snd: [{ x: 11, y: 15.03, z: 4.3 }],
    scr: [
      { x: 27.05, y: 16.13, z: 0.6, w: 0.8, h: 1.6, f: 'fl' },
      { x: 8.2, y: 15.04, z: 1.2, w: 2.2, h: 1.3, f: 'fl' },
    ],
    kd: [{ x: 26.03, y: 7, z: 1.3 }],
    smart: [{ x: 26.03, y: 9.5, z: 3.2 }],
    ev: [{ x: 30.1, y: 16.7, z: 2.1 }],
    temps: [[14, 15.02, 3.9, '20°']],
    wk: [
      [11.5, 26.8],
      [11.5, 16],
    ],
  },
  firma: {
    boxes: [
      { x: 3, y: 2.5, w: 22, d: 13, h: 8, m: 'met', win: 'hall' },
      { x: 26, y: 5, w: 7.5, d: 8, h: 6.6, m: 'gla', win: 'res' },
    ],
    pav: [[3, 17, 31.5, 10.5]],
    lines: [],
    cars: [
      { x: 26.5, y: 18, o: 'y', c: 'k2' },
      { x: 29.5, y: 18, o: 'y', c: 'k3' },
    ],
    trucks: [{ x: 6, y: 19.5 }],
    posts: [{ x: 32.6, y: 16.5 }],
    trees: [
      [1, 25.5, 1.1],
      [35, 1.5, 1],
      [34.5, 14.5, 0.9],
    ],
    cam: [
      { x: 25.02, y: 15.1, z: 7.2, a: 0.75, s: 0.45, L: 14 },
      { x: 3.02, y: 15.52, z: 7.2, a: 1.9, s: 0.4, L: 11 },
      { x: 33.52, y: 12.6, z: 5.6, a: 1.3, s: 0.4, L: 12, ptz: 1 },
      { x: 25.02, y: 2.9, z: 7.2, a: 0.05, s: 0.35, L: 9 },
    ],
    sir: [{ x: 25.03, y: 9, z: 7.4 }],
    ap: [
      { x: 12, y: 8, z: 4, r: 11 },
      { x: 29.5, y: 9, z: 3.6, r: 6 },
    ],
    zones: [[1.5, 1, 33.5, 16]],
    snd: [{ x: 9, y: 15.53, z: 6 }],
    scr: [{ x: 16.6, y: 15.53, z: 4.8, w: 2.6, h: 1.5, f: 'fl' }],
    kd: [
      { x: 34.2, y: 27.5, z: 1.3 },
      { x: 28.6, y: 13.03, z: 1.3 },
    ],
    smart: [{ x: 33.53, y: 9, z: 4.6 }],
    ev: [{ x: 32.9, y: 16.8, z: 2.1 }],
    temps: [
      [12, 15.52, 3.2, '16°'],
      [30, 13.02, 4.2, '21°'],
    ],
    wk: [
      [21, 26.6],
      [30, 24.8],
    ],
  },
}

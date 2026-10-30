import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { HERO_LAYERS, HERO_MODES, HERO_OBJECTS, type HeroLayer } from '../../dane/glowna'
import {
  AUTOPLAY_START,
  autoplayStep,
  heroScene,
  heroStars,
  type HeroState,
  INITIAL_HERO,
  planHref,
  previewTime,
} from './heroModel'

// The reference: `page()` of the prototype itself (`zrodlo/pages/Main.js`, v4.2), cut before
// the other home sections and run with icon keys instead of paths. The port must give the same
// points and classes for every object, time of day, set of layers and tick.
const source = readFileSync(
  fileURLToPath(
    new URL('../../../../../docs/design/prokominstalacje/zrodlo/pages/Main.js', import.meta.url),
  ),
  'utf8',
)
const start = source.indexOf('  page(P, c) {')
const end = source.indexOf('    // services', start)
if (start < 0 || end < start)
  throw new Error('Main.js changed: `page(P, c)` or the „// services” marker not found')
type Ref = {
  sc: Record<string, unknown> & {
    lines: { n: string; t: string; ic: string; ic2: string }[]
    wk: { style: string }
    dv: { x: string; y: string; ic: string; cls: string }[]
  }
  pip: { time: string }
}
const Prototype = new Function(
  `return class { ${source.slice(start, end)} return { sc, pip }; } }`,
)() as new () => {
  state: unknown
  props: unknown
  setState: () => void
  page: (P: unknown, c: unknown) => Ref
}
const icons = new Proxy({}, { get: (_, key) => String(key) })

function reference(state: HeroState): Ref {
  const prototype = new Prototype()
  prototype.state = { ...state, nw: state.narrow }
  prototype.props = {}
  prototype.setState = () => {}
  return prototype.page(icons, {})
}

const SETS: HeroLayer[][] = [
  [],
  ['kam', 'wifi'],
  ['alarm', 'kam'],
  ['smart', 'snd', 'scr'],
  [...HERO_LAYERS],
  ['ev', 'kd', 'alarm', 'wifi', 'kam', 'smart', 'scr', 'snd'],
]

describe('hero scene = prototype', () => {
  const cases = HERO_OBJECTS.flatMap((obj) =>
    HERO_MODES.flatMap((mode) =>
      SETS.map((layers, i) => ({ obj, mode, layers, narrow: i % 2 === 1, tick: i * 7 })),
    ),
  )

  it.each(cases)('$obj · $mode · $layers · tick $tick', (state) => {
    const ours = heroScene(state)
    const { sc } = reference(state)
    for (const key of [
      'gnd',
      'zones',
      'trees',
      'body',
      'cones',
      'rings',
      'arcs',
      'temps',
      'smoke',
      'flakes',
    ])
      expect(ours[key as keyof typeof ours], key).toEqual(sc[key])
    expect(ours.scr).toEqual(sc.scr)
    expect(ours.dv).toEqual(sc.dv.map(({ ic, ...d }) => ({ ...d, icon: ic })))
    expect(ours.viewBox).toBe(sc.vb)
    expect(ours.name).toBe(sc.name)
    expect(ours.modeName).toBe(sc.modeName)
    expect(ours.aria).toBe(sc.aria)
    expect(ours.det).toBe(sc.det)
    expect(ours.more).toBe(sc.more)
    expect(ours.moreText).toBe(sc.moreTxt)
    expect(ours.lines.map((l) => [l.name, l.text, l.icon, l.arm ? 'arm' : ''])).toEqual(
      sc.lines.map((l) => [l.n, l.t, l.ic, l.ic2]),
    )
    const w = ours.walker
    expect(`--x0:${w.x0}px;--y0:${w.y0}px;--x1:${w.x1}px;--y1:${w.y1}px`).toBe(sc.wk.style)
  })

  it('has the stars of the prototype', () => {
    expect(heroStars()).toEqual(reference({ ...INITIAL_HERO, narrow: false, tick: 0 }).sc.stars)
  })

  it('shows the night clock of the prototype in the camera preview', () => {
    const state = { ...INITIAL_HERO, narrow: false, tick: 75 }
    expect(previewTime(state, new Date())).toBe(reference(state).pip.time)
    expect(previewTime({ mode: 'day', tick: 0 }, new Date(2026, 9, 30, 9, 5, 7))).toBe('09:05:07')
  })
})

describe('hero autoplay', () => {
  it('adds the layers one by one, holds two steps, then moves to the next object and time', () => {
    let scene = { ...INITIAL_HERO }
    let auto = AUTOPLAY_START
    const seen: string[] = []
    for (let i = 0; i < 9; i++) {
      ;({ state: scene, auto } = autoplayStep(scene, auto))
      seen.push(`${scene.obj}/${scene.mode}/${scene.layers.length}`)
    }
    expect(seen).toEqual([
      'pens/night/3',
      'pens/night/4',
      'pens/night/5',
      'pens/night/6',
      'pens/night/7',
      'pens/night/8',
      'pens/night/8',
      'pens/night/8',
      'dom/winter/2',
    ])
    expect(scene.layers).toEqual(['kam', 'wifi'])
  })

  it('cycles the six objects with night, winter, day', () => {
    const full = { ...INITIAL_HERO, layers: [...HERO_LAYERS] }
    const next = (index: number) => autoplayStep(full, { hold: 2, index }).state
    expect([0, 1, 2, 3, 4, 5].map((i) => `${next(i).obj}/${next(i).mode}`)).toEqual([
      'dom/winter',
      'rest/day',
      'hotel/night',
      'sklep/winter',
      'firma/day',
      'pens/night',
    ])
  })
})

describe('plan link', () => {
  it('passes the object and the installations in the order they were switched on', () => {
    expect(planHref(INITIAL_HERO)).toBe('/zaplanuj#obiekt=pens&uslugi=kam,wifi')
    expect(planHref({ obj: 'dom', layers: ['alarm', 'kam'] })).toBe(
      '/zaplanuj#obiekt=dom&uslugi=alarm,kam',
    )
    expect(planHref({ obj: 'hotel', layers: [] })).toBe('/zaplanuj#obiekt=hotel')
  })
})

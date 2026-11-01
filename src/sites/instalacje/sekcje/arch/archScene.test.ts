import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import type { ServiceKey } from '@/lib/instalacje/options'

import { przekroj } from '../../dane/przekroj'
import {
  ARCH_STEP_MS,
  type ArchSceneState,
  autoplayStart,
  autoplayStep,
  CALM_ARCH_SCENE,
  currentHotspot,
  hotspotClass,
  hotspotHidden,
  hotspotsHtml,
  hotspotSpec,
  INITIAL_ARCH_SCENE,
  pickHotspot,
  pickView,
  safeHue,
  sceneClass,
  showAllLayers,
  stepHotspot,
  toggleLayer,
  visibleHotspots,
} from './archScene'
import { ARCH_SCENE } from './scene'

// The reference: `arHotspots()`, `arScene()` and `arSpecs()` of the prototype's `common.js`, run
// with a `set` that merges into the state like the page does (`Architekci.js` → `page()`).
const common = readFileSync(
  fileURLToPath(
    new URL('../../../../../docs/design/prokominstalacje/zrodlo/common.js', import.meta.url),
  ),
  'utf8',
)
const methods = common.slice(common.indexOf('  arHotspots() {'), common.indexOf('  arSpecs() {'))
const specs = common.slice(common.indexOf('  arSpecs() {'))
const specsEnd = specs.indexOf('\n  }\n') + 4

type ProtoHotspot = {
  x: number
  y: number
  k: string
  e: string
  t: string
  v: string
  p: string
  s: string
}
type ProtoScene = {
  cls: string
  hs: { cls: string; go: () => void; t: string; n: number }[]
  layers: { n: string; cls: string; go: () => void }[]
  modes: { n: string; cls: string; go: () => void }[]
  lbl: string
  allL: () => void
  cur: { n: number; t: string; v: string; p: string; s: string; svc: string; etap: string }
  prev: () => void
  next: () => void
}
type Proto = {
  arHotspots(): ProtoHotspot[]
  arSpecs(): Record<string, string>
  arScene(c: unknown, o: unknown, set: (o: Record<string, unknown>) => void): ProtoScene
}
const Proto = new Function(
  `return class { ${methods}${specs.slice(0, specsEnd)} }`,
)() as new () => Proto
const proto = new Proto()
const P = new Proxy({}, { get: (_, key) => String(key) })
const HU = new Proxy({}, { get: (_, key) => `#${String(key)}` })

/** The prototype's state (`am`, `hs`, `aoff`) driven like the page's `set`. */
function reference() {
  const st = { m: 'kl', hs: 0, off: [] as string[] }
  const render = (): ProtoScene =>
    proto.arScene({ HU, P }, st, (o) => {
      if (o.m) st.m = o.m as string
      if (o.hs !== undefined) st.hs = o.hs as number
      if (o.off) st.off = o.off as string[]
    })
  return { st, render }
}

const ours = (s: ArchSceneState) => ({
  cls: sceneClass(s),
  hs: przekroj.hotspots.map((_, i) => hotspotClass(i, s)),
  cur: currentHotspot(s) + 1,
})
const theirs = (r: ProtoScene) => ({ cls: r.cls, hs: r.hs.map((h) => h.cls), cur: r.cur.n })

describe('ArchHouseScene — the same as the prototype', () => {
  it('has the prototype hotspots, specs, views and layers', () => {
    expect(
      przekroj.hotspots.map((h) => ({
        x: h.x,
        y: h.y,
        k: h.service,
        e: h.stage,
        t: h.title,
        v: h.sees,
        p: h.plan,
        s: h.spec,
      })),
    ).toEqual(proto.arHotspots())
    expect(przekroj.specs).toEqual(proto.arSpecs())
    const r = reference().render()
    expect(przekroj.views.map((v) => v.name)).toEqual(r.modes.map((m) => m.n))
    expect(przekroj.layers.map((l) => l.name)).toEqual(r.layers.map((l) => l.n))
    expect(przekroj.hotspots).toHaveLength(17)
  })

  it('views, hotspots, layers and previous/next follow the same steps', () => {
    const ref = reference()
    let s = INITIAL_ARCH_SCENE
    const check = () => expect(ours(s)).toEqual(theirs(ref.render()))
    check()
    // A hotspot in „Gotowy dom” jumps to „Wszystkie instalacje”.
    ref.render().hs[4]?.go()
    s = pickHotspot(s, 4)
    check()
    // Switch off the hotspot's layer: the card moves to the first visible hotspot.
    ref.render().layers[4]?.go() // smart
    s = toggleLayer(s, 'smart')
    check()
    for (const d of [1, 1, -1, -1, -1] as const) {
      ;(d === 1 ? ref.render().next : ref.render().prev)()
      s = stepHotspot(s, d)
      check()
    }
    ref.render().layers[0]?.go() // kam
    s = toggleLayer(s, 'kam')
    check()
    ref.render().modes[1]?.go() // ty
    s = pickView(s, 'ty')
    check()
    ref.render().next()
    s = stepHotspot(s, 1)
    check()
    ref.render().allL()
    s = showAllLayers(s)
    check()
    ref.render().modes[0]?.go() // kl
    s = pickView(s, 'kl')
    check()
    ref.render().prev()
    s = stepHotspot(s, -1)
    check()
  })

  it('shows the same card texts', () => {
    const ref = reference()
    for (const i of [0, 5, 11, 16]) {
      ref.render().hs[i]?.go()
      const cur = ref.render().cur
      const h = przekroj.hotspots[i]
      expect(h && { t: h.title, v: h.sees, p: h.plan, s: hotspotSpec(h) }).toEqual({
        t: cur.t,
        v: cur.v,
        p: cur.p,
        s: cur.s,
      })
      expect(h && przekroj.stagePrefix + h.stage).toBe(cur.etap)
      expect(przekroj.layers.find((l) => l.service === h?.service)?.name).toBe(cur.svc)
    }
  })
})

describe('ArchHouseScene — logic', () => {
  it('hides hotspots of switched-off layers and steps only over visible ones', () => {
    const off: ServiceKey[] = ['kam', 'snd']
    const vis = visibleHotspots(off)
    expect(vis.every((i) => !off.includes(przekroj.hotspots[i]?.service as ServiceKey))).toBe(true)
    let s: ArchSceneState = { ...INITIAL_ARCH_SCENE, view: 'in', off }
    for (let k = 0; k < vis.length + 2; k++) {
      s = stepHotspot(s, 1)
      expect(vis).toContain(s.hs)
    }
  })

  it('keeps the hotspot when the view changes (like the prototype)', () => {
    const s = pickView(pickHotspot(INITIAL_ARCH_SCENE, 7), 'ty')
    expect(s).toMatchObject({ view: 'ty', hs: 7 })
    expect(pickView(s, 'kl').hs).toBe(7)
  })

  it('all layers off: no crash, the card stays on the first hotspot', () => {
    let s = INITIAL_ARCH_SCENE
    for (const l of przekroj.layers) s = toggleLayer(s, l.service)
    expect(visibleHotspots(s.off)).toEqual([])
    expect(currentHotspot(s)).toBe(0)
    expect(stepHotspot(s, 1).hs).toBe(0)
  })

  it('autoplay: „Wszystkie instalacje”, then the next hotspot; stops for good on a touch', () => {
    let s = autoplayStart(INITIAL_ARCH_SCENE)
    expect(s.view).toBe('in')
    s = autoplayStep(autoplayStep(s))
    expect(s.hs).toBe(2)
    expect(autoplayStep({ ...s, hs: 16 }).hs).toBe(0)
    const touched = pickView(s, 'ty')
    expect(autoplayStep(touched)).toBe(touched)
    expect(autoplayStart({ ...INITIAL_ARCH_SCENE, touched: true }).view).toBe('kl')
    expect(autoplayStep(INITIAL_ARCH_SCENE)).toBe(INITIAL_ARCH_SCENE)
    expect(ARCH_STEP_MS).toBe(3400)
  })

  it('reduced motion starts on „Wszystkie instalacje”, hotspot 1, no autoplay', () => {
    expect(CALM_ARCH_SCENE).toMatchObject({ view: 'in', hs: 0, touched: true })
    expect(autoplayStep(CALM_ARCH_SCENE)).toBe(CALM_ARCH_SCENE)
  })

  it('takes hidden hotspots out of the Tab order (review I16a)', () => {
    // „Gotowy dom”: none of them is visible.
    expect(przekroj.hotspots.every((_, i) => hotspotHidden(i, INITIAL_ARCH_SCENE))).toBe(true)
    const s: ArchSceneState = { ...INITIAL_ARCH_SCENE, view: 'in', off: ['wifi'] }
    przekroj.hotspots.forEach((h, i) => expect(hotspotHidden(i, s)).toBe(h.service === 'wifi'))
    const html = hotspotsHtml({}, s)
    expect(html).toContain(
      'data-k="6" transform="translate(352 406)" style="--hc:var(--accent)" role="button" tabindex="-1" aria-hidden="true"',
    )
    expect(html).toContain(
      'data-k="0" transform="translate(194 250)" style="--hc:var(--accent)" role="button" tabindex="0" aria-label="1. Kamera pod okapem"',
    )
  })

  it('builds the hotspot markup with safe colours and escaped titles', () => {
    const html = hotspotsHtml({ kam: '#12B6D8', alarm: 'red;}' }, INITIAL_ARCH_SCENE)
    expect(html.match(/data-k="/g)).toHaveLength(17)
    expect(html).toContain('style="--hc:#12B6D8"')
    expect(html).not.toContain('red;}')
    expect(html).toContain('aria-label="1. Kamera pod okapem"')
    expect(html).toContain('class="arhs L-kam on"')
    expect(safeHue('var(--x)')).toBe('var(--accent)')
    expect(ARCH_SCENE.html).toContain('<g class="arhsg">%hotspots%</g>')
  })
})

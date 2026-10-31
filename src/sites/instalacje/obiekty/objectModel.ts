import {
  INSTITUTIONS,
  LAYERS,
  type LayerKey,
  objectPage,
  SERVICE_SCENE,
  type SceneHotspot,
} from '../dane/obiekty'
import type { ObjectKey, ServiceKey } from '../dane/types'

/*
 * Logic of the „Dla kogo” pages, ported 1:1 from `zrodlo/generator-obiektow/build_seg.py` (`JS`:
 * `page()`, `mountPage()`) as pure functions; `objectModel.test.ts` runs the original
 * `zrodlo/pages/Seg*.js` and compares.
 */

// ── Cross-section (`sg`) ─────────────────────────────────────────────────────────────────

export type SceneState = {
  /** Highlighted hotspot (0-based). */
  hs: number
  /** Layer filter, `''` = all. */
  ly: LayerKey
  /** Touched: the autoplay stops for good (`tch`). */
  touched: boolean
}

export const INITIAL_SCENE: SceneState = { hs: 0, ly: '', touched: false }
export const SCENE_MS = 3400
export const DAY_MS = 4600

const layerOf = (service: ServiceKey) => SERVICE_SCENE[service].layer

/** Layer buttons: „Wszystko” and the layers this object has a hotspot in. */
export const visibleLayers = (hotspots: readonly SceneHotspot[]) =>
  LAYERS.filter((l) => !l.key || hotspots.some((h) => layerOf(h.service) === l.key))

const dimmed = (h: SceneHotspot | undefined, ly: LayerKey) =>
  Boolean(ly && h && layerOf(h.service) !== ly)

/** Classes of hotspot `i` on the drawing (`hc.k<i>`). */
export const hotspotClass = (i: number, s: SceneState, hotspots: readonly SceneHotspot[]) =>
  'hs' + (i === s.hs ? ' on' : '') + (dimmed(hotspots[i], s.ly) ? ' dim' : '')

/** Classes of legend button `i` (`leg[i].cls`). */
export const legendClass = (i: number, s: SceneState, hotspots: readonly SceneHotspot[]) =>
  'sglgb' + (i === s.hs ? ' on' : '') + (dimmed(hotspots[i], s.ly) ? ' dim' : '')

export const pickHotspot = (s: SceneState, hs: number): SceneState => ({
  ...s,
  hs,
  touched: true,
})

/** Previous / next (`go(d)`): skips hotspots outside the chosen layer. */
export function stepHotspot(
  s: SceneState,
  d: 1 | -1,
  hotspots: readonly SceneHotspot[],
): SceneState {
  const n = hotspots.length
  let i = s.hs
  for (let k = 0; k < n; k++) {
    i = (i + d + n) % n
    const h = hotspots[i]
    if (!s.ly || (h && layerOf(h.service) === s.ly)) break
  }
  return { ...s, hs: i, touched: true }
}

/** A layer button: the filter and the first hotspot of that layer. */
export function pickLayer(
  s: SceneState,
  ly: LayerKey,
  hotspots: readonly SceneHotspot[],
): SceneState {
  const first = hotspots.findIndex((h) => !ly || layerOf(h.service) === ly)
  return { ly, touched: true, hs: first < 0 ? 0 : first }
}

/** Autoplay (`mountPage`, every 3.4 s until the first touch): the next hotspot, any layer. */
export const autoplayScene = (s: SceneState, n: number): SceneState => ({
  ...s,
  hs: (s.hs + 1) % n,
})

/** „3 z 11” under the info box. */
export const scenePosition = (s: SceneState, n: number) => `${s.hs + 1} z ${n}`

/** A colour safe to put in the markup: the panel's `#rrggbb`, else the line accent. */
export const safeColor = (color: string | null | undefined) =>
  color && /^#[0-9a-f]{6}$/i.test(color) ? color : 'var(--accent)'

/**
 * The scene markup with this state: hotspot classes (`%hs.N%`) and their service colours
 * (`%c.N%`). Our own constant (`sceny/*.ts`); a colour goes in only as `#rrggbb` or the accent
 * token (`safeColor` — the panel validates too, this does not rely on it).
 */
export function sceneHtml(
  html: string,
  s: SceneState,
  hotspots: readonly SceneHotspot[],
  colorOf: (service: ServiceKey) => string,
): string {
  return html
    .replace(/%hs\.(\d+)%/g, (_, i: string) => hotspotClass(Number(i), s, hotspots))
    .replace(/%c\.(\d+)%/g, (_, i: string) => {
      const h = hotspots[Number(i)]
      return safeColor(h ? colorOf(h.service) : null)
    })
}

// ── Day / year (`day`) ───────────────────────────────────────────────────────────────────

export const dayClass = (i: number, dy: number) =>
  'sgdb' + (i === dy ? ' on' : '') + (i < dy ? ' past' : '')

/** Width of the progress bar under the card, in per cent. */
export const dayProgress = (dy: number, length: number) => Math.round(((dy + 1) / length) * 100)

export const autoplayDay = (dy: number, length: number) => (dy + 1) % length

/** Hotspots of the services of one moment („Na przekroju: 1 4”), as indexes. */
export const dayHotspots = (
  services: readonly ServiceKey[],
  hotspots: readonly SceneHotspot[],
): number[] => hotspots.flatMap((h, i) => (services.includes(h.service) ? [i] : []))

/** „Pokaż punkt N na przekroju”: that hotspot, all layers. */
export const pickFromDay = (hs: number): SceneState => ({ hs, ly: '', touched: true })

// ── Checklist (`ck`) ─────────────────────────────────────────────────────────────────────

export function checklist(checked: readonly boolean[], total: number) {
  const n = checked.filter(Boolean).length
  return {
    n,
    ratio: total ? n / total : 0,
    done: total > 0 && n === total,
  }
}

export const prepareLead = (key: ObjectKey, lead: string | null | undefined) =>
  lead ||
  (INSTITUTIONS.includes(key) ? objectPage.prepare.leadInstitution : objectPage.prepare.lead)

/** Planner link of an object page (`Zaplanuj.dc.html#obiekt=<key>`, ADR-I002 §4). */
export const objectPlanHref = (key: ObjectKey) => `/zaplanuj#obiekt=${key}`

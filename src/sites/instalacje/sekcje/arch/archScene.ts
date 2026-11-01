import type { ServiceKey } from '@/lib/instalacje/options'

import { type ArchHotspot, type ArchView, przekroj } from '../../dane/przekroj'

/*
 * Logic of the house cross-section (`zrodlo/common.js` → `arScene()`, page autoplay from
 * `Architekci.js` → `mountPage()`), ported 1:1 as pure functions; `archScene.test.ts` runs the
 * original `arScene()` and compares.
 */

export type ArchSceneState = {
  view: ArchView
  /** Highlighted hotspot (0-based); may sit on a hidden layer — `currentHotspot` corrects it. */
  hs: number
  /** Layers switched off. */
  off: readonly ServiceKey[]
  /** Touched: the autoplay stops for good (`xrTouched`). */
  touched: boolean
}

export const INITIAL_ARCH_SCENE: ArchSceneState = { view: 'kl', hs: 0, off: [], touched: false }
/** Reduced motion (spec §4): straight to „Wszystkie instalacje”, hotspot 1, no autoplay. */
export const CALM_ARCH_SCENE: ArchSceneState = { view: 'in', hs: 0, off: [], touched: true }

/** Page autoplay: „Wszystkie instalacje” after 2.6 s, then the next hotspot every 3.4 s. */
export const ARCH_START_MS = 2600
export const ARCH_STEP_MS = 3400

const HOTSPOTS: readonly ArchHotspot[] = przekroj.hotspots

/** Indexes of the hotspots on visible layers (`vis`). */
export const visibleHotspots = (off: readonly ServiceKey[]) =>
  HOTSPOTS.flatMap((h, i) => (off.includes(h.service) ? [] : [i]))

/** The hotspot shown in the card: the highlighted one, or the first visible (`hs`). */
export function currentHotspot(s: ArchSceneState): number {
  const vis = visibleHotspots(s.off)
  return vis.includes(s.hs) ? s.hs : (vis[0] ?? 0)
}

/** A hotspot from the drawing jumps out of „Gotowy dom” to „Wszystkie instalacje”. */
const leaveFinished = (view: ArchView): ArchView => (view === 'kl' ? 'in' : view)

export const pickView = (s: ArchSceneState, view: ArchView): ArchSceneState => ({
  ...s,
  view,
  touched: true,
})

export const pickHotspot = (s: ArchSceneState, hs: number): ArchSceneState => ({
  ...s,
  view: leaveFinished(s.view),
  hs,
  touched: true,
})

/** Previous / next (`step(d)`): only over visible hotspots, round. */
export function stepHotspot(s: ArchSceneState, d: 1 | -1): ArchSceneState {
  const vis = visibleHotspots(s.off)
  if (!vis.length) return { ...s, view: leaveFinished(s.view), touched: true }
  const k = vis.indexOf(currentHotspot(s))
  const hs = vis[(k + d + vis.length) % vis.length] ?? 0
  return { ...s, view: leaveFinished(s.view), hs, touched: true }
}

/** A layer button switches its service off or back on. */
export function toggleLayer(s: ArchSceneState, service: ServiceKey): ArchSceneState {
  const off = s.off.includes(service) ? s.off.filter((k) => k !== service) : [...s.off, service]
  return { ...s, off, touched: true }
}

export const showAllLayers = (s: ArchSceneState): ArchSceneState => ({
  ...s,
  off: [],
  touched: true,
})

/** The first autoplay step (`_xrT`): „Wszystkie instalacje”, unless touched. */
export const autoplayStart = (s: ArchSceneState): ArchSceneState =>
  s.touched ? s : { ...s, view: 'in' }

/** A later autoplay step (`every(3400)`): the next hotspot, not in „Gotowy dom”. */
export const autoplayStep = (s: ArchSceneState): ArchSceneState =>
  s.touched || s.view === 'kl' ? s : { ...s, hs: (s.hs + 1) % HOTSPOTS.length }

/** Classes of the scene root (`cls`): the view and the switched-off layers. */
export const sceneClass = (s: ArchSceneState) =>
  'ars m-' + s.view + s.off.map((k) => ' off-' + k).join('')

/** Classes of hotspot `i` on the drawing. */
export const hotspotClass = (i: number, s: ArchSceneState) =>
  'arhs L-' + (HOTSPOTS[i]?.service ?? '') + (i === currentHotspot(s) ? ' on' : '')

/**
 * A hotspot the eye cannot see: all of them in „Gotowy dom” (`opacity: 0`), and those on a
 * switched-off layer. It leaves the Tab order and the accessibility tree (review I16a).
 */
export const hotspotHidden = (i: number, s: ArchSceneState) =>
  s.view === 'kl' || s.off.includes(HOTSPOTS[i]?.service as ServiceKey)

/** „Liczby do projektu” of a hotspot. */
export const hotspotSpec = (h: ArchHotspot) => przekroj.specs[h.spec] ?? przekroj.specFallback

/** A colour safe to put in an SVG `style` (`#rrggbb`), else the accent (like I10 `safeColor`). */
export const safeHue = (color: string | null | undefined) =>
  color && /^#[0-9a-f]{6}$/i.test(color) ? color : 'var(--accent)'

/**
 * Markup of the 17 hotspots (the prototype's `.arhsg` loop) for the drawing constant, built on
 * the server with the panel's service colours. Hotspot classes follow the state from an effect.
 */
export function hotspotsHtml(hues: Partial<Record<ServiceKey, string>>, s: ArchSceneState) {
  return HOTSPOTS.map(
    (h, i) =>
      `<g class="${hotspotClass(i, s)}" data-k="${i}" transform="translate(${h.x} ${h.y})" ` +
      `style="--hc:${safeHue(hues[h.service])}" role="button" ` +
      `tabindex="${hotspotHidden(i, s) ? -1 : 0}"${hotspotHidden(i, s) ? ' aria-hidden="true"' : ''} ` +
      `aria-label="${i + 1}. ${escapeAttr(h.title)}">` +
      '<circle r="17" class="arhsr"></circle><circle r="11.5" class="arhsc"></circle>' +
      `<text y="4" text-anchor="middle" class="arhst">${i + 1}</text></g>`,
  ).join('')
}

const escapeAttr = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

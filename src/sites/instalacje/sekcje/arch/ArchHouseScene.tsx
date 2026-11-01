'use client'

import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import type { ServiceKey } from '@/lib/instalacje/options'

import { type ArchView, przekroj as T } from '../../dane/przekroj'
import { InstIcon } from '../../InstIcon'
import { useInterval } from '../useInterval'
import {
  ARCH_START_MS,
  ARCH_STEP_MS,
  type ArchSceneState,
  autoplayStart,
  autoplayStep,
  CALM_ARCH_SCENE,
  currentHotspot,
  hotspotClass,
  hotspotSpec,
  INITIAL_ARCH_SCENE,
  pickHotspot,
  pickView,
  safeHue,
  sceneClass,
  showAllLayers,
  stepHotspot,
  toggleLayer,
} from './archScene'

type Props = {
  viewBox: string
  /** The drawing with the hotspots in the start state, built on the server (`hotspotsHtml`). */
  html: string
  /** Service colours from the panel, by key. */
  hues: Partial<Record<ServiceKey, string>>
  /** The home's `#architekci` (I16c): no layer bar. */
  compact?: boolean
}

const MOTION = '(prefers-reduced-motion: reduce)'
const reducedMotion = () => window.matchMedia(MOTION).matches
function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const hue = (color: string | null | undefined) => ({ '--hc': safeHue(color) }) as CSSProperties

/**
 * House cross-section (`zrodlo/inc/arscene.html`, `arScene()`): 3 views, 10 layers, 17 hotspots,
 * the hotspot card with previous/next. Autoplay like `Architekci.js`: „Wszystkie instalacje”
 * after 2.6 s, then the next hotspot every 3.4 s until the first touch, paused off screen and in a
 * hidden tab; with reduced motion straight to „Wszystkie instalacje”, hotspot 1, no autoplay.
 * The drawing is our constant set as markup once; hotspot classes follow the state from an
 * effect. Hotspots are buttons inside the drawing (`role="group"`, Enter/Space, spec §8).
 */
export function ArchHouseScene({ viewBox, html, hues, compact = false }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const art = useRef<SVGSVGElement>(null)
  const [state, setState] = useState<ArchSceneState>(INITIAL_ARCH_SCENE)
  const calm = useSyncExternalStore(subscribeMotion, reducedMotion, () => false)
  // Reduced motion: the calm start until the first touch, then the visitor's own state.
  const scene = calm && !state.touched ? CALM_ARCH_SCENE : state
  const setScene = (next: (s: ArchSceneState) => ArchSceneState) =>
    setState((s) => next(calm && !s.touched ? CALM_ARCH_SCENE : s))
  const hs = currentHotspot(scene)
  useInterval(() => setScene(autoplayStart), ARCH_START_MS, {
    enabled: !scene.touched && scene.view === 'kl',
    target: ref,
  })
  useInterval(() => setScene(autoplayStep), ARCH_STEP_MS, {
    enabled: !scene.touched && scene.view !== 'kl',
    target: ref,
  })
  useEffect(() => {
    art.current?.querySelectorAll<SVGGElement>('[data-k]').forEach((g) => {
      g.setAttribute('class', hotspotClass(Number(g.dataset.k), scene))
    })
  }, [scene])

  const hotspotOf = (target: EventTarget) => {
    const k = Number((target as Element).closest('[data-k]')?.getAttribute('data-k'))
    return Number.isInteger(k) && k >= 0 && k < T.hotspots.length ? k : null
  }
  const onClick = (event: MouseEvent<SVGSVGElement>) => {
    const k = hotspotOf(event.target)
    if (k !== null) setScene((s) => pickHotspot(s, k))
  }
  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const k = hotspotOf(event.target)
    if (k === null) return
    event.preventDefault()
    setScene((s) => pickHotspot(s, k))
  }
  // Arrow keys move between the view tabs (tablist pattern).
  const onModeKey = (event: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    event.preventDefault()
    const next = T.views[(i + d + T.views.length) % T.views.length]
    if (!next) return
    setScene((s) => pickView(s, next.key))
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')
    tabs?.[(i + d + T.views.length) % T.views.length]?.focus()
  }

  const cur = T.hotspots[hs] ?? T.hotspots[0]
  const view = T.views.find((v) => v.key === scene.view)
  if (!cur) return null
  const layerName = T.layers.find((l) => l.service === cur.service)?.name

  return (
    <div ref={ref} className={sceneClass(scene) + (compact ? ' compact' : '')}>
      <div className="arcore">
        <div className="arsvgw">
          <div className="arbar">
            <div className="armodes" role="tablist" aria-label={T.viewsLabel}>
              {T.views.map((v, i) => {
                const on = v.key === scene.view
                return (
                  <button
                    key={v.key}
                    type="button"
                    role="tab"
                    className={on ? 'armode on' : 'armode'}
                    aria-selected={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setScene((s) => pickView(s, v.key as ArchView))}
                    onKeyDown={(e) => onModeKey(e, i)}
                  >
                    <InstIcon name={v.icon} size={15} />
                    {v.name}
                  </button>
                )
              })}
            </div>
            <span className="arlbl">
              <i />
              {view?.caption}
            </span>
          </div>
          <svg
            ref={art}
            viewBox={viewBox}
            className="arsvg"
            role="group"
            aria-label={T.label}
            onClick={onClick}
            onKeyDown={onKeyDown}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        {/* The prototype re-renders the card; the number and texts are keyed so they fade in
            again while previous/next keep the keyboard focus. */}
        <div className="arinfo" style={hue(hues[cur.service])}>
          <div className="arinfoh">
            <span className="arnum" key={`n${hs}`}>
              {hs + 1}
            </span>
            <div className="arinfot" key={`t${hs}`}>
              <b>{cur.title}</b>
              <span>
                <em className="arsvt2">{layerName}</em>
                <em className="arstg">{T.stagePrefix + cur.stage}</em>
              </span>
            </div>
            <span className="arinfon">
              <button
                type="button"
                className="arnav"
                aria-label={T.prev}
                onClick={() => setScene((s) => stepHotspot(s, -1))}
              >
                <InstIcon name="arrowL" size={16} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                className="arnav"
                aria-label={T.next}
                onClick={() => setScene((s) => stepHotspot(s, 1))}
              >
                <InstIcon name="arrow" size={16} strokeWidth={2.4} />
              </button>
            </span>
          </div>
          <div className="arinfog" key={`g${hs}`}>
            <div>
              <em>{T.sees}</em>
              <span>{cur.sees}</span>
            </div>
            <div>
              <em>{T.plan}</em>
              <span>{cur.plan}</span>
            </div>
            <div className="arspec">
              <em>{T.spec}</em>
              <span>{hotspotSpec(cur)}</span>
            </div>
          </div>
        </div>
      </div>
      {!compact && (
        <div className="arlayers" role="group" aria-label={T.layersLabel}>
          <span>{T.layersTitle}</span>
          {T.layers.map((l) => {
            const on = !scene.off.includes(l.service)
            return (
              <button
                key={l.service}
                type="button"
                className={on ? 'arsys sm on' : 'arsys sm'}
                style={hue(hues[l.service])}
                aria-pressed={on}
                onClick={() => setScene((s) => toggleLayer(s, l.service))}
              >
                <i />
                {l.name}
              </button>
            )
          })}
          <button type="button" className="arlall" onClick={() => setScene(showAllLayers)}>
            {T.allLayers}
          </button>
        </div>
      )}
      {/* Read out only after a touch: the autoplay does not talk (like I4–I10). */}
      <p className="vh" aria-live={scene.touched ? 'polite' : 'off'}>
        {scene.touched ? `${hs + 1}. ${cur.title}` : ''}
      </p>
    </div>
  )
}

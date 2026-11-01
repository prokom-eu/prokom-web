'use client'

import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useId,
  useState,
  useSyncExternalStore,
} from 'react'

import type { ServiceKey } from '@/lib/instalacje/options'
import { SlidingPill } from '@/components/motion/SlidingPill'

import { type ArchView, przekroj as T } from '../../dane/przekroj'
import { InstIcon } from '../../InstIcon'
import { onTabKey } from '../../widzety/architekci/tabs'
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
  hotspotHidden,
  hotspotSpec,
  INITIAL_ARCH_SCENE,
  pickHotspot,
  pickView,
  safeHue,
  sceneClass,
  showAllLayers,
  stepHotspot,
  TEASER_MS,
  teaserFrame,
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
  const modes = useRef<HTMLDivElement>(null)
  const artId = useId()
  const [state, setState] = useState<ArchSceneState>(INITIAL_ARCH_SCENE)
  const calm = useSyncExternalStore(subscribeMotion, reducedMotion, () => false)
  // Reduced motion: the calm start until the first touch, then the visitor's own state.
  const scene = calm && !state.touched ? CALM_ARCH_SCENE : state
  const setScene = (next: (s: ArchSceneState) => ArchSceneState) =>
    setState((s) => next(calm && !s.touched ? CALM_ARCH_SCENE : s))
  const hs = currentHotspot(scene)
  // The page: „Wszystkie instalacje” after 2.6 s, then hotspots. The home teaser: views and
  // hotspots in turn (`teaserFrame`).
  const [tick, setTick] = useState(0)
  useInterval(() => setScene(autoplayStart), ARCH_START_MS, {
    enabled: !compact && !scene.touched && scene.view === 'kl',
    target: ref,
  })
  useInterval(() => setScene(autoplayStep), ARCH_STEP_MS, {
    enabled: !compact && !scene.touched && scene.view !== 'kl',
    target: ref,
  })
  useInterval(
    () => {
      const k = tick + 1
      setTick(k)
      setScene((s) => ({ ...s, ...teaserFrame(k) }))
    },
    TEASER_MS,
    { enabled: compact && !scene.touched, target: ref },
  )
  useEffect(() => {
    art.current?.querySelectorAll<SVGGElement>('[data-k]').forEach((g) => {
      const k = Number(g.dataset.k)
      g.setAttribute('class', hotspotClass(k, scene))
      // Invisible hotspots leave the Tab order and the accessibility tree (review I16a).
      const hidden = hotspotHidden(k, scene)
      g.setAttribute('tabindex', hidden ? '-1' : '0')
      g.toggleAttribute('aria-hidden', hidden)
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
  const selectView = (i: number) => {
    const next = T.views[i]
    if (next) setScene((s) => pickView(s, next.key))
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
            <div ref={modes} className="armodes" role="tablist" aria-label={T.viewsLabel}>
              <SlidingPill
                container={modes}
                active={scene.view}
                className="inst-pill"
                radius={10}
              />
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
                    aria-controls={artId}
                    onClick={() => setScene((s) => pickView(s, v.key as ArchView))}
                    onKeyDown={(e) => onTabKey(e, i, T.views.length, selectView)}
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
            id={artId}
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
      {/* Text description of the drawing for screen readers (spec §8). */}
      {!compact && (
        <ol className="vh">
          {T.hotspots.map((h, i) => (
            <li key={h.title}>
              {`${i + 1}. ${h.title} — ${T.layers.find((l) => l.service === h.service)?.name}, ${T.stagePrefix}${h.stage}. ${T.sees}: ${h.sees}`}
            </li>
          ))}
        </ol>
      )}
      <p className="vh" aria-live="polite">
        {scene.touched ? `${hs + 1}. ${cur.title}` : ''}
      </p>
    </div>
  )
}

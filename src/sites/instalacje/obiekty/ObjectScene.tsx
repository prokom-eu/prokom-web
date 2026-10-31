'use client'

import Link from 'next/link'
import { type CSSProperties, type MouseEvent, useEffect, useRef } from 'react'

import { objectPage } from '../dane/obiekty'
import { InstIcon } from '../InstIcon'
import { useInterval } from '../sekcje/useInterval'
import {
  autoplayScene,
  hotspotClass,
  legendClass,
  pickHotspot,
  pickLayer,
  SCENE_MS,
  scenePosition,
  stepHotspot,
  visibleLayers,
} from './objectModel'
import { resetScene, setScene, useScene } from './sceneStore'
import type { ObjectHotspot } from './types'

type Props = {
  title: string | null | undefined
  viewBox: string
  /** The drawing with the first hotspot on, built on the server (`sceneHtml`). */
  html: string
  hotspots: readonly ObjectHotspot[]
}

const T = objectPage.scene
const hueOf = (color: string) => ({ '--c': color }) as CSSProperties

/**
 * Cross-section card of an object page (`build_seg.py` BODY, `.sgsc`): layer filter, the drawing
 * with numbered hotspots, the legend and the info box with previous/next. Walks through the
 * hotspots every 3.4 s until the first touch (paused off screen, in a hidden tab and with reduced
 * motion). The drawing is our constant set as markup once; its hotspot classes follow the state
 * from an effect. Its hotspots are for the mouse and touch; the legend buttons are the controls
 * for the keyboard and screen readers (no second Tab stop per hotspot, review I10).
 */
export function ObjectScene({ title, viewBox, html, hotspots }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const art = useRef<SVGSVGElement>(null)
  const scene = useScene()
  const n = hotspots.length

  useEffect(() => resetScene, [])
  useInterval(() => setScene((s) => autoplayScene(s, n)), SCENE_MS, {
    enabled: !scene.touched && n > 0,
    target: ref,
  })
  useEffect(() => {
    art.current?.querySelectorAll<SVGGElement>('[data-k]').forEach((g) => {
      g.setAttribute('class', hotspotClass(Number(g.dataset.k), scene, hotspots))
    })
  }, [scene, hotspots])

  // Hotspots on the drawing answer the mouse and touch; the legend is the keyboard control.
  const onClick = (event: MouseEvent<SVGSVGElement>) => {
    const k = Number((event.target as Element).closest('[data-k]')?.getAttribute('data-k'))
    if (Number.isInteger(k) && k >= 0 && k < n) setScene((s) => pickHotspot(s, k))
  }

  const cur = hotspots[scene.hs] ?? hotspots[0]
  if (!cur) return null

  return (
    <div ref={ref} className="card sgsc">
      <div className="sgtop">
        <span className="sgtt">
          <InstIcon name="layers" size={16} />
          {title}
        </span>
        <div className="sgly" role="group" aria-label={T.layersLabel}>
          {visibleLayers(hotspots).map((l) => {
            const on = scene.ly === l.key
            return (
              <button
                key={l.key || 'all'}
                type="button"
                className={on ? 'sglyb on' : 'sglyb'}
                aria-pressed={on}
                onClick={() => setScene((s) => pickLayer(s, l.key, hotspots))}
              >
                {l.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="sgart">
        <svg
          ref={art}
          className="sgsvg"
          viewBox={viewBox}
          role="img"
          aria-label={T.label}
          onClick={onClick}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <div className="sgleg" role="group" aria-label={T.legendLabel}>
        {hotspots.map((h, i) => (
          <button
            key={h.title}
            type="button"
            className={legendClass(i, scene, hotspots)}
            style={hueOf(h.color)}
            aria-pressed={i === scene.hs}
            onClick={() => setScene((s) => pickHotspot(s, i))}
          >
            <em>{i + 1}</em>
            <span>{h.title}</span>
          </button>
        ))}
      </div>
      {/* The prototype re-creates the whole box (`key="h<n>"`) so it fades in again; here only
          the number and the text are keyed, so previous/next keep the keyboard focus. */}
      <div className="sginfo" style={hueOf(cur.color)}>
        <span className="sgno" key={`n${scene.hs}`}>
          {scene.hs + 1}
        </span>
        <div className="sgit" key={`t${scene.hs}`}>
          <b>{cur.title}</b>
          {cur.description && <p>{cur.description}</p>}
          {cur.serviceHref && (
            <Link href={cur.serviceHref} className="sgchip">
              <i />
              {cur.serviceName} →
            </Link>
          )}
        </div>
        <div className="sgnav">
          <button
            type="button"
            className="iconb"
            aria-label={T.prev}
            onClick={() => setScene((s) => stepHotspot(s, -1, hotspots))}
          >
            <Chevron d="M15 6l-6 6 6 6" />
          </button>
          <span>{scenePosition(scene, n)}</span>
          <button
            type="button"
            className="iconb"
            aria-label={T.next}
            onClick={() => setScene((s) => stepHotspot(s, 1, hotspots))}
          >
            <Chevron d="M9 6l6 6-6 6" />
          </button>
        </div>
      </div>
      {/* Read out only after a touch: the autoplay does not talk (like I4–I9). */}
      <p className="vh" aria-live={scene.touched ? 'polite' : 'off'}>
        {scene.touched ? `${scene.hs + 1}. ${cur.title}` : ''}
      </p>
    </div>
  )
}

function Chevron({ d }: { d: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

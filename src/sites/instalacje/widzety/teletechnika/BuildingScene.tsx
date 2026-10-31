'use client'

import { type CSSProperties, type MouseEvent, useRef, useState } from 'react'

import { teletechnika } from '../../dane/teletechnika'
import { useInterval } from '../../sekcje/useInterval'
import { TT_SCENE } from './scena'
import {
  AUTOPLAY_MS,
  autoplayStep,
  type BuildingState,
  buildingNote,
  INITIAL_BUILDING,
  pickElement,
  pickStep,
  sceneClass,
  sceneHtml,
  toggleLayer,
} from './teletechnikaModel'

const B = teletechnika.building

/**
 * Building cross-section in the Teletechnika hero (`zrodlo/pages/Teletechnika.body.html`
 * #pheroA): four layers, six build stages and nine numbered elements. The scene is our constant
 * (`scena.ts`), rendered as markup; the numbers under it are the accessible controls, the
 * markers on the drawing answer clicks too. Walks through the stages every 3.2 s until the first
 * touch (paused off screen, in a hidden tab and with reduced motion).
 */
export function BuildingScene() {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<BuildingState>(INITIAL_BUILDING)
  const [touched, setTouched] = useState(false)
  const [n, setN] = useState(0)
  useInterval(
    () => {
      setState((s) => autoplayStep(s, n))
      setN((x) => x + 1)
    },
    AUTOPLAY_MS,
    { enabled: !touched, target: ref },
  )
  const touch = (next: (s: BuildingState) => BuildingState) => {
    setTouched(true)
    setState(next)
  }
  // Markers on the drawing (`data-k` 1–9): the same as the numbers below.
  const onScene = (event: MouseEvent<SVGSVGElement>) => {
    const marker = (event.target as Element).closest('[data-k]')
    const k = Number(marker?.getAttribute('data-k'))
    if (k >= 1 && k <= 9) touch((s) => pickElement(s, k - 1))
  }
  const note = buildingNote(state)

  return (
    <div ref={ref} className="ill ttw" role="region" aria-label={B.label}>
      <div className="illbar">
        <div className="pills" role="group" aria-label={B.layersLabel}>
          {B.layers.map((l) => {
            const on = state.layers.includes(l.key)
            return (
              <button
                key={l.key}
                type="button"
                className={on ? 'lpill on' : 'lpill'}
                style={{ '--vc': l.hue } as CSSProperties}
                aria-pressed={on}
                onClick={() => touch((s) => toggleLayer(s, l.key))}
              >
                <i />
                {l.label}
              </button>
            )
          })}
        </div>
        <span className="tthint">
          <span className="ttmk">1</span>
          {B.hint}
        </span>
      </div>
      <svg
        className={sceneClass(state)}
        viewBox={TT_SCENE.viewBox}
        aria-hidden="true"
        onClick={onScene}
        dangerouslySetInnerHTML={{ __html: sceneHtml(TT_SCENE.html, state.el) }}
      />
      <div className="xc-ttnums" role="group" aria-label={B.numbersLabel}>
        {B.elements.map((e, i) => (
          <button
            key={e.title}
            type="button"
            className={state.el === i ? 'xc-ttn on' : 'xc-ttn'}
            aria-pressed={state.el === i}
            aria-label={`${i + 1}. ${e.title}`}
            onClick={() => touch((s) => pickElement(s, i))}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="ttsteps">
        {B.steps.map((s, i) => (
          <button
            key={s.title}
            type="button"
            className={`tts${i === state.step ? ' on' : i < state.step ? ' done' : ''}`}
            aria-pressed={i === state.step}
            onClick={() => touch((st) => pickStep(st, i))}
          >
            <em>{String(i + 1).padStart(2, '0')}</em>
            <span>{s.title}</span>
          </button>
        ))}
      </div>
      <div className="ttnote" aria-live={touched ? 'polite' : 'off'}>
        <span className={note.element ? 'ttnk el' : 'ttnk'}>{note.key}</span>
        <div>
          <b>{note.title}</b>
          <span>{note.text}</span>
        </div>
      </div>
    </div>
  )
}

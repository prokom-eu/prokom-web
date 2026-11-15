'use client'

import { useRef, useState } from 'react'

import { anteny } from '../../dane/anteny'
import { InstIcon } from '../../InstIcon'
import { useInterval } from '../../sekcje/useInterval'
import {
  type AimState,
  type Autoplay,
  autoplayStep,
  azimuthStep,
  INITIAL_AIM,
  installerAim,
  type Mode,
  MODE_START,
  noteKey,
  scene,
  signal,
} from './antennaModel'

const T = anteny.aim
const RIDGE = 'M0 250 L80 205 L150 232 L230 176 L310 228 L400 200 L470 240 L640 214 V292 H0 Z'
const MODES: { mode: Mode; icon: string }[] = [
  { mode: 'sat', icon: 'dish' },
  { mode: 'dvb', icon: 'ant' },
]

/**
 * „Ustaw antenę sam” in the Anteny hero (`zrodlo/pages/Anteny.body.html`): mode tabs, the scene,
 * the meter and the controls. Plays by itself every 650 ms until the first touch (paused off
 * screen, in a hidden tab and with reduced motion — then it shows the initial state).
 */
export function AntennaAim() {
  const ref = useRef<HTMLDivElement>(null)
  const [aim, setAim] = useState<Autoplay>({ ...INITIAL_AIM, hold: 0 })
  const [touched, setTouched] = useState(false)
  useInterval(() => setAim(autoplayStep), 650, { enabled: !touched, target: ref })

  const touch = (next: (state: AimState) => AimState) => {
    setTouched(true)
    setAim((state) => ({ ...next(state), hold: 0 }))
  }
  const sat = aim.mode === 'sat'
  const sig = signal(aim)
  const sc = scene(aim)
  const step = azimuthStep(aim.mode)

  return (
    <div ref={ref} className="ill" role="region" aria-label={T.label}>
      <div className="illbar">
        <div className="seg" role="group" aria-label={T.modesLabel}>
          {MODES.map(({ mode, icon }) => (
            <button
              key={mode}
              type="button"
              className={aim.mode === mode ? 'on' : ''}
              aria-pressed={aim.mode === mode}
              onClick={() => touch(() => MODE_START[mode])}
            >
              <InstIcon name={icon} size={15} />
              {T.modes[mode]}
            </button>
          ))}
        </div>
        <span className="tag a">{sat ? T.target.sat : T.target.dvb}</span>
      </div>
      <svg className="ans" viewBox="0 0 640 330" aria-hidden="true">
        <defs>
          <linearGradient id="ansky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="ansky1" />
            <stop offset="1" className="ansky2" />
          </linearGradient>
          <linearGradient id="anWood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--inst-scene-wood-1)' }} />
            <stop offset="1" style={{ stopColor: 'var(--inst-scene-wood-2)' }} />
          </linearGradient>
          <linearGradient id="anRoof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--inst-scene-roof-1)' }} />
            <stop offset="1" style={{ stopColor: 'var(--inst-scene-roof-2)' }} />
          </linearGradient>
          <linearGradient id="anLit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--inst-scene-lit-1)' }} />
            <stop offset="1" style={{ stopColor: 'var(--inst-scene-lit-2)' }} />
          </linearGradient>
          <linearGradient id="anMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--inst-scene-metal-1)' }} />
            <stop offset=".6" style={{ stopColor: 'var(--inst-scene-metal-2)' }} />
            <stop offset="1" style={{ stopColor: 'var(--inst-scene-metal-3)' }} />
          </linearGradient>
          <linearGradient id="anAcc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--inst-scene-acc-1)' }} />
            <stop offset="1" style={{ stopColor: 'var(--inst-scene-acc-2)' }} />
          </linearGradient>
          <filter id="anSh" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow
              dx="0"
              dy="5"
              stdDeviation="5"
              floodOpacity=".35"
              style={{ floodColor: 'var(--inst-scene-drop)' }}
            />
          </filter>
        </defs>
        <rect width="640" height="330" fill="url(#ansky)" />
        <path d={RIDGE} className="anmt" />
        <path d="M150 250 L230 214 L300 236 Z M560 240 L600 222 L640 232 V250 Z" className="ansn" />
        <rect y="292" width="640" height="38" className="angd" />
        <path d="M330 292 V226 L430 176 L530 226 V292 Z" className="anwall" />
        <path d="M314 230 L430 168 L546 230 L538 236 L430 180 L322 236 Z" className="anroof" />
        <rect x="366" y="244" width="30" height="28" className="anwin" />
        <rect x="464" y="244" width="30" height="28" className="anwin" />
        <line x1={sc.ox} y1={sc.oy} x2={sc.target.x} y2={sc.target.y} className="antgt" />
        <line
          x1={sc.ox}
          y1={sc.oy}
          x2={sc.beam.x}
          y2={sc.beam.y}
          className={`anbeam${sig.beam === 'off' ? '' : ` ${sig.beam}`}`}
        />
        <rect x={sc.mast.x} y={sc.mast.y} width="5" height={sc.mast.h} className="anmast" />
        {sat ? (
          <>
            <g transform={sc.dish}>
              <path d="M-6 -22 A24 24 0 0 0 -6 22 Z" className="andish" />
              <path d="M-6 0 L22 0" className="anarm" />
              <circle cx="24" cy="0" r="4" className="anlnb" />
            </g>
            <g transform={sc.satellite}>
              <rect x="-10" y="-7" width="20" height="14" rx="2" className="ansat" />
              <rect x="-34" y="-5" width="20" height="10" className="anpan" />
              <rect x="14" y="-5" width="20" height="10" className="anpan" />
              <text x="0" y="-16" className="anlbl">
                {T.satellite}
              </text>
            </g>
          </>
        ) : (
          <>
            <g transform={sc.yagi}>
              <path
                d="M-26 0 H26 M-20 -10 V10 M-10 -12 V12 M0 -12 V12 M10 -11 V11 M20 -9 V9"
                className="anyagi"
              />
            </g>
            <g transform="translate(70 222)">
              <path d="M0 0 L-10 34 H10 Z M-6 16 H6" className="antow" />
              <circle cx="0" cy="-4" r="4" className="anlnb" />
              <text x="0" y="-14" className="anlbl">
                {T.transmitter}
              </text>
            </g>
          </>
        )}
        <g transform="translate(64 64)">
          <circle r="44" className="ancmp" />
          <text y="-31" className="ancd">
            N
          </text>
          <text y="40" className="ancd">
            S
          </text>
          <text x="-36" y="4" className="ancd">
            W
          </text>
          <text x="36" y="4" className="ancd">
            E
          </text>
          <line x1="0" y1="0" x2={sc.compassTarget.x} y2={sc.compassTarget.y} className="antgt" />
          <line x1="0" y1="0" x2={sc.needle.x} y2={sc.needle.y} className="anneedle" />
          <circle r="4" className="anlnb" />
        </g>
      </svg>
      <div className="anpanel">
        <div className={`anmeter${sig.lock ? ' lock' : ''}`}>
          <div className="anmh">
            <b>{T.meter}</b>
            <span className="anlock">{sig.lock ? T.lock : T.search}</span>
          </div>
          <div className="anrow">
            <span>{T.level}</span>
            <div className="evbar">
              <i style={{ width: `${sig.level}%` }} />
            </div>
            <b>{sig.level}%</b>
          </div>
          <div className="anrow">
            <span>{T.quality}</span>
            <div className="evbar">
              <i style={{ width: `${sig.quality}%` }} />
            </div>
            <b>{sig.quality}%</b>
          </div>
        </div>
        <div className="anctl">
          <div className="anc">
            <span>
              {T.azimuth} {aim.az}°
            </span>
            <div className="stepper">
              <button
                type="button"
                aria-label={T.azimuthLeft}
                onClick={() => touch((s) => ({ ...s, az: s.az - step }))}
              >
                −
              </button>
              <b>{aim.az}°</b>
              <button
                type="button"
                aria-label={T.azimuthRight}
                onClick={() => touch((s) => ({ ...s, az: s.az + step }))}
              >
                +
              </button>
            </div>
          </div>
          {sat ? (
            <div className="anc">
              <span>
                {T.elevation} {aim.el}°
              </span>
              <div className="stepper">
                <button
                  type="button"
                  aria-label={T.elevationDown}
                  onClick={() => touch((s) => ({ ...s, el: s.el - 1 }))}
                >
                  −
                </button>
                <b>{aim.el}°</b>
                <button
                  type="button"
                  aria-label={T.elevationUp}
                  onClick={() => touch((s) => ({ ...s, el: s.el + 1 }))}
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className={`mstb${aim.mast ? ' on' : ''}`}
              aria-pressed={aim.mast}
              onClick={() => touch((s) => ({ ...s, mast: !s.mast }))}
            >
              <i />
              {T.mast}
            </button>
          )}
          <button type="button" className="btn btn-p btn-s" onClick={() => touch(installerAim)}>
            {T.auto}
          </button>
        </div>
      </div>
      {/* Read aloud only after the visitor acts — autoplay changes it every 650 ms. */}
      <div className="nvrnote" aria-live={touched ? 'polite' : 'off'}>
        {T.notes[noteKey(aim, sig)]}
      </div>
    </div>
  )
}

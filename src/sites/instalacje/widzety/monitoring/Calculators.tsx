'use client'

import { useState } from 'react'

import { LEGAL_NOTE } from '../../dane/prawo'
import { monitoring } from '../../dane/monitoring'
import { InstIcon } from '../../InstIcon'
import { INST_ICONS } from '../../icons'
import {
  BITRATES,
  CAMERAS_MAX,
  CAMERAS_MIN,
  DISKS,
  DIST_MAX,
  DIST_MIN,
  dori,
  DORI_INITIAL,
  DORI_LEVELS,
  LENSES,
  recording,
  RECORDING_INITIAL,
  RESOLUTIONS,
} from './monitoringModel'

/** Segmented choice of the calculators (`.seg` with `aria-pressed`, as in the prototype). */
function Choice<T extends { label: string }>({
  items,
  value,
  onChange,
}: {
  items: readonly T[]
  value: number
  onChange: (index: number) => void
}) {
  return (
    <div className="seg">
      {items.map((item, i) => (
        <button
          key={item.label}
          type="button"
          className={value === i ? 'on' : ''}
          aria-pressed={value === i}
          onClick={() => onChange(i)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

const D = monitoring.dori

/** „Ile widać” (`#ile-widac`): pixels per metre at a distance and the DORI zones. */
export function DoriCalc() {
  const [res, setRes] = useState(DORI_INITIAL.res)
  const [lens, setLens] = useState(DORI_INITIAL.lens)
  const [dist, setDist] = useState(DORI_INITIAL.dist)
  const r = dori(res, lens, dist)
  return (
    <div className="split ri" style={{ alignItems: 'stretch' }}>
      <div className="card calc">
        <div className="cq">
          <span>{D.resolution}</span>
          <Choice items={RESOLUTIONS} value={res} onChange={setRes} />
        </div>
        <div className="cq">
          <span>{D.lens}</span>
          <Choice items={LENSES} value={lens} onChange={setLens} />
        </div>
        <div className="cq">
          <span>
            {D.distance} <b className="xb-nu">{dist} m</b>
          </span>
          <input
            className="rng"
            type="range"
            min={DIST_MIN}
            max={DIST_MAX}
            step="1"
            value={dist}
            onChange={(e) => setDist(Number(e.target.value) || DORI_INITIAL.dist)}
            aria-label={D.distanceLabel}
          />
        </div>
        <span className="src">{D.note}</span>
      </div>
      <div className="cres" data-surface="dark" aria-live="polite">
        <span className="eye cres-eye">{D.result}</span>
        <div className="big">
          {r.ppm}
          <small>{D.unit}</small>
        </div>
        <div className="dori" aria-hidden="true">
          {r.zones.map((z, i) => (
            <div key={i} className="z" style={{ left: z.left, width: z.width }}>
              {z.name}
            </div>
          ))}
          <svg
            className="cam0"
            width="34"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            style={{ stroke: 'var(--inst-plan-accent)' }}
          >
            <path d={INST_ICONS.cam} />
          </svg>
          <svg
            className="man"
            style={{ left: r.man.left, transform: `scale(${r.man.scale})` }}
            width="22"
            height="60"
            viewBox="0 0 22 60"
          >
            <g style={{ fill: 'var(--inst-deep-ink)' }}>
              <circle cx="11" cy="7" r="6" />
              <rect x="4" y="15" width="14" height="26" rx="6" />
              <rect x="5" y="40" width="5" height="20" />
              <rect x="12" y="40" width="5" height="20" />
            </g>
          </svg>
        </div>
        <div className="lvl">
          {DORI_LEVELS.map((l, i) => (
            <span key={l.label} className={i <= r.level ? 'on' : ''}>
              {l.label}
            </span>
          ))}
        </div>
        <p>{D.levelTexts[r.level + 1]}</p>
        <p style={{ fontSize: 13 }}>
          {D.width} {r.width} m. {D.thresholds}
        </p>
      </div>
    </div>
  )
}

const R = monitoring.recording

/** „Ile dni nagrań” (`#nagrania`): days of continuous recording on the recorder's disk. */
export function RecordingCalc() {
  const [n, setN] = useState(RECORDING_INITIAL.n)
  const [br, setBr] = useState(RECORDING_INITIAL.br)
  const [tb, setTb] = useState(RECORDING_INITIAL.tb)
  const r = recording(n, br, tb)
  return (
    <div className="split ri" style={{ alignItems: 'stretch' }}>
      <div className="card calc">
        <div className="cq">
          <span>{R.cameras}</span>
          <div className="stepper">
            <button
              type="button"
              onClick={() => setN((v) => Math.max(CAMERAS_MIN, v - 1))}
              aria-label={R.fewer}
            >
              −
            </button>
            <b>{n}</b>
            <button
              type="button"
              onClick={() => setN((v) => Math.min(CAMERAS_MAX, v + 1))}
              aria-label={R.more}
            >
              +
            </button>
          </div>
        </div>
        <div className="cq">
          <span>{R.bitrate}</span>
          <Choice items={BITRATES} value={br} onChange={setBr} />
        </div>
        <div className="cq">
          <span>{R.disk}</span>
          <Choice items={DISKS} value={tb} onChange={setTb} />
        </div>
        <span className="src">{R.formula}</span>
      </div>
      <div className="cres" data-surface="dark">
        <span className="eye cres-eye">{R.result}</span>
        <div className="big" aria-live="polite">
          {r.big}
          <small>{r.unit}</small>
        </div>
        <div className="evbar cres-bar">
          <i style={{ width: r.bar }} />
        </div>
        <p>
          {r.cameras} ok. {r.dailyText} {R.perDay} {R.tails[r.tail]}
        </p>
        <div className="note cres-note">
          <InstIcon name="shield" size={20} />
          <span>
            {R.law} {LEGAL_NOTE}
          </span>
        </div>
      </div>
    </div>
  )
}

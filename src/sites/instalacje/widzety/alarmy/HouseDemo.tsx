'use client'

import { useEffect, useRef, useState } from 'react'

import { type AlarmMode, type AlarmTest, alarmy } from '../../dane/alarmy'
import { InstIcon } from '../../InstIcon'
import { useInterval } from '../../sekcje/useInterval'
import {
  house,
  type HouseAutoplay,
  houseAutoplayStep,
  INITIAL_HOUSE,
  type Simulation,
  TICK_MS,
} from './alarmModel'

const T = alarmy.house
/** Steps of a test after which nothing changes any more (the prototype keeps ticking). */
const LAST_STEP = 3

/**
 * House cross-section in the Alarmy hero (`zrodlo/pages/Alarmy.body.html` #pheroA): arming
 * modes, three tests (terrace door, water, smoke) that unfold step by step every 1.3 s, sensors
 * and rooms lit by their state, the siren and the app panel. Plays four scenarios by itself until
 * the first touch (paused off screen, in a hidden tab and with reduced motion); a test the visitor
 * starts runs to its end in any case — its steps are content, not decoration.
 */
export function HouseDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const [tick, setTick] = useState(0)
  const [auto, setAuto] = useState<HouseAutoplay>(INITIAL_HOUSE)
  const [own, setOwn] = useState<{ mode: AlarmMode; sim: Simulation } | null>(null)

  useInterval(
    () => {
      setAuto((a) => houseAutoplayStep(a, tick))
      setTick((t) => t + 1)
    },
    TICK_MS,
    { enabled: own === null, target: ref },
  )
  const running = own?.sim != null && tick - own.sim.t0 < LAST_STEP
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setTick((t) => t + 1), TICK_MS)
    return () => window.clearInterval(timer)
  }, [running])

  const mode = own?.mode ?? auto.mode
  const sim = own ? own.sim : auto.sim
  const v = house(mode, sim, tick)
  const status = T.status[v.status]
  const statusIcon = v.alarm ? 'bell' : mode === 'off' ? 'lock' : 'shield'
  const statusCls = v.alarm ? 'alst al' : mode !== 'off' ? 'alst arm' : 'alst'

  const pickMode = (m: AlarmMode) => setOwn({ mode: m, sim: null })
  const runTest = (test: AlarmTest) => setOwn({ mode, sim: { test, t0: tick } })

  return (
    <div ref={ref} className="ill" role="region" aria-label={T.label}>
      <div className="illbar">
        <div className="seg" role="group" aria-label={T.modesLabel}>
          {T.modes.map((m) => (
            <button
              key={m.mode}
              type="button"
              className={mode === m.mode ? 'on' : ''}
              aria-pressed={mode === m.mode}
              onClick={() => pickMode(m.mode)}
            >
              <InstIcon name={m.icon} size={15} />
              {m.label}
            </button>
          ))}
        </div>
        <div className="altests">
          {T.tests.map((t) => (
            <button
              key={t.test}
              type="button"
              className="btn btn-g btn-s altest"
              onClick={() => runTest(t.test)}
            >
              <InstIcon name={t.icon} size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="alw">
        <svg className={`house ${mode}`} viewBox="50 30 580 350" aria-hidden="true">
          <defs>
            <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--hsky1)' }} />
              <stop offset="1" style={{ stopColor: 'var(--hsky2)' }} />
            </linearGradient>
          </defs>
          <rect width="640" height="400" fill="url(#hsky)" />
          <path
            d="M0 330 L90 270 L170 300 L260 240 L360 290 L450 250 L560 296 L640 270 V340 H0 Z"
            style={{ fill: 'var(--hmtn)' }}
          />
          <rect y="352" width="640" height="48" style={{ fill: 'var(--hgnd)' }} />
          <path d="M70 140 L280 40 L490 140 Z" className="hroof" />
          <rect x="96" y="140" width="368" height="212" className="hwall" />
          <rect x="464" y="232" width="140" height="120" className="hwall" />
          <path d="M454 232 H614 L604 214 H464 Z" className="hroof" />
          {v.rooms.map((r) => (
            <g key={r.key}>
              <rect className={r.cls} x={r.x} y={r.y} width={r.w} height={r.h} />
              <foreignObject x={r.x + 8} y={r.y + 17} width="300" height="24" className="fo fo-l">
                <div className="fot">{r.name}</div>
              </foreignObject>
            </g>
          ))}
          <path d="M96 246 H464" className="hfloor" />
          <rect x="250" y="276" width="44" height="76" className="hdoor" />
          <rect x="486" y="262" width="96" height="90" className="hgate" />
          <path d="M486 280 H582 M486 298 H582 M486 316 H582 M486 334 H582" className="hgl" />
          <rect x="120" y="170" width="56" height="44" className="hwin" />
          <rect x="380" y="170" width="56" height="44" className="hwin" />
          <rect x="120" y="280" width="70" height="52" className="hwin" />
          <rect x="360" y="280" width="74" height="72" className="hwin" />
          <rect x="297" y="286" width="9" height="14" rx="2" className="hkp" />
          {v.sensors.map((s) => (
            <g key={s.id} className={s.cls}>
              <circle cx={s.x} cy={s.y} r="16" className="sring" />
              <circle cx={s.x} cy={s.y} r="9.5" className="sdot" />
              <foreignObject x={s.x} y={s.y + 3.5} width="300" height="24" className="fo fo-c">
                <div className="fot stl2">{s.letter}</div>
              </foreignObject>
            </g>
          ))}
          <g className={v.siren ? 'sirg on' : 'sirg'}>
            <rect x="438" y="150" width="22" height="30" rx="5" className="sir" />
            <path d="M470 152 a14 14 0 0 1 0 26 M478 146 a22 22 0 0 1 0 38" className="sirw" />
          </g>
        </svg>
        <div className="alph glass" aria-live={own ? 'polite' : 'off'}>
          <div className={statusCls}>
            <span className="alapp">
              {T.app} · {v.clock}
            </span>
            <InstIcon name={statusIcon} size={22} />
            <div>
              <b>{status.title}</b>
              <span>{status.sub}</span>
            </div>
          </div>
          {v.messages.map((m) => (
            <div key={m.key} className={m.alarm ? 'amsg al' : 'amsg'}>
              <b>{T.messages[m.key].title}</b>
              <span>{T.messages[m.key].sub}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="nvrnote alnote" aria-live={own ? 'polite' : 'off'}>
        {v.note}
      </div>
    </div>
  )
}

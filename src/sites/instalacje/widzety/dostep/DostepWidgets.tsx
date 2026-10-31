'use client'

import { type CSSProperties, Fragment, useRef, useState } from 'react'

import { type AccessTab, dostep } from '../../dane/dostep'
import { InstIcon } from '../../InstIcon'
import { useInterval } from '../../sekcje/useInterval'
import {
  AUTOPLAY_MS,
  autoplayStep,
  barPosition,
  INITIAL_LOCK,
  type Key,
  KEYS,
  lockOpen,
  type LockState,
  lockView,
  pickTab,
  press,
} from './dostepModel'

const L = dostep.lock
const TABS = Object.keys(L.tabs) as AccessTab[]

const keyLabel = (k: Key) =>
  k === 'C' ? L.keysLabel.clear : k === 'OK' ? L.keysLabel.ok : `${L.keysLabel.digit} ${k}`

/**
 * Keypad lock with the week schedule in the Kontrola dostępu hero (`zrodlo/pages/Dostep.body.html`
 * #pheroA): three objects, the door, the keypad (guest code 2468, expired 1357), the schedule
 * and the log. Types a good and an expired code by itself every 0.8 s until the first touch
 * (paused off screen, in a hidden tab and with reduced motion).
 */
export function LockDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<LockState>(INITIAL_LOCK)
  const [touched, setTouched] = useState(false)
  const [step, setStep] = useState(0)
  useInterval(
    () => {
      setState((s) => autoplayStep(s, step))
      setStep((n) => n + 1)
    },
    AUTOPLAY_MS,
    { enabled: !touched, target: ref },
  )
  const touch = (next: (s: LockState) => LockState) => {
    setTouched(true)
    setState(next)
  }
  const t = L.tabs[state.tab]
  const v = lockView(state)

  return (
    <div ref={ref} className="ill" role="region" aria-label={L.label}>
      <div className="illbar">
        <div className="seg" role="group" aria-label={L.tabsLabel}>
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              className={state.tab === key ? 'on' : ''}
              aria-pressed={state.tab === key}
              onClick={() => touch((s) => pickTab(s, key))}
            >
              <InstIcon name={L.tabs[key].icon} size={15} />
              {L.tabs[key].name}
            </button>
          ))}
        </div>
        <span className="tag a">{t.badge}</span>
      </div>
      <div className="kdw">
        <div className="kdl">
          <svg className={`kdoor ${v.door}`.trim()} viewBox="0 0 220 300" aria-hidden="true">
            <rect x="10" y="10" width="200" height="290" rx="6" className="kfr" />
            <rect x="26" y="26" width="168" height="274" className="kin" />
            <g className="kleaf">
              <rect x="26" y="26" width="168" height="274" className="klf" />
              <rect x="44" y="46" width="132" height="96" rx="4" className="kpn" />
              <rect x="44" y="160" width="132" height="120" rx="4" className="kpn" />
              <rect x="146" y="128" width="34" height="74" rx="8" className="klock" />
              <circle cx="163" cy="148" r="6" className="kled" />
              <rect x="152" y="166" width="22" height="26" rx="3" className="kpad" />
            </g>
            <foreignObject x="26" y="12" width="168" height="14" className="fo">
              <div className="fot knum2">{t.door}</div>
            </foreignObject>
          </svg>
        </div>
        <div className="kdr">
          <div className="kpbox">
            <div className={`kdisp ${state.res}`.trim()} aria-live={touched ? 'polite' : 'off'}>
              <span>{v.display}</span>
              <small>{v.status}</small>
            </div>
            <div className="kkeys">
              {KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className="kkey"
                  onClick={() => touch((s) => press(s, k))}
                  aria-label={keyLabel(k)}
                >
                  {k}
                </button>
              ))}
            </div>
            <span className="mut kdhint">
              {L.hint} <b>{L.guestCode}</b>
            </span>
          </div>
        </div>
      </div>
      <div className="kcal">
        <div className="kcalh">
          <b>{t.calTitle}</b>
          <span className="mut">{t.calSub}</span>
        </div>
        <div className="kgrid">
          <div />
          {L.days.map((d) => (
            <span key={d} className="kday">
              {d}
            </span>
          ))}
          {t.rows.map((r) => (
            <Fragment key={r.name}>
              <span className="krn">{r.name}</span>
              <div className="krow">
                {r.bars.map((b, i) => (
                  <span
                    key={i}
                    className={b.state ? `kbar ${b.state}` : 'kbar'}
                    style={barPosition(b)}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
        <div className="klog">
          {v.log.map((l, i) => (
            <div key={`${l.when}${i}`} className={l.bad ? 'kl bad' : 'kl'}>
              <InstIcon name={l.icon} size={14} />
              <span>
                <b>{l.when}</b> {l.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** „Nie każda karta jest bezpieczna” (`#identyfikatory`): six identifiers, one card open. */
export function IdTypes() {
  const T = dostep.ids
  const [index, setIndex] = useState(0)
  const it = T.items[index] ?? T.items[0]!
  return (
    <div className="card idw ri">
      <div className="idtabs" role="group" aria-label={T.tabsLabel}>
        {T.items.map((x, i) => (
          <button
            key={x.name}
            type="button"
            className={index === i ? 'idtb on' : 'idtb'}
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
          >
            <span className="idti">
              <InstIcon name={x.icon} />
            </span>
            <b>{x.name}</b>
            <span>{x.sub}</span>
          </button>
        ))}
      </div>
      <div className="idd" key={index}>
        <div className="idvis" style={{ '--h': it.hue } as CSSProperties}>
          <div className="idcard">
            <span className="idchip" />
            <span className="idwave">
              <i />
              <i />
              <i />
            </span>
            <b>{it.name}</b>
          </div>
          <div className="idmeter">
            <span>{T.resistance}</span>
            <div className="idbar">
              <i style={{ width: `${it.level * 25}%` }} />
            </div>
            <b>{it.levelText}</b>
          </div>
        </div>
        <div className="idtx">
          <b className="h3">{it.name}</b>
          <p>{it.text}</p>
          <div className="idg">
            <div>
              <span>{T.fits}</span>
              <b>{it.fits}</b>
            </div>
            <div>
              <span>{T.careful}</span>
              <b>{it.careful}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** „Co się dzieje z drzwiami, gdy zabraknie prądu?” (`#zamki`): the power switch. */
export function LocksPower() {
  const T = dostep.locks
  const [power, setPower] = useState(true)
  return (
    <>
      <div className="lkbar">
        <span className="usl">{T.power}</span>
        <button
          type="button"
          className={power ? 'lkpw on' : 'lkpw'}
          onClick={() => setPower((p) => !p)}
        >
          <i />
          <b>{power ? T.on : T.off}</b>
        </button>
        <span className="mut lkhint" aria-live="polite">
          {power ? T.hintOn : T.hintOff}
        </span>
      </div>
      <div className="lkg">
        {T.items.map((l) => {
          const open = lockOpen(power, l.failOpen)
          return (
            <div key={l.name} className={`lki${open ? ' open' : ''}${power ? ' pw' : ''}`}>
              <svg viewBox="0 0 160 120" aria-hidden="true">
                <rect x="20" y="10" width="120" height="104" rx="4" className="lkfr" />
                <g className="lkdoor">
                  <rect x="28" y="16" width="104" height="98" className="lkleaf" />
                  <rect x="112" y="60" width="14" height="5" rx="2.5" className="lkhd" />
                </g>
                <rect
                  x={l.device.x}
                  y={l.device.y}
                  width={l.device.w}
                  height={l.device.h}
                  rx="2"
                  className="lkdev"
                />
                <circle cx={l.led.x} cy={l.led.y} r="4" className="lkled" />
              </svg>
              <b>{l.name}</b>
              <span className="lkst">{open ? T.open : T.closed}</span>
              <p>{l.text}</p>
              <em>
                {T.where} {l.where}
              </em>
            </div>
          )
        })}
      </div>
    </>
  )
}

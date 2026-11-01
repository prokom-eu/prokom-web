'use client'

import { useRef, useState, useSyncExternalStore } from 'react'

import { ekrany, type ScreenKey } from '../../dane/ekrany'
import { InstIcon } from '../../InstIcon'
import { useInterval } from '../../sekcje/useInterval'
import {
  AUTOPLAY_MS,
  autoplayStep,
  brightnessView,
  INITIAL_PITCH,
  INITIAL_SCREEN,
  INITIAL_SYNC,
  ledView,
  lowerPhone,
  resetPrices,
  SCREEN_KEYS,
  type ScreenState,
  screenView,
  type SyncState,
  syncLog,
  syncRows,
  togglePromo,
} from './ekranyModel'

const TV = ekrany.screens

/**
 * Screens in an object in the Ekrany hero (`zrodlo/pages/Multimedia.body.html` #pheroA):
 * reception, menu board, shop window and conference room, three slides each and the content
 * schedule. Slides go round every 2.8 s; until the first touch the places change too (paused off
 * screen, in a hidden tab and with reduced motion).
 */
export function ScreenPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<ScreenState>(INITIAL_SCREEN)
  const [touched, setTouched] = useState(false)
  const [n, setN] = useState(1)
  useInterval(
    () => {
      setState((s) => autoplayStep(s, n, touched))
      setN((x) => x + 1)
    },
    AUTOPLAY_MS,
    { enabled: true, target: ref },
  )
  const v = screenView(state, n)
  const sl = v.slide

  return (
    <div ref={ref} className="ill" role="region" aria-label={TV.label}>
      <div className="illbar">
        <div className="seg" role="group" aria-label={TV.tabsLabel}>
          {SCREEN_KEYS.map((k: ScreenKey) => (
            <button
              key={k}
              type="button"
              className={state.tab === k ? 'on' : ''}
              aria-pressed={state.tab === k}
              onClick={() => {
                setTouched(true)
                setState({ tab: k, slide: 0 })
              }}
            >
              <InstIcon name={TV.items[k].icon} size={15} />
              {TV.items[k].name}
            </button>
          ))}
        </div>
        <span className="tag">{v.format}</span>
      </div>
      <div className="tvstage">
        <div className={v.portrait ? 'tvf port' : 'tvf'}>
          <div className="tvsc" key={`${state.tab}${state.slide}`}>
            {sl.kind === 'rec' && (
              <div className="sl rec">
                <div className="slh">
                  <b>{sl.title}</b>
                  <span>{v.clock}</span>
                </div>
                <div className="slg">
                  {sl.items.map(([icon, value, name]) => (
                    <div key={name} className="sli">
                      <InstIcon name={icon} size={26} strokeWidth={1.8} />
                      <b>{value}</b>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
                <div className="slf">{sl.foot}</div>
              </div>
            )}
            {sl.kind === 'menu' && (
              <div className="sl menu">
                <div className="slh">
                  <b>{sl.title}</b>
                  <span>{sl.sub}</span>
                </div>
                <div className="mnl">
                  {sl.items.map(([name, price]) => (
                    <div key={name} className="mni">
                      <span>{name}</span>
                      <i />
                      <b>{price}</b>
                    </div>
                  ))}
                </div>
                <div className="slf">{sl.foot}</div>
              </div>
            )}
            {sl.kind === 'win' && (
              <div className="sl win">
                <span className="wbig">{sl.title}</span>
                <span className="wsub">{sl.sub}</span>
                <span className="wcta">{sl.foot}</span>
              </div>
            )}
            {sl.kind === 'conf' && (
              <div className="sl conf">
                <div className="slh">
                  <b>{sl.title}</b>
                  <span>{sl.sub}</span>
                </div>
                <div className="cfbars">
                  {sl.items.map(([name, height], i) => (
                    <div key={i} className="cfb">
                      <i style={{ height: `${height}%` }} />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
                <div className="slf">{sl.foot}</div>
              </div>
            )}
          </div>
          <div className="tvdots" aria-hidden="true">
            {v.dots.map((on, i) => (
              <i key={i} className={on ? 'on' : ''} />
            ))}
          </div>
        </div>
      </div>
      <div className="tvsched">
        <span className="mut" style={{ fontSize: 12.5, fontWeight: 800 }}>
          {TV.schedule}
        </span>
        <div className="tvtl">
          {v.schedule.map((p) => (
            <span
              key={p.name}
              className={p.on ? 'on' : ''}
              style={{ left: p.left, width: p.width }}
            >
              {p.name}
            </span>
          ))}
          <b style={{ left: v.now }} />
        </div>
      </div>
      <div className="nvrnote scr-note">{v.note}</div>
    </div>
  )
}

const SY = ekrany.sync

const noSubscribe = () => () => {}
const today = () => {
  const now = new Date()
  return `${now.getDate()}.${String(now.getMonth() + 1).padStart(2, '0')}`
}

const stamp = () => new Date().toTimeString().slice(0, 8)

/**
 * Demo „one price change, two screens” (`#dwa-ekrany`, the prototype: `#dwa-salony`): three buttons change the sample prices
 * on both screens at once. Sample prices of an illustration, not an offer (captioned „Demo”).
 */
export function TwoSalons() {
  const [state, setState] = useState<SyncState>(INITIAL_SYNC)
  const [time, setTime] = useState('')
  // The date of the screens only on the client (the server's day may differ): empty in the HTML.
  const date = useSyncExternalStore(noSubscribe, today, () => '')
  const go = (action: (s: SyncState) => SyncState) => {
    setTime(stamp())
    setState(action)
  }
  const rows = syncRows(state)
  const buttons = [
    { label: SY.lowerPhone, action: lowerPhone },
    { label: SY.promo, action: togglePromo },
    { label: SY.reset, action: resetPrices },
  ]

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span className="eye cres-eye">{SY.eyebrow}</span>
        <h2 className="h2" style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
          {SY.heading}
        </h2>
        <p className="lead">{SY.lead}</p>
        <div className="synbtn">
          {buttons.map((b) => (
            <button
              key={b.label}
              type="button"
              className="btn btn-s hbtn-g"
              onClick={() => go(b.action)}
            >
              {b.label}
            </button>
          ))}
        </div>
        <span className="scr-log" aria-live="polite">
          {syncLog(state, time)}
        </span>
      </div>
      <div className="syns" aria-hidden="true">
        {SY.salons.map((salon) => (
          <div key={salon} className="synsc">
            <div className={state.version ? 'synf fl' : 'synf'} key={state.version}>
              <div className="synh">
                <b>{salon}</b>
                <span>
                  {SY.pricesOfDay} · {date}
                </span>
              </div>
              {rows.map((r) => (
                <div key={r.name} className={r.cls}>
                  <span>{r.name}</span>
                  <i />
                  <b>{r.price}</b>
                </div>
              ))}
              <div className="synft">
                {SY.salon} {salon}
              </div>
            </div>
            <span className="synl">
              <i />
              {SY.synced}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

const JS = ekrany.brightness

/** Brightness for the place (`#jasnosc`): six places, the needed nits, a plain screen to compare. */
export function BrightnessPicker() {
  const [place, setPlace] = useState(3)
  const [regular, setRegular] = useState(false)
  const v = brightnessView(place, regular)
  return (
    <div className="card jsw ri">
      <div className="zpc" role="group" aria-label={JS.placesLabel}>
        {JS.places.map((p, i) => (
          <button
            key={p.name}
            type="button"
            className={place === i ? 'chip on' : 'chip'}
            aria-pressed={place === i}
            onClick={() => setPlace(i)}
          >
            <InstIcon name={p.icon} size={16} />
            {p.name}
          </button>
        ))}
      </div>
      <div className="jsg">
        <div className="jsvwrap">
          <div className={`jsvis ${v.scene}`} aria-hidden="true">
            <div className="jssun" />
            <div className="jsglass" />
            <div
              className="jsscr"
              style={{ opacity: v.screenOpacity, filter: `contrast(${v.screenContrast})` }}
            >
              <b>{JS.screen.title}</b>
              <span>{JS.screen.text}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-g btn-s"
            aria-pressed={regular}
            onClick={() => setRegular((r) => !r)}
          >
            {v.toggle}
          </button>
        </div>
        <div className="jsinfo" aria-live="polite">
          <span className="usl" style={{ width: 'auto' }}>
            {JS.needed}
          </span>
          <b className="jsn">{v.range}</b>
          <div className="jsbar" aria-hidden="true">
            <i style={{ width: v.bar }} />
            {v.marks.map((m) => (
              <em key={m.label} style={{ left: m.left }}>
                {m.label}
              </em>
            ))}
          </div>
          <div className="syspec">
            <span>{JS.classLabel}</span>
            <b>{v.cls}</b>
          </div>
          <p className="scr-txt">{v.text}</p>
        </div>
      </div>
      <p className="src" style={{ margin: '12px 0 0' }}>
        {JS.note}
      </p>
    </div>
  )
}

const LD = ekrany.led

/** LED pixel pitch (`#sciany-led`): how close you can stand. */
export function PixelPitch() {
  const [pitch, setPitch] = useState(INITIAL_PITCH)
  const v = ledView(pitch)
  return (
    <div className="card labc">
      <span className="svk">{LD.eyebrow}</span>
      <b className="h3">{LD.heading}</b>
      <p className="mut" style={{ margin: 0, fontSize: 15 }}>
        {LD.lead}
      </p>
      <div className="cq">
        <span>
          {LD.pitch}: {v.pitch} mm
        </span>
        <input
          className="rng"
          type="range"
          min="9"
          max="100"
          step="1"
          value={pitch}
          onChange={(e) => setPitch(Number(e.target.value) || INITIAL_PITCH)}
          aria-label={LD.pitch}
          aria-valuetext={`${v.pitch} mm`}
        />
      </div>
      <div className="ldr" aria-live="polite">
        <div>
          <span>{LD.closest}</span>
          <b>{v.min} m</b>
        </div>
        <div>
          <span>{LD.comfort}</span>
          <b>
            {LD.from} {v.comfort} m
          </b>
        </div>
      </div>
      <div className="ldvis" aria-hidden="true">
        <i className="ldme" />
        <i className="ldwall" />
        <span className="ldz1" style={{ width: v.closeWidth }} />
        <span className="ldz2" style={{ left: v.comfortLeft, width: v.comfortWidth }} />
      </div>
      <span className="src">{LD.note}</span>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

import { type ApartKey, naglosnienie, type VenueKey } from '../../dane/naglosnienie'
import { InstIcon } from '../../InstIcon'
import { useInterval } from '../../sekcje/useInterval'
import {
  autoplayStep,
  type CalcState,
  chainView,
  type ChurchState,
  churchView,
  INITIAL_CALC,
  INITIAL_CHURCH,
  INITIAL_MIXER,
  type MixerState,
  mixerHtml,
  mixerView,
  PRIORITY_MS,
  setLevel,
  speakerCount,
  TICK_MS,
  toggleMute,
  VENUE_KEYS,
} from './naglosnienieModel'
import { APART_ICONS, SND_MIXER } from './scena'

const MX = naglosnienie.mixer

/**
 * Zone mixer in the Nagłośnienie hero (`zrodlo/pages/Naglosnienie.body.html` #pheroA): a plan of
 * the venue with the speakers' coverage and a console with four faders, mutes, the source and the
 * announcement. Plays by itself (faders drift, an announcement, the next venue) until the first
 * touch, paused off screen, in a hidden tab and with reduced motion. The plan is our constant
 * (`scena.ts`) set as markup; the console is the accessible control.
 */
export function ZoneMixer() {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<MixerState>(INITIAL_MIXER)
  const [touched, setTouched] = useState(false)
  const [n, setN] = useState(1)
  // Each announcement (also a repeated one) ends four ticks after it started.
  const [announcedAt, setAnnouncedAt] = useState(0)
  useInterval(
    () => {
      const next = autoplayStep(state, n)
      if (next.pri && !state.pri) setAnnouncedAt(Date.now())
      setState(next)
      setN((x) => x + 1)
    },
    TICK_MS,
    { enabled: !touched, target: ref },
  )
  useEffect(() => {
    if (!announcedAt) return
    const id = window.setTimeout(() => setState((s) => ({ ...s, pri: false })), PRIORITY_MS)
    return () => window.clearTimeout(id)
  }, [announcedAt])
  const touch = (next: (s: MixerState) => MixerState) => {
    setTouched(true)
    setState(next)
  }
  const v = mixerView(state)

  return (
    <div ref={ref} className="ill mxw" role="region" aria-label={MX.label}>
      <div className="illbar">
        <div className="seg" role="group" aria-label={MX.venuesLabel}>
          {VENUE_KEYS.map((k: VenueKey) => (
            <button
              key={k}
              type="button"
              className={state.ven === k ? 'on' : ''}
              aria-pressed={state.ven === k}
              onClick={() => touch((s) => ({ ...s, ven: k }))}
            >
              <InstIcon name={MX.venues[k].icon} size={15} />
              {MX.venues[k].name}
            </button>
          ))}
        </div>
      </div>
      <svg
        className={v.svgClass}
        viewBox={SND_MIXER.viewBox}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: mixerHtml(SND_MIXER, state) }}
      />
      <div className="cons">
        <div className="cchs">
          {v.channels.map((c, i) => (
            <div key={c.name} className={c.muted ? 'cch mute' : 'cch'}>
              <div className="clcd">
                <span>{c.name}</span>
                <b>{c.db}</b>
              </div>
              <div className="cbody">
                <div className="cmet" aria-hidden="true">
                  {c.segments.map((g, k) => (
                    <i key={k} className={g} />
                  ))}
                </div>
                <div className="cfad">
                  <div className="ctk" aria-hidden="true">
                    {MX.ticks.map((t) => (
                      <i key={t}>{t}</i>
                    ))}
                  </div>
                  <input
                    className="crng"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={c.level}
                    onChange={(e) => touch((s) => setLevel(s, i, Number(e.target.value)))}
                    aria-label={`${MX.volumeLabel} ${c.name}`}
                  />
                </div>
              </div>
              <button
                type="button"
                className={c.muted ? 'cmu on' : 'cmu'}
                aria-pressed={c.muted}
                aria-label={`${MX.mute}: ${c.name}`}
                onClick={() => touch((s) => toggleMute(s, i))}
              >
                <i />
                {c.muted ? MX.muted : MX.mute}
              </button>
            </div>
          ))}
        </div>
        <div className="cmas">
          <span className="cml">{MX.source}</span>
          <div className="csrc" role="group" aria-label={MX.source}>
            {MX.sources.map((src, i) => (
              <button
                key={src.name}
                type="button"
                className={state.src === i ? 'csb on' : 'csb'}
                aria-pressed={state.src === i}
                onClick={() => touch((s) => ({ ...s, src: i }))}
              >
                <i />
                <InstIcon name={src.icon} size={15} />
                {src.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={state.pri ? 'cann on' : 'cann'}
            aria-pressed={state.pri}
            onClick={() => {
              touch((s) => ({ ...s, pri: true }))
              setAnnouncedAt(Date.now())
            }}
          >
            <span className="cgr" aria-hidden="true" />
            <b>{MX.announce}</b>
            <em>{MX.announceSub}</em>
          </button>
        </div>
      </div>
      {/* Read out only after a touch: the autoplay does not talk. */}
      <div className="mxnote" aria-live={touched ? 'polite' : 'off'}>
        {v.note}
      </div>
    </div>
  )
}

const AP = naglosnienie.apart
const APART_KEYS = Object.keys(AP.families) as ApartKey[]

/** APART families (`#apart`): twelve pictograms, the picked one described next to them. */
export function ApartFamilies() {
  const [key, setKey] = useState<ApartKey>('cm')
  const f = AP.families[key]
  return (
    <div className="apw ri">
      <div className="apg" role="group" aria-label={AP.head.eyebrow}>
        {APART_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            className={key === k ? 'apc on' : 'apc'}
            aria-pressed={key === k}
            onClick={() => setKey(k)}
          >
            <svg
              viewBox="0 0 100 80"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: APART_ICONS[k] }}
            />
            <b>{AP.families[k].name}</b>
            <span>{AP.families[k].series}</span>
          </button>
        ))}
      </div>
      {/* The live region stays; the keyed card inside re-mounts for its entry animation. */}
      <div className="apdw" aria-live="polite">
        <div key={key} className="card apd">
          <span className="svk">{f.group}</span>
          <b className="h3" style={{ fontSize: 26 }}>
            {f.name}
          </b>
          <p>{f.text}</p>
          <div className="apk">
            {f.specs.map(([k, v]) => (
              <div key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
          <div>
            <span className="usl" style={{ width: 'auto' }}>
              {AP.where}
            </span>
            <div className="tags" style={{ marginTop: 6 }}>
              {f.where.map((t) => (
                <span key={t} className="tag a">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="usl" style={{ width: 'auto' }}>
              {AP.models}
            </span>
            <div className="tags" style={{ marginTop: 6 }}>
              {f.models.map((t) => (
                <span key={t} className="tag mono">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CH = naglosnienie.chain

/** Signal chain of a zone system (`#jak-dziala`): 100 V or low impedance, the announcement. */
export function SignalChain() {
  const [line, setLine] = useState(0)
  const [ann, setAnn] = useState(false)
  const v = chainView(line, ann)
  return (
    <div className="card chw ri">
      <div className="illbar" style={{ padding: '0 0 12px' }}>
        <div className="seg" role="group" aria-label={CH.tabsLabel}>
          {CH.tabs.map((t, i) => (
            <button
              key={t}
              type="button"
              className={line === i ? 'on' : ''}
              aria-pressed={line === i}
              onClick={() => setLine(i)}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`btn btn-s ${ann ? 'btn-p' : 'btn-g'}`}
          aria-pressed={ann}
          onClick={() => setAnn((a) => !a)}
        >
          <InstIcon name="bell" size={15} />
          {ann ? CH.announceEnd : CH.announce}
        </button>
      </div>
      <div className="chg">
        <div className="chc">
          <span className="chh">{CH.columns[0]}</span>
          {v.sources.map((x) => (
            <div key={x.name} className={x.cls}>
              <InstIcon name={x.icon} size={16} />
              <span>{x.name}</span>
            </div>
          ))}
        </div>
        <div className="charr" />
        <div className="chc">
          <span className="chh">{CH.columns[1]}</span>
          <div className="chbox">
            <b>{v.mixer}</b>
            <span>{v.mixerSub}</span>
            <div className={ann ? 'chpri on' : 'chpri'}>{CH.priority}</div>
          </div>
          <div className="chbox s">
            <InstIcon name="sliders" size={16} />
            <span>{CH.panel}</span>
          </div>
        </div>
        <div className="charr" />
        <div className="chc">
          <span className="chh">{CH.columns[2]}</span>
          <div className="chbox">
            <b>{v.amp}</b>
            <span>{v.ampSub}</span>
          </div>
          <div className="chbox s">
            <InstIcon name="battery" size={16} />
            <span>{CH.backup}</span>
          </div>
        </div>
        <div className="charr" />
        <div className="chc">
          <span className="chh">{CH.columns[3]}</span>
          {v.zones.map((z) => (
            <div key={z.name} className="chz">
              <b>{z.name}</b>
              <div className="chsp">
                {z.speakers.map((p, k) => (
                  <i key={k} className={p} />
                ))}
              </div>
              <span>{z.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="note" style={{ margin: '14px 0 0' }}>
        <InstIcon name="doc" size={18} />
        <span>{v.note}</span>
      </div>
    </div>
  )
}

const KO = naglosnienie.church

/** Church intelligibility demo (`#kosciol`): volume, reverb and directional columns. */
export function ChurchDemo() {
  const [state, setState] = useState<ChurchState>(INITIAL_CHURCH)
  const v = churchView(state)
  return (
    <div className="card kow ri">
      <svg viewBox="0 0 420 220" aria-hidden="true" className="kosvg">
        <path d="M20 210 V90 L210 14 L400 90 V210" className="kon" />
        <path d="M40 200 H380" className="kof" />
        <g className="kopew">
          {[120, 180, 240, 300].map((x) => (
            <rect key={x} x={x} y="176" width="40" height="10" rx="2" />
          ))}
        </g>
        <rect x="36" y="80" width="12" height="54" rx="4" className="kocol" />
        <path d={v.beam} className="kobeam" />
        {v.reflections.map((r) => (
          <path key={r.d} d={r.d} className="koref" style={{ opacity: r.opacity }} />
        ))}
      </svg>
      <div className="kotxt" aria-live="polite">
        <span className="usl" style={{ width: 'auto' }}>
          {KO.hears}
        </span>
        <b style={{ filter: `blur(${v.blur}px)`, opacity: v.phraseOpacity }}>{KO.phrase}</b>
        <div className="kometer" aria-hidden="true">
          <i style={{ width: v.bar }} />
        </div>
        <span className="mut" style={{ fontSize: 13.5 }}>
          {v.text}
        </span>
      </div>
      <div className="cq">
        <span>
          {KO.volume}: {state.vol}%
        </span>
        <input
          className="rng"
          type="range"
          min="20"
          max="100"
          step="5"
          value={state.vol}
          onChange={(e) => setState((s) => ({ ...s, vol: Number(e.target.value) || 60 }))}
          aria-label={KO.volume}
        />
      </div>
      <div className="cq">
        <span>
          {KO.reverb}: {v.reverb}
        </span>
        <input
          className="rng"
          type="range"
          min="1"
          max="5"
          step="1"
          value={state.rev}
          onChange={(e) => setState((s) => ({ ...s, rev: Number(e.target.value) || 3 }))}
          aria-label={KO.reverb}
          aria-valuetext={v.reverb}
        />
      </div>
      <button
        type="button"
        className={state.cols ? 'chip on' : 'chip'}
        aria-pressed={state.cols}
        onClick={() => setState((s) => ({ ...s, cols: !s.cols }))}
      >
        <InstIcon name="spk" size={16} />
        {KO.columns}
      </button>
      <span className="src">{KO.note}</span>
    </div>
  )
}

const IG = naglosnienie.calc

/** Calculator „ile głośników” (`#ile-glosnikow`): area, ceiling height, music or speech. */
export function SpeakerCalc() {
  const [state, setState] = useState<CalcState>(INITIAL_CALC)
  const v = speakerCount(state)
  return (
    <div
      className="calc dark ri"
      data-surface="dark"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: 32,
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span className="eye cres-eye">{IG.eyebrow}</span>
        <h2 className="h2" style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}>
          {IG.heading}
        </h2>
        <div className="cq">
          <span>
            {IG.area}: {state.area} m²
          </span>
          <input
            className="rng"
            type="range"
            min="20"
            max="600"
            step="10"
            value={state.area}
            onChange={(e) => setState((s) => ({ ...s, area: Number(e.target.value) || 120 }))}
            aria-label={IG.areaLabel}
          />
        </div>
        <div className="cq">
          <span>
            {IG.height}: {v.heightText} m
          </span>
          <input
            className="rng"
            type="range"
            min="24"
            max="60"
            step="2"
            value={state.height}
            onChange={(e) => setState((s) => ({ ...s, height: Number(e.target.value) || 30 }))}
            aria-label={IG.heightLabel}
            aria-valuetext={`${v.heightText} m`}
          />
        </div>
        <div className="cq">
          <span>{IG.mode}</span>
          <div className="seg">
            {IG.modes.map((m, i) => (
              <button
                key={m}
                type="button"
                className={state.mode === i ? 'on' : ''}
                aria-pressed={state.mode === i}
                onClick={() => setState((s) => ({ ...s, mode: i }))}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="cres" aria-live="polite">
        <span className="eye cres-eye">{IG.result}</span>
        <b className="big">{v.result}</b>
        <span className="snd-unit">{v.unit}</span>
        <div className="igdots" aria-hidden="true">
          {v.dots.map((d, i) => (
            <i key={i} className={d} />
          ))}
        </div>
        <span className="snd-note">{v.note}</span>
      </div>
    </div>
  )
}

'use client'

import { type CSSProperties, type ReactNode, useRef, useState } from 'react'

import { monitoring } from '../../dane/monitoring'
import { InstIcon } from '../../InstIcon'
import { useInterval } from '../../sekcje/useInterval'
import {
  AUTOPLAY_MODES,
  AUTOPLAY_MS,
  INITIAL_NVR,
  nvrNoteKey,
  type NvrState,
  nvrTime,
  TICK_MS,
  timeline,
  toggleDeter,
} from './monitoringModel'

const T = monitoring.nvr
/** Fill / stroke from a token (colours only in tokens.css, ADR-007). */
const fill = (token: string): CSSProperties => ({ fill: `var(--${token})` })
const stroke = (token: string): CSSProperties => ({ stroke: `var(--${token})` })
const stop = (token: string): CSSProperties => ({ stopColor: `var(--${token})` })

/** Detection box with its label: „Człowiek 97%”, „Auto 94%”, or „Ruch” without detection. */
function Detection({
  ai,
  kind,
  box,
  label,
  labelWidth,
  dx = 3,
}: {
  ai: boolean
  kind: 'person' | 'car'
  box: { x: number; y: number; w: number; h: number }
  label: string | null
  labelWidth: number
  /** Label text offset from the box (the prototype uses 3, the parking car 4). */
  dx?: number
}) {
  const cls = ai ? (kind === 'car' ? ' car' : '') : ' fa'
  const text = ai ? label : T.scene.motion
  return (
    <>
      <rect className={`dbox${cls}`} x={box.x} y={box.y} width={box.w} height={box.h} rx="3" />
      {text && (
        <>
          <rect
            className={`dlbg${cls}`}
            x={box.x}
            y={box.y - 12}
            width={ai ? labelWidth : 34}
            height="13"
            rx="2"
          />
          <text className="dlab" x={box.x + dx} y={box.y - 2} style={fill('inst-band-button-ink')}>
            {text}
          </text>
        </>
      )}
    </>
  )
}

function Person({
  x,
  y,
  jacket,
  children,
  style,
}: {
  x: number
  y: number
  jacket: string
  children?: ReactNode
  style?: CSSProperties
}) {
  return (
    <g className="walkp" style={style}>
      <circle cx={x} cy={y} r="6" style={fill('il-skin')} />
      <rect x={x - 7} y={y + 7} width="14" height="26" rx="5" style={fill(jacket)} />
      <rect x={x - 6} y={y + 32} width="5" height="14" style={fill('il-legs')} />
      <rect x={x + 1} y={y + 32} width="5" height="14" style={fill('il-legs')} />
      {children}
    </g>
  )
}

/** The four camera scenes (`Monitoring.body.html` #pheroA), 1:1 with token colours. */
function Scene({ index, state }: { index: number; state: NvrState }) {
  const { ai, mask, deter, mode } = state
  const night = mode !== 'day'
  const cls = `cs ${mode}`
  if (index === 0)
    return (
      <svg className={cls} viewBox="0 0 320 180" aria-hidden="true">
        <rect className="sky" width="320" height="52" />
        <path
          d="M0 52 L40 30 L70 44 L110 18 L150 40 L190 22 L230 42 L270 26 L320 46 V52 Z"
          style={fill('il-ridge')}
          opacity=".7"
        />
        <path d="M96 26 L110 18 L122 26 L114 24 Z M180 28 L190 22 L200 28 Z" className="snow" />
        <rect className="pv" y="52" width="320" height="128" />
        <rect className="snow" y="52" width="320" height="7" opacity=".9" />
        <ellipse className="warm" cx="250" cy="70" rx="150" ry="110" fill="url(#mwarm)" />
        <defs>
          <radialGradient id="mwarm">
            <stop offset="0" style={stop('il-lit')} stopOpacity=".8" />
            <stop offset="1" style={stop('il-lit')} stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          className="ln"
          d="M40 180 L80 70 M110 180 L130 70 M180 180 L180 70 M250 180 L230 70 M320 170 L280 70"
        />
        <g>
          <rect className="car2" x="88" y="92" width="38" height="56" rx="9" />
          <rect x="93" y="104" width="28" height="16" rx="4" style={fill('il-car-glass')} />
        </g>
        <g>
          <rect className="car3" x="190" y="90" width="36" height="54" rx="9" />
          <rect x="195" y="101" width="26" height="15" rx="4" style={fill('il-car-glass')} />
        </g>
        <g className="carm">
          <rect className="car1" x="240" y="112" width="40" height="58" rx="9" />
          <rect x="245" y="124" width="30" height="16" rx="4" style={fill('il-car-glass')} />
          <Detection
            ai={ai}
            kind="car"
            box={{ x: 234, y: 106, w: 52, h: 70 }}
            label={T.scene.car}
            labelWidth={52}
            dx={4}
          />
        </g>
        <Person x={30} y={118} jacket="il-jacket">
          <Detection
            ai={ai}
            kind="person"
            box={{ x: 17, y: 108, w: 26, h: 60 }}
            label={T.scene.person1}
            labelWidth={62}
          />
        </Person>
      </svg>
    )
  if (index === 1)
    return (
      <svg className={cls} viewBox="0 0 320 180" aria-hidden="true">
        <rect className="wl" width="320" height="180" />
        <path d="M0 0 H320 V24 L160 8 L0 24 Z" className="wd" />
        <rect className="lw" x="22" y="40" width="48" height="56" rx="3" />
        <rect className="lw" x="250" y="40" width="48" height="56" rx="3" />
        <path
          d="M46 40 V96 M22 68 H70 M274 40 V96 M250 68 H298"
          style={stroke('il-night-wood')}
          strokeWidth="3"
        />
        <rect className="wd" x="125" y="44" width="70" height="106" rx="4" />
        <path d="M160 44 V150" style={stroke('il-door-line')} strokeWidth="2" />
        <circle cx="150" cy="100" r="3" style={fill('il-brass')} />
        <circle cx="170" cy="100" r="3" style={fill('il-brass')} />
        <rect x="98" y="58" width="12" height="16" rx="3" style={fill('il-brass')} />
        <ellipse className="warm" cx="104" cy="66" rx="90" ry="90" fill="url(#mwarm2)" />
        <defs>
          <radialGradient id="mwarm2">
            <stop offset="0" style={stop('il-lit')} stopOpacity=".9" />
            <stop offset="1" style={stop('il-lit')} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect className="pv" y="150" width="320" height="30" />
        <rect x="110" y="150" width="100" height="8" style={fill('il-step')} />
        <rect x="100" y="158" width="120" height="8" style={fill('il-step-2')} />
        <rect className="snow" y="166" width="96" height="14" />
        <rect className="snow" x="224" y="166" width="96" height="14" />
        <g className="walkp" style={{ animationDuration: '11s' }}>
          <circle cx="40" cy="112" r="7" style={fill('il-skin')} />
          <rect x="32" y="120" width="16" height="30" rx="6" style={fill('il-blue')} />
          <rect x="33" y="149" width="6" height="16" style={fill('il-legs')} />
          <rect x="41" y="149" width="6" height="16" style={fill('il-legs')} />
          <rect x="50" y="136" width="14" height="22" rx="3" style={fill('il-bag')} />
          <path d="M55 136 V128 H59 V136" style={stroke('il-bag')} strokeWidth="2" fill="none" />
          <Detection
            ai={ai}
            kind="person"
            box={{ x: 26, y: 100, w: 42, h: 68 }}
            label={T.scene.person2}
            labelWidth={62}
          />
        </g>
      </svg>
    )
  if (index === 2)
    return (
      <svg className={cls} viewBox="0 0 320 180" aria-hidden="true">
        <rect className="wd" width="320" height="180" />
        <path
          d="M0 30 H320 M0 60 H320 M0 90 H320 M0 120 H320"
          style={stroke('inst-mask')}
          strokeOpacity=".18"
          strokeWidth="2"
        />
        <rect className="pv" y="140" width="320" height="40" />
        <rect x="30" y="56" width="170" height="8" rx="2" style={fill('il-rail')} />
        <rect x="30" y="120" width="170" height="8" rx="2" style={fill('il-rail')} />
        <g strokeWidth="5" strokeLinecap="round">
          <path d="M46 40 V136" style={stroke('il-red')} />
          <path d="M56 40 V136" style={stroke('il-red')} />
          <path d="M80 36 V136" style={stroke('il-blue')} />
          <path d="M90 36 V136" style={stroke('il-blue')} />
          <path d="M114 42 V136" style={stroke('il-brass')} />
          <path d="M124 42 V136" style={stroke('il-brass')} />
          <path d="M148 38 V136" style={stroke('inst-scene-beam-ok')} />
          <path d="M158 38 V136" style={stroke('inst-scene-beam-ok')} />
          <path d="M182 44 V136" style={stroke('il-silver')} />
        </g>
        <rect x="226" y="34" width="70" height="106" rx="3" style={fill('inst-hue-ink')} />
        <rect x="232" y="40" width="58" height="100" style={fill('il-niche')} />
        <rect className="lw" x="236" y="46" width="50" height="34" opacity=".5" />
        {night && (
          <>
            <g className="walkp" style={{ animationDuration: '8s' }}>
              <circle cx="246" cy="98" r="6" style={fill('il-skin-ir')} />
              <rect x="239" y="105" width="14" height="26" rx="5" style={fill('il-dark')} />
              <rect x="240" y="130" width="5" height="12" style={fill('il-black')} />
              <rect x="247" y="130" width="5" height="12" style={fill('il-black')} />
              <rect
                className={ai ? 'dbox' : 'dbox fa'}
                x="233"
                y="88"
                width="26"
                height="58"
                rx="3"
              />
            </g>
            {deter && (
              <>
                <circle className="strobe" cx="300" cy="40" r="8" />
                <rect
                  x="8"
                  y="150"
                  width="200"
                  height="22"
                  rx="5"
                  style={fill('il-mask')}
                  opacity=".85"
                />
                <text className="dlab" x="16" y="165" style={fill('inst-promo-warm')}>
                  {T.scene.deter}
                </text>
              </>
            )}
          </>
        )}
        {!night && (
          <>
            <rect
              x="8"
              y="150"
              width="150"
              height="22"
              rx="5"
              style={fill('il-mask')}
              opacity=".7"
            />
            <text className="dlab" x="16" y="165" style={fill('il-cam-time')}>
              {T.scene.skiRoom}
            </text>
          </>
        )}
      </svg>
    )
  return (
    <svg className={cls} viewBox="0 0 320 180" aria-hidden="true">
      <rect className="sky" width="320" height="70" />
      <path
        d="M0 70 L60 40 L120 62 L180 34 L250 60 L320 44 V70 Z"
        style={fill('il-ridge')}
        opacity=".7"
      />
      <rect className="gr" y="70" width="320" height="110" />
      <rect className="snow" y="70" width="320" height="10" opacity=".85" />
      <g>
        <path d="M220 70 L262 40 L304 70 Z" className="wd" />
        <rect className="wl" x="226" y="70" width="72" height="44" />
        <rect className="lw" x="240" y="80" width="18" height="18" />
        <rect className="lw" x="268" y="80" width="18" height="18" />
      </g>
      <path d="M0 118 H200" style={stroke('il-rail')} strokeWidth="4" />
      <path
        d="M10 104 V124 M40 104 V124 M70 104 V124 M100 104 V124 M130 104 V124 M160 104 V124 M190 104 V124"
        style={stroke('il-rail')}
        strokeWidth="5"
      />
      <path d="M60 180 L110 112 H170 L230 180 Z" className="pv" />
      <g className="sway">
        <rect x="28" y="120" width="6" height="30" style={fill('inst-scene-wall-line')} />
        <path d="M31 78 L54 124 H8 Z" style={fill('il-tree')} />
        <path d="M31 70 L48 102 H14 Z" style={fill('il-tree-2')} />
      </g>
      {!ai && (
        <>
          <rect className="dbox fa" x="4" y="66" width="56" height="88" rx="3" />
          <rect className="dlbg fa" x="4" y="54" width="34" height="13" rx="2" />
          <text className="dlab" x="7" y="64" style={fill('inst-band-button-ink')}>
            {T.scene.motion}
          </text>
        </>
      )}
      <g className="carm" style={{ animationDuration: '15s' }}>
        <rect className="car4" x="120" y="128" width="40" height="44" rx="8" />
        <rect x="125" y="136" width="30" height="12" rx="3" style={fill('il-car-glass')} />
        {ai && (
          <>
            <rect className="dbox car" x="114" y="122" width="52" height="56" rx="3" />
            <rect className="dlbg car" x="114" y="110" width="58" height="13" rx="2" />
            <text className="dlab" x="117" y="120" style={fill('inst-band-button-ink')}>
              {T.scene.plate}
            </text>
          </>
        )}
      </g>
      {mask && (
        <>
          <rect
            className={night ? 'pmask' : 'pmask day'}
            x="214"
            y="34"
            width="100"
            height="86"
            rx="4"
          />
          <text className="dlab" x="222" y="82" style={fill('inst-promo-warm')}>
            {T.scene.privacy}
          </text>
          <text className="dlab" x="222" y="95" style={fill('inst-promo-warm')} opacity=".8">
            {T.scene.neighbour}
          </text>
        </>
      )}
    </svg>
  )
}

/**
 * Recorder preview in the Monitoring hero (`zrodlo/pages/Monitoring.body.html` #pheroA): four
 * cameras of a guesthouse, day / IR / colour night, detection, privacy mask and deterrence, the
 * last 24 h. Modes play by themselves every 4.2 s until the first touch (paused off screen, in a
 * hidden tab and with reduced motion); the clock ticks with the prototype's 1.3 s.
 */
export function NvrDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<NvrState>(INITIAL_NVR)
  const [touched, setTouched] = useState(false)
  const [tick, setTick] = useState(0)
  useInterval(() => setTick((t) => (t + 1) % 100000), TICK_MS, { enabled: true, target: ref })
  useInterval(
    () =>
      setState((s) => ({
        ...s,
        mode: AUTOPLAY_MODES[(AUTOPLAY_MODES.indexOf(s.mode) + 1) % AUTOPLAY_MODES.length]!,
      })),
    AUTOPLAY_MS,
    { enabled: !touched, target: ref },
  )
  const touch = (next: (s: NvrState) => NvrState) => {
    setTouched(true)
    setState(next)
  }
  const night = state.mode !== 'day'
  const time = nvrTime(state.mode, tick)
  const big = state.sel >= 0
  const note = T.notes[nvrNoteKey(state)] + (state.mask ? T.notes.mask : '')

  return (
    <div ref={ref} className="nvr" role="region" aria-label={T.label}>
      <div className="nvrh">
        <span>
          {T.title} · {night ? T.night : T.day}
        </span>
        <span className="rec">REC {time}</span>
      </div>
      <div className="nvrtools nvrtop">
        <div className="segd" role="group" aria-label={T.modesLabel}>
          {T.modes.map((m) => (
            <button
              key={m.mode}
              type="button"
              className={state.mode === m.mode ? 'on' : ''}
              aria-pressed={state.mode === m.mode}
              onClick={() => touch((s) => ({ ...s, mode: m.mode }))}
            >
              <InstIcon name={m.icon} size={14} />
              {m.label}
            </button>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        {big && (
          <button type="button" className="tgl" onClick={() => touch((s) => ({ ...s, sel: -1 }))}>
            <InstIcon name="layers" size={14} />
            {T.all}
          </button>
        )}
      </div>
      <div className={big ? 'nvrg one' : 'nvrg'}>
        {T.cameras.map((cam, i) =>
          big && state.sel !== i ? null : (
            <button
              key={cam.name}
              type="button"
              className={state.sel === i ? 'cam sel' : 'cam'}
              onClick={() => touch((s) => ({ ...s, sel: s.sel === i ? -1 : i }))}
              aria-label={cam.label}
            >
              <Scene index={i} state={state} />
              <span className="cl">{cam.name}</span>
              <span className="ct2">{time}</span>
            </button>
          ),
        )}
      </div>
      <div className="nvrt">
        <div className="tlx tlkey">
          <span>{T.timeline.last}</span>
          <span style={{ color: 'var(--inst-promo-warm)' }}>{T.timeline.person}</span>
          <span style={{ color: 'var(--inst-plan-accent)' }}>{T.timeline.car}</span>
          {!state.ai && <span style={{ color: 'var(--il-false)' }}>{T.timeline.falseAlarm}</span>}
        </div>
        <div className="tline">
          {timeline(state.ai).map((e) => (
            <span
              key={`${e.kind}${e.left}`}
              className={`tlev ${e.kind}`}
              style={{ left: `${e.left}%` }}
              title={T.timeline.titles[e.kind]}
            >
              {e.mark}
            </span>
          ))}
          <b />
        </div>
        <div className="tlx">
          {T.timeline.hours.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
      </div>
      <div className="nvrtools">
        <button
          type="button"
          className={state.ai ? 'tgl on' : 'tgl'}
          aria-pressed={state.ai}
          onClick={() => touch((s) => ({ ...s, ai: !s.ai }))}
        >
          <i />
          {T.toggles.ai}
        </button>
        <button
          type="button"
          className={state.mask ? 'tgl on' : 'tgl'}
          aria-pressed={state.mask}
          onClick={() => touch((s) => ({ ...s, mask: !s.mask }))}
        >
          <i />
          {T.toggles.mask}
        </button>
        <button
          type="button"
          className={state.deter ? 'tgl on' : 'tgl'}
          aria-pressed={state.deter}
          onClick={() => touch(toggleDeter)}
        >
          <i />
          {T.toggles.deter}
        </button>
      </div>
      <div className="nvrnote" aria-live={touched ? 'polite' : 'off'}>
        {note}
      </div>
    </div>
  )
}

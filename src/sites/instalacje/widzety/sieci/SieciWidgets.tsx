'use client'

import { type CSSProperties, useRef, useState } from 'react'

import { sieci, type VlanKey } from '../../dane/sieci'
import { INST_ICONS, isInstIconName } from '../../icons'
import { InstIcon } from '../../InstIcon'
import { useInterval } from '../../sekcje/useInterval'
import { setNet, useNet } from './netStore'
import {
  AUTOPLAY_MS,
  cable,
  coverage,
  DEVICES,
  LAB_INITIAL,
  LEN_MAX,
  LEN_MIN,
  link,
  netAutoplayStep,
  pickMode,
  pickVlan,
  portalCode,
  SPEEDS,
  VLAN_KEYS,
  wall,
  WALLS,
} from './sieciModel'

const C = sieci.coverage
const vc = (key: VlanKey) => ({ '--vc': sieci.vlans[key].hue }) as CSSProperties
const touchVlan = (key: VlanKey) => setNet((s) => ({ ...s, ...pickVlan(s, key), touched: true }))

/**
 * Wi-Fi coverage map in the Sieci hero (`zrodlo/pages/Sieci.body.html` #pheroA): one router
 * before, three access points after, room quality, devices of the four networks. Flips
 * before/after and walks through the networks every 2.4 s until the first touch (paused off
 * screen, in a hidden tab and with reduced motion); shares the network with „Osobne sieci”.
 */
export function CoverageMap() {
  const ref = useRef<HTMLDivElement>(null)
  const net = useNet()
  useInterval(() => setNet((s) => ({ ...netAutoplayStep(s), touched: s.touched })), AUTOPLAY_MS, {
    enabled: !net.touched,
    target: ref,
  })
  const v = coverage(net.mode, net.vlan)
  const po = net.mode === 'po'

  return (
    <div ref={ref} className="ill" role="region" aria-label={C.label}>
      <div className="illbar">
        <div className="seg" role="group" aria-label={C.modesLabel}>
          {C.modes.map((m) => (
            <button
              key={m.mode}
              type="button"
              className={net.mode === m.mode ? 'on' : ''}
              aria-pressed={net.mode === m.mode}
              onClick={() => setNet((s) => ({ ...s, ...pickMode(s, m.mode), touched: true }))}
            >
              <InstIcon name={m.icon} size={15} />
              {m.label}
            </button>
          ))}
        </div>
        <span className={po ? 'tag a' : 'tag'}>{v.tag}</span>
      </div>
      <svg className="fp wfp" viewBox="0 0 640 360" aria-hidden="true">
        <defs>
          <radialGradient id="whg">
            <stop offset="0" style={{ stopColor: 'var(--inst-scene-beam-ok)' }} stopOpacity=".75" />
            <stop
              offset=".45"
              style={{ stopColor: 'var(--inst-plan-send-to)' }}
              stopOpacity=".45"
            />
            <stop offset=".75" style={{ stopColor: 'var(--inst-promo-warm)' }} stopOpacity=".25" />
            <stop offset="1" style={{ stopColor: 'var(--il-false)' }} stopOpacity="0" />
          </radialGradient>
          <clipPath id="wclip">
            <rect x="20" y="20" width="600" height="320" rx="6" />
          </clipPath>
        </defs>
        <rect x="20" y="20" width="600" height="320" rx="6" className="room" />
        <g clipPath="url(#wclip)">
          {v.sources.map((s) => (
            <circle key={s.label} className="heat" cx={s.x} cy={s.y} r={s.r} fill="url(#whg)" />
          ))}
        </g>
        {v.rooms.map((r) => (
          <g key={r.name}>
            <rect className="rm" x={r.x} y={r.y} width={r.w} height={r.h} />
            <foreignObject x={r.x + 12} y={r.y + 22} width="300" height="24" className="fo fo-l">
              <div className="fot">{r.name}</div>
            </foreignObject>
            <foreignObject x={r.x + 12} y={r.y + 40} width="300" height="24" className="fo fo-l">
              <div className={`fot wq q${r.quality}`}>{C.quality[r.quality]}</div>
            </foreignObject>
          </g>
        ))}
        {DEVICES.map(([key, icon, x, y]) => (
          <g
            key={`${x}-${y}`}
            className={`wdv${net.vlan ? (net.vlan === key ? ' on' : ' dim') : ''}`}
            style={vc(key)}
          >
            <circle cx={x} cy={y} r="11" className="wdc" />
            <path
              d={isInstIconName(icon) ? INST_ICONS[icon] : ''}
              transform={`translate(${x - 7} ${y - 7}) scale(.58)`}
              className="wdi"
            />
          </g>
        ))}
        {v.sources.map((s) => (
          <g key={`ap${s.label}`} className="wap">
            <circle cx={s.x} cy={s.y} r="22" className="wapr" />
            <circle cx={s.x} cy={s.y} r="13" className="wapc" />
            <foreignObject x={s.x} y={s.y + 4} width="300" height="24" className="fo fo-c">
              <div className="fot wapt2">{s.label}</div>
            </foreignObject>
          </g>
        ))}
      </svg>
      <div className="wvl">
        <span className="mut wvlh">{C.split}</span>
        {VLAN_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={net.vlan === key ? 'wvb on' : 'wvb'}
            style={vc(key)}
            aria-pressed={net.vlan === key}
            onClick={() => touchVlan(key)}
          >
            <i />
            {sieci.vlans[key].name}
          </button>
        ))}
      </div>
      <div className="nvrnote wfnote" aria-live={net.touched ? 'polite' : 'off'}>
        {v.note}
      </div>
    </div>
  )
}

/** The four networks of „Osobne sieci” (`#podzial`), shared with the coverage map. */
export function VlanButtons() {
  const net = useNet()
  return (
    <div className="netv">
      {VLAN_KEYS.map((key) => {
        const x = sieci.vlans[key]
        return (
          <button
            key={key}
            type="button"
            className={net.vlan === key ? 'netvb on' : 'netvb'}
            style={vc(key)}
            aria-pressed={net.vlan === key}
            onClick={() => touchVlan(key)}
          >
            <InstIcon name={x.icon} size={22} />
            <b>{x.name}</b>
            <span>{x.text}</span>
            <em>{x.extra}</em>
          </button>
        )
      })}
    </div>
  )
}

/** The voucher on the example portal screen: changes every 5.2 s (four 1.3 s ticks). */
export function PortalCode() {
  const ref = useRef<HTMLElement>(null)
  const [tick, setTick] = useState(0)
  useInterval(() => setTick((t) => t + 1), 1300, { enabled: true, target: ref })
  return (
    <b ref={ref} className="big ptcode">
      {portalCode(tick)}
    </b>
  )
}

/** Segmented choice with `aria-pressed` (`.seg`). */
function Choice({
  items,
  value,
  onChange,
}: {
  items: readonly string[]
  value: number
  onChange: (i: number) => void
}) {
  return (
    <div className="seg">
      {items.map((n, i) => (
        <button
          key={n}
          type="button"
          className={value === i ? 'on' : ''}
          aria-pressed={value === i}
          onClick={() => onChange(i)}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

const LB = sieci.lab

/** „Ile sygnału zabiera ściana?” */
export function WallLab() {
  const [band, setBand] = useState(LAB_INITIAL.band)
  const [w, setW] = useState(LAB_INITIAL.wall)
  const v = wall(band, w)
  return (
    <>
      <Choice items={LB.walls.bands} value={band} onChange={setBand} />
      <div className="zpc">
        {WALLS.map(([n], i) => (
          <button
            key={n}
            type="button"
            className={w === i ? 'chip on' : 'chip'}
            aria-pressed={w === i}
            onClick={() => setW(i)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="wallv">
        <div className="wv1">
          <InstIcon name="wifi" size={22} />
          <span>{LB.walls.sender}</span>
        </div>
        <div className={`wallw w${w}`} />
        <div className="wv2">
          <div className="wbars">
            {v.bars.map((cls, i) => (
              <i key={i} className={cls.trim() || undefined} />
            ))}
          </div>
          <b>−{v.db} dB</b>
        </div>
      </div>
      <p className="labr" aria-live="polite">
        {v.text}
      </p>
      <span className="src">{LB.walls.note}</span>
    </>
  )
}

/** „Cat6 czy Cat6A?” */
export function CableLab() {
  const [len, setLen] = useState(LAB_INITIAL.len)
  const [speed, setSpeed] = useState(LAB_INITIAL.speed)
  const v = cable(len, speed)
  return (
    <>
      <div className="cq">
        <span>
          {LB.cable.length} {len} m
        </span>
        <input
          className="rng"
          type="range"
          min={LEN_MIN}
          max={LEN_MAX}
          step="5"
          value={len}
          onChange={(e) => setLen(Number(e.target.value) || LAB_INITIAL.len)}
          aria-label={LB.cable.lengthLabel}
        />
      </div>
      <div className="cq">
        <span>{LB.cable.speed}</span>
        <Choice items={SPEEDS.map(([n]) => n)} value={speed} onChange={setSpeed} />
      </div>
      <div className={`labres ${v.ok ? 'ok' : 'warn'}`} aria-live="polite">
        <b>{v.title}</b>
        <span>{v.text}</span>
      </div>
      <span className="src">{LB.cable.note}</span>
    </>
  )
}

/** „Światłowód czy most radiowy?” */
export function LinkLab() {
  const [dist, setDist] = useState(LAB_INITIAL.dist)
  const [dig, setDig] = useState(LAB_INITIAL.dig)
  const [see, setSee] = useState(LAB_INITIAL.see)
  const v = link(dist, dig, see)
  return (
    <>
      <div className="cq">
        <span>{LB.link.distance}</span>
        <Choice items={LB.link.distances} value={dist} onChange={setDist} />
      </div>
      <div className="cq">
        <span>{LB.link.dig}</span>
        <Choice items={LB.link.yesNo} value={dig} onChange={setDig} />
      </div>
      <div className="cq">
        <span>{LB.link.see}</span>
        <Choice items={LB.link.yesNo} value={see} onChange={setSee} />
      </div>
      <div className="labres" aria-live="polite">
        <InstIcon name={v.icon} size={22} />
        <div>
          <b>{v.title}</b>
          <span>{v.text}</span>
        </div>
      </div>
    </>
  )
}

/** „Co się dzieje, gdy padnie internet?” */
export function FailoverLab() {
  const T = LB.failover
  const [down, setDown] = useState(false)
  return (
    <>
      <div className={down ? 'fov down' : 'fov'}>
        <div className="fon">
          <InstIcon name="globe" size={20} />
          <span>{T.operator}</span>
          <i className="fol l1" />
        </div>
        <div className="fon">
          <InstIcon name="ant" size={20} />
          <span>{T.lte}</span>
          <i className="fol l2" />
        </div>
        <div className="fon r">
          <InstIcon name="net" size={20} />
          <span>{T.router}</span>
        </div>
        <div className="fon t">
          <InstIcon name="card" size={20} />
          <span>{T.terminal}</span>
          <b>{down ? T.worksLte : T.works}</b>
        </div>
      </div>
      <button
        type="button"
        className={down ? 'btn btn-s btn-p' : 'btn btn-s btn-g'}
        aria-pressed={down}
        onClick={() => setDown((d) => !d)}
      >
        <InstIcon name="x" size={15} />
        {down ? T.restore : T.cut}
      </button>
      <p className="labr" aria-live="polite">
        {down ? T.textDown : T.textUp}
      </p>
    </>
  )
}

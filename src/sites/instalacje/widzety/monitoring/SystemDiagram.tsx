'use client'

import { type KeyboardEvent, type ReactNode, useState } from 'react'

import { monitoring, type SystemElementKey } from '../../dane/monitoring'
import { InstIcon } from '../../InstIcon'
import {
  inVersion,
  shownElement,
  stepElement,
  SYSTEM_INITIAL,
  versionElements,
} from './monitoringModel'

const T = monitoring.system
const CAMERA_SLOTS = [
  [70, 64],
  [140, 64],
  [70, 120],
  [140, 120],
  [70, 176],
  [140, 176],
  [70, 232],
  [140, 232],
] as const
const DISK_SLOTS = [
  [606, 20],
  [630, 20],
  [654, 20],
  [678, 14],
] as const

/** HTML label inside the SVG (`foreignObject` + `.fot`), as in the prototype. */
function Label({
  x,
  y,
  w,
  h,
  title,
  sub,
  className = 'syt',
}: {
  x: number
  y: number
  w: number
  h: number
  title?: ReactNode
  sub?: ReactNode
  className?: string
}) {
  return (
    <foreignObject x={x} y={y} width={w} height={h} className="fo">
      {title != null && <div className={`fot ${className}`}>{title}</div>}
      {sub != null && <div className="fot sym">{sub}</div>}
    </foreignObject>
  )
}

/**
 * „Wersje instalacji” (`zrodlo/pages/Monitoring.body.html` #system): four versions, the
 * diagram with clickable elements (Enter / Space on a focused element, like the prototype's
 * key handler), the description panel with dots and arrows, and the list of the set.
 */
export function SystemDiagram({ planHref }: { planHref: string }) {
  const [versionIndex, setVersionIndex] = useState(SYSTEM_INITIAL.version)
  const [picked, setPicked] = useState<SystemElementKey>(SYSTEM_INITIAL.element)
  const version = T.versions[versionIndex] ?? T.versions[0]!
  const shown = shownElement(version, picked)
  const info = T.elements[shown]
  const keys = versionElements(version)
  const flow = `fl${versionIndex}`

  /** Props of a clickable diagram element (`.sye`). */
  const el = (key: SystemElementKey) => ({
    className: `sye sy-${key}${inVersion(version, key) ? ' on' : ''}${shown === key ? ' sel' : ''}`,
    onClick: () => setPicked(key),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setPicked(key)
      }
    },
    tabIndex: 0,
    role: 'button',
    'aria-label': T.elements[key].name,
  })

  return (
    <>
      <div className="syw ri">
        <div className="card sycard">
          <div className="illbar" style={{ padding: '0 0 12px' }}>
            <div className="seg" role="tablist" aria-label={T.tabsLabel}>
              {T.versions.map((v, i) => (
                <button
                  key={v.name}
                  type="button"
                  role="tab"
                  className={versionIndex === i ? 'on' : ''}
                  aria-selected={versionIndex === i}
                  onClick={() => setVersionIndex(i)}
                >
                  <InstIcon name={v.icon} size={15} />
                  {v.name}
                </button>
              ))}
            </div>
            <span className="tag a">{version.sub}</span>
          </div>
          <div className="syscroll">
            <div className="syin">
              <svg
                className="sysvg"
                viewBox="0 0 1120 470"
                role="img"
                aria-label={`${T.diagramLabel} ${version.name}`}
              >
                <rect x="270" y="26" width="830" height="300" rx="22" className="syzone" />
                <Label x={290} y={34} w={300} h={22} title={T.zones.building} className="syzl" />
                <rect x="14" y="26" width="236" height="300" rx="22" className="syzone t" />
                <Label x={30} y={34} w={200} h={22} title={T.zones.site} className="syzl" />
                <path d="M180 148 C 240 148, 260 145, 330 145" className={`sycab ${flow}`} />
                <path d="M450 145 L520 130" className={`sycab ${flow}`} />
                <path d="M700 130 L760 135" className={`sycab ${flow}`} />
                <path d="M860 135 C 900 135, 920 140, 960 140" className={`sycab net ${flow}`} />
                <g {...el('lnk')}>
                  <path d="M228 400 C 300 400, 360 300, 390 172" className="syfib" />
                  <path
                    d="M236 372 a22 22 0 0 1 22 -22 M236 360 a34 34 0 0 1 34 -34"
                    className="syrad"
                  />
                  <rect x="20" y="350" width="220" height="100" rx="18" className="syzone t" />
                  <path d="M60 430 V392 l36 -24 l36 24 V430Z" className="syb" />
                  <Label
                    x={140}
                    y={380}
                    w={120}
                    h={44}
                    title={T.labels.secondBuilding}
                    sub={T.labels.secondBuildingSub}
                  />
                </g>
                <g {...el('cam')}>
                  {CAMERA_SLOTS.map(([x, y], i) => (
                    <g
                      key={`${x}-${y}`}
                      className={i < version.cams ? 'syc on' : 'syc'}
                      transform={`translate(${x} ${y})`}
                    >
                      <rect x="-22" y="-14" width="44" height="26" rx="8" className="syb" />
                      <circle cx="10" cy="-1" r="6" className="sya" />
                      <path d="M-22 -1 h-8 M-30 -9 v18" className="sys" />
                    </g>
                  ))}
                  <Label
                    x={30}
                    y={268}
                    w={200}
                    h={40}
                    title={version.camLabel}
                    sub={T.labels.cameras}
                  />
                </g>
                <g {...el('ptz')}>
                  <g transform="translate(320 400)">
                    <rect x="-30" y="-40" width="60" height="12" rx="4" className="syb" />
                    <path d="M0 -28 v8" className="sys" />
                    <circle cx="0" cy="-2" r="20" className="syb" />
                    <circle cx="6" cy="0" r="7" className="sya" />
                  </g>
                  <Label
                    x={350}
                    y={378}
                    w={130}
                    h={40}
                    title={T.labels.ptz}
                    sub={T.labels.ptzSub}
                  />
                </g>
                <g {...el('lpr')}>
                  <g transform="translate(520 404)">
                    <rect x="-30" y="-16" width="60" height="30" rx="8" className="syb" />
                    <circle cx="14" cy="-1" r="6" className="sya" />
                    <rect x="-22" y="20" width="46" height="16" rx="3" className="sylp" />
                  </g>
                  <Label
                    x={560}
                    y={384}
                    w={140}
                    h={40}
                    title={T.labels.lpr}
                    sub={T.labels.lprSub}
                  />
                </g>
                <g {...el('srg')}>
                  <g transform="translate(250 147)">
                    <circle r="17" className="syb" />
                    <path d="M2 -9 L-5 2 h6 l-3 8" className="syw" />
                  </g>
                </g>
                <g {...el('sw')}>
                  <rect x="330" y="120" width="120" height="52" rx="10" className="syb" />
                  <g className="syports">
                    {[342, 356, 370, 384, 398, 412, 426].map((x) => (
                      <rect key={x} x={x} y="148" width="10" height="10" rx="2" />
                    ))}
                  </g>
                  <Label x={340} y={124} w={110} h={20} title={T.labels.switch} />
                </g>
                <g {...el('rack')}>
                  <rect x="496" y="64" width="388" height="236" rx="16" className="syrack" />
                  <Label x={510} y={268} w={300} h={22} sub={T.labels.rack} />
                </g>
                <g {...el('nvr')}>
                  <rect x="520" y="96" width="180" height="70" rx="10" className="syb" />
                  <Label
                    x={532}
                    y={102}
                    w={70}
                    h={40}
                    title={T.labels.nvr}
                    sub={version.nvrLabel}
                  />
                  <circle cx="540" cy="150" r="4" className="syled" />
                </g>
                <g {...el('hdd')}>
                  {DISK_SLOTS.map(([x, w], i) => (
                    <rect
                      key={x}
                      x={x}
                      y="104"
                      width={w}
                      height="52"
                      rx="4"
                      className={i < version.disks ? 'syd on' : 'syd'}
                    />
                  ))}
                </g>
                <g {...el('ups')}>
                  <rect x="520" y="196" width="180" height="56" rx="10" className="syb" />
                  <rect x="534" y="214" width="44" height="20" rx="4" className="syups" />
                  <rect x="536" y="216" height="16" rx="3" className="syupsf" />
                  <Label
                    x={590}
                    y={208}
                    w={108}
                    h={40}
                    title={T.labels.ups}
                    sub={version.upsLabel}
                  />
                </g>
                <g {...el('rtr')}>
                  <rect x="760" y="110" width="104" height="52" rx="10" className="syb" />
                  <path d="M778 110 v-14 M846 110 v-14" className="sys" />
                  <Label
                    x={772}
                    y={116}
                    w={90}
                    h={40}
                    title={T.labels.router}
                    sub={T.labels.routerSub}
                  />
                  <rect x="770" y="176" width="84" height="22" rx="11" className="syvlan" />
                  <Label x={770} y={179} w={84} h={18} title={T.labels.vlan} className="syvt" />
                </g>
                <g {...el('app')}>
                  <rect x="964" y="62" width="88" height="160" rx="16" className="syph" />
                  <rect x="974" y="84" width="68" height="44" rx="6" className="syscr" />
                  <circle cx="1008" cy="106" r="7" className="sya" />
                  <rect x="974" y="138" width="68" height="16" rx="5" className="synote" />
                  <rect x="974" y="160" width="50" height="10" rx="5" className="synote o" />
                  <Label
                    x={950}
                    y={232}
                    w={130}
                    h={40}
                    title={T.labels.app}
                    sub={T.labels.appSub}
                  />
                </g>
              </svg>
            </div>
          </div>
          <span className="syhint">{T.swipe}</span>
          <div className="systat">
            {version.stats.map((s) => (
              <div key={s.label}>
                <span>{s.label}</span>
                <b>{s.value}</b>
              </div>
            ))}
          </div>
          <p className="src" style={{ margin: '10px 0 0' }}>
            {T.foot}
          </p>
        </div>
        <div className="sypanel">
          <div className="card syinfo" key={`${shown}${versionIndex}`}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="ico">
                <InstIcon name={info.icon} size={22} />
              </span>
              <div>
                <span className="svk">{info.place}</span>
                <b className="h3" style={{ display: 'block' }}>
                  {info.name}
                </b>
              </div>
            </div>
            <p>{info.text}</p>
            <div className="syspec">
              <span>{T.inThisVersion}</span>
              <b>{version.spec[shown] ?? ''}</b>
            </div>
            <div className="note" style={{ margin: 0 }}>
              <InstIcon name="snow" />
              <span>{info.tip}</span>
            </div>
            <div className="sydots" role="group" aria-label={T.dotsLabel}>
              {keys.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={shown === key ? 'syli on' : 'syli'}
                  onClick={() => setPicked(key)}
                  aria-label={T.elements[key].name}
                  title={T.elements[key].name}
                >
                  <InstIcon name={T.elements[key].icon} size={16} />
                </button>
              ))}
            </div>
            <div className="synav">
              <button
                type="button"
                onClick={() => setPicked(stepElement(version, picked, -1))}
                aria-label={T.prev}
              >
                ←
              </button>
              <span>
                <b>{keys.indexOf(shown) + 1}</b> {T.of} {keys.length}
              </span>
              <button
                type="button"
                onClick={() => setPicked(stepElement(version, picked, 1))}
                aria-label={T.next}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="card sylist2 ri">
        <div className="sylh">
          <b>
            {T.setTitle} „{version.name}”
          </b>
          <span>
            {keys.length} {T.setHint}
          </span>
        </div>
        <div className="sylg">
          {keys.map((key, i) => (
            <button
              key={key}
              type="button"
              className={shown === key ? 'syli on' : 'syli'}
              onClick={() => setPicked(key)}
            >
              <i>
                <InstIcon name={T.elements[key].icon} size={16} />
              </i>
              <span>
                <b>{T.elements[key].name}</b>
                <span>{version.spec[key] ?? ''}</span>
              </span>
              <em>{String(i + 1).padStart(2, '0')}</em>
            </button>
          ))}
          <a href={planHref} className="sycta">
            <b>{T.cta.title}</b>
            <span>{T.cta.text}</span>
          </a>
        </div>
      </div>
    </>
  )
}

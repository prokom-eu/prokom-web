'use client'

import { useRef, useState } from 'react'

import { type AreaKey, type RoomStateKey, smartHome } from '../../dane/smartHome'
import { InstIcon } from '../../InstIcon'
import { useInterval } from '../../sekcje/useInterval'
import {
  adjust,
  AUTOPLAY_MS,
  autoplayStep,
  checklistProgress,
  type Control,
  cycleRoom,
  ecoSummary,
  failureRooms,
  INITIAL_PLAN,
  type PlanState,
  planView,
  sceneState,
  toggle,
} from './smartHomeModel'

const PLAN = smartHome.plan

/** Furniture of the plan (`.shfu`): rects and circles, `t` = the lighter parts. */
const FURNITURE: {
  r?: [number, number, number, number, number]
  c?: [number, number, number]
  t?: true
}[] = [
  { r: [60, 150, 150, 44, 12] },
  { r: [60, 138, 150, 18, 8] },
  { r: [96, 96, 78, 34, 6], t: true },
  { r: [236, 70, 40, 110, 6], t: true },
  { r: [314, 34, 122, 28, 5] },
  { c: [340, 48, 7], t: true },
  { c: [366, 48, 7], t: true },
  { r: [342, 96, 66, 44, 8], t: true },
  { r: [490, 62, 96, 112, 10] },
  { r: [496, 68, 40, 24, 6], t: true },
  { r: [542, 68, 40, 24, 6], t: true },
  { r: [470, 228, 80, 54, 22] },
  { r: [572, 232, 34, 26, 6], t: true },
  { r: [40, 252, 120, 40, 6] },
  { c: [100, 316, 16], t: true },
  { r: [196, 262, 88, 54, 8], t: true },
  { c: [214, 340, 9] },
  { c: [266, 340, 9] },
  { r: [346, 316, 118, 50, 16] },
  { r: [360, 322, 38, 38, 8], t: true },
]

const CONTROLS: {
  key: Control
  icon: string
  label: string
  less: string
  more: string
  unit: string
}[] = [
  {
    key: 'l',
    icon: 'light',
    label: PLAN.card.light,
    less: PLAN.card.lightLess,
    more: PLAN.card.lightMore,
    unit: '%',
  },
  {
    key: 'b',
    icon: 'blind',
    label: PLAN.card.blind,
    less: PLAN.card.blindLess,
    more: PLAN.card.blindMore,
    unit: '%',
  },
  {
    key: 't',
    icon: 'thermo',
    label: PLAN.card.temp,
    less: PLAN.card.tempLess,
    more: PLAN.card.tempMore,
    unit: '°',
  },
]

/**
 * Floor plan of a house controlled by Ampio in the Smart home hero
 * (`zrodlo/pages/SmartHome.body.html` #pheroA): five scenes, „Bez internetu”, rooms to pick,
 * the room card (light, blinds, temperature) and the network status. Goes through the scenes
 * by itself every 3.2 s until the first touch (paused off screen, in a hidden tab and with
 * reduced motion). The plan is a group of room buttons (Enter or Space picks a room).
 */
export function SmartPlan() {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<PlanState>(INITIAL_PLAN)
  const [touched, setTouched] = useState(false)
  const [step, setStep] = useState(0)
  useInterval(
    () => {
      setState(autoplayStep(step))
      setStep((n) => n + 1)
    },
    AUTOPLAY_MS,
    { enabled: !touched, target: ref },
  )
  const touch = (next: (s: PlanState) => PlanState) => {
    setTouched(true)
    setState(next)
  }
  const v = planView(state)
  const sel = state.rs[state.sel]

  return (
    <div ref={ref} className="ill" role="region" aria-label={PLAN.label}>
      <div className="illbar">
        <div className="pills" role="group" aria-label={PLAN.scenesLabel}>
          {PLAN.scenes.map((s) => (
            <button
              key={s.key}
              type="button"
              className={state.scene === s.key ? 'scp on' : 'scp'}
              aria-pressed={state.scene === s.key}
              onClick={() => touch((st) => ({ ...st, ...sceneState(s.key) }))}
            >
              <InstIcon name={s.icon} size={15} />
              {s.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={state.off ? 'offb on' : 'offb'}
          aria-pressed={state.off}
          onClick={() => touch((st) => ({ ...st, off: !st.off }))}
        >
          <InstIcon name="off" size={15} />
          {PLAN.offline}
        </button>
      </div>
      <div className="shw">
        <svg className="fp shp" viewBox="0 0 640 400" role="group" aria-label={PLAN.roomsLabel}>
          <defs>
            <radialGradient id="shLight">
              <stop offset="0" className="shlg0" />
              <stop offset="1" className="shlg1" />
            </radialGradient>
          </defs>
          <rect x="10" y="10" width="620" height="380" rx="8" className="shout" />
          {v.rooms.map((r) => (
            <g
              key={r.key}
              className={r.selected ? 'shg sel' : 'shg'}
              role="button"
              tabIndex={0}
              aria-label={r.name}
              aria-pressed={r.selected}
              onClick={() => touch((st) => ({ ...st, sel: r.key }))}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return
                e.preventDefault()
                touch((st) => ({ ...st, sel: r.key }))
              }}
            >
              <rect
                className={r.terrace ? 'shr ext' : 'shr'}
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
              />
              <ellipse
                cx={r.cx}
                cy={r.cy}
                rx={r.rx}
                ry={r.ry}
                fill="url(#shLight)"
                style={{ opacity: r.glow }}
                className="shl"
              />
              <foreignObject
                x={r.x + 12}
                y={r.y + 22}
                width="300"
                height="24"
                className="fo fo-l"
                aria-hidden="true"
              >
                <div className="fot">{r.name}</div>
              </foreignObject>
              <foreignObject
                x={r.x + 12}
                y={r.y + 44}
                width="300"
                height="24"
                className="fo fo-lb"
                aria-hidden="true"
              >
                <div className="fot big">{r.temp}</div>
              </foreignObject>
            </g>
          ))}
          <g className="shfu" aria-hidden="true">
            {FURNITURE.map((f, i) =>
              f.r ? (
                <rect
                  key={i}
                  x={f.r[0]}
                  y={f.r[1]}
                  width={f.r[2]}
                  height={f.r[3]}
                  rx={f.r[4]}
                  className={f.t ? 't' : undefined}
                />
              ) : (
                <circle
                  key={i}
                  cx={f.c![0]}
                  cy={f.c![1]}
                  r={f.c![2]}
                  className={f.t ? 't' : undefined}
                />
              ),
            )}
          </g>
          {v.windows.map((w, i) => (
            <g key={i} aria-hidden="true">
              <rect x={w.x} y={w.y} width={w.w} height={w.h} className="shwin" />
              <rect x={w.x} y={w.y} width={w.bw} height={w.bh} className="shbl" />
            </g>
          ))}
          <rect x="400" y="376" width={v.gateWidth} height="8" rx="3" className="shgate" />
          <g className={v.alarm.armed ? 'shal arm' : 'shal'} aria-hidden="true">
            <rect x="252" y="252" width="34" height="22" rx="6" className="shpan" />
            <foreignObject x="252" y="258" width="34" height="12" className="fo">
              <div className="fot shpt2">{v.alarm.text}</div>
            </foreignObject>
          </g>
        </svg>
        <div className="shside">
          <div className="shcard">
            <span className="mut shk">{PLAN.card.eyebrow}</span>
            <b className="h3">{PLAN.rooms[state.sel].name}</b>
            {CONTROLS.map((c) => (
              <div key={c.key} className="shrow">
                <span>
                  <InstIcon name={c.icon} size={16} />
                  {c.label}
                </span>
                <div className="stepper">
                  <button
                    type="button"
                    onClick={() => touch((st) => adjust(st, c.key, false))}
                    aria-label={c.less}
                  >
                    −
                  </button>
                  <b>
                    {sel[c.key]}
                    {c.unit}
                  </b>
                  <button
                    type="button"
                    onClick={() => touch((st) => adjust(st, c.key, true))}
                    aria-label={c.more}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={state.off ? 'shnet off' : 'shnet'}>
            <div>
              <InstIcon name="cloud" size={18} />
              <span>{PLAN.net.app}</span>
              <b>{v.app}</b>
            </div>
            <div>
              <InstIcon name="grid" size={18} />
              <span>{PLAN.net.panels}</span>
              <b>{PLAN.net.works}</b>
            </div>
            <div>
              <InstIcon name="cpu" size={18} />
              <span>{PLAN.net.modules}</span>
              <b>{PLAN.net.works}</b>
            </div>
          </div>
        </div>
      </div>
      <div className="nvrnote shnote" aria-live={touched ? 'polite' : 'off'}>
        {v.note}
      </div>
    </div>
  )
}

/** „Co sterujesz” (`#co-sterujesz`): twelve areas, the open one with its modules. */
export function SmartAreas() {
  const A = smartHome.areas
  const [key, setKey] = useState<AreaKey>('sw')
  const a = A.items.find((x) => x.key === key) ?? A.items[0]!
  return (
    <div className="axw ri">
      <div className="axg" role="group" aria-label={A.tabsLabel}>
        {A.items.map((x) => (
          <button
            key={x.key}
            type="button"
            className={key === x.key ? 'axc on' : 'axc'}
            aria-pressed={key === x.key}
            onClick={() => setKey(x.key)}
          >
            <span className="axi">
              <InstIcon name={x.icon} size={22} />
            </span>
            <b>{x.name}</b>
          </button>
        ))}
      </div>
      <div className="card axd" key={a.key}>
        <div className="axh">
          <span className="axbig">
            <InstIcon name={a.icon} size={30} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="svk">{a.group}</span>
            <b className="h3" style={{ fontSize: 26 }}>
              {a.name}
            </b>
          </div>
        </div>
        <p className="axp">{a.text}</p>
        <ul className="axl">
          {a.features.map((f) => (
            <li key={f}>
              <span className="axok">
                <InstIcon name="check" size={14} strokeWidth={2.6} />
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="axr">
          <div className="axq">
            <span>{A.when}</span>
            <b>{a.when}</b>
          </div>
          <span className="axar" aria-hidden="true" />
          <div className="axq to">
            <span>{A.then}</span>
            <b>{a.then}</b>
          </div>
        </div>
        <div className="axt">
          <div>
            <span className="usl" style={{ width: 'auto' }}>
              {A.modulesLabel}
            </span>
            <div className="tags" style={{ marginTop: 6 }}>
              {a.modules.map((t) => (
                <span key={t} className="tag mono">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="usl" style={{ width: 'auto' }}>
              {A.worksWith}
            </span>
            <div className="tags" style={{ marginTop: 6 }}>
              {a.integrations.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="src" style={{ margin: 0 }}>
          {a.note}
        </p>
      </div>
    </div>
  )
}

function FailureBox({
  modular,
  rooms,
  fail,
}: {
  modular: boolean
  rooms: boolean[]
  fail: boolean
}) {
  const F = smartHome.why.failure
  const cells = [
    [20, 46],
    [112, 46],
    [204, 46],
    [20, 122],
    [112, 122],
    [204, 122],
  ]
  return (
    <svg viewBox="0 0 316 220" aria-hidden="true">
      {modular ? (
        <>
          <path d="M20 40 H296" className="flbus" />
          <text x="20" y="30" className="flt l">
            {F.bus}
          </text>
        </>
      ) : (
        <>
          <rect x="118" y="6" width="80" height="28" rx="8" className={fail ? 'flc bad' : 'flc'} />
          <text x="158" y="25" textAnchor="middle" className="flt">
            {F.controller}
          </text>
        </>
      )}
      {cells.map(([x, y], i) => (
        <g key={i} className={rooms[i] ? (modular ? 'flrm off bad' : 'flrm off') : 'flrm'}>
          <rect x={x} y={y} width="84" height="68" rx="8" className="flr" />
          <circle cx={x! + 42} cy={y! + 30} r="24" className="flg" />
          <circle cx={x! + 42} cy={y! + 30} r="6" className="flb" />
        </g>
      ))}
    </svg>
  )
}

/** „Co się dzieje przy awarii?” (`#dlaczego`): one controller against modules on a bus. */
export function SmartFailure() {
  const F = smartHome.why.failure
  const [fail, setFail] = useState(false)
  const rooms = failureRooms(fail)
  return (
    <div className="card flw ri">
      <div className="illbar" style={{ padding: '0 0 12px' }}>
        <b style={{ fontSize: 15 }}>{F.title}</b>
        <button
          type="button"
          className={`btn btn-s ${fail ? 'btn-p' : 'btn-g'}`}
          onClick={() => setFail((f) => !f)}
        >
          <InstIcon name="bolt" size={15} />
          {fail ? F.restore : F.fail}
        </button>
      </div>
      <div className="flg2" aria-live="polite">
        <div className="flbox">
          <FailureBox modular={false} rooms={rooms.central} fail={fail} />
          <b>{F.central.title}</b>
          <span>{fail ? F.central.bad : F.central.ok}</span>
        </div>
        <div className="flbox">
          <FailureBox modular rooms={rooms.modular} fail={fail} />
          <b>{F.modular.title}</b>
          <span>{fail ? F.modular.bad : F.modular.ok}</span>
        </div>
      </div>
      <p className="src" style={{ margin: '10px 0 0' }}>
        {F.note}
      </p>
    </div>
  )
}

/** „Panel zaprojektujesz razem z nami” (`#panele`): glass colour, size and pressed fields. */
export function SmartPanel() {
  const T = smartHome.panels
  const [glass, setGlass] = useState(0)
  const [size, setSize] = useState(1)
  const [pressed, setPressed] = useState<number[]>([0, 3])
  const s = T.sizes[size]!
  return (
    <div className="split">
      <div className="ri" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <span className="eye">{T.eyebrow}</span>
        <h2 className="h2">{T.heading}</h2>
        <p className="lead">{T.lead}</p>
        <div className="cq">
          <span className="mut cqk">{T.glassLabel}</span>
          <div className="seg">
            {T.glass.map((g, i) => (
              <button
                key={g}
                type="button"
                className={glass === i ? 'on' : ''}
                aria-pressed={glass === i}
                onClick={() => setGlass(i)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="cq">
          <span className="mut cqk">{T.sizeLabel}</span>
          <div className="seg">
            {T.sizes.map((x, i) => (
              <button
                key={x.fields}
                type="button"
                className={size === i ? 'on' : ''}
                aria-pressed={size === i}
                onClick={() => setSize(i)}
              >
                {x.fields} {T.fieldsSuffix}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="ri" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className={`mdp c${glass}`}>
          <div className="mdg" style={{ gridTemplateColumns: `repeat(${s.cols},minmax(0,1fr))` }}>
            {T.icons.slice(0, s.fields).map((x, i) => (
              <button
                key={x.name}
                type="button"
                className={pressed.includes(i) ? 'mdk on' : 'mdk'}
                aria-pressed={pressed.includes(i)}
                onClick={() => setPressed((p) => toggle(p, i))}
              >
                <InstIcon name={x.icon} size={20} strokeWidth={1.8} />
                <span>{x.name}</span>
              </button>
            ))}
          </div>
          <span className="mdlogo">{T.label}</span>
        </div>
      </div>
    </div>
  )
}

/** Rooms of a guesthouse floor (`#obiekty`): a click goes guest → empty → cleaning. */
export function SmartRooms() {
  const O = smartHome.objects
  const [rooms, setRooms] = useState<RoomStateKey[]>([...O.initialRooms])
  return (
    <div className="card hotb">
      <div className="illbar" style={{ padding: '0 0 12px' }}>
        <b style={{ fontSize: 15 }}>{O.floor}</b>
        <span className="tag a" aria-live="polite">
          {ecoSummary(rooms)}
        </span>
      </div>
      <div className="rbg">
        {rooms.map((r, i) => {
          const s = O.states[r]
          return (
            <button
              key={i}
              type="button"
              className={`rbr ${r}`}
              onClick={() => setRooms((list) => cycleRoom(list, i))}
            >
              <span className="rbn">
                {O.roomPrefix} {101 + i}
              </span>
              <span className="rbs">{s.name}</span>
              <span className="rbv">
                <InstIcon name="thermo" size={16} />
                {s.temp}
              </span>
              <span className="rbv">
                <InstIcon name="light" size={16} />
                {s.light}
              </span>
              <span className="rbx">{s.mode}</span>
            </button>
          )
        })}
      </div>
      <div className="note" style={{ margin: '12px 0 0' }}>
        <InstIcon name="drop" size={18} />
        <span>{O.staffNote}</span>
      </div>
    </div>
  )
}

/** The Ampio UNI app with three objects (`#obiekty`, the phone). */
export function SmartApp() {
  const A = smartHome.objects.app
  const [index, setIndex] = useState(1)
  const o = A.objects[index] ?? A.objects[0]!
  return (
    <div className="phone" role="img" aria-label={A.label}>
      <div className="phs">
        <div className="phh">
          <span>{A.title}</span>
          <span>{A.sub}</span>
        </div>
        <div className="objt">
          {A.objects.map((x, i) => (
            <button
              key={x.tab}
              type="button"
              className={index === i ? 'objb on' : 'objb'}
              onClick={() => setIndex(i)}
            >
              {x.tab}
            </button>
          ))}
        </div>
        <div className="pht" style={{ fontSize: 20 }}>
          {o.title}
        </div>
        <div className="phn" key={index}>
          <InstIcon name="check" size={18} strokeWidth={2.2} />
          <span>{o.note}</span>
        </div>
        <div className="phg">
          {o.tiles.map(([name, icon, value, sub, on]) => (
            <div key={name} className={on ? 'tile on' : 'tile'}>
              <i>
                <InstIcon name={icon} size={18} />
              </i>
              <span>{name}</span>
              <b className="big">{value}</b>
              <span>{sub}</span>
            </div>
          ))}
        </div>
        <div className="phcap">{A.caption}</div>
      </div>
    </div>
  )
}

/** „Budujesz? Lista przed tynkami” (`#etapy`): ticks and progress. */
export function SmartChecklist({ planHref }: { planHref: string }) {
  const C = smartHome.stages.checklist
  const [done, setDone] = useState<number[]>([...C.initial])
  const p = checklistProgress(done)
  return (
    <div className="card ckl ri">
      <span className="eye">{C.eyebrow}</span>
      <b className="h3">{C.heading}</b>
      <div className="ckbar">
        <i style={{ width: p.width }} />
      </div>
      <span className="mut" style={{ fontSize: 14 }} aria-live="polite">
        {p.text}
      </span>
      {C.items.map((c, i) => (
        <button
          key={c.title}
          type="button"
          className={done.includes(i) ? 'cki on' : 'cki'}
          aria-pressed={done.includes(i)}
          onClick={() => setDone((d) => toggle(d, i))}
        >
          <i>
            <InstIcon name="check" size={14} strokeWidth={3} />
          </i>
          <span>
            <b>{c.title}</b>
            <span>{c.text}</span>
          </span>
        </button>
      ))}
      <a href={planHref} className="btn btn-p">
        {C.button}
      </a>
    </div>
  )
}

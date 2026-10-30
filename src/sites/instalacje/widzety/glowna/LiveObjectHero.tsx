'use client'

import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  glowna,
  HERO_LAYERS,
  HERO_MODES,
  HERO_OBJECTS,
  type HeroLayer,
  type HeroObject,
} from '../../dane/glowna'
import { InstIcon } from '../../InstIcon'
import { INST_ICONS, isInstIconName } from '../../icons'
import { useInterval } from '../../sekcje/useInterval'
import {
  AUTOPLAY_MS,
  AUTOPLAY_START,
  autoplayStep,
  heroScene,
  type HeroState,
  INITIAL_HERO,
  planHref,
  previewTime,
  TICK_MS,
} from './heroModel'
import { HERO_OBJECT_EVENT } from './heroEvents'

import './glowna.css'

type Props = {
  /** The fixed scene (`HeroBackdrop`, rendered on the server). */
  backdrop: ReactNode
  /** The text column (`.hxt`, rendered on the server: h1, lead, buttons). */
  children: ReactNode
}

const t = glowna.hero
const NARROW = '(max-width: 1100px)'

const iconPath = (name: string) => (isInstIconName(name) ? INST_ICONS[name] : '')

/**
 * The hero „Twój obiekt na żywo” (spec §5.1, KOMPONENTY §3): the live scene of six objects in
 * three times of day with eight installation layers, the camera preview, the „Na żywo” panel and
 * the chips. It plays by itself until the first touch, and only while on screen, in a visible
 * tab and without reduced motion (the prototype ignores the last two). The text column and the
 * fixed backdrop come from the server, so the h1 is in the HTML and paints first (LCP).
 */
export function LiveObjectHero({ backdrop, children }: Props) {
  const [scene, setScene] = useState({ ...INITIAL_HERO })
  const [touched, setTouched] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const [tick, setTick] = useState(0)
  const auto = useRef(AUTOPLAY_START)
  const section = useRef<HTMLElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const query = window.matchMedia(NARROW)
    const onChange = () => setNarrow(query.matches)
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useInterval(
    () => {
      const next = autoplayStep(scene, auto.current)
      auto.current = next.auto
      setScene(next.state)
    },
    AUTOPLAY_MS,
    { enabled: !touched, target: section },
  )
  useInterval(() => setTick((n) => n + 1), TICK_MS, { enabled: true, target: section })

  const state: HeroState = { ...scene, narrow, tick }
  const sc = heroScene(state)
  const has = (k: HeroLayer) => scene.layers.includes(k)
  const allOn = scene.layers.length === HERO_LAYERS.length
  const touch = (change: Partial<typeof scene>) => {
    setTouched(true)
    setScene((s) => ({ ...s, ...change }))
  }
  // „Pokaż na żywo” on a „Dla kogo” card (I6): the card's object, autoplay stops.
  useEffect(() => {
    const onObject = (event: Event) => {
      const obj = (event as CustomEvent<HeroObject>).detail
      if (!HERO_OBJECTS.includes(obj)) return
      setTouched(true)
      setScene((s) => ({ ...s, obj }))
    }
    window.addEventListener(HERO_OBJECT_EVENT, onObject)
    return () => window.removeEventListener(HERO_OBJECT_EVENT, onObject)
  }, [])
  const toggle = (k: HeroLayer) =>
    touch({ layers: has(k) ? scene.layers.filter((x) => x !== k) : [...scene.layers, k] })

  const onTabKey = (event: KeyboardEvent, index: number) => {
    const last = HERO_OBJECTS.length - 1
    const targets: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }
    const next = targets[event.key]
    if (next === undefined) return
    event.preventDefault()
    touch({ obj: HERO_OBJECTS[next] })
    tabs.current[next]?.focus()
  }

  const object = t.objects[scene.obj]
  const night = scene.mode === 'night'

  return (
    <section id="start" ref={section} className={`hx ${scene.mode}`} data-hx-time={scene.mode}>
      <svg
        className={`hxsvg scene ${scene.mode}`}
        viewBox={sc.viewBox}
        preserveAspectRatio="xMidYMid slice"
        id="hx-scena"
        role="img"
        aria-label={sc.aria}
      >
        {backdrop}
        <g>
          {sc.gnd.map((f, i) => (
            <polygon key={`g${i}`} points={f.p} className={f.c} />
          ))}
          {sc.zones.map((f, i) => (
            <polygon key={`z${i}`} points={f.p} className={f.c} />
          ))}
        </g>
        <g aria-hidden="true">
          {sc.trees.map((tree, i) => (
            <g key={i} transform={`translate(${tree.x} ${tree.y}) scale(${tree.s})`}>
              <rect x="-1.6" y="-7" width="3.2" height="7" className="trk" />
              <polygon points="0,-58 -12,-30 12,-30" className="tre2" />
              <polygon points="0,-46 -15,-17 15,-17" className="tre" />
              <polygon points="0,-33 -18,-5 18,-5" className="tre2" />
              <polygon points="0,-58 -5,-48 0,-50 5,-48" className="tcap" />
              <polygon points="-12,-30 -6,-31 -2,-28 4,-31 12,-30 6,-27 -6,-27" className="tcap" />
            </g>
          ))}
        </g>
        <g>
          {sc.body.map((f, i) => (
            <polygon key={i} points={f.p} className={f.c} />
          ))}
        </g>
        <g aria-hidden="true">
          <g
            className="walker"
            style={
              {
                '--x0': `${sc.walker.x0}px`,
                '--y0': `${sc.walker.y0}px`,
                '--x1': `${sc.walker.x1}px`,
                '--y1': `${sc.walker.y1}px`,
              } as CSSProperties
            }
          >
            <ellipse cx="0" cy="0" rx="6" ry="2.6" className="wks" />
            <path
              d="M-3.2 0 L-2.4 -9 L2.4 -9 L3.2 0 Z M-4 -9 L-3 -17 L3 -17 L4 -9 Z"
              className="wkb"
            />
            <circle cx="0" cy="-20.5" r="3.4" className="wkh" />
            {sc.det ? (
              <g>
                <rect x="-9" y="-28" width="18" height="31" rx="2" className="detb" />
                <rect x="-9" y="-38" width="44" height="10" rx="2" className="detl" />
                <text x="-6" y="-30.5" className="dett">
                  {t.preview.person}
                </text>
              </g>
            ) : null}
          </g>
        </g>
        <g aria-hidden="true">
          {sc.smoke.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r="4" className={s.c} />
          ))}
        </g>
        <g>
          {sc.cones.map((f, i) => (
            <polygon key={`c${i}`} points={f.p} className={f.c} />
          ))}
          {sc.scr.map((f, i) => (
            <polygon key={`s${i}`} points={f.p} className={f.c} />
          ))}
          {sc.rings.map((r, i) => (
            <ellipse key={`r${i}`} cx={r.x} cy={r.y} rx={r.rx} ry={r.ry} className={r.c} />
          ))}
          {sc.arcs.map((a, i) => (
            <path key={`a${i}`} d={a.d} className={a.c} />
          ))}
        </g>
        <g>
          {sc.dv.map((d) => (
            <g
              key={`${d.icon}-${d.x}-${d.y}`}
              transform={`translate(${d.x} ${d.y})`}
              className={d.cls}
            >
              <circle r="10.5" className="dvp" />
              <circle r="10.5" className="dvb" />
              <path
                d={iconPath(d.icon)}
                transform="translate(-6.5 -6.5) scale(.54)"
                className="dvi"
              />
            </g>
          ))}
          {sc.temps.map((tag) => (
            <g
              key={`${tag.x}-${tag.y}`}
              transform={`translate(${tag.x} ${tag.y})`}
              className="ttag dv"
            >
              <rect x="-17" y="-11" width="34" height="18" rx="9" />
              <foreignObject x="-17" y="-9" width="34" height="14" className="fo">
                <div className="fot ttag2">{tag.t}</div>
              </foreignObject>
            </g>
          ))}
        </g>
        <g aria-hidden="true">
          {sc.flakes.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              className="flk"
              style={{ animationDuration: `${s.t}s`, animationDelay: `${s.d}s` }}
            />
          ))}
        </g>
      </svg>

      <div className="hxin">
        {children}

        <div className="hxbar in d4">
          <div className="glass hotabs" role="tablist" aria-label={t.objectsLabel}>
            {HERO_OBJECTS.map((k, i) => {
              const on = scene.obj === k
              return (
                <button
                  key={k}
                  ref={(el) => {
                    tabs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="hx-scena"
                  tabIndex={on ? 0 : -1}
                  className={on ? 'hotab on' : 'hotab'}
                  onClick={() => touch({ obj: k })}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  <InstIcon name={t.objects[k].icon} size={17} />
                  {t.objects[k].name}
                </button>
              )
            })}
          </div>
          <div className="glass hmodes" role="group" aria-label={t.modesLabel}>
            {HERO_MODES.map((m) => (
              <button
                key={m}
                type="button"
                className={scene.mode === m ? 'hmode on' : 'hmode'}
                aria-pressed={scene.mode === m}
                onClick={() => touch({ mode: m })}
              >
                <InstIcon name={t.modes[m].icon} size={15} strokeWidth={2.2} />
                {t.modes[m].label}
              </button>
            ))}
          </div>
        </div>

        {has('kam') ? (
          <div className="glass pip" key={scene.obj + scene.mode}>
            <div className="piph">
              <span>{object.camera}</span>
              {/* The day clock is the real time: the server's and the browser's may differ. */}
              <span className="rec" suppressHydrationWarning>
                {t.preview.rec} {previewTime({ mode: scene.mode, tick }, new Date())}
              </span>
            </div>
            <svg
              className={night ? 'pipv ir' : 'pipv'}
              viewBox="0 0 300 168"
              role="img"
              aria-label={`${t.preview.label}: ${object.camera}`}
            >
              <rect width="300" height="168" className="pps" />
              <polygon points="0,62 300,50 300,168 0,168" className="ppg" />
              <polygon points="0,0 96,0 96,70 0,78" className="ppw" />
              <polygon points="10,10 40,10 40,40 10,42" className="ppwin" />
              <polygon points="52,10 84,10 84,38 52,40" className="ppwin" />
              <path
                d="M120 168 L170 60 M200 168 L200 58 M280 168 L230 56"
                className="ppl"
                strokeWidth="2"
                opacity=".55"
              />
              <rect x="214" y="84" width="58" height="26" rx="6" className="ppc1" />
              <rect x="222" y="74" width="40" height="14" rx="4" className="ppcr" />
              <rect x="128" y="96" width="62" height="28" rx="6" className="ppc2" />
              <rect x="138" y="85" width="42" height="15" rx="4" className="ppcr" />
              <g
                className="walker"
                style={
                  {
                    '--x0': '40px',
                    '--y0': '150px',
                    '--x1': '120px',
                    '--y1': '132px',
                  } as CSSProperties
                }
              >
                <ellipse cx="0" cy="0" rx="9" ry="3" className="ppsh" />
                <path
                  d="M-5 0 L-3.6 -16 L3.6 -16 L5 0 Z M-6 -16 L-4.5 -30 L4.5 -30 L6 -16 Z"
                  className="ppp"
                />
                <circle cx="0" cy="-35" r="5.4" className="pph" />
                <rect
                  x="-14"
                  y="-45"
                  width="28"
                  height="49"
                  rx="2"
                  fill="none"
                  strokeWidth="2"
                  className="ppdb"
                />
                <rect x="-14" y="-57" width="56" height="12" rx="2" className="ppdl" />
                <text x="-10" y="-48" className="ppdt">
                  {t.preview.person}
                </text>
              </g>
              <defs>
                <pattern id="pipSl" width="4" height="4" patternUnits="userSpaceOnUse">
                  <rect width="4" height="2" className="ppscan" />
                </pattern>
                <radialGradient id="pipVg" cx=".5" cy=".5" r=".7">
                  <stop offset=".55" className="ppv0" />
                  <stop offset="1" className="ppv1" />
                </radialGradient>
              </defs>
              <rect width="300" height="168" fill="url(#pipSl)" />
              <rect width="300" height="168" fill="url(#pipVg)" />
              <rect className="pipsweep ppsw" x="0" y="0" width="300" height="24" />
              <path
                d="M14 14 h14 M14 14 v14 M286 14 h-14 M286 14 v14 M14 154 h14 M14 154 v-14 M286 154 h-14 M286 154 v-14"
                className="ppr"
                strokeWidth="1.6"
                fill="none"
              />
            </svg>
            <div className="pipf">
              <span>{night ? t.preview.night : t.preview.day}</span>
              <span>{t.preview.codec}</span>
            </div>
          </div>
        ) : null}

        <div className="glass hxstat">
          <div className="hxsh">
            <b>
              <span className="live" aria-hidden="true" />
              {t.live} · {sc.name}
            </b>
            <span>{sc.modeName}</span>
          </div>
          {/* Announced only after a touch: the autoplay would talk every 2.3 s (WCAG 2.2.2). */}
          <div className="hxl" aria-live={touched ? 'polite' : 'off'}>
            {sc.lines.length === 0 ? <div className="hxempty">{t.empty}</div> : null}
            {sc.lines.map((line) => (
              <div key={line.layer} className="hxli">
                <i className={line.arm ? 'arm' : undefined}>
                  <InstIcon name={line.icon} size={15} strokeWidth={2.2} />
                </i>
                <div>
                  <b>{line.name}</b>
                  <span>{line.text}</span>
                </div>
              </div>
            ))}
          </div>
          {sc.more > 0 ? (
            <div className="hxmore">
              <b>+{sc.more}</b> {sc.moreText} {t.more.suffix}
            </div>
          ) : null}
        </div>

        <div className="glass hxchips" role="group" aria-label={t.chipsLabel}>
          {HERO_LAYERS.map((k) => (
            <button
              key={k}
              type="button"
              className={has(k) ? 'hchip on' : 'hchip'}
              aria-pressed={has(k)}
              onClick={() => toggle(k)}
            >
              <InstIcon name={t.layers[k].icon} size={16} strokeWidth={2.1} />
              {t.layers[k].label}
              <em aria-hidden="true">{has(k) ? '✓' : '+'}</em>
            </button>
          ))}
          <span className="hchipx">
            <button type="button" onClick={() => touch({ layers: allOn ? [] : [...HERO_LAYERS] })}>
              {allOn ? t.hideAll : t.showAll}
            </button>
            <a href={planHref(scene)} className="btn hbtn-p btn-s">
              {t.planSet}
            </a>
          </span>
        </div>
      </div>
    </section>
  )
}

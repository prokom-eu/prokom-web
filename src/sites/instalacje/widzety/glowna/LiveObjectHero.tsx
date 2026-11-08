'use client'

import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

import { SlidingPill } from '@/components/motion/SlidingPill'

import { glowna, HERO_LAYERS, HERO_MODES, HERO_OBJECTS, type HeroLayer } from '../../dane/glowna'

import { InstIcon } from '../../InstIcon'
import { INST_ICONS, isInstIconName } from '../../icons'
import { useInterval } from '../../sekcje/useInterval'
import {
  AUTOPLAY_MS,
  autoplayProgress,
  AUTOPLAY_START,
  autoplayStep,
  BUILDING_VIEWBOX,
  heroScene,
  type HeroState,
  INITIAL_HERO,
  planHref,
  previewTime,
  TICK_MS,
} from './heroModel'
import { beamOrigin } from './beam'

type Props = {
  /** The fixed scene (`HeroBackdrop`, rendered on the server). */
  backdrop: ReactNode
  /** The text column (`.hxt`, rendered on the server: h1, lead, buttons). */
  children: ReactNode
}

const t = glowna.hero
const NARROW = '(max-width: 1023px)'
/** Phone layout: the dock's one-line status replaces the „Na żywo” card (P2-12). */
const PHONE = '(max-width: 760px)'
/** Without room for the camera preview (RUNDA-V5 §1.3): it opens from a camera point instead. */
const COMPACT = '(max-width: 1279px), (max-height: 809px)'

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
  const [phone, setPhone] = useState(false)
  const [compact, setCompact] = useState(false)
  const [pipOpen, setPipOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  // P2-11 (WCAG 2.2.2): the visitor's own pause — the autoplay and every animation of the scene
  // stop (`still`); the autoplay's progress bar is frozen where it stopped.
  const [userPaused, setUserPaused] = useState(false)
  const [frozen, setFrozen] = useState<number | null>(null)
  const [reduced, setReduced] = useState(true)
  const progressBar = useRef<HTMLSpanElement>(null)
  // The camera point that opened the preview: Esc gives the focus back to it.
  const pipOpener = useRef<Element | null>(null)
  const [tick, setTick] = useState(0)
  const [auto, setAuto] = useState(AUTOPLAY_START)
  const section = useRef<HTMLElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const objectTabs = useRef<HTMLDivElement>(null)
  const modeTabs = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const narrowQuery = window.matchMedia(NARROW)
    const phoneQuery = window.matchMedia(PHONE)
    const compactQuery = window.matchMedia(COMPACT)
    const onChange = () => {
      setNarrow(narrowQuery.matches)
      setPhone(phoneQuery.matches)
      setCompact(compactQuery.matches)
    }
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => setReduced(motionQuery.matches)
    onMotion()
    motionQuery.addEventListener('change', onMotion)
    onChange()
    narrowQuery.addEventListener('change', onChange)
    phoneQuery.addEventListener('change', onChange)
    compactQuery.addEventListener('change', onChange)
    return () => {
      narrowQuery.removeEventListener('change', onChange)
      phoneQuery.removeEventListener('change', onChange)
      compactQuery.removeEventListener('change', onChange)
      motionQuery.removeEventListener('change', onMotion)
    }
  }, [])

  useInterval(
    () => {
      const next = autoplayStep(scene, auto)
      setAuto(next.auto)
      setScene(next.state)
    },
    AUTOPLAY_MS,
    { enabled: !touched && !paused && !userPaused, target: section },
  )
  // The scene's own clock (sweeping cameras, the preview's time) stands with the pause too.
  useInterval(() => setTick((n) => n + 1), TICK_MS, { enabled: !userPaused, target: section })

  // Hover, focus or the button stop the autoplay: the progress bar stops where it is (its CSS
  // transition would otherwise run on to the next step).
  const stopped = paused || userPaused
  useEffect(() => {
    const bar = progressBar.current
    if (!stopped || !bar) {
      setFrozen(null)
      return
    }
    const matrix = getComputedStyle(bar).transform
    const scale = matrix.startsWith('matrix(') ? Number(matrix.slice(7).split(',')[0]) : NaN
    setFrozen(Number.isFinite(scale) ? scale : null)
  }, [stopped])

  const state: HeroState = { ...scene, narrow, tick }
  const sc = heroScene(state)
  const has = (k: HeroLayer) => scene.layers.includes(k)
  const allOn = scene.layers.length === HERO_LAYERS.length
  const touch = (change: Partial<typeof scene>) => {
    setTouched(true)
    setScene((s) => ({ ...s, ...change }))
  }
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
  // The preview sits by the right edge on wide screens; elsewhere a camera point opens it.
  const pipShown = has('kam') && (!compact || narrow || pipOpen)
  const progress = touched ? null : autoplayProgress(scene, auto)
  const status = sc.lines.map((line) => line.text).join(' · ')
  const flakes = sc.flakes.map((s, i) => (
    <circle
      key={i}
      cx={s.x}
      cy={s.y}
      r={s.r}
      className="flk"
      style={{ animationDuration: `${s.t}s`, animationDelay: `${s.d}s` }}
    />
  ))
  const pause = (on: boolean) => () => setPaused(on)
  // A camera point opens the preview where it has no room by the right edge.
  const camButtons = compact && !narrow && has('kam')
  const togglePip = (opener: Element) => {
    pipOpener.current = opener
    setPipOpen((open) => !open)
  }
  const camPoint = {
    role: 'button',
    tabIndex: 0,
    'aria-label': `${t.preview.label}: ${object.camera}`,
    'aria-pressed': pipOpen,
    onClick: (event: { currentTarget: Element }) => togglePip(event.currentTarget),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      togglePip(event.currentTarget)
    },
  }

  return (
    <section
      id="start"
      ref={section}
      className={userPaused ? `hx ${scene.mode} still` : `hx ${scene.mode}`}
      data-hx-time={scene.mode}
      onPointerEnter={pause(true)}
      onPointerLeave={pause(false)}
      // Focus pauses the autoplay, except on the pause button itself: after „resume” the show
      // must move again while the button still has the focus.
      onFocus={(event) => {
        if (!(event.target as Element).closest('.hxpause')) setPaused(true)
      }}
      onBlur={pause(false)}
      onKeyDown={(event) => {
        // P2-11: the camera preview opened from a camera point closes with Esc; the focus goes
        // back to that point only when it was there (or nowhere), not from a chip or a tab.
        if (event.key !== 'Escape' || !pipOpen) return
        setPipOpen(false)
        const active = document.activeElement
        if (active === pipOpener.current || active === document.body || !active) {
          ;(pipOpener.current as SVGElement | null)?.focus()
        }
      }}
    >
      {/* Sky, mountains and forests across the whole section (RUNDA-V5 §1.3). Below 1024 px it is
          hidden and the building scene draws it itself through <use>, cropped like the building. */}
      <svg
        className={`hxsvg scene ${scene.mode}`}
        viewBox="0 0 1440 1000"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        {backdrop}
        {narrow ? null : flakes}
      </svg>

      <div className="hxin">
        {children}

        <div className="hxbar in d2">
          <div ref={objectTabs} className="glass hotabs" role="tablist" aria-label={t.objectsLabel}>
            <SlidingPill
              container={objectTabs}
              active={scene.obj}
              className="inst-pill"
              radius={14}
            />
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
                  title={t.objects[k].name}
                  onClick={() => touch({ obj: k })}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  <InstIcon name={t.objects[k].icon} size={17} />
                  <span className="hotl">{t.objects[k].name}</span>
                  {on && progress !== null ? (
                    // How far the autoplay is before it moves on to the next object.
                    <span
                      ref={progressBar}
                      className={frozen === null ? 'hoprog' : 'hoprog stop'}
                      style={{ '--p': frozen ?? progress } as CSSProperties}
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
          <div className="hmrow">
            <div ref={modeTabs} className="glass hmodes" role="group" aria-label={t.modesLabel}>
              <SlidingPill
                container={modeTabs}
                active={scene.mode}
                className="inst-pill"
                radius={12}
              />
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
            {/* P2-11 (WCAG 2.2.2): a visible pause of the autoplay and of every animation of the
                scene, also after the first touch (none with reduced motion — nothing moves). */}
            {!reduced ? (
              <button
                type="button"
                className="glass hxpause"
                aria-pressed={userPaused}
                onClick={() => setUserPaused((on) => !on)}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  {userPaused ? (
                    <path d="M5 3.5v9l7-4.5z" />
                  ) : (
                    <path d="M4.5 3h2.5v10H4.5zM9 3h2.5v10H9z" />
                  )}
                </svg>
                <span className="hxpl">{t.pause}</span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="hxstage">
          <svg
            className={`hxbld scene ${scene.mode}`}
            viewBox={narrow ? sc.viewBox : BUILDING_VIEWBOX}
            preserveAspectRatio={narrow ? 'xMidYMid slice' : 'xMaxYMax meet'}
            id="hx-scena"
            // With clickable camera points (no room for the preview) it is a group, not an image:
            // an image may not hold buttons (axe `nested-interactive`).
            role={camButtons ? 'group' : 'img'}
            aria-label={sc.aria}
          >
            {narrow ? <use href="#hx-bd" /> : null}
            <g key={scene.obj} className="hxobj">
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
                    <polygon
                      points="-12,-30 -6,-31 -2,-28 4,-31 12,-30 6,-27 -6,-27"
                      className="tcap"
                    />
                  </g>
                ))}
              </g>
              <g data-hx-building="">
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
                      <rect x="-14" y="-47" width="72" height="17" rx="8.5" className="detl" />
                      <text x="22" y="-38.5" className="dett hxlab">
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
                {sc.cones.map((f, i) => {
                  // RUNDA-V5 §1.5: the beam grows from its camera (`clip-path`), see glowna.css.
                  const o = beamOrigin(f.p)
                  return (
                    <polygon
                      key={`c${i}`}
                      points={f.p}
                      className={f.c}
                      style={{ '--ox': `${o.x}px`, '--oy': `${o.y}px` } as CSSProperties}
                    />
                  )
                })}
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
                {sc.dv.map((d, i) => (
                  <g
                    key={`${d.icon}-${d.x}-${d.y}`}
                    transform={`translate(${d.x} ${d.y})`}
                    className={d.cls}
                    style={{ '--i': i } as CSSProperties}
                    {...(d.icon === 'cam' && camButtons ? camPoint : {})}
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
                    <rect x="-20" y="-11" width="40" height="18" rx="9" />
                    <text x="0" y="2.5" className="ttag2 hxlab">
                      {tag.t}
                    </text>
                  </g>
                ))}
              </g>
            </g>
            {narrow ? <g aria-hidden="true">{flakes}</g> : null}
          </svg>
        </div>

        {pipShown ? (
          <div className={pipOpen ? 'glass pip open' : 'glass pip'} key={scene.obj + scene.mode}>
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

        {/* Below 1024 px: the „Na żywo” card of the phone layout (unchanged). */}
        <div className="glass hxstat">
          <div className="hxsh">
            <b>
              <span className="live" aria-hidden="true" />
              {t.live} · {sc.name}
            </b>
            <span>{sc.modeName}</span>
          </div>
          {/* Announced only after a touch: the autoplay would talk every 2.3 s (WCAG 2.2.2). */}
          <div className="hxl" aria-live={touched && narrow && !phone ? 'polite' : 'off'}>
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

        {/* From 1024 px: one dock at the bottom — the status line over the chips (RUNDA-V5 §1.3). */}
        <div className="glass hxdock in d5">
          <p className="hxdst" aria-live={touched && (!narrow || phone) ? 'polite' : 'off'}>
            <b>
              <span className="live" aria-hidden="true" />
              {t.live} · {sc.name} · {sc.modeName}
            </b>
            <span key={status} className="hxdtx">
              {/* NBSP: a flex item drops a leading space. */}
              {' — '}
              {status || t.empty}
            </span>
            {sc.more > 0 ? <em>+{sc.more}</em> : null}
          </p>
          <div className="hxchips" role="group" aria-label={t.chipsLabel}>
            <div className="hxcrow">
              {HERO_LAYERS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={has(k) ? 'hchip on' : 'hchip'}
                  aria-pressed={has(k)}
                  onClick={() => toggle(k)}
                >
                  <InstIcon name={t.layers[k].icon} size={16} strokeWidth={2.1} />
                  <span className="hcl">{t.layers[k].label}</span>
                  <span className="hcs" aria-hidden="true">
                    {t.layers[k].short}
                  </span>
                  <em aria-hidden="true">
                    {has(k) ? (
                      <svg viewBox="0 0 12 12" className="hchk">
                        <path d="M2.5 6.2 5 8.6 9.6 3.6" />
                      </svg>
                    ) : (
                      '+'
                    )}
                  </em>
                </button>
              ))}
            </div>
            <span className="hchipx">
              <button
                type="button"
                className="hall"
                onClick={() => touch({ layers: allOn ? [] : [...HERO_LAYERS] })}
              >
                {allOn ? t.hideAll : t.showAll}
              </button>
              <a href={planHref(scene)} className="btn hbtn-p btn-s">
                {t.planSet}
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

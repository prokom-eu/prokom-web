'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'

import { Icon } from '@/components/ui/Icon'
import type { WheelGroup, WheelItem } from '@/lib/catalog/groups'
import { plural } from '@/lib/plural'

import { nameSize, WHEEL, wheelLayout } from './wheelGeometry'

export type { WheelGroup }

type Props = {
  groups: WheelGroup[]
  /** „Kliknij dział, …” and „Zobacz plan Twojej firmy ↓” from the block (panel). */
  hint?: string | null
  planLabel?: string | null
}

/** The wheel moves on to the next department every 6.5 s (KOLO-HERO v3, runda 1411). */
const AUTO_MS = 6500

type State = {
  active: number
  /** Rotation of the highlight arc: grows or shrinks along the shortest way. */
  rot: number
  /** Restarts the 6.5 s ring from zero. */
  run: number
  /** The visitor chose a department: only then the core is announced (`aria-live`). */
  chosen: boolean
}

type Action = { type: 'pick'; index: number; angle: number; byUser: boolean }

function reducer(state: State, action: Action): State {
  const target = action.angle + 90
  const delta = ((((target - state.rot) % 360) + 540) % 360) - 180
  return {
    active: action.index,
    rot: state.rot + delta,
    run: state.run + 1,
    chosen: state.chosen || action.byUser,
  }
}

const positions = (count: number) => `${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])}`

const C = WHEEL.size / 2

/** The highlight arc centred on −90° (it is rotated to the department). */
function arcPath(half: number) {
  const at = (deg: number) => {
    const rad = (deg * Math.PI) / 180
    return `${(C + WHEEL.orbit * Math.cos(rad)).toFixed(2)} ${(C + WHEEL.orbit * Math.sin(rad)).toFixed(2)}`
  }
  const large = 2 * half > 180 ? 1 : 0
  return `M ${at(-90 - half)} A ${WHEEL.orbit} ${WHEEL.orbit} 0 ${large} 1 ${at(-90 + half)}`
}

const vars = (values: Record<string, string | number>) => values as CSSProperties

/**
 * Name of a department tab: it starts with the label seen on the wheel (WCAG 2.5.3 — „Sieć i
 * ochrona” has to be in it), then the full name when it differs, then the count.
 */
const tabName = (group: WheelGroup) =>
  `${group.label === group.name ? group.name : `${group.label} (${group.name})`}, ${positions(group.count)}`

/**
 * Department wheel of the Biznes hero (runda 1411, board `Main.dc.html`; KOLO-HERO v3 before):
 * the five departments on the inner circle, each with its three products fanned out right behind
 * it on the outer ring; the active department's products grow, take its colour, get a dashed line
 * from the icon and float. The core names the department, its three products (links to them) and
 * „Zobacz dział”. Every 6.5 s (the ring around the core, `animationend`) the next department; a
 * click on a department or on one of its products picks it and starts the 6.5 s from zero. The
 * round pause button (WCAG 2.2.2), keyboard focus inside, the wheel out of view and a hidden tab
 * stop it; reduced motion: no switching, floating or turning. One tooltip names the pointed
 * bubble.
 */
export function DepartmentWheel({ groups, hint, planLabel }: Props) {
  const layout = wheelLayout(groups.map((group) => group.items.length))
  const [state, dispatch] = useReducer(reducer, {
    active: 0,
    rot: (layout.groups[0]?.angle ?? -90) + 90,
    run: 0,
    chosen: false,
  })
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false)
  /** Out of view or in a hidden tab: nothing moves, nothing switches. */
  const [idle, setIdle] = useState(false)
  const [arrive, setArrive] = useState(true)
  const [tip, setTip] = useState<{ name: string; el: HTMLElement } | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const uid = useId()

  const pick = useCallback(
    (index: number, byUser: boolean) =>
      dispatch({ type: 'pick', index, angle: layout.groups[index]?.angle ?? -90, byUser }),
    [layout.groups],
  )

  // The arrival plays once on top of a complete first frame.
  useEffect(() => {
    const timer = window.setTimeout(() => setArrive(false), 1600)
    return () => window.clearTimeout(timer)
  }, [])

  // Auto-stop out of view (IntersectionObserver) and in a hidden tab (`visibilitychange`).
  useEffect(() => {
    const wheel = wheelRef.current
    if (!wheel) return
    let visible = true
    const update = () => setIdle(!visible || document.visibilityState === 'hidden')
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry?.isIntersecting ?? true
            update()
          })
    observer?.observe(wheel)
    document.addEventListener('visibilitychange', update)
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  // Parallax after the pointer, mouse only (CSS variables, no re-render).
  useEffect(() => {
    const wheel = wheelRef.current
    if (!wheel) return
    const fine = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    if (!fine.matches) return
    const move = (event: PointerEvent) => {
      const box = wheel.getBoundingClientRect()
      wheel.style.setProperty('--px', (((event.clientX - box.left) / box.width) * 2 - 1).toFixed(3))
      wheel.style.setProperty('--py', (((event.clientY - box.top) / box.height) * 2 - 1).toFixed(3))
    }
    const leave = () => {
      wheel.style.setProperty('--px', '0')
      wheel.style.setProperty('--py', '0')
    }
    wheel.addEventListener('pointermove', move)
    wheel.addEventListener('pointerleave', leave)
    return () => {
      wheel.removeEventListener('pointermove', move)
      wheel.removeEventListener('pointerleave', leave)
    }
  }, [])

  // Tooltip: outward from the bubble, away from the centre; kept inside the window.
  useLayoutEffect(() => {
    const wheel = wheelRef.current
    const el = tipRef.current
    if (!tip || !wheel || !el) return
    const w = wheel.getBoundingClientRect()
    const r = tip.el.getBoundingClientRect()
    const cx = r.left + r.width / 2 - w.left
    const cy = r.top + r.height / 2 - w.top
    const dx = cx - w.width / 2
    const dy = cy - w.height / 2
    const gap = 10
    const tw = el.offsetWidth
    const th = el.offsetHeight
    let x: number
    let y: number
    if (Math.abs(dx) > Math.abs(dy) * 1.2) {
      x = dx > 0 ? cx + r.width / 2 + gap : cx - r.width / 2 - gap - tw
      y = cy - th / 2
    } else {
      x = cx - tw / 2
      y = dy < 0 ? cy - r.height / 2 - gap - th : cy + r.height / 2 + gap
    }
    const minX = 8 - w.left
    const maxX = document.documentElement.clientWidth - 8 - w.left - tw
    el.style.left = `${Math.max(minX, Math.min(maxX, x))}px`
    el.style.top = `${y}px`
  }, [tip])

  const current = groups[state.active] ?? groups[0]
  if (!current) return null
  const running = !paused && !idle
  const active = layout.groups[state.active]
  // Dashed lines from the active department's icon to each of its products (board).
  const links = active
    ? active.items
        .map((at) => `M ${C + active.x} ${C + active.y} L ${C + at.x} ${C + at.y}`)
        .join(' ')
    : ''

  const onTabKey = (event: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (event.key !== 'Home' && event.key !== 'End' && !step) return
    event.preventDefault()
    const last = groups.length - 1
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? last
          : (state.active + (step ?? 0) + groups.length) % groups.length
    pick(next, true)
    tabRefs.current[next]?.focus()
  }

  const showTip = (item: WheelItem, el: HTMLElement) => setTip({ name: item.name, el })
  const tabId = (i: number) => `${uid}-tab-${i}`
  const coreId = `${uid}-core`

  return (
    <div className="flex w-full flex-col items-center gap-2.5">
      <div
        ref={wheelRef}
        className="bzw"
        data-arrive={arrive ? '' : undefined}
        data-hold={held || !running ? '' : undefined}
        style={vars({ '--tint': current.gradient[0], '--auto': `${AUTO_MS}ms` })}
        onFocus={(event) => {
          if (event.target.matches(':focus-visible')) setHeld(true)
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false)
        }}
      >
        <div className="bzw-halo" aria-hidden="true" />
        <svg className="bzw-rings" viewBox={`0 0 ${WHEEL.size} ${WHEEL.size}`} aria-hidden="true">
          <g className="bzw-turn">
            <circle className="bzw-orbit" cx={C} cy={C} r={WHEEL.orbit} />
            <circle className="bzw-spark" cx={C} cy={C - WHEEL.orbit} r={3} />
            <circle className="bzw-spark" cx={C} cy={C + WHEEL.orbit} r={2} />
          </g>
          <circle className="bzw-inner" cx={C} cy={C} r={WHEEL.node} />
          <path key={`links-${state.active}`} className="bzw-links" d={links} />
          <g className="bzw-sweep" style={{ transform: `rotate(${state.rot}deg)` }}>
            <path
              key={`arc-${state.active}-${state.run}`}
              className="bzw-arc"
              d={arcPath(layout.groups[state.active]?.arcHalf ?? 0)}
              pathLength={100}
              data-draw={state.run > 0 ? '' : undefined}
            />
          </g>
        </svg>

        {/* The bubbles are a pointer shortcut to their department: the tabs and the product
            links in the core say the same to the keyboard and screen readers (runda 1411). */}
        <ul className="bzw-bubbles" aria-hidden="true" data-bubbles>
          {groups.flatMap((group, i) =>
            group.items.map((item, k) => {
              const at = layout.groups[i]!.items[k]!
              const n = layout.groups.slice(0, i).reduce((sum, g) => sum + g.items.length, 0) + k
              return (
                <li
                  key={item.key}
                  className="bzw-at"
                  style={vars({ '--x': at.x, '--y': at.y, '--i': n })}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={`${item.name} — pokaż dział ${group.label}`}
                    onClick={() => pick(i, true)}
                    data-group={i}
                    data-on={i === state.active ? '' : undefined}
                    className="bzw-bub"
                    style={vars({
                      '--g1': group.gradient[0],
                      '--g2': group.gradient[1],
                      '--d': `${6 + (n % 5) * 0.8}s`,
                      '--dl': `${-(n * 0.9)}s`,
                    })}
                    onPointerEnter={(event) => showTip(item, event.currentTarget)}
                    onPointerLeave={() => setTip(null)}
                  >
                    <span className="bzw-bub-inner">
                      {item.image ? (
                        <>
                          <Image
                            src={item.image.url}
                            alt={item.image.alt}
                            aria-hidden
                            width={item.image.width}
                            height={item.image.height}
                            unoptimized
                          />
                          <span className="bzw-floor" aria-hidden="true" />
                        </>
                      ) : (
                        <span className="bzw-glyph">
                          <Icon name={item.icon ?? group.icon} strokeWidth={1.8} />
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            }),
          )}
        </ul>

        <div className="bzw-nodes" role="tablist" aria-label="Działy oferty" onKeyDown={onTabKey}>
          {groups.map((group, i) => {
            const at = layout.groups[i]!
            const on = i === state.active
            return (
              <button
                key={group.slug}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={tabId(i)}
                aria-selected={on}
                aria-controls={coreId}
                aria-label={tabName(group)}
                tabIndex={on ? 0 : -1}
                className="bzw-node bzw-at"
                style={vars({
                  '--x': at.x,
                  '--y': at.y,
                  '--lx': at.labelShift,
                  '--i': i,
                  '--g1': group.gradient[0],
                  '--g2': group.gradient[1],
                })}
                onClick={() => pick(i, true)}
              >
                {on && <span className="bzw-wave" aria-hidden="true" />}
                <span className="bzw-dot">
                  <Icon name={group.icon} strokeWidth={2.1} />
                </span>
                <span className="bzw-lab" aria-hidden="true">
                  {group.label}
                </span>
              </button>
            )
          })}
        </div>

        <div ref={tipRef} className="bzw-tip" data-show={tip ? '' : undefined} aria-hidden="true">
          {tip?.name} <i>→</i>
        </div>

        <div
          id={coreId}
          className="bzw-core"
          role="tabpanel"
          aria-labelledby={tabId(state.active)}
          aria-live={state.chosen ? 'polite' : undefined}
          data-surface="dark"
        >
          <svg className="bzw-ring" viewBox="0 0 214 214" aria-hidden="true">
            <circle className="bzw-track" cx="107" cy="107" r="105" />
            {running && (
              <circle
                key={state.run}
                className="bzw-prog"
                cx="107"
                cy="107"
                r="105"
                pathLength={100}
                onAnimationEnd={() => pick((state.active + 1) % groups.length, false)}
              />
            )}
          </svg>
          <div key={state.active} className="bzw-cc" data-swap={state.run > 0 ? '' : undefined}>
            <span className="bzw-k">
              Dział {state.active + 1} z {groups.length}
            </span>
            <span className="bzw-nm" style={vars({ '--fs': nameSize(current.name) })}>
              {current.name}
            </span>
            {current.items.length > 0 && (
              <ul className="bzw-names" aria-label={`Przykłady: ${current.name}`}>
                {current.items.map((item) => (
                  <li key={item.key}>
                    <Link href={item.href} prefetch={false}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href={current.href} className="bzw-cta">
              Zobacz dział
              <span className="bzw-go">
                <Icon name="arrow" strokeWidth={2.6} />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <p className="bzw-hint">
        {hint && <span>{hint}</span>}
        {hint && planLabel && <span aria-hidden="true">·</span>}
        {planLabel && <a href="#plan">{planLabel}</a>}
        {(hint || planLabel) && (
          <span aria-hidden="true" className="bzw-motion-only">
            ·
          </span>
        )}
        <button
          type="button"
          className="bzw-pause bzw-motion-only"
          aria-label={paused ? 'Wznów animację koła' : 'Wstrzymaj animację koła'}
          onClick={() => setPaused((value) => !value)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={paused ? 'M7 4l14 8-14 8z' : 'M6 4h4v16H6zM14 4h4v16h-4z'} />
          </svg>
        </button>
      </p>
    </div>
  )
}

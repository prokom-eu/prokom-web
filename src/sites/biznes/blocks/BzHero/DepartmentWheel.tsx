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

/** KOLO-HERO v3: the wheel moves on to the next department every 6.5 s. */
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
 * Department wheel of the Biznes hero (KOLO-HERO.md, wersja 3; prototype `kolo/prototyp.html`):
 * one even ring of product bubbles that does not turn, the departments in the middle of their
 * runs, the active one in the core. Every 6.5 s (the ring around the core, `animationend`) the
 * next department — also under the pointer (decision 03.11); a click starts the 6.5 s from zero.
 * Only „Wstrzymaj animację” (WCAG 2.2.2) and keyboard focus inside stop it; reduced motion: no
 * switching, floating or drift. One tooltip above the whole wheel names the pointed bubble.
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
  const running = !paused

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
        data-hold={held || paused ? '' : undefined}
        style={vars({ '--tint': current.gradient[0], '--auto': `${AUTO_MS}ms` })}
        onFocus={(event) => {
          if (event.target.matches(':focus-visible')) setHeld(true)
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false)
        }}
      >
        <div className="bzw-halo" aria-hidden="true" />
        <svg className="bzw-rings" viewBox="0 0 640 640" aria-hidden="true">
          <circle className="bzw-orbit" cx={C} cy={C} r={WHEEL.orbit} />
          <circle className="bzw-inner" cx={C} cy={C} r={180} />
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

        <ul className="bzw-bubbles" aria-label="Przykładowe produkty działów">
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
                  <Link
                    href={item.href}
                    prefetch={false}
                    aria-label={`${item.name} — ${item.key.startsWith('link:') ? 'zobacz stronę' : 'zobacz produkt'}`}
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
                    onFocus={(event) => {
                      if (event.currentTarget.matches(':focus-visible'))
                        showTip(item, event.currentTarget)
                    }}
                    onBlur={() => setTip(null)}
                  >
                    <span className="bzw-bub-inner">
                      {item.image ? (
                        <>
                          <Image
                            src={item.image.url}
                            alt=""
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
                  </Link>
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
                data-above={at.labelAbove ? '' : undefined}
                style={vars({
                  '--x': at.x,
                  '--y': at.y,
                  '--i': i,
                  '--g1': group.gradient[0],
                  '--g2': group.gradient[1],
                })}
                onClick={() => pick(i, true)}
              >
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
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? 'Wznów animację' : 'Wstrzymaj animację'}
        </button>
      </p>
    </div>
  )
}

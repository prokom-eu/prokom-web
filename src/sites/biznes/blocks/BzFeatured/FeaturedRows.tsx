'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'

import {
  activeCard,
  firstDelay,
  ROW_DIRECTIONS,
  ROW_MOVE_MS,
  ROW_STEP_MS,
  startIndex,
  stepRow,
} from './featuredRow'

export type FeaturedRow = { id: string; title: string; cards: { key: string; node: ReactNode }[] }

type Props = { rows: FeaturedRow[] }

/** Cards in view by width (board: 4 on a desktop, 2–3 on a tablet); a phone scrolls by hand. */
function perView(width: number) {
  return width >= 1080 ? 4 : width >= 900 ? 3 : 2
}

/**
 * Rows of „Najczęściej wybierane” (runda 1411 R5, board `Wybierane.dc.html`). Each row moves by ONE
 * card every 4.5 s (0.8 s, `cubic-bezier(.65,0,.35,1)`), the rows 1.5 s apart and in turns ← → ←,
 * endlessly (the cards twice, a jump back without animation at the copy). Pointer or focus in a
 * row pauses that row; „Zatrzymaj / Wznów” pauses all (WCAG 2.2.2); ‹ › move a row by hand; the
 * dots show progress (decoration). Nothing moves out of view, in a hidden tab or with reduced
 * motion; cards out of view are `inert`. Phone (below 768 px): each row is a strip to swipe
 * (`scroll-snap`), no motion and no arrows.
 */
export function FeaturedRows({ rows }: Props) {
  const count = (r: number) => rows[r]?.cards.length ?? 0
  const [index, setIndex] = useState(() =>
    rows.map((_, r) => startIndex(ROW_DIRECTIONS[r % 3] ?? 1, count(r))),
  )
  const [animated, setAnimated] = useState(() => rows.map(() => true))
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState<boolean[]>(() => rows.map(() => false))
  const [motion, setMotion] = useState(false)
  const [per, setPer] = useState(4)
  /** A desktop or tablet (rows move); before hydration and on a phone every card is reachable. */
  const [desk, setDesk] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const state = useRef({ index, held, paused, motion })
  // The timers read the latest state through the ref (set after each render, not during it).
  useEffect(() => {
    state.current = { index, held, paused, motion }
  })

  // Motion only on a desktop, in view, in a visible tab and without reduced motion.
  useEffect(() => {
    const node = root.current
    if (!node) return
    const wide = window.matchMedia('(min-width: 768px)')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    const update = () => {
      setPer(perView(window.innerWidth))
      setDesk(wide.matches)
      setMotion(visible && wide.matches && !still.matches && document.visibilityState === 'visible')
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      update()
    })
    observer.observe(node)
    document.addEventListener('visibilitychange', update)
    window.addEventListener('resize', update)
    wide.addEventListener('change', update)
    still.addEventListener('change', update)
    update()
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
      window.removeEventListener('resize', update)
      wide.removeEventListener('change', update)
      still.removeEventListener('change', update)
    }
  }, [])

  const move = useCallback(
    (r: number, direction: number) => {
      const step = stepRow(state.current.index[r] ?? 0, direction, rows[r]?.cards.length ?? 0)
      setAnimated((list) => list.map((value, i) => (i === r ? true : value)))
      setIndex((list) => list.map((value, i) => (i === r ? step.index : value)))
      if (step.resetTo !== null) {
        const to = step.resetTo
        window.setTimeout(() => {
          setAnimated((list) => list.map((value, i) => (i === r ? false : value)))
          setIndex((list) => list.map((value, i) => (i === r ? to : value)))
          window.requestAnimationFrame(() =>
            window.requestAnimationFrame(() =>
              setAnimated((list) => list.map((value, i) => (i === r ? true : value))),
            ),
          )
        }, ROW_MOVE_MS + 20)
      }
    },
    [rows],
  )

  // One clock a row: its offset first, then a step every 4.5 s while it may move.
  useEffect(() => {
    if (!motion) return
    const timers: number[] = []
    rows.forEach((_, r) => {
      const tick = () => {
        const now = state.current
        if (now.motion && !now.paused && !now.held[r]) move(r, ROW_DIRECTIONS[r % 3] ?? 1)
        timers[r] = window.setTimeout(tick, ROW_STEP_MS)
      }
      timers[r] = window.setTimeout(tick, firstDelay(r))
    })
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [motion, rows, move])

  const hold = (r: number, value: boolean) =>
    setHeld((list) => list.map((item, i) => (i === r ? value : item)))

  return (
    <div
      ref={root}
      className="mt-8 flex flex-col gap-9 max-md:mt-5 max-md:gap-6"
      data-featured-rows
    >
      <div className="-mt-2 flex justify-end max-md:hidden">
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-4 text-[14px] font-extrabold text-ink shadow-[inset_0_0_0_1px_var(--border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text motion-reduce:hidden"
          data-featured-pause
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3 fill-current">
            <path d={paused ? 'M7 4l14 8-14 8z' : 'M6 4h4v16H6zM14 4h4v16h-4z'} />
          </svg>
          {paused ? 'Wznów' : 'Zatrzymaj'}
        </button>
      </div>
      {rows.map((row, r) => {
        const n = row.cards.length
        const at = index[r] ?? 0
        const direction = ROW_DIRECTIONS[r % 3] ?? 1
        return (
          <section
            key={row.id}
            aria-labelledby={`wybierane-r${r}`}
            className="flex flex-col gap-4"
            onPointerEnter={() => hold(r, true)}
            onPointerLeave={() => hold(r, false)}
            onFocus={() => hold(r, true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) hold(r, false)
            }}
            data-featured-row={r}
          >
            <div className="flex items-center justify-between gap-4">
              <h3
                id={`wybierane-r${r}`}
                className="flex items-center gap-3 font-display text-[22px] leading-tight font-extrabold font-stretch-108% max-md:text-[18px]"
              >
                <span
                  aria-hidden="true"
                  className="grid size-[26px] place-items-center rounded-lg bg-accent-soft text-[13px] text-accent-text max-md:hidden"
                >
                  {direction > 0 ? '←' : '→'}
                </span>
                {row.title}
              </h3>
              <div className="flex items-center gap-3 max-md:hidden">
                <span aria-hidden="true" className="flex items-center gap-1.5">
                  {row.cards.map((card, k) => (
                    <span
                      key={card.key}
                      className={cx(
                        'h-1.5 rounded-full transition-[width,background-color] duration-400',
                        k === activeCard(at, n) ? 'w-[22px] bg-accent-text' : 'w-1.5 bg-border',
                      )}
                    />
                  ))}
                </span>
                {(
                  [
                    [-1, 'Poprzednie', 'M15 6l-6 6 6 6'],
                    [1, 'Następne', 'M9 6l6 6-6 6'],
                  ] as const
                ).map(([step, label, path]) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => move(r, step)}
                    aria-label={`${label}: ${row.title}`}
                    className="grid size-11 place-items-center rounded-full bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="size-4 fill-none stroke-current stroke-[2.4]"
                    >
                      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="bzf-view">
              <ul
                className="bzf-track"
                data-animated={animated[r] ? '' : undefined}
                style={{ '--i': at, '--per': per } as CSSProperties}
              >
                {[...row.cards, ...row.cards].map((card, k) => {
                  const copy = k >= n
                  const shown = k >= at && k < at + per
                  return (
                    <li
                      key={`${card.key}-${copy ? 'b' : 'a'}`}
                      className="bzf-card"
                      data-copy={copy ? '' : undefined}
                      aria-hidden={copy || undefined}
                      inert={desk ? !shown : copy}
                      data-shown={shown ? '' : undefined}
                    >
                      {card.node}
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        )
      })}
    </div>
  )
}

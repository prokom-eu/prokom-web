'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'

import { ProcIcon } from './icons'

type Step = { title: string; sub: string }

const STEP_MS = 560
const REDUCED = '(prefers-reduced-motion: reduce)'

/**
 * „Przygotowanie” (IT, ZAOPATRZENIE §5): the stage with the laptop and the progress, the steps
 * on the right. The server sends everything ticked (the content without JavaScript); when the
 * list comes into view (35%) the steps tick one by one every 560 ms, „Pokaż jeszcze raz” plays it
 * again. Reduced motion: all ticked at once, no replay.
 */
export function PrepChecklist({
  tag,
  steps,
  picture,
}: {
  tag: string
  steps: Step[]
  picture: ReactNode
}) {
  const n = steps.length
  const [done, setDone] = useState(n)
  const [current, setCurrent] = useState(-1)
  const [motion, setMotion] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const run = useRef(0)
  const timer = useRef(0)

  const play = () => {
    const id = ++run.current
    window.clearTimeout(timer.current)
    setDone(0)
    let k = 0
    const step = () => {
      if (id !== run.current || k >= n) return setCurrent(-1)
      setCurrent(k)
      timer.current = window.setTimeout(() => {
        if (id !== run.current) return
        k += 1
        setDone(k)
        step()
      }, STEP_MS)
    }
    step()
  }

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || window.matchMedia(REDUCED).matches) return
    setMotion(true)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        play()
      },
      { threshold: 0.35 },
    )
    observer.observe(stage)
    return () => {
      observer.disconnect()
      run.current += 1
      window.clearTimeout(timer.current)
    }
    // `play` only reads refs and setters: run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const percent = Math.round((done / Math.max(1, n)) * 100)
  const ready = done >= n
  const status = ready ? 'Gotowe do pracy' : `Krok ${done + 1} z ${n} · ${steps[done]?.title ?? ''}`

  return (
    <div className="zp-prep">
      <div ref={stageRef} className={cx('zp-pstage', ready && 'is-ok')}>
        <span className="zp-ptag">{tag}</span>
        <span className="zp-pdone" aria-hidden={!ready}>
          <ProcIcon name="check" />
          Gotowe do pracy
        </span>
        {picture}
        <div className="zp-pstat">
          <div className="zp-pstat-t">
            <b>{status}</b>
            <span aria-hidden="true">{percent}%</span>
          </div>
          <div
            className="zp-pbar"
            role="progressbar"
            aria-label="Przygotowanie stanowiska"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <i style={{ transform: `scaleX(${percent / 100})` }} />
          </div>
        </div>
      </div>
      <div className="zp-plist-wrap">
        <ul className="zp-plist">
          {steps.map((step, i) => (
            <li
              key={`${i}-${step.title}`}
              className={cx(i < done && 'is-ok', i === current && 'is-cur')}
            >
              <span className="zp-pbx" aria-hidden="true">
                <ProcIcon name="check" />
              </span>
              <span>
                <b>{step.title}</b>
                <span>{step.sub}</span>
              </span>
            </li>
          ))}
        </ul>
        {motion && (
          <button type="button" className="zp-replay" onClick={play}>
            <ProcIcon name="refresh" />
            Pokaż jeszcze raz
          </button>
        )}
      </div>
    </div>
  )
}

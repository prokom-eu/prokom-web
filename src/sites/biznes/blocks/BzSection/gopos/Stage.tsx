'use client'

import Image from 'next/image'
import { useEffect, useState, type CSSProperties } from 'react'

import { cx } from '@/components/ui/cx'
import { ticketStep, type GoposTicket, type StagePlacement } from '@/lib/biznes/pages/gopos'
import type { IndexImage } from '@/lib/catalog/catalogIndex'

import { goposActions, useGopos } from './store'

export type StageDevice = {
  slug: string
  label: string
  step: number
  name: string
  image: IndexImage
  /** Where the device sits in the stage and where its label hangs (data, `stagePlacement`). */
  pos: StagePlacement
  lab: StagePlacement
}

type Flow = readonly { k: string; t: string; d: string }[]

/** POPRAWKI-0311 §A: the order moves to the next device every 2.6 s. */
const STEP_MS = 2600

/**
 * The order ticket: what was ordered and four statuses — done ones amber, the current one green
 * (POPRAWKI-0311 §A, §B). `current` comes from the stage or from the venue scene's own clock.
 */
export function Ticket({
  ticket,
  title,
  current,
  className,
}: {
  ticket: GoposTicket
  title: string
  current: number
  className?: string
}) {
  return (
    <div className={cx('gps-ticket', className)}>
      <small>{title}</small>
      <p>{ticket.text}</p>
      <ol className="gps-steps">
        {ticket.statuses.map((status, i) => (
          <li
            key={status}
            data-state={i < current ? 'done' : i === current ? 'now' : undefined}
            aria-current={i === current ? 'step' : undefined}
          >
            {status}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Reduced motion, read once in the browser (the server renders the still frame). */
function useReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- once, from the media query after hydration
    setReduce(query.matches)
  }, [])
  return reduce
}

/** „Wstrzymaj animację” / „Wznów animację” (WCAG 2.2.2), the same as under the home wheel. */
export function PauseButton({
  paused,
  onToggle,
  className,
}: {
  paused: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <button type="button" className={cx('gps-pause', className)} onClick={onToggle}>
      {paused ? 'Wznów animację' : 'Wstrzymaj animację'}
    </button>
  )
}

/**
 * Stage of the GoPOS hero (POPRAWKI-0311 §A, prototype `poprawki-0311/sekcje.html` §1): the
 * devices with the GoPOS screen on, standing on a glow where the data puts them; the order
 * travels sala → kuchnia → płatność → kasa every 2.6 s, its device lit, the others dimmed, the
 * ticket following. A click on a device (or a step below) picks it and counts from zero. Up to
 * 720 px: four glass tiles in the order of the flow. Reduced motion: still, on step 1.
 */
export function GoposStage({
  devices,
  ticket,
  flow,
}: {
  devices: readonly StageDevice[]
  ticket: GoposTicket
  flow: Flow
}) {
  const { step, stepRun } = useGopos()
  const reduce = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const current = ticketStep(step)

  useEffect(() => {
    if (paused || reduce || devices.length === 0) return
    const timer = window.setTimeout(goposActions.advance, STEP_MS)
    return () => window.clearTimeout(timer)
  }, [current, stepRun, paused, reduce, devices.length])

  if (devices.length === 0) return null
  const shown = devices.slice(0, 4)
  const inOrder = [...shown].sort((a, b) => a.step - b.step)
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="gps-stage" aria-label="Droga zamówienia w GoPOS" role="group">
        <div className="gps-floor" aria-hidden="true" />
        {shown.map((device, i) => {
          const on = current === device.step
          return (
            <button
              key={device.slug}
              type="button"
              aria-pressed={on}
              data-on={on ? '' : undefined}
              onClick={() => goposActions.pickStep(device.step)}
              className="gps-dev"
              style={{ ...device.pos, zIndex: i + 1 } as CSSProperties}
            >
              <Image
                unoptimized
                src={device.image.url}
                alt=""
                width={device.image.width}
                height={device.image.height}
              />
              <span className="gps-tag" style={device.lab as CSSProperties}>
                <b>{device.step + 1}</b>
                {device.label}
                <span className="sr-only"> — {device.name}</span>
              </span>
            </button>
          )
        })}
        <Ticket
          ticket={ticket}
          title={`${ticket.label} · ${flow[current]?.k ?? ''}`}
          current={current}
          className="gps-stage-ticket"
        />
      </div>
      <ol className="gps-tiles" aria-label="Droga zamówienia w GoPOS">
        {inOrder.map((device) => (
          <li key={device.slug} className="gps-tile">
            <span className="gps-tag">
              <b>{device.step + 1}</b>
              {device.label}
            </span>
            <Image
              unoptimized
              src={device.image.url}
              alt={device.name}
              width={device.image.width}
              height={device.image.height}
            />
          </li>
        ))}
      </ol>
      <PauseButton
        paused={paused}
        onToggle={() => setPaused((value) => !value)}
        className="self-center"
      />
    </div>
  )
}

/** The 4 steps of an order under the hero: a click lights the step's device up. */
export function GoposFlow({ flow }: { flow: Flow }) {
  const { step } = useGopos()
  const current = ticketStep(step)
  return (
    // Phone (App-GoPOS): the steps two by two under the stage, the label and the step only.
    <ol className="mt-10 grid gap-3 max-md:mt-4 max-md:grid-cols-2 max-md:gap-2 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
      {flow.map((item, i) => (
        <li key={item.k}>
          <button
            type="button"
            aria-pressed={current === i}
            onClick={() => goposActions.pickStep(i)}
            className={cx(
              'flex size-full min-h-14 gap-3 rounded-2xl p-4 text-left ring-1 transition-colors ring-inset max-md:gap-2 max-md:p-2.5',
              current === i ? 'bg-white/14 ring-ok' : 'bg-white/5 ring-white/15 hover:bg-white/10',
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 font-display font-extrabold max-md:size-6 max-md:text-xs">
              {i + 1}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <em className="text-[12px] font-extrabold tracking-[0.06em] text-ok uppercase not-italic max-md:text-[10px]">
                {item.k}
              </em>
              <b className="leading-snug max-md:text-[13px]">{item.t}</b>
              <small className="text-[14px] text-white/75 max-md:hidden">{item.d}</small>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

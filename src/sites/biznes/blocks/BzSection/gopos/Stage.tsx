'use client'

import Image from 'next/image'

import { cx } from '@/components/ui/cx'
import { ticketStep, type GoposTicket } from '@/lib/biznes/pages/gopos'
import type { IndexImage } from '@/lib/catalog/catalogIndex'

import { goposActions, useGopos } from './store'

export type StageDevice = {
  slug: string
  label: string
  step: number
  name: string
  image: IndexImage
}

type Flow = readonly { k: string; t: string; d: string }[]

/** The order ticket: venue, dishes and four statuses up to the current step. */
export function Ticket({
  ticket,
  flow,
  className,
}: {
  ticket: GoposTicket
  flow: Flow
  className?: string
}) {
  const { step } = useGopos()
  const current = ticketStep(step)
  return (
    <div
      aria-live="polite"
      className={cx(
        'flex flex-col gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--surface-dark)_88%,white)] p-4 text-white shadow-[0_20px_40px_-20px_black] ring-1 ring-white/15',
        className,
      )}
    >
      <small className="text-[12px] font-extrabold tracking-[0.06em] text-white/70 uppercase">
        {ticket.label} · {flow[current]?.k}
      </small>
      <b className="leading-snug">{ticket.text}</b>
      <span className="flex flex-wrap gap-1.5">
        {ticket.statuses.map((status, i) => (
          <i
            key={status}
            className={cx(
              'rounded-full px-2.5 py-1 text-[12px] font-extrabold not-italic',
              i <= current ? 'bg-promo text-promo-ink' : 'bg-white/10 text-white/75',
            )}
          >
            {status}
          </i>
        ))}
      </span>
    </div>
  )
}

/**
 * Stage of the hero: the devices as white tiles (their photos have a white studio background),
 * the one of the picked step lit, the rest dim; the ticket under them hides below 760 px
 * (K4-FINAL §7).
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
  const { step } = useGopos()
  if (devices.length === 0) return null
  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-2 gap-3">
        {devices.slice(0, 4).map((device) => {
          const on = step === device.step
          const dim = step !== null && !on
          return (
            <li key={device.slug}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => goposActions.pickStep(device.step)}
                className={cx(
                  'relative flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-white p-4 transition-[opacity,box-shadow] duration-300 motion-reduce:transition-none',
                  on ? 'shadow-[0_0_0_3px_var(--ok)]' : 'shadow-[0_18px_40px_-24px_black]',
                  dim && 'opacity-50',
                )}
              >
                <Image
                  unoptimized
                  src={device.image.url}
                  alt=""
                  width={device.image.width}
                  height={device.image.height}
                  className="max-h-full w-auto object-contain"
                />
                <span
                  className={cx(
                    'absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-extrabold whitespace-nowrap',
                    on ? 'bg-ok text-surface-dark' : 'bg-surface-dark text-white',
                  )}
                >
                  <i className="not-italic opacity-75">{device.step + 1}</i>
                  {device.label}
                  <span className="sr-only"> — {device.name}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <Ticket ticket={ticket} flow={flow} className="hidden min-[761px]:flex" />
    </div>
  )
}

/** The 4 steps of an order under the hero: a click lights the step's device up. */
export function GoposFlow({ flow }: { flow: Flow }) {
  const { step } = useGopos()
  return (
    <ol className="mt-10 grid gap-3 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
      {flow.map((item, i) => (
        <li key={item.k}>
          <button
            type="button"
            aria-pressed={step === i}
            onClick={() => goposActions.pickStep(i)}
            className={cx(
              'flex size-full min-h-14 gap-3 rounded-2xl p-4 text-left ring-1 transition-colors ring-inset',
              step === i ? 'bg-white/14 ring-ok' : 'bg-white/5 ring-white/15 hover:bg-white/10',
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 font-display font-extrabold">
              {i + 1}
            </span>
            <span className="flex flex-col gap-0.5">
              <em className="text-[12px] font-extrabold tracking-[0.06em] text-ok uppercase not-italic">
                {item.k}
              </em>
              <b className="leading-snug">{item.t}</b>
              <small className="text-[14px] text-white/75">{item.d}</small>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

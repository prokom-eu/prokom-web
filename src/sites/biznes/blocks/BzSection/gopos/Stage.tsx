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

// Places of up to four devices on the stage (board `stage[].pos`), whole class names.
const PLACES = [
  'right-0 top-[19%] w-[44%] h-[42%] z-[1]',
  'left-[13%] top-[12%] w-[60%] h-[66%] z-[2]',
  'left-0 bottom-0 w-[30%] h-[40%] z-[3]',
  'right-[6%] bottom-0 w-[30%] h-[40%] z-[3]',
]

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
 * Stage of the hero: the devices of the venue; the one of the picked step is lit, the rest dim.
 * Below 760 px the floating ticket hides (K4-FINAL §7) and the devices stay.
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
    <div className="relative aspect-[5/4] w-full">
      <span
        aria-hidden="true"
        className="absolute inset-[8%] -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--ok)_30%,transparent),transparent)]"
      />
      {devices.slice(0, PLACES.length).map((device, i) => {
        const on = step === device.step
        const dim = step !== null && !on
        return (
          <button
            key={device.slug}
            type="button"
            aria-pressed={on}
            aria-label={`${device.label} — ${device.name}`}
            onClick={() => goposActions.pickStep(device.step)}
            className={cx(
              'absolute flex items-center justify-center rounded-2xl transition-[opacity,scale] duration-300 motion-reduce:transition-none',
              PLACES[i],
              on && 'scale-[1.04]',
              dim && 'opacity-45',
            )}
          >
            <Image
              unoptimized
              src={device.image.url}
              alt=""
              width={device.image.width}
              height={device.image.height}
              className="max-h-full w-auto object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.45)]"
            />
            <span
              className={cx(
                'absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-extrabold whitespace-nowrap',
                on ? 'bg-ok text-surface-dark' : 'bg-white/12 text-white',
              )}
            >
              <i className="not-italic opacity-75">{device.step + 1}</i>
              {device.label}
            </span>
          </button>
        )
      })}
      <Ticket
        ticket={ticket}
        flow={flow}
        className="absolute bottom-[6%] left-[2%] z-[4] hidden w-[46%] min-[761px]:flex"
      />
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

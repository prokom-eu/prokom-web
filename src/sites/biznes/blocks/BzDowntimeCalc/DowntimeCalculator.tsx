'use client'

import Link from 'next/link'
import { useId, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import {
  DOWNTIME_DEFAULTS,
  HOURS_OPTIONS,
  OUTAGES,
  REVENUE_RANGE,
  downtimeCost,
  formatZl,
  revenueShare,
  type Outage,
} from '@/lib/biznes/downtime'

type Props = {
  kicker?: string | null
  title: string
  text?: string | null
  revenueLabel: string
  hoursLabel: string
  outageLabel: string
  resultKicker?: string | null
  cta?: { label: string; href: string } | null
  note?: string | null
}

const CHIP =
  'relative inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-surface-2 px-3.5 font-bold text-ink shadow-[inset_0_0_0_1px_var(--border)] transition-colors has-checked:bg-accent-text has-checked:text-accent-ink has-checked:shadow-[0_10px_20px_-10px_var(--accent-text)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-text'

/** One question with chips: a radio group (arrow keys move, a real form control). */
function ChipGroup<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string
  name: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2.5 font-bold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className={CHIP}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              // Over the whole chip: clicks and focus land on the real control.
              className="absolute inset-0 size-full cursor-pointer appearance-none rounded-xl opacity-0"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/**
 * The calculator island (plansza Dzial): revenue slider, working hours, outage length → the
 * cost of one failure. Counted in the browser (`lib/biznes/downtime.ts`); nothing is sent.
 */
export function DowntimeCalculator(props: Props) {
  const id = useId()
  const [revenue, setRevenue] = useState(DOWNTIME_DEFAULTS.revenue)
  const [hoursPerDay, setHoursPerDay] = useState(DOWNTIME_DEFAULTS.hoursPerDay)
  const [outage, setOutage] = useState<Outage>(DOWNTIME_DEFAULTS.outage)
  const { perHour, total } = downtimeCost({ revenue, hoursPerDay, outage })
  const phrase = OUTAGES.find((option) => option.value === outage)?.phrase ?? ''
  const share = revenueShare(revenue)
  // Bar of the result: full at 60 000 zł, as on the board.
  const bar = Math.min(100, (total / 60_000) * 100)

  return (
    <div className="grid overflow-hidden rounded-[30px] bg-card shadow-[0_40px_80px_-50px_var(--glow),inset_0_0_0_1px_var(--border)] min-[1000px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div>
          {props.kicker && (
            <p className="text-[13px] font-extrabold tracking-[0.1em] text-warn uppercase">
              {props.kicker}
            </p>
          )}
          <h3 className="mt-1.5 font-display text-[clamp(1.4rem,2.2vw,1.8rem)] leading-tight font-extrabold text-ink">
            {props.title}
          </h3>
          {props.text && <p className="mt-2 leading-relaxed text-ink-2">{props.text}</p>}
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor={`${id}-revenue`} className="font-bold text-ink">
              {props.revenueLabel}
            </label>
            <output
              htmlFor={`${id}-revenue`}
              className="font-display text-xl font-extrabold text-accent-text"
            >
              {formatZl(revenue)} zł
            </output>
          </div>
          <input
            id={`${id}-revenue`}
            type="range"
            min={REVENUE_RANGE.min}
            max={REVENUE_RANGE.max}
            step={REVENUE_RANGE.step}
            value={revenue}
            aria-valuetext={`${formatZl(revenue)} zł`}
            onChange={(event) => setRevenue(Number(event.target.value))}
            style={{
              background: `linear-gradient(to right, var(--accent-text) ${share}%, var(--surface-2) ${share}%)`,
            }}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full accent-accent-text [&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-accent-text [&::-moz-range-thumb]:bg-card [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-accent-text [&::-webkit-slider-thumb]:bg-card"
          />
          <div aria-hidden="true" className="mt-2 flex justify-between text-xs text-ink-3">
            <span>{formatZl(REVENUE_RANGE.min)} zł</span>
            <span>{formatZl(REVENUE_RANGE.max / 2)} zł</span>
            <span>{formatZl(REVENUE_RANGE.max)} zł</span>
          </div>
        </div>

        <ChipGroup
          legend={props.hoursLabel}
          name={`${id}-hours`}
          options={HOURS_OPTIONS.map((hours) => ({ value: hours, label: `${hours} h` }))}
          value={hoursPerDay}
          onChange={setHoursPerDay}
        />
        <ChipGroup
          legend={props.outageLabel}
          name={`${id}-outage`}
          options={OUTAGES}
          value={outage}
          onChange={setOutage}
        />
      </div>

      <div
        data-surface="dark"
        className="flex flex-col gap-5 bg-surface-dark bg-[radial-gradient(ellipse_at_100%_0%,color-mix(in_srgb,var(--tone-red)_30%,transparent),transparent_60%)] p-6 text-white sm:p-8"
      >
        {props.resultKicker && (
          <p className="text-[13px] font-extrabold tracking-[0.1em] text-white/80 uppercase">
            {props.resultKicker}
          </p>
        )}
        {/* Only the sentence is announced: it has both amounts, the big number would repeat them. */}
        <div data-testid="downtime-result">
          <p
            aria-hidden="true"
            className="font-display text-[clamp(3rem,6vw,4.6rem)] leading-none font-extrabold tabular-nums"
          >
            {formatZl(total)} <span className="text-2xl">zł</span>
          </p>
          <span aria-hidden="true" className="mt-5 block h-1.5 rounded-full bg-white/15">
            <span
              style={{ width: `${bar}%` }}
              className="block h-full rounded-full bg-tone-red transition-[width] duration-500 motion-reduce:transition-none"
            />
          </span>
          <p aria-live="polite" className="mt-5 leading-relaxed text-white/85">
            Godzina bez sprzedaży to u Ciebie ok.{' '}
            <b className="text-white">{formatZl(perHour)} zł</b>. {phrase} przestoju — ok.{' '}
            <b className="text-white">{formatZl(total)} zł</b>, nie licząc klientów, którzy już nie
            wrócą.
          </p>
        </div>
        {props.cta && (
          <Link
            href={props.cta.href}
            className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-ok-text px-5 text-center font-extrabold text-surface transition-colors hover:bg-white hover:text-surface-dark"
          >
            {props.cta.label}
            <Icon name="arrow" strokeWidth={2.4} className="size-[18px] shrink-0" />
          </Link>
        )}
        {props.note && (
          <p className="mt-auto text-xs leading-relaxed text-white/70">{props.note}</p>
        )}
      </div>
    </div>
  )
}

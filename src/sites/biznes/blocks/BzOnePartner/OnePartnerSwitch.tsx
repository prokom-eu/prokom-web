'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { brandAsset, HORIZONTAL_LOGO_SIZE } from '@/lib/brand/lines'
import type { IconName } from '@/lib/catalog/options'
import { plural } from '@/lib/plural'

type Mode = 'separate' | 'one'

export type OnePartnerData = {
  separateLabel: string
  oneLabel: string
  separateTag: string | null
  oneTag: string | null
  rows: { label: string; icon: IconName; separate: string; one: string }[]
  cta: { label: string; href: string }
  phone: string | null
  tel: string | null
  mock: {
    groupLabel: string | null
    proNote: string | null
    watchLabel: string | null
    contacts: { name: string; note: string | null }[]
    chips: string[]
    watch: { label: string; value: string; tone: 'ok' | 'accent' | 'warn' }[]
  }
  separateBubbles: string[]
  oneBubbles: string[]
}

/** Board: the switch flips by itself every 6.5 s until the visitor uses it. */
const AUTO_MS = 6500

const DOT = { ok: 'bg-ok', accent: 'bg-accent', warn: 'bg-promo' } as const

// Speech bubbles around the phone (board positions, shortened).
const BUBBLE_SPOT = [
  'top-0 right-0',
  'top-[34%] left-0 max-sm:hidden',
  'bottom-[18%] right-0 max-sm:hidden',
  'bottom-0 left-2 max-sm:hidden',
]

function Phone({ mode, data }: { mode: Mode; data: OnePartnerData }) {
  const { mock } = data
  const one = mode === 'one'
  const count = one ? 1 : mock.contacts.length
  return (
    <div className="relative mx-auto w-[min(330px,86%)] rounded-[44px] bg-surface-dark p-2.5 shadow-[0_40px_80px_-30px_var(--glow),inset_0_0_0_1.5px_color-mix(in_srgb,var(--c-white)_14%,transparent)] min-[640px]:w-[330px]">
      <div className="min-h-[470px] rounded-[36px] bg-white px-4 pt-3 pb-5 text-surface-dark">
        {/* Look of a phone only: screen readers skip the status bar and the fake search. */}
        <div aria-hidden="true" className="flex items-center justify-between text-xs font-bold">
          <span>9:41</span>
          <span aria-hidden="true" className="h-6 w-24 rounded-full bg-surface-dark" />
          <span aria-hidden="true">5G</span>
        </div>
        <p className="mt-3 font-display text-[26px] font-extrabold">Kontakty</p>
        <div
          aria-hidden="true"
          className="mt-2 flex h-9 items-center gap-2 rounded-xl bg-surface-dark/5 px-3 text-sm text-surface-dark/70"
        >
          <Icon name="q" className="size-4" />
          Szukaj
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] font-extrabold tracking-[0.08em] text-surface-dark/70 uppercase">
          <span>{mock.groupLabel}</span>
          <span>
            {count} {plural(count, ['kontakt', 'kontakty', 'kontaktów'])}
          </span>
        </div>
        {one ? (
          <div className="mt-2 rounded-2xl p-1">
            <div className="flex items-center gap-3 border-b border-surface-dark/10 pb-3">
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-full bg-accent-text text-accent-ink"
              >
                <Icon name="shield" className="size-5" />
              </span>
              <span className="flex flex-col">
                <Image
                  src={brandAsset('biznes', 'poziome_kolor.svg')}
                  alt="PRO-KOM Biznes"
                  {...HORIZONTAL_LOGO_SIZE}
                  className="h-5 w-auto self-start"
                />
                {mock.proNote && (
                  <span className="text-xs text-surface-dark/70">{mock.proNote}</span>
                )}
              </span>
            </div>
            {mock.chips.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {mock.chips.map((chip) => (
                  <li
                    key={chip}
                    // The phone screen is light in both themes: navy on a light tint, not theme tokens.
                    className="rounded-lg bg-surface-dark/5 px-2 py-1 text-[11.5px] font-bold text-surface-dark"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            )}
            {data.phone && data.tel && (
              <a
                href={data.tel}
                className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-tone-green-tag font-extrabold text-white"
              >
                <Icon name="phone" className="size-4" />
                {data.phone}
              </a>
            )}
            {mock.watch.length > 0 && (
              <div className="mt-3">
                {mock.watchLabel && (
                  <p className="text-[10.5px] font-extrabold tracking-[0.1em] text-surface-dark/70 uppercase">
                    {mock.watchLabel}
                  </p>
                )}
                <ul className="mt-1">
                  {mock.watch.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-center justify-between gap-2 border-t border-surface-dark/10 py-2 text-[13px]"
                    >
                      <span className="flex items-center gap-2 font-bold">
                        <span
                          aria-hidden="true"
                          className={cx('size-2 rounded-full', DOT[row.tone])}
                        />
                        {row.label}
                      </span>
                      <span className="text-xs text-surface-dark/70">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <ul className="mt-2">
            {mock.contacts.map((contact) => (
              <li
                key={contact.name}
                className="flex items-center gap-3 border-b border-surface-dark/10 py-2.5"
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-dark/10 text-sm font-extrabold"
                >
                  {contact.name.charAt(0)}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-extrabold">{contact.name}</span>
                  {contact.note && (
                    <span className="truncate text-xs text-surface-dark/70">{contact.note}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/**
 * The interactive part of „Pięć firm czy jedna” (spec. §4 pkt 8): the switch, the rows, the
 * phone and the bubbles share one state. Pointer or focus inside pauses the automatic flip
 * (WCAG 2.2.2); `prefers-reduced-motion` turns it off.
 */
export function OnePartnerSwitch({ header, data }: { header: ReactNode; data: OnePartnerData }) {
  const [mode, setMode] = useState<Mode>('separate')
  const [picked, setPicked] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (picked || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(
      () => setMode((current) => (current === 'one' ? 'separate' : 'one')),
      AUTO_MS,
    )
    return () => window.clearInterval(timer)
  }, [picked, paused])

  const one = mode === 'one'
  const choose = (next: Mode) => {
    setPicked(true)
    setMode(next)
  }
  const bubbles = one ? data.oneBubbles : data.separateBubbles

  return (
    <div
      className="grid items-center gap-10 min-[1080px]:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
    >
      <div className="flex flex-col gap-6">
        {header}
        <div
          role="group"
          aria-label="Porównaj"
          className="grid grid-cols-2 gap-1 self-start rounded-full bg-white/5 p-1.5 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_12%,transparent)]"
        >
          {(['separate', 'one'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => choose(value)}
              className={cx(
                'min-h-11 rounded-full px-5 py-2 text-[15px] font-extrabold transition-colors',
                mode === value
                  ? 'bg-accent-text text-accent-ink'
                  : 'text-white/80 hover:text-white',
              )}
            >
              {value === 'one' ? data.oneLabel : data.separateLabel}
            </button>
          ))}
        </div>
        {data.rows.length > 0 && (
          <ul className="grid grid-cols-2 gap-2 min-[640px]:grid-cols-1">
            {data.rows.map((row) => {
              const tag = one ? data.oneTag : data.separateTag
              return (
                <li
                  key={row.label}
                  className="flex items-start gap-3 rounded-2xl bg-white/5 px-3.5 py-3 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_10%,transparent)]"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-text text-accent-ink"
                  >
                    <Icon name={row.icon} className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[12.5px] font-extrabold tracking-[0.08em] text-white uppercase">
                        {row.label}
                      </span>
                      {tag && (
                        <span
                          className={cx(
                            'rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] font-extrabold tracking-[0.08em] uppercase max-[639px]:hidden',
                            one ? 'text-tone-green-2' : 'text-tone-red-2',
                          )}
                        >
                          {tag}
                        </span>
                      )}
                    </span>
                    <span className="text-[14.5px] leading-snug text-white/80 max-[639px]:hidden">
                      {one ? row.one : row.separate}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        <div className="flex flex-wrap gap-3">
          <Link
            href={data.cta.href}
            className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-white px-6 font-extrabold text-surface-dark hover:underline max-[639px]:w-full"
          >
            {data.cta.label}
          </Link>
          {data.phone && data.tel && (
            <a
              href={data.tel}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl px-6 font-extrabold text-white shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--c-white)_35%,transparent)] hover:bg-white/10 max-[639px]:w-full"
            >
              <Icon name="phone" className="size-[18px]" />
              {data.phone}
            </a>
          )}
        </div>
      </div>

      <div className="relative py-4">
        <Phone mode={mode} data={data} />
        {bubbles.map((text, i) => (
          <p
            key={`${mode}-${text}`}
            aria-hidden="true"
            className={cx(
              'absolute z-[2] inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold shadow-[0_14px_30px_-14px_var(--glow)]',
              one ? 'bg-surface-dark text-tone-green-2' : 'bg-white text-surface-dark',
              BUBBLE_SPOT[i],
            )}
          >
            {one && <Icon name="check" strokeWidth={2.4} className="size-3.5" />}
            {text}
          </p>
        ))}
      </div>
    </div>
  )
}

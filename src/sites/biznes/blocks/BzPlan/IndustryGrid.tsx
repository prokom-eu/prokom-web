'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'

type Props = {
  visible: { key: string; node: ReactNode }[]
  hidden: { key: string; node: ReactNode }[]
  moreLabel: string
  moreNote: string | null
}

/** Board: 5 tiles and „Pokaż wszystkie” on a phone, 11 and the tile on larger screens (v150). */
const PHONE_VISIBLE = 5

/**
 * Grid of industries (spec. §4 pkt 6): the tiles shown at once, then a tile that unfolds the rest
 * in place. The tiles themselves are rendered on the server; focus moves to the first new one.
 */
export function IndustryGrid({ visible, hidden, moreLabel, moreNote }: Props) {
  const [open, setOpen] = useState(false)
  // First tile that appears: on a phone the 6th shown one, elsewhere the first of the rest.
  const firstOnPhone = useRef<HTMLLIElement>(null)
  const firstHidden = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (!open) return
    const phone = window.matchMedia('(max-width: 639px)').matches
    const target = (phone && firstOnPhone.current) || firstHidden.current
    target?.querySelector('a')?.focus()
  }, [open])

  return (
    <ul className="grid grid-cols-2 gap-3 min-[640px]:grid-cols-3 min-[1080px]:grid-cols-4 min-[1240px]:grid-cols-6">
      {visible.map((item, i) => (
        <li
          key={item.key}
          ref={i === PHONE_VISIBLE ? firstOnPhone : undefined}
          className={cx('flex', !open && i >= PHONE_VISIBLE && 'max-[639px]:hidden')}
        >
          {item.node}
        </li>
      ))}
      {open ? (
        hidden.map((item, i) => (
          <li key={item.key} ref={i === 0 ? firstHidden : undefined} className="flex">
            {item.node}
          </li>
        ))
      ) : hidden.length > 0 || visible.length > PHONE_VISIBLE ? (
        // Nothing left beyond the phone's 5 shown tiles: the unfold tile is for phones only.
        <li className={cx('flex', hidden.length === 0 && 'min-[640px]:hidden')}>
          <button
            type="button"
            aria-expanded={false}
            onClick={() => setOpen(true)}
            data-surface="dark"
            className="flex w-full flex-col items-start gap-3 rounded-[22px] bg-linear-145 from-surface-dark to-[color-mix(in_srgb,var(--accent)_35%,var(--surface-dark))] p-4 text-left text-white transition-shadow hover:shadow-[0_20px_40px_-22px_var(--glow)]"
          >
            <span
              aria-hidden="true"
              className="flex size-11 items-center justify-center rounded-[14px] bg-white/15"
            >
              <Icon name="grid" className="size-[22px]" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="font-display text-[16px] leading-tight font-extrabold text-white">
                {moreLabel}
              </span>
              {moreNote && <span className="text-[13px] text-white">{moreNote}</span>}
            </span>
            <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-extrabold text-white">
              Rozwiń listę
              <Icon name="arrow" strokeWidth={2.4} className="size-3.5 rotate-90" />
            </span>
          </button>
        </li>
      ) : null}
    </ul>
  )
}

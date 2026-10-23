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

/** Board: 5 tiles and „Pokaż wszystkie” on a phone, 9 and the tile on larger screens. */
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
    <ul className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-3 min-[1080px]:grid-cols-5">
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
            className="flex w-full flex-col items-start gap-3 rounded-[22px] bg-card p-4 text-left shadow-[inset_0_0_0_1.5px_var(--accent-text)] transition-shadow hover:shadow-[0_20px_40px_-26px_var(--glow),inset_0_0_0_1.5px_var(--accent-text)] sm:p-5"
          >
            <span
              aria-hidden="true"
              className="flex size-[52px] items-center justify-center rounded-2xl bg-accent-text text-accent-ink"
            >
              <Icon name="arrow" className="size-6 rotate-90" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="font-display text-[17px] leading-tight font-extrabold text-accent-text">
                {moreLabel}
              </span>
              {moreNote && <span className="text-[13.5px] text-ink-2">{moreNote}</span>}
            </span>
          </button>
        </li>
      ) : null}
    </ul>
  )
}

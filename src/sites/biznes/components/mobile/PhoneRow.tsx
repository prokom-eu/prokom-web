'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'

/**
 * Cards in a row that scrolls sideways below 768 px (D12, plan 0611 §5.3 „Rząd przewijany”): cards
 * at ~78% width so the next one peeks out, 16 px inset with matching scroll padding, and a thin
 * progress line under the row. From 768 px it is the plain grid of `className`. Items: `PHONE_ROW_ITEM`.
 */
export const PHONE_ROW_ITEM = 'max-md:w-[78%] max-md:shrink-0 max-md:snap-start'

export function PhoneRow({ className, children }: { className: string; children: ReactNode }) {
  const list = useRef<HTMLUListElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const row = list.current
    if (!row) return
    const update = () => {
      const room = row.scrollWidth - row.clientWidth
      setProgress(room > 0 ? row.scrollLeft / room : 0)
    }
    update()
    row.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      row.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <>
      <ul
        ref={list}
        className={cx(
          className,
          'max-md:-mx-4 max-md:-my-2 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:scroll-px-4 max-md:gap-3 max-md:overflow-x-auto max-md:px-4 max-md:py-2 max-md:[scrollbar-width:none]',
        )}
      >
        {children}
      </ul>
      <div
        aria-hidden="true"
        className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2 md:hidden"
      >
        <div
          className="h-full w-1/4 rounded-full bg-accent-text"
          style={{ transform: `translateX(${progress * 300}%)` }}
        />
      </div>
    </>
  )
}

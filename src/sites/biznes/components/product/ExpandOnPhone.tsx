'use client'

import { type ReactNode, useEffect, useId, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'

/** Folded height (22rem) plus a margin: text only a little longer stays whole. */
const FOLD_PX = 352
const MARGIN_PX = 96

/**
 * Long text folded on a phone (board App-Produkt: „Opis” is short there) with „Czytaj cały
 * opis”. It folds only once measured as long (`ResizeObserver`), so a short text and a page
 * without JavaScript stay whole; focus inside (a link in the hidden part) unfolds it. From 768 px
 * it is never folded.
 */
export function ExpandOnPhone({ children, label }: { children: ReactNode; label: string }) {
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [long, setLong] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    // The observer reports the size once on `observe`, then on every change (fonts, width).
    const observer = new ResizeObserver(() => setLong(element.scrollHeight > FOLD_PX + MARGIN_PX))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const folded = long && !open
  return (
    <>
      <div
        ref={ref}
        id={id}
        onFocus={() => setOpen(true)}
        className={cx(
          folded &&
            'max-md:relative max-md:max-h-[22rem] max-md:overflow-hidden max-md:after:absolute max-md:after:inset-x-0 max-md:after:bottom-0 max-md:after:h-20 max-md:after:bg-linear-to-b max-md:after:from-transparent max-md:after:to-surface',
        )}
      >
        {children}
      </div>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
          className="mt-3 inline-flex min-h-11 items-center font-extrabold text-accent-text md:hidden"
        >
          {open ? 'Zwiń opis' : label}
        </button>
      )}
    </>
  )
}

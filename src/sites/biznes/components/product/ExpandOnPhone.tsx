'use client'

import { type ReactNode, useId, useState, useSyncExternalStore } from 'react'

import { cx } from '@/components/ui/cx'

const noSubscription = () => () => {}

/**
 * Long text folded on a phone (board App-Produkt: „Opis” is short there) with „Czytaj cały
 * opis”. It folds only once hydrated, so without JavaScript the whole text stays readable; from
 * 768 px it is never folded.
 */
export function ExpandOnPhone({ children, label }: { children: ReactNode; label: string }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  )
  const folded = hydrated && !open
  return (
    <>
      <div
        id={id}
        className={cx(
          folded &&
            'max-md:relative max-md:max-h-[22rem] max-md:overflow-hidden max-md:after:absolute max-md:after:inset-x-0 max-md:after:bottom-0 max-md:after:h-20 max-md:after:bg-linear-to-b max-md:after:from-transparent max-md:after:to-surface',
        )}
      >
        {children}
      </div>
      {hydrated && (
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

'use client'

import { type ReactNode, useState } from 'react'

type Props = { className: string; more: string; less: string; children: ReactNode }

/**
 * A grid cut on a phone (CSS hides the cards past the first ones) with the prototype's
 * „Pokaż wszystkie…” button (`.mobmore`, phone only). The cards stay in the HTML.
 */
export function ShowAll({ className, more, less, children }: Props) {
  const [all, setAll] = useState(false)
  return (
    <>
      <div className={`${className}${all ? ' all' : ''}`}>{children}</div>
      <button
        type="button"
        className="btn btn-g mobmore"
        aria-expanded={all}
        onClick={() => setAll((value) => !value)}
      >
        {all ? less : more}
      </button>
    </>
  )
}

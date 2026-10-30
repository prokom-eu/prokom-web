'use client'

import { type CSSProperties, type FocusEvent, type ReactNode, useRef, useState } from 'react'

import { useReveal } from './useReveal'

type Props = {
  /** Section id = the prototype's id (anchors, `porownaj.mjs`). */
  id: string
  /** Entry animation of the `.ri` children (`data-rv`); off for static sections. */
  reveal?: boolean
  /** Folded on a phone (≤ 700 px) with a „Pokaż całą sekcję” button (`zrodlo/fold.json`). */
  fold?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/**
 * A section of an Instalacje page. Its content is rendered on the server and stays in the HTML
 * when folded (SEO §2.1): the fold only limits the height with CSS.
 */
export function InstSection({
  id,
  reveal = true,
  fold = false,
  className,
  style,
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const on = useReveal(ref)
  const [open, setOpen] = useState(false)
  const classes = [reveal ? `rv${on ? ' on' : ''}` : '', className ?? ''].join(' ').trim()
  // Keyboard focus inside the folded part would be hidden under the mask: unfold first.
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (fold && !open && !(event.target as HTMLElement).classList.contains('foldb')) setOpen(true)
  }

  return (
    <section
      ref={ref}
      id={id}
      className={classes || undefined}
      data-rv={reveal ? id : undefined}
      data-fo={fold ? (open ? '1' : '0') : undefined}
      style={style}
      onFocus={fold ? onFocus : undefined}
    >
      {children}
      {fold && (
        <button
          type="button"
          className="foldb"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span>{open ? 'Zwiń sekcję' : 'Pokaż całą sekcję'}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </section>
  )
}

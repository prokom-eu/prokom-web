'use client'

import {
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

import { FOLD_HIT, foldHitBox } from './foldHit'
import { useReveal } from './useReveal'

/** Controls a tap can hit in the folded part (the fold's own button aside). */
const CONTROLS =
  'a[href], button:not(.foldb), summary, input, select, textarea, [tabindex]:not([tabindex="-1"])'

type Props = {
  /** Section id = the prototype's id (anchors, `porownaj.mjs`). */
  id: string
  /** Entry animation of the `.ri` children (`data-rv`); off for static sections. */
  reveal?: boolean
  /** Folded on a phone (≤ 700 px) with a „Pokaż całą sekcję” button (`zrodlo/fold.json`). */
  fold?: boolean
  /** Height of the folded part (`zrodlo/fold.json` „id:900”, the prototype's `--fmh`; default 640). */
  foldHeight?: number
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
  foldHeight,
  className,
  style,
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const on = useReveal(ref)
  const [open, setOpen] = useState(false)
  const [hit, setHit] = useState<{ above: number; below: number } | null>(null)
  // The faded edge's tap zone grows over a control that would otherwise stay as a sliver.
  useEffect(() => {
    const section = ref.current
    if (!fold || open || !section || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      const button = section.querySelector('.foldb')
      if (!button || getComputedStyle(button).display === 'none') return
      const { top: edge, height } = button.getBoundingClientRect()
      const end = section.getBoundingClientRect().bottom - edge
      const controls = [...section.querySelectorAll(CONTROLS)].map((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top - edge, bottom: r.bottom - edge }
      })
      const box = foldHitBox(controls, height, end)
      const plain = box.above === FOLD_HIT && box.below === 0
      setHit((prev) =>
        plain ? null : prev?.above === box.above && prev.below === box.below ? prev : box,
      )
    }
    const ro = new ResizeObserver(measure)
    ro.observe(section)
    // The folded part keeps its height; a change inside it (a widget's tab, an image) does not.
    section.querySelectorAll(':scope > .wrap > *').forEach((child) => ro.observe(child))
    // The rise-in of the content (`.ri`) moves the controls after the first measure.
    section.addEventListener('transitionend', measure)
    section.addEventListener('animationend', measure)
    return () => {
      ro.disconnect()
      section.removeEventListener('transitionend', measure)
      section.removeEventListener('animationend', measure)
    }
  }, [fold, open])
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
      style={foldHeight ? ({ ...style, '--fmh': `${foldHeight}px` } as CSSProperties) : style}
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
          {/* The faded edge above the button, part of it (CSS: folded only). */}
          <span
            className="foldhit"
            aria-hidden="true"
            style={
              hit ? { top: -hit.above, bottom: 'auto', height: hit.above + hit.below } : undefined
            }
          />
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

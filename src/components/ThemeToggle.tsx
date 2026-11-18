'use client'

import { type RefObject, useLayoutEffect, useRef, useState } from 'react'

import { centreOf, revealTheme } from '@/lib/motion/themeReveal'

import { useTheme } from './useTheme'

/**
 * Theme button with the action as its label (ADR-028, MOTYW-PASEK-LINII §1): „Ciemny motyw” while
 * the page is light, „Jasny motyw” while it is dark. Render it only on lines with a dark design
 * (ADR-013). Both labels and both icons are in the HTML and CSS (`wspolne.css` `.theme-toggle`)
 * shows the right one from `html[data-theme]`, set before the first paint — never a wrong label
 * until hydration. The label says the action, so there is no `aria-pressed` (spec §1).
 * In a capsule without room for the label (1081–1359 px, or a full capsule) only the icon shows;
 * the label stays the accessible name.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme()
  const [announcement, setAnnouncement] = useState('')
  const button = useRef<HTMLButtonElement>(null)
  useCompactWhenCramped(button)
  return (
    <>
      <button
        ref={button}
        type="button"
        data-theme-toggle=""
        onClick={(event) => {
          const next = theme === 'dark' ? 'light' : 'dark'
          revealTheme(next, setTheme, centreOf(event.currentTarget))
          setAnnouncement(themeAnnouncement(next))
        }}
        className={`theme-toggle ${className ?? ''}`}
      >
        <ThemeIcons />
        <span className="theme-toggle__labels">
          <span className="theme-toggle__label" data-to="dark">
            Ciemny motyw
          </span>
          <span className="theme-toggle__label" data-to="light">
            Jasny motyw
          </span>
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </>
  )
}

/**
 * Icon only while the header capsule overflows (`data-compact`): from 1360 px the label fits
 * unless the line's capsule is full (Software with „Twój projekt”, which appears after hydration).
 * Measured on every size change of the capsule and of its buttons; the cramped 1081–1359 px case
 * is pure CSS, so there is no jump on load there.
 */
function useCompactWhenCramped(ref: RefObject<HTMLButtonElement | null>) {
  useLayoutEffect(() => {
    const button = ref.current
    const capsule = button?.closest<HTMLElement>('.cap')
    if (!button || !capsule) return
    // Free room of the capsule's row: inner width minus its in-flow items and gaps (`scrollWidth`
    // would count the absolutely placed mega menus too).
    const free = () => {
      const style = getComputedStyle(capsule)
      const items = [...capsule.children].filter((el) => {
        const s = getComputedStyle(el)
        return s.display !== 'none' && s.position !== 'absolute' && s.position !== 'fixed'
      })
      const used = items.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0)
      const inner =
        capsule.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      return inner - used - (parseFloat(style.columnGap) || 0) * (items.length - 1)
    }
    const fit = () => {
      button.removeAttribute('data-compact')
      if (free() < 0) button.setAttribute('data-compact', '')
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(capsule)
    if (button.parentElement) observer.observe(button.parentElement)
    return () => observer.disconnect()
  }, [ref])
}

/** What the `aria-live` region says after a switch (spec §1 „Dostępność”). */
export function themeAnnouncement(theme: 'light' | 'dark'): string {
  return theme === 'dark' ? 'Włączono ciemny motyw.' : 'Włączono jasny motyw.'
}

/** Moon (switch to dark) and sun (switch to light); CSS shows one, as with the labels. */
export function ThemeIcons() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="theme-toggle__icon"
    >
      <g data-to="dark">
        <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" />
      </g>
      <g data-to="light">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </g>
    </svg>
  )
}

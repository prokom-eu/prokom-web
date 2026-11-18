'use client'

import { useState } from 'react'

import { centreOf, revealTheme } from '@/lib/motion/themeReveal'

import { useTheme } from './useTheme'

/**
 * Theme button with the action as its label (ADR-028, MOTYW-PASEK-LINII §1): „Ciemny motyw” while
 * the page is light, „Jasny motyw” while it is dark. Render it only on lines with a dark design
 * (ADR-013). Both labels and both icons are in the HTML and CSS (`wspolne.css` `.theme-toggle`)
 * shows the right one from `html[data-theme]`, set before the first paint — never a wrong label
 * until hydration. The label says the action, so there is no `aria-pressed` (spec §1).
 * In the cramped capsule the word „motyw” is only visually hidden, so the name stays whole.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme()
  const [announcement, setAnnouncement] = useState('')
  return (
    <>
      <button
        type="button"
        data-theme-toggle=""
        onClick={(event) => {
          const next = theme === 'dark' ? 'light' : 'dark'
          revealTheme(next, setTheme, centreOf(event.currentTarget))
          setAnnouncement(next === 'dark' ? 'Włączono ciemny motyw.' : 'Włączono jasny motyw.')
        }}
        className={`theme-toggle ${className ?? ''}`}
      >
        <ThemeIcons />
        <span className="theme-toggle__labels">
          <span className="theme-toggle__label" data-to="dark">
            Ciemny<span className="theme-toggle__word"> motyw</span>
          </span>
          <span className="theme-toggle__label" data-to="light">
            Jasny<span className="theme-toggle__word"> motyw</span>
          </span>
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </>
  )
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

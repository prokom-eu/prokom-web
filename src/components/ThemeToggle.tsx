'use client'

import { centreOf, revealTheme } from '@/lib/motion/themeReveal'

import { useTheme } from './useTheme'

/**
 * Dark theme switch for lines with a dark design (ADR-013) — render it only there; other lines
 * have no dark values in `tokens.css`. A toggle button: the label stays, `aria-pressed` tells
 * whether the dark theme is on (`useTheme`: renders "off" on the server, corrected after
 * hydration).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme()
  return (
    <button
      type="button"
      onClick={(event) =>
        revealTheme(theme === 'dark' ? 'light' : 'dark', setTheme, centreOf(event.currentTarget))
      }
      aria-pressed={theme === 'dark'}
      className={className}
    >
      {/* Sun in the dark theme, moon in the light one (audyt 01.11 P2). Both are in the HTML and
          CSS picks one from `html[data-theme]` (set before the first paint) or, with no choice, the
          system — as in `tokens.css` — so the icon never
          flashes the wrong one until hydration; the label and `aria-pressed` carry the state. */}
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g className="[:root[data-theme=dark]_&]:hidden [@media(prefers-color-scheme:dark)]:[:root:not([data-theme=light])_&]:hidden">
          <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" />
        </g>
        <g className="hidden [:root[data-theme=dark]_&]:inline [@media(prefers-color-scheme:dark)]:[:root:not([data-theme=light])_&]:inline">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
        </g>
      </svg>
      <span className="sr-only">Tryb ciemny</span>
    </button>
  )
}

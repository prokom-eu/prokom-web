'use client'

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
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-pressed={theme === 'dark'}
      className={className}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path
          d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">Tryb ciemny</span>
    </button>
  )
}

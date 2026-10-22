import type { Line } from '@/lib/tenant/lines'

/** Lines with a designed dark theme (ADR-013); `tokens.css` defines dark values only for them. */
export const DARK_THEME_LINES: readonly Line[] = ['biznes', 'software']

export function hasDarkTheme(line: Line): boolean {
  return DARK_THEME_LINES.includes(line)
}

export type Theme = 'light' | 'dark'

/**
 * `localStorage` key of the visitor's choice (name from docs/strony/prokombiznes.md §3.5).
 * No cookie: nothing is sent to the server.
 */
export const THEME_STORAGE_KEY = 'pk-theme'

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

/**
 * Inline script for `<head>`: applies a stored choice before the first paint (Next.js guide
 * "preventing flash before hydration"). Without a choice the system preference applies via CSS.
 * Only the two known values are written, so a tampered storage value cannot inject anything.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`

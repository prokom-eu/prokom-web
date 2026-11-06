import type { Line } from '@/lib/tenant/lines'

/** Lines with a designed dark theme (ADR-013); `tokens.css` defines dark values only for them. */
export const DARK_THEME_LINES: readonly Line[] = ['biznes', 'instalacje', 'software']

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

/**
 * Theme a line starts with whatever the system says, until the visitor picks one: Biznes light
 * (D-K4-5, ADR-017 K4), Software dark (ADR-015 „Rozstrzygnięcia v24” pkt 1). The other lines
 * follow `prefers-color-scheme`.
 */
const DEFAULT_THEME: Partial<Record<Line, Theme>> = { biznes: 'light', software: 'dark' }

/** Theme of the line without a choice, or `null` when the system decides; `line`: `data-line`. */
export function defaultTheme(line: string | null | undefined): Theme | null {
  return Object.hasOwn(DEFAULT_THEME, line ?? '') ? (DEFAULT_THEME[line as Line] ?? null) : null
}

/** The line follows the system theme until the visitor chooses (not Biznes nor Software). */
export function followsSystemTheme(line: Line): boolean {
  return hasDarkTheme(line) && defaultTheme(line) === null
}

/** The `<head>` script of a line: `THEME_SCRIPT`, or one that falls back to the line's default. */
export function themeScript(line: Line): string {
  const fallback = defaultTheme(line)
  if (!fallback) return THEME_SCRIPT
  return `(function(){var t="${fallback}";try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");if(s==="light"||s==="dark")t=s}catch(e){}document.documentElement.setAttribute("data-theme",t)})()`
}

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
 * Lines that start light whatever the system says (D-K4-5, ADR-017: Biznes K4 — the dark theme
 * only after the visitor picks it). The others follow `prefers-color-scheme` until a choice.
 */
const LIGHT_BY_DEFAULT: readonly Line[] = ['biznes']

/** The line starts light without a choice (D-K4-5); `line`: the `data-line` of `<html>`. */
export function startsLight(line: string | null | undefined): boolean {
  return (LIGHT_BY_DEFAULT as readonly string[]).includes(line ?? '')
}

/** The line follows the system theme until the visitor chooses (not Biznes, D-K4-5). */
export function followsSystemTheme(line: Line): boolean {
  return hasDarkTheme(line) && !LIGHT_BY_DEFAULT.includes(line)
}

/** The `<head>` script of a line: `THEME_SCRIPT`, or one that falls back to light (Biznes). */
export function themeScript(line: Line): string {
  if (!LIGHT_BY_DEFAULT.includes(line)) return THEME_SCRIPT
  return `(function(){var t="light";try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");if(s==="light"||s==="dark")t=s}catch(e){}document.documentElement.setAttribute("data-theme",t)})()`
}

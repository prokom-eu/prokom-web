import { DAYLIGHT_TABLE } from '@/lib/shared/daylight.generated'
import { isNight } from '@/lib/shared/night'
import type { Line } from '@/lib/tenant/lines'

/** Lines with a designed dark theme (ADR-013); `tokens.css` defines dark values only for them. */
export const DARK_THEME_LINES: readonly Line[] = ['biznes', 'instalacje', 'software', 'prokom']

export function hasDarkTheme(line: Line): boolean {
  return DARK_THEME_LINES.includes(line)
}

export type Theme = 'light' | 'dark'
/** The visitor's choice; `auto` = nothing stored (ADR-028 pkt 3). */
export type ThemeChoice = Theme | 'auto'

/**
 * `localStorage` key of the visitor's choice (name from docs/strony/prokombiznes.md §3.5), the same
 * on every line and in Tech. No cookie: nothing is sent to the server.
 */
export const THEME_STORAGE_KEY = 'pk-theme'

/** Address parameter carrying the choice between our domains (ADR-028 pkt 5, spec §3). */
export const THEME_PARAM = 'motyw'

const PARAM_VALUES: Record<ThemeChoice, string> = { light: 'jasny', dark: 'ciemny', auto: 'auto' }

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

export function themeParamValue(choice: ThemeChoice): string {
  return PARAM_VALUES[choice]
}

/** `?motyw=` value → choice; anything else (also `constructor` etc.) → `null`. */
export function parseThemeParam(value: string | null | undefined): ThemeChoice | null {
  if (value === 'jasny') return 'light'
  if (value === 'ciemny') return 'dark'
  if (value === 'auto') return 'auto'
  return null
}

/**
 * Lines dark without a choice, whatever the time: Software (ADR-015 „Rozstrzygnięcia v24” pkt 1)
 * and the pro-kom.eu hub (ADR-H001 pkt 4). Biznes was always light (D-K4-5) — changed by ADR-028.
 */
const DARK_BY_DEFAULT: readonly Line[] = ['software', 'prokom']

/** `dark` for a line dark by default, else `null` (Auto decides); `line`: `data-line`. */
export function defaultTheme(line: string | null | undefined): Theme | null {
  return DARK_BY_DEFAULT.includes(line as Line) ? 'dark' : null
}

/**
 * Without JavaScript the tokens follow `prefers-color-scheme` only on Instalacje (its tokens have
 * the media block); Biznes stays light. With JavaScript the script always sets `data-theme`.
 */
export function followsSystemTheme(line: Line): boolean {
  return line === 'instalacje'
}

/**
 * Auto (spec §2.1 pkt 3): a line dark by default → dark; a dark system → dark; night in Rabka
 * (sunset to sunrise, `lib/shared/night`) → dark; else light.
 */
export function autoTheme(line: string | null | undefined, systemDark: boolean, now: Date): Theme {
  return defaultTheme(line) === 'dark' || systemDark || isNight(now) ? 'dark' : 'light'
}

/** The whole rule of spec §2.1 — the TypeScript twin of `themeScript`, for tests and hooks. */
export function resolveTheme(input: {
  line: string | null | undefined
  param: string | null
  stored: string | null
  systemDark: boolean
  now: Date
}): Theme {
  const fromParam = parseThemeParam(input.param)
  const choice = fromParam ?? (isTheme(input.stored) ? input.stored : 'auto')
  return choice === 'auto' ? autoTheme(input.line, input.systemDark, input.now) : choice
}

/**
 * Inline script for `<head>`, run before the first paint (Next.js guide "preventing flash before
 * hydration"): takes `?motyw=` from another line and stores it, then the stored choice, else Auto —
 * and always sets `data-theme`, so the switch label and icon know what is on screen. Only known
 * values are written, so a tampered parameter or storage value cannot inject anything. The night
 * check repeats `isNight` (`lib/shared/night.ts`) on the 24-number table; `theme.test.ts` runs both.
 */
export function themeScript(line: Line): string {
  const auto =
    defaultTheme(line) === 'dark'
      ? 't="dark";'
      : `{var T=${JSON.stringify(DAYLIGHT_TABLE)},n=new Date(Date.now()+36e5),f=n.getUTCMonth()+(n.getUTCDate()-15)/30.5,i=Math.floor(f),w=f-i,a=(i+12)%12*2,b=(i+13)%12*2,m=n.getUTCHours()*60+n.getUTCMinutes(),x=0;try{x=matchMedia("(prefers-color-scheme: dark)").matches}catch(e){}t=x||m<T[a]+(T[b]-T[a])*w||m>=T[a+1]+(T[b+1]-T[a+1])*w?"dark":"light"}`
  return `(function(){var k="${THEME_STORAGE_KEY}",p,c,s,t;try{p=new URLSearchParams(location.search).get("${THEME_PARAM}")}catch(e){}c=p==="jasny"?"light":p==="ciemny"?"dark":p==="auto"?"":null;try{if(c)localStorage.setItem(k,c);else if(c==="")localStorage.removeItem(k);s=c===null?localStorage.getItem(k):c}catch(e){s=c}if(s==="light"||s==="dark")t=s;else ${auto}document.documentElement.setAttribute("data-theme",t)})()`
}

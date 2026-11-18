'use client'

import { useLayoutEffect, useSyncExternalStore } from 'react'

import {
  autoTheme,
  isTheme,
  THEME_STORAGE_KEY,
  type Theme,
  type ThemeChoice,
} from '@/lib/brand/theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'
/** Fired on `window` after every theme change on this page (switches, `ThemeCarry`). */
export const THEME_CHANGE_EVENT = 'pk-theme-change'
const CHANGE_EVENT = THEME_CHANGE_EVENT

/**
 * The choice made on this page while `localStorage` is blocked (private mode, strict settings):
 * without it Auto would undo a hand-picked theme on the next return to the tab and the carried
 * `?motyw` would say `auto`.
 */
let unstoredChoice: ThemeChoice | null = null

export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(value) ? value : null
  } catch {
    return unstoredChoice === 'light' || unstoredChoice === 'dark' ? unstoredChoice : null
  }
}

/** Stores the choice (`auto` = no key); when storage is blocked, keeps it for this page. */
function storeChoice(next: ThemeChoice) {
  try {
    if (next === 'auto') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, next)
    unstoredChoice = null
  } catch {
    unstoredChoice = next
  }
}

/** Auto right now (ADR-028: line default, system, night in Rabka) for this page's line. */
export function autoThemeNow(): Theme {
  return autoTheme(
    document.documentElement.getAttribute('data-line'),
    window.matchMedia(DARK_QUERY).matches,
    new Date(),
  )
}

/** The theme on screen: the attribute set by the inline script or this switch, else the system. */
function currentTheme(): Theme {
  const chosen = document.documentElement.getAttribute('data-theme')
  if (isTheme(chosen)) return chosen
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY)
  // Another tab changed the choice (docs/strony/prokombiznes.md §3.5): apply it here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return
    document.documentElement.setAttribute('data-theme', storedTheme() ?? autoThemeNow())
    onChange()
  }
  media.addEventListener('change', onChange)
  window.addEventListener('storage', onStorage)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    media.removeEventListener('change', onChange)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

/**
 * The theme on screen and a setter that stores the choice (`pk-theme`) and tells the other
 * switches on the page and the other tabs. For lines with a dark design only (ADR-013). The
 * server does not know the theme, so it renders "light" and `useSyncExternalStore` corrects it
 * after hydration without a mismatch.
 */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => 'light' as const)

  // Re-apply the stored choice after React's development remount (Next.js guide "preventing
  // flash before hydration"); a no-op in production, where the inline script already set it.
  useLayoutEffect(() => {
    const stored = storedTheme()
    if (stored) document.documentElement.setAttribute('data-theme', stored)
  }, [])

  function setTheme(next: Theme) {
    document.documentElement.setAttribute('data-theme', next)
    storeChoice(next)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return [theme, setTheme]
}

export type { ThemeChoice }

const choiceSnapshot = (): ThemeChoice => storedTheme() ?? 'auto'

/**
 * The visitor's choice with „Auto” (shared menu sheet, spec §5 `MenuSheet`): `auto` = nothing
 * stored: dark on Software and the hub, else the system, else night in Rabka (ADR-028). Same key and event as
 * `useTheme`, so every switch on the page agrees.
 */
export function useThemeChoice(): [ThemeChoice, (choice: ThemeChoice) => void] {
  const choice = useSyncExternalStore(subscribe, choiceSnapshot, () => 'auto' as const)

  function setChoice(next: ThemeChoice) {
    const root = document.documentElement
    storeChoice(next)
    root.setAttribute('data-theme', next === 'auto' ? autoThemeNow() : next)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return [choice, setChoice]
}

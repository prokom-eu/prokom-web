'use client'

import { useLayoutEffect, useSyncExternalStore } from 'react'

import { defaultTheme, isTheme, THEME_STORAGE_KEY, type Theme } from '@/lib/brand/theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'
const CHANGE_EVENT = 'pk-theme-change'

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
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
    const theme = storedTheme()
    const root = document.documentElement
    // No choice left: the line's default (Biznes light, Software dark), else the system.
    const next = theme ?? defaultTheme(root.getAttribute('data-line'))
    if (next) root.setAttribute('data-theme', next)
    else root.removeAttribute('data-theme')
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
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage blocked: the switch still works until the next page load.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return [theme, setTheme]
}

export type ThemeChoice = Theme | 'auto'

const choiceSnapshot = (): ThemeChoice => storedTheme() ?? 'auto'

/**
 * The visitor's choice with „Auto” (shared menu sheet, spec §5 `MenuSheet`): `auto` = nothing
 * stored: the line's default (Biznes light, Software dark), else the system. Same key and event as
 * `useTheme`, so every switch on the page agrees.
 */
export function useThemeChoice(): [ThemeChoice, (choice: ThemeChoice) => void] {
  const choice = useSyncExternalStore(subscribe, choiceSnapshot, () => 'auto' as const)

  function setChoice(next: ThemeChoice) {
    const root = document.documentElement
    try {
      if (next === 'auto') localStorage.removeItem(THEME_STORAGE_KEY)
      else localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage blocked: the choice still applies until the next page load.
    }
    const theme = next === 'auto' ? defaultTheme(root.getAttribute('data-line')) : next
    if (theme) root.setAttribute('data-theme', theme)
    else root.removeAttribute('data-theme')
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return [choice, setChoice]
}

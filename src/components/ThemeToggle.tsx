'use client'

import { useLayoutEffect, useSyncExternalStore } from 'react'

import { isTheme, THEME_STORAGE_KEY, type Theme } from '@/lib/brand/theme'

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
    if (theme) document.documentElement.setAttribute('data-theme', theme)
    else document.documentElement.removeAttribute('data-theme')
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
 * Dark theme switch for lines with a dark design (ADR-013) — render it only there; other lines
 * have no dark values in `tokens.css`. A toggle button: the label stays, `aria-pressed` tells
 * whether the dark theme is on. The server does not know the theme, so it renders "off" and
 * `useSyncExternalStore` corrects it after hydration without a mismatch.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => 'light' as const)

  // Re-apply the stored choice after React's development remount (Next.js guide "preventing
  // flash before hydration"); a no-op in production, where the inline script already set it.
  useLayoutEffect(() => {
    const stored = storedTheme()
    if (stored) document.documentElement.setAttribute('data-theme', stored)
  }, [])

  function toggle() {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage blocked: the switch still works until the next page load.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={theme === 'dark'} className={className}>
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

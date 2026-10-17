'use client'

import { useLayoutEffect } from 'react'

import { THEME_STORAGE_KEY, type Theme } from '@/lib/brand/theme'

function currentTheme(): Theme {
  const chosen = document.documentElement.getAttribute('data-theme')
  if (chosen === 'light' || chosen === 'dark') return chosen
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function storedTheme(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Light/dark switch for lines with a dark theme (ADR-013). Render it only there — on other
 * lines `tokens.css` has no dark values. The label is static, so server and client agree.
 */
export function ThemeToggle({ className }: { className?: string }) {
  // Re-apply the stored choice after React's development remount (Next.js flash guide);
  // a no-op in production, where the inline script already set it.
  useLayoutEffect(() => {
    const theme = storedTheme()
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [])

  function toggle() {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage blocked: the switch still works until the next page load.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Przełącz motyw jasny / ciemny"
      className={className}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path
          d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

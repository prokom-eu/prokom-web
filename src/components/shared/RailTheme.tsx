'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'

import { themeAnnouncement, ThemeIcons } from '@/components/ThemeToggle'
import { useTheme, useThemeChoice, autoThemeNow, type ThemeChoice } from '@/components/useTheme'
import { centreOf, revealTheme } from '@/lib/motion/themeReveal'

const CHOICES: { value: ThemeChoice; label: string; icon: ReactNode }[] = [
  {
    value: 'light',
    label: 'Jasny',
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </>
    ),
  },
  { value: 'dark', label: 'Ciemny', icon: <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" /> },
  {
    value: 'auto',
    label: 'Auto',
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 3.5v17a8.5 8.5 0 0 0 0-17Z" fill="currentColor" stroke="none" />
      </>
    ),
  },
]

/**
 * Theme entry of the side rail (ADR-028, MOTYW-PASEK-LINII §6), above „Do góry”. Folded: the moon
 * or sun only. Open: the action label („Ciemny motyw” / „Jasny motyw”, a click opens the circle)
 * and under it Jasny · Ciemny · Auto — the same state as the menu sheet (`useThemeChoice`). Labels
 * and icons come from `html[data-theme]` in CSS (`.theme-toggle`), as in the capsule button.
 */
export function RailTheme() {
  const [theme, setTheme] = useTheme()
  const [choice, setChoice] = useThemeChoice()
  const [announcement, setAnnouncement] = useState('')
  /** Opens the circle only when the theme on screen really changes. */
  const switchTo = (next: 'light' | 'dark', apply: () => void, origin: Element) => {
    if (next === theme) apply()
    else revealTheme(next, apply, centreOf(origin))
    setAnnouncement(themeAnnouncement(next))
  }
  return (
    <div className="srail__theme">
      <button
        type="button"
        className="srail__item theme-toggle"
        data-rail-theme=""
        onClick={(event) => {
          const next = theme === 'dark' ? 'light' : 'dark'
          switchTo(next, () => setTheme(next), event.currentTarget)
        }}
      >
        <span className="srail__icon">
          <ThemeIcons />
        </span>
        <span className="srail__label">
          <span className="theme-toggle__labels">
            <span className="theme-toggle__label" data-to="dark">
              Ciemny motyw
            </span>
            <span className="theme-toggle__label" data-to="light">
              Jasny motyw
            </span>
          </span>
        </span>
      </button>
      <div
        className="srail__choices"
        role="group"
        aria-label="Motyw strony"
        // The sliding thumb (`::before`) goes under the chosen option.
        style={{ '--choice': CHOICES.findIndex((o) => o.value === choice) } as CSSProperties}
      >
        {CHOICES.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={choice === option.value}
            onClick={(event) => {
              const next = option.value === 'auto' ? autoThemeNow() : option.value
              switchTo(next, () => setChoice(option.value), event.currentTarget)
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              aria-hidden="true"
              focusable="false"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {option.icon}
            </svg>
            {option.label}
          </button>
        ))}
      </div>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  )
}

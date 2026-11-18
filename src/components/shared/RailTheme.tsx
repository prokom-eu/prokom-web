'use client'

import { ThemeIcons } from '@/components/ThemeToggle'
import { useTheme, useThemeChoice, autoThemeNow, type ThemeChoice } from '@/components/useTheme'
import { centreOf, revealTheme } from '@/lib/motion/themeReveal'

const CHOICES: { value: ThemeChoice; label: string }[] = [
  { value: 'light', label: 'Jasny' },
  { value: 'dark', label: 'Ciemny' },
  { value: 'auto', label: 'Auto' },
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
  return (
    <div className="srail__theme">
      <button
        type="button"
        className="srail__item theme-toggle"
        data-rail-theme=""
        onClick={(event) =>
          revealTheme(theme === 'dark' ? 'light' : 'dark', setTheme, centreOf(event.currentTarget))
        }
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
      <div className="srail__choices" role="group" aria-label="Motyw strony">
        {CHOICES.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={choice === option.value}
            onClick={(event) => {
              const next = option.value === 'auto' ? autoThemeNow() : option.value
              revealTheme(next, () => setChoice(option.value), centreOf(event.currentTarget))
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useTheme } from '@/components/useTheme'
import { centreOf, revealTheme } from '@/lib/motion/themeReveal'

import { InstIcon } from '../InstIcon'

/** Label of the switch: what a press does (prototype `themeLabel`). */
export const themeLabel = (theme: 'light' | 'dark') =>
  theme === 'dark' ? 'Włącz jasny motyw' : 'Włącz ciemny motyw'

/**
 * Header theme switch (prototype `toggleTheme`): sun in the dark theme, moon in the light one.
 * The new theme opens in a circle from the button (`revealTheme`, motion.css §5; I-M).
 */
export function ThemeButton() {
  const [theme, setTheme] = useTheme()
  const label = themeLabel(theme)
  return (
    <button
      type="button"
      className="iconb"
      aria-label={label}
      title={label}
      onClick={(event) =>
        revealTheme(theme === 'dark' ? 'light' : 'dark', setTheme, centreOf(event.currentTarget))
      }
    >
      <InstIcon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
    </button>
  )
}

/** „Motyw” tile of the „Więcej” sheet tab. */
export function ThemeTile() {
  const [theme, setTheme] = useTheme()
  return (
    <button
      type="button"
      className="mshc"
      onClick={(event) =>
        revealTheme(theme === 'dark' ? 'light' : 'dark', setTheme, centreOf(event.currentTarget))
      }
    >
      <InstIcon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
      <span>
        <small>Motyw</small>
        <b>{themeLabel(theme)}</b>
      </span>
    </button>
  )
}
